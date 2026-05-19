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
  const shopGold = document.getElementById('shopGold');
  if (shopGold) shopGold.textContent = G.gold.toLocaleString('vi');
}

function renderZoneTabs() {
  const names = ['🏡 Khu 1', '🌿 Khu 2', '🌳 Khu 3'];
  document.getElementById('zoneTabs').innerHTML = names.map((n,i) => `
    <div class="zone-tab ${i===currentZone?'active':''}" onclick="switchZone(${i})">${n}
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
        onclick="selectPlot('${key}')" title="Ô trống - click để trồng cây">🟫</div>`;
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
      onclick="selectPlot('${key}')" title="${plant.name}">
      <span style="font-size:20px">${mainEmoji}</span>
      <span>${statusEmoji}${hasBug?'🐛':''}</span>
      <div class="water-bar"><div class="water-fill" style="width:${waterPct}%"></div></div>
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

function renderSidebar() {
  renderPlotInfo();
  renderFarmSummary();
}

function renderPlotInfo() {
  const infoEl = document.getElementById('plotInfo');
  const actEl = document.getElementById('quickActions');
  const btnsEl = document.getElementById('actionButtons');

  if (!selectedPlot) {
    infoEl.textContent = 'Chọn một ô đất để xem thông tin';
    actEl.style.display = 'none';
    return;
  }

  const plot = G.plots[selectedPlot];
  if (plot.locked) {
    infoEl.innerHTML = '<span class="text-red-400">🔒 Ô đất bị khóa</span>';
    actEl.style.display = 'none';
    return;
  }

  const up = G.plants[selectedPlot];
  if (!up) {
    infoEl.innerHTML = `<div class="text-gray-400">🟫 Ô trống</div>
      <div class="text-xs text-gray-500 mt-1">Ô ${parseInt(selectedPlot.split('_')[1])+1}</div>`;
    btnsEl.innerHTML = `<button class="btn btn-green w-full" onclick="openPlantModal('${selectedPlot}')">🌱 Trồng cây</button>`;
    actEl.style.display = '';
    return;
  }

  const plant = PLANTS_DATA[up.plant_id];
  const waterPct = Math.round(up.current_water);
  const grossY = calcGrossYield(up, plant);
  const netY = calcNetYield(up);
  const statusText = up.status === 0 ? '<span class="text-green-400">🌱 Sinh trưởng</span>'
    : up.status === 1 ? '<span class="text-yellow-400">✨ Sẵn sàng thu hoạch</span>'
    : '<span class="text-red-400">💀 Đã chết</span>';
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

  infoEl.innerHTML = `
    <div class="font-bold text-yellow-400 text-base">${plant.emoji} ${plant.name}</div>
    <div class="mt-1">${statusText} ${wrongSeason}</div>
    ${timeInfo ? `<div class="text-xs mt-1">${timeInfo}</div>` : ''}
    <div class="mt-2 space-y-1 text-xs">
      <div>💧 Nước: <span class="${waterPct<=20?'text-red-400':waterPct<=50?'text-yellow-400':'text-blue-400'}">${waterPct}%</span></div>
      <div>🌾 Sản lượng: <span class="text-green-400">${netY}</span><span class="text-gray-500">/${Math.round(grossY)}</span></div>
      ${up.bug_started_at ? '<div class="text-red-400">🐛 Đang có sâu!</div>' : ''}
      ${up.pesticide_until && up.pesticide_until > now ? '<div class="text-green-400">🛡️ Thuốc còn hiệu lực</div>' : ''}
      <div>🌱 Phân: ${FERTILIZER_DATA[up.fertilizer_type]?.name || 'Không có'}</div>
    </div>
  `;

  // Action buttons
  let btnHtml = '';
  if (up.status === 2) {
    btnHtml = `<button class="btn btn-gray w-full" onclick="handleRemoveDead('${selectedPlot}')">🗑️ Dọn cây chết</button>`;
  } else {
    if (up.status === 1) {
      btnHtml += `<button class="btn btn-yellow w-full" onclick="handleHarvest('${selectedPlot}')">🌾 Thu hoạch</button>`;
    }
    if (waterPct <= 50) {
      btnHtml += `<button class="btn btn-blue w-full" onclick="handleWater('${selectedPlot}')">💧 Tưới nước</button>`;
    } else {
      btnHtml += `<button class="btn btn-gray w-full" style="cursor:not-allowed;opacity:.5" title="Nước > 50%, chưa cần tưới">💧 Tưới nước</button>`;
    }
    if (hasFertilizerUpgrade(up)) {
      btnHtml += `<button class="btn btn-green w-full" onclick="openFertilizerModal('${selectedPlot}')">🌿 Bón phân</button>`;
    }
    if (up.bug_started_at) {
      btnHtml += `<button class="btn btn-green w-full" onclick="handleCatchBug('${selectedPlot}')">👋 Bắt sâu thủ công</button>`;
      if (G.inventory['pesticide'] > 0) {
        btnHtml += `<button class="btn btn-purple w-full" onclick="handlePesticide('${selectedPlot}')">🧪 Phun thuốc (${G.inventory['pesticide']})</button>`;
      }
    }
  }
  btnsEl.innerHTML = btnHtml;
  actEl.style.display = '';
}

function renderFarmSummary() {
  const plants = Object.values(G.plants);
  const growing = plants.filter(p=>p.status===0).length;
  const ready = plants.filter(p=>p.status===1).length;
  const dead = plants.filter(p=>p.status===2).length;
  const bugs = plants.filter(p=>p.bug_started_at).length;
  document.getElementById('farmSummary').innerHTML = `
    <div class="flex justify-between"><span class="text-gray-400">🌱 Đang trồng</span><span>${growing}</span></div>
    <div class="flex justify-between"><span class="text-gray-400">✨ Có thể thu</span><span class="text-yellow-400">${ready}</span></div>
    <div class="flex justify-between"><span class="text-gray-400">💀 Đã chết</span><span class="text-red-400">${dead}</span></div>
    <div class="flex justify-between"><span class="text-gray-400">🐛 Đang có sâu</span><span class="text-red-400">${bugs}</span></div>
  `;
}

// ============================================================
// PLANT MODAL
// ============================================================
function openPlantModal(plotKey) {
  plantingPlotKey = plotKey;
  selectedPlantId = null;
  selectedFert = 0;
  const modal = document.getElementById('plantModal');
  const content = document.getElementById('plantModalContent');

  let mySeeds = Object.keys(G.inventory).filter(k => PLANTS_DATA[k] && G.inventory[k] > 0);
  mySeeds = mySeeds.filter(k => PLANTS_DATA[k].season === G.season);

  if (mySeeds.length === 0) {
    content.innerHTML = `<div class="text-center py-8 text-gray-400">
      <div class="text-4xl mb-3">😢</div>
      <div>Bạn không có hạt giống nào cho mùa ${SEASON_LABELS[G.season]}!</div>
      <div class="text-sm mt-2">Hãy mua hạt giống ở tiệm tạp hóa</div>
      <button class="btn btn-yellow mt-4" onclick="closePlantModal();openShop()">🏪 Đến tiệm</button>
    </div>`;
    modal.style.display = 'flex';
    return;
  }

  renderPlantModalContent(mySeeds);
  modal.style.display = 'flex';
}

function renderPlantModalContent(mySeeds) {
  mySeeds = mySeeds || Object.keys(G.inventory).filter(k => PLANTS_DATA[k] && G.inventory[k] > 0 && PLANTS_DATA[k].season === G.season);
  const content = document.getElementById('plantModalContent');

  // My fertilizers
  const myFerts = [0,1,2,3].filter(f => f===0 || (G.inventory[`fertilizer_${f}`]>0));

  content.innerHTML = `
    <div class="mb-3 text-sm text-gray-400">🌾 Chọn cây để trồng (mùa hiện tại: <span class="text-yellow-400">${SEASON_LABELS[G.season]}</span>)</div>
    <div class="grid grid-cols-2 gap-2 mb-4" id="seedPicker">
      ${mySeeds.map(pid => {
        const p = PLANTS_DATA[pid];
        const wrong = p.season !== G.season;
        const fert = FERTILIZER_DATA[selectedFert || 0];
        const actTime = p.growth_time * 60000 * (fert ? fert.time_multiplier : 1.0);
        const actYield = Math.round(p.base_yield * (fert ? fert.multiplier : 1.0));
        return `<div class="plant-card ${wrong?'wrong-season':''} ${selectedPlantId===pid?'selected':''}" id="seed_${pid}" onclick="selectSeed('${pid}')">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${p.emoji}</span>
            <div>
              <div class="font-bold text-sm">${p.name}</div>
              <div class="text-xs text-gray-400">${SEASON_LABELS[p.season]} · x${G.inventory[pid]}</div>
            </div>
          </div>
          <div class="mt-1 text-xs text-gray-500 flex gap-3">
            <span class="${selectedFert>0?'text-blue-400':''}">⏱️${formatTime(actTime)}</span>
            <span class="${selectedFert>0?'text-green-400':''}">🌾${actYield}</span>
            <span>💧-${p.water_consume_per_hour}%/h</span>
          </div>
          ${wrong?'<div class="text-xs text-red-400 mt-1">⚠️ Trái mùa: -50% sản lượng</div>':''}
        </div>`;
      }).join('')}
    </div>

    <div class="mb-4">
      <div class="text-sm text-gray-400 mb-2">🌿 Phân bón (tùy chọn)</div>
      <div class="flex gap-2 flex-wrap" id="fertPicker">
        ${myFerts.map(f => {
          const fd = FERTILIZER_DATA[f];
          return `<button class="px-3 py-1 rounded-lg border text-sm font-bold transition fert-btn ${f===0?'border-yellow-400 bg-yellow-400 bg-opacity-10':' border-gray-600'}"
            id="fert_${f}" onclick="selectFert(${f})">
            ${f===0?'Không':''}${f>0?fd.emoji:''} ${fd.name} ${f>0?`(x${G.inventory['fertilizer_'+f]})`:''}</button>`;
        }).join('')}
      </div>
    </div>

    <button class="btn btn-green w-full text-base" onclick="confirmPlant()">🌱 Gieo hạt</button>
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
  renderPlantModalContent();
}

function confirmPlant() {
  if (!selectedPlantId) { toast('Chọn hạt giống trước!', 'error'); return; }
  const result = plantSeed(plantingPlotKey, selectedPlantId, selectedFert);
  if (!result.ok) { toast(result.msg, 'error'); return; }
  closePlantModal();
  render();
  toast(`🌱 Đã gieo ${PLANTS_DATA[selectedPlantId].name}!`, 'success');
}

function closePlantModal() {
  document.getElementById('plantModal').style.display = 'none';
}

// ============================================================
// PLOT ACTIONS
// ============================================================
function selectPlot(key) {
  selectedPlot = key;
  renderGrid();
  renderSidebar();
}

function handleWater(key) {
  const res = waterPlant(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render(); toast('💧 Đã tưới nước!', 'success');
}
function handleCatchBug(key) {
  const res = catchBug(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render(); toast('👋 Đã bắt sâu!', 'success');
}
function handlePesticide(key) {
  const res = usePesticide(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render(); toast('🧪 Đã phun thuốc! (hiệu lực 24h)', 'success');
}
function hasFertilizerUpgrade(up) {
  const current = up.fertilizer_type || 0;
  return [1,2,3].some(type => type > current && G.inventory[`fertilizer_${type}`] > 0);
}
function openFertilizerModal(plotKey) {
  fertilizePlotKey = plotKey;
  selectedFertilizerType = 0;
  renderFertilizerModalContent();
  document.getElementById('fertilizerModal').style.display = 'flex';
}
function closeFertilizerModal() {
  document.getElementById('fertilizerModal').style.display = 'none';
}
function renderFertilizerModalContent() {
  const content = document.getElementById('fertilizerModalContent');
  if (!fertilizePlotKey || !G.plants[fertilizePlotKey]) {
    content.innerHTML = `<div class="text-center py-8 text-gray-400">Không có cây để bón phân.</div>`;
    return;
  }
  const up = G.plants[fertilizePlotKey];
  const currentType = up.fertilizer_type || 0;
  const available = [1,2,3].filter(type => type > currentType && G.inventory[`fertilizer_${type}`] > 0);
  if (available.length === 0) {
    content.innerHTML = `<div class="text-center py-8 text-gray-400">Không có phân bón phù hợp hoặc cây đã dùng phân tốt nhất.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="mb-3 text-sm text-gray-400">Chọn phân bón để áp dụng cho cây hiện tại.</div>
    <div class="grid grid-cols-1 gap-2 mb-4" id="fertilizerPicker">
      ${available.map(type => {
        const fd = FERTILIZER_DATA[type];
        return `<button class="fert-option-btn w-full text-left rounded-lg border px-3 py-3 ${selectedFertilizerType===type?'border-yellow-400 bg-yellow-400 bg-opacity-10':'border-gray-600'}" onclick="selectFertilizerType(${type})">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-bold">${fd.emoji} ${fd.name}</div>
              <div class="text-xs text-gray-400">Hiệu quả +${Math.round((fd.multiplier-1)*100)}% SL, -${Math.round((1-fd.time_multiplier)*100)}% TG</div>
            </div>
            <div class="text-sm text-yellow-400">x${G.inventory[`fertilizer_${type}`] || 0}</div>
          </div>
        </button>`;
      }).join('')}
    </div>
    <div class="flex gap-2">
      <button class="btn btn-green w-full" onclick="confirmFertilizer()" ${selectedFertilizerType ? '' : 'disabled'} style="${selectedFertilizerType ? '' : 'opacity:.5;cursor:not-allowed;'}">🌿 Áp dụng</button>
      <button class="btn btn-gray w-full" onclick="closeFertilizerModal()">Hủy</button>
    </div>
  `;
}
function selectFertilizerType(type) {
  selectedFertilizerType = type;
  renderFertilizerModalContent();
}
function confirmFertilizer() {
  if (!selectedFertilizerType) { toast('Chọn loại phân trước!', 'error'); return; }
  const res = useFertilizer(fertilizePlotKey, selectedFertilizerType);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  closeFertilizerModal();
  render();
  toast(`🌿 Đã bón ${FERTILIZER_DATA[selectedFertilizerType].name}!`, 'success');
}
function handleHarvest(key) {
  const res = harvestPlant(key);
  if (res.ok) {
    selectedPlot = null;
    render();
    toast(`🌾 Thu hoạch ${res.qty} ${res.plant.name}! (+${res.qty * res.plant.sell_price_per_yield}🪙 nếu bán)`, 'success');
  } else {
    render(); toast(res.msg, 'error');
  }
}
function handleRemoveDead(key) {
  removeDead(key);
  selectedPlot = null;
  render(); toast('🗑️ Đã dọn cây chết', 'info');
}
function handleBuyLand() {
  const res = buyLand(currentZone);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render(); toast(`🏗️ Đã mở thêm 3 ô đất! (-${res.price}🪙)`, 'success');
}

// ============================================================
// SHOP
// ============================================================
function openShop() {
  document.getElementById('shopModal').style.display = 'flex';
  showShopTab('buy');
}
function closeShop() {
  document.getElementById('shopModal').style.display = 'none';
}
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

  listHtml += `<div class="font-bold text-yellow-400 mb-2 mt-4">🌿 Phân bón & Thuốc</div>`;
  items.filter(i => i.type !== 'seed').forEach(item => {
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
          <div class="flex justify-between"><span>Khát nước:</span> <span class="text-blue-400">-${p.water_consume_per_hour}%/h</span></div>
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
// INVENTORY MODAL
// ============================================================
function openInventory() {
  document.getElementById('inventoryModal').style.display = 'flex';
  renderInventoryContent();
}
function closeInventory() {
  document.getElementById('inventoryModal').style.display = 'none';
}
function renderInventoryContent() {
  const inv = G.inventory;
  const items = Object.keys(inv).filter(k => inv[k] > 0);
  const el = document.getElementById('inventoryContent');
  if (items.length === 0) {
    el.innerHTML = `<div class="text-center py-8 text-gray-400"><div class="text-4xl mb-2">🎒</div>Túi trống</div>`;
    return;
  }
  let html = `<table><thead><tr><th>Vật phẩm</th><th>Số lượng</th><th>Loại</th></tr></thead><tbody>`;
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
    }
    html += `<tr><td>${emoji} ${name}</td><td class="text-yellow-400 font-bold">x${inv[k]}</td><td class="text-gray-400 text-xs">${type}</td></tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML = html;
}

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

function toggleMobileMenu() {
  if (window.innerWidth >= 1024) return;
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');
  if (menu && overlay) {
    menu.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
  }
}