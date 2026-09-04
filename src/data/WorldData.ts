// 드래곤 퀘스트 1 알레프갈드 월드, 성, 마을, 던전 맵 데이터

import { MapType, TileType, WarpData, NPCData, ChestData } from '../core/Types';

export interface GameMap {
  id: MapType;
  name: string;
  jpName: string;
  width: number;
  height: number;
  tiles: TileType[][];
  bgm: 'TITLE' | 'CASTLE' | 'OVERWORLD' | 'TOWN' | 'DUNGEON' | 'BATTLE' | 'BOSS' | 'ENDING';
  isDungeon?: boolean;
  warps: WarpData[];
  npcs: NPCData[];
  chests: ChestData[];
  encounterZone?: string;
}

// 헬퍼: 2D 타일 배열 생성
function createMapTiles(w: number, h: number, defaultTile: TileType): TileType[][] {
  const map: TileType[][] = [];
  for (let y = 0; y < h; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < w; x++) {
      row.push(defaultTile);
    }
    map.push(row);
  }
  return map;
}

// --- 1. 탄타겔 성 왕좌 (Tantegel Throne Room - 16x16) ---
function getTantegelThrone(): GameMap {
  const w = 16;
  const h = 16;
  const tiles = createMapTiles(w, h, TileType.STONE_FLOOR);

  // 외벽
  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.BRICK_WALL;
    tiles[h - 1][x] = TileType.BRICK_WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.BRICK_WALL;
    tiles[y][w - 1] = TileType.BRICK_WALL;
  }

  // 왕좌 융단 & 통로
  for (let y = 3; y <= 9; y++) {
    tiles[y][7] = TileType.STONE_FLOOR;
    tiles[y][8] = TileType.STONE_FLOOR;
  }

  // 보물 창고 방
  for (let x = 11; x <= 14; x++) {
    tiles[2][x] = TileType.BRICK_WALL;
    tiles[6][x] = TileType.BRICK_WALL;
  }
  tiles[3][11] = TileType.BRICK_WALL;
  tiles[4][11] = TileType.BRICK_WALL;
  tiles[5][11] = TileType.DOOR;

  // 보물상자
  tiles[3][13] = TileType.CHEST;
  tiles[4][13] = TileType.CHEST;
  tiles[5][13] = TileType.CHEST;

  // 계단 (1층으로 내려가는 계단)
  tiles[13][13] = TileType.STAIRS_DOWN;

  // 문
  tiles[14][7] = TileType.DOOR;
  tiles[14][8] = TileType.DOOR;

  return {
    id: 'TANTEGEL_THRONE',
    name: '탄타겔 성 왕좌',
    jpName: 'ラダトーム城 2F',
    width: w,
    height: h,
    tiles,
    bgm: 'CASTLE',
    warps: [
      { x: 13, y: 13, targetMap: 'TANTEGEL_1F', targetX: 13, targetY: 12 }
    ],
    npcs: [
      {
        id: 'king',
        name: '로파 대왕',
        x: 7,
        y: 3,
        dir: 'down',
        spriteIndex: 0,
        map: 'TANTEGEL_THRONE',
        action: 'king',
        dialog: [
          '오오, 전설의 용사 로토의 후예여! 그대를 애타게 기다리고 있었노라.',
          '사악한 마왕 용왕이 나타나 우리 왕국을 위협하고, 성스러운 빛의 구슬을 빼앗아갔느니라.',
          '게다가 사랑하는 나의 딸 로라 공주마저 마물들에게 납치당하고 말았도다...',
          '용사여, 이 성의 보물상자에서 군자금과 열쇠를 챙겨 떠나거라! 세상에 평화를 되찾아다오!'
        ]
      },
      {
        id: 'guard_1',
        name: '근위병',
        x: 5,
        y: 5,
        dir: 'right',
        spriteIndex: 1,
        map: 'TANTEGEL_THRONE',
        dialog: ['용왕을 쓰러뜨리기 위해서는 전설의 무기와 세 가지 신기가 필요하다고 합니다.']
      },
      {
        id: 'guard_2',
        name: '근위병',
        x: 10,
        y: 5,
        dir: 'left',
        spriteIndex: 1,
        map: 'TANTEGEL_THRONE',
        dialog: ['성 바로 동쪽에 라다톰 마을이 있습니다. 먼저 그곳에서 장비를 정비하십시오!']
      }
    ],
    chests: [
      { id: 'tantegel_gold', map: 'TANTEGEL_THRONE', x: 13, y: 3, gold: 120, opened: false },
      { id: 'tantegel_torch', map: 'TANTEGEL_THRONE', x: 13, y: 4, item: 'torch', opened: false },
      { id: 'tantegel_key', map: 'TANTEGEL_THRONE', x: 13, y: 5, item: 'magic_key', opened: false }
    ]
  };
}

