// ITRI indoor scene — Task 11
// 研究室 + 工作站，950157 坐鎮，右側資料面板 + Dashboard 入口

const ITRIScene = (() => {

  // ── layout ────────────────────────────────────────────────────────
  const PANEL_X = 480;
  const PANEL_W = 200;
  const SCENE_W = 480;
  const H = 480;
  const FLOOR_Y = H - 60;

  // Dashboard iframe state
  let dashOpen = false;
  let dashFrame = null; // the <iframe> element

  // ── rrect helper ──────────────────────────────────────────────────
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

  // ── bubble system ─────────────────────────────────────────────────
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
      var tw = ctx.measureText(b.text).width;
      var pad = 10, bh = 22, tailH = 8;
      var bw  = tw + pad * 2;
      var ty  = Math.round(b.by - bh - tailH);
      var tx  = Math.max(4, Math.min(SCENE_W - bw - 4, Math.round(b.bx - bw / 2)));
      var tailX = Math.max(tx + 8, Math.min(tx + bw - 8, Math.round(b.bx)));

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

  // ── floor (scene area only) ───────────────────────────────────────
  function drawFloor(ctx) {
    ctx.fillStyle = '#0a0e1e';
    ctx.fillRect(0, FLOOR_Y, SCENE_W, H - FLOOR_Y);
    ctx.strokeStyle = '#07091a';
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
    // Industrial safety stripe (yellow line)
    ctx.fillStyle = '#3a3000';
    ctx.fillRect(0, FLOOR_Y + 2, SCENE_W, 3);
    ctx.fillStyle = '#665500';
    for (var sx = 0; sx < SCENE_W; sx += 20) {
      ctx.fillRect(sx, FLOOR_Y + 2, 10, 3);
    }
  }

  // ── LED blink state ───────────────────────────────────────────────
  var _ledFrame = 0;

  // ── scene drawing ─────────────────────────────────────────────────
  function drawScene(ctx, frame) {
    _ledFrame = frame;

    // 1. Wall background (industrial blue-grey)
    ctx.fillStyle = '#0c0e1c';
    ctx.fillRect(0, 0, SCENE_W, FLOOR_Y);

    // 2. Floor
    drawFloor(ctx);

    // 3. Baseboard
    ctx.fillStyle = '#141826';
    ctx.fillRect(0, FLOOR_Y - 5, SCENE_W, 5);

    // 4. Back wall windows (large industrial-style, upper band)
    var winY = 48;
    ctx.fillStyle = '#101828';
    ctx.fillRect(0, winY - 8, SCENE_W, 8); // window header rail
    // Three wide windows with metal grille feel
    [[30, winY], [170, winY], [310, winY]].forEach(function(pos) {
      var wx = pos[0], wy = pos[1];
      // Window surround
      ctx.fillStyle = '#181e30';
      ctx.fillRect(wx - 3, wy - 3, 110, 78);
      // Glass (cool blue, slightly lit)
      ctx.fillStyle = '#0a1428';
      ctx.fillRect(wx, wy, 104, 72);
      ctx.fillStyle = 'rgba(40,80,160,0.35)';
      ctx.fillRect(wx + 1, wy + 1, 102, 70);
      // Grille bars (horizontal)
      ctx.fillStyle = '#181e30';
      ctx.fillRect(wx, wy + 24, 104, 3);
      ctx.fillRect(wx, wy + 48, 104, 3);
      // Grille bars (vertical)
      ctx.fillRect(wx + 34, wy, 3, 72);
      ctx.fillRect(wx + 68, wy, 3, 72);
      // Reflection glint
      ctx.fillStyle = 'rgba(120,160,255,0.08)';
      ctx.fillRect(wx + 2, wy + 2, 30, 22);
    });

    // 5. Instrument rack (left wall, tall unit)
    var rackX = 6, rackY = 130, rackW = 56, rackH = FLOOR_Y - 140;
    ctx.fillStyle = '#0e0e1c';
    ctx.fillRect(rackX, rackY, rackW, rackH);
    ctx.strokeStyle = '#1e1e30';
    ctx.lineWidth = 1;
    ctx.strokeRect(rackX + 0.5, rackY + 0.5, rackW - 1, rackH - 1);
    // Rack units (1U panels)
    for (var ru = 0; ru < 8; ru++) {
      var ruY = rackY + 4 + ru * 38;
      ctx.fillStyle = '#141420';
      ctx.fillRect(rackX + 4, ruY, rackW - 8, 34);
      ctx.strokeStyle = '#202030';
      ctx.lineWidth = 1;
      ctx.strokeRect(rackX + 4 + 0.5, ruY + 0.5, rackW - 9, 33);
      // Screws (rack ears)
      ctx.fillStyle = '#2a2a40';
      ctx.beginPath(); ctx.arc(rackX + 8, ruY + 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rackX + 8, ruY + 29, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rackX + rackW - 8, ruY + 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rackX + rackW - 8, ruY + 29, 3, 0, Math.PI * 2); ctx.fill();
      // Status LEDs
      var ledColors = ['#44ff44', '#ffcc44', '#4488ff', '#ff4444', '#44ff44', '#44ff44', '#ffcc44', '#44ff44'];
      var ledColor  = ledColors[ru % ledColors.length];
      var ledBlink  = (ru === 2 || ru === 5) && Math.sin(frame * 6 + ru) > 0;
      ctx.fillStyle = ledBlink ? ledColor : ledColor + '44';
      ctx.beginPath(); ctx.arc(rackX + 20, ruY + 17, 3, 0, Math.PI * 2); ctx.fill();
      if (!ledBlink) {
        ctx.fillStyle = ledColor;
        ctx.beginPath(); ctx.arc(rackX + 20, ruY + 17, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Rack label
    ctx.fillStyle = '#28284a';
    ctx.font = '7px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('RACK', rackX + rackW / 2, rackY - 4);
    ctx.textAlign = 'left';

    // 6. Server unit (right side of scene)
    var srvX = 390, srvY = 110, srvW = 82, srvH = FLOOR_Y - 120;
    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(srvX, srvY, srvW, srvH);
    ctx.strokeStyle = '#1a1a28';
    ctx.lineWidth = 1;
    ctx.strokeRect(srvX + 0.5, srvY + 0.5, srvW - 1, srvH - 1);
    // Server blades
    for (var sb = 0; sb < 9; sb++) {
      var sbY = srvY + 6 + sb * 34;
      ctx.fillStyle = '#111122';
      ctx.fillRect(srvX + 4, sbY, srvW - 8, 30);
      ctx.strokeStyle = '#1c1c30';
      ctx.lineWidth = 1;
      ctx.strokeRect(srvX + 4 + 0.5, sbY + 0.5, srvW - 9, 29);
      // Drive bays (4 slots)
      for (var bd = 0; bd < 4; bd++) {
        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(srvX + 6 + bd * 16, sbY + 6, 13, 18);
        ctx.strokeStyle = '#151520';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(srvX + 6 + bd * 16, sbY + 6, 13, 18);
      }
      // Activity LED
      var actOn = Math.sin(frame * 8 + sb * 1.3) > 0.6;
      ctx.fillStyle = actOn ? '#44ff88' : '#112211';
      ctx.fillRect(srvX + srvW - 10, sbY + 6, 4, 4);
    }
    // Server label
    ctx.fillStyle = '#28284a';
    ctx.font = '7px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('SERVER', srvX + srvW / 2, srvY - 4);
    ctx.textAlign = 'left';

    // 7. Main workstation desk (centre, 950157 sits here)
    var deskX = 110, deskY = FLOOR_Y - 60, deskW = 240;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(deskX + 4, deskY + 22, deskW, 8);
    // Desk surface
    ctx.fillStyle = '#161a28';
    ctx.fillRect(deskX, deskY, deskW, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(deskX, deskY, deskW, 3);
    ctx.strokeStyle = '#0e1020';
    ctx.lineWidth = 1;
    ctx.strokeRect(deskX + 0.5, deskY + 0.5, deskW - 1, 21);
    // Desk legs
    ctx.fillStyle = '#0e1020';
    ctx.fillRect(deskX + 6,        deskY + 22, 6, 18);
    ctx.fillRect(deskX + deskW - 12, deskY + 22, 6, 18);
    // Cable tray under desk (industrial detail)
    ctx.fillStyle = '#0c0e1a';
    ctx.fillRect(deskX + 20, deskY + 22, deskW - 40, 6);

    // Dual monitors on desk
    BaseScene.drawMonitor(deskX + 18,  deskY - 32);
    BaseScene.drawMonitor(deskX + 58,  deskY - 32);
    // Main large monitor (centre)
    ctx.fillStyle = '#111122';
    ctx.fillRect(deskX + 100, deskY - 40, 50, 36);
    ctx.fillStyle = '#0a1428';
    ctx.fillRect(deskX + 102, deskY - 38, 46, 30);
    ctx.fillStyle = 'rgba(30,100,200,0.5)';
    ctx.fillRect(deskX + 103, deskY - 37, 44, 28);
    // Code-like content on main monitor
    ctx.fillStyle = 'rgba(0,255,128,0.35)';
    for (var ml = 0; ml < 7; ml++) {
      var lineW = 10 + Math.floor((ml * 7 + 3) % 30);
      ctx.fillRect(deskX + 104, deskY - 35 + ml * 4, lineW, 1);
    }
    // Monitor stands
    ctx.fillStyle = '#1a1a2c';
    ctx.fillRect(deskX + 22, deskY - 4, 6, 6);
    ctx.fillRect(deskX + 62, deskY - 4, 6, 6);
    ctx.fillRect(deskX + 119, deskY - 4, 8, 6);

    // Keyboard (950157's keyboard)
    ctx.fillStyle = '#0e1020';
    ctx.fillRect(deskX + 96, deskY + 4, 60, 8);
    ctx.fillStyle = '#141828';
    for (var ki = 0; ki < 8; ki++) ctx.fillRect(deskX + 98 + ki * 7, deskY + 5, 5, 6);

    // Reference papers / printouts on desk
    ctx.fillStyle = '#c8ccb8';
    ctx.fillRect(deskX + 168, deskY + 2, 30, 18);
    ctx.fillStyle = '#a8b0a0';
    ctx.fillRect(deskX + 170, deskY + 4, 26, 14);
    ctx.fillStyle = '#445566';
    ctx.font = '5px Courier New';
    [6, 10, 14].forEach(function(py) {
      ctx.fillRect(deskX + 171, deskY + py, 18, 1);
    });

    // Coffee mug
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(deskX + 204, deskY + 3, 14, 16);
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(deskX + 206, deskY + 4, 10, 5);
    ctx.fillStyle = '#4a2a10';
    ctx.fillRect(deskX + 218, deskY + 7, 4, 8);

    // 8. Side cabinet / filing (left of main desk)
    var cabX = 70, cabY = FLOOR_Y - 80;
    ctx.fillStyle = '#0e1020';
    ctx.fillRect(cabX, cabY, 36, 80);
    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 1;
    ctx.strokeRect(cabX + 0.5, cabY + 0.5, 35, 79);
    // Drawers
    [0, 26, 52].forEach(function(dy) {
      ctx.fillStyle = '#111122';
      ctx.fillRect(cabX + 3, cabY + 2 + dy, 30, 22);
      ctx.fillStyle = '#3a3a5a';
      ctx.fillRect(cabX + 14, cabY + 11 + dy, 10, 4);
    });

    // 9. Panel divider
    ctx.fillStyle = '#060614';
    ctx.fillRect(PANEL_X, 0, 1, H);
    ctx.fillStyle = '#14142a';
    ctx.fillRect(PANEL_X + 1, 0, 1, H);
  }

  // ── right data panel ──────────────────────────────────────────────
  var DASH_BTN = { x: 0, y: 0, w: 0, h: 0 }; // set in drawPanel for click detection

  function drawPanel(ctx, frame) {
    var px = PANEL_X + 2;
    var pw = PANEL_W - 2;

    // Background
    ctx.fillStyle = '#06060e';
    ctx.fillRect(PANEL_X, 0, PANEL_W, H);

    // Header
    ctx.fillStyle = '#0a0e1c';
    ctx.fillRect(px, 0, pw, 44);
    ctx.fillStyle = '#4488ff';
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('ITRI 研究室', px + pw / 2, 15);
    ctx.fillStyle = '#224466';
    ctx.font = '9px Courier New';
    ctx.fillText('950157 工作站', px + pw / 2, 30);
    ctx.textAlign = 'left';

    // Header separator
    ctx.fillStyle = '#4488ff33';
    ctx.fillRect(px + 6, 44, pw - 12, 1);

    // Status dot (pulse)
    var pulse = 0.5 + 0.5 * Math.sin(frame * 4);
    ctx.fillStyle = 'rgba(68,136,255,' + (0.2 + pulse * 0.35) + ')';
    ctx.beginPath(); ctx.arc(px + 16, 62, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4488ff';
    ctx.beginPath(); ctx.arc(px + 16, 62, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aaaacc';
    ctx.font = '9px Courier New';
    ctx.fillText('950157 · 在線', px + 28, 66);

    // Data sections
    var sections = [
      { label: '專案進度',   col: '#4488ff', y: 88  },
      { label: '待辦任務',   col: '#ffcc44', y: 183 },
      { label: '系統狀態',   col: '#44ff88', y: 278 },
    ];
    sections.forEach(function(sec) {
      ctx.fillStyle = sec.col + '99';
      ctx.font = '8px Courier New';
      ctx.fillText(sec.label, px + 8, sec.y);
      ctx.fillStyle = sec.col + '22';
      ctx.fillRect(px + 8, sec.y + 5, pw - 16, 1);
      ctx.fillStyle = '#3a3a55';
      ctx.font = '9px Courier New';
      ctx.fillText('[Task 12 串接 API]', px + 10, sec.y + 22);
      ctx.fillStyle = '#282840';
      ctx.fillText('— 資料讀取中 —', px + 14, sec.y + 40);
      // Skeleton bars
      ctx.fillStyle = '#141430';
      ctx.fillRect(px + 10, sec.y + 55, pw - 24, 6);
      ctx.fillRect(px + 10, sec.y + 66, pw - 38, 6);
      ctx.fillRect(px + 10, sec.y + 77, pw - 30, 6);
    });

    // Dashboard button
    var btnX = px + 10, btnY = H - 56, btnW = pw - 20, btnH = 28;
    DASH_BTN.x = PANEL_X + 12;
    DASH_BTN.y = btnY;
    DASH_BTN.w = btnW;
    DASH_BTN.h = btnH;
    ctx.fillStyle = dashOpen ? '#1a2a44' : '#0e1a2e';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = dashOpen ? '#4488ff' : '#224466';
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnW - 1, btnH - 1);
    ctx.fillStyle = dashOpen ? '#88aaff' : '#4488ff';
    ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(dashOpen ? '✕ 關閉 Dashboard' : '▶ 展開 Dashboard', px + pw / 2, btnY + 17);
    ctx.textAlign = 'left';

    // Footer hint
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(px, H - 22, pw, 22);
    ctx.fillStyle = '#334455';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('點擊 950157 對話', px + pw / 2, H - 8);
    ctx.textAlign = 'left';
  }

  // ── Dashboard iframe ──────────────────────────────────────────────
  function openDash() {
    if (dashFrame) return;
    var overlay = document.getElementById('scene-overlay');
    dashFrame = document.createElement('iframe');
    dashFrame.src = 'https://telegram-bot-t82n.onrender.com/dashboard';
    dashFrame.style.cssText = [
      'position:absolute',
      'top:10px',
      'left:10px',
      'width:' + (PANEL_X - 20) + 'px',
      'height:' + (H - 60) + 'px',
      'border:2px solid #4488ff',
      'background:#060614',
      'z-index:7',
    ].join(';');
    overlay.appendChild(dashFrame);
    dashOpen = true;
  }

  function closeDash() {
    if (dashFrame) {
      dashFrame.parentNode && dashFrame.parentNode.removeChild(dashFrame);
      dashFrame = null;
    }
    dashOpen = false;
  }

  // ── character + click handling ────────────────────────────────────
  var DIALOGUES = [
    '進度一切正常。',
    '正在處理研究任務。',
    '系統運行穩定。',
    '這個功能還在測試中...',
    '研究資料已同步完畢。',
  ];

  var itri = null;
  var charX = 0, charY = 0;
  var clickHandler = null;

  function setupClick(canvas, cx, cy) {
    charX = cx; charY = cy;
    var hw = 8, hh = 28;
    clickHandler = function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (680 / rect.width);
      var my = (e.clientY - rect.top)  * (480 / rect.height);

      // Dashboard button hit
      if (mx >= DASH_BTN.x && mx <= DASH_BTN.x + DASH_BTN.w &&
          my >= DASH_BTN.y && my <= DASH_BTN.y + DASH_BTN.h) {
        dashOpen ? closeDash() : openDash();
        return;
      }

      // Character hit
      if (mx >= charX - hw && mx <= charX + hw && my >= charY - hh && my <= charY) {
        var text = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
        showBubble(text, charX, charY - 32, '#f0f4ff', '#4488ff');
      }
    };
    canvas.addEventListener('click', clickHandler);
  }

  // ── public ────────────────────────────────────────────────────────
  return {
    init: function(worldData) {
      var charCfg = worldData
        ? worldData.characters.find(function(c) { return c.id === 'itri950'; })
        : null;

      // Character sits behind main desk, centre
      var deskX = 110, deskY = FLOOR_Y - 60, deskW = 240;
      var sceneCharX = deskX + deskW / 2;
      var sceneCharY = deskY - 2;

      itri = charCfg ? new Character(charCfg) : null;
      if (itri) {
        CharacterSprites.applyAll({ itri950: itri });
        itri.setState('working');
      }

      bubbles  = [];
      dashOpen = false;
      dashFrame = null;

      var canvas = BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click', clickHandler);
      setupClick(canvas, sceneCharX, sceneCharY);

      BaseScene.startLoop(function(ctx, dt) {
        drawScene(ctx, itri ? itri.frame : 0);
        drawPanel(ctx, itri ? itri.frame : 0);

        if (itri) {
          itri.frame += dt;
          itri.drawAt(ctx, sceneCharX, sceneCharY, 'working');
        }

        drawBubbles(ctx, dt);
      });
    },

    cleanup: function() {
      closeDash();
      if (clickHandler) {
        BaseScene.canvas.removeEventListener('click', clickHandler);
        clickHandler = null;
      }
      bubbles = [];
    }
  };
})();
