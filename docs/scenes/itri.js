// ITRI indoor scene — 研究室 + 工作站 + 950157

const ITRIScene = (() => {

  const PANEL_X=480, PANEL_W=200, SCENE_W=480, H=480, FLOOR_Y=420;
  var dashOpen=false, dashFrame=null;

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

  function drawScene(ctx, frame) {
    // ── full canvas base ──
    ctx.fillStyle='#070710';
    ctx.fillRect(0,0,680,H);

    // ── wall (dark industrial blue) ──
    ctx.fillStyle='#0b0d1a';
    ctx.fillRect(0,0,SCENE_W,FLOOR_Y);

    // ── floor with industrial stripe ──
    ctx.fillStyle='#090b18';
    ctx.fillRect(0,FLOOR_Y,SCENE_W,H-FLOOR_Y);
    ctx.strokeStyle='#06080f'; ctx.lineWidth=1; ctx.beginPath();
    for(var x=0;x<=SCENE_W;x+=20){ ctx.moveTo(x+.5,FLOOR_Y); ctx.lineTo(x+.5,H); }
    for(var y=FLOOR_Y;y<=H;y+=20){ ctx.moveTo(0,y+.5); ctx.lineTo(SCENE_W,y+.5); }
    ctx.stroke();
    // yellow safety stripe
    ctx.fillStyle='#554400'; ctx.fillRect(0,FLOOR_Y+2,SCENE_W,4);
    ctx.fillStyle='#887700';
    for(var sx=0;sx<SCENE_W;sx+=20) ctx.fillRect(sx,FLOOR_Y+2,10,4);

    // baseboard
    ctx.fillStyle='#141826'; ctx.fillRect(0,FLOOR_Y-6,SCENE_W,6);

    // ── back wall windows (large industrial, VISIBLE BLUE) ──
    [26,164,302].forEach(function(wx){
      ctx.fillStyle='#0e1428'; ctx.fillRect(wx-4,44,118,84); // surround
      ctx.fillStyle='#0a1830'; ctx.fillRect(wx,48,110,76);   // glass (dark)
      ctx.fillStyle='rgba(60,120,220,0.4)'; ctx.fillRect(wx+1,49,108,74); // blue tint
      // grille bars
      ctx.fillStyle='#141c30';
      ctx.fillRect(wx,72,110,3); ctx.fillRect(wx,96,110,3);
      ctx.fillRect(wx+36,48,3,76); ctx.fillRect(wx+73,48,3,76);
      // reflection
      ctx.fillStyle='rgba(100,160,255,0.1)'; ctx.fillRect(wx+2,50,32,20);
    });
    // header rail
    ctx.fillStyle='#111828'; ctx.fillRect(20,42,420,6);

    // ── instrument rack (LEFT, with VISIBLE coloured LEDs) ──
    var rX=6,rY=134,rW=58,rH=FLOOR_Y-144;
    ctx.fillStyle='#0d0d1e'; ctx.fillRect(rX,rY,rW,rH);
    ctx.strokeStyle='#1c1c30'; ctx.lineWidth=1; ctx.strokeRect(rX+.5,rY+.5,rW-1,rH-1);
    var ledCols=['#44ff44','#ffcc44','#4488ff','#ff4444','#44ff44','#44ffcc','#ffcc44','#44ff44'];
    for(var ru=0;ru<7;ru++){
      var ruY=rY+4+ru*40;
      ctx.fillStyle='#141426'; ctx.fillRect(rX+4,ruY,rW-8,36);
      ctx.strokeStyle='#1e1e32'; ctx.lineWidth=1; ctx.strokeRect(rX+4+.5,ruY+.5,rW-9,35);
      // screws
      ctx.fillStyle='#2a2a44';
      ctx.beginPath(); ctx.arc(rX+9,ruY+6,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(rX+9,ruY+30,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(rX+rW-9,ruY+6,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(rX+rW-9,ruY+30,3,0,Math.PI*2); ctx.fill();
      // LED (blinking for some units)
      var blink=(ru===2||ru===5)&&Math.sin(frame*6+ru)>0;
      var lcol=ledCols[ru%ledCols.length];
      ctx.fillStyle=blink ? lcol : '#111118';
      ctx.beginPath(); ctx.arc(rX+22,ruY+18,4,0,Math.PI*2); ctx.fill();
      if(!blink){ ctx.fillStyle=lcol; ctx.beginPath(); ctx.arc(rX+22,ruY+18,1.5,0,Math.PI*2); ctx.fill(); }
      // port row
      ctx.fillStyle='#0a0a18';
      for(var p=0;p<3;p++) ctx.fillRect(rX+32+p*7,ruY+14,5,8);
    }
    ctx.fillStyle='#222244'; ctx.font='7px Courier New'; ctx.textAlign='center';
    ctx.fillText('RACK',rX+rW/2,rY-5); ctx.textAlign='left';

    // ── server rack (RIGHT, VISIBLE with activity LEDs) ──
    var sX=388,sY=112,sW=84,sH=FLOOR_Y-122;
    ctx.fillStyle='#0a0a1a'; ctx.fillRect(sX,sY,sW,sH);
    ctx.strokeStyle='#181828'; ctx.lineWidth=1; ctx.strokeRect(sX+.5,sY+.5,sW-1,sH-1);
    for(var sb=0;sb<8;sb++){
      var sbY=sY+5+sb*36;
      ctx.fillStyle='#101020'; ctx.fillRect(sX+4,sbY,sW-8,32);
      ctx.strokeStyle='#1a1a2c'; ctx.strokeRect(sX+4+.5,sbY+.5,sW-9,31);
      // drive bays
      for(var bd=0;bd<4;bd++){
        ctx.fillStyle='#080818'; ctx.fillRect(sX+6+bd*17,sbY+6,14,20);
        ctx.strokeStyle='#121220'; ctx.strokeRect(sX+6+bd*17,sbY+6,14,20);
      }
      // activity LED
      var actOn=Math.sin(frame*8+sb*1.7)>0.5;
      ctx.fillStyle=actOn ? '#44ff88' : '#0a1a0a';
      ctx.fillRect(sX+sW-11,sbY+6,5,5);
    }
    ctx.fillStyle='#222244'; ctx.font='7px Courier New'; ctx.textAlign='center';
    ctx.fillText('SERVER',sX+sW/2,sY-5); ctx.textAlign='left';

    // ── main workstation desk (VISIBLE AMBER-BROWN) ──
    var dX=106,dY=FLOOR_Y-64,dW=250;
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(dX+4,dY+22,dW,8); // shadow
    ctx.fillStyle='#3a2c14'; ctx.fillRect(dX,dY,dW,22);
    ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(dX,dY,dW,3);
    ctx.strokeStyle='#1c1408'; ctx.lineWidth=1; ctx.strokeRect(dX+.5,dY+.5,dW-1,21);
    ctx.fillStyle='#1c1408';
    ctx.fillRect(dX+6,dY+22,6,18); ctx.fillRect(dX+dW-12,dY+22,6,18);

    // dual monitors
    function mon(mx,my){
      ctx.fillStyle='#111122'; ctx.fillRect(mx,my,34,26);
      ctx.fillStyle='#0a1428'; ctx.fillRect(mx+2,my+2,30,20);
      ctx.fillStyle='rgba(40,100,220,0.5)'; ctx.fillRect(mx+3,my+3,28,18);
      ctx.fillStyle='rgba(0,255,128,0.25)';
      for(var i=0;i<5;i++) ctx.fillRect(mx+4,my+5+i*3,18,1);
      ctx.fillStyle='#1a1a2c'; ctx.fillRect(mx+13,my+24,8,6); ctx.fillRect(mx+9,my+30,16,3);
    }
    mon(dX+14,dY-38); mon(dX+58,dY-38);
    // large centre monitor
    ctx.fillStyle='#0e0e22'; ctx.fillRect(dX+104,dY-44,54,40);
    ctx.fillStyle='#0a1430'; ctx.fillRect(dX+106,dY-42,50,34);
    ctx.fillStyle='rgba(30,100,200,0.55)'; ctx.fillRect(dX+107,dY-41,48,32);
    ctx.fillStyle='rgba(0,255,100,0.3)';
    for(var ml=0;ml<8;ml++) ctx.fillRect(dX+109,dY-39+ml*4,8+(ml*7)%22,1);
    ctx.fillStyle='#1a1a2c'; ctx.fillRect(dX+126,dY-4,10,6); ctx.fillRect(dX+120,dY+2,22,3);

    // keyboard
    ctx.fillStyle='#0e1020'; ctx.fillRect(dX+102,dY+4,66,9);
    ctx.fillStyle='#161828';
    for(var ki=0;ki<9;ki++) ctx.fillRect(dX+104+ki*7,dY+5,5,7);

    // papers
    ctx.fillStyle='#c8ccb0'; ctx.fillRect(dX+180,dY+2,32,18);
    ctx.fillStyle='#555577';
    for(var li=0;li<3;li++) ctx.fillRect(dX+182,dY+6+li*5,22,1);

    // coffee cup
    ctx.fillStyle='#3c2810'; ctx.fillRect(dX+220,dY+3,14,16);
    ctx.fillStyle='#1a0800'; ctx.fillRect(dX+222,dY+4,10,6);
    ctx.fillStyle='#4a2c10'; ctx.fillRect(dX+234,dY+7,4,8);

    // ── side filing cabinet ──
    ctx.fillStyle='#111122'; ctx.fillRect(70,FLOOR_Y-84,38,84);
    ctx.strokeStyle='#1a1a30'; ctx.lineWidth=1; ctx.strokeRect(70,FLOOR_Y-84,38,84);
    [0,28,56].forEach(function(dy){
      ctx.fillStyle='#0e0e20'; ctx.fillRect(73,FLOOR_Y-82+dy,32,24);
      ctx.fillStyle='#3a3a5a'; ctx.fillRect(83,FLOOR_Y-72+dy,12,4);
    });

    // ── panel divider ──
    ctx.fillStyle='#050510'; ctx.fillRect(PANEL_X,0,2,H);
  }

  var DASH_BTN={x:0,y:0,w:0,h:0};

  function drawPanel(ctx,frame){
    var px=PANEL_X+2, pw=PANEL_W-2;
    ctx.fillStyle='#050510'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#090918'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#4488ff'; ctx.font='bold 11px Courier New'; ctx.textAlign='center';
    ctx.fillText('ITRI 研究室',px+pw/2,16);
    ctx.fillStyle='#224466'; ctx.font='9px Courier New';
    ctx.fillText('950157 工作站',px+pw/2,31);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(68,136,255,0.2)'; ctx.fillRect(px+6,44,pw-12,1);

    var pulse=0.5+0.5*Math.sin(frame*4);
    ctx.fillStyle='rgba(68,136,255,'+(0.2+pulse*0.35)+')';
    ctx.beginPath(); ctx.arc(px+16,62,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#4488ff'; ctx.beginPath(); ctx.arc(px+16,62,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#aaaacc'; ctx.font='9px Courier New'; ctx.fillText('950157 · 在線',px+28,66);

    [
      {label:'專案進度',col:'#4488ff',y:90},
      {label:'待辦任務',col:'#ffcc44',y:183},
      {label:'系統狀態',col:'#44ff88',y:276},
    ].forEach(function(s){
      ctx.fillStyle=s.col+'88'; ctx.font='8px Courier New'; ctx.fillText(s.label,px+8,s.y);
      ctx.fillStyle=s.col+'22'; ctx.fillRect(px+8,s.y+5,pw-16,1);
      ctx.fillStyle='#3a3a55'; ctx.font='9px Courier New'; ctx.fillText('[Task 12 串接 API]',px+10,s.y+22);
      ctx.fillStyle='#252540'; ctx.fillText('— 資料讀取中 —',px+14,s.y+40);
      ctx.fillStyle='#141430';
      ctx.fillRect(px+10,s.y+54,pw-24,5); ctx.fillRect(px+10,s.y+64,pw-40,5); ctx.fillRect(px+10,s.y+74,pw-30,5);
    });

    // dashboard button
    var btnX=px+8, btnY=H-58, btnW=pw-16, btnH=30;
    DASH_BTN.x=PANEL_X+10; DASH_BTN.y=btnY; DASH_BTN.w=btnW; DASH_BTN.h=btnH;
    ctx.fillStyle=dashOpen?'#1a2a44':'#0d1a2e';
    ctx.fillRect(btnX,btnY,btnW,btnH);
    ctx.strokeStyle=dashOpen?'#4488ff':'#22446a'; ctx.lineWidth=1;
    ctx.strokeRect(btnX+.5,btnY+.5,btnW-1,btnH-1);
    ctx.fillStyle=dashOpen?'#88aaff':'#5599ff';
    ctx.font='bold 9px Courier New'; ctx.textAlign='center';
    ctx.fillText(dashOpen?'✕ 關閉 Dashboard':'▶ 展開 Dashboard',px+pw/2,btnY+18);
    ctx.textAlign='left';

    ctx.fillStyle='#08081a'; ctx.fillRect(px,H-22,pw,22);
    ctx.fillStyle='#334455'; ctx.font='8px Courier New'; ctx.textAlign='center';
    ctx.fillText('點擊 950157 對話',px+pw/2,H-8);
    ctx.textAlign='left';
  }

  function openDash(){
    if (dashFrame) return;
    var overlay=document.getElementById('scene-overlay');
    dashFrame=document.createElement('iframe');
    dashFrame.src='https://telegram-bot-t82n.onrender.com/dashboard';
    dashFrame.style.cssText='position:absolute;top:10px;left:10px;width:460px;height:420px;border:2px solid #4488ff;background:#050510;z-index:7';
    overlay.appendChild(dashFrame);
    dashOpen=true;
  }
  function closeDash(){
    if (dashFrame){ dashFrame.parentNode&&dashFrame.parentNode.removeChild(dashFrame); dashFrame=null; }
    dashOpen=false;
  }

  var LINES=['進度一切正常。','正在處理研究任務。','系統運行穩定。','這個功能還在測試中...','研究資料已同步完畢。'];
  var itri=null, clickHandler=null;

  return {
    init: function(worldData){
      var cfg=worldData&&worldData.characters.find(function(c){ return c.id==='itri950'; });
      var dX=106, dY=FLOOR_Y-64, dW=250;
      var cx=dX+dW/2, cy=dY-2;
      itri=cfg?new Character(cfg):null;
      if(itri){ CharacterSprites.applyAll({itri950:itri}); itri.setState('working'); }
      bubbles=[]; dashOpen=false; dashFrame=null;
      var canvas=BaseScene.canvas;
      if(clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler=function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        if(mx>=DASH_BTN.x&&mx<=DASH_BTN.x+DASH_BTN.w&&my>=DASH_BTN.y&&my<=DASH_BTN.y+DASH_BTN.h){
          dashOpen?closeDash():openDash(); return;
        }
        if(mx>=cx-8&&mx<=cx+8&&my>=cy-28&&my<=cy)
          showBubble(LINES[Math.floor(Math.random()*LINES.length)],cx,cy-32,'#f0f4ff','#4488ff');
      };
      canvas.addEventListener('click',clickHandler);
      BaseScene.startLoop(function(ctx,dt){
        drawScene(ctx, itri?itri.frame:0);
        drawPanel(ctx, itri?itri.frame:0);
        if(itri){ itri.frame+=dt; itri.drawAt(ctx,cx,cy,'working'); }
        drawBubbles(ctx,dt);
      });
    },
    cleanup: function(){
      closeDash();
      if(clickHandler){ BaseScene.canvas.removeEventListener('click',clickHandler); clickHandler=null; }
      bubbles=[];
    }
  };
})();