// --- 2. 탄타겔 성 1층 (Tantegel Castle 1F - 20x20) ---
function getTantegel1F(): GameMap {
  const w = 20;
  const h = 20;
  const tiles = createMapTiles(w, h, TileType.STONE_FLOOR);

  // 성벽
  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.BRICK_WALL;
    tiles[h - 1][x] = TileType.BRICK_WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.BRICK_WALL;
    tiles[y][w - 1] = TileType.BRICK_WALL;
  }

  // 왕좌로 올라가는 계단
  tiles[13][13] = TileType.STAIRS_UP;

  // 성 지하 보물고 방 (태양의 돌 안치)
  for (let x = 2; x <= 6; x++) {
    tiles[2][x] = TileType.BRICK_WALL;
    tiles[6][x] = TileType.BRICK_WALL;
  }
  tiles[3][6] = TileType.BRICK_WALL;
  tiles[4][6] = TileType.DOOR;
  tiles[5][6] = TileType.BRICK_WALL;
  tiles[4][3] = TileType.CHEST; // 태양의 돌

  // 성문 출구 (남쪽)
  tiles[h - 1][9] = TileType.STONE_FLOOR;
  tiles[h - 1][10] = TileType.STONE_FLOOR;

  return {
    id: 'TANTEGEL_1F',
    name: '탄타겔 성 1층',
    jpName: 'ラダトーム城 1F',
    width: w,
    height: h,
    tiles,
    bgm: 'CASTLE',
    warps: [
      { x: 13, y: 13, targetMap: 'TANTEGEL_THRONE', targetX: 13, targetY: 12 },
      { x: 9, y: 19, targetMap: 'OVERWORLD', targetX: 25, targetY: 27 },
      { x: 10, y: 19, targetMap: 'OVERWORLD', targetX: 25, targetY: 27 }
    ],
    npcs: [
      {
        id: 'guard_gate',
        name: '성문 수문장',
        x: 8,
        y: 17,
        dir: 'right',
        spriteIndex: 1,
        map: 'TANTEGEL_1F',
        dialog: ['용사님이시여, 무운을 빕니다! 언제든 지치시면 성으로 돌아오십시오.']
      },
      {
        id: 'sage_sunstone',
        name: '비밀 수호자',
        x: 4,
        y: 8,
        dir: 'down',
        spriteIndex: 4,
        map: 'TANTEGEL_1F',
        dialog: ['지하 깊은 방에 전설의 성물 [태양의 돌]이 잠들어 있습니다. 문을 열 마법의 열쇠가 필요합니다.']
      }
    ],
    chests: [
      { id: 'sun_stone_chest', map: 'TANTEGEL_1F', x: 3, y: 4, item: 'sun_stone', opened: false }
    ]
  };
}

// --- 3. 라다톰 마을 (Brecconary - 20x20) ---
function getBrecconary(): GameMap {
  const w = 20;
  const h = 20;
  const tiles = createMapTiles(w, h, TileType.GRASS);

  // 울타리 및 경계
  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.TREE;
    tiles[h - 1][x] = TileType.TREE;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.TREE;
    tiles[y][w - 1] = TileType.TREE;
  }

  // 출구 (서쪽 및 남쪽)
  tiles[0][9] = TileType.STONE_FLOOR;
  tiles[0][10] = TileType.STONE_FLOOR;
  tiles[h - 1][9] = TileType.STONE_FLOOR;
  tiles[h - 1][10] = TileType.STONE_FLOOR;
  tiles[10][0] = TileType.STONE_FLOOR;

  // 여관 (Inn) 건물 (북서쪽)
  for (let x = 2; x <= 7; x++) {
    tiles[2][x] = TileType.BRICK_WALL;
    tiles[6][x] = TileType.BRICK_WALL;
  }
  for (let y = 2; y <= 6; y++) {
    tiles[y][2] = TileType.BRICK_WALL;
    tiles[y][7] = TileType.BRICK_WALL;
  }
  for (let y = 3; y <= 5; y++) {
    for (let x = 3; x <= 6; x++) {
      tiles[y][x] = TileType.STONE_FLOOR;
    }
  }
  tiles[6][5] = TileType.STONE_FLOOR; // 입구
  tiles[4][4] = TileType.SHOP_COUNTER;

  // 무기점 (Weapons) 건물 (북동쪽)
  for (let x = 12; x <= 17; x++) {
    tiles[2][x] = TileType.BRICK_WALL;
    tiles[6][x] = TileType.BRICK_WALL;
  }
  for (let y = 2; y <= 6; y++) {
    tiles[y][12] = TileType.BRICK_WALL;
    tiles[y][17] = TileType.BRICK_WALL;
  }
  for (let y = 3; y <= 5; y++) {
    for (let x = 13; x <= 16; x++) {
      tiles[y][x] = TileType.STONE_FLOOR;
    }
  }
  tiles[6][14] = TileType.STONE_FLOOR;
  tiles[4][15] = TileType.SHOP_COUNTER;

  // 열쇠 상인 건물 (남동쪽)
  for (let x = 12; x <= 17; x++) {
    tiles[12][x] = TileType.BRICK_WALL;
    tiles[16][x] = TileType.BRICK_WALL;
  }
  for (let y = 12; y <= 16; y++) {
    tiles[y][12] = TileType.BRICK_WALL;
    tiles[y][17] = TileType.BRICK_WALL;
  }
  for (let y = 13; y <= 15; y++) {
    for (let x = 13; x <= 16; x++) {
      tiles[y][x] = TileType.STONE_FLOOR;
    }
  }
  tiles[12][14] = TileType.DOOR;
  tiles[14][15] = TileType.SHOP_COUNTER;

  return {
    id: 'BRECCONARY',
    name: '라다톰 마을',
    jpName: 'ラダトームの町',
    width: w,
    height: h,
    tiles,
    bgm: 'TOWN',
    warps: [
      { x: 9, y: 0, targetMap: 'OVERWORLD', targetX: 27, targetY: 25 },
      { x: 10, y: 0, targetMap: 'OVERWORLD', targetX: 27, targetY: 25 },
      { x: 9, y: 19, targetMap: 'OVERWORLD', targetX: 27, targetY: 27 },
      { x: 10, y: 19, targetMap: 'OVERWORLD', targetX: 27, targetY: 27 },
      { x: 0, y: 10, targetMap: 'OVERWORLD', targetX: 26, targetY: 26 }
    ],
    npcs: [
      {
        id: 'inn_keeper',
        name: '여관 주인',
        x: 4,
        y: 3,
        dir: 'down',
        spriteIndex: 2,
        map: 'BRECCONARY',
        action: 'inn',
        dialog: ['어서 오십시오! 라다톰 여관입니다. 하룻밤 6골드에 푹 쉬실 수 있습니다.']
      },
      {
        id: 'weapon_merchant',
        name: '무기 상인',
        x: 15,
        y: 3,
        dir: 'down',
        spriteIndex: 2,
        map: 'BRECCONARY',
        action: 'shop',
        dialog: ['강력한 검과 갑옷으로 무장해야 마물들을 이길 수 있습니다!']
      },
      {
        id: 'key_merchant',
        name: '열쇠 장인',
        x: 15,
        y: 13,
        dir: 'down',
        spriteIndex: 4,
        map: 'BRECCONARY',
        action: 'key',
        dialog: ['문이 있는 곳엔 마법의 열쇠가 필수요! 하나에 26골드에 드리리다.']
      },
      {
        id: 'villager_girl',
        name: '마을 소녀',
        x: 9,
        y: 9,
        dir: 'right',
        spriteIndex: 3,
        map: 'BRECCONARY',
        dialog: ['북쪽 바다 건너 마이라 마을 온천에는 신비한 요정의 피리가 숨겨져 있대요!']
      }
    ],
    chests: []
  };
}

