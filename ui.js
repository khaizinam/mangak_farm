// ============================================================
// UI STATE
// ============================================================
// Các dữ liệu và hàm đã được khai báo global trong game.js

let selectedPlot = null;
let currentZone = 0;
let plantingPlotKey = null;
let selectedPlantId = null;
let selectedFert = 0;
let fertilizePlotKey = null;
let selectedFertilizerType = 0;
let shopTab = 'buy';
let autoRefreshTimer = null;
let selectedShopItemId = null;
let currentModalScreen = 'details'; // 'details', 'planting', 'fertilizing'

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('seasonSelect').value = G.season;
  document.getElementById('seasonSelect').addEventListener('change', (e) => {
    changeSeason(e.target.value);
    render();
    toast(`Đổi sang ${SEASON_LABELS[G.season]}`, 'info');
  });

  render();
  if (G.needsStartSeason) openStartSeasonModal();
  startAutoRefresh();
});

function startAutoRefresh() {
  autoRefreshTimer = setInterval(() => {
    const seasonChanged = updateSeasonClock();
    const changed = lazyUpdateAll();
    updateGold();
    updateSeasonDisplay();
    updateDayDisplay();
    renderGrid();
    renderSidebar();
    if (changed) toast('🔄 Trạng thái cây đã cập nhật!', 'info');
    if (seasonChanged) toast(`🍂 Chuyển sang ${SEASON_LABELS[G.season]}`, 'success');
    document.getElementById('refreshStatus').textContent = `🔄 Sync: ${new Date().toLocaleTimeString('vi')}`;
  }, 10000);
}

// ============================================================
// RENDER
// ============================================================
function render() {
  updateSeasonClock();
  lazyUpdateAll();
  renderZoneTabs();
  renderGrid();
  renderSidebar();
  updateGold();
  updateSeasonDisplay();
  updateDayDisplay();
  renderBuyLand();
}

function updateGold() {
  document.getElementById('goldDisplay').textContent = G.gold.toLocaleString('vi');
  const energyEl = document.getElementById('energyDisplay');
  if (energyEl) {
    energyEl.textContent = G.energy;
  }
}

function renderZoneTabs() {
  const names = ['🏡 Khu 1', '🌿 Khu 2', '🌳 Khu 3'];
  document.getElementById('zoneTabs').innerHTML = names.map((n,i) => `
    <div class="zone-tab ${i===currentZone?'active':''}" data-zone-id="${i}">${n}
      <span class="text-xs ml-1 opacity-70">${G.plots_unlocked[i]}/36</span>
    </div>
  `).join('');
}

function switchZone(z) {
  currentZone = z;
  selectedPlot = null;
  renderZoneTabs();
  renderGrid();
  renderSidebar();
  renderBuyLand();
}

function renderGrid() {
  const grid = document.getElementById('farmGrid');
  let html = '';
  for (let i = 0; i < 36; i++) {
    const key = `${currentZone}_${i}`;
    const plot = G.plots[key];
    const up = G.plants[key];
    const isSelected = selectedPlot === key;

    if (plot.locked) {
      html += `<div class="plot-cell locked" title="Ô đất bị khóa">🔒</div>`;
      continue;
    }

    if (!up) {
      html += `<div class="plot-cell empty ${isSelected?'ring-2 ring-yellow-400':''}"
        data-plot-key="${key}" title="Ô trống - click để trồng cây">🟫</div>`;
      continue;
    }

    // Has plant
    const plant = PLANTS_DATA[up.plant_id];
    const waterPct = Math.round(up.current_water);
    const hasBug = !!up.bug_started_at;
    const statusClass = up.status === 0 ? 'growing' : up.status === 1 ? 'ready' : 'dead';
    const bugClass = hasBug ? 'bug' : '';
    const grossY = calcGrossYield(up, plant);
    const netY = calcNetYield(up);
    const dmgPct = Math.round((1 - netY/grossY)*100);

    const mainEmoji = up.status === 0 ? '🌱' : up.status === 1 ? plant.emoji : '💀';
    const statusEmoji = up.status === 1 ? '✨' : '';

    html += `<div class="plot-cell ${statusClass} ${bugClass} ${isSelected?'ring-2 ring-yellow-400':''}"
      data-plot-key="${key}" title="${plant.name}">
      
      <div class="flex-1 flex items-center justify-center w-full">
        <span style="font-size:24px; line-height:1; display:block;">${mainEmoji}</span>
      </div>

      ${(statusEmoji || hasBug) ? `<div class="absolute -top-1 -right-1 text-[12px] bg-gray-900 rounded-full px-1 border border-gray-700 shadow-lg z-10">${statusEmoji}${hasBug?'🐛':''}</div>` : ''}
      
      <div class="water-bar mb-1" style="width:80%"><div class="water-fill" style="width:${waterPct}%"></div></div>
    </div>`;
  }
  grid.innerHTML = html;
}

function renderBuyLand() {
  const btn = document.getElementById('buyLandBtn');
  const info = document.getElementById('buyLandInfo');
  const z = currentZone;
  const current = G.plots_unlocked[z];
  
  if (z > 0 && G.plots_unlocked[z - 1] < 36) {
    btn.style.display = 'none';
    info.textContent = `Yêu cầu mở hết Khu ${z} trước`;
    return;
  }

  if (current >= 36) {
    btn.style.display = 'none';
    info.textContent = 'Khu đất đã mở hết';
    return;
  }
  const totalUnlocked = G.plots_unlocked.reduce((a, b) => a + b, 0);
  const pIdx = Math.floor(totalUnlocked / 3);
  const price = LAND_PRICES[pIdx] ?? 999999;
  btn.style.display = '';
  btn.textContent = `🏗️ Mua thêm 3 ô (+${price}🪙)`;
  info.textContent = `${current}/36 ô đã mở`;
}

function closePlotModal() {
  selectedPlot = null;
  currentModalScreen = 'details';
  document.getElementById('plotModal').style.display = 'none';
  renderGrid();
}

