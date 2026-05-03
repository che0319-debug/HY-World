// Home indoor scene — 客廳 + 廚房 + 小因

const HomeScene = (() => {

  const PANEL_X = 480, PANEL_W = 200, SCENE_W = 480, H = 480, FLOOR_Y = 420;

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  var bubbles = [];
  function showBubble(text, bx, by, color, border) {
    bubbles = bubbles.filter(function(b){ return b.text !== text; });
    bubbles.push({text:text, bx:bx, by:by, timer:3, color:color, border:border});
  }
  function drawBubbles(ctx, dt) {
    bubbles = bubbles.filter(function(b){ b.timer -= dt; return b.timer > 0; });
    bubbles.forEach(function(b) {
      var a = Math.min(1, b.timer / 0.4); if (!a) return;
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = '11px Courier New';
      var tw = ctx.measureText(b.text).width, pad=10, bh=22, th=8, bw=tw+pad*2;
      var ty = Math.round(b.by-bh-th);
      var tx = Math.max(4, Math.min(SCENE_W-bw-4, Math.round(b.bx-bw/2)));
      var tX = Math.max(tx+8, Math.min(tx+bw-8, Math.round(b.bx)));
      ctx.fillStyle = b.color; rrect(ctx,tx,ty,bw,bh,4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tX-5,ty+bh); ctx.lineTo(tX+5,ty+bh); ctx.lineTo(tX,ty+bh+th); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = b.border; ctx.lineWidth=1; rrect(ctx,tx,ty,bw,bh,4); ctx.stroke();
      ctx.fillStyle='#1a1a2e'; ctx.fillText(b.text,tx+pad,ty+15);
      ctx.restore();
    });
  }

  function drawScene(ctx) {
    // ── full canvas base ──
    ctx.fillStyle = '#0e0e1e';
    ctx.fillRect(0, 0, 680, H);

    // ── wall ──
    ctx.fillStyle = '#1c1c38';
    ctx.fillRect(0, 0, SCENE_W, FLOOR_Y);

    // ── floor ──
    ctx.fillStyle = '#151528';
    ctx.fillRect(0, FLOOR_Y, SCENE_W, H - FLOOR_Y);
    ctx.strokeStyle = '#111122'; ctx.lineWidth = 1; ctx.beginPath();
    for (var x=0; x<=SCENE_W; x+=20) { ctx.moveTo(x+.5,FLOOR_Y); ctx.lineTo(x+.5,H); }
    for (var y=FLOOR_Y; y<=H; y+=20) { ctx.moveTo(0,y+.5); ctx.lineTo(SCENE_W,y+.5); }
    ctx.stroke();

    // ── baseboard ──
    ctx.fillStyle = '#252548'; ctx.fillRect(0, FLOOR_Y-5, SCENE_W, 5);
    ctx.fillStyle = '#2a2a52'; ctx.fillRect(0, FLOOR_Y-7, SCENE_W, 2);

    // ── lower wall panel ──
    ctx.fillStyle = '#181830'; ctx.fillRect(0, FLOOR_Y-70, SCENE_W, 63);
    ctx.fillStyle = '#222244'; ctx.fillRect(0, FLOOR_Y-72, SCENE_W, 2);

    // ── windows (warm yellow, clearly visible) ──
    function win(wx, wy) {
      ctx.fillStyle = '#282848'; ctx.fillRect(wx-3,wy-3,26,30);    // frame
      ctx.fillStyle = '#ffcc44'; ctx.fillRect(wx,wy,20,24);         // glass
      ctx.fillStyle = 'rgba(255,240,160,0.5)'; ctx.fillRect(wx+2,wy+2,8,4); // glint
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(wx+9,wy,2,24); ctx.fillRect(wx,wy+12,20,2);    // panes
    }
    // curtain rods
    ctx.fillStyle = '#303055';
    ctx.fillRect(22,44,92,3); ctx.fillRect(210,44,92,3);
    win(28,50); win(62,50); win(80,50);
    win(216,50); win(250,50); win(268,50);
    // curtains
    ctx.fillStyle = 'rgba(200,140,170,0.22)';
    ctx.fillRect(22,44,12,70); ctx.fillRect(108,44,8,70);
    ctx.fillRect(210,44,10,70); ctx.fillRect(296,44,8,70);

    // ── sofa (CLEARLY VISIBLE — medium rose-red) ──
    var sx=18, sy=FLOOR_Y-62;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(sx+4,sy+58,148,6); // shadow
    ctx.fillStyle = '#5c2038'; ctx.fillRect(sx,sy,152,20);    // backrest
    ctx.fillStyle = '#4a1830'; ctx.fillRect(sx,sy+20,20,38);  // left arm
    ctx.fillRect(sx+132,sy+20,20,38);                          // right arm
    for (var ci=0; ci<3; ci++) {
      ctx.fillStyle = '#6a2848'; ctx.fillRect(sx+20+ci*38,sy+20,36,36);
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(sx+21+ci*38,sy+21,34,4);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(sx+20+ci*38,sy+52,36,2);
    }
    ctx.fillStyle = '#1e1020';
    ctx.fillRect(sx+5,sy+58,6,10); ctx.fillRect(sx+141,sy+58,6,10);

    // ── coffee table ──
    var ctX=58, ctY=FLOOR_Y-22;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(ctX+4,ctY+14,68,6);
    ctx.fillStyle = '#4a3422'; ctx.fillRect(ctX,ctY,70,14);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(ctX,ctY,70,2);
    ctx.fillStyle = '#2a1c10';
    ctx.fillRect(ctX+5,ctY+14,4,8); ctx.fillRect(ctX+61,ctY+14,4,8);
    // plant
    ctx.fillStyle = '#2a4420'; ctx.fillRect(ctX+52,ctY-14,8,14);
    ctx.fillStyle = '#3aaa2a';
    ctx.beginPath(); ctx.arc(ctX+56,ctY-14,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2a882a';
    ctx.beginPath(); ctx.arc(ctX+53,ctY-10,5,0,Math.PI*2); ctx.fill();

    // ── floor lamp (warm glow) ──
    var lx=182, ly=FLOOR_Y-74;
    ctx.fillStyle = '#38385a'; ctx.fillRect(lx+2,ly,4,68);
    ctx.fillStyle = '#28283a'; ctx.fillRect(lx-2,ly+68,12,6);
    ctx.fillStyle = '#ddaa22'; ctx.fillRect(lx-8,ly-16,22,16);
    ctx.fillStyle = '#bb8810'; ctx.fillRect(lx-8,ly-16,22,3);
    ctx.fillStyle = 'rgba(255,200,80,0.07)';
    ctx.beginPath(); ctx.ellipse(lx+3,ly+8,30,24,0,0,Math.PI*2); ctx.fill();

    // ── TV + cabinet ──
    var tvX=290, tvY=FLOOR_Y-92;
    ctx.fillStyle = '#181828'; ctx.fillRect(tvX,tvY+48,120,44);
    ctx.fillStyle = '#111120';
    ctx.fillRect(tvX+4,tvY+52,52,36); ctx.fillRect(tvX+60,tvY+52,56,36);
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(tvX+26,tvY+68,12,4); ctx.fillRect(tvX+80,tvY+68,12,4);
    ctx.fillStyle = '#0d0d1c'; ctx.fillRect(tvX+8,tvY,104,50);
    ctx.fillStyle = '#1a2844'; ctx.fillRect(tvX+10,tvY+2,100,46);
    ctx.fillStyle = 'rgba(60,100,220,0.45)'; ctx.fillRect(tvX+11,tvY+3,98,44);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var sl=0; sl<22; sl++) ctx.fillRect(tvX+11,tvY+3+sl*2,98,1);
    ctx.fillStyle = '#202030'; ctx.fillRect(tvX+52,tvY+48,16,6);

    // ── kitchen divider ──
    ctx.fillStyle = '#141422'; ctx.fillRect(280,0,8,FLOOR_Y);
    ctx.fillStyle = '#20203a'; ctx.fillRect(280,0,2,FLOOR_Y);

    // ── kitchen ──
    var kx=292;
    // upper cabinets
    ctx.fillStyle = '#1e1e38'; ctx.fillRect(kx,88,SCENE_W-kx-4,88);
    ctx.strokeStyle = '#2c2c50'; ctx.lineWidth=1;
    ctx.strokeRect(kx+4,92,84,80); ctx.strokeRect(kx+90,92,82,80);
    ctx.fillStyle = '#4a4a7a';
    ctx.fillRect(kx+36,130,14,4); ctx.fillRect(kx+118,130,14,4);
    // counter
    var cy2=FLOOR_Y-62;
    ctx.fillStyle = '#2a2218'; ctx.fillRect(kx,cy2,SCENE_W-kx-4,62);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(kx,cy2,SCENE_W-kx-4,3);
    ctx.strokeStyle = '#18140c'; ctx.lineWidth=1;
    ctx.strokeRect(kx+.5,cy2+.5,SCENE_W-kx-5,61);
    // sink
    ctx.fillStyle = '#111128'; ctx.fillRect(kx+8,cy2+8,58,42);
    ctx.fillStyle = '#191930'; ctx.fillRect(kx+10,cy2+10,54,38);
    ctx.strokeStyle = '#22223a'; ctx.strokeRect(kx+8,cy2+8,58,42);
    // faucet
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(kx+32,cy2-12,6,14); ctx.fillRect(kx+22,cy2-12,26,4);
    // stove
    ctx.fillStyle = '#14142a'; ctx.fillRect(kx+74,cy2+6,100,48);
    [[kx+92,cy2+18],[kx+136,cy2+18],[kx+92,cy2+40],[kx+136,cy2+40]].forEach(function(p){
      ctx.fillStyle='#0c0c1e'; ctx.beginPath(); ctx.arc(p[0],p[1],10,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#22223a'; ctx.beginPath(); ctx.arc(p[0],p[1],10,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#1c1c36'; ctx.beginPath(); ctx.arc(p[0],p[1],5,0,Math.PI*2); ctx.fill();
    });

    // ── panel divider ──
    ctx.fillStyle = '#0a0a18'; ctx.fillRect(PANEL_X,0,2,H);
  }

  function drawPanel(ctx, frame) {
    var px=PANEL_X+2, pw=PANEL_W-2;
    ctx.fillStyle='#07071a'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#10102a'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#ff88bb'; ctx.font='bold 11px Courier New'; ctx.textAlign='center';
    ctx.fillText('🏠 Home', px+pw/2, 16);
    ctx.fillStyle='#664455'; ctx.font='9px Courier New';
    ctx.fillText('小因的空間', px+pw/2, 31);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(255,136,187,0.2)'; ctx.fillRect(px+6,44,pw-12,1);

    var dy=62+Math.round(Math.sin(frame*3)*2);
    ctx.fillStyle='rgba(255,136,187,0.25)'; ctx.beginPath(); ctx.arc(px+16,dy,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ff88bb'; ctx.beginPath(); ctx.arc(px+16,dy,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ccaaaa'; ctx.font='9px Courier New'; ctx.fillText('小因 · 在線',px+28,dy+4);

    [
      {label:'近期行程',    col:'#ff88bb',y:88},
      {label:'孩子注意事項',col:'#ffcc88',y:182},
      {label:'家庭備忘',   col:'#88bbff',y:276},
    ].forEach(function(s){
      ctx.fillStyle=s.col+'88'; ctx.font='8px Courier New'; ctx.fillText(s.label,px+8,s.y);
      ctx.fillStyle=s.col+'22'; ctx.fillRect(px+8,s.y+5,pw-16,1);
      ctx.fillStyle='#3a3a55'; ctx.font='9px Courier New'; ctx.fillText('[Task 12 串接 API]',px+10,s.y+22);
      ctx.fillStyle='#252540'; ctx.fillText('— 資料讀取中 —',px+14,s.y+40);
      ctx.fillStyle='#181830';
      ctx.fillRect(px+10,s.y+54,pw-24,5); ctx.fillRect(px+10,s.y+64,pw-38,5); ctx.fillRect(px+10,s.y+74,pw-30,5);
    });
    ctx.fillStyle='#10102a'; ctx.fillRect(px,H-34,pw,34);
    ctx.fillStyle='#445566'; ctx.font='8px Courier New'; ctx.textAlign='center';
    ctx.fillText('點擊小因對話',px+pw/2,H-16);
    ctx.textAlign='left';
  }

  var LINES = ['家裡的事交給我！','有什麼需要安排的嗎？','孩子們今天很乖喔！','今天晚餐想吃什麼？'];
  var xiaoyin=null, clickHandler=null;

  return {
    init: function(worldData) {
      var cfg = worldData && worldData.characters.find(function(c){ return c.id==='xiaoyin'; });
      var cx=148, cy=FLOOR_Y-4;
      xiaoyin = cfg ? new Character(cfg) : null;
      if (xiaoyin) { CharacterSprites.applyAll({xiaoyin:xiaoyin}); xiaoyin.setState('idle'); }
      bubbles=[];
      var canvas=BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler = function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        if (mx>=cx-8&&mx<=cx+8&&my>=cy-28&&my<=cy)
          showBubble(LINES[Math.floor(Math.random()*LINES.length)],cx,cy-32,'#fff0f6','#ff88bb');
      };
      canvas.addEventListener('click',clickHandler);
      BaseScene.startLoop(function(ctx, dt){
        drawScene(ctx);
        drawPanel(ctx, xiaoyin ? xiaoyin.frame : 0);
        if (xiaoyin) { xiaoyin.frame+=dt; xiaoyin.drawAt(ctx,cx,cy,'idle'); }
        drawBubbles(ctx,dt);
      });
    },
    cleanup: function(){
      if (clickHandler){ BaseScene.canvas.removeEventListener('click',clickHandler); clickHandler=null; }
      bubbles=[];
    }
  };
})();
