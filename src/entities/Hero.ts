// 드래곤 퀘스트 1 영웅(Hero) 클래스

import { Direction, HeroEquipment, HeroStats, Item, QuestFlags, Spell } from '../core/Types';
import { ITEMS } from '../data/Items';
import { SPELLS } from '../data/Spells';

// 드퀘 1 레벨업 경험치 및 스탯 성장표
interface LevelGrowth {
  exp: number;
  hp: number;
  mp: number;
  strength: number;
  agility: number;
}

const LEVEL_TABLE: LevelGrowth[] = [
  { exp: 0, hp: 15, mp: 0, strength: 4, agility: 4 },        // Lv 1
  { exp: 7, hp: 22, mp: 0, strength: 5, agility: 4 },        // Lv 2
  { exp: 23, hp: 24, mp: 5, strength: 7, agility: 6 },       // Lv 3 (호이미 습득)
  { exp: 47, hp: 31, mp: 16, strength: 7, agility: 8 },      // Lv 4 (기라 습득)
  { exp: 110, hp: 35, mp: 20, strength: 12, agility: 10 },   // Lv 5
  { exp: 220, hp: 38, mp: 24, strength: 16, agility: 10 },   // Lv 6
  { exp: 450, hp: 40, mp: 26, strength: 18, agility: 17 },   // Lv 7 (라리호 습득)
  { exp: 800, hp: 46, mp: 29, strength: 22, agility: 20 },   // Lv 8
  { exp: 1300, hp: 50, mp: 36, strength: 30, agility: 22 },  // Lv 9 (레미라 습득)
  { exp: 2000, hp: 54, mp: 40, strength: 35, agility: 31 },  // Lv 10 (마호톤 습득)
  { exp: 2900, hp: 62, mp: 50, strength: 40, agility: 35 },  // Lv 11
  { exp: 4000, hp: 67, mp: 58, strength: 48, agility: 40 },  // Lv 12 (리레미트 습득)
  { exp: 5500, hp: 73, mp: 64, strength: 52, agility: 48 },  // Lv 13 (루라 습득)
  { exp: 7500, hp: 79, mp: 70, strength: 60, agility: 55 },  // Lv 14
  { exp: 10000, hp: 85, mp: 78, strength: 68, agility: 64 }, // Lv 15 (토헤로스 습득)
  { exp: 13000, hp: 92, mp: 86, strength: 78, agility: 70 }, // Lv 16
  { exp: 17000, hp: 100, mp: 92, strength: 88, agility: 78 },// Lv 17 (베호이마 습득)
  { exp: 21000, hp: 115, mp: 100, strength: 98, agility: 84 },// Lv 18
  { exp: 25000, hp: 130, mp: 110, strength: 110, agility: 92 },// Lv 19 (베기라마 습득)
  { exp: 29000, hp: 140, mp: 120, strength: 120, agility: 100 },// Lv 20 (용사 극의)
  { exp: 40000, hp: 180, mp: 150, strength: 145, agility: 120 },// Lv 25 (최강)
  { exp: 65535, hp: 240, mp: 200, strength: 175, agility: 145 } // Lv 30 (신화)
];

export class Hero {
  public name: string = '로토';
  public x: number = 7;
  public y: number = 6;
  public dir: Direction = 'down';
  public walkFrame: number = 0;

  public stats: HeroStats = {
    level: 1,
    hp: 15,
    maxHp: 15,
    mp: 0,
    maxMp: 0,
    strength: 4,
    agility: 4,
    attack: 4,
    defense: 4,
    exp: 0,
    gold: 0,
    keys: 0,
    herbs: 0,
    torches: 0
  };

  public equipment: HeroEquipment = {
    weapon: null,
    armor: null,
    shield: null
  };

  public questFlags: QuestFlags = {
    talkedToKing: false,
    rescuedPrincess: false,
    dragonDefeated: false,
    golemDefeated: false,
    hasFairyFlute: false,
    hasSilverHarp: false,
    hasSunStone: false,
    hasStaffOfRain: false,
    hasErdrickToken: false,
    hasRainbowDrop: false,
    hasErdrickArmor: false,
    hasErdrickSword: false,
    bridgeCreated: false,
    dragonlordDefeated: false
  };

  public inventory: Item[] = [];
  public spells: Spell[] = [];

  constructor() {
    this.recalcStats();
  }

  // 능력치 재계산 (힘 + 무기 공격력, 민첩/2 + 방어구 방어력)
  public recalcStats() {
    let weaponPower = this.equipment.weapon?.power || 0;
    let armorPower = this.equipment.armor?.power || 0;
    let shieldPower = this.equipment.shield?.power || 0;

    this.stats.attack = this.stats.strength + weaponPower;
    this.stats.defense = Math.floor(this.stats.agility / 2) + armorPower + shieldPower;

    // 배운 주문 목록 갱신
    this.spells = Object.values(SPELLS).filter(spell => this.stats.level >= spell.minLevel);
  }

