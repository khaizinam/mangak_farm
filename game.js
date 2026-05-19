// ============================================================
// GAME DATA — MASTER DATA
// ============================================================
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_LABELS = { spring: '🌸 Xuân', summer: '☀️ Hạ', autumn: '🍂 Thu', winter: '❄️ Đông' };

const PLANTS_DATA = {
  // --- XUÂN ---
  p01: { id:'p01', name:'Dâu tây', season:'spring', buy_price:30, sell_price_per_yield:18, base_yield:8, growth_time:60, rot_time:30, water_consume_per_hour:8, drought_penalty_per_hour:0.06, bug_penalty_per_hour:0.03, emoji:'🍓' },
  p02: { id:'p02', name:'Cải xanh', season:'spring', buy_price:15, sell_price_per_yield:9, base_yield:12, growth_time:40, rot_time:20, water_consume_per_hour:10, drought_penalty_per_hour:0.08, bug_penalty_per_hour:0.04, emoji:'🥬' },
  p03: { id:'p03', name:'Hoa tulip', season:'spring', buy_price:50, sell_price_per_yield:28, base_yield:6, growth_time:90, rot_time:45, water_consume_per_hour:5, drought_penalty_per_hour:0.04, bug_penalty_per_hour:0.02, emoji:'🌷' },
  p04: { id:'p04', name:'Đậu hà lan', season:'spring', buy_price:20, sell_price_per_yield:12, base_yield:15, growth_time:50, rot_time:25, water_consume_per_hour:7, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.035, emoji:'🫛' },
  // --- HẠ ---
  p05: { id:'p05', name:'Dưa hấu', season:'summer', buy_price:60, sell_price_per_yield:22, base_yield:10, growth_time:120, rot_time:60, water_consume_per_hour:12, drought_penalty_per_hour:0.07, bug_penalty_per_hour:0.025, emoji:'🍉' },
  p06: { id:'p06', name:'Cà chua', season:'summer', buy_price:25, sell_price_per_yield:14, base_yield:14, growth_time:55, rot_time:28, water_consume_per_hour:9, drought_penalty_per_hour:0.06, bug_penalty_per_hour:0.045, emoji:'🍅' },
  p07: { id:'p07', name:'Ớt chuông', season:'summer', buy_price:35, sell_price_per_yield:20, base_yield:10, growth_time:70, rot_time:35, water_consume_per_hour:8, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.03, emoji:'🫑' },
  p08: { id:'p08', name:'Ngô', season:'summer', buy_price:18, sell_price_per_yield:10, base_yield:20, growth_time:80, rot_time:40, water_consume_per_hour:11, drought_penalty_per_hour:0.07, bug_penalty_per_hour:0.05, emoji:'🌽' },
  // --- THU ---
  p09: { id:'p09', name:'Bí ngô', season:'autumn', buy_price:45, sell_price_per_yield:20, base_yield:12, growth_time:100, rot_time:50, water_consume_per_hour:6, drought_penalty_per_hour:0.04, bug_penalty_per_hour:0.025, emoji:'🎃' },
  p10: { id:'p10', name:'Nho', season:'autumn', buy_price:70, sell_price_per_yield:35, base_yield:8, growth_time:150, rot_time:60, water_consume_per_hour:7, drought_penalty_per_hour:0.05, bug_penalty_per_hour:0.02, emoji:'🍇' },
  p11: { id:'p11', name:'Khoai lang', season:'autumn', buy_price:20, sell_price_per_yield:11, base_yield:18, growth_time:65, rot_time:30, water_consume_per_hour:5, drought_penalty_per_hour:0.04, bug_penalty_per_hour:0.03, emoji:'🍠' },
  p12: { id:'p12', name:'Táo', season:'autumn', buy_price:55, sell_price_per_yield:30, base_yield:10, growth_time:130, rot_time:55, water_consume_per_hour:6, drought_penalty_per_hour:0.045, bug_penalty_per_hour:0.022, emoji:'🍎' },
  // --- ĐÔNG ---
  p13: { id:'p13', name:'Cải bắp', season:'winter', buy_price:22, sell_price_per_yield:12, base_yield:16, growth_time:60, rot_time:30, water_consume_per_hour:4, drought_penalty_per_hour:0.03, bug_penalty_per_hour:0.04, emoji:'🥦' },
  p14: { id:'p14', name:'Củ cải trắng', season:'winter', buy_price:18, sell_price_per_yield:10, base_yield:20, growth_time:50, rot_time:25, water_consume_per_hour:3, drought_penalty_per_hour:0.03, bug_penalty_per_hour:0.035, emoji:'⬜' },
  p15: { id:'p15', name:'Gừng', season:'winter', buy_price:40, sell_price_per_yield:22, base_yield:9, growth_time:85, rot_time:40, water_consume_per_hour:3, drought_penalty_per_hour:0.025, bug_penalty_per_hour:0.02, emoji:'🫚' },
  p16: { id:'p16', name:'Hành tây', season:'winter', buy_price:25, sell_price_per_yield:14, base_yield:14, growth_time:70, rot_time:35, water_consume_per_hour:4, drought_penalty_per_hour:0.035, bug_penalty_per_hour:0.03, emoji:'🧅' },
};

