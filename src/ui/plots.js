// ============================================================
// PLOTS & CROPS UI MODULE
// ============================================================

import { toast, render, closePlotModal, formatTime, switchView } from './core.js';

export function renderCropsView() {
  let html = '<div class="space-y-6">';
  for (let z = 0; z < 3; z++) {
    const unlocked = G.plots_unlocked[z];
    const prevUnlocked = z > 0 ? G.plots_unlocked[z-1] : 36;
    const isZoneLocked = z > 0 && prevUnlocked < 36;

    html += `
      <div class="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 relative shadow-lg ${isZoneLocked ? 'opacity-50' : ''}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span class="font-bold text-yellow-400 text-sm sm:text-base flex items-center gap-1.5">
            <span>🏡 Khu đất ${z + 1}</span>
            <span class="text-xs bg-gray-900 border border-gray-700 px-2 py-0.5 rounded-full text-cyan-400 font-mono">
              ${unlocked}/36 ô đã mở
            </span>
          </span>
    `;

    if (isZoneLocked) {
      html += `
          <span class="text-xs text-red-400 font-semibold">🔒 Yêu cầu mở hết Khu ${z} trước</span>
        </div>
        <div class="flex items-center justify-center h-48 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
          <div class="text-center">
            <span class="text-4xl block mb-2">🔒</span>
            <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Khu đất chưa khai thác</span>
          </div>
        </div>
      </div>
      `;
      continue;
    }

    const totalUnlocked = G.plots_unlocked.reduce((a, b) => a + b, 0);
    const pIdx = Math.floor(totalUnlocked / 3);
    const price = LAND_PRICES[pIdx] ?? 999999;

    if (unlocked < 36) {
      html += `
          <button class="btn btn-green text-xs font-bold py-1.5 px-3 shadow-md" onclick="handleBuyLand(${z})">
            🏗️ Mở thêm 3 ô (+${price}🪙)
          </button>
      `;
    } else {
      html += `
          <span class="text-xs text-gray-500 font-bold">✓ Đã mở hết</span>
      `;
    }

    html += `
        </div>
        <!-- 2x2 Grid of 3x3 Plot blocks -->
        <div class="grid grid-cols-2 gap-3 max-w-full mx-auto" style="width: max-content;">
    `;

    // 4 quadrants: top-left, top-right, bottom-left, bottom-right
    const quadrants = [
      { rStart: 0, rEnd: 3, cStart: 0, cEnd: 3 },
      { rStart: 0, rEnd: 3, cStart: 3, cEnd: 6 },
      { rStart: 3, rEnd: 6, cStart: 0, cEnd: 3 },
      { rStart: 3, rEnd: 6, cStart: 3, cEnd: 6 }
    ];

    quadrants.forEach(q => {
      html += `<div class="grid grid-cols-3 gap-1">`;
      for (let r = q.rStart; r < q.rEnd; r++) {
        for (let c = q.cStart; c < q.cEnd; c++) {
          const i = r * 6 + c;
          const key = `${z}_${i}`;
          const plot = G.plots[key];
          const up = G.plants[key];
          const isSelected = selectedPlot === key;
          const cellSizeClass = "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14";

          if (!plot || plot.locked) {
            html += `
              <div class="plot-cell locked select-none flex items-center justify-center border border-gray-700/60 rounded-lg bg-gray-950/80 text-lg cursor-not-allowed ${cellSizeClass}" title="Ô đất bị khóa">
                🔒
              </div>
            `;
            continue;
          }

          if (!up) {
            html += `
              <div class="plot-cell empty select-none flex items-center justify-center border border-gray-700 rounded-lg bg-amber-950/40 text-2xl cursor-pointer hover:border-yellow-400 transition-all ${isSelected ? 'ring-2 ring-yellow-400 border-yellow-400' : ''} ${cellSizeClass}"
                data-plot-key="${key}" title="Ô trống - click để trồng cây" onclick="selectPlotCell('${key}')">
                🟫
              </div>
            `;
            continue;
          }

          const plant = PLANTS_DATA[up.plant_id];
          const waterPct = Math.round(up.current_water);
          const hasBug = !!up.bug_started_at;
          const statusClass = up.status === 0 ? 'growing' : up.status === 1 ? 'ready' : 'dead';
          const bugClass = hasBug ? 'bug' : '';
          const mainEmoji = up.status === 0 ? '🌱' : up.status === 1 ? plant.emoji : '💀';
          const statusEmoji = up.status === 1 ? '✨' : '';

          html += `
            <div class="plot-cell ${statusClass} ${bugClass} select-none flex flex-col justify-between p-1 border border-gray-700 rounded-lg bg-amber-950/40 cursor-pointer relative hover:border-yellow-400 transition-all ${isSelected ? 'ring-2 ring-yellow-400 border-yellow-400' : ''} ${cellSizeClass}"
              data-plot-key="${key}" title="${plant.name}" onclick="selectPlotCell('${key}')">
              
              <div class="flex-1 flex items-center justify-center w-full">
                <span class="text-xl sm:text-2xl display:block filter drop-shadow">${mainEmoji}</span>
              </div>

              ${(statusEmoji || hasBug) ? `<div class="absolute -top-1 -right-1 text-[10px] bg-gray-900 rounded-full px-1 border border-gray-700 shadow-lg z-10">${statusEmoji}${hasBug ? '🐛' : ''}</div>` : ''}
              
              <div style="width: 80%; height: 5px; background: rgba(0,0,0,0.65); border-radius: 9999px; overflow: hidden; margin: 2px auto 0 auto; flex-shrink: 0;">
                <div style="width: ${waterPct}%; height: 5px; background: #4fc3f7; border-radius: 9999px; transition: width 0.3s;"></div>
              </div>
            </div>
          `;
        }
      }
      html += `</div>`;
    });

    html += `
        </div>
      </div>
    `;
  }
  html += '</div>';
  return html;
}
window.renderCropsView = renderCropsView;

