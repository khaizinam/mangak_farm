// ============================================================
// SHOP & MARKET MODULE
// ============================================================

import { toast, updateGold, formatTime } from './core.js';

export function showShopTab(tab) {
  window.shopTab = tab;
  document.querySelectorAll('.shop-tab').forEach(el => {
    el.classList.remove('active','text-yellow-400','border-b-2','border-yellow-400');
    el.classList.add('text-gray-400');
  });
  const activeTab = document.getElementById(tab === 'buy' ? 'tabBuy' : 'tabSell');
  if (activeTab) {
    activeTab.classList.add('active','text-yellow-400','border-b-2','border-yellow-400');
    activeTab.classList.remove('text-gray-400');
  }
  renderShopContent();
}
window.showShopTab = showShopTab;

export function renderShopContent() {
  updateGold();
  const el = document.getElementById('shopContent');
  if (!el) return;
  if (window.shopTab === 'buy') {
    el.innerHTML = renderBuyTab();
  } else {
    el.innerHTML = renderSellTab();
  }
}
window.renderShopContent = renderShopContent;

export function renderBuyTab() {
  const items = [];
  Object.values(PLANTS_DATA).filter(p=>p.season===G.season).forEach(p => {
    items.push({ type: 'seed', id: p.id, data: p });
  });
  
  items.push({ type: 'animal', id: 'chicken', data: { name: 'Gà con', buy_price: 100, emoji: '🐔' } });
  items.push({ type: 'animal', id: 'cow', data: { name: 'Bò con', buy_price: 200, emoji: '🐮' } });

  [1,2,3].forEach(f => {
    items.push({ type: 'fertilizer', id: f.toString(), data: FERTILIZER_DATA[f] });
  });
  items.push({ type: 'pesticide', id: 'pesticide', data: { name: 'Thuốc trừ sâu', price: PESTICIDE_PRICE, emoji: '🧪' } });
  
  items.push({ type: 'food', id: 'bread', data: { name: 'Bánh mì', price: 1000, emoji: '🍞', energy: 10 } });
  items.push({ type: 'food', id: 'noodle', data: { name: 'Mì', price: 1800, emoji: '🍜', energy: 25 } });
  items.push({ type: 'food', id: 'rice', data: { name: 'Cơm', price: 4800, emoji: '🍚', energy: 50 } });
  
  items.push({ type: 'food', id: 'poultry', data: { name: 'Thức ăn gia cầm', price: 50, emoji: '🌾', energy: 0 } });
  items.push({ type: 'food', id: 'livestock', data: { name: 'Thức ăn gia súc', price: 50, emoji: '🌾', energy: 0 } });
  items.push({ type: 'medicine_animal', id: 'medicine_animal', data: { name: 'Thuốc thú y', price: 50, emoji: '💊' } });

  if (!window.selectedShopItemId && items.length > 0) {
    window.selectedShopItemId = items[0].type + '_' + items[0].id;
  }

  let listHtml = `<div class="w-full md:w-3/5 overflow-y-auto pr-2" style="max-height: 60vh;">`;
  
  const categories = [
    { title: '🌱 Hạt giống', filter: i => i.type === 'seed' },
    { title: '🐔 Gia súc & Gia cầm', filter: i => i.type === 'animal' },
    { title: '🍞 Thực phẩm hồi năng lượng (Người)', filter: i => i.type === 'food' && i.id !== 'poultry' && i.id !== 'livestock' },
    { title: '🌾 Thức ăn vật nuôi & Hỗ trợ', filter: i => i.type === 'fertilizer' || i.type === 'pesticide' || i.type === 'medicine_animal' || i.id === 'poultry' || i.id === 'livestock' }
  ];

  categories.forEach(cat => {
    const catItems = items.filter(cat.filter);
    if (catItems.length > 0) {
      listHtml += `<div class="font-bold text-yellow-400 mb-2 mt-4 first:mt-1 text-xs uppercase tracking-wider">${cat.title}</div>`;
      catItems.forEach(item => {
        const p = item.data;
        const isSelected = window.selectedShopItemId === `${item.type}_${item.id}`;
        const price = p.price || p.buy_price || PESTICIDE_PRICE;
        
        let descText = '';
        if (item.type === 'seed') {
          descText = `Hạt giống · Mùa ${SEASON_LABELS[p.season]}`;
        } else if (item.type === 'animal') {
          descText = `Vật nuôi nuôi ở Farm`;
        } else if (item.type === 'food') {
          if (item.id === 'poultry' || item.id === 'livestock') {
            descText = `Thức ăn cho vật nuôi`;
          } else {
            descText = `Thực phẩm · Hồi +${p.energy}⚡`;
          }
        } else if (item.type === 'fertilizer') {
          descText = 'Phân bón tăng trưởng';
        } else if (item.type === 'pesticide') {
          descText = 'Thuốc phòng trừ sâu hại';
        } else if (item.type === 'medicine_animal') {
          descText = 'Thuốc thú y trị bệnh';
        }

        listHtml += `
          <div class="p-3 mb-2 rounded-xl cursor-pointer flex justify-between items-center border transition-all ${isSelected ? 'bg-yellow-950/40 border-yellow-500 shadow-md shadow-yellow-500/10' : 'bg-gray-800/80 border-gray-700 hover:border-gray-500'}" onclick="selectShopItem('${item.type}_${item.id}')">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${p.emoji}</span>
              <div>
                <div class="font-bold text-white text-sm">${p.name}</div>
                <div class="text-xs text-gray-400 mt-0.5">${descText}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="text-yellow-400 font-bold text-sm bg-gray-900 px-2 py-1 rounded border border-gray-700 flex items-center gap-1">${price}🪙</div>
              <span class="text-gray-500 text-xs md:hidden">▶</span>
            </div>
          </div>
        `;
      });
    }
  });
  listHtml += `</div>`;

  let detailHtml = `<div class="hidden md:flex md:w-2/5 pl-4 border-l border-gray-700 flex-col gap-4">`;
  detailHtml += renderShopItemDetails(window.selectedShopItemId);
  detailHtml += `</div>`;

  return `<div class="flex flex-col md:flex-row w-full gap-4">${listHtml}${detailHtml}</div>`;
}
window.renderBuyTab = renderBuyTab;