// --- 4. 마이라 마을 (Kol - 온천 마을, 요정의 피리) ---
function getKol(): GameMap {
  const w = 18;
  const h = 18;
  const tiles = createMapTiles(w, h, TileType.GRASS);

  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.TREE;
    tiles[h - 1][x] = TileType.TREE;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.TREE;
    tiles[y][w - 1] = TileType.TREE;
  }

  // 출구 (남쪽)
  tiles[h - 1][9] = TileType.STONE_FLOOR;

  // 온천 호수 (중앙 북쪽)
  for (let y = 3; y <= 6; y++) {
    for (let x = 7; x <= 11; x++) {
      tiles[y][x] = TileType.WATER;
    }
  }

  // 여관
  for (let x = 2; x <= 6; x++) {
    tiles[9][x] = TileType.BRICK_WALL;
    tiles[13][x] = TileType.BRICK_WALL;
  }
  for (let y = 9; y <= 13; y++) {
    tiles[y][2] = TileType.BRICK_WALL;
    tiles[y][6] = TileType.BRICK_WALL;
  }
  tiles[13][4] = TileType.STONE_FLOOR;
  tiles[11][3] = TileType.SHOP_COUNTER;

  // 요정의 피리 상자 (온천 남쪽 나무 아래: x:9, y:8)
  tiles[8][9] = TileType.CHEST;

  return {
    id: 'KOL',
    name: '마이라 마을',
    jpName: 'マイラの村',
    width: w,
    height: h,
    tiles,
    bgm: 'TOWN',
    warps: [
      { x: 9, y: 17, targetMap: 'OVERWORLD', targetX: 42, targetY: 12 }
    ],
    npcs: [
      {
        id: 'kol_inn',
        name: '마이라 여관',
        x: 3,
        y: 10,
        dir: 'down',
        spriteIndex: 3,
        map: 'KOL',
        action: 'inn',
        dialog: ['온천의 마을 마이라에 오신 걸 환영합니다! 여관비는 12골드입니다.']
      },
      {
        id: 'kol_old_man',
        name: '노인',
        x: 13,
        y: 8,
        dir: 'left',
        spriteIndex: 4,
        map: 'KOL',
        dialog: ['온천 남쪽 땅속에 잠든 [요정의 피리]를 불면, 거대한 골렘도 스르륵 잠이 든다오.']
      }
    ],
    chests: [
      { id: 'fairy_flute_chest', map: 'KOL', x: 9, y: 8, item: 'fairy_flute', opened: false }
    ]
  };
}

