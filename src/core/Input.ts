// 키보드 및 모바일 터치 입력 관리자

import { Direction } from './Types';

export type ActionButton = 'action' | 'cancel' | 'menu';

export class Input {
  private keysDown: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();

  constructor() {
    this.initKeyboard();
    this.initTouch();
  }

  private initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // 방향키 스크롤 방지
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (!this.keysDown.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysDown.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });
  }

  private initTouch() {
    // 모바일 터치 D-Pad 바인딩
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const key = btn.getAttribute('data-key');
      if (!key) return;

      const press = (e: Event) => {
        e.preventDefault();
        this.keysDown.add(key);
        this.keysJustPressed.add(key);
      };
      const release = (e: Event) => {
        e.preventDefault();
        this.keysDown.delete(key);
      };

      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
    });

    // 캔버스 클릭/탭 시 Action(Space/Z) 트리거 지원
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      const triggerAction = (e: Event) => {
        this.keysJustPressed.add('Space');
      };
      canvas.addEventListener('click', triggerAction);
      canvas.addEventListener('touchstart', (e) => {
        this.keysJustPressed.add('Space');
      }, { passive: true });
    }

    // 모바일 A/B 버튼 바인딩
    document.querySelectorAll('.round-btn').forEach(btn => {
      const key = btn.getAttribute('data-key');
      if (!key) return;

      const press = (e: Event) => {
        e.preventDefault();
        this.keysDown.add(key);
        this.keysJustPressed.add(key);
      };
      const release = (e: Event) => {
        e.preventDefault();
        this.keysDown.delete(key);
      };

      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
    });
  }

  // 매 프레임 끝에서 justPressed 초기화
  public update() {
    this.keysJustPressed.clear();
  }

  public isDirectionPressed(dir: Direction): boolean {
    switch (dir) {
      case 'up':
        return this.keysDown.has('ArrowUp') || this.keysDown.has('KeyW');
      case 'down':
        return this.keysDown.has('ArrowDown') || this.keysDown.has('KeyS');
      case 'left':
        return this.keysDown.has('ArrowLeft');
      case 'right':
        return this.keysDown.has('ArrowRight') || this.keysDown.has('KeyD');
    }
  }

  public isDirectionJustPressed(dir: Direction): boolean {
    switch (dir) {
      case 'up':
        return this.keysJustPressed.has('ArrowUp') || this.keysJustPressed.has('KeyW');
      case 'down':
        return this.keysJustPressed.has('ArrowDown') || this.keysJustPressed.has('KeyS');
      case 'left':
        return this.keysJustPressed.has('ArrowLeft');
      case 'right':
        return this.keysJustPressed.has('ArrowRight') || this.keysJustPressed.has('KeyD');
    }
  }

  public isActionJustPressed(): boolean {
    return (
      this.keysJustPressed.has('KeyZ') ||
      this.keysJustPressed.has('Enter') ||
      this.keysJustPressed.has('Space')
    );
  }

  public isCancelJustPressed(): boolean {
    return (
      this.keysJustPressed.has('KeyX') ||
      this.keysJustPressed.has('Escape')
    );
  }

  public isAutoToggleJustPressed(): boolean {
    return this.keysJustPressed.has('KeyA');
  }
}
