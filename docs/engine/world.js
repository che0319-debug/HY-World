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
    // Base ground
    ctx.fillStyle = '#0c0c1a';
    ctx.fillRect(0, 0, W, H);

    // Sidewalk strip between upper buildings and road (y 180-210)
    ctx.fillStyle = '#0e0e20';
    ctx.fillRect(40, 180, 600, 30);
    // Sidewalk kerb lines
    ctx.fillStyle = '#141428';
    ctx.fillRect(40, 180, 600, 2);
    ctx.fillRect(40, 208, 600, 2);

    // Subtle tile grid (all lines in one path for speed)
    ctx.strokeStyle = '#0f0f22';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += TS) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let y = 0; y <= H; y += TS) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();
  }

  // ── roads ─────────────────────────────────────────────────────────
  function drawRoads(roads) {
    roads.forEach(r => {
      const isV = r.x1 === r.x2;
      const rx = isV ? r.x1 - r.width / 2 : r.x1;
      const ry = isV ? r.y1               : r.y1 - r.width / 2;
      const rw = isV ? r.width            : r.x2 - r.x1;
      const rh = isV ? r.y2 - r.y1       : r.width;

      // Asphalt
      ctx.fillStyle = '#131326';
      ctx.fillRect(rx, ry, rw, rh);

      // Shoulder lines
      ctx.fillStyle = '#1e1e38';
      if (isV) {
        ctx.fillRect(rx,       ry, 2, rh);
        ctx.fillRect(rx+rw-2,  ry, 2, rh);
      } else {
        ctx.fillRect(rx, ry,      rw, 2);
        ctx.fillRect(rx, ry+rh-2, rw, 2);
      }

      // Centre-line dashes (very dark yellow)
      ctx.fillStyle = '#2c2610';
      const cx = Math.round(rx + rw / 2);
      const cy = Math.round(ry + rh / 2);
      if (isV) {
        for (let y = ry + 4; y < ry + rh - 2; y += 16)
          ctx.fillRect(cx - 1, y, 2, 10);
      } else {
        for (let x = rx + 4; x < rx + rw - 2; x += 16)
          ctx.fillRect(x, cy - 1, 10, 2);
      }
    });
  }

  // ── active building ───────────────────────────────────────────────
  function drawActive(b, hovered) {
    const { x, y, width: bw, height: bh } = b;
    const vis = bVis[b.id] || {};
    const ROOF = 12;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(x + 4, y + bh, bw, 6);

    // Wall body
    ctx.fillStyle = '#161628';
    ctx.fillRect(x, y, bw, bh);

    // Side shading
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x,         y, 5, bh);
    ctx.fillRect(x + bw - 5, y, 5, bh);

    // Roof strip
    ctx.fillStyle = '#1e1e3c';
    ctx.fillRect(x, y, bw, ROOF);
    ctx.fillStyle = '#2a2a50'; // top highlight
    ctx.fillRect(x, y, bw, 2);

    // Roof details: two small AC units
    ctx.fillStyle = '#222244';
    ctx.fillRect(x + 10,      y + 3, 14, 8);
    ctx.fillRect(x + bw - 24, y + 3, 14, 8);
    ctx.fillStyle = '#181838';
    ctx.fillRect(x + 10,      y + 3, 14, 2);
    ctx.fillRect(x + bw - 24, y + 3, 14, 2);

    // Windows
    (vis.windows || []).forEach(win => {
      if (win.lit) {
        // Glow halo
        ctx.fillStyle = win.warm
          ? 'rgba(255,200,80,0.10)' : 'rgba(100,140,255,0.10)';
        ctx.fillRect(win.x - 3, win.y - 3, win.w + 6, win.h + 6);
        // Glass pane
        ctx.fillStyle = win.warm ? '#ffcc66' : '#7799ff';
        ctx.fillRect(win.x, win.y, win.w, win.h);
        // Top-left highlight
        ctx.fillStyle = win.warm
          ? 'rgba(255,240,190,0.55)' : 'rgba(190,210,255,0.55)';
        ctx.fillRect(win.x + 1, win.y + 1, win.w / 2 - 1, 3);
        // Cross dividers
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(win.x + win.w / 2 - 1, win.y,            2, win.h);
        ctx.fillRect(win.x,                  win.y + win.h / 2, win.w, 2);
      } else {
        ctx.fillStyle = '#07071a';
        ctx.fillRect(win.x, win.y, win.w, win.h);
      }
      // Window frame
      ctx.strokeStyle = '#26264a';
      ctx.lineWidth = 1;
      ctx.strokeRect(win.x - 0.5, win.y - 0.5, win.w + 1, win.h + 1);
    });

    // Door
    const dW = 28, dH = 36;
    const dX = Math.round(x + (bw - dW) / 2);
    const dY = y + bh - dH;
    ctx.fillStyle = '#09091a';
    ctx.fillRect(dX, dY, dW, dH);
    ctx.fillStyle = '#1a1a30';
    ctx.fillRect(dX + 3, dY + 3, dW - 6, dH - 3);
    ctx.strokeStyle = '#2c2c52';
    ctx.lineWidth = 2;
    ctx.strokeRect(dX - 1, dY - 1, dW + 2, dH + 1);
    // Door handle
    ctx.fillStyle = '#5555a8';
    ctx.fillRect(dX + dW - 9, dY + Math.round(dH / 2) - 2, 4, 5);
    // Step
    ctx.fillStyle = '#1e1e36';
    ctx.fillRect(dX - 5, y + bh - 4, dW + 10, 4);

    // Name sign board on wall (just below roof)
    ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'center';
    const lw = ctx.measureText(b.label).width;
    const sgnX = Math.round(x + bw / 2 - lw / 2) - 5;
    const sgnY = y + ROOF + 2;
    const sgnW = lw + 10, sgnH = 13;
    ctx.fillStyle = '#0c0c22';
    ctx.fillRect(sgnX, sgnY, sgnW, sgnH);
    ctx.strokeStyle = '#3a3a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(sgnX + 0.5, sgnY + 0.5, sgnW - 1, sgnH - 1);
    ctx.fillStyle = '#aaaaee';
    ctx.fillText(b.label, x + bw / 2, sgnY + 10);

    // Sublabel below building
    ctx.font = '8px Courier New';
    ctx.fillStyle = '#38385a';
    ctx.fillText(b.sublabel, x + bw / 2, y + bh + 13);
    ctx.textAlign = 'left';

    // Status light (green, glowing)
    const lx = x + bw - 9, ly = y + 7;
    ctx.fillStyle = b.statusColor + '30';
    ctx.beginPath(); ctx.arc(lx, ly, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.statusColor;
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();

    // Hover outline glow
    if (hovered) {
      ctx.save();
      ctx.shadowColor = '#5588ff';
      ctx.shadowBlur  = 12;
      ctx.strokeStyle = '#5588ff';
      ctx.lineWidth   = 2;
      ctx.strokeRect(x - 1, y - 1, bw + 2, bh + 2);
      ctx.restore();
    }
  }

  // ── construction building ─────────────────────────────────────────
  function drawConstruction(b, hovered) {
    const { x, y, width: bw, height: bh } = b;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.fillRect(x + 4, y + bh, bw, 6);

    // Base (dark, unfinished walls)
    ctx.fillStyle = '#0d0d1c';
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = '#1e1e30';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, bw - 8, bh - 8);

    // Vertical scaffold poles (every 40px)
    const poleXs = [0, 40, 80, 120, 160];
    ctx.fillStyle = '#484858';
    poleXs.forEach(px => {
      ctx.fillRect(x + px - 2, y - 10, 4, bh + 20);
    });

    // Horizontal scaffold beams (every 32px)
    ctx.fillStyle = '#36364a';
    [0, 32, 64, 96].forEach(dy => {
      ctx.fillRect(x - 2, y + dy, bw + 4, 5);
    });

    // Wooden plank on beam 2 and 3
    ctx.fillStyle = '#2c2418';
    [32, 64].forEach(dy => {
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(x + col * 40 + 2, y + dy + 1, 36, 3);
      }
    });

    // Diagonal braces (X pattern in each bay)
    ctx.strokeStyle = '#383848';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < poleXs.length - 1; i++) {
      const px1 = x + poleXs[i];
      const px2 = x + poleXs[i + 1];
      [0, 32, 64].forEach(dy => {
        ctx.beginPath();
        ctx.moveTo(px1, y + dy + 5);
        ctx.lineTo(px2, y + dy + 32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px2, y + dy + 5);
        ctx.lineTo(px1, y + dy + 32);
        ctx.stroke();
      });
    }

    // Construction sign board (centred on building)
    const sbW = 100, sbH = 30;
    const sbX = Math.round(x + (bw - sbW) / 2);
    const sbY = Math.round(y + bh / 2 - sbH / 2);

    // Warning-stripe border
    const stripes = Math.ceil(sbW / 10);
    for (let si = 0; si < stripes; si++) {
      ctx.fillStyle = si % 2 === 0 ? '#bb5500' : '#111118';
      const sw = Math.min(10, sbW - si * 10);
      ctx.fillRect(sbX + si * 10, sbY,           sw, 5);
      ctx.fillRect(sbX + si * 10, sbY + sbH - 5, sw, 5);
    }
    // Sign body
    ctx.fillStyle = '#190e00';
    ctx.fillRect(sbX, sbY + 5, sbW, sbH - 10);
    // Sign text
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dd8800';
    ctx.fillText('建設中', x + bw / 2, sbY + 5 + (sbH - 10) / 2 + 4);

    // Building name above (dim)
    ctx.font = '9px Courier New';
    ctx.fillStyle = '#2e2e44';
    ctx.fillText(b.label, x + bw / 2, y - 4);
    ctx.textAlign = 'left';

    // Status light (dim gray)
    ctx.fillStyle = '#282838';
    ctx.beginPath(); ctx.arc(x + bw - 9, y + 7, 4, 0, Math.PI * 2); ctx.fill();

    // Hover outline
    if (hovered) {
      ctx.save();
      ctx.shadowColor = '#886633';
      ctx.shadowBlur  = 8;
      ctx.strokeStyle = '#886633';
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
    ctx.font = '11px Courier New';

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

    paused = true;
    hoverId = null;
    canvas.style.cursor = 'default';
    document.getElementById('scene-overlay').classList.add('active');

    if      (hit.scene === 'home') HomeScene.init(data);
    else if (hit.scene === 'hq')   HQScene.init(data);
    else if (hit.scene === 'itri') ITRIScene.init(data);
  }

  // ── public ────────────────────────────────────────────────────────
  return {
    init() {
      fetch('data/world.json')
        .then(r => r.json())
        .then(d => {
          data  = d;
          chars = d.characters.map(c => new Character(c));
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
      paused   = false;
      lastTime = performance.now();
      animId   = requestAnimationFrame(render);
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
