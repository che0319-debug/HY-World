// Character class — Tasks 04/05/06
// Task 04: sprite system, animation states, idle/working/alert
// Task 05: applySprite() hook for per-character pixel overrides
// Task 06: walkAlong() path following, walk animation, direction flip

class Character {

  // ── Sprite maps ─────────────────────────────────────────────────
  // 8 cols × N rows drawn at SCALE px per sprite-pixel.
  // Colour indices: 0=transparent 1=skin 2=hair 3=body 4=armDark 5=leg 6=accent
  // Extra slots: 7=glasses (HY)  8=hat-brim (950157) — set via applySprite()
  static SCALE = 2;

  static IDLE_SPRITE = [
    [0, 0, 2, 2, 2, 2, 0, 0], //  0  hair top
    [0, 2, 2, 2, 2, 2, 2, 0], //  1  hair
    [0, 1, 1, 1, 1, 1, 1, 0], //  2  face
    [0, 1, 6, 1, 1, 6, 1, 0], //  3  eyes
    [0, 1, 1, 1, 1, 1, 1, 0], //  4  face lower
    [0, 3, 3, 3, 3, 3, 3, 0], //  5  collar
    [4, 3, 3, 3, 3, 3, 3, 4], //  6  arms + body
    [4, 3, 3, 3, 3, 3, 3, 4], //  7  arms + body
    [0, 3, 3, 3, 3, 3, 3, 0], //  8  body
    [0, 3, 3, 3, 3, 3, 3, 0], //  9  body lower
    [0, 5, 5, 0, 0, 5, 5, 0], // 10  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 11  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 12  legs
    [0, 6, 6, 0, 0, 6, 6, 0], // 13  feet
  ];