export function renderShopItemDetails(itemId) {
  const items = [];
  Object.values(PLANTS_DATA).filter(p=>p.season===G.season).forEach(p => {
    items.push({ type: 'seed', id: p.id, data: p });
  });

  items.push({ type: 'animal', id: 'chicken', data: { name: 'Gà', buy_price: 100, emoji: '🐔' } });
  items.push({ type: 'animal', id: 'cow', data: { name: 'Bò', buy_price: 200, emoji: '🐮' } });

  [1,2,3].forEach(f => {
    items.push({ type: 'fertilizer', id: f.toString(), data: FERTILIZER_DATA[f] });
  });
  items.push({ type: 'pesticide', id: 'pesticide', data: { name: 'Thuốc trừ sâu', price: PESTICIDE_PRICE, emoji: '🧪' } });
  
  items.push({ type: 'food', id: 'bread', data: { name: 'Bánh mì', price: 1000, emoji: '🍞', energy: 10 } });
  items.push({ type: 'food', id: 'noodle', data: { name: 'Mì', price: 1800, emoji: '🍜', energy: 25 } });
  items.push({ type: 'food', id: 'rice', data: { name: 'Cơm', price: 4800, emoji: '🍚', energy: 50 } });
  
  items.push({ type: 'food', id: 'poultry', data: { name: 'Thức ăn gia cầm', price: 50, emoji: '🌾', energy: 0 } });
  items.push({ type: 'food', id: 'livestock', data: { name: 'Thức ăn gia súc', price: 50, emoji: '🌾', energy: 0 } });
  items.push({ type: 'medicine_animal', id: 'medicine_animal', data: { name: 'Thuốc thú y', price: 50, emoji: '💊' } });

  const selectedItem = items.find(i => `${i.type}_${i.id}` === itemId);
  if (!selectedItem) return '';

  let detailHtml = '';
  if (selectedItem.type === 'seed') {
    const p = selectedItem.data;
    const wrong = p.season !== G.season;
    detailHtml += `
      <div class="text-center">
        <div class="text-6xl mb-2">${p.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${p.name}</div>
        <div class="text-sm text-gray-400">Mùa ${SEASON_LABELS[p.season]}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${p.buy_price}🪙</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá bán NS:</span> <span class="text-green-400">${p.sell_price_per_yield}🪙/sp</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Sản lượng:</span> <span class="text-green-400">${p.base_yield}</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Thời gian:</span> <span class="text-blue-400">${formatTime(p.growth_time * 60000)}</span></div>
        <div class="flex justify-between"><span>Khát nước:</span> <span class="text-blue-400">-${Math.round(p.water_consume_per_hour)}%/h</span></div>
        ${wrong ? `<div class="text-red-400 text-xs mt-2 text-center bg-red-950/40 p-1.5 rounded border border-red-900">⚠️ Trái mùa: -50% sản lượng</div>` : `<div class="text-green-400 text-xs mt-2 text-center bg-green-950/40 p-1.5 rounded border border-green-900">✅ Đang đúng mùa</div>`}
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('seed', '${p.id}', 1)">Mua x1 (${p.buy_price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('seed', '${p.id}', 5)">Mua x5 (${p.buy_price * 5}🪙)</button>
      </div>
    `;
  } else if (selectedItem.type === 'animal') {
    const a = selectedItem.data;
    const isChicken = selectedItem.id === 'chicken';
    const sellPrice = isChicken ? 200 : 400;
    const capacityText = isChicken ? `Gà con (Chuồng gia cầm, capacity: ${G.animals.filter(an => an.type === 'chicken').length}/${G.poultry_capacity})` : `Bò con (Chuồng gia súc, capacity: ${G.animals.filter(an => an.type === 'cow').length}/${G.livestock_capacity})`;
    
    detailHtml += `
      <div class="text-center">
        <div class="text-6xl mb-2">${a.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${a.name}</div>
        <div class="text-sm text-gray-400">${capacityText}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-xs space-y-2 leading-relaxed">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${a.buy_price}🪙</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá bán (lớn):</span> <span class="text-green-400 font-bold">${sellPrice}🪙</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Thời gian trưởng thành:</span> <span class="text-blue-400">4 giờ</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Tuổi thọ:</span> <span class="text-green-400">14 ngày</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Sản lượng:</span> <span class="text-cyan-400">${isChicken ? '20 trứng/giờ' : '5 sữa bò/giờ'}</span></div>
        <div class="text-[11px] text-gray-400 mt-1">💡 Cần cho ăn cứ mỗi 6 giờ bằng <b>${isChicken ? 'thức ăn gia cầm' : 'thức ăn gia súc'}</b> (khi sinh lực <= 50%). Nếu sinh lực về 0 và không cho ăn trong 6 giờ, vật nuôi sẽ chết.</div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('animal', '${selectedItem.id}', 1)">Mua x1 (${a.buy_price}🪙)</button>
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
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${f.price}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          <span class="text-green-400">+${Math.round((f.multiplier-1)*100)}% Sản lượng</span>
          <span class="text-blue-400">-${Math.round((1-f.time_multiplier)*100)}% Thời gian lớn</span>
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('fertilizer', '${selectedItem.id}', 1)">Mua x1 (${f.price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('fertilizer', '${selectedItem.id}', 5)">Mua x5 (${f.price * 5}🪙)</button>
      </div>
    `;
  } else if (selectedItem.type === 'pesticide') {
    detailHtml += `
      <div class="text-center">
        <div class="text-6xl mb-2">🧪</div>
        <div class="text-xl font-bold text-yellow-400">Thuốc trừ sâu</div>
        <div class="text-sm text-gray-400">Dùng để diệt sâu bọ</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${PESTICIDE_PRICE}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          <span class="text-green-400 font-bold">Diệt sâu hại tức thì</span>
          <span class="text-blue-400">Bảo vệ cây khỏi sâu bệnh trong 24h</span>
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('pesticide', '', 1)">Mua x1 (${PESTICIDE_PRICE}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('pesticide', '', 5)">Mua x5 (${PESTICIDE_PRICE * 5}🪙)</button>
      </div>
    `;
  } else if (selectedItem.type === 'food') {
    const f = selectedItem.data;
    const isAnimalFeed = selectedItem.id === 'poultry' || selectedItem.id === 'livestock';
    
    detailHtml += `
      <div class="text-center">
        <div class="text-6xl mb-2">${f.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${f.name}</div>
        <div class="text-sm text-gray-400">${isAnimalFeed ? 'Thức ăn cho vật nuôi' : 'Thực phẩm hồi năng lượng'}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${f.price}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          ${isAnimalFeed ? `
            <span class="text-green-400 font-bold">Hồi phục 100% sinh lực cho vật nuôi</span>
            <span class="text-gray-400 text-xs mt-1">Dùng khi sinh lực của vật nuôi <= 50%</span>
          ` : `
            <span class="text-cyan-400 font-bold">+${f.energy} ⚡ Năng lượng cho người chơi</span>
          `}
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('food', '${selectedItem.id}', 1)">Mua x1 (${f.price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('food', '${selectedItem.id}', 5)">Mua x5 (${f.price * 5}🪙)</button>
      </div>
    `;
  } else if (selectedItem.type === 'medicine_animal') {
    const f = selectedItem.data;
    detailHtml += `
      <div class="text-center">
        <div class="text-6xl mb-2">${f.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${f.name}</div>
        <div class="text-sm text-gray-400">Thuốc hỗ trợ điều trị và phòng bệnh cho vật nuôi</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${f.price}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          <span class="text-green-400 font-bold">Trị bệnh ngay lập tức cho vật nuôi</span>
          <span class="text-blue-400">Bảo vệ vật nuôi không bị nhiễm bệnh trong 24h</span>
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('medicine_animal', '${selectedItem.id}', 1)">Mua x1 (${f.price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('medicine_animal', '${selectedItem.id}', 5)">Mua x5 (${f.price * 5}🪙)</button>
      </div>
    `;
  }
  return detailHtml;
}
window.renderShopItemDetails = renderShopItemDetails;

