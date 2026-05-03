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
    var SW = SCENE_W, FY = FLOOR_Y, MX = 240, MY = 210;

    // ══ 全畫布底色 ══
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, 680, H);

    // ══ 三個房間牆壁 ══
    // 主管室（左上）深藍灰
    ctx.fillStyle = '#2a3a50';
    ctx.fillRect(0, 0, MX, MY);
    // 主管室牆面細紋
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for (var wy = 0; wy < MY; wy += 16) ctx.fillRect(0, wy, MX, 8);

    // 實驗室（右上）冷灰白
    ctx.fillStyle = '#c8d0d8';
    ctx.fillRect(MX + 10, 0, SW - MX - 10, MY);
    // 實驗室牆面磁磚感
    ctx.strokeStyle = '#b8c0c8'; ctx.lineWidth = 0.5; ctx.beginPath();
    for (var wx2 = MX+10; wx2 <= SW; wx2 += 40) { ctx.moveTo(wx2,0); ctx.lineTo(wx2,MY); }
    for (var wy2 = 0; wy2 <= MY; wy2 += 40) { ctx.moveTo(MX+10,wy2); ctx.lineTo(SW,wy2); }
    ctx.stroke();

    // 會議室（下方全寬）深藍
    ctx.fillStyle = '#1e2c3c';
    ctx.fillRect(0, MY + 10, SW, FY - MY - 10);
    // 會議室牆面橫紋
    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    for (var wy3 = MY+10; wy3 < FY; wy3 += 12) ctx.fillRect(0, wy3, SW, 6);

    // ══ 地板 ══
    // 主管室地板（木質，深棕）
    for (var px = 0; px < MX; px += 32) {
      for (var py = FY; py < H; py += 16) {
        ctx.fillStyle = (Math.floor(px/32) + Math.floor((py-FY)/16)) % 2 === 0 ? '#6a4c2c' : '#5a3c1c';
        ctx.fillRect(px, py, 32, 16);
      }
    }
    ctx.strokeStyle = '#4a2c0c'; ctx.lineWidth = 0.5; ctx.beginPath();
    for (var px2 = 0; px2 <= MX; px2 += 32) { ctx.moveTo(px2+.5,FY); ctx.lineTo(px2+.5,H); }
    for (var py2 = FY; py2 <= H; py2 += 16) { ctx.moveTo(0,py2+.5); ctx.lineTo(MX,py2+.5); }
    ctx.stroke();

    // 實驗室地板（白磁磚）
    for (var lx = MX+10; lx < SW; lx += 28) {
      for (var ly = FY; ly < H; ly += 28) {
        var lc = Math.floor((lx-MX-10)/28), lr = Math.floor((ly-FY)/28);
        ctx.fillStyle = (lc+lr)%2===0 ? '#e8ecf0' : '#dce0e4';
        ctx.fillRect(lx, ly, 28, 28);
      }
    }
    ctx.strokeStyle = '#c8ccd0'; ctx.lineWidth = 0.5; ctx.beginPath();
    for (var lx2 = MX+10; lx2 <= SW; lx2 += 28) { ctx.moveTo(lx2+.5,FY); ctx.lineTo(lx2+.5,H); }
    for (var ly2 = FY; ly2 <= H; ly2 += 28) { ctx.moveTo(MX+10,ly2+.5); ctx.lineTo(SW,ly2+.5); }
    ctx.stroke();

    // 踢腳線
    ctx.fillStyle = '#1a2430'; ctx.fillRect(0,FY-7,SW,7);
    ctx.fillStyle = '#2a3440'; ctx.fillRect(0,FY-7,SW,2);

    // ══ 隔牆 ══
    // 垂直隔牆（x=240）
    ctx.fillStyle = '#1a2430'; ctx.fillRect(MX, 0, 10, MY);
    ctx.fillStyle = '#2a3a50'; ctx.fillRect(MX, 0, 3, MY);
    ctx.fillStyle = '#0e1820'; ctx.fillRect(MX+7, 0, 3, MY);
    // 垂直牆門洞（主管室→實驗室，y=60~120）
    ctx.fillStyle = '#2a3a50'; ctx.fillRect(MX, 60, 10, 60);
    ctx.fillStyle = '#0e1418'; ctx.fillRect(MX-2, 58, 14, 64);
    ctx.fillStyle = '#1e3048'; ctx.fillRect(MX, 60, 10, 60);
    ctx.fillStyle = '#2a4060'; ctx.fillRect(MX+1, 61, 5, 58);
    ctx.fillStyle = '#88aabb'; ctx.fillRect(MX+7, 86, 3, 8);

    // 水平隔牆（y=210）
    ctx.fillStyle = '#1a2430'; ctx.fillRect(0, MY, SW, 10);
    ctx.fillStyle = '#2a3a50'; ctx.fillRect(0, MY, SW, 3);
    ctx.fillStyle = '#0e1820'; ctx.fillRect(0, MY+7, SW, 3);
    // 水平牆門洞左（x=60~120）
    ctx.fillStyle = '#2a3a50'; ctx.fillRect(60, MY, 60, 10);
    ctx.fillStyle = '#0e1418'; ctx.fillRect(58, MY-2, 64, 14);
    ctx.fillStyle = '#243040'; ctx.fillRect(60, MY, 60, 10);
    ctx.fillStyle = '#2a3a4a'; ctx.fillRect(61, MY+1, 58, 5);
    ctx.fillStyle = '#88aabb'; ctx.fillRect(86, MY+7, 8, 3);
    // 水平牆門洞右（x=300~360）
    ctx.fillStyle = '#c8d0d8'; ctx.fillRect(300, MY, 60, 10);
    ctx.fillStyle = '#0e1418'; ctx.fillRect(298, MY-2, 64, 14);
    ctx.fillStyle = '#b8c8d0'; ctx.fillRect(300, MY, 60, 10);
    ctx.fillStyle = '#c8d4dc'; ctx.fillRect(301, MY+1, 58, 5);
    ctx.fillStyle = '#88aabb'; ctx.fillRect(326, MY+7, 8, 3);

    // ══ 窗戶工具 ══
    function win(wx3, wy3, ww, wh, cold) {
      ctx.fillStyle = '#0e1828'; ctx.fillRect(wx3-3,wy3-3,ww+6,wh+6);
      ctx.fillStyle = cold ? '#88aacc' : '#ffdd88';
      ctx.fillRect(wx3, wy3, ww, wh);
      ctx.fillStyle = cold ? 'rgba(180,220,255,0.5)' : 'rgba(255,240,160,0.5)';
      ctx.fillRect(wx3+1,wy3+1,Math.floor(ww/2)-1,Math.floor(wh*0.4));
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(wx3+Math.floor(ww/2)-1,wy3,2,wh);
      ctx.fillRect(wx3,wy3+Math.floor(wh/2),ww,2);
      ctx.fillStyle = '#1e2c40'; ctx.fillRect(wx3-4,wy3+wh+3,ww+8,5);
    }

    // 主管室窗（左上）
    win(16, 18, 50, 60, false);
    win(80, 18, 50, 60, false);
    // 實驗室窗（右上，工業格柵感）
    win(MX+20, 14, 44, 52, true);
    win(MX+80, 14, 44, 52, true);
    win(MX+150, 14, 44, 52, true);
    // 會議室無窗（後方大面積深色）

    // ══════════════════════════════════════
    // 主管室（x=0~240, y=0~210）
    // ══════════════════════════════════════

    // 主管室地毯（深藍圓角）
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(12,104,218,92);
    ctx.fillStyle = '#1e3a5a';
    ctx.beginPath(); ctx.roundRect(10,102,218,92,6); ctx.fill();
    ctx.fillStyle = '#16304e';
    ctx.beginPath(); ctx.roundRect(14,106,210,84,4); ctx.fill();
    ctx.strokeStyle = '#2a4a6a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(10,102,218,92,6); ctx.stroke();

    // 主管大桌（L型感，深木）
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(18,108,180,56);
    ctx.fillStyle = '#3c2810'; ctx.fillRect(16,106,182,56);
    ctx.fillStyle = '#5a3c1a'; ctx.fillRect(18,108,178,52);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(18,108,178,3);
    // 桌面木紋
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (var dg = 0; dg < 178; dg += 18) ctx.fillRect(18+dg,108,1,52);
    // 桌前立面
    ctx.fillStyle = '#2c1c08'; ctx.fillRect(16,158,182,6);
    ctx.strokeStyle = '#1e1006'; ctx.lineWidth = 1;
    ctx.strokeRect(16.5,106.5,181,57);
    // 桌腳
    ctx.fillStyle = '#1e1008';
    ctx.fillRect(18,164,8,14); ctx.fillRect(186,164,8,14);
    // 桌上：大螢幕
    ctx.fillStyle = '#0a0a18'; ctx.fillRect(70,108,80,52);
    ctx.fillStyle = '#0e1228'; ctx.fillRect(72,110,76,48);
    ctx.fillStyle = 'rgba(40,100,220,0.75)'; ctx.fillRect(74,112,72,44);
    ctx.fillStyle = 'rgba(100,180,255,0.2)'; ctx.fillRect(74,112,72,12);
    // 螢幕內容（數據感）
    ctx.fillStyle = 'rgba(0,255,128,0.5)';
    for (var si2 = 0; si2 < 6; si2++) ctx.fillRect(76,120+si2*5,20+si2*8,2);
    ctx.fillStyle = '#88ccff'; ctx.fillRect(120,130,20,8); ctx.fillRect(120,142,14,4);
    ctx.fillStyle = '#1a1c30'; ctx.fillRect(106,158,16,6); ctx.fillRect(100,164,28,4);
    // 桌上：文件堆
    ctx.fillStyle = '#e0dcc8'; ctx.fillRect(158,110,30,22);
    ctx.fillStyle = '#f0ece0'; ctx.fillRect(156,108,30,22);
    ctx.fillStyle = '#7788aa';
    for (var fi = 0; fi < 3; fi++) ctx.fillRect(158,112+fi*5,26,2);
    // 桌上：咖啡杯
    ctx.fillStyle = '#c8a070'; ctx.fillRect(22,112,12,16);
    ctx.fillStyle = '#8a6840'; ctx.fillRect(24,114,8,8);
    ctx.fillStyle = '#b08850'; ctx.fillRect(34,116,5,10);
    // 桌上：名牌
    ctx.fillStyle = '#c8a030'; ctx.fillRect(38,148,50,8);
    ctx.fillStyle = '#e8c040'; ctx.fillRect(39,149,48,6);
    ctx.fillStyle = '#1a1008'; ctx.font = '6px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('HY  所長', 63, 155);

    // 主管椅（後方，氣派）
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(88,92,52,20);
    ctx.fillStyle = '#1a2840'; ctx.fillRect(86,90,52,20);
    ctx.fillStyle = '#2a3a58'; ctx.fillRect(88,92,48,16);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(88,92,48,4);
    ctx.fillStyle = '#1e3050'; ctx.fillRect(88,106,48,24);
    ctx.fillStyle = '#283a60'; ctx.fillRect(90,108,44,20);
    // 椅輪
    ctx.fillStyle = '#0e1828';
    ctx.beginPath(); ctx.arc(100,130,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(124,130,4,0,Math.PI*2); ctx.fill();

    // 書架（後牆左）
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(5,22,58,72);
    ctx.fillStyle = '#2c1c0c'; ctx.fillRect(4,20,58,72);
    ctx.fillStyle = '#3c2c18'; ctx.fillRect(6,22,54,68);
    [20+20, 20+44].forEach(function(sy2) {
      ctx.fillStyle = '#2c1c0c'; ctx.fillRect(6, sy2, 54, 4);
    });
    var bkCols = ['#cc4444','#4488cc','#44aa44','#cc8822','#884acc','#44aacc','#cccc22'];
    [0,1,2].forEach(function(shelf) {
      var bx3 = 8;
      for (var bi2 = 0; bi2 < 5; bi2++) {
        var bw2 = 6+(bi2%2)*4;
        ctx.fillStyle = bkCols[(shelf*2+bi2)%bkCols.length];
        ctx.fillRect(bx3, 24+shelf*22, bw2, 18);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(bx3,24+shelf*22,1,18);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(bx3,24+shelf*22,bw2,2);
        bx3 += bw2+1;
      }
    });

    // 落地植物（主管室角落）
    function plant2(px3, py3, size) {
      ctx.fillStyle = '#8a4418'; ctx.fillRect(px3-Math.floor(size*0.35), py3, Math.floor(size*0.7), Math.floor(size*0.5));
      ctx.fillStyle = '#2a6018';
      ctx.beginPath(); ctx.arc(px3, py3-size*0.3, size*0.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#368020';
      ctx.beginPath(); ctx.arc(px3-size*0.25, py3-size*0.15, size*0.38, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#42a028';
      ctx.beginPath(); ctx.arc(px3+size*0.2, py3-size*0.2, size*0.32, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#50b830';
      ctx.beginPath(); ctx.arc(px3, py3-size*0.55, size*0.3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(100,200,50,0.2)';
      ctx.beginPath(); ctx.arc(px3-size*0.1, py3-size*0.5, size*0.15, 0, Math.PI*2); ctx.fill();
    }
    plant2(220, 178, 22);
    plant2(14, 168, 16);

    // 獎狀牆（右側）
    [[152,24],[152,60],[152,96]].forEach(function(p, i) {
      ctx.fillStyle = '#d4c890'; ctx.fillRect(p[0],p[1],56,30);
      ctx.fillStyle = '#e8dc9c'; ctx.fillRect(p[0]+1,p[1]+1,54,28);
      ctx.strokeStyle = '#a89040'; ctx.lineWidth=1.5; ctx.strokeRect(p[0]+.5,p[1]+.5,55,29);
      ctx.fillStyle = '#cc8820'; ctx.font='bold 6px Courier New'; ctx.textAlign='center';
      ctx.fillText(['研究卓越獎','優秀論文獎','技術創新獎'][i], p[0]+28, p[1]+18);
    });

    ctx.fillStyle = 'rgba(80,140,200,0.4)'; ctx.font='bold 8px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('主管室', MX/2, FY-62);

    // ══════════════════════════════════════
    // 實驗室（x=250~480, y=0~210）
    // ══════════════════════════════════════

    var LX2 = MX + 10;

    // 實驗室工作台（L型，靠後牆）
    // 後方長台
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(LX2+4,14,SW-LX2-8,72);
    ctx.fillStyle = '#d8dce0'; ctx.fillRect(LX2+4,12,SW-LX2-8,72);
    ctx.fillStyle = '#e8ecf0'; ctx.fillRect(LX2+6,14,SW-LX2-12,68);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(LX2+6,14,SW-LX2-12,4);
    // 台面前緣
    ctx.fillStyle = '#b8bcc0'; ctx.fillRect(LX2+4,80,SW-LX2-8,5);
    ctx.strokeStyle = '#a8acb0'; ctx.lineWidth=1; ctx.strokeRect(LX2+4.5,12.5,SW-LX2-9,70);

    // 儀器架（後台上，有LED閃爍）
    var instrW = 40, instrH = 52;
    [LX2+8, LX2+56, LX2+108, LX2+160].forEach(function(ix, ii) {
      ctx.fillStyle = '#1a1a2a'; ctx.fillRect(ix, 16, instrW, instrH);
      ctx.fillStyle = '#242438'; ctx.fillRect(ix+2, 18, instrW-4, instrH-4);
      ctx.strokeStyle = '#303050'; ctx.lineWidth=1; ctx.strokeRect(ix+.5,16.5,instrW-1,instrH-1);
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(ix+2,18,instrW-4,3);
      // LED 燈
      var ledC = ['#44ff44','#ff4444','#4488ff','#ffcc44'][ii%4];
      var ledOn = Math.sin(frame*4+ii*1.7) > 0;
      ctx.fillStyle = ledOn ? ledC : '#0a0a18';
      ctx.beginPath(); ctx.arc(ix+8, 26, 4, 0, Math.PI*2); ctx.fill();
      if (ledOn) {
        ctx.fillStyle = ledC+'44';
        ctx.beginPath(); ctx.arc(ix+8, 26, 8, 0, Math.PI*2); ctx.fill();
      }
      // LCD 顯示
      ctx.fillStyle = '#0a1e0a'; ctx.fillRect(ix+16,22,18,10);
      ctx.fillStyle = '#22cc22'; ctx.font='5px Courier New'; ctx.textAlign='center';
      ctx.fillText(((ii*37+Math.floor(frame*2))%100).toString(), ix+25, 30);
      // 旋鈕
      ctx.fillStyle = '#303050'; ctx.beginPath(); ctx.arc(ix+32,28,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#505080'; ctx.beginPath(); ctx.arc(ix+32,28,3,0,Math.PI*2); ctx.fill();
      // 埠孔
      ctx.fillStyle = '#0a0a1a';
      for (var pi2=0;pi2<3;pi2++) ctx.fillRect(ix+6+pi2*10,40,8,6);
      // 螺絲
      [[ix+5,20],[ix+5,60],[ix+instrW-5,20],[ix+instrW-5,60]].forEach(function(sc) {
        ctx.fillStyle='#404060';
        ctx.beginPath(); ctx.arc(sc[0],sc[1],2.5,0,Math.PI*2); ctx.fill();
      });
    });

    // 顯微鏡（左台）
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(LX2+8,92,34,68);
    ctx.fillStyle = '#c0c4c8'; ctx.fillRect(LX2+8,90,34,68);
    ctx.fillStyle = '#d0d4d8'; ctx.fillRect(LX2+10,92,30,64);
    // 顯微鏡本體
    ctx.fillStyle = '#484858'; ctx.fillRect(LX2+16,94,18,40);
    ctx.fillStyle = '#585868'; ctx.fillRect(LX2+18,96,14,36);
    ctx.fillStyle = '#606070'; ctx.fillRect(LX2+21,92,8,6); // 目鏡
    ctx.fillStyle = '#383848'; ctx.fillRect(LX2+21,130,8,16); // 鏡筒
    ctx.fillStyle = '#282838'; ctx.fillRect(LX2+14,144,22,6); // 載物台
    ctx.fillStyle = 'rgba(100,200,255,0.4)'; ctx.fillRect(LX2+19,138,12,8); // 標本（藍色發光）
    ctx.fillStyle = '#1a1a28'; ctx.fillRect(LX2+22,150,8,8); // 調焦旋鈕

    // 燒杯/試管架
    [LX2+52, LX2+70].forEach(function(bx4, bi3) {
      ctx.fillStyle = '#b0bcc8'; ctx.fillRect(bx4,96,14,48);
      ctx.fillStyle = '#c8d4e0'; ctx.fillRect(bx4+1,98,12,44);
      // 液體
      ctx.fillStyle = bi3===0 ? 'rgba(80,200,100,0.6)' : 'rgba(200,80,80,0.6)';
      ctx.fillRect(bx4+2,118,10,24);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(bx4+2,118,4,4);
    });

    // 電腦（實驗室）
    ctx.fillStyle = '#0a0a18'; ctx.fillRect(LX2+92,92,54,40);
    ctx.fillStyle = '#0e1230'; ctx.fillRect(LX2+94,94,50,36);
    ctx.fillStyle = 'rgba(60,180,220,0.7)'; ctx.fillRect(LX2+96,96,46,32);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(LX2+96,96,46,8);
    ctx.fillStyle = 'rgba(0,255,180,0.4)';
    for (var el=0; el<4; el++) ctx.fillRect(LX2+98,104+el*6,20+el*4,2);
    ctx.fillStyle = '#1a1c2e'; ctx.fillRect(LX2+112,130,14,6); ctx.fillRect(LX2+108,136,22,3);
    // 鍵盤
    ctx.fillStyle = '#181828'; ctx.fillRect(LX2+92,136,54,12);
    ctx.fillStyle = '#202030';
    for (var ki2=0; ki2<7; ki2++) ctx.fillRect(LX2+94+ki2*7,138,5,8);

    // 伺服器（右側高架）
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(LX2+160,86,70,118);
    ctx.fillStyle = '#141428'; ctx.fillRect(LX2+158,84,70,118);
    ctx.fillStyle = '#1e1e38'; ctx.fillRect(LX2+160,86,66,114);
    ctx.strokeStyle = '#2c2c4c'; ctx.lineWidth=1; ctx.strokeRect(LX2+158.5,84.5,69,117);
    for (var sb2=0; sb2<6; sb2++) {
      ctx.fillStyle='#161630'; ctx.fillRect(LX2+162,88+sb2*18,62,14);
      ctx.strokeStyle='#222244'; ctx.strokeRect(LX2+162,88+sb2*18,62,14);
      for (var bd2=0; bd2<4; bd2++) {
        ctx.fillStyle='#0c0c20'; ctx.fillRect(LX2+164+bd2*14,90+sb2*18,12,10);
      }
      var actOn2 = Math.sin(frame*6+sb2*2.1)>0.3;
      ctx.fillStyle = actOn2 ? '#44ff88' : '#0c1c0c';
      ctx.fillRect(LX2+216,90+sb2*18,6,6);
    }

    ctx.fillStyle = 'rgba(80,180,220,0.4)'; ctx.font='bold 8px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('實驗室', MX+10+(SW-MX-10)/2, FY-62);

    // ══════════════════════════════════════
    // 會議室（y=220~FLOOR_Y, 全寬）
    // ══════════════════════════════════════

    var CY = MY + 10;

    // 會議室地毯（深藍大圓角）
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(14,CY+8,452,168);
    ctx.fillStyle = '#1a2a3c';
    ctx.beginPath(); ctx.roundRect(12,CY+6,452,168,8); ctx.fill();
    ctx.fillStyle = '#162236';
    ctx.beginPath(); ctx.roundRect(16,CY+10,444,160,6); ctx.fill();
    ctx.strokeStyle = '#2a3a50'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(12,CY+6,452,168,8); ctx.stroke();

    // 橢圓會議桌（深木色，俯視）
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(54,CY+18,376,140);
    ctx.fillStyle = '#2c1c0c';
    ctx.beginPath(); ctx.ellipse(240,CY+86,194,72,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4a3018';
    ctx.beginPath(); ctx.ellipse(240,CY+84,190,68,0,0,Math.PI*2); ctx.fill();
    // 桌面木紋
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (var wg2=-180; wg2<=180; wg2+=18) {
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(240+wg2,CY+84-68,1,136);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.ellipse(240,CY+84,190,68,0,0,Math.PI*2); ctx.stroke();
    // 桌面高光
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.ellipse(200,CY+70,80,22,0,0,Math.PI*2); ctx.fill();
    // 桌上投影機
    ctx.fillStyle = '#c8c8b0'; ctx.fillRect(220,CY+74,40,22);
    ctx.fillStyle = '#d8d8c0'; ctx.fillRect(222,CY+76,36,18);
    ctx.fillStyle = '#1a1818'; ctx.fillRect(222,CY+78,16,12);
    ctx.fillStyle = 'rgba(80,80,220,0.5)'; ctx.fillRect(224,CY+80,12,8);
    ctx.fillStyle = '#888880'; ctx.fillRect(238,CY+82,6,8);
    // 桌上：水杯（多個）
    [100,160,220,280,340,380].forEach(function(bx5){
      if (bx5 > 50 && bx5 < 430) {
        ctx.fillStyle = 'rgba(180,220,240,0.6)'; ctx.fillRect(bx5+40,CY+80,8,10);
        ctx.fillStyle = 'rgba(220,240,255,0.4)'; ctx.fillRect(bx5+40,CY+80,8,3);
      }
    });
    // 桌上：文件
    [[80,CY+72],[160,CY+72],[320,CY+90],[400,CY+80]].forEach(function(p2){
      ctx.fillStyle='#e0dcc8'; ctx.fillRect(p2[0],p2[1],20,14);
      ctx.fillStyle='#f0ece0'; ctx.fillRect(p2[0]+1,p2[1]-1,20,14);
      ctx.fillStyle='#8899aa';
      ctx.fillRect(p2[0]+2,p2[1]+2,16,2); ctx.fillRect(p2[0]+2,p2[1]+6,12,2);
    });

    // 會議椅（環繞橢圓桌）
    function confChair(cx3, cy3, rot) {
      ctx.save(); ctx.translate(cx3,cy3); ctx.rotate(rot);
      ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(-14,6,28,5);
      ctx.fillStyle='#2a3a50'; ctx.fillRect(-14,-6,28,20);
      ctx.fillStyle='#3a4a62'; ctx.fillRect(-12,-4,24,16);
      ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(-12,-4,24,4);
      ctx.fillStyle='#2a3a50'; ctx.fillRect(-12,-18,24,14);
      ctx.fillStyle='#3a4a62'; ctx.fillRect(-10,-16,20,10);
      ctx.restore();
    }
    // 上排椅
    [80,140,200,260,320,380,420].forEach(function(cx4,i4){
      if (Math.abs(cx4-240)<185) confChair(cx4, CY+10, 0);
    });
    // 下排椅
    [80,140,200,260,320,380,420].forEach(function(cx5,i5){
      if (Math.abs(cx5-240)<185) confChair(cx5, CY+162, Math.PI);
    });
    // 左右端椅
    confChair(42, CY+84, Math.PI/2);
    confChair(438, CY+84, -Math.PI/2);

    // 投影螢幕（後牆）
    ctx.fillStyle = '#0a0e14'; ctx.fillRect(140,CY-2,200,10);
    ctx.fillStyle = '#e8ecf0'; ctx.fillRect(142,CY-1,196,8);
    ctx.fillStyle = 'rgba(60,100,220,0.3)'; ctx.fillRect(144,CY,192,6);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(144,CY,192,2);

    // 會議室白板（右牆）
    ctx.fillStyle = '#c8ccd0'; ctx.fillRect(430,CY+14,46,140);
    ctx.fillStyle = '#e8ecf0'; ctx.fillRect(432,CY+16,42,136);
    ctx.strokeStyle = '#aab0b8'; ctx.lineWidth=1; ctx.strokeRect(431.5,CY+14.5,45,139);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(432,CY+16,42,10);
    // 白板上字跡
    ctx.strokeStyle = '#4466cc'; ctx.lineWidth=1.5;
    [[434,CY+36,468,CY+36],[434,CY+46,458,CY+46],[434,CY+56,464,CY+56]].forEach(function(l){
      ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke();
    });
    ctx.strokeStyle = '#cc3344';
    ctx.beginPath(); ctx.moveTo(436,CY+70); ctx.lineTo(464,CY+90);
    ctx.moveTo(464,CY+70); ctx.lineTo(436,CY+90); ctx.stroke();
    // 白板筆托盤
    ctx.fillStyle = '#a0a8b0'; ctx.fillRect(431,CY+152,46,6);
    [[435,'#cc4444'],[441,'#4488cc'],[447,'#44aa44']].forEach(function(p3){
      ctx.fillStyle=p3[1]; ctx.fillRect(p3[0],CY+153,4,4);
    });

    ctx.fillStyle = 'rgba(100,160,220,0.4)'; ctx.font='bold 8px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('會議室', SW/2, FY-62);

    ctx.textAlign = 'left';

    // ══ 面板分隔線 ══
    ctx.fillStyle = '#05050f'; ctx.fillRect(PANEL_X, 0, 2, H);
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
    // right:29.41% = 200/680×100%, aligns right edge with PANEL_X at any canvas scale
    // top:0 left:0 bottom:0 → fills scene height, flush with scene boundary
    var wrap=document.createElement('div');
    wrap.style.cssText='position:absolute;top:0;left:0;right:29.41%;bottom:0;overflow-x:auto;overflow-y:auto;box-sizing:border-box;border:2px solid #5599ff;z-index:7';
    dashFrame=document.createElement('iframe');
    dashFrame.src='https://telegram-bot-t82n.onrender.com/dashboard';
    // 1600×1600 internal; zoom:0.55 → 880×880 layout (covers 2× scene at 960×960)
    dashFrame.style.cssText='width:1600px;height:1600px;border:none;background:#050514;zoom:0.55;display:block';
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