function renderSidebar() {
  renderFarmSummary();
  if (selectedPlot && currentModalScreen === 'details') {
    renderPlotModalContent();
  }
}

function renderPlotModalContent() {
  const contentEl = document.getElementById('plotModalContent');
  const titleEl = document.getElementById('plotModalTitle');
  if (!selectedPlot) return;

  const plot = G.plots[selectedPlot];
  if (!plot || plot.locked) return;

  const up = G.plants[selectedPlot];
  if (!up) {
    titleEl.textContent = '🟫 Ô đất trống';
    contentEl.innerHTML = `
      <div class="text-center py-6">
        <div class="text-5xl mb-3">🟫</div>
        <div class="text-gray-300 font-bold mb-1">Ô đất này đang trống</div>
        <div class="text-xs text-gray-500 mb-4">Ô số ${parseInt(selectedPlot.split('_')[1])+1} - Khu ${parseInt(selectedPlot.split('_')[0])+1}</div>
        <button class="btn btn-green w-full py-3 text-base" data-action="open-planting-view">🌱 Trồng cây</button>
      </div>
    `;
    return;
  }

  const plant = PLANTS_DATA[up.plant_id];
  const waterPct = Math.round(up.current_water);
  const grossY = calcGrossYield(up, plant);
  const netY = calcNetYield(up);
  const statusText = up.status === 0 ? '<span class="text-green-400 font-bold">🌱 Sinh trưởng</span>'
    : up.status === 1 ? '<span class="text-yellow-400 font-bold">✨ Sẵn sàng thu hoạch</span>'
    : '<span class="text-red-400 font-bold">💀 Đã chết</span>';
  const wrongSeason = up.is_wrong_season ? '<span class="text-red-400 text-xs">(⚠️ trái mùa -50%)</span>' : '';

  // Time info
  const now = Date.now();
  const growthMs = plant.growth_time * 60000 * (FERTILIZER_DATA[up.fertilizer_type]?.time_multiplier || 1.0);
  let timeInfo = '';
  if (up.status === 0) {
    const remaining = Math.max(0, growthMs - (up.grown_ms || 0));
    timeInfo = `⏱️ Còn ${formatTime(remaining)}`;
    if (up.current_water <= 0) timeInfo += ' <span class="text-red-400 text-[10px] ml-1">(Tạm dừng do thiếu nước)</span>';
  } else if (up.status === 1) {
    const rotMs = plant.rot_time * 60000;
    const remaining = Math.max(0, rotMs - (up.rot_ms || 0));
    timeInfo = `<span class="text-yellow-400">⚠️ Héo sau ${formatTime(remaining)}</span>`;
  }

  titleEl.textContent = `📋 Chi tiết ô đất`;

  // Render info and ALL quick actions
  let btnHtml = '';
  if (up.status === 2) {
    btnHtml = `
      <button class="btn btn-gray w-full py-2" data-action="remove-dead" data-plot="${selectedPlot}">🗑️ Dọn cây chết</button>
      <button class="btn btn-red w-full py-2" data-action="clear-plot" data-plot="${selectedPlot}">⛏️ Cuốc đất (Dọn đất)</button>
    `;
  } else {
    // 1. Tưới nước (Water)
    btnHtml += `<button class="btn btn-blue w-full py-2" data-action="water-plant" data-plot="${selectedPlot}">💧 Tưới nước</button>`;
    
    // 2. Bón phân (Fertilizer)
    btnHtml += `<button class="btn btn-green w-full py-2" data-action="open-fertilizer-view">🌿 Bón phân</button>`;

    // 3. Thu hoạch (Harvest)
    btnHtml += `<button class="btn btn-yellow w-full py-2" data-action="harvest-plant" data-plot="${selectedPlot}">🌾 Thu hoạch</button>`;
    
    // 4. Bắt sâu thủ công
    btnHtml += `<button class="btn btn-green w-full py-2" data-action="catch-bug" data-plot="${selectedPlot}">👋 Bắt sâu thủ công</button>`;
    
    // 5. Phun thuốc
    btnHtml += `<button class="btn btn-purple w-full py-2" data-action="pesticide-plant" data-plot="${selectedPlot}">🧪 Phun thuốc diệt sâu (Còn x${G.inventory['pesticide'] || 0})</button>`;
    
    // 6. Cuốc đất
    btnHtml += `<button class="btn btn-red w-full py-2" data-action="clear-plot" data-plot="${selectedPlot}">⛏️ Cuốc đất (Huỷ cây)</button>`;
  }

  contentEl.innerHTML = `
    <div class="flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700 mb-4">
      <span class="text-4xl">${plant.emoji}</span>
      <div>
        <div class="font-bold text-yellow-400 text-lg">${plant.name}</div>
        <div class="text-xs text-gray-400">Mùa thích hợp: ${SEASON_LABELS[plant.season]}</div>
      </div>
    </div>

    <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 mb-4 text-sm">
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Trạng thái:</span>
        <span>${statusText} ${wrongSeason}</span>
      </div>
      ${timeInfo ? `
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Thời gian:</span>
        <span>${timeInfo}</span>
      </div>` : ''}
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Độ ẩm đất:</span>
        <span class="${waterPct<=20?'text-red-400':waterPct<=50?'text-yellow-400':'text-blue-400'} font-bold">${waterPct}%</span>
      </div>
      <div class="w-full bg-gray-900 rounded-full h-2.5 mb-1">
        <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${waterPct}%"></div>
      </div>
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Sản lượng ước tính:</span>
        <div>
          <span class="text-green-400 font-bold">${netY}</span>
          <span class="text-gray-500">/${Math.round(grossY)}</span>
        </div>
      </div>
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Phân bón đã dùng:</span>
        <span>${FERTILIZER_DATA[up.fertilizer_type]?.emoji || ''} ${FERTILIZER_DATA[up.fertilizer_type]?.name || 'Không có'}</span>
      </div>
      <div class="flex justify-between pb-1">
        <span>Sâu hại:</span>
        <span>${up.bug_started_at ? '<span class="text-red-400 font-bold">🐛 Đang có sâu!</span>' : '<span class="text-green-400">✅ Sạch sâu</span>'}</span>
      </div>
      ${up.pesticide_until && up.pesticide_until > now ? `
      <div class="text-xs text-green-400 bg-green-950 bg-opacity-35 p-2 rounded border border-green-900 text-center">
        🛡️ Đang được bảo vệ bởi thuốc diệt sâu (Còn ${formatTime(up.pesticide_until - now)})
      </div>` : ''}
    </div>

    <div class="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">⚡ Hành động nhanh</div>
    <div class="grid grid-cols-2 gap-2">
      ${btnHtml}
    </div>
  `;
}