const FERTILIZER_DATA = {
  0: { name:'Không có', multiplier:1.0, price:0 },
  1: { name:'Phân thường', multiplier:1.1, price:20, emoji:'🟤' },
  2: { name:'Phân tốt', multiplier:1.2, price:45, emoji:'🟠' },
  3: { name:'Phân cao cấp', multiplier:1.3, price:80, emoji:'⭐' },
};

const PESTICIDE_PRICE = 30;
const PESTICIDE_DURATION_MS = 24 * 60 * 60 * 1000; // 24h
const REAL_MS_PER_GAME_DAY = 24 * 60 * 60 * 1000; // 1 ngày thực = 1 ngày game

// Giá mua ô đất theo từng batch (3 ô mỗi lần)
const LAND_PRICES = [0, 0, 200, 500, 1000, 2000, 3500, 5000, 8000, 12000];
let _landStep = 12000;
let _landLast = 12000;
for (let i = 10; i <= 36; i++) {
  _landLast += _landStep;
  LAND_PRICES.push(Math.round(_landLast / 1000) * 1000);
  _landStep = Math.floor(_landStep * 1.5);
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

  const elapsed_hours = elapsed_ms / 3600000;

  // --- Cập nhật nước ---
  up.current_water = Math.max(0, up.current_water - plant.water_consume_per_hour * elapsed_hours);
  if (up.current_water === 0) {
    const hours_without_water = (plant.water_consume_per_hour > 0)
      ? (plant.water_consume_per_hour * elapsed_hours - (up.current_water + plant.water_consume_per_hour * elapsed_hours)) / plant.water_consume_per_hour
      : 0;
    // Tính giờ cạn nước thực sự
    const prev_water = up.current_water + plant.water_consume_per_hour * elapsed_hours;
    const hours_to_empty = prev_water / plant.water_consume_per_hour;
    const actual_drought_hours = Math.max(0, elapsed_hours - hours_to_empty);
    up.lost_yield_by_water += actual_drought_hours * plant.base_yield * plant.drought_penalty_per_hour;
  }

  // --- Cập nhật sâu ---
  if (up.bug_started_at) {
    const pesticideActive = up.pesticide_until && up.pesticide_until > up.last_calculated_at;
    let bug_active_hours = 0;
    if (!pesticideActive) {
      bug_active_hours = elapsed_hours;
    } else if (up.pesticide_until < now) {
      bug_active_hours = (now - up.pesticide_until) / 3600000;
    }
    up.lost_yield_by_bug += bug_active_hours * plant.base_yield * plant.bug_penalty_per_hour;
  }

  // --- Random sâu xuất hiện ---
  if (!up.bug_started_at && (!up.pesticide_until || up.pesticide_until < now)) {
    // 2% chance mỗi giờ trôi qua
    const bugChance = 1 - Math.pow(0.98, elapsed_hours);
    if (Math.random() < bugChance) {
      up.bug_started_at = now - Math.random() * elapsed_ms;
    }
  }

  // --- Kiểm tra trạng thái ---
  const total_grown_ms = now - up.planted_at;
  if (up.status === 0 && total_grown_ms >= plant.growth_time * 60000) {
    up.status = 1; // Chín
  }
  if (up.status === 1) {
    const over_ms = total_grown_ms - plant.growth_time * 60000;
    if (over_ms >= plant.rot_time * 60000) {
      up.status = 2; // Chết
    }
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
  return plant.base_yield * seasonMult * fertMult;
}

function calcNetYield(up) {
  const plant = PLANTS_DATA[up.plant_id];
  const gross = calcGrossYield(up, plant);
  const lost = up.lost_yield_by_water + up.lost_yield_by_bug;
  return Math.max(1, Math.floor(gross) - Math.floor(lost));
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
    current_water: 100,
    last_watered_at: null,
    bug_started_at: null,
    pesticide_until: null,
    lost_yield_by_water: 0,
    lost_yield_by_bug: 0,
    last_calculated_at: now,
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
  const price = LAND_PRICES[priceIdx] || 999999;

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
  plantSeed, waterPlant, catchBug, usePesticide, useFertilizer, harvestPlant, removeDead,
  buyItem, sellItem, buyLand, changeSeason,
};
