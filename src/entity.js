// ============================================================
// ENTITY CLASSES
// ============================================================

class BasePlant {
  constructor(state = {}) {
    this.plot_key = state.plot_key || '';
    this.plant_id = state.plant_id || this.constructor.id;
    this.status = typeof state.status === 'number' ? state.status : 0; // 0: growing, 1: ready, 2: dead
    this.planted_at = state.planted_at || Date.now();
    this.is_wrong_season = typeof state.is_wrong_season === 'boolean' ? state.is_wrong_season : false;
    this.fertilizer_type = typeof state.fertilizer_type === 'number' ? state.fertilizer_type : 0;
    this.current_water = typeof state.current_water === 'number' ? state.current_water : 0;
    this.last_watered_at = state.last_watered_at || null;
    this.bug_started_at = state.bug_started_at || null;
    this.pesticide_until = state.pesticide_until || null;
    this.lost_yield_by_water = typeof state.lost_yield_by_water === 'number' ? state.lost_yield_by_water : 0;
    this.lost_yield_by_bug = typeof state.lost_yield_by_bug === 'number' ? state.lost_yield_by_bug : 0;
    this.last_calculated_at = state.last_calculated_at || Date.now();
    this.grown_ms = typeof state.grown_ms === 'number' ? state.grown_ms : 0;
    this.rot_ms = typeof state.rot_ms === 'number' ? state.rot_ms : 0;
  }

  // Getters pointing to static subclass fields
  get id() { return this.constructor.id; }
  get name() { return this.constructor.name; }
  get season() { return this.constructor.season; }
  get buy_price() { return this.constructor.buy_price; }
  get sell_price_per_yield() { return this.constructor.sell_price_per_yield; }
  get base_yield() { return this.constructor.base_yield; }
  get growth_time() { return this.constructor.growth_time; }
  get rot_time() { return this.constructor.rot_time; }
  get water_consume_per_hour() { return this.constructor.water_consume_per_hour; }
  get drought_penalty_per_hour() { return this.constructor.drought_penalty_per_hour; }
  get bug_penalty_per_hour() { return this.constructor.bug_penalty_per_hour; }
  get emoji() { return this.constructor.emoji; }

  toJSON() {
    return {
      plot_key: this.plot_key,
      plant_id: this.plant_id,
      status: this.status,
      planted_at: this.planted_at,
      is_wrong_season: this.is_wrong_season,
      fertilizer_type: this.fertilizer_type,
      current_water: this.current_water,
      last_watered_at: this.last_watered_at,
      bug_started_at: this.bug_started_at,
      pesticide_until: this.pesticide_until,
      lost_yield_by_water: this.lost_yield_by_water,
      lost_yield_by_bug: this.lost_yield_by_bug,
      last_calculated_at: this.last_calculated_at,
      grown_ms: this.grown_ms,
      rot_ms: this.rot_ms,
    };
  }

  calcGrossYield() {
    const seasonMult = this.is_wrong_season ? 0.5 : 1.0;
    const fertMult = (window.FERTILIZER_DATA && window.FERTILIZER_DATA[this.fertilizer_type])?.multiplier || 1.0;
    return Math.round(this.base_yield * seasonMult * fertMult);
  }

  calcNetYield() {
    const gross = this.calcGrossYield();
    const maxBug = gross * 0.6;
    const actualBugLost = Math.min(maxBug, this.lost_yield_by_bug);
    const lost = this.lost_yield_by_water + actualBugLost;
    return Math.max(1, gross - Math.floor(lost));
  }

