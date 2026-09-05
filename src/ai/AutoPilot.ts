// 드래곤 퀘스트 1 스마트 AI 자동 진행 (Auto-Play Autopilot) 엔진
// A* 경로 탐색, 위기 자율 회복, 자동 장비 업그레이드, 전설의 퀘스트 순차 진행

import { Direction, Monster, Position } from '../core/Types';
import { Game } from '../core/Game';
import { Pathfinding } from './Pathfinding';
import { ITEMS } from '../data/Items';

export type AIObjective = 
  | 'INIT_CASTLE'
  | 'TALK_KING'
  | 'LOOT_CASTLE_CHESTS'
  | 'LEAVE_CASTLE'
  | 'VISIT_BRECCONARY'
  | 'BUY_KEYS'
  | 'SHOPPING'
  | 'INN_REST'
  | 'FARMING_EXP'
  | 'LOOT_SUN_STONE'
  | 'GET_FAIRY_FLUTE'
  | 'GET_SILVER_HARP'
  | 'GET_STAFF_OF_RAIN'
  | 'RESCUE_PRINCESS'
  | 'DEFEAT_GOLEM'
  | 'GET_ERDRICK_ARMOR'
  | 'GET_ERDRICK_TOKEN'
  | 'GET_RAINBOW_DROP'
  | 'INFILTRATE_CHARLOCK'
  | 'GET_ERDRICK_SWORD'
  | 'DEFEAT_DRAGONLORD'
  | 'RETURN_VICTORIOUS';

export class AutoPilot {
  private game: Game;
  public enabled: boolean = false;
  public currentObjective: AIObjective = 'INIT_CASTLE';
  public statusText: string = '준비 중...';
  public actionCooldown: number = 0;
  private currentPath: Position[] = [];

  constructor(game: Game) {
    this.game = game;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    this.currentPath = [];
    if (this.enabled) {
      this.statusText = 'AI 자동 진행 가동 중';
    } else {
      this.statusText = '수동 조작 모드';
    }
    return this.enabled;
  }

  // 매 틱마다 AI 의사결정 및 행동 수행
  public update() {
    if (!this.enabled) return;

    if (this.actionCooldown > 0) {
      this.actionCooldown--;
      return;
    }

    // 1. 전투 중인 경우 스마트 배틀 AI 작동
    if (this.game.scene === 'BATTLE' && this.game.battleSystem) {
      this.handleBattleAI();
      this.actionCooldown = 15;
      return;
    }

    // 2. 대화 중인 경우 자동으로 넘김
    if (this.game.scene === 'DIALOG' || this.game.scene === 'INTRO_DIALOG') {
      this.game.advanceDialogue();
      this.actionCooldown = 12;
      return;
    }

    // 3. 필드 탐험 중인 경우
    if (this.game.scene === 'FIELD') {
      this.handleFieldAI();
      this.actionCooldown = 8;
    }
  }

