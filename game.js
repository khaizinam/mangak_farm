// ============================================================
// GAME DATA — MASTER DATA
// ============================================================


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
    gold: 5000,
    energy: 100,
    season: 'spring',
    game_day: 1,
    lastDayTick: now,
    lastEnergyTick: now,
    needsStartSeason: true,
    inventory: {}, // { plantId: qty, 'fertilizer_1': qty, ... }
    // 3 khu đất, mỗi khu 36 ô (6x6). Mặc định mở 3 ô đầu khu 1
    plots: buildPlots(),
    plots_unlocked: [3, 0, 0],
    plants: {},
    animals: [],
    poultry_capacity: 3,
    livestock_capacity: 3,
    lastAutoCheck: now,
  };
}

function buildPlots() {
  // 3 zones, 36 ô mỗi zone (6x6)
  const plots = {};
  for (let z = 0; z < 3; z++) {
    for (let i = 0; i < 36; i++) {
      plots[`${z}_${i}`] = new Plot({ zone: z, index: i, locked: true });
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
    let s;
    if (!raw) {
      s = defaultState();
      s.needsStartSeason = true;
    } else {
      s = JSON.parse(raw);
    }
    // Migrate nếu thiếu field
    if (!s.plots_unlocked) s.plots_unlocked = [3, 0, 0];
    if (!s.inventory) s.inventory = {};
    if (typeof s.game_day !== 'number' || s.game_day < 1) s.game_day = 1;
    if (!s.lastDayTick) s.lastDayTick = Date.now();
    if (!s.season) s.season = getSeasonFromDay(s.game_day);
    if (typeof s.needsStartSeason !== 'boolean') s.needsStartSeason = false;
    if (typeof s.energy !== 'number') s.energy = 100;
    if (typeof s.lastEnergyTick !== 'number') s.lastEnergyTick = Date.now();
    if (!s.animals) s.animals = [];
    if (typeof s.poultry_capacity !== 'number') s.poultry_capacity = 3;
    if (typeof s.livestock_capacity !== 'number') s.livestock_capacity = 3;

    // Convert s.animals to BaseAnimal subclasses
    s.animals = s.animals.map(a => AnimalFactory.create(a.type, a));

    // Convert s.plots to Plot instances
    if (!s.plots || Object.keys(s.plots).length === 0) {
      s.plots = buildPlots();
    } else {
      const newPlots = {};
      for (const k in s.plots) {
        const parts = k.split('_');
        if (parts.length === 2 && parseInt(parts[1]) < 36) {
          newPlots[k] = new Plot(s.plots[k]);
        }
      }
      // Ensure all 36 plots exist
      for (let z = 0; z < 3; z++) {
        for (let i = 0; i < 36; i++) {
          const key = `${z}_${i}`;
          if (!newPlots[key]) {
            newPlots[key] = new Plot({ zone: z, index: i, locked: true });
          }
        }
      }
      s.plots = newPlots;
    }

    // Convert s.plants to BasePlant instances
    if (!s.plants) {
      s.plants = {};
    } else {
      const newPlants = {};
      for (const k in s.plants) {
        const parts = k.split('_');
        if (parts.length === 2 && parseInt(parts[1]) < 36 && s.plants[k]) {
          newPlants[k] = PlantFactory.create(s.plants[k].plant_id, s.plants[k]);
        }
      }
      s.plants = newPlants;
    }

    return s;
  } catch (e) {
    console.error("Lỗi khi load game state, khôi phục lại mặc định:", e);
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
  if (!up) return up;
  return up.lazyUpdate(Date.now());
}

function calcGrossYield(up, plant) {
  if (!up) return 0;
  return up.calcGrossYield();
}

function calcNetYield(up) {
  if (!up) return 0;
  return up.calcNetYield();
}

// Chạy lazy update tất cả cây đang trồng và vật nuôi
function lazyUpdateAll() {
  let changed = false;

  // Hồi phục năng lượng nghỉ ngơi (1h hồi 20, max 100)
  const now = Date.now();
  if (typeof G.lastEnergyTick !== 'number') {
    G.lastEnergyTick = now;
    changed = true;
  }
  const elapsedMs = now - G.lastEnergyTick;
  const oneHourMs = 3600000;
  if (elapsedMs >= oneHourMs) {
    const hoursPassed = Math.floor(elapsedMs / oneHourMs);
    if (hoursPassed > 0) {
      if (G.energy < 100) {
        const energyRecovered = hoursPassed * 20;
        G.energy = Math.min(100, G.energy + energyRecovered);
        changed = true;
      }
      G.lastEnergyTick += hoursPassed * oneHourMs;
    }
  }

  for (const key in G.plants) {
    const before = G.plants[key].status;
    G.plants[key] = G.plants[key].lazyUpdate(Date.now());
    if (G.plants[key].status !== before) changed = true;
  }

  if (G.animals && G.animals.length > 0) {
    G.animals.forEach(animal => {
      const before = animal.status;
      animal.lazyUpdate(now);
      if (animal.status !== before) changed = true;
    });
  }

  if (changed) saveState();
  return changed;
}

// ============================================================
// ACTIONS
// ============================================================
function consumeEnergy(amount = 1) {
  if (typeof G.energy !== 'number') G.energy = 100;
  if (G.energy < amount) {
    return { ok: false, msg: '❌ Không đủ năng lượng! Hãy ăn thêm thức ăn hoặc nông sản.' };
  }
  G.energy -= amount;
  return { ok: true };
}

function plantSeed(plotKey, plantId, fertilizerType = 0) {
  const plot = G.plots[plotKey];
  if (!plot || plot.locked) return { ok: false, msg: 'Ô đất bị khóa' };
  if (G.plants[plotKey]) return { ok: false, msg: 'Ô đất đã có cây' };

  const plant = PLANTS_DATA[plantId];
  if (!plant) return { ok: false, msg: 'Không tìm thấy cây' };

  // Kiểm tra inventory hạt giống
  if (!G.inventory[plantId] || G.inventory[plantId] <= 0)
    return { ok: false, msg: 'Không có hạt giống trong túi' };

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

  G.inventory[plantId]--;

  const now = Date.now();
  const isWrongSeason = plant.season !== G.season;

  G.plants[plotKey] = PlantFactory.create(plantId, {
    plot_key: plotKey,
    plant_id: plantId,
    status: 0,
    planted_at: now,
    is_wrong_season: isWrongSeason,
    fertilizer_type: 0, // Mặc định không bón phân khi gieo
    current_water: 0,
    last_watered_at: null,
    bug_started_at: null,
    pesticide_until: null,
    lost_yield_by_water: 0,
    lost_yield_by_bug: 0,
    last_calculated_at: now,
    grown_ms: 0,
    rot_ms: 0,
  });

  saveState();
  return { ok: true };
}

function waterPlant(plotKey) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây' };
  if (up.status === 2) return { ok: false, msg: 'Cây đã chết' };
  if (up.current_water > 50) return { ok: false, msg: 'Nước vẫn còn đủ (>50%)' };

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

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

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

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

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

  G.plants[plotKey] = lazyUpdatePlant(up);
  G.plants[plotKey].bug_started_at = null;
  G.plants[plotKey].pesticide_until = Date.now() + PESTICIDE_DURATION_MS;
  G.inventory['pesticide']--;
  if (G.inventory['pesticide'] <= 0) delete G.inventory['pesticide'];
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

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

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
    return { ok: false, msg: 'Cây đã chết, phải cuốc hoặc dọn cây chết!' };
  }

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

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
  if (!up || up.status !== 2) return { ok: false, msg: 'Không phải cây chết' };

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

  delete G.plants[plotKey];
  saveState();
  return { ok: true };
}