function renderFarmSummary() {
  const plants = Object.values(G.plants);
  const growing = plants.filter(p=>p.status===0).length;
  const ready = plants.filter(p=>p.status===1).length;
  const dead = plants.filter(p=>p.status===2).length;
  const bugs = plants.filter(p=>p.bug_started_at).length;
  const el = document.getElementById('farmSummary');
  if (el) {
    el.innerHTML = `
      <div class="flex justify-between"><span class="text-gray-400">🌱 Đang trồng</span><span>${growing}</span></div>
      <div class="flex justify-between"><span class="text-gray-400">✨ Có thể thu</span><span class="text-yellow-400">${ready}</span></div>
      <div class="flex justify-between"><span class="text-gray-400">💀 Đã chết</span><span class="text-red-400">${dead}</span></div>
      <div class="flex justify-between"><span class="text-gray-400">🐛 Đang có sâu</span><span class="text-red-400">${bugs}</span></div>
    `;
  }
}

function openPlantingView() {
  plantingPlotKey = selectedPlot;
  selectedPlantId = null;
  selectedFert = 0;
  currentModalScreen = 'planting';
  renderPlantingViewContent();
}

function renderPlantingViewContent() {
  const contentEl = document.getElementById('plotModalContent');
  const titleEl = document.getElementById('plotModalTitle');
  titleEl.textContent = '🌱 Gieo Hạt';

  let mySeeds = Object.keys(G.inventory).filter(k => PLANTS_DATA[k] && G.inventory[k] > 0);
  mySeeds = mySeeds.filter(k => PLANTS_DATA[k].season === G.season);

  const backBtn = `<button class="btn btn-gray w-full text-sm mb-3" data-action="go-back-to-details">⬅️ Quay lại</button>`;

  if (mySeeds.length === 0) {
    contentEl.innerHTML = `
      ${backBtn}
      <div class="text-center py-6 text-gray-400">
        <div class="text-4xl mb-3">😢</div>
        <div>Bạn không có hạt giống nào cho mùa ${SEASON_LABELS[G.season]}!</div>
        <div class="text-sm mt-2">Hãy mua hạt giống ở tiệm tạp hóa</div>
        <button class="btn btn-yellow mt-4" data-action="close-plot-modal-open-shop">🏪 Đến tiệm</button>
      </div>`;
    return;
  }

  contentEl.innerHTML = `
    ${backBtn}
    <div class="mb-3 text-xs text-gray-400">Chọn hạt giống để gieo (mùa hiện tại: <span class="text-yellow-400">${SEASON_LABELS[G.season]}</span>)</div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4" id="seedPicker" style="max-height: 45vh; overflow-y: auto;">
      ${mySeeds.map(pid => {
        const p = PLANTS_DATA[pid];
        const wrong = p.season !== G.season;
        const actTime = p.growth_time * 60000;
        const actYield = p.base_yield;
        return `<div class="plant-card ${wrong?'wrong-season':''} ${selectedPlantId===pid?'selected':''}" id="seed_${pid}" data-action="select-seed" data-seed-id="${pid}">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${p.emoji}</span>
            <div>
              <div class="font-bold text-sm">${p.name}</div>
              <div class="text-xs text-gray-400">${SEASON_LABELS[p.season]} · Còn x${G.inventory[pid]}</div>
            </div>
          </div>
          <div class="mt-1 text-xs text-gray-500 flex gap-3">
            <span>⏱️${formatTime(actTime)}</span>
            <span>🌾${actYield}</span>
            <span>💧-${Math.round(p.water_consume_per_hour)}%/h</span>
          </div>
        </div>`;
      }).join('')}
    </div>

    <button class="btn btn-green w-full text-base py-2.5" data-action="confirm-plant">🌱 Gieo hạt (tốn 1 ⚡)</button>
  `;
}

function selectSeed(pid) {
  selectedPlantId = pid;
  document.querySelectorAll('.plant-card').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`seed_${pid}`);
  if (el) el.classList.add('selected');
}

function selectFert(f) {
  selectedFert = f;
  renderPlantingViewContent();
}

function confirmPlant() {
  if (!selectedPlantId) { toast('Chọn hạt giống trước!', 'error'); return; }
  const result = plantSeed(plantingPlotKey, selectedPlantId);
  if (!result.ok) { toast(result.msg, 'error'); return; }
  toast(`🌱 Đã gieo ${PLANTS_DATA[selectedPlantId].name}!`, 'success');
  render();
  goBackToDetails();
}

function openFertilizerView() {
  fertilizePlotKey = selectedPlot;
  selectedFertilizerType = 0;
  currentModalScreen = 'fertilizing';
  renderFertilizerViewContent();
}