  lazyUpdate(now = Date.now()) {
    const elapsed_ms = now - this.last_calculated_at;
    if (elapsed_ms <= 0) return this;

    const actual_growth_time_ms = this.growth_time * 60000 * ((window.FERTILIZER_DATA && window.FERTILIZER_DATA[this.fertilizer_type])?.time_multiplier || 1.0);

    let active_elapsed_ms = 0;
    const grossYield = this.calcGrossYield();

    if (this.status === 0) {
      const needed_ms = actual_growth_time_ms - this.grown_ms;
      const ms_to_empty = (this.water_consume_per_hour > 0) ? (this.current_water / this.water_consume_per_hour) * 3600000 : Infinity;
      
      active_elapsed_ms = Math.min(elapsed_ms, ms_to_empty, needed_ms);
      if (active_elapsed_ms < 0) active_elapsed_ms = 0;

      const active_elapsed_hours = active_elapsed_ms / 3600000;

      // --- Cập nhật nước ---
      if (this.water_consume_per_hour > 0) {
        this.current_water = Math.max(0, this.current_water - this.water_consume_per_hour * active_elapsed_hours);
      }

      // --- Cập nhật sâu & Random sâu ---
      if (active_elapsed_ms > 0) {
        if (this.bug_started_at) {
          const pesticideActive = this.pesticide_until && this.pesticide_until > this.last_calculated_at;
          let bug_active_hours = 0;
          if (!pesticideActive) {
            bug_active_hours = active_elapsed_hours;
          } else if (this.pesticide_until < this.last_calculated_at + active_elapsed_ms) {
            bug_active_hours = ((this.last_calculated_at + active_elapsed_ms) - this.pesticide_until) / 3600000;
          }
          this.lost_yield_by_bug += bug_active_hours * this.base_yield * this.bug_penalty_per_hour;
          
          // Cap bug penalty at 60% of gross yield
          const maxBugPenalty = grossYield * 0.6;
          if (this.lost_yield_by_bug > maxBugPenalty) {
            this.lost_yield_by_bug = maxBugPenalty;
          }
        }

        if (!this.bug_started_at && (!this.pesticide_until || this.pesticide_until < now)) {
          const bugChance = 1 - Math.pow(0.7, active_elapsed_hours);
          if (Math.random() < bugChance) {
            this.bug_started_at = this.last_calculated_at + Math.random() * active_elapsed_ms;
          }
        }
      }

      this.grown_ms += active_elapsed_ms;

      // --- Kiểm tra trạng thái chín ---
      if (this.grown_ms >= actual_growth_time_ms) {
        this.status = 1; // Chín
        this.bug_started_at = null; // Xóa sâu khi cây chín
        
        const over_ms = elapsed_ms - active_elapsed_ms;
        if (over_ms > 0) {
          this.rot_ms += over_ms;
        }
      }
    } else if (this.status === 1) {
      this.rot_ms += elapsed_ms;
    }

    // Cập nhật trạng thái chết do thối rữa
    if (this.status === 1 && this.rot_ms >= this.rot_time * 60000) {
      this.status = 2; // Chết
    }

    // --- Kiểm tra chết do kiệt sức ---
    const netYield = grossYield - this.lost_yield_by_water - this.lost_yield_by_bug;
    if (netYield <= 0 && this.status !== 2) {
      this.status = 2;
    }

    this.last_calculated_at = now;
    return this;
  }
}

class Plot {
  constructor(state = {}) {
    this.zone = typeof state.zone === 'number' ? state.zone : 0;
    this.index = typeof state.index === 'number' ? state.index : 0;
    this.locked = typeof state.locked === 'boolean' ? state.locked : true;
  }

  toJSON() {
    return {
      zone: this.zone,
      index: this.index,
      locked: this.locked,
    };
  }
}

// ============================================================
// SPECIFIC CROP CLASSES
// ============================================================

// --- XUÂN ---
class StrawberryPlant extends BasePlant {
  static id = 'p01';
  static name = 'Dâu tây';
  static season = SEASON_SPRING;
  static buy_price = 30;
  static sell_price_per_yield = 5;
  static base_yield = 9;
  static growth_time = 15;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🍓';
}

class CabbageGreenPlant extends BasePlant {
  static id = 'p02';
  static name = 'Cải xanh';
  static season = SEASON_SPRING;
  static buy_price = 200;
  static sell_price_per_yield = 9;
  static base_yield = 40;
  static growth_time = 360;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🥬';
}

class TulipPlant extends BasePlant {
  static id = 'p03';
  static name = 'Hoa tulip';
  static season = SEASON_SPRING;
  static buy_price = 600;
  static sell_price_per_yield = 12;
  static base_yield = 110;
  static growth_time = 720;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🌷';
}

class CarrotPlant extends BasePlant {
  static id = 'p04';
  static name = 'Cà rốt';
  static season = SEASON_SPRING;
  static buy_price = 1500;
  static sell_price_per_yield = 15;
  static base_yield = 260;
  static growth_time = 1440;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🥕';
}

// --- HẠ ---
class TomatoPlant extends BasePlant {
  static id = 'p05';
  static name = 'Cà chua';
  static season = SEASON_SUMMER;
  static buy_price = 40;
  static sell_price_per_yield = 6;
  static base_yield = 10;
  static growth_time = 15;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🍅';
}

