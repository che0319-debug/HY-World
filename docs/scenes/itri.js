// ITRI indoor scene — expanded in Task 11
const ITRIScene = (() => {
  return {
    init(worldData) {
      BaseScene.startLoop((ctx, dt, W, H) => {
        BaseScene.drawFloor('#0a102a', '#07091e');
        ctx.fillStyle = '#4488ff';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🔬 ITRI — 950157 的工作站（Task 11 實作）', W / 2, H / 2);
        ctx.textAlign = 'left';
      });
    }
  };
})();
