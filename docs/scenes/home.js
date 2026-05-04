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
    var SW = SCENE_W, FY = FLOOR_Y, MX = 240, MY = 230;

    // ══ 全畫布底色 ══
    ctx.fillStyle = '#12090a';
    ctx.fillRect(0, 0, 680, H);

    // ══ 四個房間牆壁 ══
    // 書房（左上）奶油色
    ctx.fillStyle = '#d8c8a8';
    ctx.fillRect(0, 0, MX, MY);
    // 客廳（右上）溫暖米色
    ctx.fillStyle = '#ddd2b0';
    ctx.fillRect(MX + 10, 0, SW - MX - 10, MY);
    // 廚房（左下）稍黃
    ctx.fillStyle = '#ddd0a0';
    ctx.fillRect(0, MY + 10, MX, FY - MY - 10);
    // 臥室（右下）淡藍
    ctx.fillStyle = '#d0d8e8';
    ctx.fillRect(MX + 10, MY + 10, SW - MX - 10, FY - MY - 10);

    // 牆面細橫紋（質感）
    ctx.fillStyle = 'rgba(0,0,0,0.022)';
    for (var wy = 0; wy < FY; wy += 14) ctx.fillRect(0, wy, SW, 7);

    // 下牆板（地板上方）
    ctx.fillStyle = '#c4b088';
    ctx.fillRect(0, FY - 55, SW, 50);
    ctx.fillStyle = '#d8c49a';
    ctx.fillRect(0, FY - 57, SW, 3);
    ctx.fillStyle = '#a89060';
    ctx.fillRect(0, FY - 7, SW, 3);

    // ══ 地板（大格磁磚 32px） ══
    for (var tx = 0; tx < SW; tx += 32) {
      for (var ty = FY; ty < H; ty += 32) {
        var col = Math.floor(tx / 32), row = Math.floor((ty - FY) / 32);
        ctx.fillStyle = (col + row) % 2 === 0 ? '#ece4cc' : '#ddd0b0';
        ctx.fillRect(tx, ty, 32, 32);
      }
    }
    ctx.strokeStyle = '#ccc0a0'; ctx.lineWidth = 1; ctx.beginPath();
    for (var tx2 = 0; tx2 <= SW; tx2 += 32) { ctx.moveTo(tx2+.5,FY); ctx.lineTo(tx2+.5,H); }
    for (var ty2 = FY; ty2 <= H; ty2 += 32) { ctx.moveTo(0,ty2+.5); ctx.lineTo(SW,ty2+.5); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, FY, SW, 4);

    // 踢腳線
    ctx.fillStyle = '#b09870'; ctx.fillRect(0, FY-7, SW, 7);
    ctx.fillStyle = '#c8ac84'; ctx.fillRect(0, FY-7, SW, 2);

    // ══ 隔牆（垂直 + 水平） ══
    // 垂直隔牆（左右分界 x=240）
    ctx.fillStyle = '#5a3418'; ctx.fillRect(MX, 0, 10, FY);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(MX, 0, 3, FY);
    ctx.fillStyle = '#3a2008'; ctx.fillRect(MX+7, 0, 3, FY);
    // 垂直隔牆門洞（上下各一）
    ctx.fillStyle = '#d8c8a8'; ctx.fillRect(MX, 55, 10, 50);
    ctx.fillStyle = '#2a1408'; ctx.fillRect(MX-2, 53, 14, 54);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(MX, 55, 10, 50);
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(MX+1, 56, 5, 48);
    ctx.fillStyle = '#c8a870'; ctx.fillRect(MX+7, 72, 3, 6);

    ctx.fillStyle = '#ddd0a0'; ctx.fillRect(MX, MY+55, 10, 50);
    ctx.fillStyle = '#2a1408'; ctx.fillRect(MX-2, MY+53, 14, 54);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(MX, MY+55, 10, 50);
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(MX+1, MY+56, 5, 48);
    ctx.fillStyle = '#c8a870'; ctx.fillRect(MX+7, MY+72, 3, 6);

    // 水平隔牆（上下分界 y=230）
    ctx.fillStyle = '#5a3418'; ctx.fillRect(0, MY, SW, 10);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(0, MY, SW, 3);
    ctx.fillStyle = '#3a2008'; ctx.fillRect(0, MY+7, SW, 3);
    // 水平隔牆門洞（左右各一）
    ctx.fillStyle = '#d8c8a8'; ctx.fillRect(55, MY, 50, 10);
    ctx.fillStyle = '#2a1408'; ctx.fillRect(53, MY-2, 54, 14);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(55, MY, 50, 10);
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(56, MY+1, 48, 5);
    ctx.fillStyle = '#c8a870'; ctx.fillRect(72, MY+7, 6, 3);

    ctx.fillStyle = '#ddd2b0'; ctx.fillRect(MX+65, MY, 50, 10);
    ctx.fillStyle = '#2a1408'; ctx.fillRect(MX+63, MY-2, 54, 14);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(MX+65, MY, 50, 10);
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(MX+66, MY+1, 48, 5);
    ctx.fillStyle = '#c8a870'; ctx.fillRect(MX+82, MY+7, 6, 3);

    // ══ 窗戶工具 ══
    function win(wx, wy, ww, wh, warm) {
      ctx.fillStyle = '#3a2c18'; ctx.fillRect(wx-3,wy-3,ww+6,wh+6);
      ctx.fillStyle = warm ? '#ffdd88' : '#a8c8e8';
      ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = warm ? 'rgba(255,240,160,0.5)' : 'rgba(200,230,255,0.5)';
      ctx.fillRect(wx+1, wy+1, Math.floor(ww/2)-1, Math.floor(wh*0.4));
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(wx+Math.floor(ww/2)-1, wy, 2, wh);
      ctx.fillRect(wx, wy+Math.floor(wh/2), ww, 2);
      // 窗台
      ctx.fillStyle = '#c8b080'; ctx.fillRect(wx-4, wy+wh+3, ww+8, 5);
      ctx.fillStyle = '#d8c090'; ctx.fillRect(wx-4, wy+wh+3, ww+8, 2);
    }

    // 書房窗（左上）
    win(18, 20, 44, 56, true);
    win(74, 20, 44, 56, true);
    // 客廳窗（右上）
    win(MX+20, 20, 44, 56, true);
    win(MX+80, 20, 44, 56, true);
    // 廚房窗（左下）
    win(18, MY+18, 36, 44, true);
    // 臥室窗（右下）
    win(MX+16, MY+18, 40, 50, false);
    win(MX+78, MY+18, 40, 50, false);

    // ══ 植物工具 ══
    function plant(px, py, size, dark) {
      var d = dark || false;
      // 盆
      ctx.fillStyle = d ? '#7a3a18' : '#aa5522';
      ctx.fillRect(px-Math.floor(size*0.4), py, Math.floor(size*0.8), Math.floor(size*0.6));
      ctx.fillStyle = d ? '#5a2a10' : '#8a3a14';
      ctx.fillRect(px-Math.floor(size*0.35), py+Math.floor(size*0.55), Math.floor(size*0.7), Math.floor(size*0.12));
      // 土
      ctx.fillStyle = '#3a2208'; ctx.fillRect(px-Math.floor(size*0.38), py+2, Math.floor(size*0.76), Math.floor(size*0.25));
      // 葉冠層
      var leaves = [
        {dx:-size*0.3, dy:-size*0.55, r:size*0.42, c:'#2a7018'},
        {dx: size*0.25,dy:-size*0.50, r:size*0.36, c:'#308020'},
        {dx:-size*0.1, dy:-size*0.70, r:size*0.45, c:'#38902a'},
        {dx: size*0.1, dy:-size*0.45, r:size*0.32, c:'#42a030'},
        {dx:-size*0.05,dy:-size*0.85, r:size*0.38, c:'#4ab038'},
      ];
      leaves.forEach(function(l) {
        ctx.fillStyle = l.c;
        ctx.beginPath(); ctx.arc(px+l.dx, py+l.dy, l.r, 0, Math.PI*2); ctx.fill();
      });
      // 高光
      ctx.fillStyle = 'rgba(120,220,60,0.2)';
      ctx.beginPath(); ctx.arc(px-size*0.15, py-size*0.75, size*0.18, 0, Math.PI*2); ctx.fill();
    }

    // ══ 陰影工具 ══
    function shadow(sx, sy, sw2, sh2) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(sx+3, sy+4, sw2, sh2);
    }

    // ══════════════════════════════════════
    // 書房（左上，x=0~240, y=0~230）
    // ══════════════════════════════════════

    // 書房地毯
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(14,148,118,68);
    ctx.fillStyle = '#8a6840';
    ctx.beginPath(); ctx.roundRect(12, 146, 118, 68, 5); ctx.fill();
    ctx.fillStyle = '#7a5830';
    ctx.beginPath(); ctx.roundRect(16, 150, 110, 60, 3); ctx.fill();
    // 地毯邊框
    ctx.strokeStyle = '#9a7850'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(12, 146, 118, 68, 5); ctx.stroke();

    // 書架（左側，正面視角）
    shadow(4, 28, 52, 108);
    ctx.fillStyle = '#5a3418'; ctx.fillRect(4, 28, 52, 108);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(6, 30, 48, 104);
    // 隔板
    [28+30, 28+60, 28+90].forEach(function(sy) {
      ctx.fillStyle = '#5a3418'; ctx.fillRect(6, sy, 48, 4);
    });
    // 書本
    var bookCols = ['#cc4444','#4466cc','#44aa44','#cc8822','#884acc','#44aabb','#cccc22','#cc4488'];
    [0,1,2].forEach(function(shelf) {
      var bx = 8;
      for (var bi = 0; bi < 6; bi++) {
        var bw2 = 5 + (bi%2)*3;
        ctx.fillStyle = bookCols[(shelf*3+bi)%bookCols.length];
        ctx.fillRect(bx, 30+shelf*30+4, bw2, 24);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(bx, 30+shelf*30+4, 1, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(bx, 30+shelf*30+4, bw2, 2);
        bx += bw2 + 1;
      }
    });
    // 書架頂裝飾
    ctx.fillStyle = '#6a3c1c'; ctx.fillRect(4, 24, 52, 6);
    ctx.fillStyle = '#8a5228'; ctx.fillRect(4, 24, 52, 2);

    // 書桌（俯視，深木色）
    shadow(62, 148, 90, 46);
    ctx.fillStyle = '#5a3820'; ctx.fillRect(62, 148, 90, 46);
    ctx.fillStyle = '#7a5030'; ctx.fillRect(64, 150, 86, 42);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(64, 150, 86, 3);
    // 桌腳
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(64,192,6,12); ctx.fillRect(144,192,6,12);
    ctx.fillRect(64,192,6,3); // 腳陰影
    // 桌上：電腦螢幕
    ctx.fillStyle = '#1a1828'; ctx.fillRect(88, 152, 36, 26);
    ctx.fillStyle = '#1e2848'; ctx.fillRect(90, 154, 32, 22);
    ctx.fillStyle = 'rgba(80,120,220,0.7)'; ctx.fillRect(91, 155, 30, 20);
    ctx.fillStyle = 'rgba(200,220,255,0.25)'; ctx.fillRect(91, 155, 30, 6);
    ctx.fillStyle = '#252040'; ctx.fillRect(103, 178, 10, 5); ctx.fillRect(99,183,18,3);
    // 桌上：小台燈
    ctx.fillStyle = '#c89830'; ctx.fillRect(68, 158, 14, 10);
    ctx.fillStyle = '#e0b040'; ctx.fillRect(68, 158, 14, 3);
    ctx.fillStyle = '#8a6818'; ctx.fillRect(74, 168, 2, 14);
    ctx.fillStyle = '#6a4810'; ctx.fillRect(70, 182, 10, 4);
    ctx.fillStyle = 'rgba(255,220,100,0.2)';
    ctx.beginPath(); ctx.ellipse(75, 168, 18, 12, 0, 0, Math.PI*2); ctx.fill();
    // 桌上：咖啡杯
    ctx.fillStyle = '#7a4820'; ctx.fillRect(142, 160, 10, 12);
    ctx.fillStyle = '#4a2c10'; ctx.fillRect(144, 162, 6, 6);
    ctx.fillStyle = '#9a6030'; ctx.fillRect(152, 163, 4, 7);
    // 桌上：文件
    ctx.fillStyle = '#e8e4d4'; ctx.fillRect(112, 168, 22, 16);
    ctx.fillStyle = '#f0ecd8'; ctx.fillRect(111, 167, 22, 16);
    ctx.fillStyle = '#8899aa';
    for (var li = 0; li < 3; li++) ctx.fillRect(113, 170+li*4, 18, 1);

    // 書房植物（書架旁）
    plant(44, 138, 18, true);
    // 書房植物（角落）
    plant(18, 125, 14, false);

    // 書房貓咪（地毯上睡覺）
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(25, 188, 38, 18);
    ctx.fillStyle = '#d4c4b0';
    ctx.beginPath(); ctx.ellipse(42, 194, 18, 11, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c4b4a0';
    ctx.beginPath(); ctx.ellipse(36, 192, 10, 8, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2a2018'; // 耳朵
    ctx.beginPath(); ctx.moveTo(36,184); ctx.lineTo(33,178); ctx.lineTo(40,182); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(48,183); ctx.lineTo(52,178); ctx.lineTo(54,184); ctx.closePath(); ctx.fill();

    // 書房標籤
    ctx.fillStyle='rgba(80,50,20,0.5)'; ctx.font='bold 8px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('書房', 60, 222);

    // ══════════════════════════════════════
    // 客廳（右上，x=250~480, y=0~230）
    // ══════════════════════════════════════

    var LX = MX + 10; // 客廳起始 x

    // 客廳地毯（米色圓角）
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(LX+12, 122, 206, 88);
    ctx.fillStyle = '#e8dcc4';
    ctx.beginPath(); ctx.roundRect(LX+10, 120, 206, 88, 6); ctx.fill();
    ctx.fillStyle = '#ddd0b8';
    ctx.beginPath(); ctx.roundRect(LX+14, 124, 198, 80, 4); ctx.fill();
    ctx.strokeStyle = '#ccc0a8'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(LX+10, 120, 206, 88, 6); ctx.stroke();

    // 沙發（俯視，米色L型感）
    // 沙發背板
    shadow(LX+10, 118, 200, 22);
    ctx.fillStyle = '#8a7050'; ctx.fillRect(LX+10, 118, 200, 24);
    ctx.fillStyle = '#b89870'; ctx.fillRect(LX+12, 119, 196, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(LX+12, 119, 196, 4);
    // 座墊（三個）
    for (var ci = 0; ci < 3; ci++) {
      ctx.fillStyle = '#c8b888'; ctx.fillRect(LX+14+ci*64, 140, 60, 44);
      ctx.fillStyle = '#d8c898'; ctx.fillRect(LX+16+ci*64, 142, 56, 40);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(LX+16+ci*64, 142, 56, 6);
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(LX+14+ci*64, 182, 60, 2);
      // 座墊縫線
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(LX+74+ci*64, 140, 2, 44);
    }
    // 左扶手
    ctx.fillStyle = '#8a7050'; ctx.fillRect(LX+10, 140, 14, 44);
    ctx.fillStyle = '#9a8060'; ctx.fillRect(LX+10, 140, 14, 6);
    // 右扶手
    ctx.fillStyle = '#8a7050'; ctx.fillRect(LX+196, 140, 14, 44);
    ctx.fillStyle = '#9a8060'; ctx.fillRect(LX+196, 140, 14, 6);
    // 沙發腳
    ctx.fillStyle = '#5a3818';
    ctx.fillRect(LX+12, 184, 6, 8); ctx.fillRect(LX+200, 184, 6, 8);

    // 茶几（中央，俯視）
    shadow(LX+74, 155, 72, 40);
    ctx.fillStyle = '#6a4828'; ctx.fillRect(LX+74, 155, 72, 40);
    ctx.fillStyle = '#8a6038'; ctx.fillRect(LX+76, 157, 68, 36);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(LX+76, 157, 68, 3);
    ctx.strokeStyle = '#4a2c14'; ctx.lineWidth=1;
    ctx.strokeRect(LX+74.5, 155.5, 71, 39);
    // 茶几腳
    ctx.fillStyle = '#3a1c08';
    ctx.fillRect(LX+76,195,5,8); ctx.fillRect(LX+141,195,5,8);
    // 茶几上：咖啡機
    ctx.fillStyle = '#2a2828'; ctx.fillRect(LX+90, 158, 24, 20);
    ctx.fillStyle = '#383838'; ctx.fillRect(LX+92, 160, 20, 16);
    ctx.fillStyle = '#cc6622'; ctx.fillRect(LX+98, 162, 8, 6);
    ctx.fillStyle = '#1a1818'; ctx.fillRect(LX+100, 168, 4, 4);
    // 茶几上：杯子
    ctx.fillStyle = '#e8e4dc'; ctx.fillRect(LX+118, 162, 8, 8);
    ctx.fillStyle = '#d0ccc4'; ctx.fillRect(LX+119, 163, 6, 6);
    ctx.fillStyle = '#aa7744'; ctx.fillRect(LX+118, 163, 8, 2);
    // 茶几上：小盆栽
    ctx.fillStyle = '#aa5522'; ctx.fillRect(LX+130, 160, 8, 8);
    ctx.fillStyle = '#2a6018';
    ctx.beginPath(); ctx.arc(LX+134, 158, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#38801e';
    ctx.beginPath(); ctx.arc(LX+131, 156, 5, 0, Math.PI*2); ctx.fill();

    // 單人沙發/椅（右側）
    shadow(LX+162, 118, 44, 44);
    ctx.fillStyle = '#b8a888'; ctx.fillRect(LX+162, 118, 44, 44);
    ctx.fillStyle = '#ccc0a0'; ctx.fillRect(LX+164, 120, 40, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(LX+164, 120, 40, 5);
    // 椅墊
    ctx.fillStyle = '#8a7a5a'; ctx.fillRect(LX+164, 120, 12, 40); // 左扶手
    ctx.fillStyle = '#8a7a5a'; ctx.fillRect(LX+196, 120, 10, 40); // 右扶手
    ctx.fillStyle = '#b8aa88'; ctx.fillRect(LX+164, 118, 42, 10); // 背板
    // 枕頭
    ctx.fillStyle = '#7a6848'; ctx.fillRect(LX+172, 124, 22, 18);
    ctx.fillStyle = '#8a7858'; ctx.fillRect(LX+174, 126, 18, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(LX+174, 126, 18, 3);

    // 小邊桌（沙發右）
    shadow(LX+164, 168, 36, 26);
    ctx.fillStyle = '#7a5028'; ctx.fillRect(LX+164, 168, 36, 26);
    ctx.fillStyle = '#9a6838'; ctx.fillRect(LX+166, 170, 32, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(LX+166, 170, 32, 2);
    // 桌上小燈
    ctx.fillStyle = '#d4a840'; ctx.fillRect(LX+173, 165, 16, 10);
    ctx.fillStyle = '#e8c050'; ctx.fillRect(LX+173, 165, 16, 3);
    ctx.fillStyle = '#9a7828'; ctx.fillRect(LX+180, 175, 2, 10);
    ctx.fillStyle = 'rgba(255,220,100,0.18)';
    ctx.beginPath(); ctx.ellipse(LX+181, 170, 14, 10, 0, 0, Math.PI*2); ctx.fill();

    // 客廳植物（角落）
    plant(LX+18, 108, 20, false);
    plant(LX+186, 52, 16, true);

    // 客廳書架（後牆）
    shadow(LX+24, 24, 120, 78);
    ctx.fillStyle = '#5a3418'; ctx.fillRect(LX+24, 24, 120, 78);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(LX+26, 26, 116, 74);
    [24+24, 24+48].forEach(function(dy) {
      ctx.fillStyle = '#5a3418'; ctx.fillRect(LX+26, dy, 116, 4);
    });
    bookCols.forEach(function(c, i) {
      var shelf = Math.floor(i/4);
      var bx2 = LX+28+(i%4)*28;
      ctx.fillStyle = c; ctx.fillRect(bx2, 28+shelf*24, 24, 20);
      ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(bx2,28+shelf*24,1,20);
      ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.fillRect(bx2,28+shelf*24,24,2);
    });

    // 客廳標籤
    ctx.fillStyle='rgba(80,60,20,0.5)'; ctx.font='bold 8px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('客廳', LX+110, 222);

    // ══════════════════════════════════════
    // 廚房（左下，x=0~240, y=240~FLOOR_Y）
    // ══════════════════════════════════════

    var KY = MY + 10;

    // 廚房磁磚地板（不同底色）
    for (var ktx = 0; ktx < MX; ktx += 24) {
      for (var kty = KY; kty < FY - 55; kty += 24) {
        var kc = Math.floor(ktx/24), kr = Math.floor((kty-KY)/24);
        ctx.fillStyle = (kc+kr)%2===0 ? '#f0ece0' : '#e0dcc8';
        ctx.fillRect(ktx, kty, 24, 24);
      }
    }
    ctx.strokeStyle='#d0ccb8'; ctx.lineWidth=1; ctx.beginPath();
    for (var ktx2=0; ktx2<=MX; ktx2+=24){ ctx.moveTo(ktx2+.5,KY); ctx.lineTo(ktx2+.5,FY-55); }
    for (var kty2=KY; kty2<=FY-55; kty2+=24){ ctx.moveTo(0,kty2+.5); ctx.lineTo(MX,kty2+.5); }
    ctx.stroke();

    // 廚房上方吊櫃
    shadow(4, KY+4, 228, 56);
    ctx.fillStyle = '#3a2810'; ctx.fillRect(4, KY+4, 228, 56);
    ctx.fillStyle = '#5a4020'; ctx.fillRect(6, KY+6, 224, 52);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(6, KY+6, 224, 4);
    [6+52, 6+108, 6+164].forEach(function(cx2) {
      ctx.fillStyle='#3a2810'; ctx.fillRect(cx2, KY+6, 4, 52);
    });
    // 吊櫃把手
    [[28,KY+30],[84,KY+30],[140,KY+30],[196,KY+30]].forEach(function(p) {
      ctx.fillStyle='#c8a040'; ctx.fillRect(p[0],p[1],18,4);
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(p[0],p[1],18,1);
    });

    // 廚房工作台
    shadow(4, KY+68, 228, 72);
    ctx.fillStyle = '#4a3418'; ctx.fillRect(4, KY+68, 228, 72);
    ctx.fillStyle = '#6a4c28'; ctx.fillRect(6, KY+70, 224, 68);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(6, KY+70, 224, 3);
    ctx.strokeStyle='#3a2208'; ctx.lineWidth=1;
    ctx.strokeRect(5.5,KY+68.5,227,71);
    // 台面前緣
    ctx.fillStyle='#3a2208'; ctx.fillRect(4,KY+136,228,6);
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(4,KY+140,228,3);

    // 水槽
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(12,KY+72,80,56);
    ctx.fillStyle='#c8d4d8'; ctx.fillRect(14,KY+74,76,52);
    ctx.fillStyle='#b8c8cc'; ctx.fillRect(16,KY+76,72,48);
    ctx.strokeStyle='#a0b8bc'; ctx.lineWidth=1; ctx.strokeRect(14,KY+74,76,52);
    // 排水孔
    ctx.fillStyle='#889aa0'; ctx.beginPath(); ctx.arc(52,KY+116,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#6a8088'; ctx.beginPath(); ctx.arc(52,KY+116,3,0,Math.PI*2); ctx.fill();
    // 水龍頭
    ctx.fillStyle='#a0b4b8'; ctx.fillRect(46,KY+66,12,10);
    ctx.fillStyle='#b8cccc'; ctx.fillRect(38,KY+68,28,5);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(46,KY+66,3,10);

    // 瓦斯爐
    ctx.fillStyle='#2a2828'; ctx.fillRect(102,KY+76,80,56);
    ctx.fillStyle='#383838'; ctx.fillRect(104,KY+78,76,52);
    // 爐眼
    [[128,KY+92],[164,KY+92],[128,KY+116],[164,KY+116]].forEach(function(p){
      ctx.fillStyle='#1a1818'; ctx.beginPath(); ctx.arc(p[0],p[1],10,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#484848'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(p[0],p[1],10,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#282828'; ctx.beginPath(); ctx.arc(p[0],p[1],4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3a3838'; ctx.beginPath(); ctx.arc(p[0],p[1],1.5,0,Math.PI*2); ctx.fill();
    });

    // 冰箱
    shadow(188,KY+68,38,70);
    ctx.fillStyle='#d0d8dc'; ctx.fillRect(188,KY+68,38,70);
    ctx.fillStyle='#e0e8ec'; ctx.fillRect(190,KY+70,34,66);
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(190,KY+70,34,6);
    ctx.fillStyle='#b0b8bc'; ctx.fillRect(190,KY+100,34,2);
    ctx.fillStyle='#8899a0'; ctx.fillRect(220,KY+84,4,12); ctx.fillRect(220,KY+108,4,12);

    // 廚房植物（角落）
    plant(18, KY+152, 14, false);

    // 廚房標籤
    ctx.fillStyle='rgba(60,40,10,0.5)'; ctx.font='bold 8px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('廚房', 60, FY-62);

    // ══════════════════════════════════════
    // 臥室（右下，x=250~480, y=240~FLOOR_Y）
    // ══════════════════════════════════════

    var BX = MX+10, BY = MY+10;

    // 臥室地毯（床邊，淡藍）
    ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(BX+8,BY+82,216,110);
    ctx.fillStyle='#c8d4e8';
    ctx.beginPath(); ctx.roundRect(BX+6,BY+80,216,110,6); ctx.fill();
    ctx.fillStyle='#b8c4d8';
    ctx.beginPath(); ctx.roundRect(BX+10,BY+84,208,102,4); ctx.fill();
    ctx.strokeStyle='#a8b8cc'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(BX+6,BY+80,216,110,6); ctx.stroke();

    // 床（俯視，大雙人床）
    shadow(BX+18,BY+78,194,100);
    // 床框
    ctx.fillStyle='#5a3820'; ctx.fillRect(BX+18,BY+78,194,100);
    ctx.fillStyle='#7a5030'; ctx.fillRect(BX+20,BY+80,190,96);
    // 床頭板
    ctx.fillStyle='#6a4020'; ctx.fillRect(BX+20,BY+80,190,20);
    ctx.fillStyle='#8a5830'; ctx.fillRect(BX+22,BY+82,186,16);
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(BX+22,BY+82,186,3);
    // 床墊（白色）
    ctx.fillStyle='#f0ede5'; ctx.fillRect(BX+22,BY+100,186,74);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillRect(BX+22,BY+100,186,5);
    // 被子（淡藍）
    ctx.fillStyle='#c8d8ec'; ctx.fillRect(BX+22,BY+110,186,60);
    ctx.fillStyle='#d8e8f8'; ctx.fillRect(BX+22,BY+110,186,8);
    ctx.fillStyle='rgba(0,0,0,0.05)';
    for (var bfi=0; bfi<5; bfi++) ctx.fillRect(BX+22,BY+120+bfi*8,186,2);
    // 枕頭（兩個）
    ctx.fillStyle='#f0ede5'; ctx.fillRect(BX+30,BY+100,60,18);
    ctx.fillStyle='#ffffff'; ctx.fillRect(BX+32,BY+101,56,14);
    ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(BX+30,BY+116,60,2);
    ctx.fillStyle='#f0ede5'; ctx.fillRect(BX+118,BY+100,60,18);
    ctx.fillStyle='#ffffff'; ctx.fillRect(BX+120,BY+101,56,14);
    ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(BX+118,BY+116,60,2);
    // 床尾板
    ctx.fillStyle='#6a4020'; ctx.fillRect(BX+20,BY+172,190,8);

    // 床頭小桌（左）
    shadow(BX+4,BY+90,14,44);
    ctx.fillStyle='#7a5028'; ctx.fillRect(BX+4,BY+90,14,44);
    ctx.fillStyle='#9a6838'; ctx.fillRect(BX+5,BY+91,12,42);
    // 桌上小燈
    ctx.fillStyle='#e8c050'; ctx.fillRect(BX+6,BY+86,10,8);
    ctx.fillStyle='#f0d060'; ctx.fillRect(BX+6,BY+86,10,2);
    ctx.fillStyle='#9a7828'; ctx.fillRect(BX+10,BY+94,2,8);
    ctx.fillStyle='rgba(255,220,80,0.2)';
    ctx.beginPath(); ctx.ellipse(BX+11,BY+90,12,9,0,0,Math.PI*2); ctx.fill();

    // 床頭小桌（右）
    shadow(BX+210,BY+90,14,44);
    ctx.fillStyle='#7a5028'; ctx.fillRect(BX+210,BY+90,14,44);
    ctx.fillStyle='#9a6838'; ctx.fillRect(BX+211,BY+91,12,42);
    ctx.fillStyle='#e8c050'; ctx.fillRect(BX+212,BY+86,10,8);
    ctx.fillStyle='#f0d060'; ctx.fillRect(BX+212,BY+86,10,2);
    ctx.fillStyle='#9a7828'; ctx.fillRect(BX+216,BY+94,2,8);
    ctx.fillStyle='rgba(255,220,80,0.2)';
    ctx.beginPath(); ctx.ellipse(BX+217,BY+90,12,9,0,0,Math.PI*2); ctx.fill();

    // 衣櫃（後牆右）
    shadow(BX+142,BY+4,80,68);
    ctx.fillStyle='#4a3018'; ctx.fillRect(BX+142,BY+4,80,68);
    ctx.fillStyle='#6a4828'; ctx.fillRect(BX+144,BY+6,76,64);
    ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(BX+144,BY+6,76,4);
    ctx.fillStyle='#4a3018'; ctx.fillRect(BX+184,BY+6,4,64);
    // 衣櫃把手
    ctx.fillStyle='#c8a040'; ctx.fillRect(BX+160,BY+32,10,4); ctx.fillRect(BX+196,BY+32,10,4);
    ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(BX+160,BY+32,10,1); ctx.fillRect(BX+196,BY+32,10,1);

    // 牆上海報（Friends 感）
    shadow(BX+16,BY+18,72,54);
    ctx.fillStyle='#f0ece0'; ctx.fillRect(BX+16,BY+18,72,54);
    ctx.fillStyle='#1a1428'; ctx.fillRect(BX+18,BY+20,68,50);
    ctx.fillStyle='#cc4422'; ctx.fillRect(BX+18,BY+20,68,16);
    ctx.fillStyle='#e8c840';
    ctx.font='bold 7px Courier New'; ctx.textAlign='center';
    ctx.fillText('HY WORLD', BX+52, BY+31);
    ctx.fillStyle='#4488cc'; ctx.fillRect(BX+18,BY+36,68,34);
    ctx.fillStyle='rgba(255,255,255,0.1)';
    for (var pi=0; pi<3; pi++) ctx.fillRect(BX+22+pi*22,BY+40,16,24);
    // 海報框
    ctx.strokeStyle='#6a5030'; ctx.lineWidth=2;
    ctx.strokeRect(BX+16,BY+18,72,54);

    // 臥室植物
    plant(BX+108, BY+155, 16, false);

    // 臥室標籤
    ctx.fillStyle='rgba(40,60,80,0.5)'; ctx.font='bold 8px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('臥室', BX+110, FY-62);

    ctx.textAlign='left';

    // ══ 面板分隔線 ══
    ctx.fillStyle='#06060f'; ctx.fillRect(PANEL_X,0,2,H);
  }

  function trunc(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0,-1);
    return text + '…';
  }

  function wrapText(ctx, text, x, y, maxW, lineH) {
    var chars = text.split('');
    var line = '', curY = y;
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line !== '') {
        ctx.fillText(line, x, curY);
        line = chars[i]; curY += lineH;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, x, curY);
    return curY;
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

  function drawPanel(ctx, frame) {
    var px=PANEL_X+2, pw=PANEL_W-2, mw=pw-20;
    ctx.fillStyle='#07071a'; ctx.fillRect(PANEL_X,0,PANEL_W,H);
    ctx.fillStyle='#10102c'; ctx.fillRect(px,0,pw,44);
    ctx.fillStyle='#ff88bb'; ctx.font='bold 11px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('🏠 Home', px+pw/2, 18);
    ctx.fillStyle='#886677'; ctx.font='10px "Segoe UI", Arial, sans-serif';
    ctx.fillText('小因的空間', px+pw/2, 33);
    ctx.textAlign='left';
    ctx.fillStyle='rgba(255,136,187,0.3)'; ctx.fillRect(px+6,44,pw-12,1);

    var dy=62+Math.round(Math.sin(frame*3)*2);
    ctx.fillStyle='rgba(255,136,187,0.3)'; ctx.beginPath(); ctx.arc(px+16,dy,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ff88bb'; ctx.beginPath(); ctx.arc(px+16,dy,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ccaaaa'; ctx.font='10px "Segoe UI", Arial, sans-serif'; ctx.fillText('小因 · 在線',px+28,dy+4);

    var sections=[
      {label:'🔴 家庭需要關注',    col:'#ff6b6b', y:80 },
      {label:'📅 近期行程（7天）', col:'#88ccff', y:200},
      {label:'💛 家庭今日建議',    col:'#88ffcc', y:320},
    ];
    var dots=[' ·',' ··',' ···'][Math.floor(frame*2)%3];

    function secHdr(s) {
      ctx.fillStyle=s.col+'aa'; ctx.font='bold 10px "Segoe UI", Arial, sans-serif'; ctx.textAlign='left';
      ctx.fillText(s.label,px+8,s.y);
      ctx.fillStyle=s.col+'33'; ctx.fillRect(px+8,s.y+5,pw-16,1);
      ctx.font='10px "Segoe UI", Arial, sans-serif';
    }

    // ── S1: 家庭需要關注 ──
    var s=sections[0];
    secHdr(s);
    if (homeErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 資料載入失敗',px+10,s.y+22);
    } else if (!homeData) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取中'+dots,px+10,s.y+22);
    } else {
      console.log('[HOME] rendering with data:', homeData);
      var d=homeData, row1=0;
      var nowMs=Date.now(), threeDays=3*86400000, fiveDays=5*86400000;
      // kanban: pending_execute && stale > 3 days
      var kanbanObj=(d._kanban&&d._kanban.projects)?d._kanban.projects:[];
      var kanban=[];
      kanbanObj.forEach(function(proj){ (proj.milestones||[]).forEach(function(m){ kanban.push(m); }); });
      kanban.forEach(function(item){
        if (row1>=4) return;
        if (item.execute_status==='pending_execute') {
          var updMs=item.updated_at?new Date(item.updated_at).getTime():0;
          if (!updMs || (nowMs-updMs)>threeDays) {
            ctx.fillStyle='#ff9966';
            ctx.fillText(trunc(ctx,'⏰ '+(item.title||item.task||'待辦'),mw),px+10,s.y+22+row1*14); row1++;
          }
        }
      });
      // planning: milestones not done
      var planning=d.planning||{};
      Object.keys(planning).forEach(function(key){
        if (row1>=4) return;
        var plan=planning[key];
        if (typeof plan!=='object'||!plan) return;
        var ms=plan.next_milestone||'', msDate=plan.next_milestone_date||'';
        if (!ms || plan.status==='done') return;
        ctx.fillStyle='#ffcc88';
        if (msDate) {
          var dl=Math.ceil((new Date(msDate.replace(/\//g,'-'))-new Date())/86400000);
          var label=dl>0?ms+'（'+dl+'天後）':ms+'（已到期）';
          ctx.fillText(trunc(ctx,'▸ '+label,mw),px+10,s.y+22+row1*14);
        } else {
          ctx.fillText(trunc(ctx,'▸ '+ms,mw),px+10,s.y+22+row1*14);
        }
        row1++;
      });
      if (row1===0) { ctx.fillStyle='#55aa77'; ctx.fillText('✅ 目前一切正常',px+10,s.y+22); }
    }

    // ── S2: 近期家庭行程（7天）──
    s=sections[1];
    secHdr(s);
    if (familyScheduleErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ 資料載入失敗',px+10,s.y+22);
    } else if (!familyScheduleData) {
      ctx.fillStyle='#557799'; ctx.fillText('讀取行程中'+dots,px+10,s.y+22);
    } else {
      console.log('[HOME] rendering with data:', familyScheduleData);
      var evs=familyScheduleData.events||[];
      if (evs.length===0) {
        ctx.fillStyle='#555577'; ctx.fillText('近期無家庭行程',px+10,s.y+22);
      } else {
        evs.slice(0,5).forEach(function(ev,i){
          ctx.fillStyle='#ffcc88';
          var label=ev.date+' '+ev.weekday+'｜'+ev.time+' '+ev.title;
          ctx.fillText(trunc(ctx,label,mw),px+10,s.y+22+i*14);
        });
        if (evs.length>5) { ctx.fillStyle='#666677'; ctx.fillText('還有 '+(evs.length-5)+' 項...',px+10,s.y+22+5*14); }
      }
    }

    // ── S3: 家庭今日建議 ──
    s=sections[2];
    secHdr(s);
    if (suggestionHomeErr) {
      ctx.fillStyle='#cc6666'; ctx.fillText('⚠ AI 建議暫時無法生成',px+10,s.y+22);
    } else if (!suggestionHome) {
      ctx.fillStyle='#557799'; ctx.fillText('💛 分析中'+dots,px+10,s.y+22);
    } else {
      console.log('[HOME] rendering with data:', suggestionHome);
      ctx.fillStyle='#aaffcc';
      drawTextBlock(ctx,suggestionHome,px+10,s.y+22,mw,12,4);
    }

    // ── 家庭編輯按鈕 ──
    var btnX=px+8, btnY=413, btnW=pw-16, btnH=22;
    ctx.fillStyle=familyOpen?'#2e0a16':'#1a0a14';
    ctx.fillRect(btnX,btnY,btnW,btnH);
    ctx.strokeStyle=familyOpen?'#883344':'#662233';
    ctx.lineWidth=1; ctx.strokeRect(btnX+.5,btnY+.5,btnW-1,btnH-1);
    ctx.fillStyle=familyOpen?'#ff88aa':'#cc7799';
    ctx.font='11px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText(familyOpen?'✕ 關閉編輯':'📝 開啟家庭編輯',px+pw/2,btnY+15);
    ctx.textAlign='left';

    ctx.fillStyle='#10102c'; ctx.fillRect(px,H-34,pw,34);
    ctx.fillStyle='#557788'; ctx.font='10px "Segoe UI", Arial, sans-serif'; ctx.textAlign='center';
    ctx.fillText('點擊小因對話',px+pw/2,H-14);
    ctx.textAlign='left';
  }

  var LINES = ['家裡的事交給我！','有什麼需要安排的嗎？','孩子們今天很乖喔！','今天晚餐想吃什麼？'];
  var xiaoyin=null, clickHandler=null;
  var homeData=null, homeErr=false;
  var familyScheduleData=null, familyScheduleErr=false;
  var suggestionHome=null, suggestionHomeErr=false;
  var familyFrame=null, familyOpen=false;

  function openFamily(){
    if (familyFrame) return;
    var overlay=document.getElementById('scene-overlay');
    var wrap=document.createElement('div');
    wrap.id='family-wrap';
    wrap.style.cssText='position:absolute;top:0;left:0;right:29.41%;bottom:0;overflow-x:auto;overflow-y:auto;box-sizing:border-box;border:2px solid #c35;z-index:7';
    familyFrame=document.createElement('iframe');
    familyFrame.src='family-dashboard.html?t='+Date.now();
    familyFrame.style.cssText='width:1600px;height:1600px;border:none;background:#f0f2f5;zoom:0.55;display:block';
    wrap.appendChild(familyFrame);
    overlay.appendChild(wrap);
    familyOpen=true;
  }
  function closeFamily(){
    if (familyFrame){ var w=familyFrame.parentNode; w&&w.parentNode&&w.parentNode.removeChild(w); familyFrame=null; }
    familyOpen=false;
  }

  return {
    init: function(worldData) {
      console.log('[HOME] init called, worldData=', !!worldData);
      var cfg = worldData && worldData.characters.find(function(c){ return c.id==='xiaoyin'; });
      var cx=150, cy=FLOOR_Y-6;
      xiaoyin = cfg ? new Character(cfg) : null;
      if (xiaoyin) { CharacterSprites.applyAll({xiaoyin:xiaoyin}); xiaoyin.setState('idle'); }
      bubbles=[];
      homeData=null; homeErr=false;
      familyScheduleData=null; familyScheduleErr=false;
      suggestionHome=null; suggestionHomeErr=false;
      console.log('[HOME] fetching panel data');
      console.log('[HOME] fetch starting', 'API.family');
      API.family()
        .then(function(d){ console.log('[HOME] fetch response (family):', d); if(d&&!d.error&&typeof d==='object'){homeData=d;}else{homeErr=true;} })
        .catch(function(e){ console.log('[HOME] error:', e); homeErr=true; });
      console.log('[HOME] fetch starting', 'API.familySchedule');
      API.familySchedule()
        .then(function(d){ console.log('[HOME] fetch response (familySchedule):', d); if(d&&!d.error&&typeof d==='object'){familyScheduleData=d;}else{familyScheduleErr=true;} })
        .catch(function(e){ console.log('[HOME] error:', e); familyScheduleErr=true; });
      console.log('[HOME] fetch starting', 'API.suggestHome');
      API.suggestHome()
        .then(function(d){ console.log('[HOME] fetch response (suggestHome):', d); if(d&&d.suggestion){suggestionHome=d.suggestion;}else{suggestionHomeErr=true;} })
        .catch(function(e){ console.log('[HOME] error:', e); suggestionHomeErr=true; });
      var canvas=BaseScene.canvas;
      if (clickHandler) canvas.removeEventListener('click',clickHandler);
      clickHandler = function(e){
        var r=canvas.getBoundingClientRect();
        var mx=(e.clientX-r.left)*(680/r.width), my=(e.clientY-r.top)*(480/r.height);
        var btnX=PANEL_X+10, btnY=410, btnW=PANEL_W-20, btnH=22;
        if (mx>=btnX&&mx<=btnX+btnW&&my>=btnY&&my<=btnY+btnH){
          if (familyOpen) closeFamily(); else openFamily();
          return;
        }
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
      closeFamily();
      bubbles=[];
    }
  };
})();