class BellPepperPlant extends BasePlant {
  static id = 'p06';
  static name = 'Ớt chuông';
  static season = SEASON_SUMMER;
  static buy_price = 250;
  static sell_price_per_yield = 10;
  static base_yield = 45;
  static growth_time = 360;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🫑';
}

class CornPlant extends BasePlant {
  static id = 'p07';
  static name = 'Ngô';
  static season = SEASON_SUMMER;
  static buy_price = 700;
  static sell_price_per_yield = 14;
  static base_yield = 110;
  static growth_time = 720;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🌽';
}

class WatermelonPlant extends BasePlant {
  static id = 'p08';
  static name = 'Dưa hấu';
  static season = SEASON_SUMMER;
  static buy_price = 1800;
  static sell_price_per_yield = 18;
  static base_yield = 260;
  static growth_time = 1440;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🍉';
}

// --- THU ---
class EggplantPlant extends BasePlant {
  static id = 'p09';
  static name = 'Cà tím';
  static season = SEASON_AUTUMN;
  static buy_price = 35;
  static sell_price_per_yield = 5;
  static base_yield = 10;
  static growth_time = 15;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🍆';
}

class SweetPotatoPlant extends BasePlant {
  static id = 'p10';
  static name = 'Khoai lang';
  static season = SEASON_AUTUMN;
  static buy_price = 220;
  static sell_price_per_yield = 9;
  static base_yield = 44;
  static growth_time = 360;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🍠';
}

class ApplePlant extends BasePlant {
  static id = 'p11';
  static name = 'Táo';
  static season = SEASON_AUTUMN;
  static buy_price = 650;
  static sell_price_per_yield = 13;
  static base_yield = 110;
  static growth_time = 720;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🍎';
}

class PumpkinPlant extends BasePlant {
  static id = 'p12';
  static name = 'Bí ngô';
  static season = SEASON_AUTUMN;
  static buy_price = 2000;
  static sell_price_per_yield = 20;
  static base_yield = 260;
  static growth_time = 1440;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🎃';
}

// --- ĐÔNG ---
class CabbageWinterPlant extends BasePlant {
  static id = 'p13';
  static name = 'Cải bắp';
  static season = SEASON_WINTER;
  static buy_price = 45;
  static sell_price_per_yield = 6;
  static base_yield = 11;
  static growth_time = 15;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🥦';
}

class OnionPlant extends BasePlant {
  static id = 'p14';
  static name = 'Hành tây';
  static season = SEASON_WINTER;
  static buy_price = 260;
  static sell_price_per_yield = 10;
  static base_yield = 47;
  static growth_time = 360;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🧅';
}

class RadishPlant extends BasePlant {
  static id = 'p15';
  static name = 'Củ cải';
  static season = SEASON_WINTER;
  static buy_price = 750;
  static sell_price_per_yield = 15;
  static base_yield = 110;
  static growth_time = 720;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '⬜';
}

class GingerPlant extends BasePlant {
  static id = 'p16';
  static name = 'Gừng';
  static season = SEASON_WINTER;
  static buy_price = 2200;
  static sell_price_per_yield = 22;
  static base_yield = 260;
  static growth_time = 1440;
  static rot_time = 1440;
  static water_consume_per_hour = 16.67;
  static drought_penalty_per_hour = 0.05;
  static bug_penalty_per_hour = 0.03;
  static emoji = '🫚';
}

// ============================================================
// FACTORY
// ============================================================
class PlantFactory {
  static classes = {};

  static register(cls) {
    this.classes[cls.id] = cls;
  }

  static create(plantId, state = {}) {
    const Cls = this.classes[plantId];
    if (!Cls) {
      console.warn(`Plant class for ID ${plantId} not found. Using BasePlant.`);
      return new BasePlant(state);
    }
    return new Cls(state);
  }
}

// Register all crop classes
[
  StrawberryPlant, CabbageGreenPlant, TulipPlant, CarrotPlant,
  TomatoPlant, BellPepperPlant, CornPlant, WatermelonPlant,
  EggplantPlant, SweetPotatoPlant, ApplePlant, PumpkinPlant,
  CabbageWinterPlant, OnionPlant, RadishPlant, GingerPlant
].forEach(cls => PlantFactory.register(cls));