  // Working: upper-body only (sitting), two arm frames for typing flicker
  static WORK_A = [
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 6, 1, 1, 6, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [4, 4, 3, 3, 3, 3, 4, 4], // arms extended (typing-A)
    [0, 0, 4, 4, 4, 4, 0, 0], // hands on desk
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  static WORK_B = [
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 6, 1, 1, 6, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 4, 3, 3, 3, 3, 4, 0], // arms raised (typing-B)
    [0, 4, 4, 4, 4, 4, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Walking: leg rows only (4 rows), composited with idle upper-body in _buildWalkSprite()
  // WALK_LEGS_B is the horizontal mirror of WALK_LEGS_A.
  static WALK_LEGS_A = [
    [0, 5, 5, 5, 0, 0, 5, 0], // left leg forward (cols 1-3), right back (col 6)
    [0, 5, 5, 5, 0, 0, 5, 0],
    [0, 0, 5, 5, 0, 5, 5, 0], // left foot flat, right trailing
    [0, 0, 6, 0, 0, 6, 0, 0], // feet
  ];
  static WALK_LEGS_B = [
    [0, 5, 0, 0, 5, 5, 5, 0], // mirror: right leg forward (cols 4-6), left back (col 1)
    [0, 5, 0, 0, 5, 5, 5, 0],
    [0, 5, 5, 0, 5, 5, 0, 0],
    [0, 0, 6, 0, 0, 6, 0, 0],
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

    this.frame = 0;

    // State machine: idle | working | walking | talking | alert
    this.state = 'working';

    // Walking (Task 06)
    this.path        = [];   // [{x,y}, …] waypoints remaining
    this.targetScene = null; // scene ID to set on arrival
    this.walkDir     = 1;    // 1 = right, -1 = left (for sprite flip)
    this.speed       = 80;   // px / s

    // Custom sprites injected by Task 05 (null = use base class statics)
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

  _shade(hex, f) {
    const [r, g, b] = this._hexToRgb(hex);
    return this._rgbToHex(r * f, g * f, b * f);
  }

  _buildPalette(bodyHex) {
    this.palette = [
      null,                       // 0 transparent
      '#ffe0b2',                  // 1 skin
      '#1a1a1a',                  // 2 hair  (overridden per character)
      bodyHex,                    // 3 body
      this._shade(bodyHex, 0.65), // 4 arm / dark accent
      this._shade(bodyHex, 0.52), // 5 leg
      '#0d0d0d',                  // 6 eyes / feet
    ];
  }

  // Allow Task 05 to override individual palette slots (including extra ones)
  setPaletteColor(index, hex) { this.palette[index] = hex; }

  // Allow Task 05 to inject full sprite maps and/or palette overrides
  applySprite(cfg) {
    if (cfg.palette) cfg.palette.forEach(([i, c]) => this.setPaletteColor(i, c));
    if (cfg.idle)  this.customIdleSprite = cfg.idle;
    if (cfg.workA) this.customWorkA      = cfg.workA;
    if (cfg.workB) this.customWorkB      = cfg.workB;
  }

  setState(s) { this.state = s; }

  // ── update ───────────────────────────────────────────────────────
  update(dt) {
    this.frame += dt;

    if (this.state !== 'walking' || this.path.length === 0) return;

    const wp   = this.path[0];
    const dx   = wp.x - this.x;
    const dy   = wp.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 3) {
      // Snap to waypoint and advance
      this.x = wp.x;
      this.y = wp.y;
      this.path.shift();
      if (this.path.length === 0) {
        this.state = 'working';
        if (this.targetScene) { this.scene = this.targetScene; this.targetScene = null; }
      }
    } else {
      this.walkDir = dx < 0 ? -1 : 1;
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
  }

  // ── sprite selection ─────────────────────────────────────────────
  _buildWalkSprite() {
    // Combine character-specific head/body (rows 0-9) with alternating walk legs
    const upper = (this.customIdleSprite || Character.IDLE_SPRITE).slice(0, 10);
    const legs  = Math.floor(this.frame * 5) % 2 === 0
      ? Character.WALK_LEGS_A
      : Character.WALK_LEGS_B;
    return [...upper, ...legs];
  }

  _pickSprite() {
    if (this.state === 'walking') return this._buildWalkSprite();
    if (this.state === 'working') {
      return Math.floor(this.frame / 0.38) % 2 === 0
        ? (this.customWorkA || Character.WORK_A)
        : (this.customWorkB || Character.WORK_B);
    }
    return this.customIdleSprite || Character.IDLE_SPRITE;
  }

  _bounceDy() {
    switch (this.state) {
      case 'working': return 0;
      case 'walking': return -Math.abs(Math.sin(this.frame * 8)) * 2; // step lift
      case 'alert':   return  Math.sin(this.frame * 7) * 1;
      default:        return  Math.sin(this.frame * 3.5) * 2;
    }
  }

  // ── core renderer ────────────────────────────────────────────────
  // flipX mirrors the sprite horizontally (used when walking left)
  _renderSprite(ctx, cx, cy, sprite, flipX = false) {
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
        const drawRx = flipX ? (cols - 1 - rx) : rx;
        ctx.fillRect(ox + drawRx * S, oy + ry * S, S, S);
      });
    });
  }

  // Alert: flashing ! mark above head at 2 Hz
  _drawAlert(ctx, cx, cy) {
    if (Math.sin(this.frame * Math.PI * 4) < 0) return;
    const S  = Character.SCALE;
    const ax = Math.round(cx) - S;
    const ay = Math.round(cy) - Character.IDLE_SPRITE.length * S - 10;
    ctx.fillStyle = '#ffdd00';
    ctx.fillRect(ax, ay,         S * 2, S * 4); // ! stem
    ctx.fillRect(ax, ay + S * 5, S * 2, S * 2); // ! dot
  }

  // Name label (world-map context only — not drawn in drawAt)
  _drawName(ctx, cx, cy) {
    ctx.save();
    ctx.font            = '8px Courier New';
    ctx.textAlign       = 'center';
    ctx.textBaseline    = 'top';
    ctx.fillStyle       = this.color + 'cc';
    ctx.fillText(this.name, cx, cy + 3);
    ctx.restore();
  }

  // ── public draw API ──────────────────────────────────────────────

  // World-map render loop calls this
  draw(ctx) {
    const dy     = this._bounceDy();
    const cx     = Math.round(this.x);
    const cy     = Math.round(this.y + dy);
    const sprite = this._pickSprite();
    const flipX  = this.state === 'walking' && this.walkDir < 0;

    this._renderSprite(ctx, cx, cy, sprite, flipX);
    this._drawName(ctx, cx, this.y);
    if (this.state === 'alert') this._drawAlert(ctx, cx, cy);
  }

  // Indoor scene renderers call this to place the character at a fixed spot
  drawAt(ctx, x, y, overrideState) {
    const prev = this.state;
    if (overrideState) this.state = overrideState;

    const dy     = this._bounceDy();
    const cx     = Math.round(x);
    const cy     = Math.round(y + dy);
    const sprite = this._pickSprite();

    this._renderSprite(ctx, cx, cy, sprite, false);
    if (this.state === 'alert') this._drawAlert(ctx, cx, cy);

    if (overrideState) this.state = prev;
  }

  // ── Task 06: path walking ────────────────────────────────────────

  // Start walking along a pre-built waypoint array.
  // finalScene: scene ID to assign on arrival (can be null).
  walkAlong(path, finalScene = null) {
    this.path        = [...path];
    this.targetScene = finalScene;
    this.state       = 'walking';
    // Initial direction guess from first waypoint
    if (path.length > 0) {
      this.walkDir = path[0].x < this.x ? -1 : 1;
    }
  }
}
