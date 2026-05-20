// ============================================================
// UI STATE & CORE UTILS
// ============================================================

import { renderCropsView, renderPlotModalContent, renderFarmSummary } from './plots.js';
import { renderBarnView } from './barn.js';
import { renderShopContent } from './shop.js';
import { renderInventoryContent } from './inventory.js';
import { renderTasksContent } from './quests.js';
import { renderProducerContent } from './producer.js';

// Global variable proxy bridge to connect ESM modules with game.js G state
if (!window.G) {
  Object.defineProperty(window, 'G', {
    get() { return window.GAME ? window.GAME.G : null; },
    set(val) { if (window.GAME) window.GAME.G = val; }
  });
}

window.selectedPlot = null;
window.currentZone = 0;
window.plantingPlotKey = null;
window.selectedPlantId = null;
window.selectedFert = 0;
window.fertilizePlotKey = null;
window.selectedFertilizerType = 0;
window.shopTab = 'buy';
window.autoRefreshTimer = null;
window.selectedShopItemId = null;
window.currentModalScreen = 'details';
window.slotSelectingItem = [false, false, false];
window.slotSelectedInput = [null, null, null];
window.currentFarmTab = 'crops';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  const seasonSelect = document.getElementById('seasonSelect');
  if (seasonSelect && G) {
    seasonSelect.value = G.season;
    seasonSelect.addEventListener('change', (e) => {
      GAME.changeSeason(e.target.value);
      render();
      toast(`Đổi sang ${SEASON_LABELS[G.season]}`, 'info');
    });
  }

  render();
  if (G && G.needsStartSeason) openStartSeasonModal();
  startAutoRefresh();
});

export function startAutoRefresh() {
  if (window.autoRefreshTimer) clearInterval(window.autoRefreshTimer);
  window.autoRefreshTimer = setInterval(() => {
    const seasonChanged = GAME.updateSeasonClock();
    const changed = GAME.lazyUpdateAll();
    updateGold();
    updateSeasonDisplay();
    updateDayDisplay();
    renderFarmGridArea();
    renderSidebar();
    if (changed) toast('🔄 Trạng thái nông trại đã cập nhật!', 'info');
    if (seasonChanged) toast(`🍂 Chuyển sang ${SEASON_LABELS[G.season]}`, 'success');
    const refreshStatus = document.getElementById('refreshStatus');
    if (refreshStatus) {
      refreshStatus.textContent = `🔄 Sync: ${new Date().toLocaleTimeString('vi')}`;
    }
  }, 10000);
}
window.startAutoRefresh = startAutoRefresh;

export function render() {
  if (!window.GAME || !G) return;
  GAME.updateSeasonClock();
  GAME.lazyUpdateAll();
  renderFarmSubTabs();
  renderFarmGridArea();
  renderSidebar();
  updateGold();
  updateSeasonDisplay();
  updateDayDisplay();
}
window.render = render;

export function renderFarmSubTabs() {
  const tabs = [
    { id: 'crops', label: '🏡 Trồng trọt' },
    { id: 'poultry', label: '🐔 Gia cầm' },
    { id: 'livestock', label: '🐮 Gia súc' }
  ];
  const container = document.getElementById('farmSubTabs');
  if (!container) return;
  container.innerHTML = tabs.map(t => `
    <div class="zone-tab ${t.id === window.currentFarmTab ? 'active' : ''}" onclick="switchFarmTab('${t.id}')">
      ${t.label}
    </div>
  `).join('');
}
window.renderFarmSubTabs = renderFarmSubTabs;

export function switchFarmTab(tabId) {
  window.currentFarmTab = tabId;
  window.selectedPlot = null;
  renderFarmSubTabs();
  renderFarmGridArea();
}
window.switchFarmTab = switchFarmTab;

export function renderFarmGridArea() {
  const container = document.getElementById('farmGridContainer');
  if (!container) return;
  
  if (window.currentFarmTab === 'crops') {
    container.innerHTML = renderCropsView();
  } else if (window.currentFarmTab === 'poultry') {
    container.innerHTML = renderBarnView('poultry');
  } else if (window.currentFarmTab === 'livestock') {
    container.innerHTML = renderBarnView('livestock');
  }
}
window.renderFarmGridArea = renderFarmGridArea;

export function selectPlotCell(key) {
  window.selectedPlot = key;
  window.currentModalScreen = 'details';
  const modal = document.getElementById('plotModal');
  if (modal) modal.style.display = 'flex';
  renderPlotModalContent();
}
window.selectPlotCell = selectPlotCell;

export function closePlotModal() {
  window.selectedPlot = null;
  window.currentModalScreen = 'details';
  const modal = document.getElementById('plotModal');
  if (modal) modal.style.display = 'none';
  renderFarmGridArea();
}
window.closePlotModal = closePlotModal;

export function renderSidebar() {
  renderFarmSummary();
  if (window.selectedPlot && window.currentModalScreen === 'details') {
    renderPlotModalContent();
  }
}
window.renderSidebar = renderSidebar;