  // --- 전투 AI ---
  private handleBattleAI() {
    const bs = this.game.battleSystem;
    if (!bs || bs.state !== 'COMMAND_SELECT') return;

    const hero = this.game.hero;
    const hpRatio = hero.stats.hp / hero.stats.maxHp;

    // 몬스터가 한 턴에 줄 수 있는 최대 데미지 추정 (회복 임계값 계산용)
    const monsterMaxDmg = this.getMonsterMaxDamage(bs.monster);

    // A. 체력이 위험 수준이면 최우선 회복
    //    - 체력 45% 미만 또는 몬스터 최대 데미지로 한 방에 죽을 위험이 있을 때
    const healThreshold = Math.max(hero.stats.maxHp * 0.45, monsterMaxDmg + 1);
    if (hero.stats.hp < healThreshold) {
      // 베호이마 가능하면 시전
      if (hero.stats.level >= 17 && hero.stats.mp >= 8) {
        this.statusText = `[전투] 위기! 베호이마로 체력 대량 회복 시전`;
        const spell = hero.spells.find(s => s.id === 'healmore');
        if (spell) {
          bs.executeSpell(spell);
          return;
        }
      }
      // 호이미 가능하면 시전
      if (hero.stats.level >= 3 && hero.stats.mp >= 3) {
        this.statusText = `[전투] 체력 회복을 위해 호이미 영창`;
        const spell = hero.spells.find(s => s.id === 'heal');
        if (spell) {
          bs.executeSpell(spell);
          return;
        }
      }
      // 약초가 있으면 복용
      if (hero.stats.herbs > 0) {
        this.statusText = `[전투] 약초를 사용하여 응급 치료`;
        bs.executeItem('herb');
        return;
      }
    }

    // B. 보스 몬스터 상대 특수 전략
    if (bs.monster.id === 'golem' && !bs.isMonsterAsleep && hero.questFlags.hasFairyFlute) {
      this.statusText = `[전투] 골렘에게 요정의 피리를 불어 잠재움!`;
      bs.executeItem('fairy_flute');
      return;
    }

    // B2. 이길 수 없는 일반 몬스터는 도망 (보스/메탈슬라임 제외)
    //    - 4방 이상 때려야 잡히고(체력이 높고) 그 사이에 죽을 위험이 크거나
    //    - 공격이 거의 박히지 않는 경우 (heroDmg < 3)
    //    ※ 낮은 레벨에서 약한 몬스터(슬라임 등)는 데미지가 낮아도 잡을 수 있으므로
    //      heroDmg < 3 단독으로는 도망치지 않음
    if (!bs.monster.isBoss && bs.monster.id !== 'metal_slime') {
      const heroDmg = Math.max(1, Math.floor((hero.stats.attack - bs.monster.defense / 2) / 2));
      const monsterDmg = Math.max(1, Math.floor((bs.monster.attack - hero.stats.defense / 2) / 2));
      if (heroDmg * 4 < bs.monster.hp && (monsterDmg >= hero.stats.maxHp * 0.5 || heroDmg < 3)) {
        this.statusText = `[전투] 상대가 너무 강해 도망칩니다.`;
        bs.executeRun();
        return;
      }
    }

    // C. 공격 주문 사용 (물리 공격보다 강하고 MP가 넉넉할 때만)
    //    - 기라(10~15)는 물리 공격이 약할 때만, 베기라마(45~64)는 물리보다 강할 때만
    const heroDmg = Math.max(1, Math.floor((hero.stats.attack - bs.monster.defense / 2) / 2));
    if (hero.stats.mp >= 30 && bs.monster.hp > 25) {
      if (hero.stats.level >= 19 && hero.stats.mp >= 5 && heroDmg < 45) {
        this.statusText = `[전투] 강력한 화염 베기라마 폭격!`;
        const spell = hero.spells.find(s => s.id === 'hurtmore');
        if (spell) {
          bs.executeSpell(spell);
          return;
        }
      }
      if (hero.stats.level >= 4 && hero.stats.mp >= 2 && heroDmg < 10) {
        this.statusText = `[전투] 마법 기라 시전`;
        const spell = hero.spells.find(s => s.id === 'hurt');
        if (spell) {
          bs.executeSpell(spell);
          return;
        }
      }
    }

    // D. 기본 통상 공격
    this.statusText = `[전투] ${bs.monster.name}을(를) 향해 검을 휘두름!`;
    bs.executeAttack();
  }

  // 몬스터가 한 턴에 줄 수 있는 최대 데미지 추정 (회복 임계값 계산용)
  private getMonsterMaxDamage(monster: Monster): number {
    const hero = this.game.hero;
    let maxDmg = Math.max(1, Math.floor((monster.attack - hero.stats.defense / 2) / 2) + 2);
    for (const action of monster.actions || []) {
      if (action.type === 'spell' && action.spellId === 'hurtmore') {
        maxDmg = Math.max(maxDmg, 64); // 베기라마: 45~64
      } else if (action.type === 'spell' && action.spellId === 'hurt') {
        maxDmg = Math.max(maxDmg, 15); // 기라: 10~15
      } else if (action.type === 'breathe') {
        const breatheDmg = 39; // 작열 화염: 25~39
        const reduced = hero.equipment.armor?.id === 'erdrick_armor' ? Math.floor(breatheDmg * 0.4) : breatheDmg;
        maxDmg = Math.max(maxDmg, reduced);
      }
    }
    return maxDmg;
  }

