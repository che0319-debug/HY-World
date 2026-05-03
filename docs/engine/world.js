const World = (() => {
  const canvas = document.getElementById('world-canvas');
  const ctx    = canvas.getContext('2d');
  const W = 680, H = 480, TS = 20;

  let data     = null;
  let chars    = [];
  let lastTime = 0;
  let animId   = null;
  let paused   = false;
  let hoverId       = null; // hovered building id
  let hoveredCharId = null; // hovered character id
  let bubbles       = [];   // [{ text, bx, by, timer, color, borderColor }, …]

  // Pre-computed per-building static visuals (windows etc.)
  const bVis = {};

  // ── Scene anchors & path builder (Task 06) ────────────────────────
  // inner = character resting position inside building
  // door  = bottom of building entrance
  // road  = point on horizontal road (y=220) directly below door
  const SCENE_ANCHORS = {
    home:  { inner: {x: 120, y: 155}, door: {x: 120, y: 180}, road: {x: 120, y: 220} },
    hq:    { inner: {x: 330, y: 155}, door: {x: 340, y: 180}, road: {x: 340, y: 220} },
    itri:  { inner: {x: 555, y: 155}, door: {x: 560, y: 180}, road: {x: 560, y: 220} },
  };

  // Default home scene for each character id
  const CHAR_HOME = { hy: 'hq', xiaoyin: 'home', itri950: 'itri' };

  // ── Character dialogue lines (Task 07) ────────────────────────────
  const DIALOGUES = {
    hy:      ['一切都在計畫中！', '需要跨域協調嗎？', '今天的任務清單很長...'],
    xiaoyin: ['家裡的事交給我！', '有什麼需要安排的嗎？', '孩子們今天很乖喔！'],
    itri950: ['進度一切正常。', '正在處理研究任務。', '系統運行穩定。'],
  };

  // Build a waypoint array: exit fromScene → traverse road → enter toScene
  function buildPath(fromScene, toScene) {
    const f = SCENE_ANCHORS[fromScene];
    const t = SCENE_ANCHORS[toScene];
    if (!f || !t || fromScene === toScene) return [];
    return [f.door, f.road, t.road, t.door, t.inner];
  }

  // Toggle: first click gathers everyone to HQ; second sends them home
  let assembled = false;
  function triggerWalkTest() {
    if (!assembled) {
      chars.forEach(c => {
        if (c.scene === 'hq' || c.state === 'walking') return;
        const path = buildPath(c.scene, 'hq');
        if (path.length) c.walkAlong(path, 'hq');
      });
      assembled = true;
    } else {
      chars.forEach(c => {
        const home = CHAR_HOME[c.id];
        if (!home || c.scene === home || c.state === 'walking') return;
        const path = buildPath(c.scene, home);
        if (path.length) c.walkAlong(path, home);
      });
      assembled = false;
    }
  }

  // ── helpers ────────────────────────────────────────────────────────
  function mkRand(seed) {
    let s = seed >>> 0;
    return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0x100000000; };
  }

  function rrect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.arcTo(x + w, y,     x + w, y + r,     r);
    c.lineTo(x + w, y + h - r);
    c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h);
    c.arcTo(x,     y + h, x,     y + h - r, r);
    c.lineTo(x,     y + r);
    c.arcTo(x,     y,     x + r, y,         r);
    c.closePath();
  }

  // ── pre-compute static building visuals ───────────────────────────
  function precompute(buildings) {
    buildings.forEach((b, i) => {
      const r = mkRand(i * 997 + 31);
      if (b.status !== 'active') { bVis[b.id] = {}; return; }

      // 4 cols × 2 rows of windows
      // For 160px wide building: gaps of 16px, windows 20px wide
      // x offsets from b.x: 16, 52, 88, 124
      // y offsets from b.y: 26, 54  (below 12px roof + 14px margin)
      const winW = 20, winH = 16;
      const xOff = [16, 52, 88, 124];
      const yOff = [26, 54];
      const windows = [];
      for (const dy of yOff) {
        for (const dx of xOff) {
          windows.push({
            x: b.x + dx, y: b.y + dy,
            w: winW, h: winH,
            lit:  r() < 0.70,
            warm: r() < 0.55
          });
        }
      }
      bVis[b.id] = { windows };
    });
  }

  // ── floor tiles ───────────────────────────────────────────────────
  function drawFloor() {
    // ── 草地基底 ──
    ctx.fillStyle = '#5aa040';
    ctx.fillRect(0, 0, W, H);

    // 草地深淺色塊（棋盤交錯，增加層次感）
    const GTS = 40;
    for (let gx = 0; gx < W; gx += GTS) {
      for (let gy = 0; gy < H; gy += GTS) {
        const col = Math.floor(gx / GTS), row = Math.floor(gy / GTS);
        if ((col + row) % 2 === 0) {
          ctx.fillStyle = '#62ac48';
          ctx.fillRect(gx, gy, GTS, GTS);
        }
      }
    }

    // 草地暗紋（直條，模擬草坪修剪方向）
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let gx = 0; gx < W; gx += 20) {
      ctx.fillRect(gx, 0, 10, H);
    }

    // 路邊草叢裝飾（上排）
    [[30,8],[80,14],[200,10],[400,6],[500,12],[620,8],[650,16]].forEach(([bx, by]) => {
      const br = 8 + (bx % 3) * 4;
      ctx.fillStyle = '#3a8828';
      ctx.beginPath(); ctx.arc(bx, by + br, br, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4aaa38';
      ctx.beginPath(); ctx.arc(bx - 4, by + br - 3, br * 0.65, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5acc48';
      ctx.beginPath(); ctx.arc(bx + 3, by + br - 5, br * 0.45, 0, Math.PI * 2); ctx.fill();
    });

    // 路邊草叢裝飾（下排）
    [[20,H-28],[160,H-32],[300,H-26],[440,H-30],[580,H-28],[660,H-24]].forEach(([bx, by], i) => {
      const br = 9 + (i % 3) * 4;
      ctx.fillStyle = '#3a8828';
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#52bb3a';
      ctx.beginPath(); ctx.arc(bx - 5, by - 4, br * 0.6, 0, Math.PI * 2); ctx.fill();
    });

    // ── 人行道（y 180–210）──
    // 磚塊底色
    ctx.fillStyle = '#c8bc9c';
    ctx.fillRect(40, 180, 600, 30);
    // 交錯磚塊
    const TW = 20, TH = 15;
    for (let tx = 40; tx < 640; tx += TW) {
      for (let ty = 180; ty < 210; ty += TH) {
        const col = Math.floor((tx - 40) / TW), row = Math.floor((ty - 180) / TH);
        ctx.fillStyle = (col + row) % 2 === 0 ? '#cec29e' : '#beb28e';
        ctx.fillRect(tx, ty, TW - 1, TH - 1);
      }
    }
    // 上緣石（亮面）
    ctx.fillStyle = '#d4c8a8';
    ctx.fillRect(40, 176, 600, 2);
    ctx.fillStyle = '#a09878';
    ctx.fillRect(40, 178, 600, 3);
    // 下緣石（暗面）
    ctx.fillStyle = '#8a8268';
    ctx.fillRect(40, 207, 600, 3);

    // 路燈（人行道上，三支）
    [[140, 180], [340, 180], [540, 180]].forEach(([lx, ly]) => {
      ctx.fillStyle = '#706860';
      ctx.fillRect(lx - 3, ly - 2, 6, 12);
      ctx.fillStyle = '#504840';
      ctx.fillRect(lx - 4, ly + 8, 8, 4);
      ctx.fillStyle = '#888078';
      ctx.fillRect(lx - 1, ly - 30, 2, 30);
      ctx.fillStyle = '#6a6058';
      ctx.fillRect(lx - 7, ly - 36, 14, 6);
      ctx.fillStyle = 'rgba(255,230,140,0.18)';
      ctx.beginPath(); ctx.ellipse(lx, ly - 20, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffee88';
      ctx.fillRect(lx - 4, ly - 34, 8, 3);
    });
  }

  // ── roads ─────────────────────────────────────────────────────────
  function drawRoads(roads) {
    roads.forEach(r => {
      const isV = r.x1 === r.x2;
      const rx = isV ? r.x1 - r.width / 2 : r.x1;
      const ry = isV ? r.y1               : r.y1 - r.width / 2;
      const rw = isV ? r.width            : r.x2 - r.x1;
      const rh = isV ? r.y2 - r.y1       : r.width;

      // 路面底色（深灰瀝青）
      ctx.fillStyle = '#6a7a88';
      ctx.fillRect(rx, ry, rw, rh);

      // 瀝青粒紋（模擬路面材質）
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let tx = rx; tx < rx + rw; tx += 6) {
        for (let ty = ry; ty < ry + rh; ty += 6) {
          if ((Math.floor(tx / 6) + Math.floor(ty / 6)) % 2 === 0) ctx.fillRect(tx, ty, 3, 3);
        }
      }

      // 路面中間輕微高光
      if (!isV) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(rx, ry + 2, rw, Math.floor(rh / 2));
      }

      // 路緣石亮面
      ctx.fillStyle = '#8a9aaa';
      if (isV) {
        ctx.fillRect(rx, ry, 3, rh);
        ctx.fillRect(rx + rw - 3, ry, 3, rh);
      } else {
        ctx.fillRect(rx, ry, rw, 3);
        ctx.fillRect(rx, ry + rh - 3, rw, 3);
      }
      // 路緣石暗面
      ctx.fillStyle = '#505e6a';
      if (isV) {
        ctx.fillRect(rx + 1, ry, 1, rh);
        ctx.fillRect(rx + rw - 2, ry, 1, rh);
      } else {
        ctx.fillRect(rx, ry + 1, rw, 1);
        ctx.fillRect(rx, ry + rh - 2, rw, 1);
      }

      // 中央虛線（黃色）
      ctx.fillStyle = '#f0d040';
      const mcx = Math.round(rx + rw / 2);
      const mcy = Math.round(ry + rh / 2);
      if (isV) {
        for (let dy = ry + 8; dy < ry + rh - 4; dy += 18)
          ctx.fillRect(mcx - 1, dy, 2, 11);
      } else {
        for (let dx = rx + 8; dx < rx + rw - 4; dx += 18)
          ctx.fillRect(dx, mcy - 1, 11, 2);
      }

      // 斑馬線（水平道路，建築入口前）
      if (!isV) {
        [140, 340, 540].forEach(zbx => {
          if (zbx < rx || zbx > rx + rw) return;
          const stripeH = Math.floor((rh - 6) / 5);
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          for (let zi = 0; zi < 5; zi++) {
            ctx.fillRect(zbx - 14, ry + 3 + zi * stripeH, 28, stripeH - 1);
          }
        });
      }
    });
  }

  // ── active building ───────────────────────────────────────────────
  function drawActive(b, hovered) {
    const { x, y, width: bw, height: bh } = b;
    const vis = bVis[b.id] || {};
    const ROOF = 14;

    const _P = ({
      home: { wall:'#d86c3c', wallLo:'#c05c2c', wallHi:'#f08858', brickLine:'rgba(0,0,0,0.07)',
              roof:'#a84420', roofHi:'#e07848', roofShadow:'#803010', ac:'#7a3018',
              door:'#5a2c10', doorIn:'#7a4428', doorStroke:'#d07040', step:'#8a6040', handle:'#f0c040',
              signBg:'#42100a', signStroke:'#c06030', label:'#fff8f0', sub:'#7a4828',
              winGlow:'rgba(255,200,80,0.25)' },
      hq:   { wall:'#2e9a60', wallLo:'#228050', wallHi:'#48bc78', brickLine:'rgba(0,0,0,0.07)',
              roof:'#1a7840', roofHi:'#3aaa60', roofShadow:'#0e5028', ac:'#105e30',
              door:'#0e3820', doorIn:'#1e5838', doorStroke:'#38aa60', step:'#286848', handle:'#cce030',
              signBg:'#062214', signStroke:'#38aa60', label:'#e0fff0', sub:'#287848',
              winGlow:'rgba(100,220,160,0.2)' },
      itri: { wall:'#3060b8', wallLo:'#2050a0', wallHi:'#5080d8', brickLine:'rgba(0,0,0,0.07)',
              roof:'#1848a0', roofHi:'#3868c8', roofShadow:'#0c2e70', ac:'#0c2878',
              door:'#0a1e3c', doorIn:'#1a3a5c', doorStroke:'#3868c8', step:'#22406a', handle:'#70b8dc',
              signBg:'#04102a', signStroke:'#3868c8', label:'#e0f0ff', sub:'#2a4878',
              winGlow:'rgba(80,160,255,0.22)' },
    })[b.id] || { wall:'#7888a0', wallLo:'#687890', wallHi:'#9aaabb', brickLine:'rgba(0,0,0,0.07)',
              roof:'#566878', roofHi:'#8899aa', roofShadow:'#3a4a58', ac:'#445566',
              door:'#2e4050', doorIn:'#3e5060', doorStroke:'#7888a0', step:'#4a6070', handle:'#88aacc',
              signBg:'#1e2e3a', signStroke:'#7888a0', label:'#ffffff', sub:'#4a5a68',
              winGlow:'rgba(140,170,220,0.2)' };

    // 地面投影
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x + 6, y + bh, bw - 4, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x + 10, y + bh + 8, bw - 10, 4);

    // 建築主體
    ctx.fillStyle = _P.wall;
    ctx.fillRect(x, y + ROOF, bw, bh - ROOF);

    // 下半牆稍暗
    ctx.fillStyle = _P.wallLo;
    ctx.fillRect(x, y + ROOF + Math.floor((bh - ROOF) * 0.55), bw, Math.ceil((bh - ROOF) * 0.45));

    // 磚紋橫線
    ctx.fillStyle = _P.brickLine;
    for (let by2 = y + ROOF + 8; by2 < y + bh; by2 += 8)
      ctx.fillRect(x, by2, bw, 1);

    // 磚縫縱線（交錯）
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    let rowOff = 0;
    for (let by2 = y + ROOF + 8; by2 < y + bh; by2 += 8) {
      rowOff = rowOff === 0 ? 12 : 0;
      for (let bx2 = x + rowOff; bx2 < x + bw; bx2 += 24)
        ctx.fillRect(bx2, by2 - 7, 1, 7);
    }

    // 側面陰影（漸層）
    const shadeGrad = ctx.createLinearGradient(x, 0, x + bw, 0);
    shadeGrad.addColorStop(0,    'rgba(0,0,0,0.20)');
    shadeGrad.addColorStop(0.08, 'rgba(0,0,0,0.00)');
    shadeGrad.addColorStop(0.92, 'rgba(0,0,0,0.00)');
    shadeGrad.addColorStop(1,    'rgba(0,0,0,0.22)');
    ctx.fillStyle = shadeGrad;
    ctx.fillRect(x, y + ROOF, bw, bh - ROOF);

    // 牆面頂部高光
    ctx.fillStyle = _P.wallHi;
    ctx.fillRect(x, y + ROOF, bw, 2);

    // 屋頂
    ctx.fillStyle = _P.roof;
    ctx.fillRect(x, y, bw, ROOF);
    ctx.fillStyle = _P.roofHi;
    ctx.fillRect(x, y, bw, 3);
    ctx.fillStyle = _P.roofShadow;
    ctx.fillRect(x, y + ROOF - 3, bw, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x, y, 3, ROOF);
    ctx.fillRect(x + bw - 3, y, 3, ROOF);

    // 屋頂 AC 機組
    [[x + 10, y + 3], [x + bw - 26, y + 3]].forEach(([ax, ay]) => {
      ctx.fillStyle = _P.ac;
      ctx.fillRect(ax, ay, 16, 9);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(ax, ay, 16, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(ax + 1, ay + 3, 14, 1);
      ctx.fillRect(ax + 1, ay + 5, 14, 1);
    });

    // 窗戶
    (vis.windows || []).forEach(win => {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(win.x - 3, win.y - 3, win.w + 6, win.h + 6);
      if (win.lit) {
        ctx.fillStyle = _P.winGlow;
        ctx.fillRect(win.x - 5, win.y - 5, win.w + 10, win.h + 10);
        ctx.fillStyle = win.warm ? '#ffcc55' : '#88aaff';
        ctx.fillRect(win.x, win.y, win.w, win.h);
        ctx.fillStyle = win.warm ? 'rgba(255,245,180,0.75)' : 'rgba(200,220,255,0.75)';
        ctx.fillRect(win.x + 1, win.y + 1, Math.floor(win.w / 2) - 1, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(win.x + Math.floor(win.w / 2) - 1, win.y, 2, win.h);
        ctx.fillRect(win.x, win.y + Math.floor(win.h / 2), win.w, 2);
      } else {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(win.x, win.y, win.w, win.h);
        ctx.fillStyle = 'rgba(100,120,160,0.15)';
        ctx.fillRect(win.x + 1, win.y + 1, Math.floor(win.w / 2), 2);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.32)';
      ctx.lineWidth = 1;
      ctx.strokeRect(win.x - 0.5, win.y - 0.5, win.w + 1, win.h + 1);
    });

    // 門
    const dW = 28, dH = 38;
    const dX = Math.round(x + (bw - dW) / 2);
    const dY = y + bh - dH;
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(dX - 4, dY - 2, dW + 8, dH + 2);
    ctx.fillStyle = _P.door;
    ctx.fillRect(dX, dY, dW, dH);
    ctx.fillStyle = _P.doorIn;
    ctx.fillRect(dX + 3, dY + 3, dW - 6, dH - 3);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(dX + Math.floor(dW / 2) - 1, dY + 3, 2, dH - 3);
    ctx.strokeStyle = _P.doorStroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(dX - 1, dY - 1, dW + 2, dH + 1);
    ctx.fillStyle = _P.handle;
    ctx.fillRect(dX + dW - 9, dY + Math.round(dH / 2) - 2, 4, 6);

    // 門階
    ctx.fillStyle = _P.step;
    ctx.fillRect(dX - 6, y + bh - 5, dW + 12, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(dX - 6, y + bh - 5, dW + 12, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(dX - 6, y + bh - 1, dW + 12, 1);

    // 名牌看板
    ctx.font = 'bold 10px Courier New';
    ctx.textAlign = 'center';
    const lw = ctx.measureText(b.label).width;
    const sgnX = Math.round(x + bw / 2 - lw / 2) - 6;
    const sgnY = y + ROOF + 3;
    const sgnW = lw + 12, sgnH = 14;
    ctx.fillStyle = _P.signBg;
    ctx.fillRect(sgnX, sgnY, sgnW, sgnH);
    ctx.strokeStyle = _P.signStroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(sgnX + 0.5, sgnY + 0.5, sgnW - 1, sgnH - 1);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(sgnX + 1, sgnY + 1, sgnW - 2, 2);
    ctx.fillStyle = _P.label;
    ctx.fillText(b.label, x + bw / 2, sgnY + 10);

    // 副標題
    ctx.font = '9px Courier New';
    ctx.fillStyle = _P.sub;
    ctx.fillText(b.sublabel, x + bw / 2, y + bh + 14);
    ctx.textAlign = 'left';

    // 狀態燈
    const lx = x + bw - 9, ly = y + 8;
    ctx.fillStyle = b.statusColor + '40';
    ctx.beginPath(); ctx.arc(lx, ly, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.statusColor + 'aa';
    ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.statusColor;
    ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(lx - 1, ly - 1, 1.5, 0, Math.PI * 2); ctx.fill();

    // Hover 高光框
    if (hovered) {
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur  = 18;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth   = 2.5;
      ctx.strokeRect(x - 1.5, y - 1.5, bw + 3, bh + 3);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 3, y - 3, bw + 6, bh + 6);
    }
  }

  // ── construction building ─────────────────────────────────────────
  function drawConstruction(b, hovered) {
    const { x, y, width: bw, height: bh } = b;

    // 地面投影
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 4, y + bh, bw, 8);

    // 未完成牆體（沙黃色，粗糙感）
    ctx.fillStyle = '#c0a870';
    ctx.fillRect(x, y, bw, bh);

    // 磚塊外露紋（建設中的感覺）
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let by2 = y + 8; by2 < y + bh; by2 += 8)
      ctx.fillRect(x, by2, bw, 1);
    ctx.fillStyle = 'rgba(180,150,90,0.4)';
    let rOff = 0;
    for (let by2 = y + 8; by2 < y + bh; by2 += 8) {
      rOff = rOff === 0 ? 10 : 0;
      for (let bx2 = x + rOff; bx2 < x + bw; bx2 += 20)
        ctx.fillRect(bx2, by2 - 7, 1, 7);
    }

    // 外框輪廓
    ctx.strokeStyle = '#a08850';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);

    // 鷹架縱桿
    ctx.fillStyle = '#808078';
    [0, 40, 80, 120, 160].forEach(px => {
      ctx.fillRect(x + px - 2, y - 12, 4, bh + 22);
    });
    // 鷹架橫樑
    ctx.fillStyle = '#aaaaaa';
    [0, 32, 64, 96].forEach(dy => {
      ctx.fillRect(x - 3, y + dy, bw + 6, 5);
    });
    // 橫樑高光
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    [0, 32, 64, 96].forEach(dy => {
      ctx.fillRect(x - 3, y + dy, bw + 6, 1);
    });

    // 踏板（第 2、3 橫樑上）
    ctx.fillStyle = '#8a6838';
    [32, 64].forEach(dy => {
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(x + col * 40 + 2, y + dy + 1, 36, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + col * 40 + 2, y + dy + 3, 36, 1);
        ctx.fillStyle = '#8a6838';
      }
    });

    // X 型斜撐
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const px1 = x + i * 40;
      const px2 = x + (i + 1) * 40;
      [0, 32, 64].forEach(dy => {
        ctx.beginPath(); ctx.moveTo(px1, y + dy + 5); ctx.lineTo(px2, y + dy + 32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px2, y + dy + 5); ctx.lineTo(px1, y + dy + 32); ctx.stroke();
      });
    }

    // 工程告示牌（中央）
    const sbW = 100, sbH = 30;
    const sbX = Math.round(x + (bw - sbW) / 2);
    const sbY = Math.round(y + bh / 2 - sbH / 2);
    // 警戒斜紋邊框
    const stripes = Math.ceil(sbW / 10);
    for (let si = 0; si < stripes; si++) {
      ctx.fillStyle = si % 2 === 0 ? '#ee8800' : '#ffffff';
      const sw = Math.min(10, sbW - si * 10);
      ctx.fillRect(sbX + si * 10, sbY,           sw, 5);
      ctx.fillRect(sbX + si * 10, sbY + sbH - 5, sw, 5);
    }
    // 牌身
    ctx.fillStyle = '#f0e8c0';
    ctx.fillRect(sbX, sbY + 5, sbW, sbH - 10);
    // 牌身高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(sbX, sbY + 5, sbW, 2);
    // 文字
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c06000';
    ctx.fillText('建設中', x + bw / 2, sbY + 5 + (sbH - 10) / 2 + 4);

    // 建築名稱
    ctx.font = '9px Courier New';
    ctx.fillStyle = '#665533';
    ctx.fillText(b.label, x + bw / 2, y - 6);
    ctx.textAlign = 'left';

    // 狀態燈（暗）
    ctx.fillStyle = '#c8c0b0';
    ctx.beginPath(); ctx.arc(x + bw - 9, y + 7, 4, 0, Math.PI * 2); ctx.fill();

    // Hover 框
    if (hovered) {
      ctx.save();
      ctx.shadowColor = '#f0c060';
      ctx.shadowBlur  = 10;
      ctx.strokeStyle = '#f0c060';
      ctx.lineWidth   = 2;
      ctx.strokeRect(x - 2, y - 2, bw + 4, bh + 4);
      ctx.restore();
    }
  }

  // ── speech bubble system (Task 07) ───────────────────────────────
  // bx/by = tip of the tail (tail points DOWN to this position).
  // color     = bubble fill  (default near-white)
  // borderColor = stroke     (default cool-gray)
  // duration  = total visible seconds
  function showBubble(text, bx, by, color = '#f4f4ff', borderColor = '#c0c0cc', duration = 2.6) {
    // De-duplicate: remove any bubble with identical text from same source
    bubbles = bubbles.filter(b => b.text !== text);
    bubbles.push({ text, bx, by, timer: duration, maxTimer: duration, color, borderColor });
  }

  function _drawOneBubble(b) {
    const alpha = Math.min(1, b.timer / 0.4);
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '12px Courier New';

    const tw  = ctx.measureText(b.text).width;
    const pad = 10, bh = 22, tailH = 8;
    const bw  = tw + pad * 2;

    // Bubble body sits above the tail tip (b.by)
    const ty = Math.round(b.by - bh - tailH);
    // Clamp x so bubble stays inside canvas
    const tx = Math.max(4, Math.min(W - bw - 4, Math.round(b.bx - bw / 2)));
    // Keep tail x aligned to source even when bubble is clamped
    const tailX = Math.max(tx + 8, Math.min(tx + bw - 8, Math.round(b.bx)));

    // Body
    ctx.fillStyle = b.color;
    rrect(ctx, tx, ty, bw, bh, 4);
    ctx.fill();

    // Tail (points down to b.by)
    ctx.beginPath();
    ctx.moveTo(tailX - 5, ty + bh);
    ctx.lineTo(tailX + 5, ty + bh);
    ctx.lineTo(tailX,     ty + bh + tailH);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = b.borderColor;
    ctx.lineWidth = 1;
    rrect(ctx, tx, ty, bw, bh, 4);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#1a1a2e';
    ctx.fillText(b.text, tx + pad, ty + 15);

    ctx.restore();
  }

  function drawBubbles() {
    bubbles.forEach(_drawOneBubble);
  }

  // ── render loop ───────────────────────────────────────────────────
  function render(ts) {
    if (paused) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.1);
    lastTime = ts;

    bubbles = bubbles.filter(b => { b.timer -= dt; return b.timer > 0; });

    ctx.clearRect(0, 0, W, H);
    drawFloor();

    if (!data) { animId = requestAnimationFrame(render); return; }

    drawRoads(data.roads);

    data.buildings.forEach(b => {
      if (b.status === 'active') drawActive(b, b.id === hoverId);
      else                       drawConstruction(b, b.id === hoverId);
    });

    // Hover glow ring (drawn before characters so it appears under sprite)
    if (hoveredCharId) {
      const hc = chars.find(c => c.id === hoveredCharId);
      if (hc) {
        ctx.save();
        ctx.fillStyle   = hc.color + '28';
        ctx.shadowColor = hc.color;
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.ellipse(Math.round(hc.x), Math.round(hc.y - 13), 13, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    chars.forEach(c => { c.update(dt); c.draw(ctx); });
    drawBubbles();

    animId = requestAnimationFrame(render);
  }

  // ── scene transition (Task 08) ────────────────────────────────────
  let activeScene = null; // tracks current indoor scene for cleanup

  function enterScene(sceneObj, initFn) {
    paused = true;
    hoverId = null;
    hoveredCharId = null;
    canvas.style.cursor = 'default';
    activeScene = sceneObj;
    initFn();
    const overlay = document.getElementById('scene-overlay');
    // Double-rAF ensures the browser paints once before adding .active
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('active')));
  }

  // ── events ────────────────────────────────────────────────────────
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top)  * (H / rect.height)
    };
  }

  function buildingAt(mx, my) {
    if (!data) return null;
    return data.buildings.find(b =>
      mx >= b.x && mx <= b.x + b.width &&
      my >= b.y && my <= b.y + b.height
    ) || null;
  }

  // Hit-test characters — sprite is 8×14 at scale 2 = 16×28 px, feet at (c.x, c.y)
  function charAt(mx, my) {
    const hw = 8, hh = 28; // half-width = 8px, full height = 28px
    return chars.find(c =>
      mx >= c.x - hw && mx <= c.x + hw &&
      my >= c.y - hh && my <= c.y
    ) || null;
  }

  function onMouseMove(e) {
    const { x, y } = canvasPos(e);
    const hc = charAt(x, y);
    hoveredCharId = hc ? hc.id : null;
    // Only highlight building when not hovering a character
    const hb = hc ? null : buildingAt(x, y);
    hoverId = hb ? hb.id : null;
    canvas.style.cursor = (hc || hb) ? 'pointer' : 'default';
  }

  function onClick(e) {
    const { x, y } = canvasPos(e);

    // Characters are drawn on top — check them first
    const hc = charAt(x, y);
    if (hc) {
      const lines = DIALOGUES[hc.id] || ['...'];
      const text  = lines[Math.floor(Math.random() * lines.length)];
      // Bubble tip = just above sprite head (c.y - 28px sprite height - 4px gap)
      showBubble(text, hc.x, hc.y - 32, '#f6f6ff', hc.color, 3.2);
      return;
    }

    const hit = buildingAt(x, y);
    if (!hit) { triggerWalkTest(); return; }

    if (hit.status === 'construction') {
      showBubble('這裡還在規劃中...', hit.x + hit.width / 2, hit.y, '#fff8ee', '#cc8800');
      return;
    }

    if      (hit.scene === 'home') enterScene(HomeScene, () => HomeScene.init(data));
    else if (hit.scene === 'hq')   enterScene(HQScene,   () => HQScene.init(data));
    else if (hit.scene === 'itri') enterScene(ITRIScene,  () => ITRIScene.init(data));
  }

  // ── public ────────────────────────────────────────────────────────
  return {
    init() {
      fetch('data/world.json')
        .then(r => r.json())
        .then(d => {
          data  = d;
          chars = d.characters.map(c => {
            const ch = new Character(c);
            ch.setState('idle'); // world map: standing, not sitting at desk
            return ch;
          });
          precompute(d.buildings);
          // Inject character-specific sprites (Task 05)
          const charMap = {};
          chars.forEach(c => { charMap[c.id] = c; });
          CharacterSprites.applyAll(charMap);
        });

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('click', onClick);
      canvas.addEventListener('touchend', e => {
        e.preventDefault();
        onClick(e.changedTouches[0]);
      }, { passive: false });

      lastTime = performance.now();
      animId   = requestAnimationFrame(render);
    },

    resume() {
      const overlay = document.getElementById('scene-overlay');
      overlay.classList.remove('active');
      if (activeScene && typeof activeScene.cleanup === 'function') activeScene.cleanup();
      activeScene = null;
      BaseScene.stopLoop();
      // Wait for CSS fade (250ms) before re-starting the world loop
      setTimeout(() => {
        paused   = false;
        lastTime = performance.now();
        animId   = requestAnimationFrame(render);
      }, 260);
    },

    // Phase-2 morning meeting: all non-HQ characters walk to HQ
    triggerMorning() {
      assembled = false; // reset so triggerWalkTest assembles toward HQ
      triggerWalkTest();
    },

    // Console / Phase-2 helper: walk one character to a named scene
    walkCharTo(id, scene) {
      const c = chars.find(c => c.id === id);
      if (!c) return console.warn('Unknown character:', id);
      const path = buildPath(c.scene, scene);
      if (!path.length) return console.warn('No path:', c.scene, '→', scene);
      c.walkAlong(path, scene);
    }
  };
})();