// Expose to window globally
window.BasePlant = BasePlant;
window.Plot = Plot;
window.PlantFactory = PlantFactory;
window.StrawberryPlant = StrawberryPlant;
window.CabbageGreenPlant = CabbageGreenPlant;
window.TulipPlant = TulipPlant;
window.CarrotPlant = CarrotPlant;
window.TomatoPlant = TomatoPlant;
window.BellPepperPlant = BellPepperPlant;
window.CornPlant = CornPlant;
window.WatermelonPlant = WatermelonPlant;
window.EggplantPlant = EggplantPlant;
window.SweetPotatoPlant = SweetPotatoPlant;
window.ApplePlant = ApplePlant;
window.PumpkinPlant = PumpkinPlant;
window.CabbageWinterPlant = CabbageWinterPlant;
window.OnionPlant = OnionPlant;
window.RadishPlant = RadishPlant;
window.GingerPlant = GingerPlant;

// ============================================================
// SHOP ENTITIES (FOOD, FERTILIZER, PESTICIDE)
// ============================================================
class BaseShopItem {
  constructor(id, name, emoji, buyPrice, sellPrice, type) {
    this.id = id;
    this.name = name;
    this.emoji = emoji;
    this.buyPrice = buyPrice;
    this.sellPrice = sellPrice;
    this.type = type; // 'seed', 'fertilizer', 'pesticide', 'food'
  }
}

class FoodItem extends BaseShopItem {
  constructor(id, name, emoji, buyPrice, energyRestored) {
    super(id, name, emoji, buyPrice, Math.floor(buyPrice * 0.5), 'food');
    this.energyRestored = energyRestored;
  }
}

class FertilizerItem extends BaseShopItem {
  constructor(id, name, emoji, buyPrice, multiplier, timeMultiplier) {
    super(id, name, emoji, buyPrice, Math.floor(buyPrice * 0.5), 'fertilizer');
    this.multiplier = multiplier;
    this.timeMultiplier = timeMultiplier;
  }
}

class PesticideItem extends BaseShopItem {
  constructor(buyPrice = 500) {
    super('pesticide', 'Thuốc trừ sâu', '🧪', buyPrice, Math.floor(buyPrice * 0.5), 'pesticide');
  }
}

class MedicineAnimalItem extends BaseShopItem {
  constructor(buyPrice = 50) {
    super('medicine_animal', 'Thuốc thú y', '💊', buyPrice, Math.floor(buyPrice * 0.5), 'medicine_animal');
  }
}

class ShopItemRegistry {
  static items = {};

  static register(item) {
    this.items[item.id] = item;
  }

  static get(id) {
    return this.items[id];
  }

  static getAll() {
    return Object.values(this.items);
  }
}

// Register default shop items
ShopItemRegistry.register(new FoodItem('bread', 'Bánh mì', '🍞', 1000, 10));
ShopItemRegistry.register(new FoodItem('noodle', 'Mì', '🍜', 1800, 25));
ShopItemRegistry.register(new FoodItem('rice', 'Cơm', '🍚', 4800, 50));
ShopItemRegistry.register(new FoodItem('poultry', 'Thức ăn gia cầm', '🌾', 50, 0));
ShopItemRegistry.register(new FoodItem('livestock', 'Thức ăn gia súc', '🌾', 50, 0));
ShopItemRegistry.register(new FertilizerItem('1', 'Phân hữu cơ', '💩', 100, 1.2, 0.9));
ShopItemRegistry.register(new FertilizerItem('2', 'Phân hóa học', '🧪', 250, 1.5, 0.7));
ShopItemRegistry.register(new FertilizerItem('3', 'Phân thần kỳ', '✨', 600, 2.0, 0.5));
ShopItemRegistry.register(new PesticideItem(500));
ShopItemRegistry.register(new MedicineAnimalItem(50));

// Expose Shop Items globally
window.BaseShopItem = BaseShopItem;
window.FoodItem = FoodItem;
window.FertilizerItem = FertilizerItem;
window.PesticideItem = PesticideItem;
window.MedicineAnimalItem = MedicineAnimalItem;
window.ShopItemRegistry = ShopItemRegistry;

// Build FERTILIZER_DATA dynamic mapping for backward compatibility
const FERTILIZER_DATA = {
  0: { name:'Không có', multiplier:1.0, time_multiplier:1.0, price:0, emoji:'' }
};
[1,2,3].forEach(f => {
  const item = ShopItemRegistry.get(f.toString());
  if (item) {
    FERTILIZER_DATA[f] = {
      name: item.name,
      multiplier: item.multiplier,
      time_multiplier: item.timeMultiplier,
      price: item.buyPrice,
      emoji: item.emoji
    };
  }
});
window.FERTILIZER_DATA = FERTILIZER_DATA;

