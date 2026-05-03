// HQ indoor scene — 開放辦公室 + 會議桌 + HY

const HQScene = (() => {

  const PANEL_X=480, PANEL_W=200, SCENE_W=480, H=480, FLOOR_Y=420;

  function rrect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  var bubbles=[];
  function showBubble(text,bx,by,color,border){
    bubbles=bubbles.filter(function(b){ return b.text!==text; });
    bubbles.push({text:text,bx:bx,by:by,timer:3,color:color,border:border});
  }
  function drawBubbles(ctx,dt){
    bubbles=bubbles.filter(function(b){ b.timer-=dt; return b.timer>0; });
    bubbles.forEach(function(b){
      var a=Math.min(1,b.timer/0.4); if(!a) return;
      ctx.save(); ctx.globalAlpha=a;
      ctx.font='11px Courier New';
      var tw=ctx.measureText(b.text).width,pad=10,bh=22,th=8,bw=tw+pad*2;
      var ty=Math.round(b.by-bh-th);
      var tx=Math.max(4,Math.min(SCENE_W-bw-4,Math.round(b.bx-bw/2)));
      var tX=Math.max(tx+8,Math.min(tx+bw-8,Math.round(b.bx)));
      ctx.fillStyle=b.color; rrect(ctx,tx,ty,bw,bh,4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tX-5,ty+bh); ctx.lineTo(tX+5,ty+bh); ctx.lineTo(tX,ty+bh+th); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=b.border; ctx.lineWidth=1; rrect(ctx,tx,ty,bw,bh,4); ctx.stroke();
      ctx.fillStyle='#1a1a2e'; ctx.fillText(b.text,tx+pad,ty+15);
      ctx.restore();
    });
  }

  function drawScene(ctx) {
    // ── full canvas base ──
    ctx.fillStyle = '#090914';
    ctx.fillRect(0, 0, 680, H);

    // ── wall ──
    ctx.fillStyle = '#0e1020';
    ctx.fillRect(0, 0, SCENE_W, FLOOR_Y);

    // ── floor ──
    ctx.fillStyle = '#0b0d1c';
    ctx.fillRect(0, FLOOR_Y, SCENE_W, H-FLOOR_Y);
    ctx.strokeStyle='#080a18'; ctx.lineWidth=1; ctx.beginPath();
    for (var x=0;x<=SCENE_W;x+=20){ ctx.moveTo(x+.5,FLOOR_Y); ctx.lineTo(x+.5,H); }
    for (var y=FLOOR_Y;y<=H;y+=20){ ctx.moveTo(0,y+.5); ctx.lineTo(SCENE_W,y+.5); }
    ctx.stroke();

    // baseboard
    ctx.fillStyle='#151528'; ctx.fillRect(0,FLOOR_Y-5,SCENE_W,5);

    // ── back wall windows (COOL BLUE — clearly visible) ──
    [38, 128, 218, 308].forEach(function(wx){
      ctx.fillStyle='#141830'; ctx.fillRect(wx-3,50,26,60);    // surround
      ctx.fillStyle='#4488cc'; ctx.fillRect(wx,53,20,54);      // blue glass
      ctx.fillStyle='rgba(180,220,255,0.3)'; ctx.fillRect(wx+1,54,8,20); // glint
      ctx.fillStyle='rgba(0,0,20,0.25)';
      ctx.fillRect(wx+9,53,2,54); ctx.fillRect(wx,80,20,2);   // panes
    });
    // rail
    ctx.fillStyle='#1a1a32'; ctx.fillRect(30,48,310,3);

    // ── HQ sign on back wall ──
    ctx.fillStyle='#122030'; ctx.fillRect(348,52,120,36);
    ctx.strokeStyle='#2244aa'; ctx.lineWidth=1;
    ctx.strokeRect(349,53,118,34);
    ctx.fillStyle='#44cc66'; ctx.font='bold 10px Courier New'; ctx.textAlign='center';
    ctx.fillText('HY WORLD HQ',408,66);
    ctx.fillStyle='#226644'; ctx.font='8px Courier New';
    ctx.fillText('總部指揮中心',408,78);
    ctx.textAlign='left';

    // ── whiteboard (left, CLEARLY VISIBLE light grey) ──
    ctx.fillStyle='#1e2240'; ctx.fillRect(4,96,88,118);   // frame
    ctx.fillStyle='#ccd4e8'; ctx.fillRect(8,100,80,110);  // board surface
    // content lines on board (dark blue pen)
    ctx.strokeStyle='#3355aa'; ctx.lineWidth=1;
    [[10,118,74,118],[10,128,58,128],[10,138,66,138],[10,150,44,150],[10,160,62,160]].forEach(function(l){
      ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke();
    });
    ctx.strokeStyle='#cc3333'; ctx.strokeRect(12,168,28,22);
    ctx.strokeStyle='#33aa33';
    ctx.beginPath(); ctx.moveTo(42,179); ctx.lineTo(72,179); ctx.stroke();
    // marker tray
    ctx.fillStyle='#1a1c30'; ctx.fillRect(8,210,80,5);
    ctx.fillStyle='#2a2a44'; ctx.font='7px Courier New';
    ctx.fillText('BOARD',20,224);

    // ── bookshelf (right, COLOURFUL BOOK SPINES) ──
    var bsX=428,bsY=78,bsW=48,bsH=200;
    ctx.fillStyle='#1a1208'; ctx.fillRect(bsX,bsY,bsW,bsH);
    // shelf boards
    ctx.fillStyle='#241a0c'; [44,94,144,194].forEach(function(dy){ ctx.fillRect(bsX,bsY+dy,bsW,4); });
    // books
    var cols=['#cc2222','#2244cc','#22cc44','#cc8822','#8822cc','#cc2288','#44cccc','#cccc22'];
    [0,50,100,150].forEach(function(shelf,si){
      var bkx=bsX+2;
      for(var bi=0;bi<5;bi++){
        var bw2=6+(bi%2)*3;
        ctx.fillStyle=cols[(si*3+bi)%cols.length];
        ctx.fillRect(bkx,bsY+shelf+6,bw2,36);
        ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(bkx,bsY+shelf+6,1,36);
        bkx+=bw2+1;
      }
    });
    ctx.fillStyle='#332210'; ctx.font='7px Courier New';
    ctx.fillText('REFS',bsX+10,bsY+bsH+11);

    // ── work desks (front area, VISIBLE BROWN) ──
    function desk(dx,dy,dw){
      ctx.fillStyle='#3a2818'; ctx.fillRect(dx,dy,dw,22);
      ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(dx,dy,dw,2);
      ctx.strokeStyle='#1c1208'; ctx.lineWidth=1; ctx.strokeRect(dx,dy,dw,22);
      ctx.fillStyle='#1c1208'; ctx.fillRect(dx+5,dy+22,5,14); ctx.fillRect(dx+dw-10,dy+22,5,14);
    }
    function monitor(mx,my){
      ctx.fillStyle='#111122'; ctx.fillRect(mx,my,32,24);
      ctx.fillStyle='#0a1430'; ctx.fillRect(mx+2,my+2,28,18);
      ctx.fillStyle='rgba(40,100,220,0.5)'; ctx.fillRect(mx+3,my+3,26,16);
      ctx.fillStyle='rgba(0,255,128,0.2)';
      for(var i=0;i<4;i++) ctx.fillRect(mx+4,my+5+i*3,16,1);
      ctx.fillStyle='#1a1a2c'; ctx.fillRect(mx+12,my+22,8,5); ctx.fillRect(mx+8,my+27,16,3);
    }
    function chair(chx,chy){
      ctx.fillStyle='#22223a'; ctx.fillRect(chx,chy,22,10); ctx.fillRect(chx+2,chy-10,18,10);
      ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(chx+2,chy-10,18,2);
    }
    desk(28,FLOOR_Y-68,115); monitor(52,FLOOR_Y-96); chair(64,FLOOR_Y-46);
    ctx.fillStyle='#111120'; ctx.fillRect(56,FLOOR_Y-70,42,7);
    desk(226,FLOOR_Y-68,115); monitor(250,FLOOR_Y-96); chair(262,FLOOR_Y-46);
    ctx.fillStyle='#111120'; ctx.fillRect(254,FLOOR_Y-70,42,7);

    // ── conference table (VISIBLE DARK-AMBER, centre) ──
    var ctX=98,ctY=FLOOR_Y-162,ctW=224,ctH=52;
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(ctX+5,ctY+ctH,ctW,8); // shadow
    ctx.fillStyle='#3a2c14'; ctx.fillRect(ctX,ctY,ctW,ctH);               // table
    ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(ctX,ctY,ctW,3);
    ctx.strokeStyle='#221808'; ctx.lineWidth=1; ctx.strokeRect(ctX+.5,ctY+.5,ctW-1,ctH-1);
    ctx.fillStyle='#1c1408'; ctx.fillRect(ctX+8,ctY+ctH,6,12); ctx.fillRect(ctX+ctW-14,ctY+ctH,6,12);
    // nameplate
    ctx.fillStyle='#0e2018'; ctx.fillRect(ctX+ctW/2-32,ctY+ctH/2-8,64,16);
    ctx.strokeStyle='#22aa44'; ctx.lineWidth=1; ctx.strokeRect(ctX+ctW/2-32,ctY+ctH/2-8,64,16);
    ctx.fillStyle='#44cc66'; ctx.font='bold 9px Courier New'; ctx.textAlign='center';
    ctx.fillText('HY',ctX+ctW/2,ctY+ctH/2+4);
    ctx.textAlign='left';
    // paper stacks
    [ctX+18,ctX+164].forEach(function(ix){
      ctx.fillStyle='#ccccb8'; ctx.fillRect(ix,ctY+8,22,16);
      ctx.fillStyle='#aaaaaa';
      for(var li=0;li<3;li++){ ctx.fillRect(ix+2,ctY+11+li*4,16,1); }
    });
    // chairs around table
    [ctX+14,ctX+72,ctX+144,ctX+196].forEach(function(cx){ chair(cx,ctY+ctH+4); });
    // HY chair behind table
    ctx.fillStyle='#2a2a44'; ctx.fillRect(ctX+ctW/2-10,ctY-14,22,10);
    ctx.fillRect(ctX+ctW/2-8,ctY-24,18,10);

    // ── panel divider ──
    ctx.fillStyle='#08081a'; ctx.fillRect(PANEL_X,0,2,H);
  }

  function drawPanel(ctx,frame){
    var px=PANEL_X+2, pw=PANEL_W-2;
    ctx.fillStyle='#060610'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#0c1a10'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#44cc66'; ctx.font='bold 11px Courier New'; ctx.textAlign='center';
    ctx.fillText('🏢 總部 HQ',px+pw/2,16);
    ctx.fillStyle='#226644'; ctx.font='9px Courier New';
    ctx.fillText('HY 的指揮中心',px+pw/2,31);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(68,204,102,0.2)'; ctx.fillRect(px+6,44,pw-12,1);

    var pulse=0.5+0.5*Math.sin(frame*4);
    ctx.fillStyle='rgba(68,204,102,'+(0.25+pulse*0.35)+')';
    ctx.beginPath(); ctx.arc(px+16,62,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#44cc66'; ctx.beginPath(); ctx.arc(px+16,62,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#aaaacc'; ctx.font='9px Courier New'; ctx.fillText('HY · 在線',px+28,66);

    [
      {label:'Claude 跨域建議',col:'#4488ff',y:90,items:['[Task 12 串接 API]','— 讀取中 —']},
      {label:'三 Bot 狀態摘要',col:'#44cc66',y:180,items:['@HY_Host_Bot ···','@HY_MyFamily ···','@ITRI_950157 ···']},
      {label:'今日任務清單',   col:'#ffcc44',y:285,items:['[Task 12 串接 API]','— 讀取中 —']},
    ].forEach(function(s){
      ctx.fillStyle=s.col+'88'; ctx.font='8px Courier New'; ctx.fillText(s.label,px+8,s.y);
      ctx.fillStyle=s.col+'22'; ctx.fillRect(px+8,s.y+5,pw-16,1);
      ctx.fillStyle='#3a3a55'; ctx.font='9px Courier New';
      s.items.forEach(function(item,i){ ctx.fillText(item,px+12,s.y+22+i*16); });
      ctx.fillStyle='#141430';
      ctx.fillRect(px+10,s.y+56,pw-24,5); ctx.fillRect(px+10,s.y+66,pw-40,5);
    });
    ctx.fillStyle='#0a1410'; ctx.fillRect(px,H-34,pw,34);
    ctx.fillStyle='#446655'; ctx.font='8px Courier New'; ctx.textAlign='center';
    ctx.fillText('點擊 HY 對話',px+pw/2,H-16);
    ctx.textAlign='left';
  }

  var LINES=['一切都在計畫中！','需要跨域協調嗎？','今天的任務清單很長...','三個分身都在線！'];
  var hy=null, clickHandler=null;

  return {
    init: function(worldData){
      var cfg = worldData && worldData.characters.find(function(c){ return c.id==='hy'; });
      var ctX=98,ctY=FLOOR_Y-162,ctW=224;
      var cx=ctX+ctW/2, cy=ctY-2;
      hy = cfg ? new Character(cfg) : null;
      if (hy) { CharacterSprites.applyAll({hy:hy}); hy.setState('working'); }
      bubbles=[];
      var canvas=BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler=function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        if (mx>=cx-8&&mx<=cx+8&&my>=cy-28&&my<=cy)
          showBubble(LINES[Math.floor(Math.random()*LINES.length)],cx,cy-32,'#f0fff4','#44cc66');
      };
      canvas.addEventListener('click',clickHandler);
      BaseScene.startLoop(function(ctx,dt){
        drawScene(ctx);
        drawPanel(ctx, hy ? hy.frame : 0);
        if (hy) { hy.frame+=dt; hy.drawAt(ctx,cx,cy,'working'); }
        drawBubbles(ctx,dt);
      });
    },
    cleanup: function(){
      if (clickHandler){ BaseScene.canvas.removeEventListener('click',clickHandler); clickHandler=null; }
      bubbles=[];
    }
  };
})();
