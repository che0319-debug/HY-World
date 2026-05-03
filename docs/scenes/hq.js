// HQ indoor scene — expanded in Task 10
const HQScene = (() => {
  const canvas = document.getElementById('scene-canvas');
  const ctx    = canvas.getContext('2d');

  return {
    init(worldData) {
      ctx.fillStyle = '#0e1020';
      ctx.fillRect(0, 0, 680, 480);
      ctx.fillStyle = '#44cc66';
      ctx.font = '14px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('🏢 總部 HQ — HY 的基地（Task 10 實作）', 340, 240);
    }
  };
})();