function clearPlot(plotKey) {
  const up = G.plants[plotKey];
  if (!up) return { ok: false, msg: 'Không có cây ở ô này' };

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

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

  if (itemType === 'animal') {
    if (itemId === 'chicken') {
      const currentQty = G.animals.filter(a => a.type === 'chicken').length;
      if (currentQty + qty > G.poultry_capacity) return { ok: false, msg: `Chuồng gà không đủ chỗ trống (Còn: ${G.poultry_capacity - currentQty})` };
      totalCost = 100 * qty;
    } else if (itemId === 'cow') {
      const currentQty = G.animals.filter(a => a.type === 'cow').length;
      if (currentQty + qty > G.livestock_capacity) return { ok: false, msg: `Chuồng bò không đủ chỗ trống (Còn: ${G.livestock_capacity - currentQty})` };
      totalCost = 200 * qty;
    } else {
      return { ok: false, msg: 'Không tìm thấy loại vật nuôi này' };
    }
  } else if (itemType === 'seed') {
    const plant = PLANTS_DATA[itemId];
    if (!plant) return { ok: false, msg: 'Không tìm thấy cây' };
    totalCost = plant.buy_price * qty;
    inventoryKey = itemId;
  } else if (itemType === 'fertilizer') {
    const item = ShopItemRegistry.get(itemId);
    if (!item) return { ok: false, msg: 'Không tìm thấy loại phân bón này' };
    totalCost = item.buyPrice * qty;
    inventoryKey = `fertilizer_${itemId}`;
  } else if (itemType === 'pesticide') {
    const item = ShopItemRegistry.get('pesticide');
    totalCost = item.buyPrice * qty;
    inventoryKey = 'pesticide';
  } else if (itemType === 'food') {
    const item = ShopItemRegistry.get(itemId);
    if (!item) return { ok: false, msg: 'Không tìm thấy loại thực phẩm này' };
    totalCost = item.buyPrice * qty;
    inventoryKey = `food_${itemId}`;
  } else if (itemType === 'medicine_animal') {
    const item = ShopItemRegistry.get('medicine_animal');
    if (!item) return { ok: false, msg: 'Không tìm thấy thuốc thú y' };
    totalCost = item.buyPrice * qty;
    inventoryKey = 'medicine_animal';
  }

  if (G.gold < totalCost) return { ok: false, msg: `Không đủ vàng (cần ${totalCost}🪙)` };
  G.gold -= totalCost;
  
  if (itemType === 'animal') {
    for (let i = 0; i < qty; i++) {
      G.animals.push(AnimalFactory.create(itemId, { purchased_at: Date.now() }));
    }
  } else {
    G.inventory[inventoryKey] = (G.inventory[inventoryKey] || 0) + qty;
  }
  
  saveState();
  return { ok: true, cost: totalCost };
}

