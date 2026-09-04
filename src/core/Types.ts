// 드래곤 퀘스트 1 데이터 타입 및 인터페이스 정의

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameScene = 
  | 'TITLE'
  | 'INTRO_DIALOG'
  | 'FIELD'
  | 'BATTLE'
  | 'DIALOG'
  | 'MENU'
  | 'SHOP'
  | 'INN'
  | 'GAME_OVER'
  | 'ENDING';

export type MapType = 
  | 'OVERWORLD'
  | 'TANTEGEL_THRONE'
  | 'TANTEGEL_1F'
  | 'BRECCONARY'
  | 'GARINHAM'
  | 'KOL'
  | 'RIMULDAR'
  | 'CANTLIN'
  | 'SWAMP_CAVE'
  | 'ERDRICK_CAVE'
  | 'CHARLOCK_CASTLE'
  | 'HOLY_SHRINE';

export enum TileType {
  GRASS = 0,
  TREE = 1,
  MOUNTAIN = 2,
  WATER = 3,
  DESERT = 4,
  SWAMP = 5,       // 독 늪 (데미지 타일)
  BRIDGE = 6,
  TOWN = 7,
  CASTLE = 8,
  CAVE = 9,
  STAIRS_UP = 10,
  STAIRS_DOWN = 11,
  STONE_FLOOR = 12,
  BRICK_WALL = 13,
  DOOR = 14,
  CHEST = 15,
  BARRIER = 16,     // 마법 장벽 (강한 데미지 타일)
  SHRINE = 17,
  SHOP_COUNTER = 18,
  COAST = 19,
  VOID = 20
}

export interface Position {
  x: number;
  y: number;
}

export interface Spell {
  id: string;
  name: string;
  jpName: string;
  mpCost: number;
  minLevel: number;
  type: 'heal' | 'attack' | 'utility' | 'sleep';
  power?: number;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  jpName: string;
  price: number;
  type: 'weapon' | 'armor' | 'shield' | 'consumable' | 'quest';
  power?: number; // 공격력 or 방어력
  effect?: string;
  description: string;
}

export interface MonsterAction {
  type: 'attack' | 'spell' | 'breathe' | 'sleep' | 'run';
  spellId?: string;
  rate: number; // 0 ~ 1
}

export interface Monster {
  id: string;
  name: string;
  jpName: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  agility: number;
  exp: number;
  gold: number;
  spriteIndex: number;
  dodgeRate: number;
  actions: MonsterAction[];
  isBoss?: boolean;
}

export interface HeroEquipment {
  weapon: Item | null;
  armor: Item | null;
  shield: Item | null;
}

export interface HeroStats {
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  agility: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  keys: number;
  herbs: number;
  torches: number;
}

export interface QuestFlags {
  talkedToKing: boolean;
  rescuedPrincess: boolean;
  dragonDefeated: boolean;
  golemDefeated: boolean;
  hasFairyFlute: boolean;
  hasSilverHarp: boolean;
  hasSunStone: boolean;
  hasStaffOfRain: boolean;
  hasErdrickToken: boolean;
  hasRainbowDrop: boolean;
  hasErdrickArmor: boolean;
  hasErdrickSword: boolean;
  bridgeCreated: boolean;
  dragonlordDefeated: boolean;
}

export interface NPCData {
  id: string;
  name: string;
  x: number;
  y: number;
  dir: Direction;
  spriteIndex: number;
  map: MapType;
  dialog: string[];
  action?: 'shop' | 'inn' | 'key' | 'king' | 'princess' | 'golem' | 'dragonlord';
}

export interface WarpData {
  x: number;
  y: number;
  targetMap: MapType;
  targetX: number;
  targetY: number;
  targetDir?: Direction;
  requiresKey?: boolean;
}

export interface ChestData {
  id: string;
  map: MapType;
  x: number;
  y: number;
  item?: string;
  gold?: number;
  opened: boolean;
}
