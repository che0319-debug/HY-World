// HQ indoor scene — Task 10
// 開放辦公室 + 會議桌，HY 坐鎮中央，右側資料面板

const HQScene = (() => {

  // ── layout constants ──────────────────────────────────────────────
  const PANEL_X = 480;
  const PANEL_W = 200;
  const SCENE_W = 480;
  const H = 480;

  // ── rounded-rect helper (avoids ctx.roundRect compatibility issues) ─
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x,     y + r);
    ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
  }

  // ── scene-local bubble system ─────────────────────────────────────
  let bubbles = [];

  function showBubble(text, bx, by, color, borderColor, duration = 2.8) {
    bubbles = bubbles.filter(b => b.text !== text);
    bubbles.push({ text, bx, by, timer: duration, color, borderColor });
  }

  function drawBubbles(ctx, dt) {
    bubbles = bubbles.filter(b => { b.timer -= dt; return b.timer > 0; });
    bubbles.forEach(b => {
      const alpha = Math.min(1, b.timer / 0.4);
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '11px Courier New';
      const tw = ctx.measureText(b.text).width;
      const pad = 10, bh = 22, tailH = 8;
      const bw = tw + pad * 2;
      const ty = Math.round(b.by - bh - tailH);
      const tx = Math.max(4, Math.min(SCENE_W - bw - 4, Math.round(b.bx - bw / 2)));
      const tailX = Math.max(tx + 8, Math.min(tx + bw - 8, Math.round(b.bx)));

      ctx.fillStyle = b.color;
      rrect(ctx, tx, ty, bw, bh, 4); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tailX - 5, ty + bh);
      ctx.lineTo(tailX + 5, ty + bh);
      ctx.lineTo(tailX,     ty + bh + tailH);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = b.borderColor;
      ctx.lineWidth = 1;
      rrect(ctx, tx, ty, bw, bh, 4); ctx.stroke();
      ctx.fillStyle = '#1a1a2e';
      ctx.fillText(b.text, tx + pad, ty + 15);
      ctx.restore();
    });
  }

  // ── scene drawing ─────────────────────────────────────────────────
  function drawScene(ctx) {
    // Back wall (deep blue-grey)
    ctx.fillStyle = '#0e1020';
    ctx.fillRect(0, 0, SCENE_W, H);

    // Floor (dark tile grid)
    BaseScene.drawFloor('#0c0e22', '#090b1c');
    // Redraw wall above floor area (floor draws full canvas)
    ctx.fillStyle = '#0e1020';
    ctx.fillRect(0, 0, SCENE_W, H - 60);

    // Baseboard
    ctx.fillStyle = '#0a0c1e';
    ctx.fillRect(0, H - 64, SCENE_W, 4);

    // ── Back wall windows ─────────────────────────────────────────
    [50, 130, 210, 290].forEach(wx => {
      BaseScene.drawWindow(wx, 55, true, false); // cool blue tint
    });
    // Window rail
    ctx.fillStyle = '#1a1a30';
    ctx.fillRect(40, 50, 280, 3);
    // Venetian blind suggestion (subtle horizontal lines)
    ctx.fillStyle = 'rgba(20,30,60,0.35)';
    [50, 130, 210, 290].forEach(wx => {
      for (let i = 0; i < 6; i++) ctx.fillRect(wx + 2, 57 + i * 3, 16, 1);
    });

    // Company name on back wall (pixel-style signage)
    ctx.fillStyle = '#1a2040';
    ctx.fillRect(340, 50, 120, 32);
    ctx.strokeStyle = '#2a3560';
    ctx.lineWidth = 1;
    ctx.strokeRect(341, 51, 118, 30);
    ctx.fillStyle = '#44cc66';
    ctx.font = 'bold 10px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('HY WORLD HQ', 400, 62);
    ctx.fillStyle = '#226644';
    ctx.font = '8px Courier New';
    ctx.fillText('總部指揮中心', 400, 75);
    ctx.textAlign = 'left';

    // ── Whiteboard (left wall) ────────────────────────────────────
    const wbX = 8, wbY = 100, wbW = 80, wbH = 110;
    ctx.fillStyle = '#1c1e34';
    ctx.fillRect(wbX - 4, wbY - 4, wbW + 8, wbH + 8); // frame
    ctx.fillStyle = '#d0d8e8';
    ctx.fillRect(wbX, wbY, wbW, wbH);
    // Board content (sketched lines)
    ctx.strokeStyle = '#4466aa';
    ctx.lineWidth = 1;
    [[12, 115, 70, 115], [12, 125, 55, 125], [12, 135, 65, 135],
     [12, 148, 40, 148], [12, 158, 60, 158]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
    // Small diagram box
    ctx.strokeStyle = '#cc4444';
    ctx.strokeRect(14, 170, 28, 20);
    ctx.strokeStyle = '#44aa44';
    ctx.beginPath(); ctx.moveTo(42, 180); ctx.lineTo(70, 180); ctx.stroke();
    // Whiteboard label
    ctx.fillStyle = '#334';
    ctx.font = '7px Courier New';
    ctx.fillText('BOARD', wbX + 4, wbY + wbH + 10);
    // Marker tray
    ctx.fillStyle = '#1a1c30';
    ctx.fillRect(wbX, wbY + wbH, wbW, 5);

    // ── Bookshelf (right side, between scene area and panel) ──────
    const bsX = 430, bsY = 80, bsW = 46, bsH = 200;
    ctx.fillStyle = '#140e08';
    ctx.fillRect(bsX, bsY, bsW, bsH);
    // Shelves
    ctx.fillStyle = '#201608';
    [0, 50, 100, 150].forEach(dy => ctx.fillRect(bsX, bsY + dy + 46, bsW, 4));
    // Books (coloured spines)
    const bookColors = ['#aa2222','#2244aa','#22aa44','#aa6622','#6622aa','#aa2288',
                        '#44aaaa','#aaaa22','#883322','#225588'];
    let bx = bsX + 2;
    [0, 50, 100, 150].forEach(shelf => {
      bx = bsX + 2;
      for (let bi = 0; bi < 5; bi++) {
        const bw2 = 6 + (bi % 2) * 2;
        ctx.fillStyle = bookColors[(shelf / 50 * 3 + bi) % bookColors.length];
        ctx.fillRect(bx, bsY + shelf + 6, bw2, 40);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(bx, bsY + shelf + 6, 1, 40);
        bx += bw2 + 1;
      }
    });
    // Shelf label
    ctx.fillStyle = '#3a2a10';
    ctx.font = '7px Courier New';
    ctx.fillText('REFS', bsX + 8, bsY + bsH + 10);

    // ── Work desks (front area, two desks) ────────────────────────
    // Left desk
    BaseScene.drawDesk(30, H - 60 - 65, 110, 22);
    BaseScene.drawMonitor(55, H - 60 - 90);
    // Keyboard
    ctx.fillStyle = '#1a1a2c';
    ctx.fillRect(57, H - 60 - 68, 40, 6);
    ctx.fillStyle = '#222238';
    for (let ki = 0; ki < 5; ki++) ctx.fillRect(59 + ki * 7, H - 60 - 67, 5, 4);
    // Chair (in front of left desk)
    BaseScene.drawChair(65, H - 60 - 44, '#1c1c30');

    // Right desk
    BaseScene.drawDesk(230, H - 60 - 65, 110, 22);
    BaseScene.drawMonitor(255, H - 60 - 90);
    ctx.fillStyle = '#1a1a2c';
    ctx.fillRect(257, H - 60 - 68, 40, 6);
    ctx.fillStyle = '#222238';
    for (let ki = 0; ki < 5; ki++) ctx.fillRect(259 + ki * 7, H - 60 - 67, 5, 4);
    BaseScene.drawChair(265, H - 60 - 44, '#1c1c30');

    // ── Conference table (centre, HY sits here) ───────────────────
    const ctX = 100, ctY = H - 60 - 155, ctW = 220, ctH = 50;
    // Table shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(ctX + 5, ctY + ctH, ctW, 8);
    // Table surface
    ctx.fillStyle = '#1c1408';
    ctx.fillRect(ctX, ctY, ctW, ctH);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(ctX, ctY, ctW, 3);
    ctx.strokeStyle = '#120e04';
    ctx.lineWidth = 1;
    ctx.strokeRect(ctX + 0.5, ctY + 0.5, ctW - 1, ctH - 1);
    // Table legs
    ctx.fillStyle = '#0e0a04';
    [[ctX + 8, ctY + ctH], [ctX + ctW - 14, ctY + ctH]].forEach(([lx, ly]) => {
      ctx.fillRect(lx, ly, 6, 12);
    });
    // Name plate on table
    ctx.fillStyle = '#0d1a12';
    ctx.fillRect(ctX + ctW / 2 - 30, ctY + ctH / 2 - 7, 60, 14);
    ctx.strokeStyle = '#1a3a24';
    ctx.lineWidth = 1;
    ctx.strokeRect(ctX + ctW / 2 - 30, ctY + ctH / 2 - 7, 60, 14);
    ctx.fillStyle = '#44cc66';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('HY', ctX + ctW / 2, ctY + ctH / 2 + 3);
    ctx.textAlign = 'left';

    // Chairs around conference table (empty ones)
    [ctX + 15, ctX + 75, ctX + 145, ctX + 195].forEach(cx => {
      BaseScene.drawChair(cx, ctY + ctH + 5, '#16162a');
    });
    // HY's chair (behind table, slightly different shade)
    BaseScene.drawChair(ctX + ctW / 2 - 10, ctY - 18, '#1e1e36');

    // Small meeting items on table
    [ctX + 20, ctX + 160].forEach(ix => {
      // Paper stack
      ctx.fillStyle = '#ccc8b8';
      ctx.fillRect(ix, ctY + 8, 20, 14);
      ctx.fillStyle = '#bbb8a8';
      ctx.fillRect(ix + 1, ctY + 9, 18, 12);
      // Lines on paper
      ctx.strokeStyle = '#8888aa';
      ctx.lineWidth = 0.5;
      [12, 15, 18].forEach(py => {
        ctx.beginPath();
        ctx.moveTo(ix + 2, ctY + py);
        ctx.lineTo(ix + 16, ctY + py);
        ctx.stroke();
      });
    });
    // Coffee cup (HY's side)
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(ctX + ctW / 2 + 40, ctY + 14, 12, 14);
    ctx.fillStyle = '#441a0a';
    ctx.fillRect(ctX + ctW / 2 + 41, ctY + 15, 10, 4);

    // ── Status lights on ceiling (ambient) ────────────────────────
    [[60, 30], [200, 30], [340, 30], [430, 30]].forEach(([lx, ly]) => {
      ctx.fillStyle = 'rgba(60,100,200,0.06)';
      ctx.beginPath(); ctx.ellipse(lx, ly, 30, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a2040';
      ctx.fillRect(lx - 2, ly - 2, 4, 4);
    });

    // Panel divider
    ctx.fillStyle = '#0c0c22';
    ctx.fillRect(PANEL_X, 0, 1, H);
    ctx.fillStyle = '#1a1a38';
    ctx.fillRect(PANEL_X + 1, 0, 1, H);
  }

  function drawPanel(ctx, frame) {
    const px = PANEL_X + 1;
    const pw = PANEL_W - 1;

    // Background
    ctx.fillStyle = '#080818';
    ctx.fillRect(px, 0, pw, H);

    // Header
    ctx.fillStyle = '#0e1a14';
    ctx.fillRect(px, 0, pw, 40);
    ctx.fillStyle = '#44cc66';
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('🏢 總部 HQ', px + pw / 2, 16);
    ctx.fillStyle = '#226644';
    ctx.font = '9px Courier New';
    ctx.fillText('HY 的指揮中心', px + pw / 2, 30);
    ctx.textAlign = 'left';

    // Separator
    ctx.fillStyle = '#44cc6633';
    ctx.fillRect(px + 8, 40, pw - 16, 1);

    // HY status dot
    const pulse = 0.5 + 0.5 * Math.sin(frame * 4);
    ctx.fillStyle = `rgba(68,204,102,${0.3 + pulse * 0.4})`;
    ctx.beginPath(); ctx.arc(px + 16, 58, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#44cc66';
    ctx.beginPath(); ctx.arc(px + 16, 58, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aaaacc';
    ctx.font = '9px Courier New';
    ctx.fillText('HY · 在線', px + 28, 61);

    // Sections
    const sections = [
      {
        label: 'Claude 跨域建議',
        color: '#4488ff',
        y: 85,
        items: ['[Task 12 串接 API]', '— 讀取中 —'],
      },
      {
        label: '三 Bot 狀態摘要',
        color: '#44cc66',
        y: 175,
        items: [
          '@HY_Host_Bot ···',
          '@HY_MyFamily ···',
          '@ITRI_950157 ···',
        ],
      },
      {
        label: '今日任務清單',
        color: '#ffcc44',
        y: 280,
        items: ['[Task 12 串接 API]', '— 讀取中 —'],
      },
    ];

    sections.forEach(sec => {
      ctx.fillStyle = sec.color + '88';
      ctx.font = '8px Courier New';
      ctx.fillText(sec.label, px + 10, sec.y);
      ctx.fillStyle = sec.color + '22';
      ctx.fillRect(px + 10, sec.y + 4, pw - 20, 1);
      ctx.fillStyle = '#444466';
      ctx.font = '9px Courier New';
      sec.items.forEach((item, i) => {
        ctx.fillText(item, px + 12, sec.y + 20 + i * 16);
      });
    });

    // Footer
    ctx.fillStyle = '#0e1a14';
    ctx.fillRect(px, H - 36, pw, 36);
    ctx.fillStyle = '#446655';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('點擊 HY 對話', px + pw / 2, H - 18);
    ctx.textAlign = 'left';
  }

  // ── character click detection ─────────────────────────────────────
  const DIALOGUES = [
    '一切都在計畫中！',
    '需要跨域協調嗎？',
    '今天的任務清單很長...',
    '三個分身都在線上！',
    '有什麼需要決策的？',
  ];

  let hy = null;
  let clickHandler = null;

  function setupClick(canvas, cx, cy) {
    const hw = 8, hh = 28;
    clickHandler = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (680 / rect.width);
      const my = (e.clientY - rect.top)  * (480 / rect.height);
      if (mx >= cx - hw && mx <= cx + hw && my >= cy - hh && my <= cy) {
        const text = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
        showBubble(text, cx, cy - 32, '#f0fff4', '#44cc66');
      }
    };
    canvas.addEventListener('click', clickHandler);
  }

  // ── public ────────────────────────────────────────────────────────
  return {
    init(worldData) {
      const charCfg = worldData ? worldData.characters.find(c => c.id === 'hy') : null;
      // HY sits behind the conference table
      const ctX = 100, ctY = H - 60 - 155, ctW = 220;
      const sceneCharX = ctX + ctW / 2;
      const sceneCharY = ctY - 2; // feet just above table top

      hy = charCfg ? new Character(charCfg) : null;
      if (hy) {
        CharacterSprites.applyAll({ hy });
        hy.setState('working');
      }

      bubbles = [];
      const canvas = BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click', clickHandler);
      setupClick(canvas, sceneCharX, sceneCharY);

      BaseScene.startLoop((ctx, dt, W, H) => {
        drawScene(ctx);
        drawPanel(ctx, hy ? hy.frame : 0);

        if (hy) {
          hy.frame += dt;
          hy.drawAt(ctx, sceneCharX, sceneCharY, 'working');
        }

        drawBubbles(ctx, dt);
      });
    },

    cleanup() {
      if (clickHandler) {
        BaseScene.canvas.removeEventListener('click', clickHandler);
        clickHandler = null;
      }
      bubbles = [];
    }
  };
})();