// --- 5. 늪지의 동굴 (Swamp Cave - 그린 드래곤 보스전 & 로라 공주 구출) ---
function getSwampCave(): GameMap {
  const w = 18;
  const h = 24;
  const tiles = createMapTiles(w, h, TileType.STONE_FLOOR);

  // 벽면
  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.BRICK_WALL;
    tiles[h - 1][x] = TileType.BRICK_WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.BRICK_WALL;
    tiles[y][w - 1] = TileType.BRICK_WALL;
  }

  // 동굴 미로 벽
  for (let y = 4; y <= 18; y++) {
    tiles[y][6] = TileType.BRICK_WALL;
    tiles[y][12] = TileType.BRICK_WALL;
  }
  tiles[10][6] = TileType.STONE_FLOOR; // 통로
  tiles[16][12] = TileType.STONE_FLOOR;

  // 감옥 방 (동쪽)
  tiles[8][15] = TileType.DOOR;

  // 북쪽 출구 및 남쪽 출구 계단
  tiles[2][2] = TileType.STAIRS_UP;
  tiles[21][2] = TileType.STAIRS_DOWN;

  return {
    id: 'SWAMP_CAVE',
    name: '늪지의 동굴 (공주의 감옥)',
    jpName: '沼地の洞窟',
    width: w,
    height: h,
    tiles,
    bgm: 'DUNGEON',
    isDungeon: true,
    warps: [
      { x: 2, y: 2, targetMap: 'OVERWORLD', targetX: 30, targetY: 30 },
      { x: 2, y: 21, targetMap: 'OVERWORLD', targetX: 30, targetY: 34 }
    ],
    npcs: [
      {
        id: 'dragon_boss',
        name: '그린 드래곤 (수호 마수)',
        x: 15,
        y: 10,
        dir: 'down',
        spriteIndex: 1,
        map: 'SWAMP_CAVE',
        action: 'dragonlord',
        dialog: ['크롸아아아! 감히 로라 공주에게 접근하려는 놈은 모조리 잿더미로 만들어주마!']
      },
      {
        id: 'princess_gwaelin',
        name: '로라 공주',
        x: 15,
        y: 7,
        dir: 'down',
        spriteIndex: 5,
        map: 'SWAMP_CAVE',
        action: 'princess',
        dialog: [
          '아아...! 당신이 바로 아바마마께서 말씀하신 용사님이시군요!',
          '무서운 드래곤을 물리치고 저를 구해주셔서 진심으로 감사드립니다.',
          '이 [공주의 사랑]을 받아주세요. 어디에 계시든 제 마음은 항상 당신 곁에 있을 거예요!'
        ]
      }
    ],
    chests: []
  };
}

// --- 6. 메르키드 요새 (Cantlin - 거대 골렘 수호) ---
function getCantlin(): GameMap {
  const w = 22;
  const h = 22;
  const tiles = createMapTiles(w, h, TileType.STONE_FLOOR);

  // 견고한 성벽
  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.BRICK_WALL;
    tiles[h - 1][x] = TileType.BRICK_WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.BRICK_WALL;
    tiles[y][w - 1] = TileType.BRICK_WALL;
  }

  // 성문 (남쪽)
  tiles[h - 1][10] = TileType.STONE_FLOOR;
  tiles[h - 1][11] = TileType.STONE_FLOOR;

  // 최고급 무기점 (화염의 검, 미키의 은방패 판매)
  for (let x = 14; x <= 19; x++) {
    tiles[4][x] = TileType.BRICK_WALL;
    tiles[8][x] = TileType.BRICK_WALL;
  }
  for (let y = 4; y <= 8; y++) {
    tiles[y][14] = TileType.BRICK_WALL;
    tiles[y][19] = TileType.BRICK_WALL;
  }
  tiles[8][16] = TileType.STONE_FLOOR;
  tiles[6][17] = TileType.SHOP_COUNTER;

  // 여관
  for (let x = 2; x <= 7; x++) {
    tiles[4][x] = TileType.BRICK_WALL;
    tiles[8][x] = TileType.BRICK_WALL;
  }
  for (let y = 4; y <= 8; y++) {
    tiles[y][2] = TileType.BRICK_WALL;
    tiles[y][7] = TileType.BRICK_WALL;
  }
  tiles[8][5] = TileType.STONE_FLOOR;
  tiles[6][4] = TileType.SHOP_COUNTER;

  return {
    id: 'CANTLIN',
    name: '요새 도시 메르키드',
    jpName: 'メルキドの町',
    width: w,
    height: h,
    tiles,
    bgm: 'TOWN',
    warps: [
      { x: 10, y: 21, targetMap: 'OVERWORLD', targetX: 38, targetY: 42 },
      { x: 11, y: 21, targetMap: 'OVERWORLD', targetX: 38, targetY: 42 }
    ],
    npcs: [
      {
        id: 'cantlin_inn',
        name: '메르키드 여관',
        x: 4,
        y: 5,
        dir: 'down',
        spriteIndex: 2,
        map: 'CANTLIN',
        action: 'inn',
        dialog: ['요새 도시 메르키드 여관입니다. 최고급 숙박을 25골드에 모십니다!']
      },
      {
        id: 'cantlin_weapon',
        name: '전설의 무기상',
        x: 17,
        y: 5,
        dir: 'down',
        spriteIndex: 2,
        map: 'CANTLIN',
        action: 'shop',
        dialog: ['화염의 검과 전설의 은방패 등 궁극의 장비들이 준비되어 있습니다!']
      },
      {
        id: 'cantlin_elder',
        name: '장로',
        x: 11,
        y: 12,
        dir: 'down',
        spriteIndex: 4,
        map: 'CANTLIN',
        dialog: [
          '과거 용사 로토님께서는 남쪽 독 늪지 깊숙한 곳에 신성한 [로토의 증표]를 묻어두셨습니다.',
          '그리고 용왕의 성 어딘가에는 최강의 무기 [로토의 검]이 잠들어 있습니다!'
        ]
      }
    ],
    chests: []
  };
}

