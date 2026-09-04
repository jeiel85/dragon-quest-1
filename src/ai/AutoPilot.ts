// 드래곤 퀘스트 1 스마트 AI 자동 진행 (Auto-Play Autopilot) 엔진
// A* 경로 탐색, 위기 자율 회복, 자동 장비 업그레이드, 전설의 퀘스트 순차 진행

import { Direction, Position } from '../core/Types';
import { Game } from '../core/Game';
import { Pathfinding } from './Pathfinding';
import { ITEMS } from '../data/Items';

export type AIObjective = 
  | 'INIT_CASTLE'
  | 'TALK_KING'
  | 'LOOT_CASTLE_CHESTS'
  | 'LEAVE_CASTLE'
  | 'VISIT_BRECCONARY'
  | 'FARMING_EXP'
  | 'BUY_KEYS'
  | 'LOOT_SUN_STONE'
  | 'GET_FAIRY_FLUTE'
  | 'GET_SILVER_HARP'
  | 'GET_STAFF_OF_RAIN'
  | 'RESCUE_PRINCESS'
  | 'DEFEAT_GOLEM'
  | 'GET_ERDRICK_TOKEN'
  | 'GET_ERDRICK_ARMOR'
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

    // A. 체력이 45% 미만인 경우 최우선 회복
    if (hpRatio < 0.45) {
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

    // C. 공격 주문 사용 (MP가 넉넉하고 적 체력이 높을 때)
    if (hero.stats.mp >= 10 && bs.monster.hp > 25) {
      if (hero.stats.level >= 19 && hero.stats.mp >= 5) {
        this.statusText = `[전투] 강력한 화염 베기라마 폭격!`;
        const spell = hero.spells.find(s => s.id === 'hurtmore');
        if (spell) {
          bs.executeSpell(spell);
          return;
        }
      }
      if (hero.stats.level >= 4 && hero.stats.mp >= 2) {
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

  // --- 필드 탐험 및 퀘스트 공략 AI ---
  private handleFieldAI() {
    const hero = this.game.hero;
    const currentMap = this.game.currentMap;

    // 0. 필드 체력 응급 회복
    if (hero.stats.hp < hero.stats.maxHp * 0.4 && hero.stats.mp >= 3) {
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

    if (!flags.talkedToKing) {
      this.currentObjective = 'TALK_KING';
    } else if (this.game.currentMap.id === 'TANTEGEL_THRONE' && this.hasUnopenedChests('TANTEGEL_THRONE')) {
      this.currentObjective = 'LOOT_CASTLE_CHESTS';
    } else if (this.game.currentMap.id === 'TANTEGEL_THRONE') {
      this.currentObjective = 'LEAVE_CASTLE';
    } else if (!flags.hasSunStone && hero.stats.keys > 0) {
      this.currentObjective = 'LOOT_SUN_STONE';
    } else if (hero.stats.level < 4) {
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
        // 성 주변을 순회하며 마물 조우 및 사냥
        if (map.id !== 'OVERWORLD') {
          this.navigateToward(map.warps[0]?.x || 0, map.warps[0]?.y || 0);
        } else {
          // 성과 마을 사이를 왕복
          const patrolTarget = Math.floor(Date.now() / 4000) % 2 === 0 ? { x: 26, y: 24 } : { x: 27, y: 27 };
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
        }
        break;
      }

      case 'GET_SILVER_HARP': {
        this.statusText = '가라이의 마을 영묘에서 [은의 하프] 획득 중...';
        if (map.id === 'OVERWORLD') {
          this.navigateToward(10, 10);
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
