// HQ indoor scene — expanded in Task 10
const HQScene = (() => {
  return {
    init(worldData) {
      BaseScene.startLoop((ctx, dt, W, H) => {
        BaseScene.drawFloor('#0e102a', '#0a0c1e');
        ctx.fillStyle = '#44cc66';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🏢 總部 HQ — HY 的基地（Task 10 實作）', W / 2, H / 2);
        ctx.textAlign = 'left';
      });
    },
    cleanup() {}
  };
})();
