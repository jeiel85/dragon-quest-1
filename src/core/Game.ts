// 드래곤 퀘스트 1 메인 게임 엔진

import { ChiptuneAudio } from '../audio/ChiptuneAudio';
import { BattleSystem } from '../battle/BattleSystem';
import { ITEMS } from '../data/Items';
import { ENCOUNTER_TABLES } from '../data/Monsters';
import { GameMap, WORLD_MAPS } from '../data/WorldData';
import { Hero } from '../entities/Hero';
import { Sprites } from '../graphics/Sprites';
import { WindowRenderer } from '../ui/WindowRenderer';
import { AutoPilot } from '../ai/AutoPilot';
import { Direction, GameScene, MapType, TileType } from './Types';
import { Input } from './Input';

export class Game {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public audio: ChiptuneAudio;
  public sprites: Sprites;
  public input: Input;
  public hero: Hero;
  public autoPilot: AutoPilot;

  public scene: GameScene = 'TITLE';
  public currentMap: GameMap;
  public battleSystem: BattleSystem | null = null;

  // 대화 시스템
  public dialogueQueue: string[] = [];
  public currentDialogueText: string = '';
  public currentNpcAction?: string;

  // 배속 및 루프 타이머
  public gameSpeed: number = 1; // 1x, 2x, 5x
  private stepCount: number = 0;
  private animFrame: number = 0;
  private animTimer: number = 0;

  // 방향키 홀드 연속 이동 (Continuous Movement) 타이머
  private moveHoldTimer: number = 0;
  private lastMoveDir: Direction | null = null;
  private readonly MOVE_INITIAL_DELAY: number = 0.18; // 첫 발자국 후 연속 걷기 전 딜레이 (180ms)
  private readonly MOVE_REPEAT_INTERVAL: number = 0.11; // 연속 걷기 주기 (110ms)

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.audio = new ChiptuneAudio();
    this.sprites = new Sprites();
    this.input = new Input();
    this.hero = new Hero();
    this.autoPilot = new AutoPilot(this);