const PESTICIDE_PRICE = ShopItemRegistry.get('pesticide').buyPrice;
window.PESTICIDE_PRICE = PESTICIDE_PRICE;

// Build PLANTS_DATA dynamic mapping for backward compatibility
const PLANTS_DATA = {};
for (const id in PlantFactory.classes) {
  const cls = PlantFactory.classes[id];
  PLANTS_DATA[id] = {
    id: cls.id,
    name: cls.name,
    season: cls.season,
    buy_price: cls.buy_price,
    sell_price_per_yield: cls.sell_price_per_yield,
    base_yield: cls.base_yield,
    growth_time: cls.growth_time,
    rot_time: cls.rot_time,
    water_consume_per_hour: cls.water_consume_per_hour,
    drought_penalty_per_hour: cls.drought_penalty_per_hour,
    bug_penalty_per_hour: cls.bug_penalty_per_hour,
    emoji: cls.emoji
  };
}
window.PLANTS_DATA = PLANTS_DATA;

// ============================================================
// ANIMAL ENTITIES
// ============================================================
class BaseAnimal {
  constructor(state = {}) {
    this.id = state.id || 'animal_' + Math.random().toString(36).substr(2, 9);
    this.type = state.type || this.constructor.type;
    this.purchased_at = state.purchased_at || Date.now();
    this.last_fed_at = state.last_fed_at || Date.now();
    this.last_harvested_at = state.last_harvested_at || Date.now();
    this.accumulated_production = typeof state.accumulated_production === 'number' ? state.accumulated_production : 0;
    this.status = state.status || 'baby'; // 'baby', 'adult', 'dead'
    this.health = typeof state.health === 'number' ? state.health : 100;
    this.dead_at = state.dead_at || null; // timestamp when health reached 0
    this.last_calculated_at = state.last_calculated_at || this.purchased_at;
    this.sick_started_at = state.sick_started_at || null;
    this.medicine_until = state.medicine_until || null;
    this.grown_ms = typeof state.grown_ms === 'number' ? state.grown_ms : 0;
  }

