// 드래곤 퀘스트 1 클래식 블랙 박스 윈도우 렌더러

export class WindowRenderer {
  // 고전 드퀘 테두리 박스 그리기
  public static drawWindow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.save();
    // 검은색 내부
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, w, h);

    // 흰색 이중 테두리
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // 내부 미세 테두리
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    ctx.restore();
  }

  // 상태창 렌더링 (용사 이름, 레벨, HP, MP, 골드, 경험치)
  public static drawStatusBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    name: string,
    level: number,
    hp: number,
    maxHp: number,
    mp: number,
    maxMp: number,
    gold: number,
    exp: number
  ) {
    const w = 90;
    const h = 76;
    this.drawWindow(ctx, x, y, w, h);

    ctx.save();
    ctx.font = '10px "DotGothic16", "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    ctx.fillText(`${name}`, x + 8, y + 8);
    ctx.fillText(`Lv ${level}`, x + 8, y + 20);

    // HP 색상 표시
    const hpRatio = hp / Math.max(1, maxHp);
    if (hpRatio <= 0.25) {
      ctx.fillStyle = '#ff4d4d'; // 위험
    } else if (hpRatio <= 0.5) {
      ctx.fillStyle = '#ffa502'; // 주의
    } else {
      ctx.fillStyle = '#2ed573';
    }
    ctx.fillText(`H ${hp}/${maxHp}`, x + 8, y + 32);

    ctx.fillStyle = '#70a1ff';
    ctx.fillText(`M ${mp}/${maxMp}`, x + 8, y + 44);

    ctx.fillStyle = '#ffd700';
    ctx.fillText(`G ${gold}`, x + 8, y + 56);

    ctx.restore();
  }

  // 커맨드 선택 창 (싸운다 / 주문 / 도구 / 도망)
  public static drawCommandMenu(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    cursor: number
  ) {
    const w = 76;
    const h = 64;
    this.drawWindow(ctx, x, y, w, h);

    ctx.save();
    ctx.font = '10px "DotGothic16", "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    const commands = [
      { text: '싸운다', x: x + 18, y: y + 10 },
      { text: '주문',   x: x + 18, y: y + 23 },
      { text: '도구',   x: x + 18, y: y + 36 },
      { text: '도망',   x: x + 18, y: y + 49 }
    ];

    commands.forEach((cmd, idx) => {
      ctx.fillText(cmd.text, cmd.x, cmd.y);
      if (cursor === idx) {
        // 커서 삼각형
        ctx.fillStyle = '#ffd700';
        ctx.fillText('▶', x + 8, cmd.y);
        ctx.fillStyle = '#ffffff';
      }
    });

    ctx.restore();
  }

  // 대화 및 전투 로그 창 (하단 박스)
  public static drawDialogueBox(
    ctx: CanvasRenderingContext2D,
    lines: string[],
    indicator: boolean = true
  ) {
    const x = 8;
    const y = 168;
    const w = 240;
    const h = 66;

    this.drawWindow(ctx, x, y, w, h);

    ctx.save();
    ctx.font = '10px "DotGothic16", "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    const maxLines = Math.min(3, lines.length);
    const startIdx = Math.max(0, lines.length - maxLines);

    for (let i = 0; i < maxLines; i++) {
      const line = lines[startIdx + i];
      ctx.fillText(line, x + 10, y + 10 + i * 16);
    }

    // 다음 대화 깜빡이는 화살표
    if (indicator && Math.floor(Date.now() / 300) % 2 === 0) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText('▼', x + w - 16, y + h - 14);
    }

    ctx.restore();
  }
}
