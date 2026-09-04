// 드래곤 퀘스트 1 턴제 1:1 커맨드 배틀 엔진

import { ChiptuneAudio } from '../audio/ChiptuneAudio';
import { Monster, Spell } from '../core/Types';
import { MONSTERS } from '../data/Monsters';
import { Hero } from '../entities/Hero';

export type BattleState = 
  | 'COMMAND_SELECT'
  | 'SPELL_SELECT'
  | 'ITEM_SELECT'
  | 'MESSAGE_WAIT'
  | 'HERO_ATTACKING'
  | 'MONSTER_ATTACKING'
  | 'VICTORY'
  | 'DEFEAT'
  | 'ESCAPED';

export class BattleSystem {
  public monster: Monster;
  public hero: Hero;
  public audio: ChiptuneAudio;

  public state: BattleState = 'COMMAND_SELECT';
  public commandCursor: number = 0; // 0: 공격, 1: 도망, 2: 주문, 3: 도구
  public subCursor: number = 0;
  
  public battleLog: string[] = [];
  public currentLogIndex: number = 0;
  public onBattleEnd: ((result: 'win' | 'lose' | 'escape') => void) | null = null;

  public monsterFlashTimer: number = 0;
  public screenShakeTimer: number = 0;
  public isMonsterAsleep: boolean = false;
  public sleepTurnsLeft: number = 0;

  constructor(hero: Hero, monsterId: string, audio: ChiptuneAudio) {
    this.hero = hero;
    this.audio = audio;
    const baseMonster = MONSTERS[monsterId] || MONSTERS['slime'];
    // 몬스터 독립 객체 복제
    this.monster = {
      ...baseMonster,
      hp: baseMonster.hp,
      maxHp: baseMonster.hp
    };

    this.audio.playBgm(this.monster.isBoss ? 'BOSS' : 'BATTLE');
    this.addLog(`${this.monster.name}이(가) 나타났다!`);
  }

  public addLog(msg: string) {
    this.battleLog.push(msg);
  }

  // 플레이어 행동 처리 (공격)
  public executeAttack() {
    this.state = 'HERO_ATTACKING';
    this.addLog(`${this.hero.name}의 공격!`);

    // 회피 판정
    if (Math.random() < this.monster.dodgeRate) {
      this.addLog(`${this.monster.name}은(는) 가볍게 피했다!`);
      this.finishHeroTurn();
      return;
    }

    // 회심의 일격 판정 (1/16)
    const isCritical = Math.random() < 0.0625;
    let damage = 0;

    if (isCritical) {
      this.audio.playCritical();
      this.addLog('회심의 일격!!!');
      damage = Math.floor(this.hero.stats.attack * (0.95 + Math.random() * 0.2));
    } else {
      this.audio.playAttack();
      const base = (this.hero.stats.attack - this.monster.defense / 2) / 2;
      damage = Math.max(1, Math.floor(base + (Math.random() * 3 - 1)));
    }

    this.monster.hp = Math.max(0, this.monster.hp - damage);
    this.monsterFlashTimer = 15;
    this.screenShakeTimer = isCritical ? 12 : 6;
    this.addLog(`${this.monster.name}에게 ${damage}의 피해를 주었다!`);

    if (this.monster.hp <= 0) {
      this.handleMonsterDefeated();
    } else {
      this.finishHeroTurn();
    }
  }

  // 플레이어 주문 사용
  public executeSpell(spell: Spell) {
    if (this.hero.stats.mp < spell.mpCost) {
      this.addLog('MP가 부족합니다!');
      this.state = 'COMMAND_SELECT';
      return;
    }

    this.hero.stats.mp -= spell.mpCost;
    this.audio.playSpell();
    this.state = 'HERO_ATTACKING';
    this.addLog(`${this.hero.name}은(는) ${spell.name}을(를) 외웠다!`);

    if (spell.type === 'heal') {
      const healAmount = Math.floor((spell.power || 15) * (0.9 + Math.random() * 0.2));
      this.hero.stats.hp = Math.min(this.hero.stats.maxHp, this.hero.stats.hp + healAmount);
      this.audio.playHeal();
      this.addLog(`체력이 ${healAmount} 회복되었다!`);
      this.finishHeroTurn();
    } else if (spell.type === 'attack') {
      const dmg = Math.floor((spell.power || 12) * (0.85 + Math.random() * 0.3));
      this.monster.hp = Math.max(0, this.monster.hp - dmg);
      this.monsterFlashTimer = 18;
      this.screenShakeTimer = 8;
      this.addLog(`${this.monster.name}에게 ${dmg}의 작열 피해!`);

      if (this.monster.hp <= 0) {
        this.handleMonsterDefeated();
      } else {
        this.finishHeroTurn();
      }
    } else if (spell.type === 'sleep') {
      if (Math.random() < 0.65 && !this.monster.isBoss) {
        this.isMonsterAsleep = true;
        this.sleepTurnsLeft = 2 + Math.floor(Math.random() * 3);
        this.addLog(`${this.monster.name}은(는) 깊은 잠에 빠졌다!`);
      } else {
        this.addLog('하지만 효과가 없었다!');
      }
      this.finishHeroTurn();
    } else {
      this.addLog('아무 일도 일어나지 않았다.');
      this.finishHeroTurn();
    }
  }

