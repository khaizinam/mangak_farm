// ============================================================
// BARN & ANIMAL MODULE
// ============================================================

import { toast, render, formatTime } from './core.js';

export function renderBarnView(type) {
  const isPoultry = type === 'poultry';
  const label = isPoultry ? 'Chuồng gia cầm 🐔' : 'Chuồng gia súc 🐮';
  const capacity = isPoultry ? G.poultry_capacity : G.livestock_capacity;
  const list = G.animals.filter(a => a.type === (isPoultry ? 'chicken' : 'cow'));
  
  // Price for next expand
  const expandPrice = 12000 * Math.pow(2, capacity - 3);
  const feedKey = isPoultry ? 'food_poultry' : 'food_livestock';
  const feedQty = G.inventory[feedKey] || 0;
  const feedName = isPoultry ? 'thức ăn gia cầm' : 'thức ăn gia súc';
  const feedEmoji = '🌾';

  let html = `
    <div class="flex flex-col gap-4">
      <!-- Barn Header -->
      <div class="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 class="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <span>${isPoultry ? '🐔' : '🐮'}</span>
            <span>${label}</span>
          </h2>
          <div class="text-xs text-gray-400 mt-1 font-semibold flex items-center gap-1.5">
            <span>Sức chứa:</span>
            <span class="text-cyan-400 font-bold">${list.length}/${capacity} con</span>
            <span class="text-gray-600">|</span>
            <span>Tối đa: 20 con</span>
          </div>
        </div>
        <div>
  `;

  if (capacity < 20) {
    html += `
          <button class="btn btn-green text-xs font-bold py-2 px-3 shadow-md" onclick="handleExpandBarn('${type}')">
            🏗️ Mở rộng +1 sức chứa (${expandPrice}🪙)
          </button>
    `;
  } else {
    html += `
          <span class="text-xs text-gray-500 font-bold">✓ Chuồng đã mở tối đa</span>
    `;
  }

  html += `
        </div>
      </div>
      
      <!-- Animal Grid -->
  `;

  if (list.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-12 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700 text-center">
        <span class="text-5xl mb-3">${isPoultry ? '🐔' : '🐮'}</span>
        <div class="text-gray-300 font-bold mb-1">Chuồng đang trống</div>
        <p class="text-xs text-gray-500 mb-4">Hãy mua vật nuôi từ tiệm tạp hóa để bắt đầu chăn nuôi.</p>
        <button class="btn btn-yellow text-xs font-bold py-2 px-4 shadow-md" onclick="switchView('viewShop')">
          🏪 Đến Cửa hàng mua vật nuôi
        </button>
      </div>
    `;
  } else {
    html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">`;
    list.forEach(a => {
      // Run lazyUpdate before displaying
      a.lazyUpdate(Date.now());
      
      const now = Date.now();
      const age = now - a.purchased_at;
      const hoursToAdult = 4;
      const msPerHour = 3600000;
      
      let statusText = '';
      let statusColor = '';
      let timeText = '';
      
      let protectionText = '';
      if (a.status !== 'dead' && a.medicine_until && a.medicine_until > now) {
        protectionText = `<div class="text-[11px] text-cyan-400 font-bold flex items-center gap-1 mt-0.5">🛡️ Kháng bệnh: ${formatTime(a.medicine_until - now)}</div>`;
      }

      if (a.status === 'dead') {
        statusText = 'Đã chết 💀';
        statusColor = 'text-red-400';
        timeText = 'Sinh vật đã qua đời';
      } else if (a.sick_started_at) {
        statusText = 'Nhiễm bệnh 🤒';
        statusColor = 'text-purple-400 font-extrabold animate-pulse';
        if (a.status === 'baby') {
          const remaining = Math.max(0, hoursToAdult * msPerHour - a.grown_ms);
          timeText = `Trưởng thành sau: <span class="text-white font-bold font-mono">${formatTime(remaining)}</span> <span class="text-purple-400 font-semibold block text-[10px] mt-0.5">⚠️ Đã dừng lớn do bệnh</span>`;
        } else {
          const remainingLifespan = Math.max(0, 14 * 24 * msPerHour - age);
          timeText = `Tuổi thọ còn: <span class="text-white font-bold font-mono">${formatTime(remainingLifespan)}</span> <span class="text-purple-400 font-semibold block text-[10px] mt-0.5">⚠️ Đã dừng sản xuất do bệnh</span>`;
        }
      } else if (a.status === 'baby') {
        statusText = 'Con non 🍼';
        statusColor = 'text-green-400';
        const remaining = Math.max(0, hoursToAdult * msPerHour - a.grown_ms);
        timeText = `Trưởng thành sau: <span class="text-white font-bold font-mono">${formatTime(remaining)}</span>`;
      } else {
        statusText = 'Trưởng thành ✨';
        statusColor = 'text-yellow-400';
        const remainingLifespan = Math.max(0, 14 * 24 * msPerHour - age);
        timeText = `Tuổi thọ còn: <span class="text-white font-bold font-mono">${formatTime(remainingLifespan)}</span>`;
      }

      const hp = Math.round(a.health);
      const hpColor = hp <= 20 ? 'bg-red-500' : hp <= 50 ? 'bg-yellow-500' : 'bg-green-500';
      const accumulated = Math.floor(a.accumulated_production);
      const maxProd = a.max_production;

      html += `
        <div class="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-500 transition-all shadow-lg relative">
          <!-- Top section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-3xl">${a.emoji}</span>
              <span class="text-xs font-bold uppercase tracking-wider ${statusColor}">${statusText}</span>
            </div>
            
            <div class="space-y-1.5 text-xs text-gray-300">
              <div>${timeText}</div>
              ${protectionText}
              
              <!-- Health bar -->
              <div>
                <div class="flex justify-between mb-0.5 font-semibold text-[11px]">
                  <span>Sinh lực:</span>
                  <span class="${hp <= 20 ? 'text-red-400' : hp <= 50 ? 'text-yellow-400' : 'text-green-400'} font-bold font-mono">${hp}%</span>
                </div>
                <div class="w-full bg-gray-900 rounded-full h-2 overflow-hidden shadow-inner border border-gray-700">
                  <div class="${hpColor} h-2 rounded-full transition-all" style="width: ${hp}%"></div>
                </div>
              </div>
              
              <!-- Production info -->
              ${a.status === 'adult' ? `
                <div class="flex justify-between items-center py-1 border-t border-gray-700/60 mt-2">
                  <span>${isPoultry ? '🥚 Trứng tích lũy:' : '🥛 Sữa tích lũy:'}</span>
                  <span class="font-bold font-mono text-cyan-400">${accumulated}/${maxProd}</span>
                </div>
                ${accumulated >= maxProd ? `
                  <div class="text-[10px] text-yellow-500 font-bold animate-pulse text-right">⚠️ Đã đầy sản lượng! Cần thu hoạch.</div>
                ` : ''}
              ` : ''}
            </div>
          </div>
          
          <!-- Bottom actions -->
          <div class="mt-4 pt-3 border-t border-gray-700/60 flex flex-col gap-1.5">
      `;

      if (a.status === 'dead') {
        html += `
            <button class="btn btn-gray w-full py-2 text-xs font-bold" onclick="handleRemoveDeadAnimal('${a.id}')">
              🗑️ Dọn dẹp xác vật nuôi
            </button>
        `;
      } else {
        html += `<div class="grid grid-cols-2 gap-2">`;
        
        // Feed button (can feed only when hp <= 50)
        const isHungry = hp <= 50;
        html += `
          <button class="btn ${isHungry ? 'btn-blue' : 'btn-gray opacity-50 cursor-not-allowed'} py-2 text-xs font-bold flex items-center justify-center gap-1" 
                  ${isHungry ? `onclick="handleFeedAnimal('${a.id}')"` : 'disabled'}
                  title="${isHungry ? 'Cho ăn' : 'Chưa thể cho ăn (chỉ khi sinh lực <= 50%)'}">
            🥣 Cho ăn (Còn x${feedQty})
          </button>
        `;

        if (a.status === 'adult') {
          // Harvest button
          const hasProduce = accumulated >= 1;
          html += `
            <button class="btn ${hasProduce ? 'btn-yellow animate-bounce' : 'btn-gray opacity-50 cursor-not-allowed'} py-2 text-xs font-bold" 
                    ${hasProduce ? `onclick="handleHarvestAnimal('${a.id}')"` : 'disabled'}>
              🧺 Thu hoạch
            </button>
          `;
          html += `</div>`; // Close grid

          // Sell button
          html += `
            <button class="btn btn-green w-full py-2 text-xs font-bold mt-1.5" onclick="handleSellAnimal('${a.id}')">
              💰 Bán vật nuôi (+${a.sell_price}🪙)
            </button>
          `;
        } else {
          // Baby has no harvest or sell
          html += `
            <button class="btn btn-gray opacity-50 cursor-not-allowed py-2 text-xs font-bold" disabled>
              🚫 Chưa thể thu hoạch
            </button>
          </div>
          `;
        }
        const medQty = G.inventory['medicine_animal'] || 0;
        html += `
          <button class="btn btn-purple w-full py-2 text-xs font-bold mt-1.5 flex items-center justify-center gap-1"
                  onclick="handleCureAnimal('${a.id}')">
            💊 Tiêm thuốc (Còn x${medQty})
          </button>
        `;
      }

      html += `
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `
    </div>
  `;
  return html;
}
window.renderBarnView = renderBarnView;

export function handleExpandBarn(type) {
  const res = GAME.expandBarn(type);
  if (res.ok) {
    render();
    toast(`🏗️ Mở rộng chuồng thành công! Sức chứa mới: ${res.newCap} con`, 'success');
  } else {
    toast(res.msg, 'error');
  }
}
window.handleExpandBarn = handleExpandBarn;

export function handleFeedAnimal(id) {
  const res = GAME.feedAnimal(id);
  if (res.ok) {
    render();
    toast(`🥣 Cho vật nuôi ăn thành công! Sinh lực hồi phục 100%`, 'success');
  } else {
    toast(res.msg, 'error');
  }
}
window.handleFeedAnimal = handleFeedAnimal;

export function handleHarvestAnimal(id) {
  const res = GAME.harvestAnimal(id);
  if (res.ok) {
    render();
    const name = res.item === 'harvest_chicken_egg' ? 'Trứng gà' : 'Sữa bò';
    toast(`🧺 Đã thu hoạch ${res.qty} ${name}! (+${res.item === 'harvest_chicken_egg' ? res.qty * 50 : res.qty * 500}🪙 nếu bán)`, 'success');
  } else {
    toast(res.msg, 'error');
  }
}
window.handleHarvestAnimal = handleHarvestAnimal;

export function handleSellAnimal(id) {
  const animal = G.animals.find(a => a.id === id);
  if (!animal) {
    toast('Không tìm thấy vật nuôi!', 'error');
    return;
  }
  const name = animal.type === 'chicken' ? 'Gà' : (animal.type === 'cow' ? 'Bò' : animal.type);
  if (!confirm(`Bạn có chắc chắn muốn bán con ${name} này với giá ${animal.sell_price}🪙 không?`)) {
    return;
  }
  const res = GAME.sellAnimal(id);
  if (res.ok) {
    render();
    toast(`💰 Đã bán vật nuôi! Nhận được +${res.price}🪙`, 'success');
  } else {
    toast(res.msg, 'error');
  }
}
window.handleSellAnimal = handleSellAnimal;

export function handleRemoveDeadAnimal(id) {
  const res = GAME.removeDeadAnimal(id);
  if (res.ok) {
    render();
    toast(`🗑️ Đã dọn dẹp xác vật nuôi`, 'info');
  } else {
    toast(res.msg, 'error');
  }
}
window.handleRemoveDeadAnimal = handleRemoveDeadAnimal;

export function handleCureAnimal(id) {
  const res = GAME.cureAnimal(id);
  if (res.ok) {
    render();
    toast(`💊 Đã tiêm thuốc trị bệnh và bảo vệ thành công!`, 'success');
  } else {
    toast(res.msg, 'error');
  }
}
window.handleCureAnimal = handleCureAnimal;