// --- 7. 성스러운 사당 (Holy Shrine - 무지개의 물방울 제단) ---
function getHolyShrine(): GameMap {
  const w = 14;
  const h = 14;
  const tiles = createMapTiles(w, h, TileType.STONE_FLOOR);

  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.BRICK_WALL;
    tiles[h - 1][x] = TileType.BRICK_WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.BRICK_WALL;
    tiles[y][w - 1] = TileType.BRICK_WALL;
  }

  tiles[h - 1][6] = TileType.STONE_FLOOR;
  tiles[h - 1][7] = TileType.STONE_FLOOR;

  // 제단
  tiles[4][6] = TileType.BARRIER;
  tiles[4][7] = TileType.BARRIER;

  return {
    id: 'HOLY_SHRINE',
    name: '성스러운 사당 (무지개의 제단)',
    jpName: '聖なるほこら',
    width: w,
    height: h,
    tiles,
    bgm: 'TOWN',
    warps: [
      { x: 6, y: 13, targetMap: 'OVERWORLD', targetX: 43, targetY: 41 },
      { x: 7, y: 13, targetMap: 'OVERWORLD', targetX: 43, targetY: 41 }
    ],
    npcs: [
      {
        id: 'shrine_sage',
        name: '무지개의 대현자',
        x: 6,
        y: 3,
        dir: 'down',
        spriteIndex: 4,
        map: 'HOLY_SHRINE',
        dialog: [
          '빛의 계승자여! [태양의 돌], [비구름의 지팡이], 그리고 [로토의 증표]를 모두 모아오셨군요.',
          '태양과 비가 만나면 찬란한 무지개가 피어나는 법!',
          '자, 이 [무지개의 물방울]을 받아 마왕의 성 앞 바다에서 높이 들어 올리십시오!'
        ]
      }
    ],
    chests: [
      { id: 'rainbow_drop_chest', map: 'HOLY_SHRINE', x: 7, y: 3, item: 'rainbow_drop', opened: false }
    ]
  };
}

// --- 8. 마왕 용왕의 성 (Charlock Castle - 최종 결전의 방) ---
function getCharlockCastle(): GameMap {
  const w = 24;
  const h = 24;
  const tiles = createMapTiles(w, h, TileType.STONE_FLOOR);

  // 성벽
  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.BRICK_WALL;
    tiles[h - 1][x] = TileType.BRICK_WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.BRICK_WALL;
    tiles[y][w - 1] = TileType.BRICK_WALL;
  }

  // 독 장벽 & 용암 바닥
  for (let y = 6; y <= 16; y++) {
    tiles[y][4] = TileType.BARRIER;
    tiles[y][19] = TileType.BARRIER;
  }

  // 용왕의 옥좌
  tiles[4][11] = TileType.BARRIER;
  tiles[4][12] = TileType.BARRIER;
  tiles[3][11] = TileType.BRICK_WALL;
  tiles[3][12] = TileType.BRICK_WALL;

  // 로토의 검 보물상자 (옥좌 뒤 비밀 통로)
  tiles[2][21] = TileType.CHEST;

  // 남쪽 입구
  tiles[h - 1][11] = TileType.STONE_FLOOR;
  tiles[h - 1][12] = TileType.STONE_FLOOR;

  return {
    id: 'CHARLOCK_CASTLE',
    name: '마왕 류오의 성 (용왕의 옥좌)',
    jpName: '竜王の城',
    width: w,
    height: h,
    tiles,
    bgm: 'BOSS',
    isDungeon: true,
    warps: [
      { x: 11, y: 23, targetMap: 'OVERWORLD', targetX: 25, targetY: 30 },
      { x: 12, y: 23, targetMap: 'OVERWORLD', targetX: 25, targetY: 30 }
    ],
    npcs: [
      {
        id: 'dragonlord_boss',
        name: '마왕 류오 (Dragonlord)',
        x: 11,
        y: 5,
        dir: 'down',
        spriteIndex: 11,
        map: 'CHARLOCK_CASTLE',
        action: 'dragonlord',
        dialog: [
          '크하하하! 잘도 여기까지 기어들어왔구나, 로토의 피를 이은 애송이여.',
          '어떠냐? 나의 편에 서지 않겠는가? 세상의 절반을 네게 떼어주마!',
          '거절하겠다고? 그렇다면 전설의 용사의 피도 오늘 여기서 영원히 끊기리라!!'
        ]
      }
    ],
    chests: [
      { id: 'erdrick_sword_chest', map: 'CHARLOCK_CASTLE', x: 21, y: 2, item: 'erdrick_sword', opened: false }
    ]
  };
}

