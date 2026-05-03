// Construction scene — placeholder bubble — expanded in Task 03
const ConstructionScene = (() => {
  const canvas = document.getElementById('scene-canvas');
  const ctx    = canvas.getContext('2d');

  return {
    init(building) {
      ctx.fillStyle = '#0e0e1c';
      ctx.fillRect(0, 0, 680, 480);
      ctx.fillStyle = '#ffaa00';
      ctx.font = '16px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('🚧 這裡還在規劃中...', 340, 240);
    }
  };
})();