export function formatTime(ms) {
  if (ms <= 0) return '0ph';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}ph`;
  return `${Math.floor(m/60)}h${m%60}ph`;
}
window.formatTime = formatTime;

export function toast(msg, type='info') {
  const container = document.getElementById('toast');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
window.toast = toast;

export function updateGold() {
  if (!G) return;
  const goldEl = document.getElementById('goldDisplay');
  if (goldEl) goldEl.textContent = Math.floor(G.gold);
  const energyEl = document.getElementById('energyDisplay');
  if (energyEl) energyEl.textContent = Math.floor(G.energy);
}
window.updateGold = updateGold;

export function updateSeasonDisplay() {
  if (!G) return;
  const select = document.getElementById('seasonSelect');
  if (select) select.value = G.season;
}
window.updateSeasonDisplay = updateSeasonDisplay;

export function updateDayDisplay() {
  if (!G) return;
  const el = document.getElementById('dayDisplay');
  if (!el) return;
  el.textContent = `${GAME.getDayOfSeason(G.game_day)}/30`;
  updateClockDisplay();
}
window.updateDayDisplay = updateDayDisplay;

export function updateClockDisplay() {
  if (!G) return;
  const clockEl = document.getElementById('gameClockDisplay');
  if (clockEl) {
    const elapsedMs = Date.now() - G.lastDayTick;
    const hours = Math.floor(elapsedMs / 3600000) % 24;
    const minutes = Math.floor((elapsedMs % 3600000) / 60000);
    clockEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
window.updateClockDisplay = updateClockDisplay;

setInterval(updateClockDisplay, 1000);

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) el.style.display = 'none';
    });
  });
});

export function switchView(viewId) {
  document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.remove('hidden');
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-yellow-400');
    btn.classList.add('text-gray-400');
  });
  const activeBtn = document.getElementById('nav-' + viewId);
  if (activeBtn) {
    activeBtn.classList.add('text-yellow-400');
    activeBtn.classList.remove('text-gray-400');
  }

  if (typeof closeShopItemModal === 'function') closeShopItemModal();
  if (viewId === 'viewShop') {
    if (window.stopTasksTimer) window.stopTasksTimer();
    if (window.stopProducerTimer) window.stopProducerTimer();
    if (typeof window.shopTab === 'undefined' || !window.shopTab) window.showShopTab('buy');
    else window.renderShopContent();
  } else if (viewId === 'viewInventory') {
    if (window.stopTasksTimer) window.stopTasksTimer();
    if (window.stopProducerTimer) window.stopProducerTimer();
    window.renderInventoryContent();
  } else if (viewId === 'viewTasks') {
    if (window.stopProducerTimer) window.stopProducerTimer();
    window.renderTasksContent();
    if (window.startTasksTimer) window.startTasksTimer();
  } else if (viewId === 'viewProducer') {
    if (window.stopTasksTimer) window.stopTasksTimer();
    window.renderProducerContent();
    if (window.startProducerTimer) window.startProducerTimer();
  } else {
    if (window.stopTasksTimer) window.stopTasksTimer();
    if (window.stopProducerTimer) window.stopProducerTimer();
  }
}
window.switchView = switchView;

export function confirmResetGame() {
  if (!confirm('Bạn có muốn bắt đầu lại hoặc nạp file save khác? Dữ liệu hiện tại sẽ bị xóa sạch.')) return;
  GAME.resetGame();
  render();
  toast('🔄 Hãy chọn màn mới hoặc nạp file save', 'info');
}
window.confirmResetGame = confirmResetGame;

export function openStartSeasonModal() {
  const modal = document.getElementById('startSeasonModal');
  if (modal) {
    modal.style.display = 'flex';
    renderStartSeasonContent();
  }
}
window.openStartSeasonModal = openStartSeasonModal;

export function closeStartSeasonModal() {
  const modal = document.getElementById('startSeasonModal');
  if (modal) modal.style.display = 'none';
}
window.closeStartSeasonModal = closeStartSeasonModal;

export function renderStartSeasonContent() {
  const content = document.getElementById('startSeasonContent');
  if (!content) return;
  content.innerHTML = `
    <div class="mb-3 text-sm text-gray-400">Tùy chọn bắt đầu nông trại:</div>
    <div class="mb-2 font-bold text-yellow-400">1. Chơi màn mới (Chọn mùa)</div>
    <div class="grid grid-cols-2 gap-2 mb-4">
      ${SEASONS.map(season => {
        const label = SEASON_LABELS[season];
        return `<button class="btn btn-yellow w-full text-sm" onclick="setStartSeason('${season}')">${label}</button>`;
      }).join('')}
    </div>
    
    <div class="mb-2 font-bold text-yellow-400">2. Hoặc nạp file save (Import Data)</div>
    <input type="file" id="importSaveFile" accept=".json" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-gray-900 hover:file:bg-yellow-500 mb-4" onchange="handleImportSave(event)">
    
    <div class="text-xs text-gray-500">Mỗi mùa kéo dài 30 ngày. Lịch game tự động chạy theo thời gian thực.</div>
  `;
}
window.renderStartSeasonContent = renderStartSeasonContent;

export function setStartSeason(season) {
  GAME.setStartSeason(season);
}
window.setStartSeason = setStartSeason;

export function exportSave() {
  const dataStr = localStorage.getItem('mangak_farm_v1');
  if (!dataStr) {
    toast('Chưa có dữ liệu để xuất!', 'error');
    return;
  }
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mangak_farm_save_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('💾 Đã xuất file save thành công!', 'success');
}
window.exportSave = exportSave;

export function handleImportSave(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);
      if (typeof parsed !== 'object' || !parsed.plots) {
        throw new Error('Invalid save format');
      }
      localStorage.setItem('mangak_farm_v1', content);
      
      const newG = GAME.loadState();
      GAME.G = newG;
      GAME.syncUnlockedPlots();
      
      render();
      closeStartSeasonModal();
      toast('✅ Đã nạp file save thành công!', 'success');
    } catch (err) {
      toast('❌ File save không hợp lệ!', 'error');
      console.error(err);
    }
  };
  reader.readAsText(file);
}
window.handleImportSave = handleImportSave;