export function openShopItemModal(id) {
  const modal = document.getElementById('shopItemModal');
  const content = document.getElementById('shopItemModalContent');
  if (modal && content) {
    content.innerHTML = renderShopItemDetails(id);
    modal.style.display = 'flex';
  }
}
window.openShopItemModal = openShopItemModal;

export function closeShopItemModal() {
  const modal = document.getElementById('shopItemModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
window.closeShopItemModal = closeShopItemModal;

export function selectShopItem(id) {
  window.selectedShopItemId = id;
  if (window.innerWidth < 768) {
    openShopItemModal(id);
  } else {
    renderShopContent();
  }
}
window.selectShopItem = selectShopItem;

export function renderSellTab() {
  const inv = G.inventory;
  const items = Object.keys(inv).filter(k => inv[k] > 0 && (k.startsWith('harvest_') || k === 'cheese'));
  if (items.length === 0) {
    return `<div class="text-center py-8 text-gray-400"><div class="text-4xl mb-2">🎒</div>Không có sản phẩm thu hoạch nào để bán</div>`;
  }

  let html = `<div class="grid grid-cols-2 md:grid-cols-3 gap-3 p-1">`;
  items.forEach(k => {
    let name = k, price = 0, emoji = '📦';
    if (k === 'harvest_chicken_egg') {
      name = 'Trứng gà'; price = 50; emoji = '🥚';
    } else if (k === 'harvest_cow_milk') {
      name = 'Sữa bò'; price = 500; emoji = '🥛';
    } else if (k.startsWith('harvest_')) {
      const p = PLANTS_DATA[k.replace('harvest_','')];
      if (p) { name = p.name; price = p.sell_price_per_yield; emoji = p.emoji; }
    } else if (k.startsWith('fertilizer_')) {
      const f = parseInt(k.replace('fertilizer_',''));
      const fd = FERTILIZER_DATA[f];
      if (fd) { name = fd.name; price = Math.floor(fd.price*0.5); emoji = fd.emoji; }
    } else if (k === 'pesticide') {
      name = 'Thuốc trừ sâu'; price = Math.floor(PESTICIDE_PRICE*0.5); emoji = '🧪';
    } else if (k === 'food_bread') {
      name = 'Bánh mì'; price = 500; emoji = '🍞';
    } else if (k === 'food_noodle') {
      name = 'Mì'; price = 900; emoji = '🍜';
    } else if (k === 'food_rice') {
      name = 'Cơm'; price = 2400; emoji = '🍚';
    } else if (k === 'food_poultry') {
      name = 'Thức ăn gia cầm'; price = 25; emoji = '🌾';
    } else if (k === 'food_livestock') {
      name = 'Thức ăn gia súc'; price = 25; emoji = '🌾';
    } else if (k === 'medicine_animal') {
      name = 'Thuốc thú y'; price = 25; emoji = '💊';
    } else if (PLANTS_DATA[k]) {
      const p = PLANTS_DATA[k];
      name = p.name + ' (hạt giống)'; price = Math.floor(p.buy_price*0.5); emoji = p.emoji;
    } else if (k === 'cheese') {
      name = 'Phô mai'; price = 2500; emoji = '🧀';
    }
    
    html += `
      <div class="relative bg-gray-800 border border-gray-700 rounded-2xl p-3 flex flex-col justify-between hover:border-gray-500 transition-all shadow-lg">
        <!-- Badge -->
        <div class="absolute top-2 right-2 text-[10px] sm:text-xs bg-gray-900 border border-gray-700 px-2 py-0.5 rounded-full text-cyan-400 font-bold font-mono shadow-md z-10">
          x${inv[k]}
        </div>
        
        <!-- Info -->
        <div class="flex items-center gap-2 mb-3 pr-8">
          <span class="text-3xl">${emoji}</span>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-white text-xs sm:text-sm truncate" title="${name}">${name}</div>
            <div class="text-[11px] text-yellow-400 font-semibold mt-0.5 flex items-center gap-0.5">
              <span>Bán:</span>
              <span class="text-yellow-300 font-bold">${price}🪙</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex flex-col gap-2 mt-auto">
          <!-- Quantity Selector Row -->
          <div class="flex items-center justify-between gap-1 bg-gray-900/60 p-1 rounded-lg border border-gray-700/60">
            <button class="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors select-none" onclick="adjustSellQty('${k}', -1, ${inv[k]})">-</button>
            <input type="number" id="sell_qty_${k}" class="no-spinner w-12 bg-gray-950 border border-gray-700/80 rounded py-0.5 text-center text-xs font-bold text-white focus:border-yellow-500 focus:outline-none" value="1" min="1" max="${inv[k]}" oninput="validateSellQty('${k}', ${inv[k]})" onblur="if(this.value === '' || parseInt(this.value) < 1) this.value = 1;" onkeydown="if(event.key==='Enter') handleShopSellCustom('${k}', ${inv[k]})">
            <button class="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors select-none" onclick="adjustSellQty('${k}', 1, ${inv[k]})">+</button>
            <button class="px-1.5 py-0.5 bg-yellow-600/30 hover:bg-yellow-600/50 text-[10px] font-bold rounded text-yellow-400 transition-colors select-none" onclick="setSellQtyMax('${k}', ${inv[k]})">MAX</button>
          </div>
          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-1.5">
            <button class="btn btn-yellow text-[10px] sm:text-xs py-1.5 font-bold flex items-center justify-center gap-1 shadow-sm transition-all" onclick="handleShopSellCustom('${k}', ${inv[k]})">Bán</button>
            <button class="btn btn-red text-[10px] sm:text-xs py-1.5 font-bold flex items-center justify-center gap-1 shadow-sm transition-all" onclick="shopSell('${k}', ${inv[k]})">Bán hết</button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  return html;
}
window.renderSellTab = renderSellTab;

export function shopBuy(type, id, qty) {
  const res = buyItem(type, id, qty);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  updateGold();
  renderShopContent();
  if (window.innerWidth < 768 && document.getElementById('shopItemModal').style.display === 'flex') {
    document.getElementById('shopItemModalContent').innerHTML = renderShopItemDetails(window.selectedShopItemId);
  }
  toast(`✅ Đã mua (${res.cost}🪙)`, 'success');
}
window.shopBuy = shopBuy;

export function shopSell(key, qty) {
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

  if (!confirm(`Bạn có chắc chắn muốn bán x${qty} ${name} không?`)) {
    return;
  }

  const res = sellItem(key, qty);
  if (!res.ok) { toast(res.msg, 'error'); return; }
  updateGold();
  renderShopContent();
  toast(`💰 Bán được ${res.revenue}🪙!`, 'success');
}
window.shopSell = shopSell;

export function adjustSellQty(key, delta, max) {
  const input = document.getElementById(`sell_qty_${key}`);
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(max, val + delta));
  input.value = val;
}
window.adjustSellQty = adjustSellQty;

export function setSellQtyMax(key, max) {
  const input = document.getElementById(`sell_qty_${key}`);
  if (input) {
    input.value = max;
  }
}
window.setSellQtyMax = setSellQtyMax;

export function validateSellQty(key, max) {
  const input = document.getElementById(`sell_qty_${key}`);
  if (!input) return;
  let val = parseInt(input.value);
  if (isNaN(val) || val < 1) {
    // Let them type, but cap it if it is a number
  } else if (val > max) {
    input.value = max;
  }
}
window.validateSellQty = validateSellQty;

export function handleShopSellCustom(key, max) {
  const input = document.getElementById(`sell_qty_${key}`);
  if (!input) return;
  let qty = parseInt(input.value);
  if (isNaN(qty) || qty < 1) {
    toast('❌ Số lượng bán không hợp lệ!', 'error');
    return;
  }
  if (qty > max) {
    qty = max;
  }
  shopSell(key, qty);
}
window.handleShopSellCustom = handleShopSellCustom;
