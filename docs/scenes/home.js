// Home indoor scene — expanded in Task 09
const HomeScene = (() => {
  return {
    init(worldData) {
      BaseScene.startLoop((ctx, dt, W, H) => {
        BaseScene.drawFloor('#14142c', '#0f0f22');
        ctx.fillStyle = '#ff88bb';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🏠 Home — 小因的空間（Task 09 實作）', W / 2, H / 2);
        ctx.textAlign = 'left';
      });
    }
  };
})();