  get name() { return this.constructor.name_label; }
  get buy_price() { return this.constructor.buy_price; }
  get sell_price() { return this.constructor.sell_price; }
  get emoji() { return this.constructor.emoji; }
  get production_rate() { return this.constructor.production_rate; }
  get max_production() { return this.constructor.max_production; }
  get feed_item() { return this.constructor.feed_item; }
  get produce_item() { return this.constructor.produce_item; }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      purchased_at: this.purchased_at,
      last_fed_at: this.last_fed_at,
      last_harvested_at: this.last_harvested_at,
      accumulated_production: this.accumulated_production,
      status: this.status,
      health: this.health,
      dead_at: this.dead_at,
      last_calculated_at: this.last_calculated_at,
      sick_started_at: this.sick_started_at,
      medicine_until: this.medicine_until,
      grown_ms: this.grown_ms
    };
  }

  lazyUpdate(now = Date.now()) {
    if (this.status === 'dead') return;

    const elapsed = now - this.last_calculated_at;
    if (elapsed <= 0) return;

    const msPerHour = 3600000;
    const healthDecreaseRate = 100 / 6; // % per hour
    const elapsedHours = elapsed / msPerHour;

    // --- Update Health ---
    if (this.health > 0) {
      const startHealth = this.health;
      this.health = Math.max(0, this.health - healthDecreaseRate * elapsedHours);
      if (this.health <= 0) {
        const hoursToZero = startHealth / healthDecreaseRate;
        this.dead_at = this.last_calculated_at + hoursToZero * msPerHour;
      }
    }

    // --- Check death from starvation (5 days after zero health) ---
    if (this.dead_at) {
      const timeSinceZeroHealth = now - this.dead_at;
      if (timeSinceZeroHealth >= 5 * 24 * msPerHour) {
        this.status = 'dead';
        this.health = 0;
        this.last_calculated_at = now;
        return;
      }
    }

    // --- Update Sickness ---
    if (!this.sick_started_at && (!this.medicine_until || this.medicine_until < now)) {
      // Calculate active unprotected time range in this tick
      let unprotectedMs = elapsed;
      if (this.medicine_until && this.medicine_until > this.last_calculated_at) {
        unprotectedMs = now - this.medicine_until;
      }
      if (unprotectedMs > 0) {
        const unprotectedHours = unprotectedMs / 3600000;
        const sickChance = 1 - Math.pow(0.95, unprotectedHours); // 5% chance of getting sick per hour
        if (Math.random() < sickChance) {
          const randomOffset = Math.random() * unprotectedMs;
          this.sick_started_at = Math.max(this.last_calculated_at, now - unprotectedMs) + randomOffset;
        }
      }
    }

    // --- Update Growth Status (4h to adult) ---
    const growthDuration = 4 * msPerHour;
    if (this.status === 'baby') {
      let healthyMs = elapsed;
      if (this.sick_started_at) {
        if (this.sick_started_at > this.last_calculated_at && this.sick_started_at < now) {
          healthyMs = this.sick_started_at - this.last_calculated_at;
        } else {
          healthyMs = 0;
        }
      }
      this.grown_ms += healthyMs;
      if (this.grown_ms >= growthDuration) {
        this.status = 'adult';
      }
    }

    // --- Update Production ---
    // Cho phép tính sản lượng kể cả khi health vừa về 0 trong tick này,
    // miễn là dead_at còn giới hạn activeHours về khoảng thời gian hợp lệ.
    if (this.status === 'adult' && (this.health > 0 || this.dead_at)) {
      let activeHours = elapsedHours;
      if (this.dead_at) {
        // Chỉ tính sản lượng đến thời điểm health = 0
        const activeTime = this.dead_at - this.last_calculated_at;
        activeHours = Math.max(0, activeTime / msPerHour);
      }
      if (this.sick_started_at) {
        if (this.sick_started_at > this.last_calculated_at && this.sick_started_at < now) {
          const healthyMs = this.sick_started_at - this.last_calculated_at;
          activeHours = Math.min(activeHours, Math.max(0, healthyMs / msPerHour));
        } else {
          activeHours = 0;
        }
      }
      const produced = activeHours * this.production_rate;
      this.accumulated_production = Math.min(this.max_production, this.accumulated_production + produced);
    }

    // --- Update Lifetime (14 days = 336h) ---
    const age = now - this.purchased_at;
    const maxLifespan = 14 * 24 * msPerHour;
    if (age >= maxLifespan) {
      this.status = 'dead';
    }

    this.last_calculated_at = now;
  }

  feed(now = Date.now()) {
    if (this.health > 50) {
      return { ok: false, msg: 'Sinh lực vẫn trên 50%, chưa thể cho ăn!' };
    }
    this.health = 100;
    this.last_fed_at = now;
    this.dead_at = null;
    this.last_calculated_at = now;
    return { ok: true };
  }

  harvest() {
    if (this.status === 'dead') {
      return { ok: false, msg: 'Thú nuôi đã chết, không thể thu hoạch!' };
    }
    if (this.status === 'baby') {
      return { ok: false, msg: 'Thú nuôi còn non, chưa thể sản xuất!' };
    }
    const qty = Math.floor(this.accumulated_production);
    if (qty <= 0) {
      return { ok: false, msg: 'Chưa có sản phẩm tích lũy!' };
    }
    this.accumulated_production = 0;
    this.last_harvested_at = Date.now();
    return { ok: true, qty };
  }
}

class ChickenAnimal extends BaseAnimal {
  static type = 'chicken';
  static name_label = 'Gà';
  static buy_price = 100;
  static sell_price = 200;
  static emoji = '🐔';
  static production_rate = 20; // 20 trứng / giờ
  static max_production = 20; // tối đa tích lũy 20
  static feed_item = 'food_poultry';
  static produce_item = 'harvest_chicken_egg';
}

class CowAnimal extends BaseAnimal {
  static type = 'cow';
  static name_label = 'Bò';
  static buy_price = 200;
  static sell_price = 400;
  static emoji = '🐮';
  static production_rate = 5; // 5 sữa bò / giờ
  static max_production = 5; // tối đa tích lũy 5
  static feed_item = 'food_livestock';
  static produce_item = 'harvest_cow_milk';
}

class AnimalFactory {
  static classes = {
    chicken: ChickenAnimal,
    cow: CowAnimal
  };
  static create(type, state = {}) {
    const Cls = this.classes[type];
    if (!Cls) return new BaseAnimal(state);
    return new Cls(state);
  }
}

window.BaseAnimal = BaseAnimal;
window.ChickenAnimal = ChickenAnimal;
window.CowAnimal = CowAnimal;
window.AnimalFactory = AnimalFactory;


