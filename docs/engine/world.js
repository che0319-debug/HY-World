const World = (() => {
  const canvas = document.getElementById('world-canvas');
  const ctx    = canvas.getContext('2d');
  const W = 680, H = 480;

  let data     = null;
  let chars    = [];
  let lastTime = 0;
  let animId   = null;
  let paused   = false;
  let hoverId       = null;
  let hoveredCharId = null;
  let bubbles       = [];
  let frame         = 0;

  const bVis = {};

  // ── Scene anchors（配合新佈局調整座標）──────────────────────────────
  const SCENE_ANCHORS = {
    home:  { inner: {x: 85,  y: 158}, door: {x: 85,  y: 185}, road: {x: 85,  y: 220} },
    hq:    { inner: {x: 320, y: 150}, door: {x: 320, y: 178}, road: {x: 320, y: 220} },
    itri:  { inner: {x: 570, y: 152}, door: {x: 570, y: 178}, road: {x: 570, y: 220} },
  };

  const CHAR_HOME = { hy: 'hq', xiaoyin: 'home', itri950: 'itri' };

  const DIALOGUES = {
    hy:      ['一切都在計畫中！', '需要跨域協調嗎？', '今天的任務清單很長...'],
    xiaoyin: ['家裡的事交給我！', '有什麼需要安排的嗎？', '孩子們今天很乖喔！'],
    itri950: ['進度一切正常。', '正在處理研究任務。', '系統運行穩定。'],
  };

  function buildPath(fromScene, toScene) {
    const f = SCENE_ANCHORS[fromScene];
    const t = SCENE_ANCHORS[toScene];
    if (!f || !t || fromScene === toScene) return [];
    return [f.door, f.road, t.road, t.door, t.inner];
  }

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

  function mkRand(seed) {
    let s = seed >>> 0;
    return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0x100000000; };
  }

  function rrect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.arcTo(x+w,y,x+w,y+r,r);
    c.lineTo(x+w,y+h-r); c.arcTo(x+w,y+h,x+w-r,y+h,r);
    c.lineTo(x+r,y+h); c.arcTo(x,y+h,x,y+h-r,r);
    c.lineTo(x,y+r); c.arcTo(x,y,x+r,y,r);
    c.closePath();
  }

  function precompute(buildings) {
    buildings.forEach((b, i) => {
      const r = mkRand(i * 997 + 31);
      if (b.status !== 'active') { bVis[b.id] = {}; return; }
      const wins = [];
      const rows = b.winRows || [[16,52,88,124]];
      const yOff = b.winY    || [26, 52];
      rows.forEach(xs => {
        yOff.forEach(dy => {
          wins.push({ x: b.x+xs, y: b.y+dy, w:18, h:14, lit: r()<0.75, warm: r()<0.55 });
        });
      });
      bVis[b.id] = { windows: wins };
    });
  }

  // ── 草地地板 ──────────────────────────────────────────────────────────
  function drawFloor() {
    // 大地底色
    ctx.fillStyle = '#6aaa4a';
    ctx.fillRect(0, 0, W, H);

    // 草地深淺棋盤（40px）
    for (let gx = 0; gx < W; gx += 40) {
      for (let gy = 0; gy < H; gy += 40) {
        if ((Math.floor(gx/40) + Math.floor(gy/40)) % 2 === 0) {
          ctx.fillStyle = '#72b852';
          ctx.fillRect(gx, gy, 40, 40);
        }
      }
    }

    // 草坪修剪條紋（垂直方向）
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let gx = 0; gx < W; gx += 20) ctx.fillRect(gx, 0, 10, H);

    // 左上公園
    ctx.fillStyle = '#5ab044';
    rrect(ctx, 16, 16, 136, 96, 10);
    ctx.fill();
    ctx.fillStyle = '#62bc4c';
    rrect(ctx, 22, 22, 124, 84, 7);
    ctx.fill();

    // 左下公園
    ctx.fillStyle = '#5ab044';
    rrect(ctx, 16, 248, 148, 148, 10);
    ctx.fill();
    ctx.fillStyle = '#64be4e';
    rrect(ctx, 22, 254, 136, 136, 7);
    ctx.fill();

    // 公園石板廣場（左下）
    ctx.fillStyle = '#c8bc96';
    rrect(ctx, 52, 284, 76, 76, 6);
    ctx.fill();
    ctx.fillStyle = '#d4c8a2';
    rrect(ctx, 54, 286, 72, 72, 5);
    ctx.fill();
    // 廣場磚縫
    ctx.strokeStyle = '#bab088';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let tx = 54; tx <= 126; tx += 18) { ctx.moveTo(tx+.5,286); ctx.lineTo(tx+.5,358); }
    for (let ty = 286; ty <= 358; ty += 18) { ctx.moveTo(54,ty+.5); ctx.lineTo(126,ty+.5); }
    ctx.stroke();

    // 噴水池
    ctx.fillStyle = '#3a7ab8';
    ctx.beginPath(); ctx.ellipse(90, 322, 20, 12, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5599cc';
    ctx.beginPath(); ctx.ellipse(90, 322, 14, 8, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#88bbee';
    ctx.beginPath(); ctx.ellipse(90, 322, 6, 4, 0, 0, Math.PI*2); ctx.fill();
    // 噴泉水柱
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(89, 312, 2, 10);
    ctx.fillRect(87, 316, 6, 1);

    // 人行道（主幹道兩側）
    ctx.fillStyle = '#c4b890';
    ctx.fillRect(0, 204, W, 6);   // 上人行道
    ctx.fillRect(0, 238, W, 6);   // 下人行道
    ctx.fillStyle = '#d0c49c';
    ctx.fillRect(0, 204, W, 2);
    ctx.fillStyle = '#a89870';
    ctx.fillRect(0, 242, W, 2);

    // 縱向人行道（左右街道兩側）
    ctx.fillStyle = '#c4b890';
    ctx.fillRect(160, 0, 6, H);
    ctx.fillRect(192, 0, 6, H);
    ctx.fillRect(462, 0, 6, H);
    ctx.fillRect(494, 0, 6, H);
  }

  // ── 道路 ──────────────────────────────────────────────────────────────
  function drawRoads(roads) {
    roads.forEach(r => {
      const isV = r.x1 === r.x2;
      const rx = isV ? r.x1 - r.width/2 : r.x1;
      const ry = isV ? r.y1             : r.y1 - r.width/2;
      const rw = isV ? r.width          : r.x2 - r.x1;
      const rh = isV ? r.y2 - r.y1     : r.width;

      // 瀝青底色
      ctx.fillStyle = '#587080';
      ctx.fillRect(rx, ry, rw, rh);

      // 路面微暗中線區
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      if (isV) ctx.fillRect(rx+rw/4, ry, rw/2, rh);
      else     ctx.fillRect(rx, ry+rh/4, rw, rh/2);

      // 路緣石亮面
      ctx.fillStyle = '#8aa0b0';
      if (isV) { ctx.fillRect(rx,ry,3,rh); ctx.fillRect(rx+rw-3,ry,3,rh); }
      else     { ctx.fillRect(rx,ry,rw,3); ctx.fillRect(rx,ry+rh-3,rw,3); }
      // 路緣石暗面
      ctx.fillStyle = '#48606e';
      if (isV) { ctx.fillRect(rx+1,ry,1,rh); ctx.fillRect(rx+rw-2,ry,1,rh); }
      else     { ctx.fillRect(rx,ry+1,rw,1); ctx.fillRect(rx,ry+rh-2,rw,1); }

      // 中央黃色虛線
      ctx.fillStyle = '#e8c840';
      const mcx = Math.round(rx+rw/2), mcy = Math.round(ry+rh/2);
      if (isV) {
        for (let dy = ry+8; dy < ry+rh-4; dy += 20) ctx.fillRect(mcx-1,dy,2,12);
      } else {
        for (let dx = rx+8; dx < rx+rw-4; dx += 20) ctx.fillRect(dx,mcy-1,12,2);
      }

      // 斑馬線（水平道路，三個建築入口前）
      if (!isV) {
        [85, 320, 570].forEach(zbx => {
          if (zbx < rx || zbx > rx+rw) return;
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          const sh = Math.floor((rh-6)/5);
          for (let zi = 0; zi < 5; zi++)
            ctx.fillRect(zbx-16, ry+3+zi*sh, 32, sh-1);
        });
      }
    });
  }

  // ── 樹木（2.5D 側視圓冠）────────────────────────────────────────────
  function drawTree(x, y, size, seed) {
    const r = mkRand(seed);
    const trunkH = Math.round(size * 0.5);
    const trunkW = Math.max(3, Math.round(size * 0.18));
    const cr     = Math.round(size * 0.6);

    // 樹冠陰影（橢圓，在地面）
    ctx.fillStyle = 'rgba(30,70,10,0.32)';
    ctx.beginPath(); ctx.ellipse(x+3, y+trunkH+cr*0.3, cr*0.9, cr*0.35, 0, 0, Math.PI*2); ctx.fill();

    // 樹幹
    ctx.fillStyle = '#5a3210';
    ctx.fillRect(x - Math.floor(trunkW/2), y, trunkW, trunkH + 4);
    ctx.fillStyle = '#7a4a1a';
    ctx.fillRect(x - Math.floor(trunkW/2), y, 2, trunkH + 4);

    // 樹冠（多個疊加橢圓，有機感）
    const layers = [
      { dx:-cr*0.25, dy:cr*0.3,  rx:cr*0.7, ry:cr*0.55, c:'#2a7018' },
      { dx: cr*0.2,  dy:cr*0.25, rx:cr*0.6, ry:cr*0.5,  c:'#308020' },
      { dx:-cr*0.1,  dy:0,       rx:cr*0.75,ry:cr*0.6,  c:'#38902a' },
      { dx: cr*0.15, dy:-cr*0.1, rx:cr*0.55,ry:cr*0.5,  c:'#42a030' },
      { dx:-cr*0.05, dy:-cr*0.2, rx:cr*0.6, ry:cr*0.5,  c:'#4ab038' },
    ];
    layers.forEach(l => {
      ctx.fillStyle = l.c;
      ctx.beginPath(); ctx.ellipse(x+l.dx, y-cr*0.4+l.dy, l.rx, l.ry, 0, 0, Math.PI*2); ctx.fill();
    });
    // 樹冠高光
    ctx.fillStyle = 'rgba(120,220,60,0.22)';
    ctx.beginPath(); ctx.ellipse(x-cr*0.15, y-cr*0.65, cr*0.3, cr*0.2, -0.3, 0, Math.PI*2); ctx.fill();
  }

  // ── 路燈 ──────────────────────────────────────────────────────────────
  function drawLamp(x, y) {
    // 底座
    ctx.fillStyle = '#6a6458';
    ctx.fillRect(x-3, y-4, 6, 14);
    ctx.fillStyle = '#4a4438';
    ctx.fillRect(x-4, y+8, 8, 4);
    // 燈桿
    ctx.fillStyle = '#8a8278';
    ctx.fillRect(x-1, y-36, 2, 36);
    // 燈頭
    ctx.fillStyle = '#6a6258';
    ctx.fillRect(x-8, y-42, 16, 7);
    ctx.fillStyle = '#7a7268';
    ctx.fillRect(x-8, y-42, 16, 2);
    // 燈泡光暈
    ctx.fillStyle = 'rgba(255,230,120,0.18)';
    ctx.beginPath(); ctx.ellipse(x, y-32, 18, 14, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(x-4, y-40, 8, 3);
  }

  // ── 街道裝飾物 ─────────────────────────────────────────────────────────
  function drawStreetProps() {
    // 路燈（人行道上）
    drawLamp(158, 204);
    drawLamp(158, 242);
    drawLamp(460, 204);
    drawLamp(460, 242);
    drawLamp(492, 204);
    drawLamp(492, 242);

    // 左上公園樹
    drawTree(42,  50,  22, 1);
    drawTree(110, 42,  18, 2);
    drawTree(128, 78,  16, 3);
    drawTree(28,  78,  20, 4);

    // 左下公園樹
    drawTree(36,  270, 20, 5);
    drawTree(140, 262, 18, 6);
    drawTree(32,  350, 22, 7);
    drawTree(144, 356, 16, 8);

    // 公園長椅（左下）
    ctx.fillStyle = '#7a5010';
    ctx.fillRect(58, 345, 22, 7);
    ctx.fillStyle = '#8a6018';
    ctx.fillRect(56, 343, 26, 4);
    ctx.fillStyle = '#5a3a08';
    ctx.fillRect(59, 352, 4, 6); ctx.fillRect(74, 352, 4, 6);

    ctx.fillStyle = '#7a5010';
    ctx.fillRect(100, 345, 22, 7);
    ctx.fillStyle = '#8a6018';
    ctx.fillRect(98, 343, 26, 4);
    ctx.fillStyle = '#5a3a08';
    ctx.fillRect(101, 352, 4, 6); ctx.fillRect(116, 352, 4, 6);

    // 公園小標示牌
    ctx.fillStyle = '#5a8830';
    ctx.fillRect(86, 370, 2, 14);
    ctx.fillStyle = '#4a7020';
    ctx.fillRect(80, 360, 16, 12);
    ctx.fillStyle = '#c8f090';
    ctx.font = '6px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('公園', 88, 369);
    ctx.textAlign = 'left';

    // 右下小廣場植栽
    drawTree(520, 290, 16, 9);
    drawTree(630, 280, 18, 10);

    // 右下廣場石板
    ctx.fillStyle = '#b0a888';
    rrect(ctx, 500, 280, 160, 116, 6); ctx.fill();
    ctx.fillStyle = '#bcb494';
    rrect(ctx, 502, 282, 156, 112, 5); ctx.fill();
    ctx.strokeStyle = '#a89e7c'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let tx = 502; tx <= 658; tx += 20) { ctx.moveTo(tx+.5,282); ctx.lineTo(tx+.5,394); }
    for (let ty = 282; ty <= 394; ty += 20) { ctx.moveTo(502,ty+.5); ctx.lineTo(658,ty+.5); }
    ctx.stroke();

    // 路邊攤（右下）
    ctx.fillStyle = '#c8a830';
    ctx.fillRect(524, 295, 48, 36);
    // 攤棚布幕
    ctx.fillStyle = '#e04828';
    ctx.beginPath();
    ctx.moveTo(520, 295); ctx.lineTo(576, 295);
    ctx.lineTo(572, 282); ctx.lineTo(524, 282);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c03010';
    ctx.fillRect(520, 282, 56, 2);
    // 攤棚柱
    ctx.fillStyle = '#8a4818';
    ctx.fillRect(521, 282, 3, 48); ctx.fillRect(572, 282, 3, 48);
    // 攤上貨物
    ctx.fillStyle = '#f0a830'; ctx.fillRect(528, 300, 12, 8);
    ctx.fillStyle = '#e05030'; ctx.fillRect(544, 298, 10, 10);
    ctx.fillStyle = '#50a040'; ctx.fillRect(558, 300, 12, 8);
    ctx.font = '6px Courier New'; ctx.textAlign = 'center';
    ctx.fillStyle = '#3a1008';
    ctx.fillText('路邊攤', 548, 280);
    ctx.textAlign = 'left';

    // 散落的小花（草地裝飾）
    [[210,80],[250,300],[420,60],[440,400],[350,440]].forEach(([fx,fy]) => {
      ctx.fillStyle = '#f0d040';
      ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI/2;
        ctx.beginPath(); ctx.arc(fx + Math.cos(a)*4, fy + Math.sin(a)*4, 2, 0, Math.PI*2); ctx.fill();
      }
    });
  }

  // ── 2.5D 建築（有側面、屋頂）──────────────────────────────────────────
  function drawActive(b, hovered) {
    const { x, y, width: bw, height: bh, id } = b;
    const SIDE = 10;
    const ROOF = 14;

    // 地面投影
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + SIDE + 4, y + bh + 2, bw, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(x + SIDE + 10, y + bh + 12, bw - 8, 5);

    if (id === 'home') {
      // ════════════════════════════════
      // HOME：台灣透天厝風格
      // ════════════════════════════════

      // 側面（磚紅深色）
      ctx.fillStyle = '#8a3010';
      ctx.beginPath();
      ctx.moveTo(x, y + ROOF + 8);
      ctx.lineTo(x + SIDE, y + ROOF + 8);
      ctx.lineTo(x + SIDE, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.closePath(); ctx.fill();

      // 主牆（米白色，台灣透天常見）
      ctx.fillStyle = '#e8d8c0';
      ctx.fillRect(x + SIDE, y + ROOF + 8, bw, bh - ROOF - 8);
      // 牆面輕微紋路
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      for (let wy = y + ROOF + 16; wy < y + bh; wy += 10)
        ctx.fillRect(x + SIDE, wy, bw, 1);
      // 牆左右陰影
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(x + SIDE, y + ROOF + 8, 5, bh - ROOF - 8);
      ctx.fillRect(x + SIDE + bw - 5, y + ROOF + 8, 5, bh - ROOF - 8);
      // 牆頂高光
      ctx.fillStyle = '#f4e8d0';
      ctx.fillRect(x + SIDE, y + ROOF + 8, bw, 2);

      // 二樓分隔線（腰帶）
      const floor2Y = y + ROOF + 8 + Math.floor((bh - ROOF - 8) * 0.48);
      ctx.fillStyle = '#c8a878';
      ctx.fillRect(x + SIDE, floor2Y, bw, 5);
      ctx.fillStyle = '#e0bc90';
      ctx.fillRect(x + SIDE, floor2Y, bw, 2);

      // 斜屋頂（三角形，瓦片感）
      // 屋頂底座
      ctx.fillStyle = '#6a3820';
      ctx.fillRect(x + SIDE - 4, y + ROOF + 4, bw + 8, 6);
      // 斜屋頂左側面
      ctx.fillStyle = '#4a2010';
      ctx.beginPath();
      ctx.moveTo(x, y + ROOF + 8);
      ctx.lineTo(x + SIDE, y + ROOF + 4);
      ctx.lineTo(x + SIDE, y + ROOF + 10);
      ctx.lineTo(x, y + ROOF + 14);
      ctx.closePath(); ctx.fill();
      // 屋頂正面（深磚紅三角）
      ctx.fillStyle = '#8a3818';
      ctx.beginPath();
      ctx.moveTo(x + SIDE, y + ROOF + 4);
      ctx.lineTo(x + SIDE + bw / 2, y);
      ctx.lineTo(x + SIDE + bw, y + ROOF + 4);
      ctx.closePath(); ctx.fill();
      // 屋頂高光
      ctx.fillStyle = '#aa4a22';
      ctx.beginPath();
      ctx.moveTo(x + SIDE, y + ROOF + 4);
      ctx.lineTo(x + SIDE + bw / 2, y);
      ctx.lineTo(x + SIDE + bw / 2 + 4, y + 3);
      ctx.lineTo(x + SIDE + 6, y + ROOF + 7);
      ctx.closePath(); ctx.fill();
      // 屋脊
      ctx.fillStyle = '#5a2010';
      ctx.fillRect(x + SIDE + bw / 2 - 2, y, 4, ROOF + 4);
      // 煙囪
      ctx.fillStyle = '#5a3820';
      ctx.fillRect(x + SIDE + bw - 24, y - 14, 12, 20);
      ctx.fillStyle = '#6a4828';
      ctx.fillRect(x + SIDE + bw - 26, y - 16, 16, 5);
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(x + SIDE + bw - 24, y - 14, 3, 20);

      // 一樓窗戶（帶窗台花盆）
      const w1y = floor2Y + 10;
      [[x + SIDE + 8, w1y], [x + SIDE + bw - 38, w1y]].forEach(([wx, wy]) => {
        // 窗框
        ctx.fillStyle = '#5a3818';
        ctx.fillRect(wx - 2, wy - 2, 28, 36);
        // 玻璃
        ctx.fillStyle = '#a8c8e8';
        ctx.fillRect(wx, wy, 24, 32);
        // 玻璃反光
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(wx + 1, wy + 1, 10, 14);
        // 格線
        ctx.fillStyle = '#5a3818';
        ctx.fillRect(wx + 11, wy, 2, 32);
        ctx.fillRect(wx, wy + 15, 24, 2);
        // 窗台
        ctx.fillStyle = '#c8a870';
        ctx.fillRect(wx - 3, wy + 32, 30, 5);
        // 花盆
        ctx.fillStyle = '#aa4422';
        ctx.fillRect(wx + 4, wy + 24, 7, 8);
        ctx.fillStyle = '#cc5522';
        ctx.fillRect(wx + 4, wy + 24, 7, 3);
        ctx.fillStyle = '#44aa22';
        ctx.beginPath(); ctx.arc(wx + 8, wy + 22, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#55cc33';
        ctx.beginPath(); ctx.arc(wx + 6, wy + 20, 3, 0, Math.PI * 2); ctx.fill();
      });

      // 二樓窗戶
      const w2y = y + ROOF + 14;
      [[x + SIDE + 10, w2y], [x + SIDE + bw - 36, w2y]].forEach(([wx, wy]) => {
        ctx.fillStyle = '#5a3818';
        ctx.fillRect(wx - 2, wy - 2, 24, 28);
        ctx.fillStyle = '#a8c8e8';
        ctx.fillRect(wx, wy, 20, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(wx + 1, wy + 1, 8, 10);
        ctx.fillStyle = '#5a3818';
        ctx.fillRect(wx + 9, wy, 2, 24);
        ctx.fillRect(wx, wy + 11, 20, 2);
        ctx.fillStyle = '#c8a870';
        ctx.fillRect(wx - 2, wy + 24, 24, 4);
      });

      // 木門
      const dX = x + SIDE + Math.floor((bw - 24) / 2);
      const dY = y + bh - 44;
      ctx.fillStyle = '#3a1808';
      ctx.fillRect(dX - 3, dY - 2, 30, 46);
      ctx.fillStyle = '#6a3818';
      ctx.fillRect(dX, dY, 24, 42);
      ctx.fillStyle = '#7a4828';
      ctx.fillRect(dX + 2, dY + 2, 10, 18);
      ctx.fillRect(dX + 12, dY + 2, 10, 18);
      ctx.fillRect(dX + 2, dY + 22, 20, 18);
      ctx.fillStyle = '#c8a030';
      ctx.fillRect(dX + 18, dY + 19, 4, 6);
      // 門拱
      ctx.fillStyle = '#5a2c10';
      ctx.fillRect(dX - 4, dY - 8, 32, 8);
      ctx.fillStyle = '#7a3c18';
      ctx.fillRect(dX - 4, dY - 8, 32, 3);
      // 門階
      ctx.fillStyle = '#c8b090';
      ctx.fillRect(dX - 6, y + bh - 4, 36, 6);
      ctx.fillStyle = '#d8c0a0';
      ctx.fillRect(dX - 6, y + bh - 4, 36, 2);
      // 門旁花圃
      ctx.fillStyle = '#4a3018';
      ctx.fillRect(x + SIDE + 2, y + bh - 20, 18, 20);
      ctx.fillStyle = '#3a6020';
      ctx.fillRect(x + SIDE + 2, y + bh - 22, 18, 6);
      ctx.fillStyle = '#ee4444';
      ctx.beginPath(); ctx.arc(x + SIDE + 8, y + bh - 24, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff6666';
      ctx.beginPath(); ctx.arc(x + SIDE + 14, y + bh - 26, 3, 0, Math.PI * 2); ctx.fill();

      // 名牌
      ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center';
      const lw = ctx.measureText(b.label).width;
      ctx.fillStyle = '#3a1808';
      ctx.fillRect(x + SIDE + bw / 2 - lw / 2 - 6, y + ROOF + 8, lw + 12, 13);
      ctx.strokeStyle = '#8a4828'; ctx.lineWidth = 1;
      ctx.strokeRect(x + SIDE + bw / 2 - lw / 2 - 5.5, y + ROOF + 8.5, lw + 11, 12);
      ctx.fillStyle = '#f0d090';
      ctx.fillText(b.label, x + SIDE + bw / 2, y + ROOF + 18);
      ctx.font = '8px Courier New'; ctx.fillStyle = '#8a5828';
      ctx.fillText(b.sublabel, x + SIDE + bw / 2, y + bh + 13);
      ctx.textAlign = 'left';

    } else if (id === 'hq') {
      // ════════════════════════════════
      // HQ：現代辦公大樓
      // ════════════════════════════════

      // 側面（深灰玻璃感）
      ctx.fillStyle = '#1a3a2a';
      ctx.beginPath();
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x + SIDE, y + 6);
      ctx.lineTo(x + SIDE, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#224a34';
      ctx.fillRect(x, y + 6, SIDE, 3);

      // 主體（深灰現代感）
      ctx.fillStyle = '#2a3a30';
      ctx.fillRect(x + SIDE, y + 6, bw, bh - 6);

      // 玻璃帷幕條紋（橫向，每層樓）
      const floorH = 28;
      const floors = Math.floor((bh - 30) / floorH);
      for (let fl = 0; fl < floors; fl++) {
        const fy = y + 20 + fl * floorH;
        // 每層玻璃橫條
        ctx.fillStyle = fl % 2 === 0 ? '#1e4a6a' : '#1a3a58';
        ctx.fillRect(x + SIDE + 6, fy, bw - 12, floorH - 4);
        // 玻璃反光
        ctx.fillStyle = 'rgba(100,180,255,0.18)';
        ctx.fillRect(x + SIDE + 6, fy, bw - 12, 6);
        // 玻璃格線（縱）
        ctx.fillStyle = '#2a3a30';
        for (let gx = x + SIDE + 6; gx < x + SIDE + bw - 12; gx += 22)
          ctx.fillRect(gx, fy, 2, floorH - 4);
        // 窗格高光
        ctx.fillStyle = 'rgba(150,220,255,0.08)';
        for (let gx = x + SIDE + 8; gx < x + SIDE + bw - 12; gx += 22)
          ctx.fillRect(gx, fy + 1, 8, 4);
      }

      // 屋頂（平頂，企業感）
      ctx.fillStyle = '#1a2820';
      ctx.fillRect(x + SIDE, y, bw, 8);
      // 屋頂左側梯形
      ctx.fillStyle = '#122018';
      ctx.beginPath();
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x + SIDE, y);
      ctx.lineTo(x + SIDE, y + 8);
      ctx.lineTo(x, y + 14);
      ctx.closePath(); ctx.fill();
      // 屋頂高光線
      ctx.fillStyle = '#3a6a4a';
      ctx.fillRect(x + SIDE, y, bw, 2);
      // 屋頂設備
      ctx.fillStyle = '#141e18';
      ctx.fillRect(x + SIDE + 10, y - 8, 20, 10);
      ctx.fillRect(x + SIDE + bw - 30, y - 6, 18, 8);
      ctx.fillStyle = '#22aa44';
      ctx.fillRect(x + SIDE + 16, y - 10, 4, 4);

      // 大樓外框線（現代感）
      ctx.strokeStyle = '#3a6a4a'; ctx.lineWidth = 1;
      ctx.strokeRect(x + SIDE + .5, y + .5, bw - 1, bh - 1);
      // 左側邊框
      ctx.fillStyle = '#2a4a38';
      ctx.fillRect(x + SIDE, y + 6, 4, bh - 6);
      ctx.fillRect(x + SIDE + bw - 4, y + 6, 4, bh - 6);

      // 玻璃大門（底層中央）
      const dX2 = x + SIDE + Math.floor((bw - 36) / 2);
      const dY2 = y + bh - 50;
      // 門廊頂
      ctx.fillStyle = '#1a3828';
      ctx.fillRect(dX2 - 8, dY2 - 6, 52, 8);
      ctx.fillStyle = '#2a5838';
      ctx.fillRect(dX2 - 8, dY2 - 6, 52, 2);
      // 門框
      ctx.fillStyle = '#1a2820';
      ctx.fillRect(dX2 - 2, dY2, 40, 52);
      // 左右玻璃門
      ctx.fillStyle = '#1e4a6a';
      ctx.fillRect(dX2, dY2 + 2, 17, 48);
      ctx.fillRect(dX2 + 19, dY2 + 2, 17, 48);
      // 玻璃反光
      ctx.fillStyle = 'rgba(100,200,255,0.25)';
      ctx.fillRect(dX2 + 1, dY2 + 2, 6, 22);
      ctx.fillRect(dX2 + 20, dY2 + 2, 6, 22);
      // 門中線
      ctx.fillStyle = '#2a3a30';
      ctx.fillRect(dX2 + 17, dY2 + 2, 2, 48);
      // 門把
      ctx.fillStyle = '#55cc88';
      ctx.fillRect(dX2 + 13, dY2 + 22, 3, 8);
      ctx.fillRect(dX2 + 20, dY2 + 22, 3, 8);
      // 門階（大理石感）
      ctx.fillStyle = '#8ab0a0';
      ctx.fillRect(dX2 - 10, y + bh - 4, 56, 6);
      ctx.fillStyle = '#9ac0b0';
      ctx.fillRect(dX2 - 10, y + bh - 4, 56, 2);
      ctx.fillStyle = '#6a9080';
      ctx.fillRect(dX2 - 14, y + bh, 64, 4);

      // 企業名牌（頂部）
      ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
      const lw2 = ctx.measureText(b.label).width;
      ctx.fillStyle = '#0a1810';
      ctx.fillRect(x + SIDE + bw / 2 - lw2 / 2 - 8, y + 1, lw2 + 16, 14);
      ctx.strokeStyle = '#33cc66'; ctx.lineWidth = 1;
      ctx.strokeRect(x + SIDE + bw / 2 - lw2 / 2 - 7.5, y + 1.5, lw2 + 15, 13);
      ctx.fillStyle = '#44ee88';
      ctx.fillText(b.label, x + SIDE + bw / 2, y + 11);
      ctx.font = '8px Courier New'; ctx.fillStyle = '#2a6a3a';
      ctx.fillText(b.sublabel, x + SIDE + bw / 2, y + bh + 13);
      ctx.textAlign = 'left';

    } else if (id === 'itri') {
      // ════════════════════════════════
      // ITRI：科技研究機構
      // ════════════════════════════════

      // 側面（工業金屬）
      ctx.fillStyle = '#1a2840';
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x + SIDE, y + 8);
      ctx.lineTo(x + SIDE, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.closePath(); ctx.fill();
      // 側面橫條紋（金屬板感）
      ctx.fillStyle = '#243450';
      for (let sy = y + 10; sy < y + bh; sy += 14)
        ctx.fillRect(x, sy, SIDE, 10);

      // 主體（深藍灰金屬感）
      ctx.fillStyle = '#1e2c48';
      ctx.fillRect(x + SIDE, y + 8, bw, bh - 8);
      // 金屬板橫縫
      ctx.fillStyle = '#161e34';
      for (let sy = y + 20; sy < y + bh; sy += 14)
        ctx.fillRect(x + SIDE, sy, bw, 2);
      // 金屬板高光
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let sy = y + 22; sy < y + bh; sy += 14)
        ctx.fillRect(x + SIDE, sy, bw, 3);

      // 左右邊框（金屬柱）
      ctx.fillStyle = '#2a3c5c';
      ctx.fillRect(x + SIDE, y + 8, 6, bh - 8);
      ctx.fillRect(x + SIDE + bw - 6, y + 8, 6, bh - 8);
      ctx.fillStyle = '#3a5070';
      ctx.fillRect(x + SIDE, y + 8, 2, bh - 8);
      ctx.fillRect(x + SIDE + bw - 2, y + 8, 2, bh - 8);

      // 工業窗格（三排）
      const winRows = [
        { y: y + 22, h: 20, count: 3 },
        { y: y + 60, h: 20, count: 3 },
        { y: y + 98, h: 20, count: 3 },
      ];
      winRows.forEach(row => {
        if (row.y + row.h > y + bh - 50) return;
        const gap = Math.floor((bw - 16) / row.count);
        for (let wi = 0; wi < row.count; wi++) {
          const wx = x + SIDE + 8 + wi * gap;
          // 窗框（金屬）
          ctx.fillStyle = '#0c1428';
          ctx.fillRect(wx - 2, row.y - 2, gap - 6, row.h + 4);
          // 玻璃
          ctx.fillStyle = '#1a3466';
          ctx.fillRect(wx, row.y, gap - 10, row.h);
          // 反光
          ctx.fillStyle = 'rgba(80,140,255,0.3)';
          ctx.fillRect(wx + 1, row.y + 1, Math.floor((gap - 10) / 2), 6);
          // 格柵
          ctx.fillStyle = '#0c1428';
          ctx.fillRect(wx + Math.floor((gap - 10) / 2) - 1, row.y, 2, row.h);
          ctx.fillRect(wx, row.y + Math.floor(row.h / 2) - 1, gap - 10, 2);
          // LED 指示燈
          const ledOn = Math.sin(Date.now() * 0.003 + wi * 1.3) > 0;
          ctx.fillStyle = ledOn ? '#44ff88' : '#0a2a14';
          ctx.beginPath(); ctx.arc(wx + gap - 14, row.y + 4, 3, 0, Math.PI * 2); ctx.fill();
        }
      });

      // 屋頂（平頂科技感）
      ctx.fillStyle = '#141e30';
      ctx.fillRect(x + SIDE, y, bw, 10);
      // 屋頂左梯形
      ctx.fillStyle = '#0e1828';
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x + SIDE, y);
      ctx.lineTo(x + SIDE, y + 10);
      ctx.lineTo(x, y + 18);
      ctx.closePath(); ctx.fill();
      // 屋頂高光
      ctx.fillStyle = '#2a4060';
      ctx.fillRect(x + SIDE, y, bw, 2);
      // 屋頂天線
      ctx.fillStyle = '#8899aa';
      ctx.fillRect(x + SIDE + bw - 18, y - 20, 2, 22);
      ctx.fillRect(x + SIDE + bw - 24, y - 17, 14, 2);
      ctx.fillStyle = '#44ff88';
      ctx.beginPath(); ctx.arc(x + SIDE + bw - 17, y - 20, 3, 0, Math.PI * 2); ctx.fill();
      // 散熱管（側邊）
      ctx.fillStyle = '#243040';
      ctx.fillRect(x + SIDE + bw - 8, y + 20, 8, 40);
      ctx.fillStyle = '#1a2030';
      for (let pi = 0; pi < 6; pi++)
        ctx.fillRect(x + SIDE + bw - 7, y + 24 + pi * 7, 6, 4);
      ctx.fillStyle = '#3a5060';
      ctx.fillRect(x + SIDE + bw - 8, y + 20, 2, 40);

      // 工業大門（金屬捲門感）
      const dX3 = x + SIDE + Math.floor((bw - 32) / 2);
      const dY3 = y + bh - 52;
      // 門框
      ctx.fillStyle = '#0c1428';
      ctx.fillRect(dX3 - 4, dY3 - 4, 40, 56);
      // 捲門板條
      for (let di = 0; di < 8; di++) {
        ctx.fillStyle = di % 2 === 0 ? '#1e3050' : '#182840';
        ctx.fillRect(dX3, dY3 + di * 6, 32, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(dX3, dY3 + di * 6, 32, 1);
      }
      // 門下半（玻璃小窗）
      ctx.fillStyle = '#1a3466';
      ctx.fillRect(dX3 + 4, dY3 + 50, 24, 16);
      ctx.fillStyle = 'rgba(80,140,255,0.25)';
      ctx.fillRect(dX3 + 5, dY3 + 51, 10, 7);
      // 門把（工業感）
      ctx.fillStyle = '#5599cc';
      ctx.fillRect(dX3 + 14, dY3 + 54, 4, 8);
      // 警示條紋
      ctx.fillStyle = '#ccaa00';
      ctx.fillRect(dX3 - 4, dY3 - 4, 40, 5);
      ctx.fillStyle = '#000000';
      for (let si = 0; si < 8; si++)
        ctx.fillRect(dX3 - 4 + si * 5, dY3 - 4, 3, 5);
      // 門階（金屬格板）
      ctx.fillStyle = '#2a3a50';
      ctx.fillRect(dX3 - 8, y + bh - 4, 48, 6);
      ctx.fillStyle = '#3a4a60';
      for (let gi = 0; gi < 6; gi++)
        ctx.fillRect(dX3 - 6 + gi * 8, y + bh - 3, 6, 4);

      // 名牌（發光感）
      ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
      const lw3 = ctx.measureText(b.label).width;
      ctx.fillStyle = '#040c1e';
      ctx.fillRect(x + SIDE + bw / 2 - lw3 / 2 - 8, y + 1, lw3 + 16, 14);
      ctx.strokeStyle = '#3366cc'; ctx.lineWidth = 1;
      ctx.strokeRect(x + SIDE + bw / 2 - lw3 / 2 - 7.5, y + 1.5, lw3 + 15, 13);
      ctx.fillStyle = 'rgba(80,140,255,0.15)';
      ctx.fillRect(x + SIDE + bw / 2 - lw3 / 2 - 7, y + 2, lw3 + 14, 12);
      ctx.fillStyle = '#5599ff';
      ctx.fillText(b.label, x + SIDE + bw / 2, y + 11);
      ctx.font = '8px Courier New'; ctx.fillStyle = '#2a4a7a';
      ctx.fillText(b.sublabel, x + SIDE + bw / 2, y + bh + 13);
      ctx.textAlign = 'left';

    } else if (id === 'sam') {
      // ════════════════════════════════
      // Sam：副業作戰中心（商業大樓）
      // ════════════════════════════════

      // 側面（深灰）
      ctx.fillStyle = '#1c1c2a';
      ctx.beginPath();
      ctx.moveTo(x, y + 8); ctx.lineTo(x + SIDE, y + 8);
      ctx.lineTo(x + SIDE, y + bh); ctx.lineTo(x, y + bh);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#262636';
      for (let sy = y + 12; sy < y + bh; sy += 12)
        ctx.fillRect(x, sy, SIDE, 8);

      // 主體（深灰外牆）
      ctx.fillStyle = '#2e2e40';
      ctx.fillRect(x + SIDE, y + 8, bw, bh - 8);
      ctx.fillStyle = '#242434';
      for (let sy = y + 20; sy < y + bh; sy += 12)
        ctx.fillRect(x + SIDE, sy, bw, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x + SIDE, y + 8, bw, 3);

      // 左右邊框（暗柱）
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(x + SIDE, y + 8, 5, bh - 8);
      ctx.fillRect(x + SIDE + bw - 5, y + 8, 5, bh - 8);
      ctx.fillStyle = '#3e3e52';
      ctx.fillRect(x + SIDE, y + 8, 2, bh - 8);
      ctx.fillRect(x + SIDE + bw - 2, y + 8, 2, bh - 8);

      // 暖色系窗戶（3 cols × 3 rows）
      const sWinGap = Math.floor((bw - 16) / 3);
      [[y + 22, 16], [y + 54, 16], [y + 86, 16]].forEach(([wy, wh]) => {
        if (wy + wh > y + bh - 44) return;
        for (let wi = 0; wi < 3; wi++) {
          const wx = x + SIDE + 8 + wi * sWinGap;
          ctx.fillStyle = '#14141e';
          ctx.fillRect(wx - 2, wy - 2, sWinGap - 8, wh + 4);
          const warmOn = Math.sin(Date.now() * 0.0018 + wi * 1.2 + wy * 0.015) > -0.4;
          ctx.fillStyle = warmOn ? '#cc6e1a' : '#2e1c0a';
          ctx.fillRect(wx, wy, sWinGap - 12, wh);
          if (warmOn) {
            ctx.fillStyle = 'rgba(255,160,60,0.22)';
            ctx.fillRect(wx - 1, wy - 1, sWinGap - 10, wh + 2);
            ctx.fillStyle = 'rgba(255,220,120,0.35)';
            ctx.fillRect(wx + 1, wy + 1, Math.floor((sWinGap - 12) / 2), 5);
          }
          ctx.fillStyle = '#14141e';
          ctx.fillRect(wx + Math.floor((sWinGap - 12) / 2) - 1, wy, 2, wh);
          ctx.fillRect(wx, wy + Math.floor(wh / 2) - 1, sWinGap - 12, 1);
        }
      });

      // 屋頂（平頂）
      ctx.fillStyle = '#18182a';
      ctx.fillRect(x + SIDE, y, bw, 10);
      ctx.fillStyle = '#10101e';
      ctx.beginPath();
      ctx.moveTo(x, y + 8); ctx.lineTo(x + SIDE, y);
      ctx.lineTo(x + SIDE, y + 10); ctx.lineTo(x, y + 18);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3c3c54';
      ctx.fillRect(x + SIDE, y, bw, 2);

      // 屋頂霓虹招牌「SAM」
      const sbcx = x + SIDE + Math.floor(bw / 2);
      ctx.fillStyle = '#0a0a18';
      ctx.fillRect(sbcx - 26, y - 12, 52, 13);
      ctx.strokeStyle = '#ff8822'; ctx.lineWidth = 1;
      ctx.strokeRect(sbcx - 25.5, y - 11.5, 51, 12);
      ctx.fillStyle = 'rgba(255,136,34,0.18)';
      ctx.fillRect(sbcx - 25, y - 11, 50, 11);
      ctx.fillStyle = '#ffaa44';
      ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('SAM', sbcx, y - 2);

      // 商業大門
      const dX4 = x + SIDE + Math.floor((bw - 28) / 2);
      const dY4 = y + bh - 44;
      ctx.fillStyle = '#10101e';
      ctx.fillRect(dX4 - 2, dY4 - 2, 32, 46);
      ctx.fillStyle = '#1e1428';
      ctx.fillRect(dX4, dY4, 28, 42);
      ctx.fillStyle = '#8a4a18';
      ctx.fillRect(dX4 + 1, dY4 + 1, 12, 40);
      ctx.fillRect(dX4 + 15, dY4 + 1, 12, 40);
      ctx.fillStyle = 'rgba(255,180,80,0.18)';
      ctx.fillRect(dX4 + 2, dY4 + 2, 5, 18);
      ctx.fillRect(dX4 + 16, dY4 + 2, 5, 18);
      ctx.fillStyle = '#10101e';
      ctx.fillRect(dX4 + 13, dY4, 2, 42);
      ctx.fillStyle = '#cc8844';
      ctx.fillRect(dX4 + 8, dY4 + 18, 3, 8);
      ctx.fillRect(dX4 + 17, dY4 + 18, 3, 8);
      ctx.fillStyle = '#2e2e44';
      ctx.fillRect(dX4 - 6, y + bh - 4, 40, 6);
      ctx.fillStyle = '#3e3e56';
      ctx.fillRect(dX4 - 6, y + bh - 4, 40, 2);
      // 門廊暖燈
      ctx.fillStyle = '#ffaa44';
      ctx.beginPath(); ctx.arc(dX4 + 14, dY4 - 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,170,68,0.28)';
      ctx.beginPath(); ctx.arc(dX4 + 14, dY4 - 5, 8, 0, Math.PI * 2); ctx.fill();

      // 名牌
      ctx.font = '8px Courier New'; ctx.fillStyle = '#aa6633';
      ctx.textAlign = 'center';
      ctx.fillText(b.sublabel, x + SIDE + bw / 2, y + bh + 13);
      ctx.textAlign = 'left';

    } else {
      // ════════════════════════════════
      // 預設建築（其他 id）
      // ════════════════════════════════
      ctx.fillStyle = '#607080';
      ctx.beginPath();
      ctx.moveTo(x, y + ROOF); ctx.lineTo(x + SIDE, y + ROOF);
      ctx.lineTo(x + SIDE, y + bh); ctx.lineTo(x, y + bh);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7888a0';
      ctx.fillRect(x + SIDE, y + ROOF, bw, bh - ROOF);
      ctx.fillStyle = '#566878';
      ctx.beginPath();
      ctx.moveTo(x, y + ROOF); ctx.lineTo(x + SIDE, y);
      ctx.lineTo(x + SIDE + bw, y); ctx.lineTo(x + SIDE + bw, y + ROOF);
      ctx.closePath(); ctx.fill();
      ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.label, x + SIDE + bw / 2, y + bh / 2);
      ctx.textAlign = 'left';
    }

    // ── 狀態燈（所有建築共用）──
    const lx = x + SIDE + bw - 9, ly = y + 8;
    ctx.fillStyle = b.statusColor + '40';
    ctx.beginPath(); ctx.arc(lx, ly, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.statusColor + 'bb';
    ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.statusColor;
    ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(lx - 1, ly - 1, 1.5, 0, Math.PI * 2); ctx.fill();

    // ── Hover 高光（所有建築共用）──
    if (hovered) {
      ctx.save();
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2.5;
      ctx.strokeRect(x - 1, y - 1, bw + SIDE + 2, bh + 2);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 5;
      ctx.strokeRect(x - 3, y - 3, bw + SIDE + 6, bh + 6);
    }
  }

  // ── 建設中建築 ──────────────────────────────────────────────────────
  function drawConstruction(b, hovered) {
    const { x, y, width: bw, height: bh } = b;
    const SIDE = 8;

    // 投影
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x+SIDE+3, y+bh+2, bw, 8);

    // 側面
    ctx.fillStyle = '#8a7840';
    ctx.beginPath();
    ctx.moveTo(x, y+10); ctx.lineTo(x+SIDE, y+10);
    ctx.lineTo(x+SIDE, y+bh); ctx.lineTo(x, y+bh);
    ctx.closePath(); ctx.fill();

    // 主體（沙黃，未完成）
    ctx.fillStyle = '#c0a868';
    ctx.fillRect(x+SIDE, y+10, bw, bh-10);
    ctx.fillStyle = '#a88e50';
    ctx.fillRect(x+SIDE, y+10, bw, 2);
    // 磚紋
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let by2 = y+18; by2 < y+bh; by2 += 8) ctx.fillRect(x+SIDE, by2, bw, 1);

    // 屋頂（梯形，未完成感）
    ctx.fillStyle = '#a89050';
    ctx.beginPath();
    ctx.moveTo(x, y+10); ctx.lineTo(x+SIDE, y+3);
    ctx.lineTo(x+SIDE+bw, y+3); ctx.lineTo(x+SIDE+bw, y+10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a7438'; ctx.lineWidth=1;
    ctx.strokeRect(x+SIDE+.5, y+10.5, bw-1, bh-10);

    // 鷹架縱桿
    ctx.fillStyle = '#909088';
    [0,40,80,120,160].filter(px=>px<=bw+2).forEach(px => {
      ctx.fillRect(x+SIDE+px-2, y-10, 4, bh+20);
    });
    // 鷹架橫樑
    ctx.fillStyle = '#b0b0a8';
    [0,32,64,96].forEach(dy => {
      if (dy < bh+10) { ctx.fillRect(x+SIDE-2, y+dy, bw+4, 5);
      ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.fillRect(x+SIDE-2,y+dy,bw+4,1);
      ctx.fillStyle='#b0b0a8'; }
    });
    // 踏板
    ctx.fillStyle = '#8a6838';
    [32,64].filter(d=>d<bh).forEach(dy => {
      for (let col=0; col<4; col++) {
        if (col*40 < bw) { ctx.fillRect(x+SIDE+col*40+2, y+dy+1, Math.min(36,bw-col*40-2), 3);
        ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(x+SIDE+col*40+2,y+dy+3,Math.min(36,bw-col*40-2),1);
        ctx.fillStyle='#8a6838'; }
      }
    });
    // X 型斜撐
    ctx.strokeStyle='#909088'; ctx.lineWidth=1.5;
    for(let i=0;i<4;i++){
      if(i*40>=bw) break;
      const px1=x+SIDE+i*40, px2=Math.min(x+SIDE+(i+1)*40, x+SIDE+bw);
      [0,32,64].filter(d=>d+32<bh).forEach(dy=>{
        ctx.beginPath(); ctx.moveTo(px1,y+dy+5); ctx.lineTo(px2,y+dy+32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px2,y+dy+5); ctx.lineTo(px1,y+dy+32); ctx.stroke();
      });
    }
    // 建設中牌
    const sbW=90, sbH=28, sbX=x+SIDE+Math.round((bw-sbW)/2), sbY=y+Math.round(bh/2)-14;
    for(let si=0;si<Math.ceil(sbW/10);si++){
      ctx.fillStyle=si%2===0?'#ee8800':'#ffffff';
      const sw=Math.min(10,sbW-si*10);
      ctx.fillRect(sbX+si*10,sbY,sw,5); ctx.fillRect(sbX+si*10,sbY+sbH-5,sw,5);
    }
    ctx.fillStyle='#f0e8c0'; ctx.fillRect(sbX,sbY+5,sbW,sbH-10);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(sbX,sbY+5,sbW,2);
    ctx.font='bold 10px Courier New'; ctx.textAlign='center';
    ctx.fillStyle='#b85800';
    ctx.fillText('建設中', x+SIDE+bw/2, sbY+5+(sbH-10)/2+4);
    ctx.font='8px Courier New'; ctx.fillStyle='#664422';
    ctx.fillText(b.label, x+SIDE+bw/2, y-5);
    ctx.textAlign='left';

    ctx.fillStyle='#c8c0a8';
    ctx.beginPath(); ctx.arc(x+SIDE+bw-8,y+6,4,0,Math.PI*2); ctx.fill();

    if (hovered) {
      ctx.save(); ctx.shadowColor='#f0c060'; ctx.shadowBlur=10;
      ctx.strokeStyle='#f0c060'; ctx.lineWidth=2;
      ctx.strokeRect(x-2,y-2,bw+SIDE+4,bh+4);
      ctx.restore();
    }
  }

  // ── 對話泡泡 ──────────────────────────────────────────────────────────
  function showBubble(text, bx, by, color='#f4f4ff', borderColor='#c0c0cc', duration=2.6) {
    bubbles = bubbles.filter(b => b.text !== text);
    bubbles.push({ text, bx, by, timer: duration, maxTimer: duration, color, borderColor });
  }

  function _drawOneBubble(b) {
    const alpha = Math.min(1, b.timer/0.4);
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.font = '12px Courier New';
    const tw=ctx.measureText(b.text).width, pad=10, bh=22, tailH=8;
    const bw=tw+pad*2;
    const ty=Math.round(b.by-bh-tailH);
    const tx=Math.max(4,Math.min(W-bw-4,Math.round(b.bx-bw/2)));
    const tailX=Math.max(tx+8,Math.min(tx+bw-8,Math.round(b.bx)));
    ctx.fillStyle=b.color; rrect(ctx,tx,ty,bw,bh,4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tailX-5,ty+bh); ctx.lineTo(tailX+5,ty+bh); ctx.lineTo(tailX,ty+bh+tailH); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=b.borderColor; ctx.lineWidth=1; rrect(ctx,tx,ty,bw,bh,4); ctx.stroke();
    ctx.fillStyle='#1a1a2e'; ctx.fillText(b.text,tx+pad,ty+15);
    ctx.restore();
  }

  function drawBubbles() { bubbles.forEach(_drawOneBubble); }

  // ── Render loop ────────────────────────────────────────────────────────
  function render(ts) {
    if (paused) return;
    const dt = Math.min((ts-lastTime)/1000, 0.1);
    lastTime = ts;
    frame += dt;

    bubbles = bubbles.filter(b => { b.timer -= dt; return b.timer > 0; });

    ctx.clearRect(0, 0, W, H);
    drawFloor();

    if (!data) { animId = requestAnimationFrame(render); return; }

    drawRoads(data.roads);
    drawStreetProps();

    data.buildings.forEach(b => {
      if (b.status === 'active') drawActive(b, b.id === hoverId);
      else                       drawConstruction(b, b.id === hoverId);
    });

    if (hoveredCharId) {
      const hc = chars.find(c => c.id === hoveredCharId);
      if (hc) {
        ctx.save();
        ctx.fillStyle   = hc.color + '28';
        ctx.shadowColor = hc.color;
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.ellipse(Math.round(hc.x), Math.round(hc.y-13), 13, 17, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }

    chars.forEach(c => { c.update(dt); c.draw(ctx); });
    drawBubbles();

    animId = requestAnimationFrame(render);
  }

  // ── Scene transition ───────────────────────────────────────────────────
  let activeScene = null;

  function enterScene(sceneObj, initFn) {
    paused = true;
    hoverId = null; hoveredCharId = null;
    canvas.style.cursor = 'default';
    activeScene = sceneObj;
    initFn();
    const overlay = document.getElementById('scene-overlay');
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('active')));
  }

  // ── Events ────────────────────────────────────────────────────────────
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX-rect.left)*(W/rect.width),
      y: (e.clientY-rect.top) *(H/rect.height)
    };
  }

  function buildingAt(mx, my) {
    if (!data) return null;
    return data.buildings.find(b =>
      mx >= b.x && mx <= b.x+b.width+10 &&
      my >= b.y && my <= b.y+b.height
    ) || null;
  }

  function charAt(mx, my) {
    const hw=8, hh=28;
    return chars.find(c =>
      mx >= c.x-hw && mx <= c.x+hw &&
      my >= c.y-hh && my <= c.y
    ) || null;
  }

  function onMouseMove(e) {
    const {x,y} = canvasPos(e);
    const hc = charAt(x,y);
    hoveredCharId = hc ? hc.id : null;
    const hb = hc ? null : buildingAt(x,y);
    hoverId = hb ? hb.id : null;
    canvas.style.cursor = (hc||hb) ? 'pointer' : 'default';
  }

  function onClick(e) {
    const {x,y} = canvasPos(e);
    const hc = charAt(x,y);
    if (hc) {
      const lines = DIALOGUES[hc.id] || ['...'];
      showBubble(lines[Math.floor(Math.random()*lines.length)], hc.x, hc.y-32, '#f6f6ff', hc.color, 3.2);
      return;
    }
    const hit = buildingAt(x,y);
    if (!hit) { triggerWalkTest(); return; }
    if (hit.status === 'construction') {
      showBubble('這裡還在規劃中...', hit.x+hit.width/2, hit.y, '#fff8ee', '#cc8800');
      return;
    }
    if      (hit.scene==='home') enterScene(HomeScene, ()=>HomeScene.init(data));
    else if (hit.scene==='hq')   enterScene(HQScene,   ()=>HQScene.init(data));
    else if (hit.scene==='itri') enterScene(ITRIScene, ()=>ITRIScene.init(data));
    else if (hit.scene==='sam')  SamModal.open();
  }

  // ── Public API ─────────────────────────────────────────────────────────
  return {
    init() {
      fetch('data/world.json')
        .then(r => r.json())
        .then(d => {
          data  = d;
          chars = d.characters.map(c => { const ch=new Character(c); ch.setState('idle'); return ch; });
          precompute(d.buildings);
          const charMap = {};
          chars.forEach(c => { charMap[c.id]=c; });
          CharacterSprites.applyAll(charMap);
        });
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('click', onClick);
      canvas.addEventListener('touchend', e => { e.preventDefault(); onClick(e.changedTouches[0]); }, {passive:false});
      lastTime = performance.now();
      animId   = requestAnimationFrame(render);
    },

    resume() {
      const overlay = document.getElementById('scene-overlay');
      overlay.classList.remove('active');
      if (activeScene && typeof activeScene.cleanup==='function') activeScene.cleanup();
      activeScene = null;
      BaseScene.stopLoop();
      setTimeout(() => {
        paused=false; lastTime=performance.now();
        animId=requestAnimationFrame(render);
      }, 260);
    },

    triggerMorning() { assembled=false; triggerWalkTest(); },

    walkCharTo(id, scene) {
      const c = chars.find(c=>c.id===id);
      if (!c) return console.warn('Unknown character:', id);
      const path = buildPath(c.scene, scene);
      if (!path.length) return console.warn('No path:', c.scene,'→',scene);
      c.walkAlong(path, scene);
    }
  };
})();
