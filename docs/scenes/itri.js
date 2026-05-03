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
    ctx.fillStyle='#08081a';
    ctx.fillRect(0,0,680,H);

    // ── wall (industrial medium navy — bright research lab feel) ──
    ctx.fillStyle='#283055';
    ctx.fillRect(0,0,SCENE_W,FLOOR_Y);

    // ── floor with industrial stripe ──
    ctx.fillStyle='#485040';
    ctx.fillRect(0,FLOOR_Y,SCENE_W,H-FLOOR_Y);
    ctx.strokeStyle='#384030'; ctx.lineWidth=1; ctx.beginPath();
    for(var x=0;x<=SCENE_W;x+=20){ ctx.moveTo(x+.5,FLOOR_Y); ctx.lineTo(x+.5,H); }
    for(var y=FLOOR_Y;y<=H;y+=20){ ctx.moveTo(0,y+.5); ctx.lineTo(SCENE_W,y+.5); }
    ctx.stroke();
    // BRIGHT yellow safety stripe
    ctx.fillStyle='#886600'; ctx.fillRect(0,FLOOR_Y+1,SCENE_W,6);
    ctx.fillStyle='#ccaa00'; // bright yellow segments
    for(var sx=0;sx<SCENE_W;sx+=22) ctx.fillRect(sx,FLOOR_Y+1,12,6);

    // baseboard
    ctx.fillStyle='#202838'; ctx.fillRect(0,FLOOR_Y-7,SCENE_W,7);

    // ── back wall windows (BRIGHT BLUE industrial) ──
    [22,158,296].forEach(function(wx){
      ctx.fillStyle='#182040'; ctx.fillRect(wx-5,40,124,92); // surround
      ctx.fillStyle='#1a2c4e'; ctx.fillRect(wx,44,114,82);   // frame inner
      ctx.fillStyle='#3366cc'; ctx.fillRect(wx+2,46,110,78); // BLUE glass
      ctx.fillStyle='rgba(100,160,255,0.3)'; ctx.fillRect(wx+3,47,36,24); // reflection
      // grille bars
      ctx.fillStyle='#202e4a';
      ctx.fillRect(wx,70,114,3); ctx.fillRect(wx,94,114,3);
      ctx.fillRect(wx+38,46,3,78); ctx.fillRect(wx+76,46,3,78);
    });
    // header rail
    ctx.fillStyle='#1a2238'; ctx.fillRect(16,38,430,7);

    // ── instrument rack (LEFT — clearly visible dark unit with BRIGHT LEDs) ──
    var rX=6,rY=138,rW=60,rH=FLOOR_Y-148;
    ctx.fillStyle='#141428'; ctx.fillRect(rX,rY,rW,rH); // rack body (dark)
    ctx.fillStyle='#222240'; ctx.fillRect(rX+2,rY+2,rW-4,rH-4); // inner face
    ctx.strokeStyle='#303060'; ctx.lineWidth=1; ctx.strokeRect(rX+.5,rY+.5,rW-1,rH-1);
    var ledCols=['#44ff44','#ffcc44','#4499ff','#ff4444','#44ff44','#44ffcc','#ffaa00','#44ff44'];
    for(var ru=0;ru<7;ru++){
      var ruY=rY+4+ru*38;
      ctx.fillStyle='#1a1a32'; ctx.fillRect(rX+4,ruY,rW-8,34);
      ctx.strokeStyle='#2a2a48'; ctx.lineWidth=1; ctx.strokeRect(rX+4,ruY,rW-8,34);
      // screws
      ctx.fillStyle='#3a3a60';
      ctx.beginPath(); ctx.arc(rX+10,ruY+7,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(rX+10,ruY+27,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(rX+rW-10,ruY+7,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(rX+rW-10,ruY+27,3,0,Math.PI*2); ctx.fill();
      // LED (BRIGHT blinking)
      var blink=(ru===1||ru===3||ru===5)&&Math.sin(frame*5+ru*1.3)>0;
      var lcol=ledCols[ru%ledCols.length];
      ctx.fillStyle=blink ? lcol : '#1a1a28';
      ctx.beginPath(); ctx.arc(rX+24,ruY+17,5,0,Math.PI*2); ctx.fill();
      if(!blink){
        ctx.fillStyle=lcol+'88';
        ctx.beginPath(); ctx.arc(rX+24,ruY+17,2,0,Math.PI*2); ctx.fill();
      }
      // port row
      ctx.fillStyle='#0c0c1e';
      for(var p=0;p<3;p++) ctx.fillRect(rX+34+p*8,ruY+13,6,9);
    }
    ctx.fillStyle='#4444aa'; ctx.font='7px Courier New'; ctx.textAlign='center';
    ctx.fillText('RACK',rX+rW/2,rY-5); ctx.textAlign='left';

    // ── server rack (RIGHT — VISIBLE with bright green activity LEDs) ──
    var sX=390,sY=110,sW=82,sH=FLOOR_Y-120;
    ctx.fillStyle='#141428'; ctx.fillRect(sX,sY,sW,sH); // body
    ctx.fillStyle='#1e1e38'; ctx.fillRect(sX+3,sY+3,sW-6,sH-6); // face
    ctx.strokeStyle='#2c2c4c'; ctx.lineWidth=1; ctx.strokeRect(sX+.5,sY+.5,sW-1,sH-1);
    for(var sb=0;sb<8;sb++){
      var sbY=sY+5+sb*36;
      ctx.fillStyle='#161630'; ctx.fillRect(sX+5,sbY,sW-10,32);
      ctx.strokeStyle='#222244'; ctx.strokeRect(sX+5,sbY,sW-10,32);
      // drive bays
      for(var bd=0;bd<4;bd++){
        ctx.fillStyle='#0c0c20'; ctx.fillRect(sX+7+bd*17,sbY+6,14,20);
        ctx.strokeStyle='#1a1a32'; ctx.strokeRect(sX+7+bd*17,sbY+6,14,20);
      }
      // activity LED (BRIGHT green)
      var actOn=Math.sin(frame*7+sb*1.9)>0.4;
      ctx.fillStyle=actOn ? '#44ff88' : '#0c1c0c';
      ctx.fillRect(sX+sW-13,sbY+6,6,6);
    }
    ctx.fillStyle='#4444aa'; ctx.font='7px Courier New'; ctx.textAlign='center';
    ctx.fillText('SERVER',sX+sW/2,sY-5); ctx.textAlign='left';

    // ── main workstation desk (BRIGHT AMBER-BROWN) ──
    var dX=108,dY=FLOOR_Y-66,dW=248;
    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(dX+4,dY+24,dW,9); // shadow
    ctx.fillStyle='#8a5e22'; ctx.fillRect(dX,dY,dW,24); // BRIGHT AMBER DESK
    ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(dX,dY,dW,4);
    ctx.strokeStyle='#4a2c08'; ctx.lineWidth=1; ctx.strokeRect(dX+.5,dY+.5,dW-1,23);
    ctx.fillStyle='#3a1c08';
    ctx.fillRect(dX+7,dY+24,7,18); ctx.fillRect(dX+dW-14,dY+24,7,18);

    // dual monitors
    function mon(mx,my){
      ctx.fillStyle='#161628'; ctx.fillRect(mx,my,36,28);
      ctx.fillStyle='#0c1432'; ctx.fillRect(mx+2,my+2,32,22);
      ctx.fillStyle='rgba(40,100,220,0.65)'; ctx.fillRect(mx+3,my+3,30,20);
      ctx.fillStyle='rgba(0,255,128,0.3)';
      for(var i=0;i<5;i++) ctx.fillRect(mx+4,my+5+i*3,20,1);
      ctx.fillStyle='#1c1c34'; ctx.fillRect(mx+14,my+26,8,6); ctx.fillRect(mx+10,my+32,16,3);
    }
    mon(dX+12,dY-42); mon(dX+58,dY-42);

    // large centre monitor (CLEARLY VISIBLE)
    ctx.fillStyle='#101024'; ctx.fillRect(dX+106,dY-48,56,42);
    ctx.fillStyle='#0c1436'; ctx.fillRect(dX+108,dY-46,52,36);
    ctx.fillStyle='rgba(30,100,220,0.7)'; ctx.fillRect(dX+109,dY-45,50,34);
    ctx.fillStyle='rgba(0,255,100,0.4)';
    for(var ml=0;ml<8;ml++) ctx.fillRect(dX+111,dY-43+ml*4,8+(ml*7)%24,1);
    ctx.fillStyle='#1c1c34'; ctx.fillRect(dX+128,dY-6,12,7); ctx.fillRect(dX+122,dY+1,24,4);

    // keyboard
    ctx.fillStyle='#121224'; ctx.fillRect(dX+104,dY+4,68,10);
    ctx.fillStyle='#1e1e34';
    for(var ki=0;ki<9;ki++) ctx.fillRect(dX+106+ki*7,dY+5,5,8);

    // papers
    ctx.fillStyle='#ccd0b0'; ctx.fillRect(dX+182,dY+2,34,20);
    ctx.fillStyle='#557777';
    for(var li=0;li<3;li++) ctx.fillRect(dX+184,dY+6+li*5,24,1);

    // coffee cup
    ctx.fillStyle='#5a3c18'; ctx.fillRect(dX+222,dY+2,16,18);
    ctx.fillStyle='#2a1408'; ctx.fillRect(dX+224,dY+3,12,8);
    ctx.fillStyle='#6a4824'; ctx.fillRect(dX+238,dY+6,5,9);

    // ── side filing cabinet ──
    ctx.fillStyle='#1a1a32'; ctx.fillRect(72,FLOOR_Y-86,40,86);
    ctx.fillStyle='#242442'; ctx.fillRect(74,FLOOR_Y-84,36,82);
    ctx.strokeStyle='#303060'; ctx.lineWidth=1; ctx.strokeRect(72,FLOOR_Y-86,40,86);
    [0,28,56].forEach(function(dy){
      ctx.fillStyle='#181830'; ctx.fillRect(75,FLOOR_Y-82+dy,34,25);
      ctx.fillStyle='#5050a0'; ctx.fillRect(84,FLOOR_Y-72+dy,16,5); // bright handles
    });

    // ── panel divider ──
    ctx.fillStyle='#05050f'; ctx.fillRect(PANEL_X,0,2,H);
  }

  var DASH_BTN={x:0,y:0,w:0,h:0};

  function trunc(ctx,text,maxW){
    if(ctx.measureText(text).width<=maxW)return text;
    while(text.length>1&&ctx.measureText(text+'…').width>maxW)text=text.slice(0,-1);
    return text+'…';
  }

  function drawPanel(ctx,frame){
    var px=PANEL_X+2, pw=PANEL_W-2, mw=pw-20;
    ctx.fillStyle='#050514'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#09091c'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#5599ff'; ctx.font='bold 13px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('ITRI 研究室',px+pw/2,18);
    ctx.fillStyle='#335577'; ctx.font='11px "Segoe UI", Arial, sans-serif';
    ctx.fillText('950157 工作站',px+pw/2,33);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(68,136,255,0.3)'; ctx.fillRect(px+6,44,pw-12,1);

    var pulse=0.5+0.5*Math.sin(frame*4);
    ctx.fillStyle='rgba(68,136,255,'+(0.25+pulse*0.4)+')';
    ctx.beginPath(); ctx.arc(px+16,62,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#5599ff'; ctx.beginPath(); ctx.arc(px+16,62,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#aaaacc'; ctx.font='11px "Segoe UI", Arial, sans-serif'; ctx.fillText('950157 · 在線',px+28,66);

    var dots=[' ·',' ··',' ···'][Math.floor(frame*2)%3];
    var bi=itriStats;

    // ── Section 1: 專案進度 ──
    ctx.fillStyle='#5599ffaa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif'; ctx.fillText('專案進度',px+8,90);
    ctx.fillStyle='#5599ff33'; ctx.fillRect(px+8,95,pw-16,1);
    ctx.font='11px "Segoe UI", Arial, sans-serif';
    if(itriErr){
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,112);
      ctx.fillStyle='#554444'; ctx.fillText('Render 冷啟動?',px+10,126);
    } else if(!bi){
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,112);
    } else {
      ctx.fillStyle='#aaccff';
      ctx.fillText('進行中: '+(bi.active_projects||0)+' 個專案',px+10,112);
      if(bi.last_updated){
        ctx.fillStyle='#667788';
        ctx.fillText(trunc(ctx,'更新: '+bi.last_updated,mw),px+10,126);
      }
    }

    // ── Section 2: 待辦任務 ──
    ctx.fillStyle='#ffdd44aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif'; ctx.fillText('待辦任務',px+8,183);
    ctx.fillStyle='#ffdd4433'; ctx.fillRect(px+8,188,pw-16,1);
    ctx.font='11px "Segoe UI", Arial, sans-serif';
    if(itriErr){
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,205);
    } else if(!bi){
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,205);
    } else {
      var pt=bi.pending_tasks||0;
      ctx.fillStyle='#ffee88';
      ctx.fillText('待辦: '+pt+' 項',px+10,205);
      ctx.fillStyle=pt===0?'#44cc66':'#ff8844';
      ctx.fillText(pt===0?'✓ 全部完成':'處理中...',px+10,219);
    }

    // ── Section 3: 系統狀態 ──
    ctx.fillStyle='#44ff88aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif'; ctx.fillText('系統狀態',px+8,276);
    ctx.fillStyle='#44ff8833'; ctx.fillRect(px+8,281,pw-16,1);
    ctx.font='11px "Segoe UI", Arial, sans-serif';
    if(itriErr){
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,298);
    } else if(!bi){
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,298);
    } else {
      ctx.fillStyle='#44cc88'; ctx.fillText('950157 Bot · 在線',px+10,298);
      ctx.fillStyle='#556677';
      var lu=bi.last_updated||'尚未同步';
      ctx.fillText(trunc(ctx,'同步: '+lu,mw),px+10,312);
    }

    // dashboard button
    var btnX=px+8, btnY=H-58, btnW=pw-16, btnH=30;
    DASH_BTN.x=PANEL_X+10; DASH_BTN.y=btnY; DASH_BTN.w=btnW; DASH_BTN.h=btnH;
    ctx.fillStyle=dashOpen?'#1a2a44':'#0e1a30';
    ctx.fillRect(btnX,btnY,btnW,btnH);
    ctx.strokeStyle=dashOpen?'#5599ff':'#2a4a70'; ctx.lineWidth=1;
    ctx.strokeRect(btnX+.5,btnY+.5,btnW-1,btnH-1);
    ctx.fillStyle=dashOpen?'#99bbff':'#5599ff';
    ctx.font='bold 9px Courier New'; ctx.textAlign='center';
    ctx.fillText(dashOpen?'✕ 關閉 Dashboard':'▶ 展開 Dashboard',px+pw/2,btnY+18);
    ctx.textAlign='left';

    ctx.fillStyle='#08081c'; ctx.fillRect(px,H-22,pw,22);
    ctx.fillStyle='#445566'; ctx.font='10px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('點擊 950157 對話',px+pw/2,H-8);
    ctx.textAlign='left';
  }

  function openDash(){
    if (dashFrame) return;
    var overlay=document.getElementById('scene-overlay');
    // Wrapper clips the scaled iframe to its visual footprint (800×0.55=440, 600×0.55=330)
    var wrap=document.createElement('div');
    wrap.style.cssText='position:absolute;top:10px;left:6px;width:440px;height:330px;overflow:hidden;border:2px solid #5599ff;z-index:7';
    dashFrame=document.createElement('iframe');
    dashFrame.src='https://telegram-bot-t82n.onrender.com/dashboard';
    dashFrame.style.cssText='width:800px;height:600px;border:none;background:#050514;transform:scale(0.55);transform-origin:top left;display:block';
    wrap.appendChild(dashFrame);
    overlay.appendChild(wrap);
    dashOpen=true;
  }
  function closeDash(){
    if (dashFrame){ var w=dashFrame.parentNode; w&&w.parentNode&&w.parentNode.removeChild(w); dashFrame=null; }
    dashOpen=false;
  }

  var LINES=['進度一切正常。','正在處理研究任務。','系統運行穩定。','這個功能還在測試中...','研究資料已同步完畢。'];
  var itri=null, clickHandler=null;
  var itriStats=null, itriErr=false;

  return {
    init: function(worldData){
      console.log('[ITRI] init called, worldData=', !!worldData);
      var cfg=worldData&&worldData.characters.find(function(c){ return c.id==='itri950'; });
      var dX=108, dY=FLOOR_Y-66, dW=248;
      var cx=dX+dW/2, cy=dY-4;
      itri=cfg?new Character(cfg):null;
      if(itri){ CharacterSprites.applyAll({itri950:itri}); itri.setState('working'); }
      bubbles=[]; dashOpen=false; dashFrame=null;
      itriStats=null; itriErr=false;
      console.log('[ITRI] calling API.overview()');
      API.overview()
        .then(function(d){ console.log('[ITRI] overview data received', d); itriStats=d&&d.bots&&d.bots.itri||{}; })
        .catch(function(e){ itriErr=true; console.error('[ITRI] overview API failed', e); });
      var canvas=BaseScene.canvas;
      if(clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler=function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        if(mx>=DASH_BTN.x&&mx<=DASH_BTN.x+DASH_BTN.w&&my>=DASH_BTN.y&&my<=DASH_BTN.y+DASH_BTN.h){
          dashOpen?closeDash():openDash(); return;
        }
        if(mx>=cx-10&&mx<=cx+10&&my>=cy-30&&my<=cy)
          showBubble(LINES[Math.floor(Math.random()*LINES.length)],cx,cy-32,'#f0f4ff','#5599ff');
      };
      canvas.addEventListener('click',clickHandler);
      BaseScene.startLoop(function(ctx,dt){
        try {
          drawScene(ctx, itri?itri.frame:0);
          drawPanel(ctx, itri?itri.frame:0);
          if(itri){ itri.frame+=dt; itri.drawAt(ctx,cx,cy,'working'); }
          drawBubbles(ctx,dt);
        } catch(e) { console.error('[ITRIScene]', e); }
      });
    },
    cleanup: function(){
      closeDash();
      if(clickHandler){ BaseScene.canvas.removeEventListener('click',clickHandler); clickHandler=null; }
      bubbles=[];
    }
  };
})();