function renderFertilizerViewContent() {
  const contentEl = document.getElementById('plotModalContent');
  const titleEl = document.getElementById('plotModalTitle');
  titleEl.textContent = '🌿 Bón phân';

  const backBtn = `<button class="btn btn-gray w-full text-sm mb-3" data-action="go-back-to-details">⬅️ Quay lại</button>`;

  if (!fertilizePlotKey || !G.plants[fertilizePlotKey]) {
    contentEl.innerHTML = `${backBtn}<div class="text-center py-6 text-gray-400">Không có cây để bón phân.</div>`;
    return;
  }

  const available = [1,2,3].filter(type => G.inventory[`fertilizer_${type}`] > 0);
  if (available.length === 0) {
    contentEl.innerHTML = `
      ${backBtn}
      <div class="text-center py-6 text-gray-400">
        <div class="text-4xl mb-3">😢</div>
        <div>Bạn không có bất kỳ loại phân bón nào trong túi đồ!</div>
        <div class="text-sm mt-2">Hãy mua phân bón ở tiệm tạp hóa</div>
        <button class="btn btn-yellow mt-4" data-action="close-plot-modal-open-shop">🏪 Đến tiệm</button>
      </div>`;
    return;
  }

  contentEl.innerHTML = `
    ${backBtn}
    <div class="mb-3 text-sm text-gray-400">Chọn phân bón để áp dụng cho cây hiện tại.</div>
    <div class="grid grid-cols-1 gap-2 mb-4" id="fertilizerPicker">
      ${available.map(type => {
        const fd = FERTILIZER_DATA[type];
        return `<button class="fert-option-btn w-full text-left rounded-lg border px-3 py-3 ${selectedFertilizerType===type?'border-yellow-400 bg-yellow-400 bg-opacity-10':'border-gray-600 bg-gray-800'}" data-action="select-fertilizer-type" data-fertilizer-type="${type}">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-bold text-yellow-400">${fd.emoji} ${fd.name}</div>
              <div class="text-xs text-gray-400">Hiệu quả: +${Math.round((fd.multiplier-1)*100)}% Sản lượng, -${Math.round((1-fd.time_multiplier)*100)}% Thời gian</div>
            </div>
            <div class="text-sm text-yellow-400 font-bold">Còn x${G.inventory[`fertilizer_${type}`] || 0}</div>
          </div>
        </button>`;
      }).join('')}
    </div>
    <button class="btn btn-green w-full py-2.5 text-base" data-action="confirm-fertilizer" ${selectedFertilizerType ? '' : 'disabled'} style="${selectedFertilizerType ? '' : 'opacity:.5;cursor:not-allowed;'}">🌿 Áp dụng</button>
  `;
}

function selectFertilizerType(type) {
  selectedFertilizerType = type;
  renderFertilizerViewContent();
}

function confirmFertilizer() {
  if (!selectedFertilizerType) { toast('Chọn loại phân trước!', 'error'); return; }
  const res = useFertilizer(fertilizePlotKey, selectedFertilizerType);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  toast(`🌿 Đã bón ${FERTILIZER_DATA[selectedFertilizerType].name}!`, 'success');
  render();
  goBackToDetails();
}

function goBackToDetails() {
  currentModalScreen = 'details';
  renderPlotModalContent();
}

function selectPlot(key) {
  const plot = G.plots[key];
  if (!plot || plot.locked) {
    toast('🔒 Ô đất này bị khóa!', 'error');
    return;
  }
  selectedPlot = key;
  currentModalScreen = 'details';
  renderGrid();
  document.getElementById('plotModal').style.display = 'flex';
  renderPlotModalContent();
}

