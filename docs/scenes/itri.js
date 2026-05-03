// ITRI indoor scene — expanded in Task 11
const ITRIScene = (() => {
  const canvas = document.getElementById('scene-canvas');
  const ctx    = canvas.getContext('2d');

  return {
    init(worldData) {
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, 680, 480);
      ctx.fillStyle = '#4488ff';
      ctx.font = '14px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('🔬 ITRI — 950157 的工作站（Task 11 實作）', 340, 240);
    }
  };
})();
