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
    ctx.fillStyle = '#09091a';
    ctx.fillRect(0, 0, 680, H);

    // ── wall (medium navy — clearly visible against dark base) ──
    ctx.fillStyle = '#1e2044';
    ctx.fillRect(0, 0, SCENE_W, FLOOR_Y);

    // ── floor ──
    ctx.fillStyle = '#161830';
    ctx.fillRect(0, FLOOR_Y, SCENE_W, H-FLOOR_Y);
    ctx.strokeStyle='#10122a'; ctx.lineWidth=1; ctx.beginPath();
    for(var x=0;x<=SCENE_W;x+=20){ ctx.moveTo(x+.5,FLOOR_Y); ctx.lineTo(x+.5,H); }
    for(var y=FLOOR_Y;y<=H;y+=20){ ctx.moveTo(0,y+.5); ctx.lineTo(SCENE_W,y+.5); }
    ctx.stroke();

    // baseboard
    ctx.fillStyle='#2e2e5c'; ctx.fillRect(0,FLOOR_Y-6,SCENE_W,6);

    // ── back wall windows (BRIGHT BLUE) ──
    [38, 132, 226, 320].forEach(function(wx){
      ctx.fillStyle='#282a50'; ctx.fillRect(wx-4,46,30,66); // surround
      ctx.fillStyle='#5599ee'; ctx.fillRect(wx,50,22,58);   // bright blue glass
      ctx.fillStyle='rgba(180,220,255,0.4)'; ctx.fillRect(wx+1,51,10,22); // glint
      ctx.fillStyle='rgba(0,0,20,0.3)';
      ctx.fillRect(wx+10,50,2,58); ctx.fillRect(wx,78,22,2); // panes
    });
    // window rail
    ctx.fillStyle='#242450'; ctx.fillRect(32,44,320,4);

    // ── HQ sign on back wall ──
    ctx.fillStyle='#162a1e'; ctx.fillRect(356,50,114,38);
    ctx.strokeStyle='#3a6a44'; ctx.lineWidth=1;
    ctx.strokeRect(357,51,112,36);
    ctx.fillStyle='#55ee77'; ctx.font='bold 10px Courier New'; ctx.textAlign='center';
    ctx.fillText('HY WORLD HQ',413,65);
    ctx.fillStyle='#33bb55'; ctx.font='8px Courier New';
    ctx.fillText('總部指揮中心',413,79);
    ctx.textAlign='left';

    // ── whiteboard (left — VERY LIGHT, clearly visible) ──
    ctx.fillStyle='#282a52'; ctx.fillRect(4,92,92,124);   // frame (medium blue)
    ctx.fillStyle='#dce4f4'; ctx.fillRect(8,96,84,116);   // BRIGHT surface
    // lines on board (dark blue ink)
    ctx.strokeStyle='#3355bb'; ctx.lineWidth=1.5;
    [[12,114,78,114],[12,124,62,124],[12,134,70,134],[12,146,48,146],[12,156,66,156]].forEach(function(l){
      ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke();
    });
    ctx.strokeStyle='#cc3333'; ctx.lineWidth=1; ctx.strokeRect(12,164,30,24);
    ctx.strokeStyle='#33aa33';
    ctx.beginPath(); ctx.moveTo(44,176); ctx.lineTo(74,176); ctx.stroke();
    // marker tray
    ctx.fillStyle='#242450'; ctx.fillRect(8,212,84,6);
    ctx.fillStyle='#5a5a8a'; ctx.font='7px Courier New';
    ctx.fillText('BOARD',22,224);

    // ── bookshelf (right — COLOURFUL SPINES) ──
    var bsX=430,bsY=76,bsW=46,bsH=204;
    ctx.fillStyle='#1e1408'; ctx.fillRect(bsX,bsY,bsW,bsH);
    // shelf boards
    ctx.fillStyle='#2c1c0c'; [46,96,146,196].forEach(function(dy){ ctx.fillRect(bsX,bsY+dy,bsW,5); });
    // books (vivid spines)
    var cols=['#ee2222','#2244ee','#22ee44','#ee8822','#8822ee','#ee2288','#44eecc','#eeee22'];
    [0,50,100,150].forEach(function(shelf,si){
      var bkx=bsX+2;
      for(var bi=0;bi<5;bi++){
        var bw2=6+(bi%2)*4;
        ctx.fillStyle=cols[(si*3+bi)%cols.length];
        ctx.fillRect(bkx,bsY+shelf+7,bw2,37);
        ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(bkx,bsY+shelf+7,1,37);
        bkx+=bw2+1;
      }
    });
    ctx.fillStyle='#5a4428'; ctx.font='7px Courier New';
    ctx.fillText('REFS',bsX+8,bsY+bsH+11);

    // ── work desks (front — VISIBLE AMBER-BROWN) ──
    function desk(dx,dy,dw){
      ctx.fillStyle='#7a5020'; ctx.fillRect(dx,dy,dw,24); // BRIGHT AMBER
      ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(dx,dy,dw,3);
      ctx.strokeStyle='#4a2c0c'; ctx.lineWidth=1; ctx.strokeRect(dx,dy,dw,24);
      ctx.fillStyle='#3a1c08'; ctx.fillRect(dx+6,dy+24,6,14); ctx.fillRect(dx+dw-12,dy+24,6,14);
    }
    function monitor(mx,my){
      ctx.fillStyle='#141428'; ctx.fillRect(mx,my,34,26);
      ctx.fillStyle='#0c1634'; ctx.fillRect(mx+2,my+2,30,20);
      ctx.fillStyle='rgba(50,110,240,0.6)'; ctx.fillRect(mx+3,my+3,28,18);
      ctx.fillStyle='rgba(0,255,128,0.25)';
      for(var i=0;i<4;i++) ctx.fillRect(mx+4,my+5+i*3,18,1);
      ctx.fillStyle='#1c1c34'; ctx.fillRect(mx+13,my+24,8,5); ctx.fillRect(mx+9,my+29,16,3);
    }
    function chair(chx,chy){
      ctx.fillStyle='#2e2e58'; ctx.fillRect(chx,chy,22,12); ctx.fillRect(chx+2,chy-12,18,12);
      ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(chx+2,chy-12,18,3);
    }
    desk(28,FLOOR_Y-70,118); monitor(54,FLOOR_Y-100); chair(66,FLOOR_Y-48);
    ctx.fillStyle='#131330'; ctx.fillRect(58,FLOOR_Y-72,44,8); // keyboard area
    desk(226,FLOOR_Y-70,118); monitor(252,FLOOR_Y-100); chair(264,FLOOR_Y-48);
    ctx.fillStyle='#131330'; ctx.fillRect(256,FLOOR_Y-72,44,8);

    // ── conference table (BRIGHT AMBER centre) ──
    var ctX=96,ctY=FLOOR_Y-164,ctW=228,ctH=54;
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(ctX+5,ctY+ctH,ctW,9); // shadow
    ctx.fillStyle='#9a6e28'; ctx.fillRect(ctX,ctY,ctW,ctH); // BRIGHT AMBER TABLE
    ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(ctX,ctY,ctW,4);
    ctx.strokeStyle='#5a3c0c'; ctx.lineWidth=1; ctx.strokeRect(ctX+.5,ctY+.5,ctW-1,ctH-1);
    ctx.fillStyle='#3c2008'; ctx.fillRect(ctX+8,ctY+ctH,7,14); ctx.fillRect(ctX+ctW-15,ctY+ctH,7,14);
    // HY nameplate on table
    ctx.fillStyle='#0e2418'; ctx.fillRect(ctX+ctW/2-34,ctY+ctH/2-9,68,18);
    ctx.strokeStyle='#33cc55'; ctx.lineWidth=1; ctx.strokeRect(ctX+ctW/2-34,ctY+ctH/2-9,68,18);
    ctx.fillStyle='#55ee77'; ctx.font='bold 10px Courier New'; ctx.textAlign='center';
    ctx.fillText('HY',ctX+ctW/2,ctY+ctH/2+5);
    ctx.textAlign='left';
    // paper stacks
    [ctX+18,ctX+168].forEach(function(ix){
      ctx.fillStyle='#d8d8c4'; ctx.fillRect(ix,ctY+10,24,17);
      ctx.fillStyle='#9090a0';
      for(var li=0;li<3;li++){ ctx.fillRect(ix+2,ctY+13+li*4,18,1); }
    });
    // chairs around table
    [ctX+12,ctX+70,ctX+148,ctX+200].forEach(function(cx){ chair(cx,ctY+ctH+4); });
    // HY chair behind table
    ctx.fillStyle='#3a3a68'; ctx.fillRect(ctX+ctW/2-12,ctY-16,24,12);
    ctx.fillRect(ctX+ctW/2-10,ctY-28,20,12);

    // ── panel divider ──
    ctx.fillStyle='#06060f'; ctx.fillRect(PANEL_X,0,2,H);
  }

  function trunc(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0,-1);
    return text + '…';
  }

  function drawPanel(ctx,frame){
    var px=PANEL_X+2, pw=PANEL_W-2, mw=pw-20;
    ctx.fillStyle='#060614'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#0c1a12'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#55ee77'; ctx.font='bold 11px Courier New'; ctx.textAlign='center';
    ctx.fillText('🏢 總部 HQ',px+pw/2,16);
    ctx.fillStyle='#337744'; ctx.font='9px Courier New';
    ctx.fillText('HY 的指揮中心',px+pw/2,31);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(68,204,102,0.3)'; ctx.fillRect(px+6,44,pw-12,1);

    var pulse=0.5+0.5*Math.sin(frame*4);
    ctx.fillStyle='rgba(68,204,102,'+(0.3+pulse*0.4)+')';
    ctx.beginPath(); ctx.arc(px+16,62,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#55ee77'; ctx.beginPath(); ctx.arc(px+16,62,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#aaaacc'; ctx.font='9px Courier New'; ctx.fillText('HY · 在線',px+28,66);

    var dots=[' ·',' ··',' ···'][Math.floor(frame*2)%3];
    var d=overviewData;

    // ── Section 1: Claude 跨域建議 ──
    ctx.fillStyle='#5599ffaa'; ctx.font='8px Courier New'; ctx.fillText('Claude 跨域建議',px+8,90);
    ctx.fillStyle='#5599ff33'; ctx.fillRect(px+8,95,pw-16,1);
    ctx.font='9px Courier New';
    if (overviewErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,112);
      ctx.fillStyle='#554444'; ctx.fillText('Render 冷啟動?',px+10,126);
    } else if (!d) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,112);
    } else {
      var sug=d.suggestion||'（無建議）';
      // word-wrap suggestion into up to 3 lines (~28 chars each at 9px Courier)
      var words=sug.split(''), line='', rows=[];
      words.forEach(function(ch){
        var test=line+ch;
        if(ctx.measureText(test).width>mw){rows.push(line);line=ch;}else{line=test;}
      });
      if(line)rows.push(line);
      ctx.fillStyle='#aaccff';
      rows.slice(0,4).forEach(function(r,i){ ctx.fillText(r,px+10,112+i*13); });
    }

    // ── Section 2: 三 Bot 狀態摘要 ──
    ctx.fillStyle='#55ee77aa'; ctx.font='8px Courier New'; ctx.fillText('三 Bot 狀態摘要',px+8,180);
    ctx.fillStyle='#55ee7733'; ctx.fillRect(px+8,185,pw-16,1);
    ctx.font='9px Courier New';
    if (overviewErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,202);
    } else if (!d) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,202);
    } else {
      var bi=d.bots&&d.bots.itri||{}, bp=d.bots&&d.bots.personal||{}, bf=d.bots&&d.bots.family||{};
      ctx.fillStyle='#4488ff';
      ctx.fillText(trunc(ctx,'ITRI: '+bi.active_projects+'專案/'+bi.pending_tasks+'待辦',mw),px+10,202);
      ctx.fillStyle='#88ff88';
      ctx.fillText(trunc(ctx,'Personal: 運動'+bp.exercise,mw),px+10,216);
      ctx.fillStyle='#ffbb88';
      var fl=bf.last_updated;
      ctx.fillText(trunc(ctx,'Family: '+(fl||'待同步'),mw),px+10,230);
    }

    // ── Section 3: 今日任務清單 ──
    ctx.fillStyle='#ffdd44aa'; ctx.font='8px Courier New'; ctx.fillText('今日任務清單',px+8,285);
    ctx.fillStyle='#ffdd4433'; ctx.fillRect(px+8,290,pw-16,1);
    ctx.font='9px Courier New';
    if (overviewErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,307);
    } else if (!d) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,307);
    } else {
      var bi2=d.bots&&d.bots.itri||{}, bp2=d.bots&&d.bots.personal||{};
      ctx.fillStyle='#aaaacc';
      ctx.fillText(trunc(ctx,'ITRI 待辦: '+(bi2.pending_tasks||0)+' 項',mw),px+10,307);
      ctx.fillText(trunc(ctx,'運動進度: '+(bp2.exercise||'—'),mw),px+10,321);
      if(bi2.last_updated){
        ctx.fillStyle='#666677';
        ctx.fillText(trunc(ctx,'更新: '+bi2.last_updated,mw),px+10,335);
      }
    }

    ctx.fillStyle='#0c1412'; ctx.fillRect(px,H-34,pw,34);
    ctx.fillStyle='#557766'; ctx.font='8px Courier New'; ctx.textAlign='center';
    ctx.fillText('點擊 HY 對話',px+pw/2,H-16);
    ctx.textAlign='left';
  }

  var LINES=['一切都在計畫中！','需要跨域協調嗎？','今天的任務清單很長...','三個分身都在線！'];
  var hy=null, clickHandler=null;
  var overviewData=null, overviewErr=false;

  return {
    init: function(worldData){
      var cfg = worldData && worldData.characters.find(function(c){ return c.id==='hy'; });
      var ctX=96,ctY=FLOOR_Y-164,ctW=228;
      var cx=ctX+ctW/2, cy=ctY-4;
      hy = cfg ? new Character(cfg) : null;
      if (hy) { CharacterSprites.applyAll({hy:hy}); hy.setState('working'); }
      bubbles=[];
      overviewData=null; overviewErr=false;
      API.overview().then(function(d){ overviewData=d; }).catch(function(e){ overviewErr=true; console.error('[HQScene] overview API failed', e); });
      var canvas=BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler=function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        if (mx>=cx-10&&mx<=cx+10&&my>=cy-30&&my<=cy)
          showBubble(LINES[Math.floor(Math.random()*LINES.length)],cx,cy-32,'#f0fff4','#55ee77');
      };
      canvas.addEventListener('click',clickHandler);
      BaseScene.startLoop(function(ctx,dt){
        try {
          drawScene(ctx);
          drawPanel(ctx, hy ? hy.frame : 0);
          if (hy) { hy.frame+=dt; hy.drawAt(ctx,cx,cy,'working'); }
          drawBubbles(ctx,dt);
        } catch(e) { console.error('[HQScene]', e); }
      });
    },
    cleanup: function(){
      if (clickHandler){ BaseScene.canvas.removeEventListener('click',clickHandler); clickHandler=null; }
      bubbles=[];
    }
  };
})();
