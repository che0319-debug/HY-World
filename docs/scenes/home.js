// Home indoor scene — Task 09 (fixed)
// 客廳 + 廚房，小因（xiaoyin）在場，右側資料面板

const HomeScene = (() => {

  // ── layout ────────────────────────────────────────────────────────
  const PANEL_X = 480;
  const PANEL_W = 200;
  const SCENE_W = 480;
  const H = 480;
  const FLOOR_Y = H - 60; // y=420 — floor starts here

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

  function showBubble(text, bx, by, color, borderColor, duration) {
    duration = duration || 2.8;
    bubbles = bubbles.filter(function(b) { return b.text !== text; });
    bubbles.push({ text: text, bx: bx, by: by, timer: duration, color: color, borderColor: borderColor });
  }

  function drawBubbles(ctx, dt) {
    bubbles = bubbles.filter(function(b) { b.timer -= dt; return b.timer > 0; });
    bubbles.forEach(function(b) {
      var alpha = Math.min(1, b.timer / 0.4);
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '11px Courier New';
      var tw  = ctx.measureText(b.text).width;
      var pad = 10, bh = 22, tailH = 8;
      var bw  = tw + pad * 2;
      var ty  = Math.round(b.by - bh - tailH);
      var tx  = Math.max(4, Math.min(SCENE_W - bw - 4, Math.round(b.bx - bw / 2)));
      var tailX = Math.max(tx + 8, Math.min(tx + bw - 8, Math.round(b.bx)));

      ctx.fillStyle = b.color;
      rrect(ctx, tx, ty, bw, bh, 4);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tailX - 5, ty + bh);
      ctx.lineTo(tailX + 5, ty + bh);
      ctx.lineTo(tailX,     ty + bh + tailH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = b.borderColor;
      ctx.lineWidth = 1;
      rrect(ctx, tx, ty, bw, bh, 4);
      ctx.stroke();
      ctx.fillStyle = '#1a1a2e';
      ctx.fillText(b.text, tx + pad, ty + 15);
      ctx.restore();
    });
  }

  // ── floor (scene-area only, no full-canvas flood) ─────────────────
  function drawFloor(ctx) {
    ctx.fillStyle = '#12122a';
    ctx.fillRect(0, FLOOR_Y, SCENE_W, H - FLOOR_Y);
    ctx.strokeStyle = '#0d0d20';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = 0; x <= SCENE_W; x += 20) {
      ctx.moveTo(x + 0.5, FLOOR_Y);
      ctx.lineTo(x + 0.5, H);
    }
    for (var y = FLOOR_Y; y <= H; y += 20) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(SCENE_W, y + 0.5);
    }
    ctx.stroke();
  }

  // ── scene drawing ─────────────────────────────────────────────────
  function drawScene(ctx) {
    // 1. Wall background
    ctx.fillStyle = '#181830';
    ctx.fillRect(0, 0, SCENE_W, FLOOR_Y);

    // 2. Floor
    drawFloor(ctx);

    // 3. Baseboard trim
    ctx.fillStyle = '#1f1f3a';
    ctx.fillRect(0, FLOOR_Y - 4, SCENE_W, 4);

    // 4. Lower wall wainscoting
    ctx.fillStyle = '#141428';
    ctx.fillRect(0, FLOOR_Y - 60, SCENE_W, 56);
    ctx.fillStyle = '#1c1c34';
    ctx.fillRect(0, FLOOR_Y - 62, SCENE_W, 3);

    // 5. Windows (back wall, y=60)
    var winY = 55;
    // Curtain rod
    ctx.fillStyle = '#282844';
    ctx.fillRect(28, winY - 6, 82, 3);
    ctx.fillRect(210, winY - 6, 82, 3);
    // Left window pair (warm light)
    BaseScene.drawWindow(34,  winY, true, true);
    BaseScene.drawWindow(68,  winY, true, true);
    // Right window pair (warm light)
    BaseScene.drawWindow(216, winY, true, true);
    BaseScene.drawWindow(250, winY, true, true);
    // Curtain panels (translucent drapes either side)
    ctx.fillStyle = 'rgba(180,130,155,0.18)';
    ctx.fillRect(28,  winY - 6, 10, 65);
    ctx.fillRect(100, winY - 6, 10, 65);
    ctx.fillRect(210, winY - 6, 10, 65);
    ctx.fillRect(282, winY - 6, 10, 65);

    // 6. Sofa (3-seater, left of scene)
    var sofaX = 18, sofaY = FLOOR_Y - 55;
    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(sofaX + 3, sofaY + 52, 148, 6);
    // Back rest
    ctx.fillStyle = '#3a1a28';
    ctx.fillRect(sofaX, sofaY, 150, 18);
    // Arms
    ctx.fillStyle = '#321520';
    ctx.fillRect(sofaX,       sofaY + 18, 18, 37);
    ctx.fillRect(sofaX + 132, sofaY + 18, 18, 37);
    // Seat cushions (3 segments)
    for (var ci = 0; ci < 3; ci++) {
      ctx.fillStyle = '#512238';
      ctx.fillRect(sofaX + 18 + ci * 38, sofaY + 18, 36, 34);
      // Cushion highlight
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(sofaX + 19 + ci * 38, sofaY + 19, 34, 3);
      // Cushion crease
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(sofaX + 18 + ci * 38, sofaY + 46, 36, 2);
    }
    // Legs
    ctx.fillStyle = '#1a1020';
    ctx.fillRect(sofaX + 4,   sofaY + 52, 6, 8);
    ctx.fillRect(sofaX + 140, sofaY + 52, 6, 8);

    // 7. Coffee table (in front of sofa)
    var ctX = 55, ctY = FLOOR_Y - 20;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(ctX + 3, ctY + 13, 70, 5);
    ctx.fillStyle = '#2c2018';
    ctx.fillRect(ctX, ctY, 70, 13);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(ctX, ctY, 70, 2);
    ctx.fillStyle = '#1a1208';
    ctx.fillRect(ctX + 4,  ctY + 13, 4, 7);
    ctx.fillRect(ctX + 62, ctY + 13, 4, 7);
    // Tiny plant on table
    ctx.fillStyle = '#203020';
    ctx.fillRect(ctX + 50, ctY - 12, 8, 12);
    ctx.fillStyle = '#2aaa2a';
    ctx.beginPath(); ctx.arc(ctX + 54, ctY - 12, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a881a';
    ctx.beginPath(); ctx.arc(ctX + 51, ctY - 9, 4, 0, Math.PI * 2); ctx.fill();

    // 8. Floor lamp (beside sofa, right side)
    var lampX = 178, lampY = FLOOR_Y - 70;
    // Pole
    ctx.fillStyle = '#38385a';
    ctx.fillRect(lampX + 3, lampY, 4, 65);
    // Base
    ctx.fillStyle = '#28283a';
    ctx.fillRect(lampX, lampY + 65, 10, 5);
    // Shade
    ctx.fillStyle = '#cc9922';
    ctx.fillRect(lampX - 5, lampY - 14, 20, 14);
    ctx.fillStyle = '#aa7710';
    ctx.fillRect(lampX - 5, lampY - 14, 20, 3);
    // Glow
    ctx.fillStyle = 'rgba(255,200,80,0.06)';
    ctx.beginPath(); ctx.ellipse(lampX + 5, lampY + 5, 28, 22, 0, 0, Math.PI * 2); ctx.fill();

    // 9. TV unit (right of living room)
    var tvX = 290, tvY = FLOOR_Y - 85;
    // Cabinet
    ctx.fillStyle = '#0f0f20';
    ctx.fillRect(tvX, tvY + 45, 120, 40);
    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(tvX + 3, tvY + 48, 50, 34);
    ctx.fillRect(tvX + 57, tvY + 48, 60, 34);
    // Door handles
    ctx.fillStyle = '#444466';
    ctx.fillRect(tvX + 26, tvY + 63, 10, 3);
    ctx.fillRect(tvX + 80, tvY + 63, 10, 3);
    // TV screen
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(tvX + 10, tvY, 100, 46);
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(tvX + 12, tvY + 2, 96, 42);
    // Screen glow (blue)
    ctx.fillStyle = 'rgba(40,80,180,0.4)';
    ctx.fillRect(tvX + 13, tvY + 3, 94, 40);
    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (var sl = 0; sl < 20; sl++) ctx.fillRect(tvX + 13, tvY + 3 + sl * 2, 94, 1);
    // TV stand
    ctx.fillStyle = '#181828';
    ctx.fillRect(tvX + 52, tvY + 46, 16, 4);

    // 10. Kitchen divider wall
    ctx.fillStyle = '#12121e';
    ctx.fillRect(280, 0, 8, FLOOR_Y);
    ctx.fillStyle = '#1c1c2e';
    ctx.fillRect(280, 0, 2, FLOOR_Y);

    // 11. Kitchen (right of divider)
    var kitX = 292;
    // Upper cabinets
    ctx.fillStyle = '#161628';
    ctx.fillRect(kitX, 90, SCENE_W - kitX - 4, 85);
    ctx.strokeStyle = '#202038';
    ctx.lineWidth = 1;
    // Cabinet door lines
    var cabW = Math.floor((SCENE_W - kitX - 8) / 2);
    ctx.strokeRect(kitX + 4, 94, cabW - 2, 77);
    ctx.strokeRect(kitX + cabW + 4, 94, cabW - 2, 77);
    // Cabinet handles
    ctx.fillStyle = '#4a4a7a';
    ctx.fillRect(kitX + cabW / 2 - 6, 128, 12, 3);
    ctx.fillRect(kitX + cabW + cabW / 2 - 2, 128, 12, 3);

    // Counter top
    var counterY = FLOOR_Y - 58;
    ctx.fillStyle = '#1e1a14';
    ctx.fillRect(kitX, counterY, SCENE_W - kitX - 4, 58);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(kitX, counterY, SCENE_W - kitX - 4, 3);
    ctx.strokeStyle = '#14100a';
    ctx.lineWidth = 1;
    ctx.strokeRect(kitX + 0.5, counterY + 0.5, SCENE_W - kitX - 5, 57);

    // Sink
    var sinkX = kitX + 8, sinkY = counterY + 8;
    ctx.fillStyle = '#0e0e1c';
    ctx.fillRect(sinkX, sinkY, 56, 38);
    ctx.fillStyle = '#181830';
    ctx.fillRect(sinkX + 2, sinkY + 2, 52, 34);
    ctx.strokeStyle = '#202040';
    ctx.lineWidth = 1;
    ctx.strokeRect(sinkX + 0.5, sinkY + 0.5, 55, 37);
    // Faucet
    ctx.fillStyle = '#3a3a58';
    ctx.fillRect(sinkX + 22, counterY - 10, 6, 12);
    ctx.fillRect(sinkX + 14, counterY - 10, 22, 4);

    // Stovetop (right of sink)
    var stoveX = kitX + 72, stoveY = counterY + 6;
    ctx.fillStyle = '#111124';
    ctx.fillRect(stoveX, stoveY, 100, 44);
    // Burners
    [[stoveX + 18, stoveY + 13], [stoveX + 60, stoveY + 13],
     [stoveX + 18, stoveY + 33], [stoveX + 60, stoveY + 33]].forEach(function(pos) {
      ctx.fillStyle = '#0a0a1a';
      ctx.beginPath(); ctx.arc(pos[0], pos[1], 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#282840';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(pos[0], pos[1], 9, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#1a1a30';
      ctx.beginPath(); ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2); ctx.fill();
    });
    // Knob panel
    ctx.fillStyle = '#0e0e20';
    ctx.fillRect(stoveX + 82, stoveY + 8, 14, 32);

    // 12. Panel divider
    ctx.fillStyle = '#080818';
    ctx.fillRect(PANEL_X, 0, 1, H);
    ctx.fillStyle = '#181830';
    ctx.fillRect(PANEL_X + 1, 0, 1, H);
  }

  // ── right data panel ──────────────────────────────────────────────
  function drawPanel(ctx, frame) {
    var px = PANEL_X + 2;
    var pw = PANEL_W - 2;

    // Background
    ctx.fillStyle = '#080816';
    ctx.fillRect(PANEL_X, 0, PANEL_W, H);

    // Header band
    ctx.fillStyle = '#12122a';
    ctx.fillRect(px, 0, pw, 44);
    ctx.fillStyle = '#ff88bb';
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Home', px + pw / 2, 15);
    ctx.fillStyle = '#884466';
    ctx.font = '9px Courier New';
    ctx.fillText('小因的空間', px + pw / 2, 30);
    ctx.textAlign = 'left';

    // Header separator
    ctx.fillStyle = '#ff88bb33';
    ctx.fillRect(px + 6, 44, pw - 12, 1);

    // Status dot (idle bounce)
    var dotY = 62 + Math.round(Math.sin(frame * 3) * 2);
    ctx.fillStyle = 'rgba(255,136,187,0.25)';
    ctx.beginPath(); ctx.arc(px + 16, dotY, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff88bb';
    ctx.beginPath(); ctx.arc(px + 16, dotY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ccaaaa';
    ctx.font = '9px Courier New';
    ctx.fillText('小因 · 在線', px + 28, dotY + 4);

    // Data sections
    var sections = [
      { label: '近期行程',      col: '#ff88bb', y: 90  },
      { label: '孩子注意事項',  col: '#ffcc88', y: 185 },
      { label: '家庭備忘',      col: '#88bbff', y: 280 },
    ];
    sections.forEach(function(sec) {
      // Label
      ctx.fillStyle = sec.col + '99';
      ctx.font = '8px Courier New';
      ctx.fillText(sec.label, px + 8, sec.y);
      // Rule
      ctx.fillStyle = sec.col + '22';
      ctx.fillRect(px + 8, sec.y + 5, pw - 16, 1);
      // Placeholder lines
      ctx.fillStyle = '#3a3a55';
      ctx.font = '9px Courier New';
      ctx.fillText('[Task 12 串接 API]', px + 10, sec.y + 22);
      ctx.fillStyle = '#282840';
      ctx.fillText('— 資料讀取中 —', px + 14, sec.y + 40);
      // Dim skeleton bars
      ctx.fillStyle = '#1a1a30';
      ctx.fillRect(px + 10, sec.y + 55, pw - 24, 6);
      ctx.fillRect(px + 10, sec.y + 66, pw - 40, 6);
      ctx.fillRect(px + 10, sec.y + 77, pw - 32, 6);
    });

    // Footer hint
    ctx.fillStyle = '#141428';
    ctx.fillRect(px, H - 36, pw, 36);
    ctx.fillStyle = '#555577';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('點擊小因對話', px + pw / 2, H - 18);
    ctx.textAlign = 'left';
  }

  // ── character dialogues ───────────────────────────────────────────
  var DIALOGUES = [
    '家裡的事交給我！',
    '有什麼需要安排的嗎？',
    '孩子們今天很乖喔！',
    '今天晚餐想吃什麼？',
    '購物清單我幫你記著！',
  ];

  var xiaoyin = null;
  var clickHandler = null;

  function setupClick(canvas, cx, cy) {
    var hw = 8, hh = 28;
    clickHandler = function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (680 / rect.width);
      var my = (e.clientY - rect.top)  * (480 / rect.height);
      if (mx >= cx - hw && mx <= cx + hw && my >= cy - hh && my <= cy) {
        var text = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
        showBubble(text, cx, cy - 32, '#fff0f6', '#ff88bb');
      }
    };
    canvas.addEventListener('click', clickHandler);
  }

  // ── public ────────────────────────────────────────────────────────
  return {
    init: function(worldData) {
      var charCfg = worldData
        ? worldData.characters.find(function(c) { return c.id === 'xiaoyin'; })
        : null;

      var sceneCharX = 148;
      var sceneCharY = FLOOR_Y - 4; // feet just above floor line

      xiaoyin = charCfg ? new Character(charCfg) : null;
      if (xiaoyin) {
        CharacterSprites.applyAll({ xiaoyin: xiaoyin });
        xiaoyin.setState('idle');
      }

      bubbles = [];
      var canvas = BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click', clickHandler);
      setupClick(canvas, sceneCharX, sceneCharY);

      BaseScene.startLoop(function(ctx, dt) {
        drawScene(ctx);
        drawPanel(ctx, xiaoyin ? xiaoyin.frame : 0);

        if (xiaoyin) {
          xiaoyin.frame += dt;
          xiaoyin.drawAt(ctx, sceneCharX, sceneCharY, 'idle');
        }

        drawBubbles(ctx, dt);
      });
    },

    cleanup: function() {
      if (clickHandler) {
        BaseScene.canvas.removeEventListener('click', clickHandler);
        clickHandler = null;
      }
      bubbles = [];
    }
  };
})();