function sellItem(inventoryKey, qty = 1) {
  if (!G.inventory[inventoryKey] || G.inventory[inventoryKey] < qty)
    return { ok: false, msg: 'Không đủ hàng để bán' };

  let revenue = 0;
  if (inventoryKey === 'harvest_chicken_egg') {
    revenue = 50 * qty;
  } else if (inventoryKey === 'harvest_cow_milk') {
    revenue = 500 * qty;
  } else if (inventoryKey.startsWith('harvest_')) {
    const plantId = inventoryKey.replace('harvest_', '');
    const plant = PLANTS_DATA[plantId];
    if (!plant) return { ok: false, msg: 'Không xác định được loại nông sản' };
    revenue = plant.sell_price_per_yield * qty;
  } else if (inventoryKey.startsWith('fertilizer_')) {
    const type = inventoryKey.replace('fertilizer_', '');
    const item = ShopItemRegistry.get(type);
    revenue = Math.floor((item?.buyPrice || 0) * 0.5 * qty);
  } else if (inventoryKey === 'pesticide') {
    const item = ShopItemRegistry.get('pesticide');
    revenue = Math.floor((item?.buyPrice || 500) * 0.5 * qty);
  } else if (inventoryKey === 'medicine_animal') {
    const item = ShopItemRegistry.get('medicine_animal');
    revenue = Math.floor((item?.buyPrice || 50) * 0.5 * qty);
  } else if (inventoryKey.startsWith('food_')) {
    const type = inventoryKey.replace('food_', '');
    const item = ShopItemRegistry.get(type);
    revenue = Math.floor((item?.buyPrice || 0) * 0.5 * qty);
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

function discardItem(inventoryKey, qty = 1) {
  if (!G.inventory[inventoryKey] || G.inventory[inventoryKey] < qty) {
    return { ok: false, msg: 'Không đủ vật phẩm trong túi!' };
  }
  G.inventory[inventoryKey] -= qty;
  if (G.inventory[inventoryKey] <= 0) delete G.inventory[inventoryKey];
  saveState();
  return { ok: true };
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

function expandBarn(type) {
  if (type === 'poultry') {
    const cap = G.poultry_capacity;
    if (cap >= 20) return { ok: false, msg: 'Chuồng gà đã đạt sức chứa tối đa (20)' };
    const price = 12000 * Math.pow(2, cap - 3);
    if (G.gold < price) return { ok: false, msg: `Cần ${price}🪙 để mở rộng!` };
    G.gold -= price;
    G.poultry_capacity += 1;
    saveState();
    return { ok: true, price, newCap: G.poultry_capacity };
  } else if (type === 'livestock') {
    const cap = G.livestock_capacity;
    if (cap >= 20) return { ok: false, msg: 'Chuồng bò đã đạt sức chứa tối đa (20)' };
    const price = 12000 * Math.pow(2, cap - 3);
    if (G.gold < price) return { ok: false, msg: `Cần ${price}🪙 để mở rộng!` };
    G.gold -= price;
    G.livestock_capacity += 1;
    saveState();
    return { ok: true, price, newCap: G.livestock_capacity };
  }
  return { ok: false, msg: 'Loại chuồng không hợp lệ' };
}

function feedAnimal(animalId) {
  const animal = G.animals.find(a => a.id === animalId);
  if (!animal) return { ok: false, msg: 'Không tìm thấy con vật!' };
  
  const feedKey = animal.feed_item;
  if (!G.inventory[feedKey] || G.inventory[feedKey] < 1) {
    const foodName = feedKey === 'food_poultry' ? 'thức ăn gia cầm' : 'thức ăn gia súc';
    return { ok: false, msg: `Không đủ thức ăn trong túi (cần 1 ${foodName})!` };
  }

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

  animal.lazyUpdate(Date.now());
  const res = animal.feed(Date.now());
  if (!res.ok) return res;

  G.inventory[feedKey] -= 1;
  if (G.inventory[feedKey] <= 0) delete G.inventory[feedKey];
  
  saveState();
  return { ok: true };
}

// Cần cho ăn khi <= 50%
function canFeedAnimal(animal) {
  animal.lazyUpdate(Date.now());
  return animal.health <= 50;
}

function harvestAnimal(animalId) {
  const animal = G.animals.find(a => a.id === animalId);
  if (!animal) return { ok: false, msg: 'Không tìm thấy con vật!' };

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

  animal.lazyUpdate(Date.now());
  const res = animal.harvest();
  if (!res.ok) return res;

  const produceKey = animal.produce_item;
  G.inventory[produceKey] = (G.inventory[produceKey] || 0) + res.qty;
  
  saveState();
  return { ok: true, qty: res.qty, item: produceKey };
}

function sellAnimal(animalId) {
  const idx = G.animals.findIndex(a => a.id === animalId);
  if (idx === -1) return { ok: false, msg: 'Không tìm thấy con vật!' };
  const animal = G.animals[idx];

  animal.lazyUpdate(Date.now());
  if (animal.status !== 'adult') {
    return { ok: false, msg: 'Con vật chưa trưởng thành, không thể bán!' };
  }

  const price = animal.sell_price;
  G.gold += price;
  G.animals.splice(idx, 1);
  
  saveState();
  return { ok: true, price };
}

function removeDeadAnimal(animalId) {
  const idx = G.animals.findIndex(a => a.id === animalId);
  if (idx === -1) return { ok: false, msg: 'Không tìm thấy con vật!' };
  const animal = G.animals[idx];
  if (animal.status !== 'dead') {
    return { ok: false, msg: 'Con vật vẫn còn sống!' };
  }
  G.animals.splice(idx, 1);
  saveState();
  return { ok: true };
}

function cureAnimal(animalId) {
  const animal = G.animals.find(a => a.id === animalId);
  if (!animal) return { ok: false, msg: 'Không tìm thấy vật nuôi!' };
  if (animal.status === 'dead') return { ok: false, msg: 'Vật nuôi đã chết!' };

  const medKey = 'medicine_animal';
  if (!G.inventory[medKey] || G.inventory[medKey] < 1) {
    return { ok: false, msg: 'Không đủ Thuốc thú y trong túi (cần 1)!' };
  }

  // Tiêu hao năng lượng
  const eRes = consumeEnergy(1);
  if (!eRes.ok) return eRes;

  animal.lazyUpdate(Date.now());
  animal.sick_started_at = null;
  animal.medicine_until = Date.now() + 24 * 60 * 60 * 1000;

  G.inventory[medKey]--;
  if (G.inventory[medKey] <= 0) delete G.inventory[medKey];

  saveState();
  return { ok: true };
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
  expandBarn, feedAnimal, harvestAnimal, sellAnimal, removeDeadAnimal, canFeedAnimal, cureAnimal, discardItem
};
