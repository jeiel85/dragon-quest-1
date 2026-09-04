// 드래곤 퀘스트 1 몬스터 데이터베이스

import { Monster } from '../core/Types';

export const MONSTERS: Record<string, Monster> = {
  slime: {
    id: 'slime',
    name: '슬라임',
    jpName: 'スライム',
    hp: 4,
    maxHp: 4,
    attack: 5,
    defense: 3,
    agility: 15,
    exp: 1,
    gold: 2,
    spriteIndex: 0,
    dodgeRate: 0.05,
    actions: [{ type: 'attack', rate: 1.0 }]
  },
  red_slime: {
    id: 'red_slime',
    name: '레드 슬라임',
    jpName: 'スライムベス',
    hp: 6,
    maxHp: 6,
    attack: 7,
    defense: 4,
    agility: 18,
    exp: 2,
    gold: 4,
    spriteIndex: 1,
    dodgeRate: 0.05,
    actions: [{ type: 'attack', rate: 1.0 }]
  },
  dracky: {
    id: 'dracky',
    name: '드라키',
    jpName: 'ドラキー',
    hp: 8,
    maxHp: 8,
    attack: 9,
    defense: 6,
    agility: 22,
    exp: 3,
    gold: 6,
    spriteIndex: 2,
    dodgeRate: 0.1,
    actions: [{ type: 'attack', rate: 1.0 }]
  },
  ghost: {
    id: 'ghost',
    name: '고스트',
    jpName: 'ゴースト',
    hp: 11,
    maxHp: 11,
    attack: 11,
    defense: 8,
    agility: 25,
    exp: 4,
    gold: 8,
    spriteIndex: 3,
    dodgeRate: 0.15,
    actions: [{ type: 'attack', rate: 1.0 }]
  },
  magician: {
    id: 'magician',
    name: '마도사',
    jpName: 'まほうつかい',
    hp: 15,
    maxHp: 15,
    attack: 13,
    defense: 12,
    agility: 20,
    exp: 8,
    gold: 16,
    spriteIndex: 4,
    dodgeRate: 0.08,
    actions: [
      { type: 'attack', rate: 0.5 },
      { type: 'spell', spellId: 'hurt', rate: 0.5 }
    ]
  },
  metal_slime: {
    id: 'metal_slime',
    name: '메탈 슬라임',
    jpName: 'メタルスライム',
    hp: 4,
    maxHp: 4,
    attack: 10,
    defense: 255,
    agility: 120,
    exp: 115,
    gold: 15,
    spriteIndex: 5,
    dodgeRate: 0.4,
    actions: [
      { type: 'run', rate: 0.6 },
      { type: 'attack', rate: 0.2 },
      { type: 'spell', spellId: 'hurt', rate: 0.2 }
    ]
  },
  skeleton: {
    id: 'skeleton',
    name: '스켈레톤',
    jpName: 'がいこつ',
    hp: 30,
    maxHp: 30,
    attack: 28,
    defense: 22,
    agility: 32,
    exp: 25,
    gold: 42,
    spriteIndex: 6,
    dodgeRate: 0.1,
    actions: [{ type: 'attack', rate: 1.0 }]
  },
  chimera: {
    id: 'chimera',
    name: '키메라',
    jpName: 'キメラ',
    hp: 45,
    maxHp: 45,
    attack: 42,
    defense: 35,
    agility: 45,
    exp: 48,
    gold: 60,
    spriteIndex: 7,
    dodgeRate: 0.12,
    actions: [
      { type: 'attack', rate: 0.7 },
      { type: 'breathe', rate: 0.3 }
    ]
  },
  killer_armor: {
    id: 'killer_armor',
    name: '킬러 아머',
    jpName: 'よろいのきし',
    hp: 65,
    maxHp: 65,
    attack: 58,
    defense: 48,
    agility: 40,
    exp: 78,
    gold: 95,
    spriteIndex: 8,
    dodgeRate: 0.08,
    actions: [
      { type: 'attack', rate: 0.75 },
      { type: 'spell', spellId: 'heal', rate: 0.25 }
    ]
  },
  golem: {
    id: 'golem',
    name: '골렘',
    jpName: 'ゴーレム',
    hp: 140,
    maxHp: 140,
    attack: 115,
    defense: 60,
    agility: 40,
    exp: 250,
    gold: 500,
    spriteIndex: 9,
    dodgeRate: 0.05,
    isBoss: true,
    actions: [{ type: 'attack', rate: 1.0 }]
  },
  green_dragon: {
    id: 'green_dragon',
    name: '그린 드래곤',
    jpName: 'ドラゴン',
    hp: 155,
    maxHp: 155,
    attack: 90,
    defense: 75,
    agility: 48,
    exp: 380,
    gold: 600,
    spriteIndex: 10,
    dodgeRate: 0.08,
    isBoss: true,
    actions: [
      { type: 'attack', rate: 0.6 },
      { type: 'breathe', rate: 0.4 } // 화염 브레스
    ]
  },
  dragonlord_1: {
    id: 'dragonlord_1',
    name: '용왕 (마왕)',
    jpName: 'りゅうおう',
    hp: 160,
    maxHp: 160,
    attack: 110,
    defense: 80,
    agility: 65,
    exp: 0,
    gold: 0,
    spriteIndex: 11,
    dodgeRate: 0.1,
    isBoss: true,
    actions: [
      { type: 'attack', rate: 0.4 },
      { type: 'spell', spellId: 'hurtmore', rate: 0.4 },
      { type: 'spell', spellId: 'stopspell', rate: 0.2 }
    ]
  },
  dragonlord_2: {
    id: 'dragonlord_2',
    name: '진 용왕 (Dragonlord)',
    jpName: 'りゅうおう (竜形態)',
    hp: 240,
    maxHp: 240,
    attack: 145,
    defense: 100,
    agility: 80,
    exp: 5000,
    gold: 5000,
    spriteIndex: 12,
    dodgeRate: 0.1,
    isBoss: true,
    actions: [
      { type: 'attack', rate: 0.5 },
      { type: 'breathe', rate: 0.35 }, // 맹렬한 작열 화염
      { type: 'spell', spellId: 'hurtmore', rate: 0.15 }
    ]
  }
};

// 지역별 인카운터 몬스터 테이블
export const ENCOUNTER_TABLES: Record<string, string[]> = {
  near_tantegel: ['slime', 'red_slime'],
  mid_field: ['red_slime', 'dracky', 'ghost'],
  forest_mountains: ['dracky', 'ghost', 'magician', 'metal_slime'],
  swamp_field: ['skeleton', 'chimera', 'killer_armor'],
  charlock_area: ['chimera', 'killer_armor', 'green_dragon']
};
