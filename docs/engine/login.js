const LoginScreen = (() => {
  const canvas = document.getElementById('login-canvas');
  const ctx    = canvas.getContext('2d');
  const W = 680, H = 480;

  let animId   = null;
  let frame    = 0;          // seconds elapsed
  let state    = 'idle';     // idle | error | success
  let errorT   = 0;          // countdown for error shake (seconds)
  let charX    = W / 2;      // character centre x (moves on success)
  let overlayAlpha = 1;

  // ── seeded pseudo-random ───────────────────────────────────────────
  function mkRand(seed) {
    let s = seed >>> 0;
    return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0x100000000; };
  }

  // ── static scene data ─────────────────────────────────────────────
  const STARS = (() => {
    const r = mkRand(7);
    return Array.from({ length: 90 }, () => ({
      x: r() * W, y: r() * 260,
      size: r() < 0.75 ? 1 : 2,
      phase: r() * Math.PI * 2
    }));
  })();

  const BUILDINGS = [
    { x: 0,   y: 310, w: 62,  h: 170 },
    { x: 48,  y: 268, w: 54,  h: 212 },
    { x: 92,  y: 238, w: 68,  h: 242 },
    { x: 148, y: 285, w: 44,  h: 195 },
    { x: 178, y: 208, w: 88,  h: 272 },
    { x: 252, y: 260, w: 52,  h: 220 },
    { x: 292, y: 298, w: 42,  h: 182 },
    { x: 322, y: 228, w: 76,  h: 252 },
    { x: 386, y: 272, w: 58,  h: 208 },
    { x: 432, y: 242, w: 72,  h: 238 },
    { x: 492, y: 302, w: 46,  h: 178 },
    { x: 526, y: 212, w: 82,  h: 268 },
    { x: 596, y: 258, w: 56,  h: 222 },
    { x: 638, y: 288, w: 52,  h: 192 },
  ];

  // Pre-compute window grids per building (lit / colour fixed at init)
  const WINDOWS = BUILDINGS.map((b, bi) => {
    const r = mkRand(bi * 997 + 13);
    const wins = [];
    for (let wy = b.y + 12; wy < H - 8; wy += 10) {
      for (let wx = b.x + 7; wx < b.x + b.w - 7; wx += 12) {
        if (r() < 0.38) wins.push({ x: wx, y: wy, warm: r() < 0.6 });
      }
    }
    return wins;
  });

  // ── draw helpers ──────────────────────────────────────────────────
  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0,   '#03030e');
    g.addColorStop(0.6, '#080820');
    g.addColorStop(1,   '#0d0d2a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(t) {
    STARS.forEach(s => {
      const a = 0.5 + 0.5 * Math.sin(s.phase + t * 1.4);
      ctx.fillStyle = `rgba(200,210,255,${(0.4 + a * 0.6).toFixed(2)})`;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    });
  }

  function drawMoon() {
    // Glow
    const g = ctx.createRadialGradient(582, 58, 0, 582, 58, 50);
    g.addColorStop(0,   'rgba(240,240,180,0.18)');
    g.addColorStop(1,   'rgba(240,240,180,0)');
    ctx.fillStyle = g;
    ctx.fillRect(540, 16, 84, 84);
    // Moon disc (pixel-art: 3×3 blocks)
    const MOON = [
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],
    ];
    const bx = 562, by = 38, bs = 4;
    MOON.forEach((row, ry) => {
      row.forEach((on, rx) => {
        if (!on) return;
        ctx.fillStyle = '#eeeebb';
        ctx.fillRect(bx + rx * bs, by + ry * bs, bs, bs);
      });
    });
    // Crater
    ctx.fillStyle = '#d8d89a';
    ctx.fillRect(578, 50, 4, 4);
    ctx.fillRect(568, 58, 4, 4);
  }

  function drawBuildings() {
    BUILDINGS.forEach((b, bi) => {
      // Body
      ctx.fillStyle = '#0c0c1e';
      ctx.fillRect(b.x, b.y, b.w, H - b.y);
      // Top edge slightly lighter
      ctx.fillStyle = '#14142e';
      ctx.fillRect(b.x, b.y, b.w, 3);
      // Windows
      WINDOWS[bi].forEach(w => {
        ctx.fillStyle = w.warm ? '#ffe88a' : '#88aaff';
        ctx.fillRect(w.x, w.y, 6, 4);
      });
    });
  }

  // ── pixel-art HY character ─────────────────────────────────────────
  // Each row is [r,g,b,a] or null (transparent)
  // 11×16 px sprite (1px = 2 canvas px for visibility)
  const SCALE = 2;
  const _ = null;
  const S = '#ffe0b2'; // skin
  const G = '#44cc66'; // green body
  const D = '#2a7a44'; // dark green (legs/feet)
  const B = '#2266aa'; // glasses blue
  const H2 = '#222222'; // hair dark
  const W2 = '#ffffff'; // whites of eyes

  // Body pixel map — 16 rows × 11 cols
  const CHAR_MAP = [
    [_,_,_,H2,H2,H2,H2,H2,_,_,_],  // 0 hair top
    [_,_,H2,H2,H2,H2,H2,H2,H2,_,_], // 1 hair
    [_,_,S, S, S, S, S, S, S, _,_],  // 2 face
    [_,_,S, B, B, S, B, B, S, _,_],  // 3 glasses
    [_,_,S, S, S, S, S, S, S, _,_],  // 4 face
    [_,_,S, S, S, S, S, S, S, _,_],  // 5 face (mouth)
    [_,G, G, G, G, G, G, G, G, G,_], // 6 shoulders
    [_,G, G, G, G, G, G, G, G, G,_], // 7 chest
    [_,G, G, G, G, G, G, G, G, G,_], // 8 chest
    [_,G, G, G, G, G, G, G, G, G,_], // 9 chest
    [_,G, G, G, G, G, G, G, G, G,_], // 10 waist
    [_,_,D, D, _,_,_,D, D, _,_],     // 11 legs gap
    [_,_,D, D, _,_,_,D, D, _,_],     // 12 legs
    [_,_,D, D, _,_,_,D, D, _,_],     // 13 legs
    [_,_,D, D, D,_,D, D, D, _,_],    // 14 feet
    [_,_,_,_,_,_,_,_,_,_,_],        // 15 (empty)
  ];
  const CHAR_W = 11 * SCALE;
  const CHAR_H = 16 * SCALE;

  function drawCharacter(cx, cy, t) {
    // Compute offsets based on state
    let dy = 0, dx = 0;

    if (state === 'idle' || state === 'success') {
      dy = Math.sin(t * 3) * 2;
    }
    if (state === 'error' && errorT > 0) {
      dx = Math.sin(t * 28) * 5;
      dy = Math.abs(Math.sin(t * 28)) * -2; // slight up twitch
    }
    if (state === 'success') {
      dx = 0; // charX is moved externally
    }

    const ox = Math.round(cx - CHAR_W / 2 + dx);
    const oy = Math.round(cy - CHAR_H + dy);

    CHAR_MAP.forEach((row, ry) => {
      row.forEach((col, rx) => {
        if (!col) return;
        ctx.fillStyle = col;
        ctx.fillRect(ox + rx * SCALE, oy + ry * SCALE, SCALE, SCALE);
      });
    });
  }

  // ── overlay (for success fade) ────────────────────────────────────
  function applyOverlayAlpha() {
    const el = document.getElementById('login-overlay');
    if (el) el.style.opacity = overlayAlpha;
  }

  // ── main render loop ──────────────────────────────────────────────
  let lastTs = 0;
  function render(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;
    frame += dt;

    if (state === 'error') {
      errorT = Math.max(0, errorT - dt);
      if (errorT <= 0) state = 'idle';
    }

    if (state === 'success') {
      charX += dt * 320;           // walk right at 320px/s
      overlayAlpha = Math.max(0, overlayAlpha - dt * 1.2);
      applyOverlayAlpha();
      if (overlayAlpha <= 0) {
        cancelAnimationFrame(animId);
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('login-overlay').style.opacity = 1;
        World.init();
        return;
      }
    }

    // Draw scene
    ctx.clearRect(0, 0, W, H);
    drawSky();
    drawStars(frame);
    drawMoon();
    drawBuildings();
    drawCharacter(charX, 258, frame);

    animId = requestAnimationFrame(render);
  }

  // ── password check ────────────────────────────────────────────────
  function tryLogin() {
    const input = document.getElementById('pw-input');
    const val   = input ? input.value : '';

    if (val === window.PASSWORD) {
      state = 'success';
      localStorage.setItem('hy_auth', 'ok');
      // Hide form immediately so it doesn't show over walk animation
      const form = document.getElementById('login-form');
      if (form) form.style.display = 'none';
    } else {
      state  = 'idle';   // reset first so timer fires correctly
      errorT = 0.55;
      state  = 'error';
      if (input) {
        input.value = '';
        input.classList.remove('shake');
        void input.offsetWidth; // reflow to restart animation
        input.classList.add('shake');
      }
    }
  }

  // ── public ────────────────────────────────────────────────────────
  return {
    init() {
      charX        = W / 2;
      frame        = 0;
      state        = 'idle';
      errorT       = 0;
      overlayAlpha = 1;

      const overlay = document.getElementById('login-overlay');
      overlay.classList.remove('hidden');
      overlay.style.opacity = 1;

      // Wire up form elements
      const form  = document.getElementById('login-form');
      const input = document.getElementById('pw-input');
      const btn   = document.getElementById('login-btn');
      if (form) form.style.display = '';

      if (btn) {
        btn.onclick = tryLogin;
      }
      if (input) {
        input.value = '';
        input.onkeydown = e => { if (e.key === 'Enter') tryLogin(); };
        // Focus after short delay (overlay is visible)
        setTimeout(() => input.focus(), 100);
      }

      if (animId) cancelAnimationFrame(animId);
      lastTs = performance.now();
      animId = requestAnimationFrame(render);
    }
  };
})();
