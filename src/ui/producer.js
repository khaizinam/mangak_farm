// ============================================================
// PRODUCER UI MODULE
// ============================================================

import { toast, renderSidebar, updateGold } from './core.js';

export function handleUnlockProducer() {
  if (G.gold < 100000) {
    toast('❌ Không đủ vàng để mở khóa (Cần 100.000 🪙)!', 'error');
    return;
  }
  if (confirm('Bạn có chắc chắn muốn dùng 100.000 🪙 để mở khóa Nhà sản xuất vật tư?')) {
    const res = GAME.unlockProducer();
    if (res.ok) {
      toast('🎉 Đã mở khóa Nhà sản xuất vật tư!', 'success');
      renderProducerContent();
      updateGold();
      renderSidebar();
    } else {
      toast(res.msg, 'error');
    }
  }
}
window.handleUnlockProducer = handleUnlockProducer;

export function handleCollectProducer(slotIndex) {
  const res = GAME.collectProducerSlot(slotIndex);
  if (res.ok) {
    toast(`📥 Đã thu hoạch x${res.qty} ${res.emoji} ${res.name}!`, 'success');
    renderProducerContent();
    renderSidebar();
  } else {
    toast(res.msg, 'error');
  }
}
window.handleCollectProducer = handleCollectProducer;

export function handleLoadProducer(slotIndex, inputKey, qty) {
  const res = GAME.loadProducerSlot(slotIndex, inputKey, qty);
  if (res.ok) {
    toast(`✅ Đã thêm x${qty} vào máy sản xuất!`, 'success');
    slotSelectingItem[slotIndex] = false;
    slotSelectedInput[slotIndex] = null;
    renderProducerContent();
    renderSidebar();
  } else {
    toast(res.msg, 'error');
  }
}
window.handleLoadProducer = handleLoadProducer;

let producerTimer = null;
export function startProducerTimer() {
  if (producerTimer) clearInterval(producerTimer);
  producerTimer = setInterval(() => {
    const el = document.getElementById('viewProducer');
    if (!el || el.classList.contains('hidden')) {
      stopProducerTimer();
      return;
    }
    GAME.updateProducer();
    renderProducerContent();
  }, 1000);
}
window.startProducerTimer = startProducerTimer;

export function stopProducerTimer() {
  if (producerTimer) {
    clearInterval(producerTimer);
    producerTimer = null;
  }
}
window.stopProducerTimer = stopProducerTimer;

export function openProducerSelect(slotIndex) {
  slotSelectingItem[slotIndex] = true;
  slotSelectedInput[slotIndex] = null;
  renderProducerContent();
}
window.openProducerSelect = openProducerSelect;

export function cancelProducerSelect(slotIndex) {
  slotSelectingItem[slotIndex] = false;
  slotSelectedInput[slotIndex] = null;
  renderProducerContent();
}
window.cancelProducerSelect = cancelProducerSelect;

export function selectProducerInput(slotIndex, key) {
  slotSelectedInput[slotIndex] = key;
  renderProducerContent();
}
window.selectProducerInput = selectProducerInput;

export function openProducerAddMore(slotIndex, inputKey) {
  slotSelectingItem[slotIndex] = true;
  slotSelectedInput[slotIndex] = inputKey;
  renderProducerContent();
}
window.openProducerAddMore = openProducerAddMore;

export function setProducerQtyInputValue(slotIndex, val) {
  const el = document.getElementById(`producer_qty_input_${slotIndex}`);
  if (el) {
    el.value = val;
  }
}
window.setProducerQtyInputValue = setProducerQtyInputValue;

export function confirmLoadProducerSlot(slotIndex, inputKey) {
  const el = document.getElementById(`producer_qty_input_${slotIndex}`);
  if (!el) return;
  const qty = parseInt(el.value);
  if (isNaN(qty) || qty <= 0) {
    toast('❌ Số lượng nạp không hợp lệ!', 'error');
    return;
  }
  if (inputKey === 'harvest_cow_milk' && qty % 4 !== 0) {
    toast('❌ Số lượng sữa bò nạp vào phải là bội số của 4 (ví dụ: 4, 8, 12, ...)!', 'error');
    return;
  }
  handleLoadProducer(slotIndex, inputKey, qty);
}
window.confirmLoadProducerSlot = confirmLoadProducerSlot;

