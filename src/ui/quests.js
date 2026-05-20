// ============================================================
// QUESTS UI MODULE
// ============================================================

import { toast, renderSidebar, updateGold } from './core.js';

let tasksTimer = null;

export function startTasksTimer() {
  if (tasksTimer) clearInterval(tasksTimer);
  tasksTimer = setInterval(() => {
    const el = document.getElementById('viewTasks');
    if (!el || el.classList.contains('hidden')) {
      stopTasksTimer();
      return;
    }
    renderTasksContent();
  }, 1000);
}
window.startTasksTimer = startTasksTimer;

export function stopTasksTimer() {
  if (tasksTimer) {
    clearInterval(tasksTimer);
    tasksTimer = null;
  }
}
window.stopTasksTimer = stopTasksTimer;

export function renderTasksContent() {
  const changed = GAME.checkQuestCooldowns();
  if (changed) {
    renderSidebar();
  }
  
  const el = document.getElementById('tasksContent');
  if (!el) return;

  const now = Date.now();
  let html = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  `;

  for (let i = 0; i < 3; i++) {
    const slot = G.quests[i];

    html += `
      <div class="flex flex-col bg-gray-800/30 border border-gray-700/80 rounded-2xl p-5 hover:border-gray-500 transition-all shadow-lg min-h-[380px]">
    `;

    if (slot.cooldownUntil && slot.cooldownUntil > now) {
      const remainingMs = slot.cooldownUntil - now;
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      html += `
        <div class="flex justify-between items-center pb-2.5 border-b border-gray-700/60 mb-3">
          <span class="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border text-gray-400 bg-gray-900 border-gray-800">
            ⏱️ Đang chờ
          </span>
          <span class="text-xs text-gray-400 font-bold">Ô số ${i+1}</span>
        </div>
        <div class="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div class="text-4xl mb-3 animate-pulse">⏱️</div>
          <div class="text-sm font-bold text-gray-400 mb-1">Đang chờ nhiệm vụ mới...</div>
          <div class="text-2xl font-bold font-mono text-yellow-500 bg-gray-900 px-4 py-1.5 rounded-lg border border-gray-800 shadow-inner">
            ${timeStr}
          </div>
          <div class="text-[11px] text-gray-500 mt-2 italic">Làm mới nhiệm vụ cần đợi 15 phút.</div>
        </div>
      `;
    } else if (slot.quest) {
      const q = slot.quest;
      const levelColorClass = q.level === 1 ? 'text-green-400 bg-green-950/30 border-green-800/40' : q.level === 2 ? 'text-yellow-400 bg-yellow-950/30 border-yellow-800/40' : 'text-red-400 bg-red-950/30 border-red-800/40';
      const levelBadge = q.level === 1 ? '🟢 Cấp 1' : q.level === 2 ? '🟡 Cấp 2' : '🔴 Cấp 3';
      
      let itemsHtml = `<div class="space-y-2 flex-1 overflow-y-auto mb-4 pr-1" style="max-height: 180px;">`;
      let canComplete = true;

      q.items.forEach(it => {
        const hasQty = G.inventory[it.key] || 0;
        const met = hasQty >= it.qtyRequired;
        if (!met) canComplete = false;
        
        itemsHtml += `
          <div class="flex items-center justify-between bg-gray-900 bg-opacity-35 p-2 rounded-lg border border-gray-800">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-2xl flex-shrink-0">${it.emoji}</span>
              <div class="min-w-0">
                <div class="text-xs font-bold text-gray-200 truncate">${it.name}</div>
                <div class="text-[10px] text-gray-500 font-mono">Gốc: ${it.sellPrice}🪙/cái</div>
              </div>
            </div>
            <div class="text-right flex-shrink-0 font-mono">
              <span class="text-xs font-bold ${met ? 'text-green-400' : 'text-red-400'}">${hasQty}</span>
              <span class="text-xs text-gray-400 font-semibold">/${it.qtyRequired}</span>
            </div>
          </div>
        `;
      });
      itemsHtml += `</div>`;

      const extraGold = q.rewardGold - q.baseValue;
      
      html += `
        <div class="flex justify-between items-center pb-2.5 border-b border-gray-700/60 mb-3">
          <span class="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${levelColorClass}">
            ${levelBadge}
          </span>
          <span class="text-xs text-gray-400 font-bold">Ô số ${i+1}</span>
        </div>
        <div class="text-[11px] text-gray-400 font-bold mb-2 uppercase tracking-wider">📦 Yêu cầu vật phẩm:</div>
        ${itemsHtml}
        
        <div class="bg-gray-900/60 p-3 rounded-xl border border-gray-800 mb-4 text-xs">
          <div class="flex justify-between items-center text-gray-400 mb-1.5">
            <span>Giá trị bán gốc:</span>
            <span class="font-mono text-gray-300">${q.baseValue}🪙</span>
          </div>
          <div class="flex justify-between items-center border-t border-gray-800 pt-1.5">
            <span class="font-bold text-yellow-400">Vàng thưởng:</span>
            <span class="text-base font-extrabold text-yellow-400 font-mono flex items-center gap-0.5">
              <span>${q.rewardGold}</span>
              <span class="text-xs">🪙</span>
            </span>
          </div>
          <div class="text-[10px] text-green-400 text-right font-bold mt-1">
            🔥 Lời thêm +${extraGold}🪙 (+${Math.round((q.rewardGold/q.baseValue - 1) * 100)}%)
          </div>
        </div>

        <div class="mt-auto flex gap-2">
          <button class="btn btn-red flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                  onclick="handleResetQuest(${i})">
            🔄 Reset
          </button>
          <button class="btn ${canComplete ? 'btn-green shadow-[0_0_10px_rgba(76,175,80,0.3)] animate-pulse' : 'btn-gray opacity-50 cursor-not-allowed'} flex-[2] py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                  ${canComplete ? '' : 'disabled'}
                  onclick="handleCompleteQuest(${i})">
            ✓ Giao hàng
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Không có nhiệm vụ
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
window.renderTasksContent = renderTasksContent;

export function handleResetQuest(slotIndex) {
  if (!confirm(`Bạn có chắc chắn muốn làm mới nhiệm vụ này? Bạn sẽ phải đợi 15 phút để nhận nhiệm vụ mới.`)) {
    return;
  }
  const res = GAME.resetQuest(slotIndex);
  if (res.ok) {
    toast('🔄 Đã làm mới nhiệm vụ, vui lòng chờ 15 phút!', 'info');
    renderTasksContent();
    renderSidebar();
  } else {
    toast(res.msg, 'error');
  }
}
window.handleResetQuest = handleResetQuest;

export function handleCompleteQuest(slotIndex) {
  const res = GAME.completeQuest(slotIndex);
  if (res.ok) {
    toast(`🎉 Đã giao hàng thành công! (+${res.rewardGold}🪙)`, 'success');
    renderTasksContent();
    updateGold();
    renderSidebar();
  } else {
    toast(res.msg, 'error');
  }
}
window.handleCompleteQuest = handleCompleteQuest;