  // --- 필드 탐험 및 퀘스트 공략 AI ---
  private handleFieldAI() {
    const hero = this.game.hero;
    const currentMap = this.game.currentMap;

    // 0. 필드 체력 응급 회복
    if (hero.stats.hp < hero.stats.maxHp * 0.6 && hero.stats.mp >= 3) {
      hero.stats.mp -= 3;
      hero.stats.hp = Math.min(hero.stats.maxHp, hero.stats.hp + 17);
      this.game.audio.playHeal();
      this.statusText = '호이미로 체력을 회복했습니다.';
      return;
    }

    // 1. 현재 퀘스트 진행 상황에 따른 목표 자동 판별
    this.evaluateObjective();

    // 2. 목표에 따라 경로 탐색 및 이동 수행
    this.executeCurrentObjective();
  }

  // 퀘스트 진행도 판별
  private evaluateObjective() {
    const hero = this.game.hero;
    const flags = hero.questFlags;

    // 체력이 위험 수준이고 회복 수단이 없으면 여관으로 (파밍 중이 아닐 때)
    const wouldFarm = hero.stats.level < this.getStageLevelGate();
    if (!wouldFarm && hero.stats.hp < hero.stats.maxHp * 0.4 && hero.stats.mp < 3 && hero.stats.herbs === 0 && hero.stats.gold >= 6) {
      this.currentObjective = 'INN_REST';
      return;
    }

    // 최종 보스(용왕) 직전에는 MP를 충분히 확보해야 함 (베호이마 연속 사용 대비)
    const isFinalStage = flags.hasErdrickSword && !flags.dragonlordDefeated;
    if (isFinalStage && hero.stats.mp < 50 && hero.stats.gold >= 6) {
      this.currentObjective = 'INN_REST';
      return;
    }

    if (!flags.talkedToKing) {
      this.currentObjective = 'TALK_KING';
    } else if (flags.dragonlordDefeated) {
      // 용왕 격파 후에는 왕좌로 복귀 (LEAVE_CASTLE보다 우선)
      this.currentObjective = 'RETURN_VICTORIOUS';
    } else if (this.game.currentMap.id === 'TANTEGEL_THRONE' && this.hasUnopenedChests('TANTEGEL_THRONE')) {
      this.currentObjective = 'LOOT_CASTLE_CHESTS';
    } else if (this.game.currentMap.id === 'TANTEGEL_THRONE') {
      this.currentObjective = 'LEAVE_CASTLE';
    } else if (hero.stats.keys === 0 && hero.stats.gold >= 26) {
      // 잠긴 문(태양의 돌, 은피리)을 열 열쇠가 없으면 구매
      this.currentObjective = 'BUY_KEYS';
    } else if (!flags.hasSunStone && hero.stats.keys > 0) {
      this.currentObjective = 'LOOT_SUN_STONE';
    } else if (this.needsShopping()) {
      // 살 수 있는 장비 업그레이드가 있으면 상점 방문
      this.currentObjective = 'SHOPPING';
    } else if (hero.stats.level < this.getStageLevelGate()) {
      this.currentObjective = 'FARMING_EXP';
    } else if (!flags.hasFairyFlute) {
      this.currentObjective = 'GET_FAIRY_FLUTE';
    } else if (!flags.hasSilverHarp) {
      this.currentObjective = 'GET_SILVER_HARP';
    } else if (!flags.hasStaffOfRain) {
      this.currentObjective = 'GET_STAFF_OF_RAIN';
    } else if (!flags.rescuedPrincess) {
      this.currentObjective = 'RESCUE_PRINCESS';
    } else if (!flags.golemDefeated) {
      this.currentObjective = 'DEFEAT_GOLEM';
    } else if (!flags.hasErdrickArmor) {
      this.currentObjective = 'GET_ERDRICK_ARMOR';
    } else if (!flags.hasErdrickToken) {
      this.currentObjective = 'GET_ERDRICK_TOKEN';
    } else if (!flags.hasRainbowDrop) {
      this.currentObjective = 'GET_RAINBOW_DROP';
    } else if (!flags.hasErdrickSword) {
      this.currentObjective = 'GET_ERDRICK_SWORD';
    } else if (!flags.dragonlordDefeated) {
      this.currentObjective = 'DEFEAT_DRAGONLORD';
    } else {
      this.currentObjective = 'RETURN_VICTORIOUS';
    }
  }