export function renderProducerContent() {
  const el = document.getElementById('producerContent');
  if (!el) return;
  
  if (!G.producerUnlocked) {
    el.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 px-4 text-center max-w-xl mx-auto">
        <div class="text-7xl mb-4 animate-bounce">🏭</div>
        <h2 class="text-xl font-bold text-yellow-400 mb-2">Nhà Sản Xuất Vật Tư Bị Khóa</h2>
        <p class="text-sm text-gray-300 mb-6 leading-relaxed">
          Nhà sản xuất vật tư cho phép bạn tự sản xuất hạt giống từ sản lượng nông sản thu hoạch (tối đa 64 cây trồng mỗi slot, 5 phút mỗi hạt giống) và chuyển hóa sữa bò tươi thành phô mai thơm ngon!
        </p>
        <div class="bg-gray-800/80 p-4 rounded-xl border border-gray-700 w-full mb-6 text-xs text-left space-y-2">
          <div class="flex items-center gap-2 text-yellow-400 font-bold mb-1">
            <span>💡 Chi tiết chế biến:</span>
          </div>
          <div>• <span class="text-green-400">1 Nông sản</span> ➔ <span class="text-green-400">1 Hạt giống cùng loại</span> (Thời gian: 5 phút/hạt)</div>
          <div>• <span class="text-green-400">4 Sữa bò 🥛</span> ➔ <span class="text-green-400">1 Phô mai 🧀</span> (Thời gian: 5 phút/cái. Phô mai bán được 2500🪙 hoặc ăn hồi 18⚡)</div>
        </div>
        <button class="btn btn-yellow w-full py-3.5 text-base font-extrabold shadow-lg flex items-center justify-center gap-2" onclick="handleUnlockProducer()">
          🔓 Mở khóa ngay (100.000 🪙)
        </button>
      </div>
    `;
    return;
  }
  
  const now = Date.now();
  let html = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  `;
  
  for (let i = 0; i < 3; i++) {
    const slot = G.producerSlots[i];
    html += `
      <div class="flex flex-col bg-gray-800/30 border border-gray-700/80 rounded-2xl p-5 hover:border-gray-500 transition-all shadow-lg min-h-[380px]">
        <div class="flex justify-between items-center pb-2.5 border-b border-gray-700/60 mb-4">
          <span class="text-xs font-bold text-gray-400">Slot Sản Xuất #${i+1}</span>
          ${slot.inputKey ? `
            <span class="text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
              ${slot.qtyLeft > 0 ? '⚙️ Đang chạy' : '✓ Hoàn thành'}
            </span>
          ` : `
            <span class="text-xs bg-gray-900 text-gray-500 border border-gray-800 px-2 py-0.5 rounded font-extrabold uppercase">
              📭 Trống
            </span>
          `}
        </div>
    `;
    
    if (slotSelectingItem[i]) {
      const inv = G.inventory;
      const eligibleKeys = Object.keys(inv).filter(k => {
        if (inv[k] <= 0) return false;
        return k === 'harvest_cow_milk' || (k.startsWith('harvest_') && k !== 'harvest_chicken_egg');
      });
      
      const selectedKey = slotSelectedInput[i];
      if (!selectedKey) {
        html += `
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">Chọn nguyên liệu nạp:</div>
              ${eligibleKeys.length === 0 ? `
                <div class="text-center py-8 text-xs text-gray-500 italic">
                  Không có nông sản hoặc sữa bò trong túi đồ để chế biến!
                </div>
              ` : `
                <div class="space-y-1.5 overflow-y-auto max-h-[200px] pr-1">
                  ${eligibleKeys.map(k => {
                    let name = k, emoji = '📦';
                    if (k === 'harvest_cow_milk') {
                      name = 'Sữa bò'; emoji = '🥛';
                    } else {
                      const p = PLANTS_DATA[k.replace('harvest_','')];
                      if (p) { name = p.name; emoji = p.emoji; }
                    }
                    return `
                      <button class="w-full flex items-center justify-between bg-gray-900/40 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 p-2.5 rounded-lg text-left text-xs transition"
                              onclick="selectProducerInput(${i}, '${k}')">
                        <span class="flex items-center gap-2">
                          <span class="text-xl">${emoji}</span>
                          <span class="font-bold text-gray-200">${name}</span>
                        </span>
                        <span class="font-mono text-yellow-400 font-bold bg-gray-950 px-2 py-0.5 rounded">x${inv[k]}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
            <button class="btn btn-red w-full py-2 text-xs font-bold mt-4" onclick="cancelProducerSelect(${i})">
              Trở lại
            </button>
          </div>
        `;
      } else {
        let name = selectedKey, emoji = '📦', outName = '', outEmoji = '';
        if (selectedKey === 'harvest_cow_milk') {
          name = 'Sữa bò'; emoji = '🥛'; outName = 'Phô mai'; outEmoji = '🧀';
        } else {
          const p = PLANTS_DATA[selectedKey.replace('harvest_','')];
          if (p) {
            name = p.name; emoji = p.emoji;
            outName = p.name + ' (Hạt)'; outEmoji = p.emoji;
          }
        }
        
        const outInfo = GAME.getProducerOutputInfo(selectedKey);
        const ratio = outInfo ? (outInfo.inputRatio || 1) : 1;
        const currentInSlot = slot.inputKey === selectedKey ? (slot.qtyLeft + slot.qtyReady * ratio) : 0;
        const room = 64 - currentInSlot;
        let maxToLoad = Math.min(inv[selectedKey], room);
        if (selectedKey === 'harvest_cow_milk') {
          maxToLoad = Math.floor(maxToLoad / 4) * 4;
        }
        
        html += `
          <div class="flex-1 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center gap-3 bg-gray-950/40 p-2.5 rounded-xl border border-gray-800">
                <span class="text-3xl">${emoji}</span>
                <div>
                  <div class="text-xs text-gray-400">Đã chọn:</div>
                  <div class="text-sm font-bold text-white">${name}</div>
                  <div class="text-[10px] text-gray-500">Trong túi có: x${inv[selectedKey]} | Sức chứa slot còn: ${room}</div>
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-400 font-bold mb-2">Số lượng nạp vào (tối đa x${maxToLoad}):</label>
                <div class="flex gap-2 mb-3">
                  <input type="number" id="producer_qty_input_${i}" class="bg-gray-900 border border-gray-700 text-white rounded px-3 py-1.5 text-sm w-full font-bold font-mono focus:border-yellow-400 focus:outline-none" min="1" max="${maxToLoad}" value="${maxToLoad}">
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                  ${selectedKey === 'harvest_cow_milk' ? `
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${i}, 4)">x4</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${i}, 16)">x16</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${i}, ${maxToLoad})">Tối đa</button>
                  ` : `
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${i}, 1)">x1</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${i}, 10)">x10</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${i}, ${maxToLoad})">Tối đa</button>
                  `}
                </div>
              </div>
              
              <div class="text-[10px] bg-gray-900/60 p-2 rounded-lg text-gray-400 leading-relaxed border border-gray-850">
                Chế biến ra: <span class="text-green-400 font-bold">${outEmoji} ${outName}</span>.<br>
                ${selectedKey === 'harvest_cow_milk' ? `Tỷ lệ: <span class="text-yellow-400 font-bold">4 Sữa bò ➔ 1 Phô mai</span>.<br>` : ''}
                Thời gian yêu cầu: <span class="text-blue-400 font-bold font-mono">5 phút / cái</span>.
              </div>
            </div>
            
            <div class="flex gap-2 mt-4">
              <button class="btn btn-gray flex-1 py-2 text-xs font-bold" onclick="selectProducerInput(${i}, null)">
                Trở lại
              </button>
              <button class="btn btn-green flex-[2] py-2 text-xs font-bold" onclick="confirmLoadProducerSlot(${i}, '${selectedKey}')">
                Nạp nguyên liệu
              </button>
            </div>
          </div>
        `;
      }
    } else if (slot.inputKey) {
      const outInfo = GAME.getProducerOutputInfo(slot.inputKey);
      const ratio = outInfo ? (outInfo.inputRatio || 1) : 1;
      let inName = slot.inputKey, inEmoji = '📦';
      if (slot.inputKey === 'harvest_cow_milk') {
        inName = 'Sữa bò'; inEmoji = '🥛';
      } else {
        const p = PLANTS_DATA[slot.inputKey.replace('harvest_','')];
        if (p) { inName = p.name; inEmoji = p.emoji; }
      }
      
      const singleItemTime = outInfo ? outInfo.time : 300000;
      const progressPercent = Math.min(100, Math.floor((slot.timeSpent / singleItemTime) * 100));
      
      let countdownHtml = '';
      if (slot.qtyLeft > 0) {
        const remainingMs = singleItemTime - slot.timeSpent;
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        countdownHtml = `<span class="text-xs text-yellow-500 font-bold font-mono">⏱️ ${timeStr}</span>`;
      } else {
        countdownHtml = `<span class="text-xs text-green-400 font-bold">✓ Đã hoàn tất tất cả</span>`;
      }
      
      html += `
        <div class="flex-1 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="bg-gray-900 bg-opacity-35 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
                <span class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Nguyên liệu</span>
                <span class="text-2xl my-1">${inEmoji}</span>
                <span class="font-bold text-gray-200 block truncate">${inName}</span>
                <span class="text-yellow-400 font-mono font-bold text-[11px] block mt-1">Còn: x${slot.qtyLeft}</span>
              </div>
              
              <div class="bg-gray-900 bg-opacity-35 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
                <span class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Thành phẩm</span>
                <span class="text-2xl my-1">${outInfo ? outInfo.emoji : '📦'}</span>
                <span class="font-bold text-gray-200 block truncate">${outInfo ? outInfo.name : 'Chưa rõ'}</span>
                <span class="text-green-400 font-mono font-bold text-[11px] block mt-1">Sẵn sàng: x${slot.qtyReady}</span>
              </div>
            </div>
            
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs text-gray-400">
                <span>Chế biến cây hiện tại:</span>
                ${countdownHtml}
              </div>
              <div class="w-full bg-gray-900 rounded-full h-3.5 border border-gray-800 overflow-hidden relative shadow-inner">
                <div class="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-1000" style="width: ${slot.qtyLeft > 0 ? progressPercent : 100}%"></div>
                <div class="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white select-none">
                  ${slot.qtyLeft > 0 ? progressPercent + '%' : '100%'}
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col gap-2 mt-5">
            ${slot.qtyLeft + slot.qtyReady * ratio < 64 ? `
              <button class="btn btn-blue py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                      onclick="openProducerAddMore(${i}, '${slot.inputKey}')">
                ➕ Nạp thêm vật liệu cùng loại
              </button>
            ` : ''}
            <button class="btn ${slot.qtyReady > 0 ? 'btn-green shadow-[0_0_10px_rgba(76,175,80,0.3)] animate-pulse' : 'btn-gray opacity-50 cursor-not-allowed'} py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                    ${slot.qtyReady > 0 ? '' : 'disabled'}
                    onclick="handleCollectProducer(${i})">
              📥 Thu hoạch thành phẩm (x${slot.qtyReady})
            </button>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div class="text-5xl mb-4 text-gray-600">📭</div>
          <div class="text-sm font-bold text-gray-400 mb-1">Thiết bị đang nhàn rỗi</div>
          <div class="text-xs text-gray-500 mb-4 max-w-[200px]">Hãy thêm nguyên liệu để chế biến thành phẩm hữu ích!</div>
          <button class="btn btn-yellow px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                  onclick="openProducerSelect(${i})">
            ➕ Thêm nguyên liệu
          </button>
        </div>
      `;
    }
    
    html += `
      </div>
    `;
  }
  
  html += `
    </div>
  `;
  
  el.innerHTML = html;
}
window.renderProducerContent = renderProducerContent;