  // 플레이어 도구 사용
  public executeItem(itemId: string) {
    this.state = 'HERO_ATTACKING';

    if (itemId === 'herb') {
      if (this.hero.stats.herbs > 0) {
        this.hero.stats.herbs--;
        const healAmt = 24 + Math.floor(Math.random() * 6);
        this.hero.stats.hp = Math.min(this.hero.stats.maxHp, this.hero.stats.hp + healAmt);
        this.audio.playHeal();
        this.addLog(`약초를 사용하여 HP가 ${healAmt} 회복되었다!`);
      } else {
        this.addLog('약초가 없습니다!');
        this.state = 'COMMAND_SELECT';
        return;
      }
      this.finishHeroTurn();
    } else if (itemId === 'fairy_flute') {
      this.audio.playInn();
      this.addLog('요정의 피리를 불었다! 맑고 아름다운 음색이 울려 퍼진다.');
      if (this.monster.id === 'golem') {
        this.isMonsterAsleep = true;
        this.sleepTurnsLeft = 4;
        this.addLog('거대 골렘은 스르륵 깊은 잠에 빠져들었다!');
      } else {
        this.addLog('하지만 마물에게는 별 반응이 없었다.');
      }
      this.finishHeroTurn();
    } else {
      this.addLog('지금은 사용할 수 없습니다.');
      this.state = 'COMMAND_SELECT';
    }
  }

  // 플레이어 도망
  public executeRun() {
    this.state = 'HERO_ATTACKING';
    this.addLog(`${this.hero.name}은(는) 전속력으로 도망치려 했다!`);

    if (this.monster.isBoss) {
      this.addLog('강력한 마수의 결계에 막혀 도망칠 수 없다!');
      this.finishHeroTurn();
      return;
    }

    // 도망 성공 확률 (민첩성 비례)
    const runRate = Math.min(0.85, 0.5 + (this.hero.stats.agility - this.monster.agility) * 0.01);
    if (Math.random() < runRate) {
      this.state = 'ESCAPED';
      this.addLog('무사히 도망쳤다!');
      setTimeout(() => {
        if (this.onBattleEnd) this.onBattleEnd('escape');
      }, 1000);
    } else {
      this.addLog('하지만 도망치지 못했다!');
      this.finishHeroTurn();
    }
  }

  // 플레이어 턴 종료 -> 몬스터 턴 진행
  private finishHeroTurn() {
    this.state = 'MONSTER_ATTACKING';

    setTimeout(() => {
      this.executeMonsterTurn();
    }, 600);
  }

