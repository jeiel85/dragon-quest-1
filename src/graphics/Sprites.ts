// 드래곤 퀘스트 1 픽셀 아트 에셋 및 스프라이트 생성기
// 16x16 타일, 4방향 캐릭터 애니메이션, 전 몬스터 고품질 픽셀 렌더러

import { Direction, TileType } from '../core/Types';

export class Sprites {
  private tileCanvases: Map<TileType, HTMLCanvasElement> = new Map();
  private animatedWaterCanvases: HTMLCanvasElement[] = [];
  private heroCanvases: Map<string, HTMLCanvasElement> = new Map();
  private npcCanvases: Map<string, HTMLCanvasElement> = new Map();
  private monsterCanvases: Map<number, HTMLCanvasElement> = new Map();

  constructor() {
    this.generateAllAssets();
  }

  private createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return [c, ctx];
  }

  private generateAllAssets() {
    this.generateTiles();
    this.generateHeroSprites();
    this.generateNPCSprites();
    this.generateMonsterSprites();
  }

  // --- 1. 월드 & 던전 타일셋 생성 (16x16) ---
  private generateTiles() {
    // GRASS
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#188818';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#28b028';
      // 잔디 텍스처 도트
      [[2, 3], [6, 2], [11, 4], [4, 9], [13, 10], [8, 13], [1, 14]].forEach(([x, y]) => {
        ctx.fillRect(x, y, 2, 2);
      });
      this.tileCanvases.set(TileType.GRASS, c);
    }

    // TREE / FOREST
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#188818';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#084808';
      ctx.beginPath();
      ctx.arc(8, 7, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#186818';
      ctx.beginPath();
      ctx.arc(7, 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5c3c10';
      ctx.fillRect(7, 11, 3, 5);
      this.tileCanvases.set(TileType.TREE, c);
    }

    // MOUNTAIN
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#188818';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#805020';
      ctx.beginPath();
      ctx.moveTo(8, 1);
      ctx.lineTo(15, 15);
      ctx.lineTo(1, 15);
      ctx.closePath();
      ctx.fill();
      // 설산 꼭대기
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(8, 1);
      ctx.lineTo(11, 6);
      ctx.lineTo(5, 6);
      ctx.closePath();
      ctx.fill();
      this.tileCanvases.set(TileType.MOUNTAIN, c);
    }

    // WATER (애니메이션 2프레임)
    for (let frame = 0; frame < 2; frame++) {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#0040a0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#3080ff';
      const offset = frame * 4;
      ctx.fillRect((2 + offset) % 16, 3, 5, 2);
      ctx.fillRect((8 + offset) % 16, 8, 6, 2);
      ctx.fillRect((4 + offset) % 16, 13, 5, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((3 + offset) % 16, 4, 2, 1);
      ctx.fillRect((9 + offset) % 16, 9, 2, 1);
      this.animatedWaterCanvases.push(c);
    }
    this.tileCanvases.set(TileType.WATER, this.animatedWaterCanvases[0]);

    // COAST
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#e0c068';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#0040a0';
      ctx.fillRect(8, 0, 8, 16);
      ctx.fillStyle = '#3080ff';
      ctx.fillRect(6, 0, 2, 16);
      this.tileCanvases.set(TileType.COAST, c);
    }

    // DESERT
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#d8b868';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#c09848';
      [[3, 4], [10, 2], [7, 8], [12, 11], [2, 13], [14, 6]].forEach(([x, y]) => {
        ctx.fillRect(x, y, 2, 1);
      });
      this.tileCanvases.set(TileType.DESERT, c);
    }

    // SWAMP (보라색 독 늪지)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#4a154b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#8b2e8b';
      ctx.beginPath();
      ctx.arc(5, 5, 3, 0, Math.PI * 2);
      ctx.arc(11, 10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d63384';
      ctx.fillRect(4, 4, 2, 2);
      ctx.fillRect(10, 9, 2, 2);
      this.tileCanvases.set(TileType.SWAMP, c);
    }

    // BRIDGE
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#0040a0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(2, 0, 12, 16);
      ctx.fillStyle = '#5c3c10';
      ctx.fillRect(2, 0, 2, 16);
      ctx.fillRect(12, 0, 2, 16);
      ctx.fillStyle = '#d2a679';
      for (let y = 2; y < 16; y += 4) {
        ctx.fillRect(4, y, 8, 2);
      }
      this.tileCanvases.set(TileType.BRIDGE, c);
    }

    // TOWN (마을 지붕)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#188818';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#b02020';
      ctx.fillRect(2, 4, 12, 5);
      ctx.fillStyle = '#e8d8b0';
      ctx.fillRect(3, 9, 10, 6);
      ctx.fillStyle = '#5c3c10';
      ctx.fillRect(7, 11, 3, 4);
      this.tileCanvases.set(TileType.TOWN, c);
    }

    // CASTLE (성채 심볼)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#188818';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#d0d0d8';
      ctx.fillRect(1, 4, 14, 11);
      ctx.fillStyle = '#808090';
      // 성벽 첨탑
      ctx.fillRect(1, 1, 3, 4);
      ctx.fillRect(6, 2, 4, 3);
      ctx.fillRect(12, 1, 3, 4);
      ctx.fillStyle = '#202030';
      ctx.fillRect(6, 10, 4, 5); // 성문
      this.tileCanvases.set(TileType.CASTLE, c);
    }

    // CAVE (동굴 입구)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#805020';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(8, 12, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(2, 12, 12, 4);
      this.tileCanvases.set(TileType.CAVE, c);
    }

    // STONE_FLOOR
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#606068';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#404048';
      ctx.strokeRect(0.5, 0.5, 15, 15);
      ctx.fillStyle = '#787880';
      ctx.fillRect(2, 2, 5, 5);
      this.tileCanvases.set(TileType.STONE_FLOOR, c);
    }

    // BRICK_WALL
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#787880';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#303038';
      for (let y = 0; y < 16; y += 4) {
        ctx.fillRect(0, y, 16, 1);
      }
      ctx.fillRect(8, 0, 1, 4);
      ctx.fillRect(4, 4, 1, 4);
      ctx.fillRect(12, 4, 1, 4);
      ctx.fillRect(8, 8, 1, 4);
      ctx.fillRect(4, 12, 1, 4);
      ctx.fillRect(12, 12, 1, 4);
      this.tileCanvases.set(TileType.BRICK_WALL, c);
    }

    // STAIRS_DOWN
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#606068';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(2, 2 + i * 3, 12, 2);
      }
      this.tileCanvases.set(TileType.STAIRS_DOWN, c);
    }

    // STAIRS_UP
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#606068';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(2, 2 + i * 3, 12, 2);
      }
      this.tileCanvases.set(TileType.STAIRS_UP, c);
    }

    // DOOR
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#5c2e0b';
      ctx.strokeRect(2.5, 2.5, 11, 11);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(11, 8, 2, 2); // 황금 손잡이
      this.tileCanvases.set(TileType.DOOR, c);
    }

    // CHEST
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#606068';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(2, 4, 12, 9);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(2, 7, 12, 2);
      ctx.fillRect(7, 8, 2, 3);
      this.tileCanvases.set(TileType.CHEST, c);
    }

    // BARRIER (마법 장벽)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#202060';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#40e0d0';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(4, 4, 8, 8);
      this.tileCanvases.set(TileType.BARRIER, c);
    }

    // SHRINE
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#188818';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#4040a0';
      ctx.fillRect(2, 4, 12, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 2, 6, 4);
      ctx.fillRect(7, 8, 2, 6);
      this.tileCanvases.set(TileType.SHRINE, c);
    }

    // SHOP COUNTER
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#606068';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(0, 4, 16, 8);
      ctx.fillStyle = '#5c3c10';
      ctx.fillRect(0, 4, 16, 2);
      this.tileCanvases.set(TileType.SHOP_COUNTER, c);
    }

    // VOID
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 16, 16);
      this.tileCanvases.set(TileType.VOID, c);
    }
  }

  // --- 2. 영웅 스프라이트 (4방향 x 2프레임 걷기) ---
  private generateHeroSprites() {
    const directions: Direction[] = ['down', 'up', 'left', 'right'];

    directions.forEach(dir => {
      for (let frame = 0; frame < 2; frame++) {
        const [c, ctx] = this.createCanvas(16, 16);

        // 머리 / 투구 (동빛/황금 투구 & 빨간 뿔 장식)
        ctx.fillStyle = '#d09030';
        ctx.fillRect(5, 1, 6, 5);
        ctx.fillStyle = '#e02020';
        ctx.fillRect(4, 2, 2, 2); // 투구 장식 깃

        // 얼굴
        if (dir === 'down') {
          ctx.fillStyle = '#ffcc99';
          ctx.fillRect(6, 4, 4, 3);
          ctx.fillStyle = '#000000';
          ctx.fillRect(6, 4, 1, 1);
          ctx.fillRect(9, 4, 1, 1);
        } else if (dir === 'up') {
          ctx.fillStyle = '#d09030';
          ctx.fillRect(5, 3, 6, 3);
        } else if (dir === 'left') {
          ctx.fillStyle = '#ffcc99';
          ctx.fillRect(5, 4, 3, 3);
          ctx.fillStyle = '#000000';
          ctx.fillRect(5, 4, 1, 1);
        } else if (dir === 'right') {
          ctx.fillStyle = '#ffcc99';
          ctx.fillRect(8, 4, 3, 3);
          ctx.fillStyle = '#000000';
          ctx.fillRect(10, 4, 1, 1);
        }

        // 몸통 (파란 갑옷 / 망토)
        ctx.fillStyle = '#2060c0';
        ctx.fillRect(5, 6, 6, 5);

        // 방패 (주황/황금 방패)
        if (dir === 'down' || dir === 'right') {
          ctx.fillStyle = '#e08020';
          ctx.fillRect(11, 7, 3, 4);
        } else if (dir === 'left') {
          ctx.fillStyle = '#e08020';
          ctx.fillRect(2, 7, 3, 4);
        }

        // 검 (은빛 검)
        if (dir === 'down' || dir === 'left') {
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(3, 8, 2, 5);
        } else if (dir === 'right') {
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(11, 8, 2, 5);
        }

        // 다리 / 발 (갈색 부츠)
        ctx.fillStyle = '#8b5a2b';
        if (frame === 0) {
          ctx.fillRect(5, 11, 2, 4);
          ctx.fillRect(9, 11, 2, 4);
        } else {
          if (dir === 'down' || dir === 'up') {
            ctx.fillRect(4, 11, 3, 4);
            ctx.fillRect(9, 12, 3, 3);
          } else {
            ctx.fillRect(6, 11, 4, 4);
          }
        }

        this.heroCanvases.set(`${dir}_${frame}`, c);
      }
    });
  }

  // --- 3. NPC 스프라이트 (국왕, 병사, 주민, 로라 공주) ---
  private generateNPCSprites() {
    // 0: 국왕 (King Lorik)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#ffd700'; // 황금 왕관
      ctx.fillRect(5, 1, 6, 3);
      ctx.fillStyle = '#ffcc99'; // 얼굴
      ctx.fillRect(5, 4, 6, 4);
      ctx.fillStyle = '#ffffff'; // 하얀 수염
      ctx.fillRect(5, 7, 6, 3);
      ctx.fillStyle = '#9b111e'; // 붉은 왕실 로브
      ctx.fillRect(4, 8, 8, 7);
      ctx.fillStyle = '#ffffff'; // 모피 깃
      ctx.fillRect(6, 8, 4, 3);
      this.npcCanvases.set('king', c);
    }

    // 1: 병사 (Guard)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#a0a0b0'; // 철 투구
      ctx.fillRect(5, 1, 6, 4);
      ctx.fillStyle = '#ffcc99';
      ctx.fillRect(6, 4, 4, 2);
      ctx.fillStyle = '#808090'; // 갑옷
      ctx.fillRect(5, 6, 6, 6);
      ctx.fillStyle = '#c0c0c0'; // 창
      ctx.fillRect(12, 1, 1, 14);
      ctx.fillStyle = '#5c3c10'; // 부츠
      ctx.fillRect(5, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
      this.npcCanvases.set('guard', c);
    }

    // 2: 마을 주민 (남성)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#5c3c10'; // 갈색 머리
      ctx.fillRect(5, 2, 6, 3);
      ctx.fillStyle = '#ffcc99';
      ctx.fillRect(5, 4, 6, 3);
      ctx.fillStyle = '#2e8b57'; // 초록 옷
      ctx.fillRect(5, 7, 6, 6);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(6, 13, 4, 3);
      this.npcCanvases.set('man', c);
    }

    // 3: 마을 주민 (여성)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#e67e22'; // 주황 땋은 머리
      ctx.fillRect(4, 2, 8, 4);
      ctx.fillStyle = '#ffcc99';
      ctx.fillRect(5, 4, 6, 3);
      ctx.fillStyle = '#9b59b6'; // 보라 드레스
      ctx.fillRect(4, 7, 8, 8);
      this.npcCanvases.set('woman', c);
    }

    // 4: 노인 / 현자
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#ffffff'; // 하얀 머리
      ctx.fillRect(5, 2, 6, 3);
      ctx.fillStyle = '#ffcc99';
      ctx.fillRect(5, 4, 6, 3);
      ctx.fillStyle = '#ffffff'; // 수염
      ctx.fillRect(6, 6, 4, 3);
      ctx.fillStyle = '#34495e'; // 남색 도복
      ctx.fillRect(4, 8, 8, 7);
      ctx.fillStyle = '#8b5a2b'; // 지팡이
      ctx.fillRect(12, 5, 2, 10);
      this.npcCanvases.set('sage', c);
    }

    // 5: 로라 공주 (Princess Gwaelin)
    {
      const [c, ctx] = this.createCanvas(16, 16);
      ctx.fillStyle = '#f1c40f'; // 금발 머리
      ctx.fillRect(4, 1, 8, 6);
      ctx.fillStyle = '#ffcc99'; // 얼굴
      ctx.fillRect(5, 4, 6, 3);
      ctx.fillStyle = '#fd79a8'; // 핑크 드레스
      ctx.fillRect(4, 7, 8, 8);
      ctx.fillStyle = '#ffffff'; // 리본
      ctx.fillRect(6, 1, 4, 1);
      this.npcCanvases.set('princess', c);
    }
  }

  // --- 4. 몬스터 전투 스프라이트 생성 (48x48 ~ 64x64) ---
  private generateMonsterSprites() {
    // 0: 슬라임 (Slime)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      ctx.fillStyle = '#2070e8';
      // 둥근 물방울 모양
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.bezierCurveTo(10, 18, 6, 30, 8, 38);
      ctx.bezierCurveTo(10, 44, 38, 44, 40, 38);
      ctx.bezierCurveTo(42, 30, 38, 18, 24, 6);
      ctx.fill();
      // 하이라이트
      ctx.fillStyle = '#60a0ff';
      ctx.beginPath();
      ctx.ellipse(18, 22, 5, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // 눈 (흰자 + 검은자)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(17, 28, 4, 0, Math.PI * 2);
      ctx.arc(31, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(18, 28, 2, 0, Math.PI * 2);
      ctx.arc(30, 28, 2, 0, Math.PI * 2);
      ctx.fill();
      // 웃는 입
      ctx.strokeStyle = '#902020';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 32, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
      this.monsterCanvases.set(0, c);
    }

    // 1: 레드 슬라임 (Red Slime)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      ctx.fillStyle = '#e83020';
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.bezierCurveTo(10, 18, 6, 30, 8, 38);
      ctx.bezierCurveTo(10, 44, 38, 44, 40, 38);
      ctx.bezierCurveTo(42, 30, 38, 18, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#ff7060';
      ctx.beginPath();
      ctx.ellipse(18, 22, 5, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(17, 28, 4, 0, Math.PI * 2);
      ctx.arc(31, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(18, 28, 2, 0, Math.PI * 2);
      ctx.arc(30, 28, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#400000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 32, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
      this.monsterCanvases.set(1, c);
    }

    // 2: 드라키 (Dracky - 박쥐 몬스터)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      // 박쥐 날개
      ctx.fillStyle = '#304080';
      ctx.beginPath();
      ctx.moveTo(4, 12);
      ctx.lineTo(16, 24);
      ctx.lineTo(8, 32);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(44, 12);
      ctx.lineTo(32, 24);
      ctx.lineTo(40, 32);
      ctx.closePath();
      ctx.fill();
      // 몸통 & 귀
      ctx.fillStyle = '#4050a0';
      ctx.beginPath();
      ctx.arc(24, 26, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(15, 18);
      ctx.lineTo(12, 8);
      ctx.lineTo(19, 14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(33, 18);
      ctx.lineTo(36, 8);
      ctx.lineTo(29, 14);
      ctx.fill();
      // 큰 눈
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(19, 24, 4, 0, Math.PI * 2);
      ctx.arc(29, 24, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(20, 24, 2, 0, Math.PI * 2);
      ctx.arc(28, 24, 2, 0, Math.PI * 2);
      ctx.fill();
      // 송곳니
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(21, 30, 2, 4);
      ctx.fillRect(25, 30, 2, 4);
      this.monsterCanvases.set(2, c);
    }

    // 3: 고스트 (Ghost)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      // 고깔 모자
      ctx.fillStyle = '#8040a0';
      ctx.beginPath();
      ctx.moveTo(24, 4);
      ctx.lineTo(14, 18);
      ctx.lineTo(34, 18);
      ctx.closePath();
      ctx.fill();
      // 유령 몸
      ctx.fillStyle = '#e8e8f8';
      ctx.beginPath();
      ctx.arc(24, 24, 12, Math.PI, 0);
      ctx.lineTo(36, 40);
      ctx.lineTo(30, 36);
      ctx.lineTo(24, 42);
      ctx.lineTo(18, 36);
      ctx.lineTo(12, 40);
      ctx.closePath();
      ctx.fill();
      // 눈
      ctx.fillStyle = '#e02020';
      ctx.beginPath();
      ctx.arc(19, 24, 3, 0, Math.PI * 2);
      ctx.arc(29, 24, 3, 0, Math.PI * 2);
      ctx.fill();
      this.monsterCanvases.set(3, c);
    }

    // 4: 마도사 (Magician)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      // 로브
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.lineTo(10, 42);
      ctx.lineTo(38, 42);
      ctx.closePath();
      ctx.fill();
      // 얼굴 그림자 속 번뜩이는 눈
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(24, 20, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(20, 19, 2, 2);
      ctx.fillRect(26, 19, 2, 2);
      // 마법 지팡이
      ctx.fillStyle = '#c0a040';
      ctx.fillRect(36, 12, 3, 30);
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(37, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      this.monsterCanvases.set(4, c);
    }

    // 5: 메탈 슬라임 (Metal Slime)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      ctx.fillStyle = '#b0b8c0';
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.bezierCurveTo(10, 18, 6, 30, 8, 38);
      ctx.bezierCurveTo(10, 44, 38, 44, 40, 38);
      ctx.bezierCurveTo(42, 30, 38, 18, 24, 6);
      ctx.fill();
      // 메탈릭 광택
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(18, 20, 5, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(17, 28, 4, 0, Math.PI * 2);
      ctx.arc(31, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(18, 28, 2, 0, Math.PI * 2);
      ctx.arc(30, 28, 2, 0, Math.PI * 2);
      ctx.fill();
      this.monsterCanvases.set(5, c);
    }

    // 6: 스켈레톤 (Skeleton)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      // 해골 머리
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(18, 8, 12, 10);
      ctx.fillRect(20, 18, 8, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(20, 12, 3, 3);
      ctx.fillRect(25, 12, 3, 3);
      // 갈비뼈
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(23, 22, 2, 12);
      ctx.fillRect(16, 24, 16, 2);
      ctx.fillRect(17, 28, 14, 2);
      ctx.fillRect(18, 32, 12, 2);
      // 뼈다귀 칼 & 방패
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(10, 20, 3, 18);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(32, 24, 6, 8);
      this.monsterCanvases.set(6, c);
    }

    // 7: 키메라 (Chimera)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      // 날개
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.moveTo(6, 14);
      ctx.lineTo(20, 24);
      ctx.lineTo(8, 36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(42, 14);
      ctx.lineTo(28, 24);
      ctx.lineTo(40, 36);
      ctx.closePath();
      ctx.fill();
      // 몸체 (주황/보라)
      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.arc(24, 24, 10, 0, Math.PI * 2);
      ctx.fill();
      // 독수리 부리
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(20, 24);
      ctx.lineTo(24, 30);
      ctx.lineTo(28, 24);
      ctx.closePath();
      ctx.fill();
      // 날카로운 눈
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(19, 20, 3, 2);
      ctx.fillRect(26, 20, 3, 2);
      this.monsterCanvases.set(7, c);
    }

    // 8: 킬러 아머 (Killer Armor / Knight)
    {
      const [c, ctx] = this.createCanvas(48, 48);
      // 중장갑 풀 플레이트 아머
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(16, 6, 16, 12); // 투구
      ctx.fillStyle = '#e74c3c'; // 투구 틈새 붉은 빛
      ctx.fillRect(18, 12, 12, 2);
      ctx.fillStyle = '#34495e'; // 몸통
      ctx.fillRect(14, 18, 20, 16);
      // 거대한 대검
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(8, 8, 4, 32);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(6, 14, 8, 3);
      // 방패
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(32, 20, 8, 14);
      this.monsterCanvases.set(8, c);
    }

    // 9: 골렘 (Golem - 거대 돌벽돌 골렘)
    {
      const [c, ctx] = this.createCanvas(56, 56);
      // 사각 벽돌 머리
      ctx.fillStyle = '#b37d4e';
      ctx.fillRect(18, 6, 20, 14);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(22, 12, 3, 3);
      ctx.fillRect(31, 12, 3, 3);
      // 거대한 돌 어깨와 몸통
      ctx.fillStyle = '#8d5524';
      ctx.fillRect(12, 20, 32, 20);
      ctx.fillStyle = '#b37d4e';
      ctx.fillRect(4, 20, 8, 22); // 팔
      ctx.fillRect(44, 20, 8, 22);
      ctx.fillRect(16, 40, 10, 12); // 다리
      ctx.fillRect(30, 40, 10, 12);
      // 벽돌 균열 패턴
      ctx.fillStyle = '#4a2810';
      ctx.fillRect(20, 24, 16, 1);
      ctx.fillRect(28, 20, 1, 8);
      ctx.fillRect(16, 32, 24, 1);
      this.monsterCanvases.set(9, c);
    }

    // 10: 그린 드래곤 (Green Dragon)
    {
      const [c, ctx] = this.createCanvas(56, 56);
      // 녹색 용 머리
      ctx.fillStyle = '#1e824c';
      ctx.beginPath();
      ctx.moveTo(28, 8);
      ctx.lineTo(44, 18);
      ctx.lineTo(28, 26);
      ctx.lineTo(16, 20);
      ctx.closePath();
      ctx.fill();
      // 뿔 & 눈
      ctx.fillStyle = '#f4d03f';
      ctx.fillRect(20, 6, 4, 6);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(32, 14, 3, 3);
      // 용 몸통 & 비늘
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(28, 34, 16, 0, Math.PI * 2);
      ctx.fill();
      // 날개
      ctx.fillStyle = '#145a32';
      ctx.beginPath();
      ctx.moveTo(10, 18);
      ctx.lineTo(24, 30);
      ctx.lineTo(8, 36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(46, 18);
      ctx.lineTo(32, 30);
      ctx.lineTo(48, 36);
      ctx.closePath();
      ctx.fill();
      // 날카로운 발톱
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 48, 3, 4);
      ctx.fillRect(33, 48, 3, 4);
      this.monsterCanvases.set(10, c);
    }

    // 11: 용왕 1페이즈 (Dragonlord - 인간형 마왕)
    {
      const [c, ctx] = this.createCanvas(56, 56);
      // 마왕 로브 (진한 보라색)
      ctx.fillStyle = '#4a148c';
      ctx.beginPath();
      ctx.moveTo(28, 6);
      ctx.lineTo(12, 48);
      ctx.lineTo(44, 48);
      ctx.closePath();
      ctx.fill();
      // 황금 망토 깃
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(22, 14, 12, 4);
      ctx.fillRect(20, 18, 16, 3);
      // 푸른빛 사악한 얼굴
      ctx.fillStyle = '#80deea';
      ctx.fillRect(24, 10, 8, 8);
      ctx.fillStyle = '#ff1744'; // 붉은 눈
      ctx.fillRect(25, 12, 2, 2);
      ctx.fillRect(29, 12, 2, 2);
      // 해골 마법 지팡이
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(40, 12, 3, 36);
      ctx.fillStyle = '#ffffff'; // 해골 머리
      ctx.fillRect(38, 8, 7, 7);
      ctx.fillStyle = '#000000';
      ctx.fillRect(39, 10, 2, 2);
      ctx.fillRect(42, 10, 2, 2);
      this.monsterCanvases.set(11, c);
    }

    // 12: 용왕 2페이즈 (Dragonlord True Dragon - 거대 진 용왕 폼!)
    {
      const [c, ctx] = this.createCanvas(64, 64);
      // 거대한 진 보라색 거룡
      ctx.fillStyle = '#311b92';
      // 거대 날개
      ctx.beginPath();
      ctx.moveTo(32, 24);
      ctx.lineTo(4, 8);
      ctx.lineTo(12, 36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(32, 24);
      ctx.lineTo(60, 8);
      ctx.lineTo(52, 36);
      ctx.closePath();
      ctx.fill();
      // 몸통
      ctx.fillStyle = '#4527a0';
      ctx.beginPath();
      ctx.ellipse(32, 38, 18, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // 용의 흉곽 (황금빛 비늘)
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.ellipse(32, 38, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // 위압적인 용의 머리와 턱
      ctx.fillStyle = '#512da8';
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(44, 22);
      ctx.lineTo(32, 30);
      ctx.lineTo(20, 22);
      ctx.closePath();
      ctx.fill();
      // 황금 거대 뿔
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(24, 14);
      ctx.lineTo(16, 2);
      ctx.lineTo(26, 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(40, 14);
      ctx.lineTo(48, 2);
      ctx.lineTo(38, 10);
      ctx.fill();
      // 불타는 붉은 눈과 송곳니
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(26, 18, 3, 3);
      ctx.fillRect(35, 18, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(28, 26, 2, 4);
      ctx.fillRect(34, 26, 2, 4);
      // 거대한 발톱
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(22, 52, 4, 6);
      ctx.fillRect(38, 52, 4, 6);
      this.monsterCanvases.set(12, c);
    }
  }

  // --- 게터 메서드 ---

  public getTile(type: TileType, frame: number = 0): HTMLCanvasElement {
    if (type === TileType.WATER) {
      return this.animatedWaterCanvases[frame % this.animatedWaterCanvases.length];
    }
    return this.tileCanvases.get(type) || this.tileCanvases.get(TileType.GRASS)!;
  }

  public getHeroSprite(dir: Direction, frame: number): HTMLCanvasElement {
    const key = `${dir}_${frame % 2}`;
    return this.heroCanvases.get(key) || this.heroCanvases.get('down_0')!;
  }

  public getNPCSprite(id: string): HTMLCanvasElement {
    return this.npcCanvases.get(id) || this.npcCanvases.get('guard')!;
  }

  public getMonsterSprite(index: number): HTMLCanvasElement {
    return this.monsterCanvases.get(index) || this.monsterCanvases.get(0)!;
  }
}
