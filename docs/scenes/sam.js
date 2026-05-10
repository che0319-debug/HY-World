// Phase 5.4-J 初版：Sam modal 直接載入 anjen-dashboard.html
// 未來 Phase 6.A.4（樂川 / 美業上線後）：
//   - 新建 sam-dashboard.html 作為副業總覽 hub
//   - 內含 Anjen / 樂川 / 美業 tab，點擊各 tab 載入對應 dashboard
//   - 本 modal 改為載入 sam-dashboard.html
//   - anjen-dashboard.html 不改名、繼續維護

const SamModal = (() => {
  var isOpen = false;

  return {
    open: function() {
      if (isOpen) return;
      openDashboardModal('anjen-dashboard.html', function() { isOpen = false; });
      isOpen = true;
    },
    close: function() {
      closeDashboardModal();
      isOpen = false;
    }
  };
})();