// --- 9. 알레프갈드 거대 오버월드 맵 (56x56) ---
function getOverworld(): GameMap {
  const w = 56;
  const h = 56;
  // 기본 바다로 채우고 대륙을 그린다
  const tiles = createMapTiles(w, h, TileType.WATER);

  // 알레프갈드 본토 육지 생성
  for (let y = 6; y < 50; y++) {
    for (let x = 6; x < 50; x++) {
      // 대륙 중심부
      const distFromCenter = Math.hypot(x - 27, y - 27);
      if (distFromCenter < 21) {
        tiles[y][x] = TileType.GRASS;
      }
    }
  }

  // 숲, 산맥, 사막, 늪지대 조경
  // 북동쪽 산맥
  for (let x = 20; x <= 34; x++) {
    tiles[15][x] = TileType.MOUNTAIN;
    tiles[16][x] = TileType.MOUNTAIN;
  }
  // 서쪽 가라이 산맥
  for (let y = 10; y <= 22; y++) {
    tiles[y][12] = TileType.MOUNTAIN;
    tiles[y][13] = TileType.MOUNTAIN;
  }
  // 숲 배치
  for (let y = 20; y <= 26; y++) {
    for (let x = 32; x <= 38; x++) {
      tiles[y][x] = TileType.TREE;
    }
  }
  for (let y = 12; y <= 16; y++) {
    for (let x = 38; x <= 45; x++) {
      tiles[y][x] = TileType.TREE;
    }
  }

  // 늪지대 (중앙 남쪽)
  for (let y = 30; y <= 34; y++) {
    for (let x = 28; x <= 33; x++) {
      tiles[y][x] = TileType.SWAMP;
    }
  }

  // 사막 (남서쪽 돔드라 주변)
  for (let y = 36; y <= 44; y++) {
    for (let x = 12; x <= 22; x++) {
      tiles[y][x] = TileType.DESERT;
    }
  }

  // 마왕의 섬 (내해 중앙에 고립된 섬)
  for (let y = 28; y <= 34; y++) {
    for (let x = 22; x <= 27; x++) {
      tiles[y][x] = TileType.WATER;
    }
  }
  for (let y = 29; y <= 32; y++) {
    for (let x = 23; x <= 26; x++) {
      tiles[y][x] = TileType.SWAMP; // 류오의 섬은 독늪과 성으로 뒤덮임
    }
  }

  // --- 주요 거점 랜드마크 배치 ---
  // 1. 탄타겔 성 (x: 25, y: 26)
  tiles[26][25] = TileType.CASTLE;

  // 2. 라다톰 마을 (x: 27, y: 26)
  tiles[26][27] = TileType.TOWN;

  // 3. 가라이 마을 (x: 10, y: 10)
  tiles[10][10] = TileType.TOWN;

  // 4. 마이라 마을 (x: 42, y: 12)
  tiles[12][42] = TileType.TOWN;

  // 5. 늪지의 동굴 입구 (x: 30, y: 30) 및 출구 (x: 30, y: 34)
  tiles[30][30] = TileType.CAVE;
  tiles[34][30] = TileType.CAVE;

  // 6. 메르키드 요새 (x: 38, y: 42)
  tiles[42][38] = TileType.TOWN;

  // 7. 성스러운 사당 (x: 43, y: 41)
  tiles[41][43] = TileType.SHRINE;

  // 8. 류오의 성 (x: 25, y: 30)
  tiles[30][25] = TileType.CASTLE;

  // 9. 로토의 동굴 (x: 20, y: 14)
  tiles[14][20] = TileType.CAVE;

  // 10. 리물다르 마을 (x: 45, y: 36)
  tiles[36][45] = TileType.TOWN;

  // 다리들
  tiles[25][28] = TileType.BRIDGE;
  tiles[37][30] = TileType.BRIDGE;
  tiles[41][34] = TileType.BRIDGE;
  tiles[35][43] = TileType.BRIDGE; // 리물다르 섬 연결 다리

  // 로토의 증표 보물 (남쪽 독 늪지대 한가운데: x: 30, y: 45)
  tiles[45][30] = TileType.CHEST;

  // 로토의 갑옷 보물 (돔드라 폐허 나무 뒤: x: 16, y: 40)
  tiles[40][16] = TileType.CHEST;

  // 비구름의 지팡이 사당 (북서쪽 외딴 사당: x: 10, y: 18)
  tiles[18][10] = TileType.SHRINE;

  return {
    id: 'OVERWORLD',
    name: '알레프갈드 대륙 (Alefgard)',
    jpName: 'アレフガルド',
    width: w,
    height: h,
    tiles,
    bgm: 'OVERWORLD',
    warps: [
      // 탄타겔 성 진입
      { x: 25, y: 26, targetMap: 'TANTEGEL_1F', targetX: 9, targetY: 18 },
      // 라다톰 마을 진입
      { x: 27, y: 26, targetMap: 'BRECCONARY', targetX: 1, targetY: 10 },
      // 가라이 마을 진입
      { x: 10, y: 10, targetMap: 'GARINHAM', targetX: 9, targetY: 18 },
      // 마이라 마을 진입
      { x: 42, y: 12, targetMap: 'KOL', targetX: 9, targetY: 16 },
      // 로토의 동굴 진입
      { x: 20, y: 14, targetMap: 'ERDRICK_CAVE', targetX: 2, targetY: 3 },
      // 늪지의 동굴 북쪽 진입
      { x: 30, y: 30, targetMap: 'SWAMP_CAVE', targetX: 2, targetY: 3 },
      // 늪지의 동굴 남쪽 진입
      { x: 30, y: 34, targetMap: 'SWAMP_CAVE', targetX: 2, targetY: 20 },
      // 리물다르 마을 진입
      { x: 45, y: 36, targetMap: 'RIMULDAR', targetX: 10, targetY: 20 },
      // 메르키드 요새 진입
      { x: 38, y: 42, targetMap: 'CANTLIN', targetX: 10, targetY: 20 },
      // 성스러운 사당 진입
      { x: 43, y: 41, targetMap: 'HOLY_SHRINE', targetX: 6, targetY: 12 },
      // 류오의 성 진입
      { x: 25, y: 30, targetMap: 'CHARLOCK_CASTLE', targetX: 11, targetY: 22 }
    ],
    npcs: [
      {
        id: 'golem_guard',
        name: '골렘 (메르키드 수호 거인)',
        x: 38,
        y: 43,
        dir: 'down',
        spriteIndex: 9,
        map: 'OVERWORLD',
        action: 'golem',
        dialog: ['콰아아앙! 침입자를 배제한다! 거대한 돌주먹이 날아온다!']
      }
    ],
    chests: [
      { id: 'erdrick_token_chest', map: 'OVERWORLD', x: 30, y: 45, item: 'erdrick_token', opened: false },
      { id: 'erdrick_armor_chest', map: 'OVERWORLD', x: 16, y: 40, item: 'erdrick_armor', opened: false },
      { id: 'staff_of_rain_chest', map: 'OVERWORLD', x: 10, y: 18, item: 'staff_of_rain', opened: false }
    ],
    encounterZone: 'near_tantegel'
  };
}

