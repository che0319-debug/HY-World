// BaseScene — Task 08: shared indoor-scene utilities
// Provides canvas ref, animation loop, and pixel-art drawing helpers.

const BaseScene = (() => {
  const canvas = document.getElementById('scene-canvas');
  const ctx    = canvas.getContext('2d');
  const W = 680, H = 480;

  let _animId   = null;
  let _lastTime = 0;

  // ── animation loop ────────────────────────────────────────────────
  function startLoop(drawFn) {
    stopLoop();
    _lastTime = performance.now();
    function tick(ts) {
      const dt = Math.min((ts - _lastTime) / 1000, 0.1);
      _lastTime = ts;
      ctx.clearRect(0, 0, W, H);
      drawFn(ctx, dt, W, H);
      _animId = requestAnimationFrame(tick);
    }
    _animId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
  }

  // ── drawing helpers ───────────────────────────────────────────────

  // Filled tiled floor with grid lines
  function drawFloor(tileColor = '#13132a', lineColor = '#0f0f22') {
    ctx.fillStyle = tileColor;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 20) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += 20) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
  }

  // Solid wall rectangle
  function drawWall(x, y, w, h, color = '#1a1a30') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // Pixel-art window: 20×24px, optionally lit (warm or cool)
  function drawWindow(x, y, lit = true, warm = true) {
    const ww = 20, wh = 24;
    // Frame
    ctx.fillStyle = '#26264a';
    ctx.fillRect(x, y, ww, wh);
    // Pane
    if (lit) {
      ctx.fillStyle = warm ? '#ffcc66' : '#7799ff';
      ctx.fillRect(x + 2, y + 2, ww - 4, wh - 4);
      // Highlight
      ctx.fillStyle = warm ? 'rgba(255,240,190,0.5)' : 'rgba(190,210,255,0.5)';
      ctx.fillRect(x + 3, y + 3, (ww - 4) / 2, 3);
      // Dividers
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + ww / 2 - 1, y + 2, 2, wh - 4);
      ctx.fillRect(x + 2, y + wh / 2 - 1, ww - 4, 2);
    } else {
      ctx.fillStyle = '#07071a';
      ctx.fillRect(x + 2, y + 2, ww - 4, wh - 4);
    }
  }

  // Pixel-art door: 24×36px
  function drawDoor(x, y) {
    ctx.fillStyle = '#09091a';
    ctx.fillRect(x, y, 24, 36);
    ctx.fillStyle = '#1a1a30';
    ctx.fillRect(x + 3, y + 3, 18, 33);
    ctx.strokeStyle = '#2c2c52';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, 23, 35);
    // Handle
    ctx.fillStyle = '#5555a8';
    ctx.fillRect(x + 16, y + 16, 4, 5);
  }

  // Simple pixel-art desk: w×h rectangle with surface highlight
  function drawDesk(x, y, w, h, color = '#2a1e14') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(x, y, w, 3);
    ctx.strokeStyle = '#1a1208';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  // Small pixel monitor on a desk
  function drawMonitor(x, y) {
    // Screen body
    ctx.fillStyle = '#111122';
    ctx.fillRect(x, y, 30, 22);
    // Screen glow (blue-ish)
    ctx.fillStyle = '#223355';
    ctx.fillRect(x + 2, y + 2, 26, 16);
    // Fake scan lines
    ctx.fillStyle = 'rgba(0,200,255,0.08)';
    for (let i = 0; i < 8; i++) ctx.fillRect(x + 2, y + 2 + i * 2, 26, 1);
    // Stand
    ctx.fillStyle = '#222233';
    ctx.fillRect(x + 12, y + 22, 6, 5);
    ctx.fillRect(x + 8,  y + 27, 14, 3);
  }

  // Chair (simple pixel block)
  function drawChair(x, y, color = '#1c1c30') {
    // Seat
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 8, 22, 10);
    // Back
    ctx.fillRect(x + 2, y, 18, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(x + 2, y, 18, 2);
  }

  // ── public ────────────────────────────────────────────────────────
  return { canvas, ctx, W, H, startLoop, stopLoop, drawFloor, drawWall, drawWindow, drawDoor, drawDesk, drawMonitor, drawChair };
})();