  // 다음 스테이지에 필요한 최소 레벨 (보스전 난이도 기반)
  private getStageLevelGate(): number {
    const flags = this.game.hero.questFlags;
    if (!flags.hasFairyFlute) return 4;      // 요정의 피리
    if (!flags.hasSilverHarp) return 5;      // 은피리
    if (!flags.hasStaffOfRain) return 6;     // 비구름의 지팡이
    if (!flags.rescuedPrincess) return 15;   // 늪지의 동굴 (그린 드래곤)
    if (!flags.golemDefeated) return 13;     // 메르키드 골렘
    if (!flags.hasErdrickArmor) return 13;   // 로토의 갑옷
    if (!flags.hasErdrickToken) return 13;   // 로토의 증표
    if (!flags.hasRainbowDrop) return 13;    // 무지개의 물방울
    if (!flags.hasErdrickSword) return 15;   // 류오의 성 잠입
    if (!flags.dragonlordDefeated) return 19; // 최종 결전 (용왕 2단계 HP240/ATK145 대응)
    return 19;
  }

  // 살 수 있는 장비 업그레이드가 있는지 확인
  private needsShopping(): boolean {
    const hero = this.game.hero;
    const gold = hero.stats.gold;
    const w = hero.equipment.weapon?.power || 0;
    const a = hero.equipment.armor?.power || 0;
    const s = hero.equipment.shield?.power || 0;
    return (gold >= 9800 && w < 28) ||    // 화염의 검
           (gold >= 7700 && a < 24) ||    // 마법 갑옷
           (gold >= 14800 && s < 20) ||   // 미키의 은방패
           (gold >= 1500 && w < 20) ||    // 강철검
           (gold >= 1000 && a < 16) ||    // 철갑옷
           (gold >= 800 && s < 10) ||     // 철 방패
           (gold >= 560 && w < 15) ||     // 철도끼
           (gold >= 300 && a < 10) ||     // 사슬 갑옷
           (gold >= 180 && w < 10) ||     // 구리검
           (gold >= 90 && s < 4) ||       // 가죽 방패
           (gold >= 70 && a < 4) ||       // 가죽 갑옷
           (gold >= 60 && w < 4) ||       // 곤봉
           (gold >= 20 && a < 2) ||       // 천옷
           (gold >= 10 && w < 2) ||       // 대나무 막대
           // 약초 보충 (체력이 낮으면 여관 숙박이 더 효율적이므로 제외)
           (gold >= 24 && hero.stats.herbs < 4 && hero.stats.hp >= hero.stats.maxHp * 0.5);
  }

  private hasUnopenedChests(mapId: string): boolean {
    return this.game.currentMap.chests.some(c => c.map === mapId && !c.opened);
  }

