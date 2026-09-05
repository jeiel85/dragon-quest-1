// 스테이지 검증 스크립트: 중반 상태(Lv17 + 장비)로 설정 후 GET_FAIRY_FLUTE부터 엔딩까지 각 단계 검증
// 실행: node verify-stages.mjs (프로젝트 루트에서)
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.click('#game-canvas');
  await page.waitForTimeout(500);
  for (let i = 0; i < 6; i++) { await page.keyboard.press('KeyZ'); await page.waitForTimeout(200); }
  await page.click('#btn-auto-play');
  await page.click('#btn-speed'); await page.click('#btn-speed');

  // 중반 상태 설정: Lv19 + 상점 최종 장비 (파밍/쇼핑 로직은 별도 검증)
  await page.evaluate(() => {
    const hero = window.game.hero;
    hero.addExp(25000); // Lv 19 (모든 레벨 게이트 통과, 용왕전 대비)
    hero.equip({ id: 'flame_sword', name: '화염의 검', type: 'weapon', power: 28, price: 9800, description: '' });
    hero.equip({ id: 'magic_armor', name: '마법 갑옷', type: 'armor', power: 24, price: 7700, description: '' });
    hero.equip({ id: 'silver_shield', name: '미키의 은방패', type: 'shield', power: 20, price: 14800, description: '' });
    hero.stats.gold = 5000;
    hero.stats.keys = 4;
    hero.stats.herbs = 4;
    hero.recalcStats();
  });
  console.log('Setup: level 19 + flame_sword/magic_armor/silver_shield');

  const stages = [
    { name: 'GET_FAIRY_FLUTE', check: (f) => f.hasFairyFlute },
    { name: 'GET_SILVER_HARP', check: (f) => f.hasSilverHarp },
    { name: 'GET_STAFF_OF_RAIN', check: (f) => f.hasStaffOfRain },
    { name: 'RESCUE_PRINCESS', check: (f) => f.rescuedPrincess },
    { name: 'DEFEAT_GOLEM', check: (f) => f.golemDefeated },
    { name: 'GET_ERDRICK_ARMOR', check: (f) => f.hasErdrickArmor },
    { name: 'GET_ERDRICK_TOKEN', check: (f) => f.hasErdrickToken },
    { name: 'GET_RAINBOW_DROP', check: (f) => f.hasRainbowDrop },
    { name: 'GET_ERDRICK_SWORD', check: (f) => f.hasErdrickSword },
    { name: 'DEFEAT_DRAGONLORD', check: (f) => f.dragonlordDefeated },
    { name: 'ENDING', check: (f, s) => s === 'ENDING' },
  ];

  let stageIdx = 0;
  const seen = new Set();
  let lastLv = 19;
  let deaths = 0;
  let lastGold = -1;
  let lastScene = '';
  let battleCount = 0;

  for (let i = 0; i < 360; i++) { // 최대 30분
    await page.waitForTimeout(5000);
    const s = await page.evaluate(() => {
      const g = window.game;
      return { map: g.currentMap?.id, obj: g.autoPilot?.currentObjective, x: g.hero?.x, y: g.hero?.y, scene: g.scene, lv: g.hero?.stats?.level, hp: g.hero?.stats?.hp, maxHp: g.hero?.stats?.maxHp, gold: g.hero?.stats?.gold, flags: g.hero?.questFlags };
    });
    if (s.scene === 'BATTLE' && lastScene !== 'BATTLE') battleCount++;
    lastScene = s.scene;
    if (lastGold > 0 && s.gold < lastGold / 2) deaths++;
    lastGold = s.gold;
    if (s.lv !== lastLv) { lastLv = s.lv; console.log('LEVEL UP ->', s.lv); }

    const key = s.map + ':' + s.obj;
    if (!seen.has(key)) { seen.add(key); console.log('NEW:', JSON.stringify(s)); }

    // 현재 단계 완료 확인
    if (stageIdx < stages.length) {
      const st = stages[stageIdx];
      if (st.check(s.flags, s.scene)) {
        console.log('STAGE COMPLETE:', st.name, '| map:', s.map, '| obj:', s.obj, '| lv:', s.lv);
        stageIdx++;
      }
    }
    if (stageIdx >= stages.length) break;
  }

  console.log('---');
  console.log('Final stage:', stageIdx, '/', stages.length);
  console.log('Battles:', battleCount, 'Deaths:', deaths);
  console.log('Seen:', [...seen].join(' | '));
  await browser.close();
})();