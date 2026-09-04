// 드래곤 퀘스트 1 웹앱 엔트리 포인트

import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const game = new Game(canvas);
  (window as any).game = game;
  game.start();

  // 브라우저 AudioContext 자동 재생 정책 대응: 캔버스 터치/클릭 시 활성화
  const unlockAudio = () => {
    game.audio.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // 상단 버튼 바인딩
  // 1. 오디오 토글
  const audioBtn = document.getElementById('btn-audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const muted = game.audio.toggleMute();
      audioBtn.textContent = muted ? '🔇 BGM OFF' : '🔊 BGM ON';
    });
  }

  // 2. AI 자동 진행 토글
  const autoBtn = document.getElementById('btn-auto-play');
  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      game.toggleAutoPlay();
    });
  }

  // 3. 배속 설정
  const speedBtn = document.getElementById('btn-speed');
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      game.cycleSpeed();
    });
  }

  // 4. CRT 스캔라인 효과 토글
  const crtBtn = document.getElementById('btn-crt');
  const scanlines = document.getElementById('crt-scanlines');
  if (crtBtn && scanlines) {
    crtBtn.addEventListener('click', () => {
      const isVisible = scanlines.style.display !== 'none';
      scanlines.style.display = isVisible ? 'none' : 'block';
      crtBtn.textContent = isVisible ? '📺 CRT OFF' : '📺 CRT ON';
    });
  }

  // 5. 치트 / Lv UP
  const cheatBtn = document.getElementById('btn-cheat');
  if (cheatBtn) {
    cheatBtn.addEventListener('click', () => {
      game.hero.boostStats();
      game.audio.playLevelUp();
      game.showDialogue([
        '⭐ 신의 가호가 깃들었다!',
        '용사의 레벨이 20으로 상승하고 전설의 장비와 군자금을 획득했다!'
      ]);
    });
  }

  // 6. 저장 (Save)
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const data = game.hero.serialize();
      localStorage.setItem('dq1_hero_save', data);
      game.audio.playInn();
      game.showDialogue(['모험의 서(진행 상황)를 무사히 저장했습니다!']);
    });
  }

  // 7. 리셋 (Reset)
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('모험을 처음부터 다시 시작하시겠습니까?')) {
        localStorage.removeItem('dq1_hero_save');
        window.location.reload();
      }
    });
  }

  // 저장 데이터가 있으면 복원 제안
  const savedData = localStorage.getItem('dq1_hero_save');
  if (savedData) {
    try {
      game.hero.deserialize(savedData);
    } catch (e) {
      console.warn('Save data load error:', e);
    }
  }
});
