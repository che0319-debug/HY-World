// Sam scene 控制器：開啟 Sam dashboard modal

const SamModal = (() => {
  var isOpen = false;

  return {
    open: function() {
      if (isOpen) return;
      openDashboardModal('sam-dashboard.html', function() { isOpen = false; });
      isOpen = true;
    },
    close: function() {
      closeDashboardModal();
      isOpen = false;
    }
  };
})();
