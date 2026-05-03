// Character class — Task 04: sprite system, idle/working/alert animation, position
// Task 05 will call applySprite() to inject character-specific pixel maps.
// Task 06 will flesh out walkTo() movement.

class Character {

  // ── Base sprite maps (8 cols × N rows, drawn at SCALE px/pixel) ──
  // Colour indices: 0=transparent 1=skin 2=hair 3=body 4=armDark 5=leg 6=accent
  static SCALE = 2;

  static IDLE_SPRITE = [
    [0, 0, 2, 2, 2, 2, 0, 0], // 0  hair top
    [0, 2, 2, 2, 2, 2, 2, 0], // 1  hair
    [0, 1, 1, 1, 1, 1, 1, 0], // 2  face
    [0, 1, 6, 1, 1, 6, 1, 0], // 3  eyes
    [0, 1, 1, 1, 1, 1, 1, 0], // 4  face lower
    [0, 3, 3, 3, 3, 3, 3, 0], // 5  collar
    [4, 3, 3, 3, 3, 3, 3, 4], // 6  arms + body
    [4, 3, 3, 3, 3, 3, 3, 4], // 7  arms + body
    [0, 3, 3, 3, 3, 3, 3, 0], // 8  body
    [0, 3, 3, 3, 3, 3, 3, 0], // 9  body lower
    [0, 5, 5, 0, 0, 5, 5, 0], // 10 legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 11 legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 12 legs
    [0, 6, 6, 0, 0, 6, 6, 0], // 13 feet
  ];

  // Working: upper-body only (sitting pose), two arm frames for typing flicker
  static WORK_A = [
    [0, 0, 2, 2, 2, 2, 0, 0], // 0  hair
    [0, 2, 2, 2, 2, 2, 2, 0], // 1  hair
    [0, 1, 1, 1, 1, 1, 1, 0], // 2  face
    [0, 1, 6, 1, 1, 6, 1, 0], // 3  eyes
    [0, 1, 1, 1, 1, 1, 1, 0], // 4  face lower
    [0, 3, 3, 3, 3, 3, 3, 0], // 5  body
    [0, 3, 3, 3, 3, 3, 3, 0], // 6  body
    [4, 4, 3, 3, 3, 3, 4, 4], // 7  arms extended forward
    [0, 0, 4, 4, 4, 4, 0, 0], // 8  hands on desk
    [0, 0, 0, 0, 0, 0, 0, 0], // 9  (desk surface)
  ];

  static WORK_B = [
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 6, 1, 1, 6, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 4, 3, 3, 3, 3, 4, 0], // arms slightly raised
    [0, 4, 4, 4, 4, 4, 4, 0], // hands up
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // ── constructor ──────────────────────────────────────────────────
  constructor(cfg) {
    this.id    = cfg.id;
    this.name  = cfg.name;
    this.color = cfg.color;

    // World-map position (feet coordinates)
    this.x     = cfg.startX;
    this.y     = cfg.startY;
    this.homeX = cfg.startX;
    this.homeY = cfg.startY;

    // Which building/scene this character belongs to
    this.scene = cfg.scene;

    // Animation timer (seconds)
    this.frame = 0;

    // State machine: idle | working | walking | talking | alert
    this.state = 'working';

    // Walking (Task 06 will implement path logic)
    this.targetX = cfg.startX;
    this.targetY = cfg.startY;
    this.speed   = 80; // px / s

    // Custom sprite injected by Task 05 (null = use base sprite)
    this.customIdleSprite = null;
    this.customWorkA      = null;
    this.customWorkB      = null;

    // Build colour palette from body colour
    this._buildPalette(cfg.color);
  }

