// Home indoor scene — Task 09
// 客廳 + 廚房，小因（xiaoyin）在場，右側資料面板

const HomeScene = (() => {

  // ── layout constants ──────────────────────────────────────────────
  const PANEL_X = 480; // right panel starts here
  const PANEL_W = 200; // panel width (480+200=680)
  const SCENE_W = 480; // left scene area width
  const H = 480;

  // ── bubble system (scene-local) ───────────────────────────────────
  let bubbles = [];

  function showBubble(ctx, text, bx, by, color, borderColor, duration = 2.8) {
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

      // Body
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(tx, ty, bw, bh, 4);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(tailX - 5, ty + bh);
      ctx.lineTo(tailX + 5, ty + bh);
      ctx.lineTo(tailX,     ty + bh + tailH);
      ctx.closePath();
      ctx.fill();
      // Border
      ctx.strokeStyle = b.borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, bw, bh, 4);
      ctx.stroke();
      // Text
      ctx.fillStyle = '#1a1a2e';
      ctx.fillText(b.text, tx + pad, ty + 15);
      ctx.restore();
    });
  }

  // ── scene drawing ─────────────────────────────────────────────────
  function drawScene(ctx) {
    // Back wall
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, SCENE_W, H);

    // Wall baseboard
    ctx.fillStyle = '#13132a';
    ctx.fillRect(0, H - 60, SCENE_W, 60);
    ctx.fillStyle = '#0e0e24';
    ctx.fillRect(0, H - 62, SCENE_W, 4);

    // Floor tiles (bottom 60px = floor)
    BaseScene.drawFloor('#13132a', '#0f0f22');
    // Re-draw walls above floor (floor draws full canvas)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, SCENE_W, H - 60);

    // Wainscoting (lower wall trim)
    ctx.fillStyle = '#15152c';
    ctx.fillRect(0, H - 110, SCENE_W, 48);
    ctx.fillStyle = '#1f1f38';
    ctx.fillRect(0, H - 112, SCENE_W, 3);
    ctx.fillStyle = '#0d0d1e';
    ctx.fillRect(0, H - 64, SCENE_W, 3);

    // ── Windows (back wall) ───────────────────────────────────────
    BaseScene.drawWindow( 40, 60, true, true);   // warm left
    BaseScene.drawWindow( 90, 60, true, true);   // warm right
    BaseScene.drawWindow(220, 60, true, false);  // cool (kitchen side)
    BaseScene.drawWindow(280, 60, true, false);

    // Window curtain rod
    ctx.fillStyle = '#2a2a44';
    ctx.fillRect(30, 54, 90, 3);
    ctx.fillRect(210, 54, 90, 3);
    // Curtain panels
    ctx.fillStyle = 'rgba(180,120,160,0.18)';
    ctx.fillRect(30, 54, 14, 60);
    ctx.fillRect(110, 54, 14, 60);
    ctx.fillStyle = 'rgba(120,140,200,0.15)';
    ctx.fillRect(208, 54, 12, 60);
    ctx.fillRect(298, 54, 12, 60);

    // ── Living room (left half) ───────────────────────────────────
    // Sofa (dark red-purple, 3-seat)
    const sofaX = 20, sofaY = H - 60 - 52;
    ctx.fillStyle = '#3a1a28';
    ctx.fillRect(sofaX, sofaY, 150, 52);           // base
    ctx.fillStyle = '#4a2235';
    ctx.fillRect(sofaX, sofaY, 150, 18);           // backrest
    ctx.fillStyle = '#3a1a28';
    ctx.fillRect(sofaX,       sofaY + 18, 18, 34); // left arm
    ctx.fillRect(sofaX + 132, sofaY + 18, 18, 34); // right arm
    // Cushions
    ctx.fillStyle = '#5a2a40';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(sofaX + 18 + i * 38, sofaY + 19, 36, 30);
      ctx.fillStyle = '#4a2235';
      ctx.fillRect(sofaX + 19 + i * 38, sofaY + 20, 34, 2);
      ctx.fillStyle = '#5a2a40';
    }
    // Sofa legs
    ctx.fillStyle = '#1a1220';
    [sofaX + 4, sofaX + 140].forEach(lx => ctx.fillRect(lx, sofaY + 48, 6, 12));

    // Coffee table (small, in front of sofa)
    const ctX = 60, ctY = H - 60 - 18;
    ctx.fillStyle = '#2a1e14';
    ctx.fillRect(ctX, ctY, 70, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(ctX, ctY, 70, 2);
    // Table legs
    ctx.fillStyle = '#1a1208';
    [ctX + 4, ctX + 62].forEach(lx => ctx.fillRect(lx, ctY + 12, 4, 6));
    // Decor: tiny plant on table
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(ctX + 50, ctY - 10, 8, 10);
    ctx.fillStyle = '#22aa22';
    ctx.beginPath(); ctx.arc(ctX + 54, ctY - 10, 6, 0, Math.PI * 2); ctx.fill();

    // TV unit (right side of living room)
    const tvX = 340, tvY = H - 60 - 80;
    ctx.fillStyle = '#111120';
    ctx.fillRect(tvX, tvY, 90, 80);
    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(tvX + 5, tvY + 5, 80, 50); // TV screen
    ctx.fillStyle = 'rgba(30,60,120,0.6)';
    ctx.fillRect(tvX + 6, tvY + 6, 78, 48);
    // Screen content (simple scanlines)
    ctx.fillStyle = 'rgba(100,160,255,0.08)';
    for (let i = 0; i < 24; i++) ctx.fillRect(tvX + 6, tvY + 6 + i * 2, 78, 1);
    // TV stand
    ctx.fillStyle = '#1a1a2c';
    ctx.fillRect(tvX + 35, tvY + 55, 20, 8);
    ctx.fillRect(tvX + 25, tvY + 63, 40, 4);

    // Side table (between sofa and TV)
    ctx.fillStyle = '#2a1e14';
    ctx.fillRect(190, H - 60 - 28, 30, 22);
    ctx.fillStyle = '#1a1208';
    ctx.fillRect(194, H - 60 - 6, 4, 6);
    ctx.fillRect(214, H - 60 - 6, 4, 6);
    // Lamp on side table
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(200, H - 60 - 52, 8, 24);  // pole
    ctx.fillStyle = '#cc9922';
    ctx.fillRect(196, H - 60 - 62, 16, 12); // shade
    // Lamp glow
    ctx.fillStyle = 'rgba(255,200,80,0.08)';
    ctx.beginPath(); ctx.ellipse(204, H - 60 - 50, 20, 15, 0, 0, Math.PI * 2); ctx.fill();

    // ── Kitchen divider (visual only) ────────────────────────────
    ctx.fillStyle = '#141428';
    ctx.fillRect(310, 0, 6, H - 60);
    ctx.fillStyle = '#1e1e3a';
    ctx.fillRect(310, 0, 2, H - 60);

    // ── Kitchen area (right of divider, up to PANEL_X) ───────────
    const kitX = 318;
    // Counter top
    ctx.fillStyle = '#1e1a14';
    ctx.fillRect(kitX, H - 60 - 55, SCENE_W - kitX, 55);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(kitX, H - 60 - 55, SCENE_W - kitX, 3);
    // Cabinet doors (above counter)
    ctx.fillStyle = '#17172e';
    ctx.fillRect(kitX, 100, SCENE_W - kitX, 80);
    ctx.strokeStyle = '#222240';
    ctx.lineWidth = 1;
    [0, 52].forEach(dx => {
      ctx.strokeRect(kitX + 4 + dx, 104, 46, 72);
    });
    // Cabinet handles
    ctx.fillStyle = '#4a4a7a';
    [kitX + 22, kitX + 74].forEach(hx => ctx.fillRect(hx, 136, 12, 4));

    // Sink (inset in counter)
    ctx.fillStyle = '#111122';
    ctx.fillRect(kitX + 10, H - 60 - 45, 50, 35);
    ctx.strokeStyle = '#1e1e38';
    ctx.lineWidth = 1;
    ctx.strokeRect(kitX + 11, H - 60 - 44, 48, 33);
    // Faucet
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(kitX + 30, H - 60 - 52, 6, 10);
    ctx.fillRect(kitX + 24, H - 60 - 52, 18, 4);

    // Small appliance (microwave on counter)
    ctx.fillStyle = '#1a1a28';
    ctx.fillRect(kitX + 70, H - 60 - 50, 60, 38);
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(kitX + 73, H - 60 - 47, 36, 30);
    ctx.fillStyle = 'rgba(0,200,100,0.7)';
    ctx.fillRect(kitX + 116, H - 60 - 44, 8, 8); // LED display

    // ── Panel divider line ────────────────────────────────────────
    ctx.fillStyle = '#0c0c22';
    ctx.fillRect(PANEL_X, 0, 1, H);
    ctx.fillStyle = '#1a1a38';
    ctx.fillRect(PANEL_X + 1, 0, 1, H);
  }

  function drawPanel(ctx, frame) {
    const px = PANEL_X + 1;
    const pw = PANEL_W - 1;

    // Panel background
    ctx.fillStyle = '#0a0a1e';
    ctx.fillRect(px, 0, pw, H);

    // Header
    ctx.fillStyle = '#151530';
    ctx.fillRect(px, 0, pw, 40);
    ctx.fillStyle = '#ff88bb';
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('🏠 Home', px + pw / 2, 16);
    ctx.fillStyle = '#664455';
    ctx.font = '9px Courier New';
    ctx.fillText('小因的空間', px + pw / 2, 30);
    ctx.textAlign = 'left';

    // Separator
    ctx.fillStyle = '#ff88bb33';
    ctx.fillRect(px + 8, 40, pw - 16, 1);

    // Status indicator (idle bounce of dot)
    const dotY = 58 + Math.sin(frame * 3) * 2;
    ctx.fillStyle = '#44ff88';
    ctx.beginPath(); ctx.arc(px + 16, dotY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#44ff8840';
    ctx.beginPath(); ctx.arc(px + 16, dotY, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aaaacc';
    ctx.font = '9px Courier New';
    ctx.fillText('小因 · 在線', px + 28, dotY + 3);

    // Sections
    const sections = [
      { label: '近期行程', y: 90, items: ['[Task 12 串接 API]', '— 資料讀取中 —'] },
      { label: '孩子注意事項', y: 170, items: ['[Task 12 串接 API]', '— 資料讀取中 —'] },
      { label: '家庭備忘', y: 250, items: ['[Task 12 串接 API]', '— 資料讀取中 —'] },
    ];

    sections.forEach(sec => {
      // Section label
      ctx.fillStyle = '#ff88bb88';
      ctx.font = '8px Courier New';
      ctx.fillText(sec.label, px + 10, sec.y);
      // Separator
      ctx.fillStyle = '#ff88bb22';
      ctx.fillRect(px + 10, sec.y + 4, pw - 20, 1);
      // Items
      ctx.fillStyle = '#555566';
      ctx.font = '9px Courier New';
      sec.items.forEach((item, i) => {
        ctx.fillText(item, px + 12, sec.y + 20 + i * 16);
      });
    });

    // Footer: click hint
    ctx.fillStyle = '#2a2a44';
    ctx.fillRect(px, H - 36, pw, 36);
    ctx.fillStyle = '#555577';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('點擊小因對話', px + pw / 2, H - 18);
    ctx.textAlign = 'left';
  }

  // ── character click detection ─────────────────────────────────────
  const DIALOGUES = [
    '家裡的事交給我！',
    '有什麼需要安排的嗎？',
    '孩子們今天很乖喔！',
    '今天晚餐想吃什麼？',
    '購物清單我幫你記著！',
  ];

  let xiaoyin = null;
  let charX = 0, charY = 0;
  let clickHandler = null;

  function setupClick(canvas, cx, cy) {
    charX = cx; charY = cy;
    const hw = 8, hh = 28;
    clickHandler = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (680 / rect.width);
      const my = (e.clientY - rect.top)  * (480 / rect.height);
      if (mx >= charX - hw && mx <= charX + hw && my >= charY - hh && my <= charY) {
        const text = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
        showBubble(null, text, charX, charY - 32, '#fff0f6', '#ff88bb');
      }
    };
    canvas.addEventListener('click', clickHandler);
  }

  // ── public ────────────────────────────────────────────────────────
  return {
    init(worldData) {
      // Find xiaoyin character from world data
      const charCfg = worldData ? worldData.characters.find(c => c.id === 'xiaoyin') : null;
      // Character position in indoor scene
      const sceneCharX = 140;
      const sceneCharY = H - 60 - 10; // standing on floor

      // Create a local Character instance for indoor rendering
      xiaoyin = charCfg ? new Character(charCfg) : null;
      if (xiaoyin) {
        // Apply sprites
        const cm = { xiaoyin };
        CharacterSprites.applyAll(cm);
        xiaoyin.setState('idle');
      }

      bubbles = [];

      // Remove any previous click handler
      const canvas = BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click', clickHandler);
      setupClick(canvas, sceneCharX, sceneCharY);

      BaseScene.startLoop((ctx, dt, W, H) => {
        drawScene(ctx);
        drawPanel(ctx, xiaoyin ? xiaoyin.frame : 0);

        if (xiaoyin) {
          xiaoyin.frame += dt;
          xiaoyin.drawAt(ctx, sceneCharX, sceneCharY, 'idle');
        }

        drawBubbles(ctx, dt);
      });
    },

    // Called by World.resume() → BaseScene.stopLoop() handles the loop
    cleanup() {
      if (clickHandler) {
        BaseScene.canvas.removeEventListener('click', clickHandler);
        clickHandler = null;
      }
      bubbles = [];
    }
  };
})();
