// ============================================================
// INVENTORY MODULE
// ============================================================

import { toast, updateGold, formatTime, render } from './core.js';

window.selectedInventoryItem = null;

export function renderInventoryContent() {
  const inv = G.inventory;
  const items = Object.keys(inv).filter(k => inv[k] > 0);
  const el = document.getElementById('inventoryContent');
  if (!el) return;
  if (items.length === 0) {
    el.innerHTML = `<div class="text-center py-8 text-gray-400"><div class="text-4xl mb-2">🎒</div>Túi trống</div>`;
    return;
  }
  
  if (!window.selectedInventoryItem || !inv[window.selectedInventoryItem]) {
    window.selectedInventoryItem = items[0];
  }

  // Left column: grid of items
  let gridHtml = `<div class="w-full md:w-3/5 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 content-start pr-2 overflow-y-auto" style="max-height: 50vh;">`;
  items.forEach(k => {
    let name=k, emoji='📦', type='Khác';
    if (k === 'harvest_chicken_egg') {
      name='Trứng gà';emoji='🥚';type='Nông sản';
    } else if (k === 'harvest_cow_milk') {
      name='Sữa bò';emoji='🥛';type='Nông sản';
    } else if (k.startsWith('harvest_')) {
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
    } else if (k==='food_poultry') {
      name='Thức ăn gia cầm';emoji='🌾';type='Thức ăn';
    } else if (k==='food_livestock') {
      name='Thức ăn gia súc';emoji='🌾';type='Thức ăn';
    } else if (k==='medicine_animal') {
      name='Thuốc thú y';emoji='💊';type='Vật phẩm';
    } else if (k==='cheese') {
      name='Phô mai';emoji='🧀';type='Sản phẩm';
    }
    
    const isSelected = window.selectedInventoryItem === k;
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
  const k = window.selectedInventoryItem;
  if (k) {
    let name=k, emoji='📦', type='Khác', desc='';
    if (k === 'harvest_chicken_egg') {
      name='Trứng gà';emoji='🥚';type='Nông sản';desc=`Trứng gà tươi ngon thu hoạch từ chuồng gia cầm.<br>Giá bán: <span class="text-yellow-400">50🪙</span>.<br><span class="text-green-400">💡 Ăn để hồi phục +2 Năng lượng.</span>`;
    } else if (k === 'harvest_cow_milk') {
      name='Sữa bò';emoji='🥛';type='Nông sản';desc=`Sữa bò tươi nguyên chất thu hoạch từ chuồng gia súc.<br>Giá bán: <span class="text-yellow-400">500🪙</span>.<br><span class="text-green-400">💡 Ăn để hồi phục +10 Năng lượng.</span>`;
    } else if (k.startsWith('harvest_')) {
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
    } else if (k==='food_poultry') {
      name='Thức ăn gia cầm';emoji='🌾';type='Thức ăn';desc=`Thức ăn dùng để cho gà ăn tại chuồng gia cầm. Hồi 100% sinh lực cho gà.`;
    } else if (k==='food_livestock') {
      name='Thức ăn gia súc';emoji='🌾';type='Thức ăn';desc=`Thức ăn dùng để cho bò ăn tại chuồng gia súc. Hồi 100% sinh lực cho bò.`;
    } else if (k==='medicine_animal') {
      name='Thuốc thú y';emoji='💊';type='Vật phẩm';desc=`Thuốc dùng để điều trị bệnh ngay lập tức cho vật nuôi và bảo vệ vật nuôi khỏi dịch bệnh trong vòng <span class="text-blue-400">24 giờ</span>.`;
    } else if (k==='cheese') {
      name='Phô mai';emoji='🧀';type='Sản phẩm';desc=`Phô mai béo ngậy được chế biến từ sữa bò tươi nguyên chất.<br>Giá bán: <span class="text-yellow-400">2500🪙</span>.<br><span class="text-green-400">💡 Ăn để hồi phục +18 Năng lượng.</span>`;
    }

    let eatGain = 0;
    if (k === 'harvest_chicken_egg') eatGain = 2;
    else if (k === 'harvest_cow_milk') eatGain = 10;
    else if (k.startsWith('harvest_')) eatGain = 2;
    else if (k === 'food_bread') eatGain = 10;
    else if (k === 'food_noodle') eatGain = 25;
    else if (k === 'food_rice') eatGain = 50;
    else if (k === 'cheese') eatGain = 18;

    let eatButton = '';
    if (eatGain > 0) {
      eatButton = `
        <div class="mt-4">
          <button class="btn btn-blue w-full py-2 font-bold" onclick="eatFood('${k}', ${eatGain})">🍽️ Ăn (+${eatGain} ⚡)</button>
        </div>
      `;
    }

    const qty = inv[k] || 0;
    const discardBlock = `
      <div class="mt-4 pt-3 border-t border-gray-700/60 flex flex-col gap-2">
        <div class="text-[11px] text-gray-400 font-bold mb-0.5">Hành động túi đồ:</div>
        <div class="grid grid-cols-2 gap-2">
          <button class="btn btn-red py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm" 
                  onclick="handleDiscardItem('${k}', 1)">
            🗑️ Vứt x1
          </button>
          <button class="btn btn-red py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm ${qty < 5 ? 'opacity-50 cursor-not-allowed' : ''}" 
                  ${qty < 5 ? 'disabled' : ''} 
                  onclick="handleDiscardItem('${k}', 5)">
            🗑️ Vứt x5
          </button>
        </div>
      </div>
    `;

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
      ${discardBlock}
    `;
  }
  detailHtml += `</div>`;

  el.innerHTML = `<div class="flex flex-col md:flex-row w-full">${gridHtml}${detailHtml}</div>`;
}
window.renderInventoryContent = renderInventoryContent;

export function selectInventoryItem(k) {
  window.selectedInventoryItem = k;
  renderInventoryContent();
}
window.selectInventoryItem = selectInventoryItem;

export function eatFood(key, amount) {
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

export function handleDiscardItem(key, qty) {
  let name = key;
  if (key === 'harvest_chicken_egg') {
    name = 'Trứng gà';
  } else if (key === 'harvest_cow_milk') {
    name = 'Sữa bò';
  } else if (key.startsWith('harvest_')) {
    const p = PLANTS_DATA[key.replace('harvest_','')];
    if (p) { name = p.name; }
  } else if (key.startsWith('fertilizer_')) {
    const f = parseInt(key.replace('fertilizer_',''));
    const fd = FERTILIZER_DATA[f];
    if (fd) { name = fd.name; }
  } else if (key === 'pesticide') {
    name = 'Thuốc trừ sâu';
  } else if (key === 'food_bread') {
    name = 'Bánh mì';
  } else if (key === 'food_noodle') {
    name = 'Mì';
  } else if (key === 'food_rice') {
    name = 'Cơm';
  } else if (key === 'food_poultry') {
    name = 'Thức ăn gia cầm';
  } else if (key === 'food_livestock') {
    name = 'Thức ăn gia súc';
  } else if (key === 'medicine_animal') {
    name = 'Thuốc thú y';
  } else if (PLANTS_DATA[key]) {
    const p = PLANTS_DATA[key];
    name = p.name + ' (hạt giống)';
  } else if (key === 'cheese') {
    name = 'Phô mai';
  }

  if (!confirm(`Bạn có chắc chắn muốn vứt x${qty} ${name} không?`)) {
    return;
  }

  const res = GAME.discardItem(key, qty);
  if (res.ok) {
    toast(`🗑️ Đã vứt x${qty} vật phẩm!`, 'info');
    if (!G.inventory[key]) {
      window.selectedInventoryItem = null;
    }
    render();
  } else {
    toast(res.msg, 'error');
  }
}
window.handleDiscardItem = handleDiscardItem;