  // 경험치 추가 및 레벨업 체크
  public addExp(amount: number): boolean {
    this.stats.exp += amount;
    let leveledUp = false;

    for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
      if (this.stats.exp >= LEVEL_TABLE[i].exp) {
        const targetLevel = i + 1;
        if (targetLevel > this.stats.level) {
          this.stats.level = targetLevel;
          const prevMaxHp = this.stats.maxHp;
          const prevMaxMp = this.stats.maxMp;

          this.stats.maxHp = LEVEL_TABLE[i].hp;
          this.stats.maxMp = LEVEL_TABLE[i].mp;
          this.stats.strength = LEVEL_TABLE[i].strength;
          this.stats.agility = LEVEL_TABLE[i].agility;

          // 레벨업 시 체력/MP 회복
          this.stats.hp += Math.max(0, this.stats.maxHp - prevMaxHp);
          this.stats.mp += Math.max(0, this.stats.maxMp - prevMaxMp);

          this.recalcStats();
          leveledUp = true;
        }
        break;
      }
    }
    return leveledUp;
  }

  public addGold(amount: number) {
    this.stats.gold = Math.min(99999, this.stats.gold + amount);
  }

  // 장비 착용
  public equip(item: Item) {
    if (item.type === 'weapon') this.equipment.weapon = item;
    if (item.type === 'armor') this.equipment.armor = item;
    if (item.type === 'shield') this.equipment.shield = item;
    this.recalcStats();
  }

  // 보물/아이템 획득
  public addItem(item: Item) {
    this.inventory.push(item);

    if (item.id === 'magic_key') this.stats.keys++;
    if (item.id === 'herb') this.stats.herbs++;
    if (item.id === 'torch') this.stats.torches++;

    // 퀘스트 플래그 처리
    if (item.id === 'fairy_flute') this.questFlags.hasFairyFlute = true;
    if (item.id === 'silver_harp') this.questFlags.hasSilverHarp = true;
    if (item.id === 'sun_stone') this.questFlags.hasSunStone = true;
    if (item.id === 'staff_of_rain') this.questFlags.hasStaffOfRain = true;
    if (item.id === 'erdrick_token') this.questFlags.hasErdrickToken = true;
    if (item.id === 'rainbow_drop') this.questFlags.hasRainbowDrop = true;
    if (item.id === 'erdrick_armor') {
      this.questFlags.hasErdrickArmor = true;
      this.equip(item);
    }
    if (item.id === 'erdrick_sword') {
      this.questFlags.hasErdrickSword = true;
      this.equip(item);
    }
  }

  // 이동 걸음 처리 (HP 자동 회복 / 독 늪 데미지)
  public onStep(isSwamp: boolean, isBarrier: boolean) {
    this.walkFrame = (this.walkFrame + 1) % 2;

    const hasErdrickArmor = this.equipment.armor?.id === 'erdrick_armor';

    // 로토의 갑옷 착용 시 걸을 때마다 1 HP 자동 회복 & 독/배리어 무효
    if (hasErdrickArmor) {
      if (this.stats.hp < this.stats.maxHp) {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 1);
      }
      return;
    }

    if (isSwamp) {
      this.stats.hp = Math.max(1, this.stats.hp - 2);
    } else if (isBarrier) {
      this.stats.hp = Math.max(1, this.stats.hp - 15);
    }
  }

  // 여관 휴식 완치
  public restAtInn() {
    this.stats.hp = this.stats.maxHp;
    this.stats.mp = this.stats.maxMp;
  }

  // 치트 / 레벨 부스트
  public boostStats() {
    this.stats.level = 20;
    this.stats.exp = 29000;
    this.stats.maxHp = 160;
    this.stats.hp = 160;
    this.stats.maxMp = 120;
    this.stats.mp = 120;
    this.stats.strength = 120;
    this.stats.agility = 100;
    this.stats.gold = 50000;
    this.stats.keys = 6;
    this.stats.herbs = 6;
    this.equip(ITEMS.flame_sword);
    this.equip(ITEMS.magic_armor);
    this.equip(ITEMS.iron_shield);
    this.recalcStats();
  }

  // 세이브용 직렬화
  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      x: this.x,
      y: this.y,
      dir: this.dir,
      stats: this.stats,
      equipment: {
        weapon: this.equipment.weapon?.id || null,
        armor: this.equipment.armor?.id || null,
        shield: this.equipment.shield?.id || null
      },
      questFlags: this.questFlags,
      inventory: this.inventory.map(i => i.id)
    });
  }

  // 로드용 역직렬화
  public deserialize(jsonStr: string) {
    try {
      const data = JSON.parse(jsonStr);
      this.name = data.name || '로토';
      this.x = data.x ?? 7;
      this.y = data.y ?? 6;
      this.dir = data.dir || 'down';
      this.stats = { ...this.stats, ...data.stats };
      this.questFlags = { ...this.questFlags, ...data.questFlags };

      this.equipment.weapon = data.equipment?.weapon ? ITEMS[data.equipment.weapon] : null;
      this.equipment.armor = data.equipment?.armor ? ITEMS[data.equipment.armor] : null;
      this.equipment.shield = data.equipment?.shield ? ITEMS[data.equipment.shield] : null;

      if (Array.isArray(data.inventory)) {
        this.inventory = data.inventory.map((id: string) => ITEMS[id]).filter(Boolean);
      }
      this.recalcStats();
    } catch (e) {
      console.error('Failed to load hero data:', e);
    }
  }
}
