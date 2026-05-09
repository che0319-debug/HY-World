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
    var SW = SCENE_W, FY = FLOOR_Y;

    // ══ 全畫布底色 ══
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect(0, 0, 680, H);

    // ══ 後牆（磚紅色） ══
    ctx.fillStyle = '#6a3820';
    ctx.fillRect(0, 0, SW, FY - 60);
    // 磚紋（橫向）
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var wy = 0; wy < FY - 60; wy += 16) ctx.fillRect(0, wy, SW, 2);
    // 磚縫（縱向，交錯）
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    var bOff = 0;
    for (var wy2 = 0; wy2 < FY - 60; wy2 += 16) {
      bOff = bOff === 0 ? 24 : 0;
      for (var bx = bOff; bx < SW; bx += 48) ctx.fillRect(bx, wy2, 2, 14);
    }
    // 牆面右側略暗
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(SW - 60, 0, 60, FY - 60);
    // 牆面左側略暗
    ctx.fillRect(0, 0, 40, FY - 60);

    // ══ 下牆板 ══
    ctx.fillStyle = '#5a2c14';
    ctx.fillRect(0, FY - 62, SW, 57);
    ctx.fillStyle = '#7a4020';
    ctx.fillRect(0, FY - 64, SW, 4);
    ctx.fillStyle = '#3a1c08';
    ctx.fillRect(0, FY - 7, SW, 3);

    // ══ 木質地板（橫向條紋） ══
    var plankH = 14;
    for (var py = FY; py < H; py += plankH) {
      var row = Math.floor((py - FY) / plankH);
      ctx.fillStyle = row % 2 === 0 ? '#7a4c28' : '#6e4222';
      ctx.fillRect(0, py, SW, plankH);
    }
    // 木條縫線
    ctx.strokeStyle = '#5a3218'; ctx.lineWidth = 1; ctx.beginPath();
    for (var py2 = FY; py2 <= H; py2 += plankH) { ctx.moveTo(0,py2+.5); ctx.lineTo(SW,py2+.5); }
    ctx.stroke();
    // 木紋隨機短線
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
    [[30,FY+10,80],[120,FY+24,60],[220,FY+8,90],[350,FY+18,70],[420,FY+4,50],
     [60,FY+38,40],[180,FY+46,80],[300,FY+34,60],[440,FY+42,50]].forEach(function(l){
      ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[0]+l[2],l[1]); ctx.stroke();
    });
    // 地板高光
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0,FY,SW,4);
    // 踢腳線
    ctx.fillStyle = '#4a2810'; ctx.fillRect(0,FY-7,SW,7);
    ctx.fillStyle = '#6a3c18'; ctx.fillRect(0,FY-7,SW,2);

    // ══ 吊燈（復古燈泡） ══
    function lamp(lx2, bright) {
      // 燈線
      ctx.fillStyle = '#2a1c10'; ctx.fillRect(lx2-1,0,2,28);
      // 燈座
      ctx.fillStyle = '#4a3820'; ctx.fillRect(lx2-8,28,16,8);
      ctx.fillStyle = '#6a5030'; ctx.fillRect(lx2-6,30,12,4);
      // 燈泡
      ctx.fillStyle = bright ? '#ffd860' : '#c8a040';
      ctx.beginPath(); ctx.arc(lx2,42,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = bright ? '#fff4a0' : '#e8c060';
      ctx.beginPath(); ctx.arc(lx2-3,38,5,0,Math.PI*2); ctx.fill();
      // 燈光暈
      if (bright) {
        ctx.fillStyle = 'rgba(255,220,80,0.12)';
        ctx.beginPath(); ctx.arc(lx2,42,30,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,200,60,0.06)';
        ctx.beginPath(); ctx.arc(lx2,42,55,0,Math.PI*2); ctx.fill();
      }
    }
    lamp(80, true); lamp(200, true); lamp(320, true); lamp(420, true);

    // ══ 後牆霓虹招牌 ══
    // 招牌底板
    ctx.fillStyle = '#1a0e08'; ctx.fillRect(130,52,220,38);
    ctx.fillStyle = '#0e0808'; ctx.fillRect(132,54,216,34);
    // 霓虹字（橘黃發光）
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffaa22';
    ctx.font = 'bold 18px "Courier New"'; ctx.textAlign = 'center';
    ctx.fillText('HY WORLD HQ', 240, 72);
    ctx.shadowBlur = 0;
    // 副標題
    ctx.fillStyle = '#cc8822'; ctx.font = '9px "Courier New"';
    ctx.fillText('指揮中心 Command Center', 240, 84);
    ctx.textAlign = 'left';
    // 招牌外框
    ctx.strokeStyle = '#8a5020'; ctx.lineWidth = 1.5;
    ctx.strokeRect(130.5,52.5,219,37);

    // ══ 左側窗戶（磚牆上） ══
    function win(wx3, wy3) {
      ctx.fillStyle = '#2a1408'; ctx.fillRect(wx3-4,wy3-4,56,70);
      ctx.fillStyle = '#3a1c0c'; ctx.fillRect(wx3-2,wy3-2,52,66);
      ctx.fillStyle = '#88aacc'; ctx.fillRect(wx3,wy3,48,62);
      ctx.fillStyle = 'rgba(200,230,255,0.35)'; ctx.fillRect(wx3+1,wy3+1,22,28);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(wx3+23,wy3,2,62); ctx.fillRect(wx3,wy3+30,48,2);
      ctx.fillStyle = '#2a1408'; ctx.fillRect(wx3-4,wy3+62,56,6);
    }
    win(10, 24); win(10, 108);

    // ══ 植物工具 ══
    function plant(px4, py4, size) {
      // 投影
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(px4+3,py4+4,size*0.5,size*0.2,0,0,Math.PI*2); ctx.fill();
      // 盆
      ctx.fillStyle = '#7a3c18'; ctx.fillRect(px4-Math.floor(size*0.35),py4,Math.floor(size*0.7),Math.floor(size*0.5));
      ctx.fillStyle = '#5a2c10'; ctx.fillRect(px4-Math.floor(size*0.3),py4+Math.floor(size*0.45),Math.floor(size*0.6),Math.floor(size*0.1));
      ctx.fillStyle = '#2a1408'; ctx.fillRect(px4-Math.floor(size*0.32),py4+2,Math.floor(size*0.64),Math.floor(size*0.2));
      // 葉冠
      var leaves = [
        {dx:-size*0.3,dy:-size*0.5,r:size*0.42,c:'#2a6a18'},
        {dx: size*0.25,dy:-size*0.45,r:size*0.36,c:'#308820'},
        {dx:-size*0.1,dy:-size*0.65,r:size*0.46,c:'#389828'},
        {dx: size*0.12,dy:-size*0.4,r:size*0.32,c:'#44aa30'},
        {dx:-size*0.05,dy:-size*0.8,r:size*0.36,c:'#4aba38'},
      ];
      leaves.forEach(function(l){
        ctx.fillStyle=l.c;
        ctx.beginPath(); ctx.arc(px4+l.dx,py4+l.dy,l.r,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle='rgba(100,200,50,0.2)';
      ctx.beginPath(); ctx.arc(px4-size*0.15,py4-size*0.72,size*0.16,0,Math.PI*2); ctx.fill();
    }

    // 植物散落
    plant(72, 168, 24);   // 左中
    plant(18, 340, 20);   // 左下
    plant(440, 140, 22);  // 右後
    plant(456, 320, 18);  // 右下
    plant(200, 350, 16);  // 中下
    plant(340, 360, 16);  // 中右下

    // ══ 工作桌工具 ══
    function desk(dx, dy, dw, dh) {
      // 投影
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(dx+4,dy+dh,dw,8);
      // 桌面
      ctx.fillStyle = '#5a3c1a'; ctx.fillRect(dx,dy,dw,dh);
      ctx.fillStyle = '#7a5428'; ctx.fillRect(dx+2,dy+2,dw-4,dh-4);
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(dx+2,dy+2,dw-4,3);
      // 桌腳
      ctx.fillStyle = '#2a1808';
      ctx.fillRect(dx+4,dy+dh,6,10); ctx.fillRect(dx+dw-10,dy+dh,6,10);
      ctx.strokeStyle = '#3a2010'; ctx.lineWidth=1;
      ctx.strokeRect(dx+.5,dy+.5,dw-1,dh-1);
    }
    function monitor(mx2, my2, w, h) {
      ctx.fillStyle = '#0a0a18'; ctx.fillRect(mx2-2,my2-2,w+4,h+4);
      ctx.fillStyle = '#141428'; ctx.fillRect(mx2,my2,w,h);
      ctx.fillStyle = 'rgba(40,100,220,0.7)'; ctx.fillRect(mx2+2,my2+2,w-4,h-4);
      ctx.fillStyle = 'rgba(180,220,255,0.2)'; ctx.fillRect(mx2+2,my2+2,w-4,6);
      ctx.fillStyle = 'rgba(0,200,120,0.3)';
      for (var i=0;i<4;i++) ctx.fillRect(mx2+4,my2+10+i*5,w-12+i*2,2);
      ctx.fillStyle='#1a1c30'; ctx.fillRect(mx2+Math.floor(w/2)-3,my2+h,6,5);
    }
    function chair(cx2, cy2, color) {
      ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(cx2-12,cy2+14,24,6);
      ctx.fillStyle=color||'#2a3848'; ctx.fillRect(cx2-12,cy2,24,18);
      ctx.fillStyle=color?color+'cc':'#3a4858'; ctx.fillRect(cx2-10,cy2+2,20,14);
      ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(cx2-10,cy2+2,20,4);
      ctx.fillStyle=color||'#2a3848'; ctx.fillRect(cx2-10,cy2-14,20,14);
      ctx.fillStyle=color?color+'cc':'#3a4858'; ctx.fillRect(cx2-8,cy2-12,16,10);
    }

    // ══ 主管大桌（後方居中） ══
    desk(148, 90, 180, 54);
    // 主管椅（後方，氣派深色）
    chair(238, 82, '#1a2838');
    // 桌上：大螢幕 x2
    monitor(158, 52, 54, 36);
    monitor(224, 52, 54, 36);
    // 桌上：文件
    ctx.fillStyle='#e0dcc8'; ctx.fillRect(290,100,28,18);
    ctx.fillStyle='#f0ece0'; ctx.fillRect(288,98,28,18);
    ctx.fillStyle='#8899aa';
    for (var fi=0;fi<3;fi++) ctx.fillRect(290,101+fi*4,24,2);
    // 桌上：咖啡杯
    ctx.fillStyle='#8a5030'; ctx.fillRect(302,106,12,16);
    ctx.fillStyle='#5a3018'; ctx.fillRect(304,108,8,8);
    ctx.fillStyle='#aa7040'; ctx.fillRect(314,110,5,9);
    // 名牌
    ctx.fillStyle='#c8a030'; ctx.fillRect(196,134,64,8);
    ctx.fillStyle='#e8c040'; ctx.fillRect(197,135,62,6);
    ctx.fillStyle='#1a1008'; ctx.font='bold 6px Courier New'; ctx.textAlign='center';
    ctx.fillText('HY · 總指揮', 228, 141);

    // ══ 監控牆（右後方） ══
    // 機架底座
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(354,22,118,120);
    ctx.fillStyle='#1a1a28'; ctx.fillRect(352,20,118,120);
    ctx.fillStyle='#222238'; ctx.fillRect(354,22,114,116);
    ctx.strokeStyle='#303050'; ctx.lineWidth=1; ctx.strokeRect(352.5,20.5,117,119);
    // 多螢幕（3x2）
    [[356,24],[396,24],[436,24],[356,62],[396,62],[436,62]].forEach(function(p,i){
      ctx.fillStyle='#0a0a18'; ctx.fillRect(p[0],p[1],36,34);
      ctx.fillStyle='#0e1030'; ctx.fillRect(p[0]+1,p[1]+1,34,32);
      var colors=['rgba(40,100,220,0.7)','rgba(200,60,60,0.6)','rgba(40,180,80,0.6)',
                  'rgba(180,120,40,0.6)','rgba(40,100,220,0.7)','rgba(80,40,200,0.6)'];
      ctx.fillStyle=colors[i]; ctx.fillRect(p[0]+2,p[1]+2,32,30);
      ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(p[0]+2,p[1]+2,32,6);
      // 格線感
      ctx.strokeStyle='rgba(0,0,0,0.2)'; ctx.lineWidth=0.5;
      ctx.strokeRect(p[0]+2,p[1]+2,32,30);
    });
    // 底部控制台
    ctx.fillStyle='#141428'; ctx.fillRect(354,100,114,36);
    ctx.fillStyle='#1e1e38'; ctx.fillRect(356,102,110,32);
    // 控制鈕
    ['#44ff44','#ff4444','#ffcc44','#4488ff'].forEach(function(c,i){
      ctx.fillStyle=c; ctx.beginPath(); ctx.arc(364+i*14,116,4,0,Math.PI*2); ctx.fill();
    });
    // 旋鈕
    [420,434,448].forEach(function(kx){
      ctx.fillStyle='#303050'; ctx.beginPath(); ctx.arc(kx,116,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#505080'; ctx.beginPath(); ctx.arc(kx,116,3,0,Math.PI*2); ctx.fill();
    });
    // 監控台椅
    chair(406, 146, '#2a3040');

    // ══ 工作站 1（左中） ══
    desk(82, 200, 110, 40);
    chair(132, 192, '#3a4858');
    monitor(92, 172, 44, 28);
    // 鍵盤
    ctx.fillStyle='#1a1828'; ctx.fillRect(108,204,50,12);
    for (var ki=0;ki<6;ki++) ctx.fillRect(110+ki*8,206,6,8);
    // 滑鼠
    ctx.fillStyle='#282838'; ctx.fillRect(166,206,10,14);
    ctx.fillStyle='#343448'; ctx.fillRect(167,207,8,10);

    // ══ 工作站 2（中央） ══
    desk(188, 246, 110, 40);
    chair(238, 238, '#3a4858');
    monitor(198, 218, 44, 28);
    ctx.fillStyle='#1a1828'; ctx.fillRect(214,250,50,12);
    for (var ki2=0;ki2<6;ki2++) ctx.fillRect(216+ki2*8,252,6,8);
    ctx.fillStyle='#282838'; ctx.fillRect(272,252,10,14);
    // 桌上文件
    ctx.fillStyle='#e8e4d4'; ctx.fillRect(290,248,18,14);
    ctx.fillStyle='#f0ece0'; ctx.fillRect(289,247,18,14);

    // ══ 工作站 3（右中） ══
    desk(298, 200, 110, 40);
    chair(348, 192, '#3a4858');
    monitor(308, 172, 44, 28);
    ctx.fillStyle='#1a1828'; ctx.fillRect(314,204,50,12);
    for (var ki3=0;ki3<6;ki3++) ctx.fillRect(316+ki3*8,206,6,8);
    ctx.fillStyle='#282838'; ctx.fillRect(378,206,10,14);
    // 桌上咖啡
    ctx.fillStyle='#7a4820'; ctx.fillRect(380,204,10,12);
    ctx.fillStyle='#4a2c10'; ctx.fillRect(382,206,6,6);

    // ══ 右側白板 ══
    // 白板架
    ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(426,186,50,162);
    ctx.fillStyle='#c8ccd0'; ctx.fillRect(424,184,50,162);
    ctx.fillStyle='#e8ecf0'; ctx.fillRect(426,186,46,158);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillRect(426,186,46,12);
    ctx.strokeStyle='#a8acb0'; ctx.lineWidth=1.5; ctx.strokeRect(424.5,184.5,49,161);
    // 白板上內容（圖表感）
    ctx.strokeStyle='#4466cc'; ctx.lineWidth=1.5;
    [[428,206,466,206],[428,218,454,218],[428,230,460,230]].forEach(function(l){
      ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke();
    });
    // 圓圈圖
    ctx.strokeStyle='#cc4444'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(438,252,12,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='#44aa44';
    ctx.beginPath(); ctx.arc(458,252,10,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='#4466cc'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(450,252); ctx.lineTo(448,252); ctx.stroke();
    // 箭頭和說明
    ctx.strokeStyle='#884488'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(428,270); ctx.lineTo(466,270); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(428,280); ctx.lineTo(454,280); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(428,290); ctx.lineTo(460,290); ctx.stroke();
    // 筆托盤
    ctx.fillStyle='#a0a8b0'; ctx.fillRect(424,344,50,8);
    [[428,'#cc4444'],[436,'#4488cc'],[444,'#44aa44'],[452,'#cc8800']].forEach(function(p){
      ctx.fillStyle=p[1]; ctx.fillRect(p[0],345,6,5);
    });
    // 白板架腳架
    ctx.fillStyle='#888890'; ctx.fillRect(434,344,4,30); ctx.fillRect(452,344,4,30);
    ctx.fillRect(426,370,56,5);

    // ══ 面板分隔線 ══
    ctx.fillStyle='#06060f'; ctx.fillRect(PANEL_X,0,2,H);
  }

  function trunc(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0,-1);
    return text + '…';
  }

  function drawTextBlock(ctx, text, x, y, maxW, lineH, maxLines) {
    var lines = text.split('\n');
    var curY = y, totalLines = 0;
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      if (!line) { curY += lineH * 0.5; continue; }
      var buf = '';
      for (var ci = 0; ci < line.length; ci++) {
        var test = buf + line[ci];
        if (ctx.measureText(test).width > maxW && buf !== '') {
          totalLines++;
          if (maxLines && totalLines > maxLines) return curY;
          ctx.fillText(buf, x, curY); buf = line[ci]; curY += lineH;
        } else { buf = test; }
      }
      if (buf) {
        totalLines++;
        if (maxLines && totalLines > maxLines) return curY;
        ctx.fillText(buf, x, curY);
      }
      curY += lineH;
    }
    return curY;
  }

  function drawPanel(ctx,frame){
    var px=PANEL_X+2, pw=PANEL_W-2, mw=pw-20;
    ctx.fillStyle='#060614'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#0c1a12'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#55ee77'; ctx.font='bold 11px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('🏢 總部 HQ',px+pw/2,18);
    ctx.fillStyle='#337744'; ctx.font='10px "Segoe UI", Arial, sans-serif';
    ctx.fillText('HY 的指揮中心',px+pw/2,33);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(68,204,102,0.3)'; ctx.fillRect(px+6,44,pw-12,1);

    var pulse=0.5+0.5*Math.sin(frame*4);
    ctx.fillStyle='rgba(68,204,102,'+(0.3+pulse*0.4)+')';
    ctx.beginPath(); ctx.arc(px+16,62,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#55ee77'; ctx.beginPath(); ctx.arc(px+16,62,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#aaaacc'; ctx.font='10px "Segoe UI", Arial, sans-serif'; ctx.fillText('HY · 在線',px+28,66);

    var dots=[' ·',' ··',' ···'][Math.floor(frame*2)%3];

    // ── S1: 人生儀表板 ──
    ctx.fillStyle='#55ee77aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif';
    ctx.fillText('🏃 人生儀表板',px+8,80);
    ctx.fillStyle='#55ee7733'; ctx.fillRect(px+8,85,pw-16,1);
    ctx.font='10px "Segoe UI", Arial, sans-serif';
    if (personalErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 資料載入失敗',px+10,102);
    } else if (!personalData) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,102);
    } else {
      var hd=personalData.health||{}, fi=personalData.finance||{};
      var gr=personalData.growth||{}, le=personalData.leisure||{};
      var rest=le.restaurant||{};
      var visited=Array.isArray(rest.this_quarter_visited)?rest.this_quarter_visited.length:(rest.this_quarter_visited||0);
      var exCount=Number(hd.this_week_exercise_count)||0;
      var exTarget=Number(hd.weekly_exercise_target)||3; if(exTarget>30)exTarget=3;
      ctx.fillStyle='#88ff88';
      ctx.fillText(trunc(ctx,'💪 本週運動 '+exCount+'/'+exTarget+' 次',mw),px+10,102);
      ctx.fillStyle='#ffdd88';
      var saved=fi.this_month_saved!=null&&fi.this_month_saved!==0?'$'+fi.this_month_saved:'待設定';
      ctx.fillText(trunc(ctx,'💰 本月儲蓄 '+saved,mw),px+10,116);
      ctx.fillStyle='#88ccff';
      ctx.fillText(trunc(ctx,'📚 '+( gr.current_focus||'未設定'),mw),px+10,130);
      ctx.fillStyle='#ffaa88';
      ctx.fillText(trunc(ctx,'🎉 本季餐廳 '+visited+'/'+(rest.quarterly_target||3)+' 家',mw),px+10,144);
    }

    // ── S2: 今日行程 ──
    ctx.fillStyle='#88ccffaa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif';
    ctx.fillText('📅 今日行程',px+8,200);
    ctx.fillStyle='#88ccff33'; ctx.fillRect(px+8,205,pw-16,1);
    ctx.font='10px "Segoe UI", Arial, sans-serif';
    if (scheduleErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 資料載入失敗',px+10,222);
    } else if (!scheduleData) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取行程中'+dots,px+10,222);
    } else {
      var evs=scheduleData.events||[];
      if (evs.length===0) {
        ctx.fillStyle='#555577'; ctx.fillText('今日無排程',px+10,222);
      } else {
        evs.slice(0,5).forEach(function(ev,i){
          ctx.fillStyle=ev.calendar==='google'?'#aaccff':'#ffcc88';
          ctx.fillText(trunc(ctx,ev.time+' '+ev.title,mw),px+10,222+i*14);
        });
        if (evs.length>5) { ctx.fillStyle='#666677'; ctx.fillText('還有 '+(evs.length-5)+' 項...',px+10,222+5*14); }
      }
    }

    // ── S3: 今日戰略 ──
    ctx.fillStyle='#ffaa44aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif';
    ctx.fillText('⚡ 今日戰略',px+8,320);
    ctx.fillStyle='#ffaa4433'; ctx.fillRect(px+8,325,pw-16,1);
    ctx.font='10px "Segoe UI", Arial, sans-serif';
    if (suggestionHqErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ AI 建議暫時無法生成',px+10,342);
    } else if (!suggestionHq) {
      ctx.fillStyle='#557799'; ctx.fillText('⚡ 分析中'+dots,px+10,342);
    } else {
      ctx.fillStyle='#ffcc88';
      var endY=drawTextBlock(ctx,suggestionHq,px+10,342,mw,12,4);
      ctx.fillStyle='#555544'; ctx.font='9px "Segoe UI", Arial, sans-serif'; ctx.textAlign='right';
      ctx.fillText('由 AI 即時生成',px+pw-6,Math.min(endY+2,406));
      ctx.textAlign='left'; ctx.font='11px "Segoe UI", Arial, sans-serif';
    }

    // ── 個人編輯按鈕 ──
    var btnX=px+8, btnY=413, btnW=pw-16, btnH=22;
    ctx.fillStyle=personalOpen?'#162a1e':'#0e1420';
    ctx.fillRect(btnX,btnY,btnW,btnH);
    ctx.strokeStyle=personalOpen?'#2a6644':'#2a4488';
    ctx.lineWidth=1; ctx.strokeRect(btnX+.5,btnY+.5,btnW-1,btnH-1);
    ctx.fillStyle=personalOpen?'#55cc88':'#77aaee';
    ctx.font='11px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText(personalOpen?'✕ 關閉編輯':'📝 開啟個人編輯',px+pw/2,btnY+15);
    ctx.textAlign='left';

    ctx.fillStyle='#0c1412'; ctx.fillRect(px,H-34,pw,34);
    ctx.fillStyle='#557766'; ctx.font='9px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('點擊 HY 對話',px+pw/2,H-14);
    ctx.textAlign='left';
  }

  var LINES=['一切都在計畫中！','需要跨域協調嗎？','今天的任務清單很長...','三個分身都在線！'];
  var hy=null, clickHandler=null;
  var personalData=null, personalErr=false;
  var scheduleData=null, scheduleErr=false;
  var suggestionHq=null, suggestionHqErr=false;
  var personalOpen=false;

  function openPersonal(){
    if (personalOpen) return;
    openDashboardModal('personal-dashboard.html?t='+Date.now(), function(){ personalOpen=false; });
    personalOpen=true;
  }
  function closePersonal(){
    closeDashboardModal();
    personalOpen=false;
  }

  return {
    init: function(worldData){
      console.log('[HQ] init called, worldData=', !!worldData);
      var cfg = worldData && worldData.characters.find(function(c){ return c.id==='hy'; });
      var ctX=96,ctY=FLOOR_Y-164,ctW=228;
      var cx=ctX+ctW/2, cy=ctY-4;
      hy = cfg ? new Character(cfg) : null;
      if (hy) { CharacterSprites.applyAll({hy:hy}); hy.setState('working'); }
      bubbles=[];
      personalData=null; personalErr=false;
      scheduleData=null; scheduleErr=false;
      suggestionHq=null; suggestionHqErr=false;
      console.log('[HQ] fetching panel data');
      API.personal()
        .then(function(d){ personalData=d; })
        .catch(function(){ personalErr=true; });
      API.todaySchedule()
        .then(function(d){ scheduleData=d; })
        .catch(function(){ scheduleErr=true; });
      API.suggestHq()
        .then(function(d){ suggestionHq=d.suggestion; })
        .catch(function(){ suggestionHqErr=true; });
      var canvas=BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler=function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        // personal edit button (canvas coords match drawPanel btn)
        var px2=PANEL_X+10, btnY=413, btnW=PANEL_W-20, btnH=22;
        if (mx>=px2&&mx<=px2+btnW&&my>=btnY&&my<=btnY+btnH){
          if (personalOpen) closePersonal(); else openPersonal();
          return;
        }
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
      closePersonal();
      bubbles=[];
    }
  };
})();