export function renderPlotModalContent() {
  const contentEl = document.getElementById('plotModalContent');
  const titleEl = document.getElementById('plotModalTitle');
  if (!selectedPlot || !contentEl || !titleEl) return;

  updatePlotNavigationButtons();

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

  let btnHtml = '';
  if (up.status === 2) {
    btnHtml = `
      <button class="btn btn-gray w-full py-2" data-action="remove-dead" data-plot="${selectedPlot}">🗑️ Dọn cây chết</button>
      <button class="btn btn-red w-full py-2" data-action="clear-plot" data-plot="${selectedPlot}">⛏️ Cuốc đất</button>
    `;
  } else {
    btnHtml += `<button class="btn btn-blue w-full py-2" data-action="water-plant" data-plot="${selectedPlot}">💧 Tưới nước</button>`;
    btnHtml += `<button class="btn btn-green w-full py-2" data-action="open-fertilizer-view">🌿 Bón phân</button>`;
    btnHtml += `<button class="btn btn-yellow w-full py-2" data-action="harvest-plant" data-plot="${selectedPlot}">🌾 Thu hoạch</button>`;
    btnHtml += `<button class="btn btn-green w-full py-2" data-action="catch-bug" data-plot="${selectedPlot}">👋 Bắt sâu thủ công</button>`;
    btnHtml += `<button class="btn btn-purple w-full py-2" data-action="pesticide-plant" data-plot="${selectedPlot}">🧪 T.diệt sâu (Còn x${G.inventory['pesticide'] || 0})</button>`;
    btnHtml += `<button class="btn btn-red w-full py-2" data-action="clear-plot" data-plot="${selectedPlot}">⛏️ Cuốc đất</button>`;
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
window.renderPlotModalContent = renderPlotModalContent;

export function renderFarmSummary() {
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
window.renderFarmSummary = renderFarmSummary;

export function openPlantingView() {
  plantingPlotKey = selectedPlot;
  selectedPlantId = null;
  selectedFert = 0;
  currentModalScreen = 'planting';
  renderPlantingViewContent();
}
window.openPlantingView = openPlantingView;

export function renderPlantingViewContent() {
  const contentEl = document.getElementById('plotModalContent');
  const titleEl = document.getElementById('plotModalTitle');
  if (!contentEl || !titleEl) return;
  titleEl.textContent = '🌱 Gieo Hạt';

  updatePlotNavigationButtons();

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
window.renderPlantingViewContent = renderPlantingViewContent;

export function selectSeed(pid) {
  selectedPlantId = pid;
  document.querySelectorAll('.plant-card').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`seed_${pid}`);
  if (el) el.classList.add('selected');
}
window.selectSeed = selectSeed;

export function selectFert(f) {
  selectedFert = f;
  renderPlantingViewContent();
}
window.selectFert = selectFert;

export function confirmPlant() {
  if (!selectedPlantId) { toast('Chọn hạt giống trước!', 'error'); return; }
  const result = plantSeed(plantingPlotKey, selectedPlantId);
  if (!result.ok) { toast(result.msg, 'error'); return; }
  toast(`🌱 Đã gieo ${PLANTS_DATA[selectedPlantId].name}!`, 'success');
  render();
  goBackToDetails();
}
window.confirmPlant = confirmPlant;

export function openFertilizerView() {
  fertilizePlotKey = selectedPlot;
  selectedFertilizerType = 0;
  currentModalScreen = 'fertilizing';
  renderFertilizerViewContent();
}
window.openFertilizerView = openFertilizerView;

export function renderFertilizerViewContent() {
  const contentEl = document.getElementById('plotModalContent');
  const titleEl = document.getElementById('plotModalTitle');
  if (!contentEl || !titleEl) return;
  titleEl.textContent = '🌿 Bón phân';

  updatePlotNavigationButtons();

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
window.renderFertilizerViewContent = renderFertilizerViewContent;

export function selectFertilizerType(type) {
  selectedFertilizerType = type;
  renderFertilizerViewContent();
}
window.selectFertilizerType = selectFertilizerType;

export function confirmFertilizer() {
  if (!selectedFertilizerType) { toast('Chọn loại phân trước!', 'error'); return; }
  const res = useFertilizer(fertilizePlotKey, selectedFertilizerType);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  toast(`🌿 Đã bón ${FERTILIZER_DATA[selectedFertilizerType].name}!`, 'success');
  render();
  goBackToDetails();
}
window.confirmFertilizer = confirmFertilizer;

export function goBackToDetails() {
  currentModalScreen = 'details';
  renderPlotModalContent();
}
window.goBackToDetails = goBackToDetails;

export function selectPlot(key) {
  const plot = G.plots[key];
  if (!plot || plot.locked) {
    toast('🔒 Ô đất này bị khóa!', 'error');
    return;
  }
  selectedPlot = key;
  currentModalScreen = 'details';
  render();
  const modal = document.getElementById('plotModal');
  if (modal) modal.style.display = 'flex';
  renderPlotModalContent();
}
window.selectPlot = selectPlot;

export function handleWater(key) {
  const res = waterPlant(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast('💧 Đã tưới nước!', 'success');
}
window.handleWater = handleWater;

export function handleCatchBug(key) {
  const res = catchBug(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast('👋 Đã bắt sâu!', 'success');
}
window.handleCatchBug = handleCatchBug;

export function handlePesticide(key) {
  const res = usePesticide(key);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast('🧪 Đã phun thuốc! (hiệu lực 24h)', 'success');
}
window.handlePesticide = handlePesticide;

export function handleHarvest(key) {
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
window.handleHarvest = handleHarvest;

export function handleRemoveDead(key) {
  const res = removeDead(key);
  if (res && res.ok) {
    closePlotModal();
    render();
    toast('🗑️ Đã dọn cây chết', 'info');
  } else if (res) {
    toast(res.msg, 'error');
  }
}
window.handleRemoveDead = handleRemoveDead;

export function handleClearPlot(key) {
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
window.handleClearPlot = handleClearPlot;

export function handleBuyLand() {
  const res = buyLand(currentZone);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  render();
  toast(`🏗️ Đã mở thêm 3 ô đất! (-${res.price}🪙)`, 'success');
}
window.handleBuyLand = handleBuyLand;

export function getNavigationPlots(currentKey) {
  const parts = currentKey.split('_');
  const z = parts[0] !== undefined ? parseInt(parts[0]) : 0;
  const i = parts[1] !== undefined ? parseInt(parts[1]) : 0;
  
  const currentIndex = z * 36 + i;
  
  let prevKey = null;
  let prevActive = false;
  if (currentIndex > 0) {
    const pZ = Math.floor((currentIndex - 1) / 36);
    const pI = (currentIndex - 1) % 36;
    prevKey = `${pZ}_${pI}`;
    const pPlot = G.plots[prevKey];
    if (pPlot && !pPlot.locked) {
      prevActive = true;
    }
  }
  
  let nextKey = null;
  let nextActive = false;
  if (currentIndex < 107) {
    const nZ = Math.floor((currentIndex + 1) / 36);
    const nI = (currentIndex + 1) % 36;
    nextKey = `${nZ}_${nI}`;
    const nPlot = G.plots[nextKey];
    if (nPlot && !nPlot.locked) {
      nextActive = true;
    }
  }
  
  return {
    prevKey,
    prevActive,
    nextKey,
    nextActive
  };
}
window.getNavigationPlots = getNavigationPlots;

export function updatePlotNavigationButtons() {
  const btnPrev = document.getElementById('btnPrevPlot');
  const btnNext = document.getElementById('btnNextPlot');
  if (!btnPrev || !btnNext || !selectedPlot) return;
  
  const nav = getNavigationPlots(selectedPlot);
  
  btnPrev.disabled = !nav.prevActive;
  btnNext.disabled = !nav.nextActive;
}
window.updatePlotNavigationButtons = updatePlotNavigationButtons;

export function navigatePlot(dir) {
  if (!selectedPlot) return;
  const nav = getNavigationPlots(selectedPlot);
  const targetKey = dir === 'prev' ? nav.prevKey : nav.nextKey;
  const targetActive = dir === 'prev' ? nav.prevActive : nav.nextActive;
  
  if (targetActive && targetKey) {
    selectedPlot = targetKey;
    renderPlotModalContent();
    renderFarmGridArea();
  }
}
window.navigatePlot = navigatePlot;

// Global Delegated Click Listener to handle dynamic DOM elements cleanly
document.addEventListener('click', (e) => {
  const target = e.target;

  if (target.closest('.close-plot-modal') || target.closest('[data-action="close-plot-modal"]')) {
    closePlotModal();
    e.preventDefault();
    return;
  }

  const plotCell = target.closest('.plot-cell');
  if (plotCell && plotCell.hasAttribute('data-plot-key')) {
    const key = plotCell.getAttribute('data-plot-key');
    selectPlot(key);
    e.preventDefault();
    return;
  }

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
        switchView('viewShop');
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
