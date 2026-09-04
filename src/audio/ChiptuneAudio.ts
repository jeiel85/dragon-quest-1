// 4채널 NES Web Audio Chiptune 사운드 신디사이저 엔진
// 외부 음원 파일 의존 없이 브라우저 자체에서 100% 프로시저럴 코드로 합성 재생

type Note = [string, number]; // [음계이름 또는 쉬기, 음길이(박자)]

export class ChiptuneAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentBgm: string | null = null;
  private bgmTimer: number | null = null;
  private isInitialized: boolean = false;

  // 음계 주파수 테이블 (A4 = 440Hz 기준)
  private readonly NOTE_FREQ: { [key: string]: number } = {
    'R': 0, // Rest (쉼표)
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00, 'B6': 1975.53
  };

  constructor() {
    // 사용자 첫 인터랙션 시 오디오 컨텍스트 활성화
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgm();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- 효과음 (Sound Effects) ---

  // 1. 커맨드 커서 이동 및 선택음
  public playSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1760, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // 2. 취소 및 창 닫기음
  public playCancel() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(220, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 3. 공격 타격음 (슬래시 노이즈)
  public playAttack() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // 4. 회심의 일격 (크리티컬 히트)
  public playCritical() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 강력한 펄스 + 노이즈 폭발
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    this.playAttack();
  }

  // 5. 마법 시전음 (호이미, 기라 등)
  public playSpell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    osc.frequency.linearRampToValueAtTime(1800, now + 0.45);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // 6. 회복 완료음
  public playHeal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const start = now + idx * 0.08;
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  // 7. 계단 오르내리기음
  public playStairs() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const start = now + idx * 0.06;
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.08);
    });
  }

  // 8. 문 열기음
  public playDoor() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);
    osc.frequency.linearRampToValueAtTime(200, now + 0.2);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 9. 보물상자 열기음
  public playChest() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 659.25, 783.99, 880.00, 1046.50];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const start = now + idx * 0.07;
      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  // 10. 레벨 업 팡파레
  public playLevelUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // 드퀘 특유의 레벨업 징글
    const notes: [number, number][] = [
      [523.25, 0.1], // C5
      [587.33, 0.1], // D5
      [659.25, 0.1], // E5
      [698.46, 0.1], // F5
      [783.99, 0.2], // G5
      [659.25, 0.1], // E5
      [783.99, 0.4], // G5
      [1046.50, 0.6] // C6
    ];

    let current = this.ctx.currentTime;
    notes.forEach(([freq, dur]) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(current);
      osc.stop(current + dur);
      current += dur;
    });
  }

  // 11. 승리 팡파레
  public playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes: [number, number][] = [
      [523.25, 0.12], [523.25, 0.12], [523.25, 0.12],
      [523.25, 0.3], [415.30, 0.3], [466.16, 0.3],
      [523.25, 0.2], [466.16, 0.1], [523.25, 0.6]
    ];

    let current = this.ctx.currentTime;
    notes.forEach(([freq, dur]) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(current);
      osc.stop(current + dur);
      current += dur;
    });
  }

  // 12. 숙박(여관) 징글
  public playInn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes: [number, number][] = [
      [392.00, 0.2], [523.25, 0.2], [659.25, 0.2], [783.99, 0.4],
      [659.25, 0.2], [783.99, 0.6]
    ];
    let current = this.ctx.currentTime;
    notes.forEach(([freq, dur]) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(current);
      osc.stop(current + dur);
      current += dur;
    });
  }

  // --- 배경음악 (BGM - Chiptune Loop Engines) ---

  public stopBgm() {
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgm = null;
  }

  public playBgm(type: 'TITLE' | 'CASTLE' | 'OVERWORLD' | 'TOWN' | 'DUNGEON' | 'BATTLE' | 'BOSS' | 'ENDING') {
    if (this.isMuted) return;
    if (this.currentBgm === type) return;

    this.init();
    this.stopBgm();
    this.currentBgm = type;

    const loopBgm = () => {
      if (this.currentBgm !== type || this.isMuted || !this.ctx) return;
      const duration = this.scheduleBgmTrack(type);
      this.bgmTimer = window.setTimeout(loopBgm, Math.max(100, duration * 1000 - 50));
    };

    loopBgm();
  }

  private scheduleBgmTrack(type: string): number {
    if (!this.ctx) return 1;

    let tempo = 120; // BPM
    let melody: Note[] = [];
    let bass: Note[] = [];

    switch (type) {
      case 'TITLE':
        // 로토의 테마 (오프닝 서곡 팡파레)
        tempo = 115;
        melody = [
          ['C4', 0.5], ['F4', 1.0], ['G4', 0.5], ['A4', 1.0], ['A#4', 0.5],
          ['C5', 1.5], ['A4', 0.5], ['F4', 1.0], ['G4', 2.0],
          ['C4', 0.5], ['G4', 1.0], ['A4', 0.5], ['A#4', 1.0], ['C5', 0.5],
          ['D5', 1.5], ['A#4', 0.5], ['G4', 1.0], ['F4', 2.0]
        ];
        bass = [
          ['F2', 1.0], ['A2', 1.0], ['C3', 1.0], ['F3', 1.0],
          ['F2', 1.0], ['A2', 1.0], ['C3', 1.0], ['C3', 1.0],
          ['C2', 1.0], ['E2', 1.0], ['G2', 1.0], ['C3', 1.0],
          ['A#2', 1.0], ['C3', 1.0], ['F2', 2.0]
        ];
        break;

      case 'CASTLE':
        // 탄타겔 성 테마 (기품 있는 바로크 궁정풍)
        tempo = 100;
        melody = [
          ['F4', 1.0], ['G4', 0.5], ['A4', 0.5], ['F4', 1.0], ['C4', 1.0],
          ['D4', 0.5], ['E4', 0.5], ['F4', 1.0], ['G4', 1.5], ['A4', 0.5],
          ['A#4', 1.0], ['A4', 0.5], ['G4', 0.5], ['A4', 1.0], ['F4', 1.0],
          ['G4', 0.5], ['F4', 0.5], ['E4', 1.0], ['F4', 2.0]
        ];
        bass = [
          ['F2', 2.0], ['A2', 2.0], ['A#2', 2.0], ['C3', 2.0],
          ['D2', 2.0], ['C2', 2.0], ['A#2', 1.0], ['C3', 1.0], ['F2', 2.0]
        ];
        break;

      case 'OVERWORLD':
        // 알레프갈드 대륙 광야 테마 (미지의 세계 - 웅장하고 결의에 찬 선율)
        tempo = 105;
        melody = [
          ['D4', 1.0], ['A4', 1.0], ['G4', 0.5], ['F4', 0.5], ['E4', 0.5], ['F4', 0.5],
          ['D4', 1.5], ['C4', 0.5], ['D4', 2.0],
          ['F4', 1.0], ['C5', 1.0], ['A#4', 0.5], ['A4', 0.5], ['G4', 0.5], ['A4', 0.5],
          ['F4', 1.5], ['E4', 0.5], ['D4', 2.0]
        ];
        bass = [
          ['D2', 1.0], ['D3', 1.0], ['D2', 1.0], ['D3', 1.0],
          ['A#2', 1.0], ['C3', 1.0], ['D3', 2.0],
          ['F2', 1.0], ['F3', 1.0], ['F2', 1.0], ['F3', 1.0],
          ['C3', 1.0], ['A2', 1.0], ['D2', 2.0]
        ];
        break;

      case 'TOWN':
        // 평화로운 마을 테마 (라다톰, 마이라 등)
        tempo = 110;
        melody = [
          ['C5', 0.75], ['D5', 0.25], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 0.5],
          ['E4', 1.0], ['G4', 1.0], ['C5', 1.5], ['R', 0.5],
          ['A4', 0.75], ['B4', 0.25], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 0.5],
          ['D4', 1.0], ['G4', 1.0], ['C4', 2.0]
        ];
        bass = [
          ['C3', 1.0], ['E3', 1.0], ['G3', 1.0], ['C4', 1.0],
          ['C3', 1.0], ['G3', 1.0], ['E3', 1.0], ['C3', 1.0],
          ['F2', 1.0], ['A2', 1.0], ['C3', 1.0], ['F3', 1.0],
          ['G2', 1.0], ['B2', 1.0], ['C3', 2.0]
        ];
        break;

      case 'DUNGEON':
        // 어두운 동굴 테마 (로토의 동굴, 늪지의 동굴)
        tempo = 85;
        melody = [
          ['E3', 0.5], ['G3', 0.5], ['B3', 0.5], ['E4', 0.5], ['D#4', 1.0], ['R', 1.0],
          ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['C5', 0.5], ['B4', 1.0], ['R', 1.0],
          ['A#3', 0.5], ['D4', 0.5], ['F4', 0.5], ['A#4', 0.5], ['A4', 1.0], ['G#3', 1.0],
          ['E3', 2.0]
        ];
        bass = [
          ['E2', 1.0], ['E2', 1.0], ['D#2', 2.0],
          ['C2', 1.0], ['C2', 1.0], ['B1', 2.0],
          ['A#1', 1.0], ['A#1', 1.0], ['G#1', 2.0],
          ['E1', 2.0]
        ];
        break;

      case 'BATTLE':
        // 전투 테마 (빠르고 긴박한 비트)
        tempo = 145;
        melody = [
          ['E4', 0.5], ['E4', 0.25], ['E4', 0.25], ['G4', 0.5], ['E4', 0.5],
          ['A4', 0.5], ['G4', 0.5], ['F#4', 0.5], ['D#4', 0.5],
          ['E4', 0.5], ['E4', 0.25], ['E4', 0.25], ['B4', 0.5], ['A4', 0.5],
          ['G4', 0.5], ['A4', 0.5], ['B4', 1.0]
        ];
        bass = [
          ['E2', 0.5], ['E3', 0.5], ['E2', 0.5], ['E3', 0.5],
          ['C3', 0.5], ['C4', 0.5], ['B2', 0.5], ['B3', 0.5],
          ['E2', 0.5], ['E3', 0.5], ['E2', 0.5], ['E3', 0.5],
          ['A2', 0.5], ['B2', 0.5], ['E2', 1.0]
        ];
        break;

      case 'BOSS':
        // 마왕 용왕 최종 결전 테마 (드라코니안 최종전)
        tempo = 135;
        melody = [
          ['D4', 0.5], ['D4', 0.5], ['G#4', 1.0], ['G4', 0.5], ['F4', 0.5], ['D4', 1.0],
          ['C#4', 0.5], ['E4', 0.5], ['A4', 1.0], ['G#4', 0.5], ['F#4', 0.5], ['D#4', 1.0],
          ['D4', 0.5], ['F4', 0.5], ['A#4', 1.0], ['A4', 0.5], ['G4', 0.5], ['F4', 1.0],
          ['E4', 1.0], ['C#4', 1.0], ['D4', 2.0]
        ];
        bass = [
          ['D2', 0.5], ['A2', 0.5], ['D3', 0.5], ['A2', 0.5],
          ['C#2', 0.5], ['G#2', 0.5], ['C#3', 0.5], ['G#2', 0.5],
          ['A#1', 0.5], ['F2', 0.5], ['A#2', 0.5], ['F2', 0.5],
          ['A1', 1.0], ['A2', 1.0], ['D2', 2.0]
        ];
        break;

      case 'ENDING':
        // 평화의 피날레 (엔딩곡)
        tempo = 110;
        melody = [
          ['F4', 1.0], ['A4', 1.0], ['C5', 1.5], ['D5', 0.5],
          ['C5', 1.0], ['A#4', 0.5], ['A4', 0.5], ['G4', 2.0],
          ['E4', 1.0], ['G4', 1.0], ['A#4', 1.5], ['C5', 0.5],
          ['A4', 1.0], ['G4', 0.5], ['E4', 0.5], ['F4', 2.0]
        ];
        bass = [
          ['F2', 2.0], ['A2', 2.0], ['A#2', 2.0], ['C3', 2.0],
          ['C2', 2.0], ['E2', 2.0], ['F2', 2.0], ['F2', 2.0]
        ];
        break;

      default:
        return 1;
    }

    const beatDur = 60 / tempo;
    const now = this.ctx.currentTime;

    // 1채널: 리드 멜로디 (Square / Pulse Wave)
    let leadTime = now;
    melody.forEach(([note, beats]) => {
      const dur = beats * beatDur;
      const freq = this.NOTE_FREQ[note] || 0;
      if (freq > 0 && this.ctx) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, leadTime);
        gain.gain.setValueAtTime(0.10, leadTime + dur * 0.85);
        gain.gain.exponentialRampToValueAtTime(0.001, leadTime + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(leadTime);
        osc.stop(leadTime + dur);
      }
      leadTime += dur;
    });

    // 2채널: 베이스 라인 (Triangle Wave)
    let bassTime = now;
    bass.forEach(([note, beats]) => {
      const dur = beats * beatDur;
      const freq = this.NOTE_FREQ[note] || 0;
      if (freq > 0 && this.ctx) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, bassTime);
        gain.gain.exponentialRampToValueAtTime(0.001, bassTime + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(bassTime);
        osc.stop(bassTime + dur);
      }
      bassTime += dur;
    });

    return Math.max(leadTime - now, bassTime - now);
  }
}