function handleWater(key) {
  const res = waterPlant(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast('💧 Đã tưới nước!', 'success');
}

function handleCatchBug(key) {
  const res = catchBug(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast('👋 Đã bắt sâu!', 'success');
}

function handlePesticide(key) {
  const res = usePesticide(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast('🧪 Đã phun thuốc! (hiệu lực 24h)', 'success');
}

function handleHarvest(key) {
  const res = harvestPlant(key);
  if (res.ok) {
    closePlotModal();
    render();
    toast(`🌾 Thu hoạch ${res.qty} ${res.plant.name}! (+${res.qty * res.plant.sell_price_per_yield}🪙 nếu bán)`, 'success');
  } else {
    render();
    toast(res.msg, 'error');
  }
}

function handleRemoveDead(key) {
  const res = removeDead(key);
  if (res && res.ok) {
    closePlotModal();
    render();
    toast('🗑️ Đã dọn cây chết', 'info');
  } else if (res) {
    toast(res.msg, 'error');
  }
}

function handleClearPlot(key) {
  const up = G.plants[key];
  if (!up) return;
  const plant = PLANTS_DATA[up.plant_id];
  if (confirm(`Bạn có chắc chắn muốn cuốc đất để huỷ bỏ cây ${plant.name} không? (Hạt giống sẽ không được hoàn lại)`)) {
    const res = clearPlot(key);
    if (res.ok) {
      closePlotModal();
      render();
      toast('⛏️ Đã cuốc đất và huỷ cây thành công!', 'success');
    } else {
      toast(res.msg, 'error');
    }
  }
}

function handleBuyLand() {
  const res = buyLand(currentZone);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast(`🏗️ Đã mở thêm 3 ô đất! (-${res.price}🪙)`, 'success');
}

// ============================================================
// SHOP
// ============================================================
function showShopTab(tab) {
  shopTab = tab;
  document.querySelectorAll('.shop-tab').forEach(el => {
    el.classList.remove('active','text-yellow-400','border-b-2','border-yellow-400');
    el.classList.add('text-gray-400');
  });
  const activeTab = document.getElementById(tab === 'buy' ? 'tabBuy' : 'tabSell');
  activeTab.classList.add('active','text-yellow-400','border-b-2','border-yellow-400');
  activeTab.classList.remove('text-gray-400');
  renderShopContent();
}
function renderShopContent() {
  updateGold();
  const el = document.getElementById('shopContent');
  if (shopTab === 'buy') {
    el.innerHTML = renderBuyTab();
  } else {
    el.innerHTML = renderSellTab();
  }
}

function renderBuyTab() {
  const items = [];
  Object.values(PLANTS_DATA).filter(p=>p.season===G.season).forEach(p => {
    items.push({ type: 'seed', id: p.id, data: p });
  });
  [1,2,3].forEach(f => {
    items.push({ type: 'fertilizer', id: f.toString(), data: FERTILIZER_DATA[f] });
  });
  items.push({ type: 'pesticide', id: 'pesticide', data: { name: 'Thuốc trừ sâu', price: PESTICIDE_PRICE, emoji: '🧪' } });
  
  // Add Food items
  items.push({ type: 'food', id: 'bread', data: { name: 'Bánh mì', price: 1000, emoji: '🍞', energy: 10 } });
  items.push({ type: 'food', id: 'noodle', data: { name: 'Mì', price: 1800, emoji: '🍜', energy: 25 } });
  items.push({ type: 'food', id: 'rice', data: { name: 'Cơm', price: 4800, emoji: '🍚', energy: 50 } });

  if (!selectedShopItemId) selectedShopItemId = items[0].type + '_' + items[0].id;

  // Left column: list of items
  let listHtml = `<div class="w-1/2 md:w-3/5 overflow-y-auto pr-2" style="max-height: 60vh;">`;
  
  // Group by category for better UI
  listHtml += `<div class="font-bold text-yellow-400 mb-2 mt-2">🌱 Hạt giống</div>`;
  items.filter(i => i.type === 'seed').forEach(item => {
    const p = item.data;
    const isSelected = selectedShopItemId === `seed_${p.id}`;
    listHtml += `<div class="p-2 mb-1 rounded cursor-pointer flex justify-between items-center ${isSelected ? 'bg-yellow-900 border border-yellow-500' : 'bg-gray-800 hover:bg-gray-700'}" onclick="selectShopItem('seed_${p.id}')">
      <div>${p.emoji} ${p.name}</div>
      <div class="text-yellow-400 font-bold">${p.buy_price}🪙</div>
    </div>`;
  });

  listHtml += `<div class="font-bold text-yellow-400 mb-2 mt-4">🍞 Thực phẩm hồi năng lượng</div>`;
  items.filter(i => i.type === 'food').forEach(item => {
    const isSelected = selectedShopItemId === `${item.type}_${item.id}`;
    listHtml += `<div class="p-2 mb-1 rounded cursor-pointer flex justify-between items-center ${isSelected ? 'bg-yellow-900 border border-yellow-500' : 'bg-gray-800 hover:bg-gray-700'}" onclick="selectShopItem('${item.type}_${item.id}')">
      <div>${item.data.emoji} ${item.data.name}</div>
      <div class="text-yellow-400 font-bold">${item.data.price}🪙</div>
    </div>`;
  });

  listHtml += `<div class="font-bold text-yellow-400 mb-2 mt-4">🌿 Phân bón & Thuốc</div>`;
  items.filter(i => i.type === 'fertilizer' || i.type === 'pesticide').forEach(item => {
    const isSelected = selectedShopItemId === `${item.type}_${item.id}`;
    listHtml += `<div class="p-2 mb-1 rounded cursor-pointer flex justify-between items-center ${isSelected ? 'bg-yellow-900 border border-yellow-500' : 'bg-gray-800 hover:bg-gray-700'}" onclick="selectShopItem('${item.type}_${item.id}')">
      <div>${item.data.emoji} ${item.data.name}</div>
      <div class="text-yellow-400 font-bold">${item.data.price || PESTICIDE_PRICE}🪙</div>
    </div>`;
  });
  listHtml += `</div>`;

  // Right column: details
  let detailHtml = `<div class="w-1/2 md:w-2/5 pl-4 border-l border-gray-700 flex flex-col gap-4">`;
  const selectedItem = items.find(i => `${i.type}_${i.id}` === selectedShopItemId);
  if (selectedItem) {
    if (selectedItem.type === 'seed') {
      const p = selectedItem.data;
      const wrong = p.season !== G.season;
      detailHtml += `
        <div class="text-center">
          <div class="text-6xl mb-2">${p.emoji}</div>
          <div class="text-xl font-bold text-yellow-400">${p.name}</div>
          <div class="text-sm text-gray-400">Mùa ${SEASON_LABELS[p.season]}</div>
        </div>
        <div class="bg-gray-800 p-3 rounded text-sm space-y-2">
          <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${p.buy_price}🪙</span></div>
          <div class="flex justify-between"><span>Giá bán NS:</span> <span class="text-green-400">${p.sell_price_per_yield}🪙/sp</span></div>
          <div class="flex justify-between"><span>Sản lượng:</span> <span class="text-green-400">${p.base_yield}</span></div>
          <div class="flex justify-between"><span>Thời gian:</span> <span class="text-blue-400">${formatTime(p.growth_time * 60000)}</span></div>
          <div class="flex justify-between"><span>Khát nước:</span> <span class="text-blue-400">-${Math.round(p.water_consume_per_hour)}%/h</span></div>
          ${wrong ? `<div class="text-red-400 text-xs mt-2 text-center bg-red-900 bg-opacity-20 p-1 rounded">⚠️ Trái mùa: -50% sản lượng</div>` : `<div class="text-green-400 text-xs mt-2 text-center bg-green-900 bg-opacity-20 p-1 rounded">✅ Đang đúng mùa</div>`}
        </div>
        <div class="mt-auto flex flex-col gap-2">
          <button class="btn btn-green w-full py-2" onclick="shopBuy('seed', '${p.id}', 1)">Mua x1 (${p.buy_price}🪙)</button>
          <button class="btn btn-green w-full py-2" onclick="shopBuy('seed', '${p.id}', 5)">Mua x5 (${p.buy_price * 5}🪙)</button>
        </div>
      `;
    } else if (selectedItem.type === 'fertilizer') {
      const f = selectedItem.data;
      detailHtml += `
        <div class="text-center">
          <div class="text-6xl mb-2">${f.emoji}</div>
          <div class="text-xl font-bold text-yellow-400">${f.name}</div>
          <div class="text-sm text-gray-400">Dùng để bón cây</div>
        </div>
        <div class="bg-gray-800 p-3 rounded text-sm space-y-2">
          <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${f.price}🪙</span></div>
          <div class="flex flex-col mt-2">
            <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
            <span class="text-green-400">+${Math.round((f.multiplier-1)*100)}% Sản lượng</span>
            <span class="text-blue-400">-${Math.round((1-f.time_multiplier)*100)}% Thời gian lớn</span>
          </div>
        </div>
        <div class="mt-auto flex flex-col gap-2">
          <button class="btn btn-green w-full py-2" onclick="shopBuy('fertilizer', '${selectedItem.id}', 1)">Mua x1 (${f.price}🪙)</button>
          <button class="btn btn-green w-full py-2" onclick="shopBuy('fertilizer', '${selectedItem.id}', 5)">Mua x5 (${f.price * 5}🪙)</button>
        </div>
      `;
    } else if (selectedItem.type === 'pesticide') {
      detailHtml += `
        <div class="text-center">
          <div class="text-6xl mb-2">🧪</div>
          <div class="text-xl font-bold text-yellow-400">Thuốc trừ sâu</div>
          <div class="text-sm text-gray-400">Dùng để diệt sâu bọ</div>
        </div>
        <div class="bg-gray-800 p-3 rounded text-sm space-y-2">
          <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${PESTICIDE_PRICE}🪙</span></div>
          <div class="flex flex-col mt-2">
            <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
            <span class="text-green-400">Diệt sâu tức thì</span>
            <span class="text-blue-400">Bảo vệ 24h</span>
          </div>
        </div>
        <div class="mt-auto flex flex-col gap-2">
          <button class="btn btn-green w-full py-2" onclick="shopBuy('pesticide', '', 1)">Mua x1 (${PESTICIDE_PRICE}🪙)</button>
          <button class="btn btn-green w-full py-2" onclick="shopBuy('pesticide', '', 5)">Mua x5 (${PESTICIDE_PRICE * 5}🪙)</button>
        </div>
      `;
    } else if (selectedItem.type === 'food') {
      const f = selectedItem.data;
      detailHtml += `
        <div class="text-center">
          <div class="text-6xl mb-2">${f.emoji}</div>
          <div class="text-xl font-bold text-yellow-400">${f.name}</div>
          <div class="text-sm text-gray-400">Thực phẩm hồi năng lượng</div>
        </div>
        <div class="bg-gray-800 p-3 rounded text-sm space-y-2">
          <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${f.price}🪙</span></div>
          <div class="flex flex-col mt-2">
            <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
            <span class="text-cyan-400 font-bold">+${f.energy} ⚡ Năng lượng</span>
          </div>
        </div>
        <div class="mt-auto flex flex-col gap-2">
          <button class="btn btn-green w-full py-2" onclick="shopBuy('food', '${selectedItem.id}', 1)">Mua x1 (${f.price}🪙)</button>
          <button class="btn btn-green w-full py-2" onclick="shopBuy('food', '${selectedItem.id}', 5)">Mua x5 (${f.price * 5}🪙)</button>
        </div>
      `;
    }
  }
  detailHtml += `</div>`;

  return `<div class="flex flex-row w-full">${listHtml}${detailHtml}</div>`;
}

function selectShopItem(id) {
  selectedShopItemId = id;
  renderShopContent();
}

function renderSellTab() {
  const inv = G.inventory;
  const items = Object.keys(inv).filter(k => inv[k] > 0);
  if (items.length === 0) {
    return `<div class="text-center py-8 text-gray-400"><div class="text-4xl mb-2">🎒</div>Túi trống, không có gì để bán</div>`;
  }

  let html = `<table><thead><tr><th>Vật phẩm</th><th>Số lượng</th><th>Giá bán</th><th></th></tr></thead><tbody>`;
  items.forEach(k => {
    let name = k, price = 0, emoji = '📦';
    if (k.startsWith('harvest_')) {
      const p = PLANTS_DATA[k.replace('harvest_','')];
      if (p) { name = p.name + ' (nông sản)'; price = p.sell_price_per_yield; emoji = p.emoji; }
    } else if (k.startsWith('fertilizer_')) {
      const f = parseInt(k.replace('fertilizer_',''));
      const fd = FERTILIZER_DATA[f];
      if (fd) { name = fd.name; price = Math.floor(fd.price*0.5); emoji = fd.emoji; }
    } else if (k === 'pesticide') {
      name = 'Thuốc trừ sâu'; price = Math.floor(PESTICIDE_PRICE*0.5); emoji = '🧪';
    } else if (PLANTS_DATA[k]) {
      const p = PLANTS_DATA[k];
      name = p.name + ' (hạt giống)'; price = Math.floor(p.buy_price*0.5); emoji = p.emoji;
    }
    html += `<tr>
      <td>${emoji} ${name}</td>
      <td>x${inv[k]}</td>
      <td class="text-yellow-400">${price}🪙/cái</td>
      <td><div class="flex gap-1">
        <button class="btn btn-yellow text-xs px-2 py-1" onclick="shopSell('${k}',1)">Bán 1</button>
        <button class="btn btn-yellow text-xs px-2 py-1" onclick="shopSell('${k}',${inv[k]})">Bán hết</button>
      </div></td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function shopBuy(type, id, qty) {
  const res = buyItem(type, id, qty);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  updateGold();
  renderShopContent();
  toast(`✅ Đã mua (${res.cost}🪙)`, 'success');
}
function shopSell(key, qty) {
  const res = sellItem(key, qty);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  updateGold();
  renderShopContent();
  toast(`💰 Bán được ${res.revenue}🪙!`, 'success');
}

// ============================================================
// INVENTORY
// ============================================================
let selectedInventoryItem = null;

function renderInventoryContent() {
  const inv = G.inventory;
  const items = Object.keys(inv).filter(k => inv[k] > 0);
  const el = document.getElementById('inventoryContent');
  if (items.length === 0) {
    el.innerHTML = `<div class="text-center py-8 text-gray-400"><div class="text-4xl mb-2">🎒</div>Túi trống</div>`;
    return;
  }
  
  if (!selectedInventoryItem || !inv[selectedInventoryItem]) {
    selectedInventoryItem = items[0];
  }

  // Left column: grid of items
  let gridHtml = `<div class="w-full md:w-3/5 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 content-start pr-2 overflow-y-auto" style="max-height: 50vh;">`;
  items.forEach(k => {
    let name=k, emoji='📦', type='Khác';
    if (k.startsWith('harvest_')) {
      const p=PLANTS_DATA[k.replace('harvest_','')];
      if(p){name=p.name;emoji=p.emoji;type='Nông sản';}
    } else if (k.startsWith('fertilizer_')) {
      const f=parseInt(k.replace('fertilizer_',''));
      const fd=FERTILIZER_DATA[f];
      if(fd){name=fd.name;emoji=fd.emoji;type='Phân bón';}
    } else if (k==='pesticide') {
      name='Thuốc trừ sâu';emoji='🧪';type='Vật phẩm';
    } else if (PLANTS_DATA[k]) {
      const p=PLANTS_DATA[k];name=p.name;emoji=p.emoji;type='Hạt giống';
    } else if (k==='food_bread') {
      name='Bánh mì';emoji='🍞';type='Thực phẩm';
    } else if (k==='food_noodle') {
      name='Mì';emoji='🍜';type='Thực phẩm';
    } else if (k==='food_rice') {
      name='Cơm';emoji='🍚';type='Thực phẩm';
    }
    
    const isSelected = selectedInventoryItem === k;
    gridHtml += `
      <div class="relative flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer border-2 transition-all ${isSelected ? 'border-yellow-400 bg-yellow-900 bg-opacity-30' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}" style="aspect-ratio: 1;" onclick="selectInventoryItem('${k}')" title="${name}">
        <span style="font-size: 28px;">${emoji}</span>
        <span class="absolute bottom-1 right-1 text-[10px] font-bold text-yellow-400 bg-gray-900 px-1 rounded shadow">x${inv[k]}</span>
      </div>
    `;
  });
  gridHtml += `</div>`;

  // Right column: details
  let detailHtml = `<div class="w-full md:w-2/5 mt-4 md:mt-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col gap-4 pt-4 md:pt-0">`;
  const k = selectedInventoryItem;
  if (k) {
    let name=k, emoji='📦', type='Khác', desc='';
    if (k.startsWith('harvest_')) {
      const p=PLANTS_DATA[k.replace('harvest_','')];
      if(p){name=p.name;emoji=p.emoji;type='Nông sản';desc=`Giá bán: <span class="text-yellow-400">${p.sell_price_per_yield}🪙/cái</span><br><br><span class="text-green-400">💡 Có thể ăn để hồi phục +2 Năng lượng.</span>`;}
    } else if (k.startsWith('fertilizer_')) {
      const f=parseInt(k.replace('fertilizer_',''));
      const fd=FERTILIZER_DATA[f];
      if(fd){name=fd.name;emoji=fd.emoji;type='Phân bón';desc=`Giúp tăng <span class="text-green-400">${Math.round((fd.multiplier-1)*100)}% SL</span> và giảm <span class="text-blue-400">${Math.round((1-fd.time_multiplier)*100)}% thời gian</span> sinh trưởng của cây.`;}
    } else if (k==='pesticide') {
      name='Thuốc trừ sâu';emoji='🧪';type='Vật phẩm';desc=`Diệt sâu bọ ngay lập tức và bảo vệ cây khỏi sâu bệnh trong vòng <span class="text-blue-400">24 giờ</span>.`;
    } else if (PLANTS_DATA[k]) {
      const p=PLANTS_DATA[k];name=p.name;emoji=p.emoji;type='Hạt giống';desc=`Mùa thích hợp: <span class="text-yellow-400">${SEASON_LABELS[p.season]}</span><br>Thời gian sinh trưởng: <span class="text-blue-400">${formatTime(p.growth_time*60000)}</span><br>Sản lượng gốc: <span class="text-green-400">${p.base_yield}</span>`;
    } else if (k==='food_bread') {
      name='Bánh mì';emoji='🍞';type='Thực phẩm';desc=`Bánh mì thơm ngon giúp hồi phục <span class="text-cyan-400">+10 Năng lượng</span>.`;
    } else if (k==='food_noodle') {
      name='Mì';emoji='🍜';type='Thực phẩm';desc=`Bát mì ăn liền nóng hổi giúp hồi phục <span class="text-cyan-400">+25 Năng lượng</span>.`;
    } else if (k==='food_rice') {
      name='Cơm';emoji='🍚';type='Thực phẩm';desc=`Bát cơm nóng đầy đặn giúp hồi phục <span class="text-cyan-400">+50 Năng lượng</span>.`;
    }

    let eatGain = 0;
    if (k.startsWith('harvest_')) eatGain = 2;
    else if (k === 'food_bread') eatGain = 10;
    else if (k === 'food_noodle') eatGain = 25;
    else if (k === 'food_rice') eatGain = 50;

    let eatButton = '';
    if (eatGain > 0) {
      eatButton = `
        <div class="mt-4">
          <button class="btn btn-blue w-full py-2 font-bold" onclick="eatFood('${k}', ${eatGain})">🍽️ Ăn (+${eatGain} ⚡)</button>
        </div>
      `;
    }

    detailHtml += `
      <div class="text-center">
        <div class="text-6xl mb-2">${emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${name}</div>
        <div class="text-sm text-gray-400">Loại: ${type}</div>
        <div class="text-sm text-yellow-400 font-bold mt-1">Đang có: x${inv[k]}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded text-sm text-gray-300 mt-2 leading-relaxed">
        ${desc}
      </div>
      ${eatButton}
    `;
  }
  detailHtml += `</div>`;

  el.innerHTML = `<div class="flex flex-col md:flex-row w-full">${gridHtml}${detailHtml}</div>`;
}

function selectInventoryItem(k) {
  selectedInventoryItem = k;
  renderInventoryContent();
}

function eatFood(key, amount) {
  if (G.energy >= 100) {
    toast('⚡ Năng lượng đã đầy!', 'info');
    return;
  }
  if (!G.inventory[key] || G.inventory[key] <= 0) {
    toast('❌ Không có vật phẩm này!', 'error');
    return;
  }
  G.inventory[key]--;
  if (G.inventory[key] <= 0) delete G.inventory[key];
  G.energy = Math.min(100, G.energy + amount);
  saveState();
  updateGold();
  renderInventoryContent();
  toast(`🍽️ Đã ăn, hồi phục +${amount} ⚡!`, 'success');
}
window.eatFood = eatFood;


// ============================================================
// UTILS
// ============================================================
function formatTime(ms) {
  if (ms <= 0) return '0ph';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}ph`;
  return `${Math.floor(m/60)}h${m%60}ph`;
}

let toastTimer = {};
function toast(msg, type='info') {
  const container = document.getElementById('toast');
  const id = Date.now();
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function confirmResetGame() {
  if (!confirm('Bạn có muốn bắt đầu lại hoặc nạp file save khác? Dữ liệu hiện tại sẽ bị xóa sạch.')) return;
  resetGame();
  render();
  toast('🔄 Hãy chọn màn mới hoặc nạp file save', 'info');
}

function openStartSeasonModal() {
  document.getElementById('startSeasonModal').style.display = 'flex';
  renderStartSeasonContent();
}

function closeStartSeasonModal() {
  document.getElementById('startSeasonModal').style.display = 'none';
}

function renderStartSeasonContent() {
  const content = document.getElementById('startSeasonContent');
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

function exportSave() {
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

function handleImportSave(event) {
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
      
      // Update global game state
      G = window.GAME.loadState();
      window.GAME.G = G;
      window.GAME.syncUnlockedPlots();
      
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

function updateSeasonDisplay() {
  const select = document.getElementById('seasonSelect');
  if (select) select.value = G.season;
}

function updateDayDisplay() {
  const el = document.getElementById('dayDisplay');
  if (!el) return;
  el.textContent = `${getDayOfSeason(G.game_day)}/30`;
  updateClockDisplay();
}

function updateClockDisplay() {
  const clockEl = document.getElementById('gameClockDisplay');
  if (clockEl) {
    const elapsedMs = Date.now() - G.lastDayTick;
    const hours = Math.floor(elapsedMs / 3600000) % 24;
    const minutes = Math.floor((elapsedMs % 3600000) / 60000);
    clockEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

setInterval(updateClockDisplay, 1000);

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', (e) => {
    if (e.target === el) el.style.display = 'none';
  });
});

function switchView(viewId) {
  document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-yellow-400');
    btn.classList.add('text-gray-400');
  });
  const activeBtn = document.getElementById('nav-' + viewId);
  if (activeBtn) {
    activeBtn.classList.add('text-yellow-400');
    activeBtn.classList.remove('text-gray-400');
  }

  if (viewId === 'viewShop') {
    if (typeof shopTab === 'undefined' || !shopTab) showShopTab('buy');
    else renderShopContent();
  } else if (viewId === 'viewInventory') {
    renderInventoryContent();
  }
}

// Expose key UI interaction functions to global window object
window.closePlotModal = closePlotModal;
window.openPlantingView = openPlantingView;
window.selectSeed = selectSeed;
window.selectFert = selectFert;
window.confirmPlant = confirmPlant;
window.openFertilizerView = openFertilizerView;
window.selectFertilizerType = selectFertilizerType;
window.confirmFertilizer = confirmFertilizer;
window.goBackToDetails = goBackToDetails;
window.selectPlot = selectPlot;
window.handleWater = handleWater;
window.handleCatchBug = handleCatchBug;
window.handlePesticide = handlePesticide;
window.handleHarvest = handleHarvest;
window.handleRemoveDead = handleRemoveDead;
window.handleClearPlot = handleClearPlot;
window.handleBuyLand = handleBuyLand;
window.switchZone = switchZone;
window.showShopTab = showShopTab;

// Global Delegated Click Listener to handle dynamic DOM elements cleanly
document.addEventListener('click', (e) => {
  const target = e.target;

  // 1. Close plot modal
  if (target.closest('.close-plot-modal') || target.closest('[data-action="close-plot-modal"]')) {
    closePlotModal();
    e.preventDefault();
    return;
  }

  // 2. Select plot cell
  const plotCell = target.closest('.plot-cell');
  if (plotCell && plotCell.hasAttribute('data-plot-key')) {
    const key = plotCell.getAttribute('data-plot-key');
    selectPlot(key);
    e.preventDefault();
    return;
  }

  // 3. Switch zone tab
  const zoneTab = target.closest('.zone-tab');
  if (zoneTab && zoneTab.hasAttribute('data-zone-id')) {
    const zoneId = parseInt(zoneTab.getAttribute('data-zone-id'));
    switchZone(zoneId);
    e.preventDefault();
    return;
  }

  // 4. Action buttons inside plot modal
  const btn = target.closest('[data-action]');
  if (btn) {
    const action = btn.getAttribute('data-action');
    const plot = btn.getAttribute('data-plot') || selectedPlot;
    
    switch (action) {
      case 'close-plot-modal':
        closePlotModal();
        break;
      case 'open-planting-view':
        openPlantingView();
        break;
      case 'water-plant':
        handleWater(plot);
        break;
      case 'open-fertilizer-view':
        openFertilizerView();
        break;
      case 'harvest-plant':
        handleHarvest(plot);
        break;
      case 'catch-bug':
        handleCatchBug(plot);
        break;
      case 'pesticide-plant':
        handlePesticide(plot);
        break;
      case 'clear-plot':
        handleClearPlot(plot);
        break;
      case 'remove-dead':
        handleRemoveDead(plot);
        break;
      case 'go-back-to-details':
        goBackToDetails();
        break;
      case 'close-plot-modal-open-shop':
        closePlotModal();
        if (typeof openShop === 'function') openShop();
        else switchView('viewShop');
        break;
      case 'select-seed':
        const seedId = btn.getAttribute('data-seed-id');
        selectSeed(seedId);
        break;
      case 'select-fert':
        const fertId = parseInt(btn.getAttribute('data-fert-id'));
        selectFert(fertId);
        break;
      case 'confirm-plant':
        confirmPlant();
        break;
      case 'select-fertilizer-type':
        const fertType = parseInt(btn.getAttribute('data-fertilizer-type'));
        selectFertilizerType(fertType);
        break;
      case 'confirm-fertilizer':
        confirmFertilizer();
        break;
    }
    e.preventDefault();
  }
});