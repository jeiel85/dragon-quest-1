// 드래곤 퀘스트 1 마법/주문(Spells) 데이터

import { Spell } from '../core/Types';

export const SPELLS: Record<string, Spell> = {
  heal: {
    id: 'heal',
    name: '호이미 (Heal)',
    jpName: 'ホイミ',
    mpCost: 3,
    minLevel: 3,
    type: 'heal',
    power: 17, // HP 약 10~17 회복
    description: '체력을 약 17 회복합니다.'
  },
  hurt: {
    id: 'hurt',
    name: '기라 (Hurt)',
    jpName: 'ギラ',
    mpCost: 2,
    minLevel: 4,
    type: 'attack',
    power: 12, // 약 9~14 데미지
    description: '적에게 화염을 발사하여 약 12의 데미지를 입힙니다.'
  },
  sleep: {
    id: 'sleep',
    name: '라리호 (Sleep)',
    jpName: 'ラリホー',
    mpCost: 2,
    minLevel: 7,
    type: 'sleep',
    description: '적을 깊은 잠에 빠뜨려 행동 불능으로 만듭니다.'
  },
  radiant: {
    id: 'radiant',
    name: '레미라 (Radiant)',
    jpName: 'レミラ',
    mpCost: 2,
    minLevel: 9,
    type: 'utility',
    description: '던전 안을 밝게 비춥니다.'
  },
  stopspell: {
    id: 'stopspell',
    name: '마호톤 (StopSpell)',
    jpName: 'マホトーン',
    mpCost: 2,
    minLevel: 10,
    type: 'utility',
    description: '적의 마법 영창을 봉쇄합니다.'
  },
  outside: {
    id: 'outside',
    name: '리레미트 (Outside)',
    jpName: 'リレミト',
    mpCost: 6,
    minLevel: 12,
    type: 'utility',
    description: '던전에서 즉시 탈출하여 지상으로 나옵니다.'
  },
  return: {
    id: 'return',
    name: '루라 (Return)',
    jpName: 'ルーラ',
    mpCost: 8,
    minLevel: 13,
    type: 'utility',
    description: '탄타겔 성으로 즉시 공간 이동합니다.'
  },
  repel: {
    id: 'repel',
    name: '토헤로스 (Repel)',
    jpName: 'トヘロス',
    mpCost: 2,
    minLevel: 15,
    type: 'utility',
    description: '약한 몬스터의 습격을 방지합니다.'
  },
  healmore: {
    id: 'healmore',
    name: '베호이마 (Healmore)',
    jpName: 'ベホイミ',
    mpCost: 8,
    minLevel: 17,
    type: 'heal',
    power: 90, // HP 약 85~100 회복
    description: '체력을 대량(약 90) 회복합니다.'
  },
  hurtmore: {
    id: 'hurtmore',
    name: '베기라마 (Hurtmore)',
    jpName: 'ベギラマ',
    mpCost: 5,
    minLevel: 19,
    type: 'attack',
    power: 65, // 약 58~72 데미지
    description: '강력한 작열 화염으로 적에게 대폭 데미지를 줍니다.'
  }
};