// --- 10. 가라이의 마을 (Garinham - 음유시인 가라이의 고향 & 은피리) ---
function getGarinham(): GameMap {
  const w = 20;
  const h = 20;
  const tiles = createMapTiles(w, h, TileType.GRASS);

  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.TREE;
    tiles[h - 1][x] = TileType.TREE;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.TREE;
    tiles[y][w - 1] = TileType.TREE;
  }
  tiles[h - 1][9] = TileType.STONE_FLOOR;
  tiles[h - 1][10] = TileType.STONE_FLOOR;

  // 가라이의 묘소 건물 (북쪽)
  for (let x = 6; x <= 13; x++) {
    tiles[2][x] = TileType.BRICK_WALL;
    tiles[7][x] = TileType.BRICK_WALL;
  }
  for (let y = 2; y <= 7; y++) {
    tiles[y][6] = TileType.BRICK_WALL;
    tiles[y][13] = TileType.BRICK_WALL;
  }
  for (let y = 3; y <= 6; y++) {
    for (let x = 7; x <= 12; x++) {
      tiles[y][x] = TileType.STONE_FLOOR;
    }
  }
  tiles[7][9] = TileType.DOOR;
  tiles[7][10] = TileType.DOOR;
  tiles[4][9] = TileType.CHEST; // 은피리 (은의 하프)

  // 여관
  for (let x = 2; x <= 6; x++) {
    tiles[11][x] = TileType.BRICK_WALL;
    tiles[15][x] = TileType.BRICK_WALL;
  }
  for (let y = 11; y <= 15; y++) {
    tiles[y][2] = TileType.BRICK_WALL;
    tiles[y][6] = TileType.BRICK_WALL;
  }
  tiles[15][4] = TileType.STONE_FLOOR;
  tiles[13][3] = TileType.SHOP_COUNTER;

  return {
    id: 'GARINHAM',
    name: '가라이 마을 (음유시인의 고향)',
    jpName: 'ガライの町',
    width: w,
    height: h,
    tiles,
    bgm: 'TOWN',
    warps: [
      { x: 9, y: 19, targetMap: 'OVERWORLD', targetX: 10, targetY: 11 },
      { x: 10, y: 19, targetMap: 'OVERWORLD', targetX: 10, targetY: 11 }
    ],
    npcs: [
      {
        id: 'garin_bard',
        name: '가라이의 제자',
        x: 10,
        y: 10,
        dir: 'down',
        spriteIndex: 2,
        map: 'GARINHAM',
        dialog: ['전설의 시인 가라이 님의 영묘에는 마물을 불러모으는 신비한 [은의 하프]가 안치되어 있습니다.']
      },
      {
        id: 'garin_inn',
        name: '가라이 여관',
        x: 3,
        y: 12,
        dir: 'down',
        spriteIndex: 3,
        map: 'GARINHAM',
        action: 'inn',
        dialog: ['가라이 마을 여관입니다. 숙박비는 10골드입니다.']
      }
    ],
    chests: [
      { id: 'silver_harp_chest', map: 'GARINHAM', x: 9, y: 4, item: 'silver_harp', opened: false }
    ]
  };
}