  // 몬스터 턴 실행
  private executeMonsterTurn() {
    if (this.monster.hp <= 0) return;

    // 수면 상태 체크
    if (this.isMonsterAsleep) {
      this.sleepTurnsLeft--;
      this.addLog(`${this.monster.name}은(는) 쿨쿨 자고 있다...`);
      if (this.sleepTurnsLeft <= 0) {
        this.isMonsterAsleep = false;
        this.addLog(`${this.monster.name}이(가) 눈을 떴다!`);
      }
      this.state = 'COMMAND_SELECT';
      return;
    }

    // 몬스터 행동 선택 (공격 / 주문 / 브레스)
    const actionRoll = Math.random();
    let currentRate = 0;
    let chosenAction = this.monster.actions[0];

    for (const act of this.monster.actions) {
      currentRate += act.rate;
      if (actionRoll <= currentRate) {
        chosenAction = act;
        break;
      }
    }

    if (chosenAction.type === 'attack') {
      this.audio.playAttack();
      this.addLog(`${this.monster.name}의 공격!`);

      const base = (this.monster.attack - this.hero.stats.defense / 2) / 2;
      const dmg = Math.max(1, Math.floor(base + (Math.random() * 3 - 1)));
      this.hero.stats.hp = Math.max(0, this.hero.stats.hp - dmg);
      this.screenShakeTimer = 8;
      this.addLog(`${this.hero.name}은(는) ${dmg}의 데미지를 입었다!`);
    } else if (chosenAction.type === 'breathe') {
      this.audio.playCritical();
      this.addLog(`${this.monster.name}은(는) 맹렬한 작열 화염을 내뿜었다!`);

      let dmg = 25 + Math.floor(Math.random() * 15);
      // 로토의 갑옷 착용 시 화염 데미지 대폭 감소
      if (this.hero.equipment.armor?.id === 'erdrick_armor') {
        dmg = Math.floor(dmg * 0.4);
      }
      this.hero.stats.hp = Math.max(0, this.hero.stats.hp - dmg);
      this.screenShakeTimer = 12;
      this.addLog(`${this.hero.name}은(는) ${dmg}의 불꽃 피해를 입었다!`);
    } else if (chosenAction.type === 'spell') {
      this.audio.playSpell();
      this.addLog(`${this.monster.name}은(는) 주문을 영창했다!`);

      if (chosenAction.spellId === 'heal') {
        this.monster.hp = Math.min(this.monster.maxHp, this.monster.hp + 20);
        this.audio.playHeal();
        this.addLog(`${this.monster.name}의 상처가 회복되었다!`);
      } else if (chosenAction.spellId === 'hurtmore') {
        const dmg = 45 + Math.floor(Math.random() * 20);
        this.hero.stats.hp = Math.max(0, this.hero.stats.hp - dmg);
        this.screenShakeTimer = 10;
        this.addLog(`엄청난 번개가 내리쳐 ${dmg}의 피해!`);
      } else {
        const dmg = 10 + Math.floor(Math.random() * 6);
        this.hero.stats.hp = Math.max(0, this.hero.stats.hp - dmg);
        this.screenShakeTimer = 6;
        this.addLog(`${dmg}의 화염 피해를 입었다!`);
      }
    } else if (chosenAction.type === 'run') {
      this.addLog(`${this.monster.name}은(는) 도망쳤다!`);
      this.state = 'ESCAPED';
      setTimeout(() => {
        if (this.onBattleEnd) this.onBattleEnd('escape');
      }, 1000);
      return;
    }

    // 플레이어 생존 여부 체크
    if (this.hero.stats.hp <= 0) {
      this.state = 'DEFEAT';
      this.addLog(`${this.hero.name}은(는) 쓰러지고 말았다...`);
      setTimeout(() => {
        if (this.onBattleEnd) this.onBattleEnd('lose');
      }, 1500);
    } else {
      this.state = 'COMMAND_SELECT';
    }
  }

  // 몬스터 처치 처리
  private handleMonsterDefeated() {
    // 용왕 1단계 처치 시 2단계 거룡으로 변신!
    if (this.monster.id === 'dragonlord_1') {
      this.addLog('마왕 류오의 인간 형태가 무너져 내린다...');
      this.addLog('하지만 마왕은 진정한 거룡의 모습으로 각성했다!!');
      this.audio.playCritical();

      const trueDragon = MONSTERS['dragonlord_2'];
      this.monster = {
        ...trueDragon,
        hp: trueDragon.hp,
        maxHp: trueDragon.hp
      };
      this.monsterFlashTimer = 30;
      this.screenShakeTimer = 20;
      this.finishHeroTurn();
      return;
    }

    this.state = 'VICTORY';
    this.audio.playVictory();
    this.addLog(`${this.monster.name}을(를) 물리쳤다!`);
    this.addLog(`${this.monster.exp}포인트의 경험치를 획득했다.`);
    this.addLog(`${this.monster.gold}골드를 손에 넣었다.`);

    const leveledUp = this.hero.addExp(this.monster.exp);
    this.hero.addGold(this.monster.gold);

    if (leveledUp) {
      this.audio.playLevelUp();
      this.addLog(`레벨이 올랐다! 현재 Lv ${this.hero.stats.level}!`);
    }

    // 보스 처치 시 플래그 갱신
    if (this.monster.id === 'golem') {
      this.hero.questFlags.golemDefeated = true;
    } else if (this.monster.id === 'green_dragon') {
      this.hero.questFlags.dragonDefeated = true;
    } else if (this.monster.id === 'dragonlord_2') {
      this.hero.questFlags.dragonlordDefeated = true;
    }

    setTimeout(() => {
      if (this.onBattleEnd) this.onBattleEnd('win');
    }, 1800);
  }

  public update() {
    if (this.monsterFlashTimer > 0) this.monsterFlashTimer--;
    if (this.screenShakeTimer > 0) this.screenShakeTimer--;
  }
}