  // 목표별 자율 행동 실행
  private executeCurrentObjective() {
    const hero = this.game.hero;
    const map = this.game.currentMap;

    switch (this.currentObjective) {
      case 'TALK_KING': {
        this.statusText = '국왕 로파 대왕을 알현하러 이동 중...';
        if (map.id === 'TANTEGEL_THRONE') {
          if (hero.x === 7 && hero.y === 4) {
            hero.dir = 'up';
            this.game.interactWithFront();
            hero.questFlags.talkedToKing = true;
          } else {
            this.navigateToward(7, 4);
          }
        }
        break;
      }

      case 'LOOT_CASTLE_CHESTS': {
        this.statusText = '탄타겔 성 보물상자(골드, 횃불, 열쇠) 회수 중...';
        const chest = map.chests.find(c => !c.opened);
        if (chest) {
          if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
            hero.dir = Pathfinding.getDirection(hero, chest);
            this.game.interactWithFront();
          } else {
            this.navigateToward(chest.x, chest.y);
          }
        }
        break;
      }

      case 'LEAVE_CASTLE': {
        this.statusText = '성 밖 알레프갈드 대륙으로 이동 중...';
        if (map.id === 'TANTEGEL_THRONE') {
          this.navigateToward(13, 13); // 계단
        } else if (map.id === 'TANTEGEL_1F') {
          this.navigateToward(9, 19); // 출구
        }
        break;
      }

      case 'BUY_KEYS': {
        this.statusText = '라다톰 마을에서 마법의 열쇠를 구매 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(27, 26); // 라다톰 마을 진입
        } else if (map.id === 'BRECCONARY') {
          const merchant = map.npcs.find(n => n.action === 'key');
          if (merchant) {
            if (Math.abs(hero.x - merchant.x) + Math.abs(hero.y - merchant.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, merchant);
              this.game.interactWithFront();
            } else {
              this.navigateToward(merchant.x, merchant.y);
            }
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'SHOPPING': {
        this.statusText = '라다톰 무기 상점에서 장비 구매 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(27, 26); // 라다톰 마을 진입
        } else if (map.id === 'BRECCONARY') {
          const merchant = map.npcs.find(n => n.action === 'shop');
          if (merchant) {
            if (Math.abs(hero.x - merchant.x) + Math.abs(hero.y - merchant.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, merchant);
              this.game.interactWithFront();
            } else {
              this.navigateToward(merchant.x, merchant.y);
            }
          }
        } else {
          // 다른 맵에 있으면 출구로 이동
          this.exitToOverworld();
        }
        break;
      }

      case 'INN_REST': {
        this.statusText = '체력 회복을 위해 라다톰 여관으로 이동 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(27, 26); // 라다톰 마을 진입
        } else if (map.id === 'BRECCONARY') {
          const inn = map.npcs.find(n => n.action === 'inn');
          if (inn) {
            if (Math.abs(hero.x - inn.x) + Math.abs(hero.y - inn.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, inn);
              this.game.interactWithFront();
            } else {
              this.navigateToward(inn.x, inn.y);
            }
          }
        } else {
          // 다른 맵에 있으면 출구로 이동
          this.exitToOverworld();
        }
        break;
      }

      case 'LOOT_SUN_STONE': {
        this.statusText = '탄타겔 성 지하 보물고에서 [태양의 돌] 획득 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(25, 26); // 탄타겔 성 진입
        } else if (map.id === 'TANTEGEL_1F') {
          const chest = map.chests.find(c => c.item === 'sun_stone' && !c.opened);
          if (chest) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          } else {
            this.navigateToward(9, 19); // 다시 밖으로
          }
        }
        break;
      }

      case 'FARMING_EXP': {
        this.statusText = `[파밍] 레벨업 및 골드 수련 중 (현재 Lv ${hero.stats.level})...`;
        // 체력이 절반 미만이면 라다톰 여관에서 회복 (골드가 있을 때만 - 없으면 계속 사냥)
        if (hero.stats.hp < hero.stats.maxHp * 0.5 && hero.stats.gold >= 6) {
          if (map.id === 'BRECCONARY') {
            const inn = map.npcs.find(n => n.action === 'inn');
            if (inn) {
              if (Math.abs(hero.x - inn.x) + Math.abs(hero.y - inn.y) <= 1) {
                hero.dir = Pathfinding.getDirection(hero, inn);
                this.game.interactWithFront();
              } else {
                this.navigateToward(inn.x, inn.y);
              }
            }
          } else {
            this.navigateToward(27, 26); // 라다톰 마을로
          }
        } else if (map.id === 'TANTEGEL_THRONE') {
          this.navigateToward(13, 13); // 1층으로 내려가기
        } else if (map.id === 'TANTEGEL_1F') {
          this.navigateToward(9, 19); // 성 밖으로 나가기
        } else if (map.id !== 'OVERWORLD') {
          this.navigateToward(map.warps[0]?.x || 0, map.warps[0]?.y || 0);
        } else {
          // 레벨에 맞는 사냥터 순회 (인카운터 존: near_tantegel / mid_field / forest_mountains / swamp_field)
          let patrolTarget: Position;
          if (hero.stats.level < 7) {
            // 성 서쪽 들판 (슬라임/레드슬라임) - 성/마을 입구 워프 회피
            patrolTarget = Math.floor(Date.now() / 4000) % 2 === 0 ? { x: 23, y: 23 } : { x: 24, y: 24 };
          } else if (hero.stats.level < 11) {
            // 중부 들판 (레드슬라임/드라키/고스트)
            patrolTarget = Math.floor(Date.now() / 4000) % 2 === 0 ? { x: 33, y: 25 } : { x: 34, y: 26 };
          } else if (hero.stats.level < 15) {
            // 북동 숲/산악 (드라키/고스트/마도사/메탈슬라임)
            patrolTarget = Math.floor(Date.now() / 4000) % 2 === 0 ? { x: 40, y: 20 } : { x: 41, y: 21 };
          } else {
            // 남부 늪지대 (스켈레톤/키메라/킬러아머)
            patrolTarget = Math.floor(Date.now() / 4000) % 2 === 0 ? { x: 30, y: 40 } : { x: 31, y: 41 };
          }
          this.navigateToward(patrolTarget.x, patrolTarget.y);
        }
        break;
      }

      case 'GET_FAIRY_FLUTE': {
        this.statusText = '마이라 온천 마을에서 [요정의 피리] 탐색 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(42, 12); // 마이라 마을 좌표
        } else if (map.id === 'KOL') {
          const chest = map.chests.find(c => c.item === 'fairy_flute');
          if (chest && !chest.opened) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          } else {
            this.navigateToward(9, 17); // 마이라 출구
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'GET_STAFF_OF_RAIN': {
        this.statusText = '북서쪽 사당에서 [비구름의 지팡이] 수령 중...';
        if (map.id === 'OVERWORLD') {
          const chest = map.chests.find(c => c.item === 'staff_of_rain');
          if (chest && !chest.opened) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'GET_SILVER_HARP': {
        this.statusText = '가라이의 마을 영묘에서 [은의 하프] 획득 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(14, 14);
        } else if (map.id === 'GARINHAM') {
          const chest = map.chests.find(c => c.item === 'silver_harp');
          if (chest && !chest.opened) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          } else {
            this.navigateToward(9, 19); // 가라이 마을 출구
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'RESCUE_PRINCESS': {
        this.statusText = '늪지의 동굴 침투, 드래곤 격파 및 로라 공주 구출 작전!';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(30, 30); // 늪지 동굴 입구
        } else if (map.id === 'SWAMP_CAVE') {
          if (!hero.questFlags.dragonDefeated) {
            // 드래곤 보스 앞으로 이동
            if (hero.x === 15 && hero.y === 11) {
              hero.dir = 'up';
              this.game.interactWithFront();
            } else {
              this.navigateToward(15, 11);
            }
          } else {
            // 로라 공주 구출
            if (hero.x === 15 && hero.y === 8) {
              hero.dir = 'up';
              this.game.interactWithFront();
              hero.questFlags.rescuedPrincess = true;
              hero.addItem(ITEMS.princess_love);
            } else {
              this.navigateToward(15, 8);
            }
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'DEFEAT_GOLEM': {
        this.statusText = '메르키드 수호 골렘을 요정의 피리로 잠재우고 돌파 중...';
        if (map.id === 'OVERWORLD') {
          if (hero.x === 38 && hero.y === 44) {
            hero.dir = 'up';
            this.game.interactWithFront();
          } else {
            this.navigateToward(38, 44);
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'GET_ERDRICK_ARMOR': {
        this.statusText = '돔드라 폐허에서 전설의 [로토의 갑옷] 발굴 중...';
        if (map.id === 'OVERWORLD') {
          const chest = map.chests.find(c => c.item === 'erdrick_armor');
          if (chest && !chest.opened) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'GET_ERDRICK_TOKEN': {
        this.statusText = '남쪽 깊은 독 늪지대에서 [로토의 증표] 발굴 중...';
        if (map.id === 'OVERWORLD') {
          const chest = map.chests.find(c => c.item === 'erdrick_token');
          if (chest && !chest.opened) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'GET_RAINBOW_DROP': {
        this.statusText = '성스러운 사당에서 3대 신기를 결합해 [무지개의 물방울] 생성 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(43, 41); // 사당 입구
        } else if (map.id === 'HOLY_SHRINE') {
          const chest = map.chests.find(c => c.item === 'rainbow_drop');
          if (chest && !chest.opened) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          } else {
            hero.questFlags.bridgeCreated = true;
            this.navigateToward(6, 13);
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'GET_ERDRICK_SWORD': {
        this.statusText = '용왕의 성 잠입! 최강의 무기 [로토의 검] 입수 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(25, 30); // 류오의 성
        } else if (map.id === 'CHARLOCK_CASTLE') {
          const chest = map.chests.find(c => c.item === 'erdrick_sword');
          if (chest && !chest.opened) {
            if (Math.abs(hero.x - chest.x) + Math.abs(hero.y - chest.y) <= 1) {
              hero.dir = Pathfinding.getDirection(hero, chest);
              this.game.interactWithFront();
            } else {
              this.navigateToward(chest.x, chest.y);
            }
          }
        } else {
          // 사당 등 다른 맵에 있으면 출구로 이동 (무지개 다리 생성 후 오버월드 복귀)
          this.exitToOverworld();
        }
        break;
      }

      case 'DEFEAT_DRAGONLORD': {
        this.statusText = '최종 결전! 마왕 류오의 옥좌로 돌격!!';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(25, 30);
        } else if (map.id === 'CHARLOCK_CASTLE') {
          if (hero.x === 11 && hero.y === 6) {
            hero.dir = 'up';
            this.game.interactWithFront();
          } else {
            this.navigateToward(11, 6);
          }
        } else {
          // 다른 맵에 있으면 출구로 이동 (성 안에서는 성 밖으로)
          this.exitToOverworld();
        }
        break;
      }

      case 'RETURN_VICTORIOUS': {
        this.statusText = '용왕 격파! 알레프갈드에 평화가 찾아왔습니다!';
        if (map.id !== 'TANTEGEL_THRONE') {
          this.navigateToward(map.warps[0]?.x || 0, map.warps[0]?.y || 0);
        }
        break;
      }
    }
  }

  // 성 안에 있으면 성 밖으로 나가기
  // (TANTEGEL_1F의 warps[0]은 왕좌로 올라가는 계단이라 그대로 쓰면 왕좌↔1층 무한 루프 발생)
  private exitToOverworld() {
    const map = this.game.currentMap;
    if (map.id === 'TANTEGEL_THRONE') {
      this.navigateToward(13, 13); // 1층으로 내려가기
    } else if (map.id === 'TANTEGEL_1F') {
      this.navigateToward(9, 19); // 성 밖으로 나가기
    } else {
      this.navigateToward(map.warps[0]?.x || 0, map.warps[0]?.y || 0);
    }
  }

  // A* 알고리즘을 사용한 자율 이동
  private navigateToward(targetX: number, targetY: number) {
    const hero = this.game.hero;
    const map = this.game.currentMap;
    const hasErdrickArmor = hero.equipment.armor?.id === 'erdrick_armor';

    // 이미 목적지에 도달했으면 정지
    if (hero.x === targetX && hero.y === targetY) {
      this.currentPath = [];
      return;
    }

    // 경로가 없거나 재계산 필요 시 계산
    if (this.currentPath.length === 0 || this.currentPath[this.currentPath.length - 1].x !== targetX || this.currentPath[this.currentPath.length - 1].y !== targetY) {
      this.currentPath = Pathfinding.findPath(map, hero.x, hero.y, targetX, targetY, hasErdrickArmor);
    }

    if (this.currentPath.length > 0) {
      const nextStep = this.currentPath.shift()!;
      const dir = Pathfinding.getDirection(hero, nextStep);
      this.game.tryMoveHero(dir);
    } else {
      // 경로를 찾을 수 없는 경우 타겟 방향으로 직진 시도
      const dx = targetX - hero.x;
      const dy = targetY - hero.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.game.tryMoveHero(dx > 0 ? 'right' : 'left');
      } else {
        this.game.tryMoveHero(dy > 0 ? 'down' : 'up');
      }
    }
  }
}
