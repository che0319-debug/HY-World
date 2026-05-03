// World map renderer — tile system, buildings, scene switching — expanded in Task 03
const World = (() => {
  const canvas  = document.getElementById('world-canvas');
  const ctx     = canvas.getContext('2d');
  let data      = null;
  let chars     = [];
  let lastTime  = 0;
  let animId    = null;
  let paused    = false;

  function loadData() {
    return fetch('data/world.json').then(r => r.json());
  }

  function drawBuilding(b) {
    if (b.status === 'construction') {
      // Scaffold pattern — detailed in Task 03
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeStyle = '#555566';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      // Diagonal stripes
      ctx.strokeStyle = '#444455';
      for (let i = -b.height; i < b.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(b.x + i, b.y);
        ctx.lineTo(b.x + i + b.height, b.y + b.height);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffaa00';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('🚧 建設中', b.x + b.width / 2, b.y + b.height / 2);
    } else {
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeStyle = '#4444aa';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.width, b.height);
    }
    // Label
    ctx.fillStyle = '#ccccee';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, b.x + b.width / 2, b.y - 6);

    // Status dot
    ctx.fillStyle = b.statusColor;
    ctx.beginPath();
    ctx.arc(b.x + b.width - 8, b.y + 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRoads(roads) {
    ctx.fillStyle = '#16162a';
    roads.forEach(r => {
      if (r.x1 === r.x2) {
        ctx.fillRect(r.x1 - r.width / 2, r.y1, r.width, r.y2 - r.y1);
      } else {
        ctx.fillRect(r.x1, r.y1 - r.width / 2, r.x2 - r.x1, r.width);
      }
    });
    // Dashed centre line
    ctx.strokeStyle = '#333355';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    roads.forEach(r => {
      ctx.beginPath();
      if (r.x1 === r.x2) {
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
      } else {
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  function render(ts) {
    if (paused) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.1);
    lastTime = ts;

    ctx.fillStyle = '#0e0e1c';
    ctx.fillRect(0, 0, 680, 480);

    if (!data) { animId = requestAnimationFrame(render); return; }

    drawRoads(data.roads);
    data.buildings.forEach(drawBuilding);
    chars.forEach(c => { c.update(dt); c.draw(ctx); });

    animId = requestAnimationFrame(render);
  }

  function handleClick(e) {
    if (!data) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 680 / rect.width;
    const scaleY = 480 / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;

    const hit = data.buildings.find(b =>
      mx >= b.x && mx <= b.x + b.width &&
      my >= b.y && my <= b.y + b.height
    );
    if (!hit) return;

    paused = true;
    const overlay = document.getElementById('scene-overlay');
    overlay.classList.add('active');

    if (hit.scene === 'home')         HomeScene.init(data);
    else if (hit.scene === 'hq')      HQScene.init(data);
    else if (hit.scene === 'itri')    ITRIScene.init(data);
    else if (hit.scene === 'construction') ConstructionScene.init(hit);
  }

  return {
    init() {
      loadData().then(d => {
        data = d;
        chars = d.characters.map(c => new Character(c));
      });
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('touchend', e => {
        e.preventDefault();
        handleClick(e.changedTouches[0]);
      }, { passive: false });
      animId = requestAnimationFrame(render);
    },
    resume() {
      paused = false;
      lastTime = performance.now();
      animId = requestAnimationFrame(render);
    }
  };
})();
