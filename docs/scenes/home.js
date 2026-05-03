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
    // ── full canvas base (very dark) ──
    ctx.fillStyle = '#09091a';
    ctx.fillRect(0, 0, 680, H);

    // ── wall (warm medium purple — bright and cosy) ──
    ctx.fillStyle = '#5c4880';
    ctx.fillRect(0, 0, SCENE_W, FLOOR_Y);

    // ── lower wall panel (slightly different) ──
    ctx.fillStyle = '#4e3a6e';
    ctx.fillRect(0, FLOOR_Y-72, SCENE_W, 65);
    ctx.fillStyle = '#6e5898';
    ctx.fillRect(0, FLOOR_Y-74, SCENE_W, 2);

    // ── floor (warm wood brown) ──
    ctx.fillStyle = '#7a6050';
    ctx.fillRect(0, FLOOR_Y, SCENE_W, H - FLOOR_Y);
    ctx.strokeStyle = '#6a5040'; ctx.lineWidth = 1; ctx.beginPath();
    for (var x=0; x<=SCENE_W; x+=20) { ctx.moveTo(x+.5,FLOOR_Y); ctx.lineTo(x+.5,H); }
    for (var y=FLOOR_Y; y<=H; y+=20) { ctx.moveTo(0,y+.5); ctx.lineTo(SCENE_W,y+.5); }
    ctx.stroke();

    // ── baseboard ──
    ctx.fillStyle = '#9a8070';
    ctx.fillRect(0, FLOOR_Y-6, SCENE_W, 6);

    // ── windows (warm yellow, clearly visible) ──
    ctx.fillStyle = '#302856'; // curtain rods surround
    ctx.fillRect(20,42,100,4); ctx.fillRect(208,42,100,4);
    function win(wx, wy) {
      ctx.fillStyle = '#3a3060'; ctx.fillRect(wx-4,wy-4,28,34); // frame
      ctx.fillStyle = '#ffcc44'; ctx.fillRect(wx,wy,20,26);      // bright yellow glass
      ctx.fillStyle = 'rgba(255,240,160,0.6)'; ctx.fillRect(wx+2,wy+2,8,5); // glint
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(wx+9,wy,2,26); ctx.fillRect(wx,wy+13,20,2);  // panes
    }
    win(28,50); win(62,50); win(82,50);
    win(216,50); win(250,50); win(270,50);
    // curtains
    ctx.fillStyle = 'rgba(200,120,160,0.35)';
    ctx.fillRect(20,42,12,80); ctx.fillRect(110,42,10,80);
    ctx.fillRect(208,42,10,80); ctx.fillRect(300,42,10,80);

    // ── sofa (BRIGHT ROSE-RED — very visible) ──
    var sx=18, sy=FLOOR_Y-64;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(sx+4,sy+58,152,8); // shadow
    ctx.fillStyle = '#7a2c48'; ctx.fillRect(sx,sy,154,22);    // backrest
    ctx.fillStyle = '#5a1c30'; ctx.fillRect(sx,sy+22,22,38);  // left arm
    ctx.fillRect(sx+132,sy+22,22,38);                          // right arm
    for (var ci=0; ci<3; ci++) {
      ctx.fillStyle = '#c04868'; ctx.fillRect(sx+22+ci*38,sy+22,36,36); // cushions BRIGHT
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(sx+23+ci*38,sy+23,34,5);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(sx+22+ci*38,sy+54,36,2);
    }
    ctx.fillStyle = '#2a1828';
    ctx.fillRect(sx+5,sy+60,7,10); ctx.fillRect(sx+142,sy+60,7,10);

    // ── coffee table (visible warm brown) ──
    var ctX=58, ctY=FLOOR_Y-24;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(ctX+4,ctY+14,70,8);
    ctx.fillStyle = '#7a5a30'; ctx.fillRect(ctX,ctY,72,16); // table BRIGHT BROWN
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(ctX,ctY,72,3);
    ctx.strokeStyle = '#4a3018'; ctx.lineWidth=1; ctx.strokeRect(ctX+.5,ctY+.5,71,15);
    ctx.fillStyle = '#3c2814';
    ctx.fillRect(ctX+5,ctY+16,5,8); ctx.fillRect(ctX+62,ctY+16,5,8);
    // plant on table
    ctx.fillStyle = '#3a5a28'; ctx.fillRect(ctX+52,ctY-18,10,18);
    ctx.fillStyle = '#4acc3a';
    ctx.beginPath(); ctx.arc(ctX+57,ctY-18,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#38aa28';
    ctx.beginPath(); ctx.arc(ctX+53,ctY-12,6,0,Math.PI*2); ctx.fill();

    // ── floor lamp (warm glow) ──
    var lx=186, ly=FLOOR_Y-76;
    ctx.fillStyle = '#484870'; ctx.fillRect(lx+2,ly,5,70); // pole
    ctx.fillStyle = '#343458'; ctx.fillRect(lx-3,ly+70,14,7); // base
    ctx.fillStyle = '#eecc44'; ctx.fillRect(lx-10,ly-18,26,18); // shade BRIGHT
    ctx.fillStyle = '#cc9922'; ctx.fillRect(lx-10,ly-18,26,4);
    ctx.fillStyle = 'rgba(255,210,80,0.12)';
    ctx.beginPath(); ctx.ellipse(lx+3,ly+10,36,28,0,0,Math.PI*2); ctx.fill();

    // ── TV + cabinet (right side) ──
    var tvX=296, tvY=FLOOR_Y-94;
    // TV cabinet
    ctx.fillStyle = '#2a2848'; ctx.fillRect(tvX,tvY+50,118,44);
    ctx.strokeStyle = '#1c1838'; ctx.lineWidth=1; ctx.strokeRect(tvX,tvY+50,118,44);
    ctx.fillStyle = '#1e1c38';
    ctx.fillRect(tvX+4,tvY+54,52,36); ctx.fillRect(tvX+62,tvY+54,52,36);
    ctx.fillStyle = '#484870';
    ctx.fillRect(tvX+28,tvY+70,14,5); ctx.fillRect(tvX+82,tvY+70,14,5);
    // TV screen
    ctx.fillStyle = '#181828'; ctx.fillRect(tvX+6,tvY,106,52);
    ctx.fillStyle = '#1c2848'; ctx.fillRect(tvX+8,tvY+2,102,48);
    ctx.fillStyle = 'rgba(60,100,240,0.55)'; ctx.fillRect(tvX+9,tvY+3,100,46);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (var sl=0; sl<22; sl++) ctx.fillRect(tvX+9,tvY+3+sl*2,100,1);
    // stand
    ctx.fillStyle = '#242240'; ctx.fillRect(tvX+52,tvY+50,18,7);

    // ── kitchen divider (visible) ──
    ctx.fillStyle = '#1c1838'; ctx.fillRect(280,0,10,FLOOR_Y);
    ctx.fillStyle = '#2c2a50'; ctx.fillRect(280,0,2,FLOOR_Y);

    // ── kitchen ──
    var kx=294;
    // upper cabinets
    ctx.fillStyle = '#2a2846'; ctx.fillRect(kx,86,SCENE_W-kx-4,90);
    ctx.strokeStyle = '#3c3860'; ctx.lineWidth=1;
    ctx.strokeRect(kx+4,90,82,82); ctx.strokeRect(kx+88,90,84,82);
    ctx.fillStyle = '#6060a0'; // bright handles
    ctx.fillRect(kx+38,130,16,5); ctx.fillRect(kx+120,130,16,5);
    // counter (VISIBLE WARM BROWN)
    var cy2=FLOOR_Y-64;
    ctx.fillStyle = '#5a4828'; ctx.fillRect(kx,cy2,SCENE_W-kx-4,64); // BRIGHT BROWN
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(kx,cy2,SCENE_W-kx-4,3);
    ctx.strokeStyle = '#382e14'; ctx.lineWidth=1;
    ctx.strokeRect(kx+.5,cy2+.5,SCENE_W-kx-5,63);
    // sink (clearly different from counter)
    ctx.fillStyle = '#1a1c30'; ctx.fillRect(kx+8,cy2+8,60,44);
    ctx.fillStyle = '#222240'; ctx.fillRect(kx+10,cy2+10,56,40);
    ctx.strokeStyle = '#303060'; ctx.strokeRect(kx+8,cy2+8,60,44);
    // faucet (bright silver)
    ctx.fillStyle = '#6a6a90';
    ctx.fillRect(kx+34,cy2-14,6,16); ctx.fillRect(kx+22,cy2-14,28,5);
    // stove
    ctx.fillStyle = '#1e1c30'; ctx.fillRect(kx+76,cy2+6,98,50);
    [[kx+94,cy2+20],[kx+138,cy2+20],[kx+94,cy2+42],[kx+138,cy2+42]].forEach(function(p){
      ctx.fillStyle='#0e0e22'; ctx.beginPath(); ctx.arc(p[0],p[1],11,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#303060'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(p[0],p[1],11,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#282848'; ctx.beginPath(); ctx.arc(p[0],p[1],5,0,Math.PI*2); ctx.fill();
    });

    // ── panel divider ──
    ctx.fillStyle = '#06060f'; ctx.fillRect(PANEL_X,0,2,H);
  }

  function trunc(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0,-1);
    return text + '…';
  }

  function drawPanel(ctx, frame) {
    var px=PANEL_X+2, pw=PANEL_W-2, mw=pw-20;
    ctx.fillStyle='#07071a'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#10102c'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#ff88bb'; ctx.font='bold 13px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('🏠 Home', px+pw/2, 18);
    ctx.fillStyle='#886677'; ctx.font='11px "Segoe UI", Arial, sans-serif';
    ctx.fillText('小因的空間', px+pw/2, 33);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(255,136,187,0.3)'; ctx.fillRect(px+6,44,pw-12,1);

    var dy=62+Math.round(Math.sin(frame*3)*2);
    ctx.fillStyle='rgba(255,136,187,0.3)'; ctx.beginPath(); ctx.arc(px+16,dy,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ff88bb'; ctx.beginPath(); ctx.arc(px+16,dy,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ccaaaa'; ctx.font='11px "Segoe UI", Arial, sans-serif'; ctx.fillText('小因 · 在線',px+28,dy+4);

    var sections=[
      {label:'近期行程',col:'#ff88bb',y:88},
      {label:'孩子注意事項',col:'#ffcc88',y:182},
      {label:'家庭備忘',col:'#88bbff',y:276},
    ];
    var dots=[' ·',' ··',' ···'][Math.floor(frame*2)%3];
    var d=homeData;

    // ── Section 1: 近期行程 ──
    var s=sections[0];
    ctx.fillStyle=s.col+'aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif'; ctx.fillText(s.label,px+8,s.y);
    ctx.fillStyle=s.col+'33'; ctx.fillRect(px+8,s.y+5,pw-16,1);
    ctx.font='11px "Segoe UI", Arial, sans-serif';
    if (homeErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,s.y+22);
      ctx.fillStyle='#554444'; ctx.fillText('Render 冷啟動?',px+10,s.y+36);
    } else if (!d) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,s.y+22);
    } else {
      var sched=d.daily&&d.daily.recurring_schedule||[];
      var events=d.daily&&d.daily.upcoming_events||[];
      var row=0;
      sched.slice(0,3).forEach(function(e){
        ctx.fillStyle='#b0b0cc';
        ctx.fillText(trunc(ctx,e.day+' '+e.what,mw),px+10,s.y+22+row*14); row++;
      });
      events.slice(0,3-row).forEach(function(e){
        ctx.fillStyle='#ffcc88';
        ctx.fillText(trunc(ctx,'▸ '+(e.what||e),mw),px+10,s.y+22+row*14); row++;
      });
      if (row===0){ctx.fillStyle='#555577'; ctx.fillText('目前無近期行程',px+10,s.y+22);}
    }

    // ── Section 2: 孩子注意事項 ──
    s=sections[1];
    ctx.fillStyle=s.col+'aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif'; ctx.fillText(s.label,px+8,s.y);
    ctx.fillStyle=s.col+'33'; ctx.fillRect(px+8,s.y+5,pw-16,1);
    ctx.font='11px "Segoe UI", Arial, sans-serif';
    if (homeErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,s.y+22);
    } else if (!d) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,s.y+22);
    } else {
      var c1=d.members&&d.members.child_1||{};
      var c2=d.members&&d.members.child_2||{};
      var p1=d.planning&&d.planning.child_1_education||{};
      var p2=d.planning&&d.planning.child_2_education||{};
      ctx.fillStyle='#ffcc88'; ctx.fillText('孩一：'+(c1.grade||'—'),px+10,s.y+22);
      if(p1.next_milestone){
        ctx.fillStyle='#888899';
        ctx.fillText(trunc(ctx,'  '+p1.next_milestone,mw),px+10,s.y+36);
      }
      ctx.fillStyle='#ffcc88'; ctx.fillText('孩二：'+(c2.grade||'—'),px+10,s.y+50);
      if(p2.next_milestone){
        ctx.fillStyle='#888899';
        ctx.fillText(trunc(ctx,'  '+p2.next_milestone,mw),px+10,s.y+64);
      }
    }

    // ── Section 3: 家庭備忘 ──
    s=sections[2];
    ctx.fillStyle=s.col+'aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif'; ctx.fillText(s.label,px+8,s.y);
    ctx.fillStyle=s.col+'33'; ctx.fillRect(px+8,s.y+5,pw-16,1);
    ctx.font='11px "Segoe UI", Arial, sans-serif';
    if (homeErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 連線失敗',px+10,s.y+22);
    } else if (!d) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,s.y+22);
    } else {
      var row3=0;
      var wd=d.daily&&d.daily.weekday_residence, we=d.daily&&d.daily.weekend_residence;
      if(wd){ctx.fillStyle='#9090cc'; ctx.fillText(trunc(ctx,'平日：'+wd,mw),px+10,s.y+22+row3*14); row3++;}
      if(we){ctx.fillStyle='#9090cc'; ctx.fillText(trunc(ctx,'假日：'+we,mw),px+10,s.y+22+row3*14); row3++;}
      var urgent=d.summary&&d.summary.urgent_items||[];
      urgent.slice(0,2).forEach(function(item){
        ctx.fillStyle='#ff9966';
        ctx.fillText(trunc(ctx,'⚠ '+item,mw),px+10,s.y+22+row3*14); row3++;
      });
      var tasks=d.daily&&d.daily.household_tasks||[];
      tasks.slice(0,Math.max(0,3-row3)).forEach(function(t){
        ctx.fillStyle='#8888aa';
        ctx.fillText(trunc(ctx,'· '+(t.what||t),mw),px+10,s.y+22+row3*14); row3++;
      });
      if(row3===0){ctx.fillStyle='#555577'; ctx.fillText('無特別備忘',px+10,s.y+22);}
    }

    ctx.fillStyle='#10102c'; ctx.fillRect(px,H-34,pw,34);
    ctx.fillStyle='#557788'; ctx.font='10px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('點擊小因對話',px+pw/2,H-14);
    ctx.textAlign='left';
  }

  var LINES = ['家裡的事交給我！','有什麼需要安排的嗎？','孩子們今天很乖喔！','今天晚餐想吃什麼？'];
  var xiaoyin=null, clickHandler=null;
  var homeData=null, homeErr=false;

  return {
    init: function(worldData) {
      console.log('[HOME] init called, worldData=', !!worldData);
      var cfg = worldData && worldData.characters.find(function(c){ return c.id==='xiaoyin'; });
      var cx=150, cy=FLOOR_Y-6;
      xiaoyin = cfg ? new Character(cfg) : null;
      if (xiaoyin) { CharacterSprites.applyAll({xiaoyin:xiaoyin}); xiaoyin.setState('idle'); }
      bubbles=[];
      homeData=null; homeErr=false;
      console.log('[HOME] calling API.family()');
      API.family()
        .then(function(d){ console.log('[HOME] family data received', d); homeData=d; })
        .catch(function(e){ homeErr=true; console.error('[HOME] family API failed', e); });
      var canvas=BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler = function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        if (mx>=cx-10&&mx<=cx+10&&my>=cy-30&&my<=cy)
          showBubble(LINES[Math.floor(Math.random()*LINES.length)],cx,cy-32,'#fff0f6','#ff88bb');
      };
      canvas.addEventListener('click',clickHandler);
      BaseScene.startLoop(function(ctx, dt){
        try {
          drawScene(ctx);
          drawPanel(ctx, xiaoyin ? xiaoyin.frame : 0);
          if (xiaoyin) { xiaoyin.frame+=dt; xiaoyin.drawAt(ctx,cx,cy,'idle'); }
          drawBubbles(ctx,dt);
        } catch(e) { console.error('[HomeScene]', e); }
      });
    },
    cleanup: function(){
      if (clickHandler){ BaseScene.canvas.removeEventListener('click',clickHandler); clickHandler=null; }
      bubbles=[];
    }
  };
})();
