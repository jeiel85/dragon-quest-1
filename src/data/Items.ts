// 드래곤 퀘스트 1 아이템 및 장비 데이터

import { Item } from '../core/Types';

export const ITEMS: Record<string, Item> = {
  // --- 무기 (Weapons) ---
  bamboo_pole: {
    id: 'bamboo_pole',
    name: '대나무 막대',
    jpName: 'たけのやり',
    price: 10,
    type: 'weapon',
    power: 2,
    description: '가장 저렴한 찌르기용 대나무 막대.'
  },
  club: {
    id: 'club',
    name: '곤봉',
    jpName: 'こんぼう',
    price: 60,
    type: 'weapon',
    power: 4,
    description: '단단한 참나무로 깎아 만든 곤봉.'
  },
  copper_sword: {
    id: 'copper_sword',
    name: '구리검',
    jpName: 'どうのつるぎ',
    price: 180,
    type: 'weapon',
    power: 10,
    description: '구리로 벼려낸 기본 검.'
  },
  iron_axe: {
    id: 'iron_axe',
    name: '철도끼',
    jpName: 'てつのオノ',
    price: 560,
    type: 'weapon',
    power: 15,
    description: '묵직한 위력을 자랑하는 강철제 손도끼.'
  },
  steel_sword: {
    id: 'steel_sword',
    name: '강철검',
    jpName: 'はがねのつるぎ',
    price: 1500,
    type: 'weapon',
    power: 20,
    description: '예리한 강철로 벼려낸 정예 기사용 검.'
  },
  flame_sword: {
    id: 'flame_sword',
    name: '화염의 검',
    jpName: 'ほのおのつるぎ',
    price: 9800,
    type: 'weapon',
    power: 28,
    description: '타오르는 불꽃의 마력을 품은 명검.'
  },
  erdrick_sword: {
    id: 'erdrick_sword',
    name: '로토의 검',
    jpName: 'ロトのつるぎ',
    price: 0,
    type: 'weapon',
    power: 40,
    description: '전설의 용사 로토가 마왕을 물리칠 때 사용한 신성한 대검.'
  },

  // --- 갑옷 (Armor) ---
  clothes: {
    id: 'clothes',
    name: '천옷',
    jpName: 'ぬののふく',
    price: 20,
    type: 'armor',
    power: 2,
    description: '질긴 천으로 지은 소박한 옷.'
  },
  leather_armor: {
    id: 'leather_armor',
    name: '가죽 갑옷',
    jpName: 'かわのよろい',
    price: 70,
    type: 'armor',
    power: 4,
    description: '무두질한 짐승 가죽으로 만든 가벼운 갑옷.'
  },
  chain_mail: {
    id: 'chain_mail',
    name: '사슬 갑옷',
    jpName: 'くさりかたびら',
    price: 300,
    type: 'armor',
    power: 10,
    description: '강철 고리를 엮어 만든 방호 갑옷.'
  },
  iron_armor: {
    id: 'iron_armor',
    name: '철갑옷',
    jpName: 'てつのよろい',
    price: 1000,
    type: 'armor',
    power: 16,
    description: '단단한 철판을 이어 붙인 기사용 흉갑.'
  },
  magic_armor: {
    id: 'magic_armor',
    name: '마법 갑옷',
    jpName: 'まほうのよろい',
    price: 7700,
    type: 'armor',
    power: 24,
    description: '마법 방어력을 지니며 이동 시 조금씩 체력을 회복합니다.'
  },
  erdrick_armor: {
    id: 'erdrick_armor',
    name: '로토의 갑옷',
    jpName: 'ロトのよろい',
    price: 0,
    type: 'armor',
    power: 28,
    description: '전설의 로토 갑옷. 독 늪지와 마법 장벽을 완전히 무효화하며 걸을 때마다 HP가 치유됩니다.'
  },

  // --- 방패 (Shields) ---
  leather_shield: {
    id: 'leather_shield',
    name: '가죽 방패',
    jpName: 'かわのたて',
    price: 90,
    type: 'shield',
    power: 4,
    description: '가죽을 씌운 작은 원형 방패.'
  },
  iron_shield: {
    id: 'iron_shield',
    name: '철 방패',
    jpName: 'てつのたて',
    price: 800,
    type: 'shield',
    power: 10,
    description: '철로 견고하게 제작된 방패.'
  },
  silver_shield: {
    id: 'silver_shield',
    name: '미키의 은방패',
    jpName: 'みかがみのたて',
    price: 14800,
    type: 'shield',
    power: 20,
    description: '마물들의 공격을 거울처럼 튕겨내는 전설의 은방패.'
  },

  // --- 소모품 (Consumables) ---
  herb: {
    id: 'herb',
    name: '약초',
    jpName: 'やくそう',
    price: 24,
    type: 'consumable',
    effect: 'heal',
    power: 25,
    description: '지친 몸의 체력을 약 25 회복시키는 신비한 약초.'
  },
  torch: {
    id: 'torch',
    name: '횃불',
    jpName: 'たいまつ',
    price: 8,
    type: 'consumable',
    effect: 'torch',
    description: '어두운 동굴을 비추는 횃불.'
  },
  magic_key: {
    id: 'magic_key',
    name: '마법의 열쇠',
    jpName: 'まほうのかぎ',
    price: 26,
    type: 'consumable',
    effect: 'key',
    description: '닫힌 성문과 마을의 문을 여는 신비한 열쇠.'
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: '용의 비늘',
    jpName: 'りゅうのうろこ',
    price: 20,
    type: 'consumable',
    effect: 'scale',
    power: 2,
    description: '방어력을 영구히 2 상승시키는 용의 비늘 장신구.'
  },
  wing: {
    id: 'wing',
    name: '키메라의 날개',
    jpName: 'キメラのつばさ',
    price: 70,
    type: 'consumable',
    effect: 'wing',
    description: '탄타겔 성으로 순식간에 날아가는 마법의 깃털.'
  },

  // --- 퀘스트 중요 아이템 (Key Quest Items) ---
  fairy_flute: {
    id: 'fairy_flute',
    name: '요정의 피리',
    jpName: 'ようせいのふえ',
    price: 0,
    type: 'quest',
    description: '마이라 온천 남쪽 나무 밑에 묻혀있던 피리. 거대 골렘을 깊은 잠에 빠뜨립니다.'
  },
  silver_harp: {
    id: 'silver_harp',
    name: '은피리 (은의 하프)',
    jpName: 'ぎんのタテグト',
    price: 0,
    type: 'quest',
    description: '시인 가라이의 묘지에 잠들어 있던 신비한 음색의 하프.'
  },
  sun_stone: {
    id: 'sun_stone',
    name: '태양의 돌',
    jpName: 'たいようのいし',
    price: 0,
    type: 'quest',
    description: '태양의 빛을 영원히 머금은 성물. 탄타겔 성 지하 보물고에 안치되어 있습니다.'
  },
  staff_of_rain: {
    id: 'staff_of_rain',
    name: '비구름의 지팡이',
    jpName: 'あまぐものつえ',
    price: 0,
    type: 'quest',
    description: '비구름을 부르는 신비한 지팡이. 북서쪽 외딴 사당의 현자가 수호하고 있습니다.'
  },
  erdrick_token: {
    id: 'erdrick_token',
    name: '로토의 증표',
    jpName: 'ロトのしるし',
    price: 0,
    type: 'quest',
    description: '진정한 용사의 혈통임을 증명하는 로토의 문장이 새겨진 증표.'
  },
  rainbow_drop: {
    id: 'rainbow_drop',
    name: '무지개의 물방울',
    jpName: 'にじのしずく',
    price: 0,
    type: 'quest',
    description: '태양의 돌과 비구름의 지팡이를 결합해 빚어낸 성물. 류오의 성 앞에 무지개 다리를 놓습니다.'
  },
  princess_love: {
    id: 'princess_love',
    name: '공주의 사랑',
    jpName: 'おうじょのあい',
    price: 0,
    type: 'quest',
    description: '구출된 로라 공주가 용사에게 바친 사랑의 징표.'
  }
};
