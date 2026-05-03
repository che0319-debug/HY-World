// Home indoor scene — expanded in Task 09
const HomeScene = (() => {
  const canvas = document.getElementById('scene-canvas');
  const ctx    = canvas.getContext('2d');

  return {
    init(worldData) {
      ctx.fillStyle = '#12122a';
      ctx.fillRect(0, 0, 680, 480);
      ctx.fillStyle = '#ff88bb';
      ctx.font = '14px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('🏠 Home — 小因的空間（Task 09 實作）', 340, 240);
    }
  };
})();
