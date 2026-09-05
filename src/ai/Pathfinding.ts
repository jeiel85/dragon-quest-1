// A* (에이스타) 그리드 경로 탐색 알고리즘

import { Direction, Position, TileType } from '../core/Types';
import { GameMap } from '../data/WorldData';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class Pathfinding {
  // 타일 이동 가능 여부 체크
  public static isWalkable(map: GameMap, x: number, y: number, hasErdrickArmor: boolean = false): boolean {
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return false;
    const tile = map.tiles[y][x];

    // 이동 불가 타일 (바다, 산, 벽, 상점 카운터 등)
    if (tile === TileType.WATER ||
        tile === TileType.MOUNTAIN ||
        tile === TileType.BRICK_WALL ||
        tile === TileType.SHOP_COUNTER ||
        tile === TileType.VOID) {
      return false;
    }

    // NPC가 서 있는 타일은 통과 불가 (대화는 목표 지점에서만 발생)
    if (map.npcs.some(n => n.x === x && n.y === y)) {
      return false;
    }

    // 워프 타일은 목표 지점이 아닌 경우 통과 불가 (실수로 다른 맵으로 이동 방지)
    if (map.warps.some(w => w.x === x && w.y === y)) {
      return false;
    }

    // 로토의 갑옷이 없으면 배리어는 지나갈 수 있으나 가중치 증가
    return true;
  }

  // 타일 이동 비용 (독 늪이나 배리어는 우회하도록 비용 페널티)
  private static getTileCost(map: GameMap, x: number, y: number, hasErdrickArmor: boolean): number {
    const tile = map.tiles[y][x];
    if (hasErdrickArmor) return 1;

    if (tile === TileType.SWAMP) return 5;
    if (tile === TileType.BARRIER) return 15;
    return 1;
  }

  // 최단 경로 탐색
  public static findPath(
    map: GameMap,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    hasErdrickArmor: boolean = false
  ): Position[] {
    if (startX === targetX && startY === targetY) return [];

    const openList: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: startX,
      y: startY,
      g: 0,
      h: Math.abs(targetX - startX) + Math.abs(targetY - startY),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }   // right
    ];

    let maxSteps = 1200; // 성능 보호 한도

    while (openList.length > 0 && maxSteps > 0) {
      maxSteps--;
      // f가 가장 작은 노드 선택
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      if (current.x === targetX && current.y === targetY) {
        // 경로 복원
        const path: Position[] = [];
        let curr: Node | null = current;
        while (curr && curr.parent) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path;
      }

      closedSet.add(`${current.x},${current.y}`);

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const key = `${nx},${ny}`;

        if (closedSet.has(key)) continue;

        // 목표 지점이 아닌 경우 통과 가능 여부 확인
        if (nx !== targetX || ny !== targetY) {
          if (!this.isWalkable(map, nx, ny, hasErdrickArmor)) continue;
        }

        const moveCost = this.getTileCost(map, nx, ny, hasErdrickArmor);
        const g = current.g + moveCost;
        const h = Math.abs(targetX - nx) + Math.abs(targetY - ny);
        const f = g + h;

        const existingOpen = openList.find(n => n.x === nx && n.y === ny);
        if (existingOpen) {
          if (g < existingOpen.g) {
            existingOpen.g = g;
            existingOpen.f = f;
            existingOpen.parent = current;
          }
        } else {
          openList.push({ x: nx, y: ny, g, h, f, parent: current });
        }
      }
    }

    return []; // 경로 없음
  }

  // 현재 위치에서 다음 위치로 가기 위한 방향 계산
  public static getDirection(from: Position, to: Position): Direction {
    if (to.x > from.x) return 'right';
    if (to.x < from.x) return 'left';
    if (to.y > from.y) return 'down';
    return 'up';
  }
}