  // ── colour helpers ───────────────────────────────────────────────
  _hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }

  _rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0'))
      .join('');
  }

  _shade(hex, factor) {
    const [r, g, b] = this._hexToRgb(hex);
    return this._rgbToHex(r * factor, g * factor, b * factor);
  }

  _buildPalette(bodyHex) {
    // Indices map: [0]=transparent [1]=skin [2]=hair [3]=body [4]=arm [5]=leg [6]=accent
    this.palette = [
      null,
      '#ffe0b2',                  // 1 skin
      '#1a1a1a',                  // 2 hair  (overridden in Task 05)
      bodyHex,                    // 3 body
      this._shade(bodyHex, 0.65), // 4 arm / dark accent
      this._shade(bodyHex, 0.52), // 5 leg
      '#0d0d0d',                  // 6 eyes / feet
    ];
  }

  // Allow Task 05 to override individual palette slots
  setPaletteColor(index, hex) {
    this.palette[index] = hex;
  }

  // Allow Task 05 to inject full sprite maps
  applySprite(cfg) {
    if (cfg.palette) {
      cfg.palette.forEach(([idx, color]) => this.setPaletteColor(idx, color));
    }
    if (cfg.idle)  this.customIdleSprite = cfg.idle;
    if (cfg.workA) this.customWorkA      = cfg.workA;
    if (cfg.workB) this.customWorkB      = cfg.workB;
  }

  // ── state helpers ────────────────────────────────────────────────
  setState(s) {
    this.state = s;
  }

  // ── update ───────────────────────────────────────────────────────
  update(dt) {
    this.frame += dt;

    // Task 06 walking stub (does nothing yet, position is static)
    if (this.state === 'walking') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.state = 'idle';
      }
      // Actual movement implemented in Task 06
    }
  }

  // ── sprite selection ─────────────────────────────────────────────
  _pickSprite() {
    if (this.state === 'working') {
      const frame = Math.floor(this.frame / 0.38) % 2;
      return frame === 0
        ? (this.customWorkA || Character.WORK_A)
        : (this.customWorkB || Character.WORK_B);
    }
    return this.customIdleSprite || Character.IDLE_SPRITE;
  }

  _bounceDy() {
    switch (this.state) {
      case 'working': return 0;
      case 'alert':   return Math.sin(this.frame * 7)  * 1;
      default:        return Math.sin(this.frame * 3.5) * 2;
    }
  }

  // ── core renderer ────────────────────────────────────────────────
  _renderSprite(ctx, cx, cy, sprite) {
    const S    = Character.SCALE;
    const cols = sprite[0].length;
    const rows = sprite.length;
    const ox   = Math.round(cx - (cols * S) / 2);
    const oy   = Math.round(cy - rows * S);

    sprite.forEach((row, ry) => {
      row.forEach((ci, rx) => {
        const color = this.palette[ci];
        if (!color) return;
        ctx.fillStyle = color;
        ctx.fillRect(ox + rx * S, oy + ry * S, S, S);
      });
    });
  }

  // Alert exclamation mark above head
  _drawAlert(ctx, cx, cy) {
    // Flash at ~2 Hz
    if (Math.sin(this.frame * Math.PI * 4) < 0) return;
    const S  = Character.SCALE;
    const ax = Math.round(cx) - S;
    const ay = Math.round(cy) - Character.IDLE_SPRITE.length * S - 10;
    ctx.fillStyle = '#ffdd00';
    ctx.fillRect(ax, ay,     S * 2, S * 4); // ! stem
    ctx.fillRect(ax, ay + S * 5, S * 2, S * 2); // ! dot
  }

  // Subtle name label (world-map only — not drawn by drawAt)
  _drawName(ctx, cx, cy) {
    ctx.save();
    ctx.font = '8px Courier New';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = this.color + 'cc';
    ctx.fillText(this.name, cx, cy + 3);
    ctx.restore();
  }

  // ── public draw API ──────────────────────────────────────────────

  // Called by World render loop (world-map context)
  draw(ctx) {
    const dy     = this._bounceDy();
    const cx     = Math.round(this.x);
    const cy     = Math.round(this.y + dy);
    const sprite = this._pickSprite();

    this._renderSprite(ctx, cx, cy, sprite);
    this._drawName(ctx, cx, this.y); // name always at true y, no bounce

    if (this.state === 'alert') this._drawAlert(ctx, cx, cy);
  }

  // Called by indoor scene renderers to place the character at a custom position
  drawAt(ctx, x, y, overrideState) {
    const prevState = this.state;
    if (overrideState) this.state = overrideState;

    const dy     = this._bounceDy();
    const cx     = Math.round(x);
    const cy     = Math.round(y + dy);
    const sprite = this._pickSprite();

    this._renderSprite(ctx, cx, cy, sprite);
    if (this.state === 'alert') this._drawAlert(ctx, cx, cy);

    if (overrideState) this.state = prevState;
  }
}
