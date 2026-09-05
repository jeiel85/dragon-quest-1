// 드래곤 퀘스트 1 오토파일럿 E2E 테스트 v2
// 게임을 시작하고 AI 자동 진행을 켠 뒤, 마지막 스테이지까지 진행되는지 검증
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:8080';
const TEST_DURATION_MS = 15 * 60 * 1000; // 최대 15분
const SNAPSHOT_INTERVAL_MS = 10000;

const results = {
  started: false,
  autopilotEnabled: false,
  objectivesSeen: new Set(),
  mapsSeen: new Set(),
  battles: 0,
  deaths: 0,
  errors: [],
  finalState: null,
  stuckCount: 0,
  lastPosition: null,
  lastPositionTicks: 0,
  lastObjective: null,
  objectiveStuckTicks: 0,
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.errors.push(`[console] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    results.errors.push(`[pageerror] ${err.message}`);
  });

  console.log('=== 게임 페이지 로드 ===');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('=== 게임 시작 (타이틀 클릭) ===');
  await page.click('#game-canvas');
  await page.waitForTimeout(1000);

  // 인트로 대화 넘기기
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('KeyZ');
    await page.waitForTimeout(300);
  }

  console.log('=== AI 자동 진행 활성화 ===');
  await page.click('#btn-auto-play');
  await page.waitForTimeout(500);

  const autoBtnText = await page.textContent('#btn-auto-play');
  results.autopilotEnabled = autoBtnText.includes('ON');
  console.log(`AI 버튼 상태: ${autoBtnText}`);

  // 게임 속도 5배로
  await page.click('#btn-speed');
  await page.click('#btn-speed');
  await page.waitForTimeout(300);

  console.log('=== 오토 플레이 모니터링 시작 ===');
  const startTime = Date.now();
  let lastSnapshot = 0;

  while (Date.now() - startTime < TEST_DURATION_MS) {
    const now = Date.now();
    if (now - lastSnapshot >= SNAPSHOT_INTERVAL_MS) {
      lastSnapshot = now;
      await snapshot(page);
    }

    const state = await page.evaluate(() => {
      const g = window.game;
      if (!g) return null;
      return {
        scene: g.scene,
        map: g.currentMap?.id,
        mapName: g.currentMap?.name,
        objective: g.autoPilot?.currentObjective,
        aiEnabled: g.autoPilot?.enabled,
        aiStatus: g.autoPilot?.statusText,
        level: g.hero?.stats?.level,
        hp: g.hero?.stats?.hp,
        maxHp: g.hero?.stats?.maxHp,
        mp: g.hero?.stats?.mp,
        maxMp: g.hero?.stats?.maxMp,
        gold: g.hero?.stats?.gold,
        keys: g.hero?.stats?.keys,
        herbs: g.hero?.stats?.herbs,
        x: g.hero?.x,
        y: g.hero?.y,
        flags: g.hero?.questFlags,
        inventory: g.hero?.inventory?.map(i => i.id),
        equipment: {
          weapon: g.hero?.equipment?.weapon?.id,
          armor: g.hero?.equipment?.armor?.id,
          shield: g.hero?.equipment?.shield?.id,
        },
        battleState: g.battleSystem?.state,
        monster: g.battleSystem?.monster?.name,
        monsterHp: g.battleSystem?.monster?.hp,
      };
    });

    if (!state) {
      results.errors.push('Game object not found on window');
      break;
    }

    // 스턱 감지 (같은 위치에 오래 머무르면)
    const posKey = `${state.map}:${state.x},${state.y}`;
    if (posKey === results.lastPosition) {
      results.lastPositionTicks++;
      if (results.lastPositionTicks > 30) {
        results.stuckCount++;
        results.lastPositionTicks = 0;
        console.log(`[경고] 스턱 감지: ${state.mapName} (${state.x},${state.y}) - 목표: ${state.objective} - 상태: ${state.aiStatus}`);
      }
    } else {
      results.lastPosition = posKey;
      results.lastPositionTicks = 0;
    }

    // 목표 스턱 감지 (같은 목표에 오래 머무르면)
    if (state.objective === results.lastObjective) {
      results.objectiveStuckTicks++;
      if (results.objectiveStuckTicks > 60) {
        console.log(`[경고] 목표 스턱: ${state.objective} (${Math.round((Date.now() - startTime) / 1000)}s 경과)`);
        results.objectiveStuckTicks = 0;
      }
    } else {
      results.lastObjective = state.objective;
      results.objectiveStuckTicks = 0;
    }

    // 엔딩 도달 확인
    if (state.scene === 'ENDING') {
      console.log('🎉 엔딩 도달! 오토 플레이 성공!');
      results.finalState = state;
      break;
    }

    await page.waitForTimeout(1000);
  }

  // 최종 스냅샷
  await snapshot(page);
  results.finalState = await page.evaluate(() => {
    const g = window.game;
    return {
      scene: g.scene,
      map: g.currentMap?.id,
      mapName: g.currentMap?.name,
      objective: g.autoPilot?.currentObjective,
      aiStatus: g.autoPilot?.statusText,
      level: g.hero?.stats?.level,
      hp: g.hero?.stats?.hp,
      maxHp: g.hero?.stats?.maxHp,
      gold: g.hero?.stats?.gold,
      keys: g.hero?.stats?.keys,
      flags: g.hero?.questFlags,
      inventory: g.hero?.inventory?.map(i => i.id),
      equipment: {
        weapon: g.hero?.equipment?.weapon?.id,
        armor: g.hero?.equipment?.armor?.id,
        shield: g.hero?.equipment?.shield?.id,
      },
    };
  });

  // 결과 출력
  console.log('\n=== 테스트 결과 ===');
  console.log(`AI 활성화: ${results.autopilotEnabled}`);
  console.log(`관찰된 목표: ${[...results.objectivesSeen].join(', ')}`);
  console.log(`관찰된 맵: ${[...results.mapsSeen].join(', ')}`);
  console.log(`전투 횟수: ${results.battles}`);
  console.log(`스턱 횟수: ${results.stuckCount}`);
  console.log(`에러 수: ${results.errors.length}`);
  if (results.errors.length > 0) {
    console.log('에러 목록:');
    results.errors.forEach(e => console.log(`  - ${e}`));
  }
  console.log('\n최종 상태:');
  console.log(JSON.stringify(results.finalState, null, 2));

  await browser.close();
  return results;
}

async function snapshot(page) {
  const state = await page.evaluate(() => {
    const g = window.game;
    if (!g) return null;
    return {
      scene: g.scene,
      map: g.currentMap?.id,
      mapName: g.currentMap?.name,
      objective: g.autoPilot?.currentObjective,
      aiStatus: g.autoPilot?.statusText,
      level: g.hero?.stats?.level,
      hp: g.hero?.stats?.hp,
      maxHp: g.hero?.stats?.maxHp,
      mp: g.hero?.stats?.mp,
      maxMp: g.hero?.stats?.maxMp,
      gold: g.hero?.stats?.gold,
      keys: g.hero?.stats?.keys,
      x: g.hero?.x,
      y: g.hero?.y,
      flags: g.hero?.questFlags,
      inventory: g.hero?.inventory?.map(i => i.id),
      equipment: {
        weapon: g.hero?.equipment?.weapon?.id,
        armor: g.hero?.equipment?.armor?.id,
        shield: g.hero?.equipment?.shield?.id,
      },
      battleState: g.battleSystem?.state,
      monster: g.battleSystem?.monster?.name,
      monsterHp: g.battleSystem?.monster?.hp,
    };
  });

  if (!state) return;

  if (state.objective) results.objectivesSeen.add(state.objective);
  if (state.map) results.mapsSeen.add(state.map);
  if (state.scene === 'BATTLE') results.battles++;

  const elapsed = Math.round((Date.now() - globalStartTime) / 1000);
  const flagsSummary = [
    state.flags?.hasSunStone ? '태양의돌' : '',
    state.flags?.hasFairyFlute ? '피리' : '',
    state.flags?.hasSilverHarp ? '은피리' : '',
    state.flags?.hasStaffOfRain ? '비지팡이' : '',
    state.flags?.rescuedPrincess ? '공주구출' : '',
    state.flags?.golemDefeated ? '골렘격파' : '',
    state.flags?.hasErdrickArmor ? '로토갑옷' : '',
    state.flags?.hasErdrickToken ? '증표' : '',
    state.flags?.hasRainbowDrop ? '무지개물방울' : '',
    state.flags?.hasErdrickSword ? '로토검' : '',
    state.flags?.dragonlordDefeated ? '용왕격파' : '',
  ].filter(Boolean).join(',');
  console.log(`[${elapsed}s] 맵:${state.mapName} | 목표:${state.objective} | Lv:${state.level} HP:${state.hp}/${state.maxHp} MP:${state.mp}/${state.maxMp} | 골드:${state.gold} 열쇠:${state.keys} | 위치:(${state.x},${state.y}) | ${state.aiStatus}`);
  if (flagsSummary) console.log(`  📜 진행: ${flagsSummary}`);
  if (state.scene === 'BATTLE') {
    console.log(`  ⚔️ 전투: ${state.monster} (HP ${state.monsterHp}) - 상태: ${state.battleState}`);
  }
}

let globalStartTime = Date.now();
main().catch(err => {
  console.error('테스트 실패:', err);
  process.exit(1);
});