// --- 11. 리물다르 마을 (Rimuldar - 운하와 호수의 열쇠 마을) ---
function getRimuldar(): GameMap {
  const w = 22;
  const h = 22;
  const tiles = createMapTiles(w, h, TileType.GRASS);

  // 성벽 둘레
  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.TREE;
    tiles[h - 1][x] = TileType.TREE;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.TREE;
    tiles[y][w - 1] = TileType.TREE;
  }

  // 내부 해자 (운하)
  for (let y = 2; y <= 19; y++) {
    tiles[y][2] = TileType.WATER;
    tiles[y][19] = TileType.WATER;
  }
  for (let x = 2; x <= 19; x++) {
    tiles[2][x] = TileType.WATER;
    tiles[19][x] = TileType.WATER;
  }
  // 운하 다리
  tiles[19][10] = TileType.BRIDGE;
  tiles[h - 1][10] = TileType.STONE_FLOOR;

  // 열쇠 상인의 큰 상점 (중앙)
  for (let x = 8; x <= 14; x++) {
    tiles[6][x] = TileType.BRICK_WALL;
    tiles[11][x] = TileType.BRICK_WALL;
  }
  for (let y = 6; y <= 11; y++) {
    tiles[y][8] = TileType.BRICK_WALL;
    tiles[y][14] = TileType.BRICK_WALL;
  }
  tiles[11][11] = TileType.STONE_FLOOR;
  tiles[9][11] = TileType.SHOP_COUNTER;

  // 마법 갑옷 방어구점
  for (let x = 4; x <= 8; x++) {
    tiles[13][x] = TileType.BRICK_WALL;
    tiles[17][x] = TileType.BRICK_WALL;
  }
  tiles[17][6] = TileType.STONE_FLOOR;
  tiles[15][6] = TileType.SHOP_COUNTER;

  return {
    id: 'RIMULDAR',
    name: '물의 마을 리물다르',
    jpName: 'リムルダールの町',
    width: w,
    height: h,
    tiles,
    bgm: 'TOWN',
    warps: [
      { x: 10, y: 21, targetMap: 'OVERWORLD', targetX: 45, targetY: 37 }
    ],
    npcs: [
      {
        id: 'rimuldar_key',
        name: '열쇠 명장',
        x: 11,
        y: 8,
        dir: 'down',
        spriteIndex: 4,
        map: 'RIMULDAR',
        action: 'key',
        dialog: ['여기는 열쇠의 본고장 리물다르요! 마법의 열쇠를 필요한 만큼 넉넉히 챙겨가시오. (개당 26G)']
      },
      {
        id: 'rimuldar_inn',
        name: '리물다르 여관',
        x: 16,
        y: 15,
        dir: 'left',
        spriteIndex: 3,
        map: 'RIMULDAR',
        action: 'inn',
        dialog: ['남쪽 섬의 리물다르 여관입니다. 숙박비는 18골드입니다.']
      },
      {
        id: 'rimuldar_prophet',
        name: '예언자',
        x: 11,
        y: 15,
        dir: 'up',
        spriteIndex: 4,
        map: 'RIMULDAR',
        dialog: ['태양의 돌과 비구름의 지팡이를 신성한 제단으로 가져가면, 마왕의 성으로 향하는 무지개의 다리가 열릴지어다!']
      }
    ],
    chests: []
  };
}

// --- 12. 로토의 동굴 (Erdrick's Cave - 용사 로토의 성역) ---
function getErdrickCave(): GameMap {
  const w = 16;
  const h = 16;
  const tiles = createMapTiles(w, h, TileType.STONE_FLOOR);

  for (let x = 0; x < w; x++) {
    tiles[0][x] = TileType.BRICK_WALL;
    tiles[h - 1][x] = TileType.BRICK_WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = TileType.BRICK_WALL;
    tiles[y][w - 1] = TileType.BRICK_WALL;
  }

  // 동굴 출구 (지상으로)
  tiles[2][2] = TileType.STAIRS_UP;

  // 중앙 전설의 석판 기념비
  tiles[7][8] = TileType.SHRINE;

  return {
    id: 'ERDRICK_CAVE',
    name: '로토의 동굴 (전설의 성역)',
    jpName: 'ロトの洞窟',
    width: w,
    height: h,
    tiles,
    bgm: 'DUNGEON',
    isDungeon: true,
    warps: [
      { x: 2, y: 2, targetMap: 'OVERWORLD', targetX: 20, targetY: 15 }
    ],
    npcs: [
      {
        id: 'erdrick_monument',
        name: '로토의 비문',
        x: 8,
        y: 7,
        dir: 'down',
        spriteIndex: 4,
        map: 'ERDRICK_CAVE',
        dialog: [
          '석판에 고대 문자로 글이 새겨져 있다.',
          '"나 로토, 세 가지 신기를 모아 마왕을 봉인하고 이 땅에 빛을 가져왔노라."',
          '"나의 피를 이어받은 용사여, 태양과 비를 모아 무지개의 물방울을 빚어 악을 심판하라!"'
        ]
      }
    ],
    chests: []
  };
}

export const WORLD_MAPS: Record<MapType, () => GameMap> = {
  OVERWORLD: getOverworld,
  TANTEGEL_THRONE: getTantegelThrone,
  TANTEGEL_1F: getTantegel1F,
  BRECCONARY: getBrecconary,
  GARINHAM: getGarinham,
  KOL: getKol,
  RIMULDAR: getRimuldar,
  CANTLIN: getCantlin,
  SWAMP_CAVE: getSwampCave,
  ERDRICK_CAVE: getErdrickCave,
  CHARLOCK_CASTLE: getCharlockCastle,
  HOLY_SHRINE: getHolyShrine
};