    // 최초 시작 맵: 탄타겔 성 왕좌
    this.currentMap = WORLD_MAPS['TANTEGEL_THRONE']();
  }

  // 게임 시작
  public start() {
    this.audio.init();
    this.scene = 'TITLE';
    this.audio.playBgm('TITLE');

    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  public startGamePlay() {
    this.scene = 'INTRO_DIALOG';
    this.dialogueQueue = [
      '로파 대왕: "오오, 전설의 용사 로토의 후예여!"',
      '"사악한 용왕이 빛의 구슬을 훔치고 세계를 어둠에 빠뜨렸다."',
      '"사랑하는 내 딸 로라 공주마저 마물에게 붙잡혔도다..."',
      '"용사여, 이 성의 보물상자를 챙겨 세계를 구원해주게!"'
    ];
    this.advanceDialogue();
    this.audio.playBgm('CASTLE');
  }

  // --- 메인 업데이트 루프 ---
  private update(dt: number) {
    this.animTimer += dt;
    if (this.animTimer >= 0.3) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }

    // AI 자동 토글 키 체크 (A키)
    if (this.input.isAutoToggleJustPressed()) {
      this.toggleAutoPlay();
    }

    // 배속 처리 (gameSpeed만큼 반복 수행)
    for (let s = 0; s < this.gameSpeed; s++) {
      if (this.autoPilot.enabled) {
        this.autoPilot.update();
      }

      switch (this.scene) {
        case 'TITLE':
          if (this.input.isActionJustPressed()) {
            this.audio.playSelect();
            this.startGamePlay();
          }
          break;

        case 'INTRO_DIALOG':
        case 'DIALOG':
          if (this.input.isActionJustPressed() || this.input.isCancelJustPressed()) {
            this.audio.playSelect();
            this.advanceDialogue();
          }
          break;

        case 'FIELD':
          this.handleFieldInput(dt);
          break;

        case 'BATTLE':
          if (this.battleSystem) {
            this.battleSystem.update();
            this.handleBattleInput();
          }
          break;

        case 'ENDING':
          if (this.input.isActionJustPressed()) {
            this.audio.playSelect();
            this.scene = 'TITLE';
            this.audio.playBgm('TITLE');
          }
          break;
      }
    }

    this.input.update();
    this.updateLocationBadge();
  }

  // --- 필드 조작 처리 (방향키 꾹 누르면 연속 이동 지원) ---
  private handleFieldInput(dt: number) {
    if (this.autoPilot.enabled) {
      this.lastMoveDir = null;
      this.moveHoldTimer = 0;
      return;
    }

    // 현재 활성화된 방향 확인 (새로 눌린 키 우선)
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    let activeDir: Direction | null = null;

    for (const dir of directions) {
      if (this.input.isDirectionJustPressed(dir)) {
        activeDir = dir;
        break;
      }
    }

    if (!activeDir) {
      for (const dir of directions) {
        if (this.input.isDirectionPressed(dir)) {
          activeDir = dir;
          break;
        }
      }
    }

    if (activeDir) {
      if (activeDir !== this.lastMoveDir) {
        // 새 방향으로 누르기 시작: 즉시 1보 이동 및 딜레이 설정
        this.lastMoveDir = activeDir;
        this.moveHoldTimer = this.MOVE_INITIAL_DELAY;
        this.tryMoveHero(activeDir);
      } else {
        // 계속 꾹 누르고 있는 상태: 주기적으로 연속 이동
        this.moveHoldTimer -= dt;
        if (this.moveHoldTimer <= 0) {
          this.tryMoveHero(activeDir);
          this.moveHoldTimer = this.MOVE_REPEAT_INTERVAL;
        }
      }
    } else {
      // 키에서 손을 뗌
      this.lastMoveDir = null;
      this.moveHoldTimer = 0;
    }

    // 결정 / 말걸기 / 상호작용
    if (this.input.isActionJustPressed()) {
      this.interactWithFront();
    }

    // 취소 / 메뉴창 열기
    if (this.input.isCancelJustPressed()) {
      // 간이 메뉴 또는 인벤토리 확인
      this.audio.playSelect();
      this.showDialogue([
        `[상태] ${this.hero.name} Lv ${this.hero.stats.level}`,
        `공격력: ${this.hero.stats.attack} / 방어력: ${this.hero.stats.defense}`,
        `열쇠: ${this.hero.stats.keys}개 / 약초: ${this.hero.stats.herbs}개 / 골드: ${this.hero.stats.gold}G`
      ]);
    }
  }

  // 영웅 이동 시도
  public tryMoveHero(dir: Direction) {
    this.hero.dir = dir;
    let targetX = this.hero.x;
    let targetY = this.hero.y;

    if (dir === 'up') targetY--;
    if (dir === 'down') targetY++;
    if (dir === 'left') targetX--;
    if (dir === 'right') targetX++;

    // 맵 밖 체크
    if (targetX < 0 || targetX >= this.currentMap.width || targetY < 0 || targetY >= this.currentMap.height) {
      return;
    }

    // 타일 충돌 체크
    const tile = this.currentMap.tiles[targetY][targetX];

    // 이동 불가 타일
    if (tile === TileType.WATER ||
        tile === TileType.MOUNTAIN ||
        tile === TileType.BRICK_WALL ||
        tile === TileType.SHOP_COUNTER ||
        tile === TileType.VOID) {
      return;
    }

    // 닫힌 문인 경우 열쇠 체크
    if (tile === TileType.DOOR) {
      if (this.hero.stats.keys > 0) {
        this.hero.stats.keys--;
        this.audio.playDoor();
        this.currentMap.tiles[targetY][targetX] = TileType.STONE_FLOOR;
        this.showDialogue(['마법의 열쇠를 사용하여 문을 열었다!']);
        return;
      } else {
        this.audio.playCancel();
        this.showDialogue(['문이 굳게 잠겨 있다! 마법의 열쇠가 필요하다.']);
        return;
      }
    }

    // NPC 충돌 체크
    const npc = this.currentMap.npcs.find(n => n.x === targetX && n.y === targetY);
    if (npc) {
      this.interactWithNPC(npc);
      return;
    }

    // 이동 성공
    this.hero.x = targetX;
    this.hero.y = targetY;
    const isSwamp = tile === TileType.SWAMP;
    const isBarrier = tile === TileType.BARRIER;
    this.hero.onStep(isSwamp, isBarrier);
    this.stepCount++;

    // 워프/계단 체크
    const warp = this.currentMap.warps.find(w => w.x === targetX && w.y === targetY);
    if (warp) {
      this.changeMap(warp.targetMap, warp.targetX, warp.targetY, warp.targetDir);
      return;
    }

    // 보물상자 바로 밟았을 경우
    const chest = this.currentMap.chests.find(c => c.x === targetX && c.y === targetY && !c.opened);
    if (chest) {
      this.openChest(chest);
      return;
    }

    // 랜덤 인카운터 체크 (오버월드 및 던전에서 일정 확률 발생)
    if (this.currentMap.id === 'OVERWORLD' || this.currentMap.isDungeon) {
      this.checkRandomEncounter();
    }
  }

  // 앞 방향 상호작용 (대화 또는 조사)
  public interactWithFront() {
    let checkX = this.hero.x;
    let checkY = this.hero.y;

    if (this.hero.dir === 'up') checkY--;
    if (this.hero.dir === 'down') checkY++;
    if (this.hero.dir === 'left') checkX--;
    if (this.hero.dir === 'right') checkX++;

    // 1. NPC 대화
    const npc = this.currentMap.npcs.find(n => n.x === checkX && n.y === checkY);
    if (npc) {
      this.interactWithNPC(npc);
      return;
    }

    // 2. 보물상자 조사
    const chest = this.currentMap.chests.find(c => c.x === checkX && c.y === checkY && !c.opened);
    if (chest) {
      this.openChest(chest);
      return;
    }

    // 3. 발밑 보물상자 조사
    const chestUnderfoot = this.currentMap.chests.find(c => c.x === this.hero.x && c.y === this.hero.y && !c.opened);
    if (chestUnderfoot) {
      this.openChest(chestUnderfoot);
      return;
    }

    // 4. 일반 조사 메시지
    this.audio.playSelect();
    this.showDialogue([`${this.hero.name}은(는) 주변을 면밀히 조사했다.`, '하지만 특별한 것은 발견하지 못했다.']);
  }

  // NPC 상호작용
  private interactWithNPC(npc: any) {
    this.audio.playSelect();

    if (npc.action === 'inn') {
      // 여관 숙박
      const innCost = this.currentMap.id === 'BRECCONARY' ? 6 : 25;
      if (this.hero.stats.gold >= innCost) {
        this.hero.stats.gold -= innCost;
        this.hero.restAtInn();
        this.audio.playInn();
        this.showDialogue([
          `${npc.name}: "좋은 아침입니다! 체력과 마력이 모두 완치되었습니다."`,
          '하룻밤 푹 쉬고 활력을 되찾았습니다!'
        ]);
      } else {
        this.showDialogue([`${npc.name}: "골드가 부족하군요. 돈을 더 모아서 오세요!"`]);
      }
      return;
    }

    if (npc.action === 'shop') {
      // 무기 상점 거래
      this.handleShopTransaction();
      return;
    }

    if (npc.action === 'key') {
      // 열쇠 구매
      if (this.hero.stats.gold >= 26) {
        this.hero.stats.gold -= 26;
        this.hero.stats.keys++;
        this.audio.playChest();
        this.showDialogue([
          '열쇠 장인: "여기 마법의 열쇠요! 잘 쓰시오."',
          `[마법의 열쇠]를 구입했다! (현재 ${this.hero.stats.keys}개 보유)`
        ]);
      } else {
        this.showDialogue(['열쇠 장인: "열쇠 값(26골드)이 부족하군!"']);
      }
      return;
    }

    if (npc.action === 'dragonlord') {
      // 보스 결전 트리거!
      if (npc.id === 'dragon_boss') {
        this.startBossBattle('green_dragon');
      } else if (npc.id === 'dragonlord_boss') {
        this.startBossBattle('dragonlord_1');
      }
      return;
    }

    if (npc.action === 'golem') {
      this.startBossBattle('golem');
      return;
    }

    // 일반 대화
    this.showDialogue(npc.dialog);
  }

  // 상점 자동/수동 거래
  private handleShopTransaction() {
    const hero = this.gameSpeed > 1 ? this.hero : this.hero;
    // 골드 상황에 따른 최적 장비 구매
    if (this.hero.stats.gold >= 1500 && this.hero.equipment.weapon?.id !== 'steel_sword' && this.hero.equipment.weapon?.id !== 'flame_sword' && this.hero.equipment.weapon?.id !== 'erdrick_sword') {
      this.hero.stats.gold -= 1500;
      this.hero.equip(ITEMS.steel_sword);
      this.audio.playChest();
      this.showDialogue(['[강철검]을 1500G에 구입하여 장비했다!', '공격력이 대폭 상승했다!']);
    } else if (this.hero.stats.gold >= 1000 && (!this.hero.equipment.armor || this.hero.equipment.armor.power! < 16)) {
      this.hero.stats.gold -= 1000;
      this.hero.equip(ITEMS.iron_armor);
      this.audio.playChest();
      this.showDialogue(['[철갑옷]을 1000G에 구입하여 장비했다!', '방어력이 대폭 상승했다!']);
    } else if (this.hero.stats.gold >= 180 && !this.hero.equipment.weapon) {
      this.hero.stats.gold -= 180;
      this.hero.equip(ITEMS.copper_sword);
      this.audio.playChest();
      this.showDialogue(['[구리검]을 180G에 구입하여 장비했다!']);
    } else if (this.hero.stats.gold >= 24 && this.hero.stats.herbs < 4) {
      this.hero.stats.gold -= 24;
      this.hero.stats.herbs++;
      this.audio.playChest();
      this.showDialogue(['[약초]를 24G에 구입했다!']);
    } else {
      this.showDialogue([
        '무기상인: "골드를 더 모아오시면 더 좋은 무기를 드릴 수 있습니다!"',
        `현재 소지 골드: ${this.hero.stats.gold}G`
      ]);
    }
  }

  // 보물상자 열기
  private openChest(chest: any) {
    chest.opened = true;
    this.audio.playChest();

    if (chest.gold) {
      this.hero.addGold(chest.gold);
      this.showDialogue([`보물상자를 열었다!`, `${chest.gold}골드를 획득했다!`]);
    } else if (chest.item) {
      const item = ITEMS[chest.item];
      if (item) {
        this.hero.addItem(item);
        this.showDialogue([`보물상자를 열었다!`, `전설의 [${item.name}]을(를) 획득했다!!`]);
      }
    }
  }

  // 맵 전환
  public changeMap(newMapId: MapType, targetX: number, targetY: number, targetDir?: Direction) {
    this.audio.playStairs();
    const mapFactory = WORLD_MAPS[newMapId];
    if (mapFactory) {
      this.currentMap = mapFactory();
      this.hero.x = targetX;
      this.hero.y = targetY;
      if (targetDir) this.hero.dir = targetDir;

      // 무지개의 다리 가설 반영 (오버월드 마왕의 섬 앞)
      if (this.currentMap.id === 'OVERWORLD' && this.hero.questFlags.bridgeCreated) {
        this.currentMap.tiles[28][25] = TileType.BRIDGE;
        this.currentMap.tiles[29][25] = TileType.BRIDGE;
      }

      // 이미 획득한 퀘스트 아이템 상자 opened 동기화
      this.currentMap.chests.forEach(c => {
        if (c.item && this.hero.inventory.some(i => i.id === c.item)) {
          c.opened = true;
        }
      });

      // 처치된 보스 맵에서 정리
      if (this.currentMap.id === 'SWAMP_CAVE' && this.hero.questFlags.dragonDefeated) {
        this.currentMap.npcs = this.currentMap.npcs.filter(n => n.id !== 'dragon_boss');
      }
      if (this.currentMap.id === 'OVERWORLD' && this.hero.questFlags.golemDefeated) {
        this.currentMap.npcs = this.currentMap.npcs.filter(n => n.id !== 'golem_guard');
      }

      this.audio.playBgm(this.currentMap.bgm);
    }
  }

  // 인카운터 판정
  private checkRandomEncounter() {
    // 16걸음마다 또는 7% 확률로 인카운터
    if (Math.random() < 0.075) {
      this.startRandomBattle();
    }
  }

  private startRandomBattle() {
    let pool = ENCOUNTER_TABLES['near_tantegel'];
    if (this.currentMap.id === 'OVERWORLD') {
      if (this.hero.y > 35) {
        pool = ENCOUNTER_TABLES['swamp_field'];
      } else if (this.hero.x > 35) {
        pool = ENCOUNTER_TABLES['forest_mountains'];
      } else {
        pool = ENCOUNTER_TABLES['mid_field'];
      }
    } else if (this.currentMap.isDungeon) {
      pool = ENCOUNTER_TABLES['charlock_area'];
    }

    const monsterId = pool[Math.floor(Math.random() * pool.length)];
    this.startBattle(monsterId);
  }

  public startBattle(monsterId: string) {
    this.scene = 'BATTLE';
    this.battleSystem = new BattleSystem(this.hero, monsterId, this.audio);
    this.battleSystem.onBattleEnd = (result) => {
      if (result === 'win' || result === 'escape') {
        this.scene = 'FIELD';
        this.audio.playBgm(this.currentMap.bgm);
        // 용왕 2단계 격파 시 엔딩 트리거!
        if (monsterId === 'dragonlord_2' && result === 'win') {
          this.triggerEnding();
        }
      } else if (result === 'lose') {
        // 패배 시 탄타겔 성 왕좌에서 부활 (드퀘 전통)
        this.showDialogue([
          '당신은 눈앞이 캄캄해졌다...',
          '로파 대왕: "오오 로토여! 그대가 죽어버리다니 무슨 일인가..."',
          '"그대에게 다시 한번 생명을 내려주겠노라!"'
        ]);
        this.hero.stats.hp = this.hero.stats.maxHp;
        this.hero.stats.gold = Math.floor(this.hero.stats.gold / 2); // 골드 반감
        this.changeMap('TANTEGEL_THRONE', 7, 6, 'down');
        this.scene = 'DIALOG';
      }
    };
  }

  public startBossBattle(bossId: string) {
    this.startBattle(bossId);
  }

  // 엔딩 연출
  public triggerEnding() {
    this.scene = 'ENDING';
    this.audio.playBgm('ENDING');
  }

  // --- 전투 입력 조작 ---
  private handleBattleInput() {
    if (this.autoPilot.enabled || !this.battleSystem) return;
    const bs = this.battleSystem;

    if (bs.state === 'COMMAND_SELECT') {
      if (this.input.isDirectionJustPressed('up')) {
        this.audio.playSelect();
        bs.commandCursor = (bs.commandCursor + 3) % 4;
      } else if (this.input.isDirectionJustPressed('down')) {
        this.audio.playSelect();
        bs.commandCursor = (bs.commandCursor + 1) % 4;
      }

      if (this.input.isActionJustPressed()) {
        this.audio.playSelect();
        if (bs.commandCursor === 0) {
          bs.executeAttack();
        } else if (bs.commandCursor === 1) {
          // 주문 선택
          const availableSpells = this.hero.spells;
          if (availableSpells.length > 0) {
            bs.executeSpell(availableSpells[0]);
          } else {
            bs.addLog('아직 배운 주문이 없다!');
          }
        } else if (bs.commandCursor === 2) {
          // 도구 (약초 우선 사용)
          if (this.hero.stats.herbs > 0) {
            bs.executeItem('herb');
          } else if (this.hero.questFlags.hasFairyFlute) {
            bs.executeItem('fairy_flute');
          } else {
            bs.addLog('사용할 도구가 없다!');
          }
        } else if (bs.commandCursor === 3) {
          bs.executeRun();
        }
      }
    }
  }

  // 대화 진행
  public advanceDialogue() {
    if (this.dialogueQueue.length > 0) {
      this.currentDialogueText = this.dialogueQueue.shift()!;
    } else {
      this.currentDialogueText = '';
      if (this.scene === 'INTRO_DIALOG' || this.scene === 'DIALOG') {
        this.scene = 'FIELD';
      }
    }
  }

  public showDialogue(lines: string[]) {
    this.dialogueQueue = [...lines];
    this.scene = 'DIALOG';
    this.advanceDialogue();
  }

  // AI 자동 진행 토글
  public toggleAutoPlay(): boolean {
    const active = this.autoPilot.toggle();
    const btn = document.getElementById('btn-auto-play');
    if (btn) {
      btn.textContent = active ? '🤖 AI 자동진행 ON' : '🤖 AI 자동진행 OFF';
      btn.className = active ? 'btn btn-auto active' : 'btn btn-auto';
    }
    return active;
  }

  // 배속 설정 (1x, 2x, 5x)
  public cycleSpeed() {
    if (this.gameSpeed === 1) this.gameSpeed = 2;
    else if (this.gameSpeed === 2) this.gameSpeed = 5;
    else this.gameSpeed = 1;

    const btn = document.getElementById('btn-speed');
    if (btn) {
      btn.textContent = `⚡ ${this.gameSpeed}x`;
    }
  }

  private updateLocationBadge() {
    const locBadge = document.getElementById('game-location');
    if (locBadge) {
      locBadge.textContent = this.currentMap.name;
    }
    const aiStatusEl = document.getElementById('ai-status');
    if (aiStatusEl) {
      aiStatusEl.textContent = this.autoPilot.statusText;
    }
  }

  // --- 화면 렌더링 루프 ---
  private render() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.scene) {
      case 'TITLE':
        this.renderTitle();
        break;

      case 'FIELD':
      case 'DIALOG':
      case 'INTRO_DIALOG':
        this.renderField();
        if (this.currentDialogueText) {
          WindowRenderer.drawDialogueBox(this.ctx, [this.currentDialogueText]);
        }
        break;

      case 'BATTLE':
        if (this.battleSystem) {
          this.renderBattle();
        }
        break;

      case 'ENDING':
        this.renderEnding();
        break;
    }
  }

  // 1. 타이틀 화면
  private renderTitle() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, 256, 240);

    // 타이틀 로고
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DRAGON QUEST', 128, 60);

    this.ctx.font = '11px "DotGothic16", monospace';
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillText('⚔️ 알레프갈드의 용사 ⚔️', 128, 85);

    // 슬라임 & 용사 도트 데코레이션
    const slime = this.sprites.getMonsterSprite(0);
    this.ctx.drawImage(slime, 104, 105, 48, 48);

    this.ctx.font = '10px "DotGothic16", monospace';
    this.ctx.fillStyle = '#ffffff';
    if (Math.floor(Date.now() / 400) % 2 === 0) {
      this.ctx.fillText('PRESS Z / SPACE / CLICK TO START', 128, 185);
    }

    this.ctx.fillStyle = '#888888';
    this.ctx.font = '9px "DotGothic16", monospace';
    this.ctx.fillText('© 1986 ARMOR PROJECT / ENIX / CHUNSOFT', 128, 220);
    this.ctx.textAlign = 'left';
  }

  // 2. 필드 렌더링 (카메라 뷰포트)
  private renderField() {
    const tileW = 16;
    const tileH = 16;
    const viewCols = 16; // 256 / 16
    const viewRows = 15; // 240 / 16

    // 카메라 중심 (영웅)
    const camX = Math.max(0, Math.min(this.currentMap.width - viewCols, this.hero.x - Math.floor(viewCols / 2)));
    const camY = Math.max(0, Math.min(this.currentMap.height - viewRows, this.hero.y - Math.floor(viewRows / 2)));

    // 타일 그리기
    for (let r = 0; r < viewRows; r++) {
      for (let c = 0; c < viewCols; c++) {
        const mx = camX + c;
        const my = camY + r;
        if (mx < this.currentMap.width && my < this.currentMap.height) {
          const tile = this.currentMap.tiles[my][mx];
          const tileCanvas = this.sprites.getTile(tile, this.animFrame);
          this.ctx.drawImage(tileCanvas, c * tileW, r * tileH, tileW, tileH);
        }
      }
    }

    // NPC 그리기
    this.currentMap.npcs.forEach(npc => {
      const sx = (npc.x - camX) * tileW;
      const sy = (npc.y - camY) * tileH;
      if (sx >= -tileW && sx < 256 && sy >= -tileH && sy < 240) {
        let spriteKey = 'guard';
        if (npc.spriteIndex === 0) spriteKey = 'king';
        if (npc.spriteIndex === 2) spriteKey = 'man';
        if (npc.spriteIndex === 3) spriteKey = 'woman';
        if (npc.spriteIndex === 4) spriteKey = 'sage';
        if (npc.spriteIndex === 5) spriteKey = 'princess';

        const sprite = this.sprites.getNPCSprite(spriteKey);
        this.ctx.drawImage(sprite, sx, sy, tileW, tileH);
      }
    });

    // 영웅 그리기
    const heroScreenX = (this.hero.x - camX) * tileW;
    const heroScreenY = (this.hero.y - camY) * tileH;
    const heroSprite = this.sprites.getHeroSprite(this.hero.dir, this.hero.walkFrame);
    this.ctx.drawImage(heroSprite, heroScreenX, heroScreenY, tileW, tileH);

    // 좌상단 상태창
    WindowRenderer.drawStatusBox(
      this.ctx,
      8,
      8,
      this.hero.name,
      this.hero.stats.level,
      this.hero.stats.hp,
      this.hero.stats.maxHp,
      this.hero.stats.mp,
      this.hero.stats.maxMp,
      this.hero.stats.gold,
      this.hero.stats.exp
    );
  }

  // 3. 전투 렌더링
  private renderBattle() {
    const bs = this.battleSystem!;
    let offsetX = 0;
    let offsetY = 0;

    // 화면 흔들림 효과
    if (bs.screenShakeTimer > 0) {
      offsetX = (Math.random() * 6 - 3);
      offsetY = (Math.random() * 6 - 3);
    }

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);

    // 검은 전투 배경
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, 256, 240);

    // 몬스터 스프라이트 (중앙 상단)
    if (bs.monsterFlashTimer % 4 < 2) {
      const monsterImg = this.sprites.getMonsterSprite(bs.monster.spriteIndex);
      const mw = monsterImg.width;
      const mh = monsterImg.height;
      const mx = Math.floor((256 - mw) / 2);
      const my = 45;
      this.ctx.drawImage(monsterImg, mx, my, mw, mh);
    }

    // 좌상단 영웅 스탯창
    WindowRenderer.drawStatusBox(
      this.ctx,
      8,
      8,
      this.hero.name,
      this.hero.stats.level,
      this.hero.stats.hp,
      this.hero.stats.maxHp,
      this.hero.stats.mp,
      this.hero.stats.maxMp,
      this.hero.stats.gold,
      this.hero.stats.exp
    );

    // 우측 커맨드 메뉴 (커맨드 선택 시)
    if (bs.state === 'COMMAND_SELECT') {
      WindowRenderer.drawCommandMenu(this.ctx, 168, 12, bs.commandCursor);
    }

    // 하단 전투 로그창
    WindowRenderer.drawDialogueBox(this.ctx, bs.battleLog, false);

    this.ctx.restore();
  }

  // 4. 엔딩 피날레 렌더링
  private renderEnding() {
    this.ctx.fillStyle = '#000010';
    this.ctx.fillRect(0, 0, 256, 240);

    this.ctx.font = '13px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffd700';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PEACE RESTORED!', 128, 45);

    this.ctx.font = '9px "DotGothic16", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('마왕 용왕은 쓰러지고,', 128, 70);
    this.ctx.fillText('알레프갈드에 찬란한 빛과 평화가 찾아왔도다!', 128, 86);
    this.ctx.fillText('로라 공주와 로파 대왕, 온 백성이', 128, 104);
    this.ctx.fillText('전설의 용사 로토의 위업을 영원히 찬양하리라!', 128, 120);

    // 공주와 용사 나란히
    const heroSprite = this.sprites.getHeroSprite('down', 0);
    const princessSprite = this.sprites.getNPCSprite('princess');
    this.ctx.drawImage(heroSprite, 108, 138, 20, 20);
    this.ctx.drawImage(princessSprite, 132, 138, 20, 20);

    this.ctx.fillStyle = '#ff9ff3';
    this.ctx.fillText('로라 공주: "용사님과 함께라면 어디든 가겠어요!"', 128, 178);

    this.ctx.font = '11px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#7bed9f';
    this.ctx.fillText('~ THE END ~', 128, 212);
    this.ctx.textAlign = 'left';
  }
}
