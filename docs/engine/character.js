// Character class — movement, animation, speech bubbles — expanded in Tasks 04–07
class Character {
  constructor(cfg) {
    this.id    = cfg.id;
    this.name  = cfg.name;
    this.color = cfg.color;
    this.x     = cfg.startX;
    this.y     = cfg.startY;
    this.frame = 0;
    this.state = 'idle'; // idle | walking | working | talking | alert
  }

  update(dt) {
    this.frame += dt;
  }

  draw(ctx) {
    const bounce = Math.sin(this.frame * 3) * 1.5;
    // Placeholder block character — replaced in Task 04/05
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 6, this.y - 14 + bounce, 12, 14);
    ctx.fillStyle = '#ffe0b2';
    ctx.fillRect(this.x - 5, this.y - 22 + bounce, 10, 10);
  }
}
