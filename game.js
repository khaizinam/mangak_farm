// ============================================================
// GAME DATA — MASTER DATA
// ============================================================
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_LABELS = { spring: '🌸 Xuân', summer: '☀️ Hạ', autumn: '🍂 Thu', winter: '❄️ Đông' };

const PLANTS_DATA = {
  // --- XUÂN ---
  p01: { id:'p01', name:'Dâu tây', season:'spring', buy_price:30, sell_price_per_yield:18, base_yield:8, growth_time:15, rot_time:60, water_consume_per_hour:667, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🍓' },
  p02: { id:'p02', name:'Cải xanh', season:'spring', buy_price:200, sell_price_per_yield:35, base_yield:120, growth_time:360, rot_time:720, water_consume_per_hour:28, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🥬' },
  p03: { id:'p03', name:'Hoa tulip', season:'spring', buy_price:600, sell_price_per_yield:45, base_yield:250, growth_time:720, rot_time:1440, water_consume_per_hour:14, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🌷' },
  p04: { id:'p04', name:'Cà rốt', season:'spring', buy_price:1500, sell_price_per_yield:50, base_yield:600, growth_time:1440, rot_time:2880, water_consume_per_hour:7, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🥕' },
  // --- HẠ ---
  p05: { id:'p05', name:'Cà chua', season:'summer', buy_price:40, sell_price_per_yield:16, base_yield:10, growth_time:15, rot_time:60, water_consume_per_hour:667, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🍅' },
  p06: { id:'p06', name:'Ớt chuông', season:'summer', buy_price:250, sell_price_per_yield:35, base_yield:130, growth_time:360, rot_time:720, water_consume_per_hour:28, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🫑' },
  p07: { id:'p07', name:'Ngô', season:'summer', buy_price:700, sell_price_per_yield:45, base_yield:280, growth_time:720, rot_time:1440, water_consume_per_hour:14, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🌽' },
  p08: { id:'p08', name:'Dưa hấu', season:'summer', buy_price:1800, sell_price_per_yield:55, base_yield:650, growth_time:1440, rot_time:2880, water_consume_per_hour:7, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🍉' },
  // --- THU ---
  p09: { id:'p09', name:'Cà tím', season:'autumn', buy_price:35, sell_price_per_yield:17, base_yield:9, growth_time:15, rot_time:60, water_consume_per_hour:667, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🍆' },
  p10: { id:'p10', name:'Khoai lang', season:'autumn', buy_price:220, sell_price_per_yield:36, base_yield:125, growth_time:360, rot_time:720, water_consume_per_hour:28, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🍠' },
  p11: { id:'p11', name:'Táo', season:'autumn', buy_price:650, sell_price_per_yield:46, base_yield:260, growth_time:720, rot_time:1440, water_consume_per_hour:14, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🍎' },
  p12: { id:'p12', name:'Bí ngô', season:'autumn', buy_price:2000, sell_price_per_yield:52, base_yield:700, growth_time:1440, rot_time:2880, water_consume_per_hour:7, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🎃' },
  // --- ĐÔNG ---
  p13: { id:'p13', name:'Cải bắp', season:'winter', buy_price:45, sell_price_per_yield:15, base_yield:11, growth_time:15, rot_time:60, water_consume_per_hour:667, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🥦' },
  p14: { id:'p14', name:'Hành tây', season:'winter', buy_price:260, sell_price_per_yield:34, base_yield:140, growth_time:360, rot_time:720, water_consume_per_hour:28, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🧅' },
  p15: { id:'p15', name:'Củ cải', season:'winter', buy_price:750, sell_price_per_yield:44, base_yield:290, growth_time:720, rot_time:1440, water_consume_per_hour:14, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'⬜' },
  p16: { id:'p16', name:'Gừng', season:'winter', buy_price:2200, sell_price_per_yield:50, base_yield:800, growth_time:1440, rot_time:2880, water_consume_per_hour:7, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🫚' },
};

const FERTILIZER_DATA = {
  0: { name:'Không có', multiplier:1.0, time_multiplier:1.0, price:0 },
  1: { name:'Phân thường', multiplier:1.2, time_multiplier:0.9, price:50, emoji:'🟤' },
  2: { name:'Phân tốt', multiplier:1.5, time_multiplier:0.8, price:150, emoji:'🟠' },
  3: { name:'Phân cao cấp', multiplier:2.0, time_multiplier:0.7, price:400, emoji:'⭐' },
};

const PESTICIDE_PRICE = 30;
const PESTICIDE_DURATION_MS = 24 * 60 * 60 * 1000; // 24h
const REAL_MS_PER_GAME_DAY = 24 * 60 * 60 * 1000; // 1 ngày thực = 1 ngày game

// Giá mua ô đất theo từng batch (3 ô mỗi lần)
const LAND_PRICES = [0];
let _currentPrice = 12000;
for (let i = 1; i <= 36; i++) {
  LAND_PRICES.push(_currentPrice);
  _currentPrice *= 2; // tăng luỹ tiến gấp đôi
}

// ============================================================
// GAME STATE — DEFAULT
// ============================================================
function defaultState() {
  const now = Date.now();
  return {
    gold: 500,
    season: 'spring',
    game_day: 1,
    lastDayTick: now,
    needsStartSeason: true,
    inventory: {}, // { plantId: qty, 'fertilizer_1': qty, ... }
    // 3 khu đất, mỗi khu 36 ô (6x6). Mặc định mở 3 ô đầu khu 1
    plots: buildPlots(),
    // Số batch đã mua (mỗi khu 4 batch = 12 ô, trừ 2 batch đầu free)
    // plots_unlocked[zoneIndex] = số ô đã mở (3,6,9,12...36)
    plots_unlocked: [3, 0, 0],
    // Cây đang trồng: { plotKey: userPlant }
    plants: {},
    lastAutoCheck: now,
  };
}

function buildPlots() {
  // 3 zones, 36 ô mỗi zone
  const plots = {};
  for (let z = 0; z < 3; z++) {
    for (let i = 0; i < 36; i++) {
      plots[`${z}_${i}`] = { zone: z, index: i, locked: true };
    }
  }
  return plots;
}

// ============================================================
// STORAGE
// ============================================================
const SAVE_KEY = 'mangak_farm_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      const state = defaultState();
      state.needsStartSeason = true;
      return state;
    }
    const s = JSON.parse(raw);
    // Migrate nếu thiếu field
    if (!s.plots_unlocked) s.plots_unlocked = [3, 0, 0];
    if (!s.inventory) s.inventory = {};
    if (typeof s.game_day !== 'number' || s.game_day < 1) s.game_day = 1;
    if (!s.lastDayTick) s.lastDayTick = Date.now();
    if (!s.season) s.season = getSeasonFromDay(s.game_day);
    if (typeof s.needsStartSeason !== 'boolean') s.needsStartSeason = false;
    return s;
  } catch {
    const state = defaultState();
    state.needsStartSeason = true;
    return state;
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(G));
}

function getSeasonFromDay(day) {
  const index = Math.floor((day - 1) / 30) % SEASONS.length;
  return SEASONS[index];
}

function getDayOfSeason(day) {
  return ((day - 1) % 30) + 1;
}

function updateSeasonClock() {
  const now = Date.now();
  const elapsed = now - G.lastDayTick;
  if (elapsed < REAL_MS_PER_GAME_DAY) return false;
  const daysPassed = Math.floor(elapsed / REAL_MS_PER_GAME_DAY);
  G.game_day += daysPassed;
  G.lastDayTick += daysPassed * REAL_MS_PER_GAME_DAY;
  const newSeason = getSeasonFromDay(G.game_day);
  const changed = newSeason !== G.season;
  G.season = newSeason;
  saveState();
  return changed;
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  G = defaultState();
  syncUnlockedPlots();
  saveState();
  openStartSeasonModal();
}

function setStartSeason(season) {
  const seasonIndex = SEASONS.indexOf(season);
  if (seasonIndex === -1) return;
  G.game_day = seasonIndex * 30 + 1;
  G.season = season;
  G.lastDayTick = Date.now();
  G.needsStartSeason = false;
  syncUnlockedPlots();
  saveState();
  render();
  closeStartSeasonModal();
  toast(`Bắt đầu từ ${SEASON_LABELS[season]} - ngày ${getDayOfSeason(G.game_day)}/30`, 'success');
}

// ============================================================
// GAME INSTANCE
// ============================================================
let G = loadState();

// Sync unlocked plots vào plots object
function syncUnlockedPlots() {
  for (let z = 0; z < 3; z++) {
    const unlocked = G.plots_unlocked[z];
    for (let i = 0; i < 36; i++) {
      G.plots[`${z}_${i}`].locked = i >= unlocked;
    }
  }
}
syncUnlockedPlots();

// ============================================================
// LAZY UPDATE ENGINE
// ============================================================
function lazyUpdatePlant(up) {
  const plant = PLANTS_DATA[up.plant_id];
  if (!plant) return up;
  const now = Date.now();
  const elapsed_ms = now - up.last_calculated_at;
  if (elapsed_ms <= 0) return up;

  const actual_growth_time_ms = plant.growth_time * 60000 * (FERTILIZER_DATA[up.fertilizer_type]?.time_multiplier || 1.0);

  if (typeof up.grown_ms !== 'number') {
    up.grown_ms = up.status === 0 ? (up.last_calculated_at - up.planted_at) : actual_growth_time_ms;
  }
  if (typeof up.rot_ms !== 'number') {
    up.rot_ms = up.status === 1 ? (up.last_calculated_at - (up.planted_at + actual_growth_time_ms)) : 0;
  }

  let active_elapsed_ms = 0;

  if (up.status === 0) {
    const needed_ms = actual_growth_time_ms - up.grown_ms;
    const ms_to_empty = (plant.water_consume_per_hour > 0) ? (up.current_water / plant.water_consume_per_hour) * 3600000 : Infinity;
    
    active_elapsed_ms = Math.min(elapsed_ms, ms_to_empty, needed_ms);
    if (active_elapsed_ms < 0) active_elapsed_ms = 0;

    const active_elapsed_hours = active_elapsed_ms / 3600000;

    // --- Cập nhật nước ---
    if (plant.water_consume_per_hour > 0) {
      up.current_water = Math.max(0, up.current_water - plant.water_consume_per_hour * active_elapsed_hours);
    }

    // --- Cập nhật sâu & Random sâu ---
    if (active_elapsed_ms > 0) {
      if (up.bug_started_at) {
        const pesticideActive = up.pesticide_until && up.pesticide_until > up.last_calculated_at;
        let bug_active_hours = 0;
        if (!pesticideActive) {
          bug_active_hours = active_elapsed_hours;
        } else if (up.pesticide_until < up.last_calculated_at + active_elapsed_ms) {
          bug_active_hours = ((up.last_calculated_at + active_elapsed_ms) - up.pesticide_until) / 3600000;
        }
        up.lost_yield_by_bug += bug_active_hours * plant.base_yield * plant.bug_penalty_per_hour;
      }

      if (!up.bug_started_at && (!up.pesticide_until || up.pesticide_until < now)) {
        const bugChance = 1 - Math.pow(0.98, active_elapsed_hours);
        if (Math.random() < bugChance) {
          up.bug_started_at = up.last_calculated_at + Math.random() * active_elapsed_ms;
        }
      }
    }

    up.grown_ms += active_elapsed_ms;

    // --- Kiểm tra trạng thái chín ---
    if (up.grown_ms >= actual_growth_time_ms) {
      up.status = 1; // Chín
      up.bug_started_at = null; // Xóa sâu khi cây chín
      
      const over_ms = elapsed_ms - active_elapsed_ms;
      if (over_ms > 0) {
        up.rot_ms += over_ms;
      }
    }
  } else if (up.status === 1) {
    up.rot_ms += elapsed_ms;
  }

  // Cập nhật trạng thái chết do thối rữa
  if (up.status === 1 && up.rot_ms >= plant.rot_time * 60000) {
    up.status = 2; // Chết
  }

  // --- Kiểm tra chết do kiệt sức ---
  const grossYield = calcGrossYield(up, plant);
  const netYield = grossYield - up.lost_yield_by_water - up.lost_yield_by_bug;
  if (netYield <= 0 && up.status !== 2) {
    up.status = 2;
  }

  up.last_calculated_at = now;
  return up;
}

function calcGrossYield(up, plant) {
  plant = plant || PLANTS_DATA[up.plant_id];
  const seasonMult = up.is_wrong_season ? 0.5 : 1.0;
  const fertMult = FERTILIZER_DATA[up.fertilizer_type]?.multiplier || 1.0;
  return Math.round(plant.base_yield * seasonMult * fertMult);
}

function calcNetYield(up) {
  const plant = PLANTS_DATA[up.plant_id];
  const gross = calcGrossYield(up, plant);
  const lost = up.lost_yield_by_water + up.lost_yield_by_bug;
  return Math.max(1, gross - Math.floor(lost));
}

// Chạy lazy update tất cả cây đang trồng
function lazyUpdateAll() {
  let changed = false;
  for (const key in G.plants) {
    const before = G.plants[key].status;
    G.plants[key] = lazyUpdatePlant(G.plants[key]);
    if (G.plants[key].status !== before) changed = true;
  }
  if (changed) saveState();
  return changed;
}

// ============================================================
// ACTIONS
// ============================================================
function plantSeed(plotKey, plantId, fertilizerType = 0) {
  const plot = G.plots[plotKey];
  if (!plot || plot.locked) return { ok: false, msg: 'Ô đất bị khóa' };
  if (G.plants[plotKey]) return { ok: false, msg: 'Ô đất đã có cây' };

  const plant = PLANTS_DATA[plantId];
  if (!plant) return { ok: false, msg: 'Không tìm thấy cây' };

  // Kiểm tra inventory hạt giống
  if (!G.inventory[plantId] || G.inventory[plantId] <= 0)
    return { ok: false, msg: 'Không có hạt giống trong túi' };

  // Kiểm tra phân (nếu chọn)
  if (fertilizerType > 0) {
    const fKey = `fertilizer_${fertilizerType}`;
    if (!G.inventory[fKey] || G.inventory[fKey] <= 0)
      return { ok: false, msg: 'Không có phân bón trong túi' };
    G.inventory[fKey]--;
  }

  G.inventory[plantId]--;

  const now = Date.now();
  const isWrongSeason = plant.season !== G.season;

  G.plants[plotKey] = {
    plot_key: plotKey,
    plant_id: plantId,
    status: 0,
    planted_at: now,
    is_wrong_season: isWrongSeason,
    fertilizer_type: fertilizerType,
    current_water: 0,
    last_watered_at: null,
    bug_started_at: null,
    pesticide_until: null,
    lost_yield_by_water: 0,
    lost_yield_by_bug: 0,
    last_calculated_at: now,
    grown_ms: 0,
    rot_ms: 0,
  };

  saveState();
  return { ok: true };
}

function waterPlant(plotKey) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây' };
  if (up.status === 2) return { ok: false, msg: 'Cây đã chết' };
  if (up.current_water > 50) return { ok: false, msg: 'Nước vẫn còn đủ (>50%)' };

  G.plants[plotKey] = lazyUpdatePlant(up);
  G.plants[plotKey].current_water = 100;
  G.plants[plotKey].last_watered_at = Date.now();
  saveState();
  return { ok: true };
}

function catchBug(plotKey) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây' };
  if (!up.bug_started_at) return { ok: false, msg: 'Không có sâu' };

  G.plants[plotKey] = lazyUpdatePlant(up);
  G.plants[plotKey].bug_started_at = null;
  saveState();
  return { ok: true };
}

function usePesticide(plotKey) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây' };
  if (!G.inventory['pesticide'] || G.inventory['pesticide'] <= 0)
    return { ok: false, msg: 'Không có thuốc trừ sâu' };

  G.plants[plotKey] = lazyUpdatePlant(up);
  G.plants[plotKey].bug_started_at = null;
  G.plants[plotKey].pesticide_until = Date.now() + PESTICIDE_DURATION_MS;
  G.inventory['pesticide']--;
  saveState();
  return { ok: true };
}

function useFertilizer(plotKey, fertilizerType) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây' };
  if (up.status === 2) return { ok: false, msg: 'Cây đã chết' };
  if (!Number.isInteger(fertilizerType) || fertilizerType <= 0) return { ok: false, msg: 'Loại phân không hợp lệ' };

  const fKey = `fertilizer_${fertilizerType}`;
  if (!G.inventory[fKey] || G.inventory[fKey] <= 0)
    return { ok: false, msg: 'Không có phân bón trong túi' };

  if ((up.fertilizer_type || 0) >= fertilizerType)
    return { ok: false, msg: 'Cây đã có phân tốt hơn hoặc bằng' };

  G.plants[plotKey] = lazyUpdatePlant(up);
  G.plants[plotKey].fertilizer_type = fertilizerType;
  G.inventory[fKey]--;
  if (G.inventory[fKey] <= 0) delete G.inventory[fKey];
  saveState();
  return { ok: true };
}

function harvestPlant(plotKey) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây' };

  G.plants[plotKey] = lazyUpdatePlant(up);
  const updated = G.plants[plotKey];

  if (updated.status === 0) return { ok: false, msg: 'Cây chưa chín' };
  if (updated.status === 2) {
    delete G.plants[plotKey];
    saveState();
    return { ok: false, msg: 'Cây đã chết, mất trắng!' };
  }

  const plant = PLANTS_DATA[updated.plant_id];
  const qty = calcNetYield(updated);
  const harvestKey = `harvest_${updated.plant_id}`;
  G.inventory[harvestKey] = (G.inventory[harvestKey] || 0) + qty;

  delete G.plants[plotKey];
  saveState();
  return { ok: true, qty, plant };
}

function removeDead(plotKey) {
  const up = G.plants[plotKey];
  if (!up || up.status !== 2) return;
  delete G.plants[plotKey];
  saveState();
}

function clearPlot(plotKey) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây ở ô này' };
  delete G.plants[plotKey];
  saveState();
  return { ok: true };
}

// ============================================================
// SHOP ACTIONS
// ============================================================
function buyItem(itemType, itemId, qty = 1) {
  let totalCost = 0;
  let inventoryKey = '';

  if (itemType === 'seed') {
    const plant = PLANTS_DATA[itemId];
    if (!plant) return { ok: false, msg: 'Không tìm thấy cây' };
    totalCost = plant.buy_price * qty;
    inventoryKey = itemId;
  } else if (itemType === 'fertilizer') {
    const fert = FERTILIZER_DATA[parseInt(itemId)];
    if (!fert || parseInt(itemId) === 0) return { ok: false, msg: 'Không hợp lệ' };
    totalCost = fert.price * qty;
    inventoryKey = `fertilizer_${itemId}`;
  } else if (itemType === 'pesticide') {
    totalCost = PESTICIDE_PRICE * qty;
    inventoryKey = 'pesticide';
  }

  if (G.gold < totalCost) return { ok: false, msg: `Không đủ vàng (cần ${totalCost}🪙)` };
  G.gold -= totalCost;
  G.inventory[inventoryKey] = (G.inventory[inventoryKey] || 0) + qty;
  saveState();
  return { ok: true, cost: totalCost };
}

function sellItem(inventoryKey, qty = 1) {
  if (!G.inventory[inventoryKey] || G.inventory[inventoryKey] < qty)
    return { ok: false, msg: 'Không đủ hàng để bán' };

  let revenue = 0;
  if (inventoryKey.startsWith('harvest_')) {
    const plantId = inventoryKey.replace('harvest_', '');
    const plant = PLANTS_DATA[plantId];
    if (!plant) return { ok: false, msg: 'Không xác định được loại nông sản' };
    revenue = plant.sell_price_per_yield * qty;
  } else if (inventoryKey.startsWith('fertilizer_')) {
    const type = parseInt(inventoryKey.replace('fertilizer_', ''));
    revenue = Math.floor((FERTILIZER_DATA[type]?.price || 0) * 0.5 * qty);
  } else if (inventoryKey === 'pesticide') {
    revenue = Math.floor(PESTICIDE_PRICE * 0.5 * qty);
  } else {
    // Hạt giống bán lại 50%
    const plant = PLANTS_DATA[inventoryKey];
    if (plant) revenue = Math.floor(plant.buy_price * 0.5 * qty);
  }

  G.inventory[inventoryKey] -= qty;
  if (G.inventory[inventoryKey] <= 0) delete G.inventory[inventoryKey];
  G.gold += revenue;
  saveState();
  return { ok: true, revenue };
}

function buyLand(zoneIndex) {
  if (zoneIndex > 0 && G.plots_unlocked[zoneIndex - 1] < 36) {
    return { ok: false, msg: `Phải mở khóa hết Khu ${zoneIndex} trước!` };
  }
  const current = G.plots_unlocked[zoneIndex];
  const totalUnlocked = G.plots_unlocked.reduce((a, b) => a + b, 0);
  const priceIdx = Math.floor(totalUnlocked / 3);
  const price = LAND_PRICES[priceIdx] ?? 999999;

  if (current >= 36) return { ok: false, msg: 'Khu đất đã đầy' };
  if (G.gold < price) return { ok: false, msg: `Cần ${price}🪙` };

  G.gold -= price;
  G.plots_unlocked[zoneIndex] = Math.min(36, current + 3);
  syncUnlockedPlots();
  saveState();
  return { ok: true, price };
}

// Change season (for demo — normally would auto by real time)
function changeSeason(s) {
  G.season = s;
  saveState();
}

// ============================================================
// EXPORT (dùng ở HTML)
// ============================================================
window.GAME = {
  G, PLANTS_DATA, FERTILIZER_DATA, SEASONS, SEASON_LABELS,
  PESTICIDE_PRICE, LAND_PRICES,
  loadState, saveState, syncUnlockedPlots,
  lazyUpdateAll, lazyUpdatePlant, calcNetYield, calcGrossYield,
  plantSeed, waterPlant, catchBug, usePesticide, useFertilizer, harvestPlant, removeDead, clearPlot,
  buyItem, sellItem, buyLand, changeSeason,
};
