/* Buyer Selector — 购买人选择器（多选模式） */
import { buyers } from './mock-data.js';
import { selectBuyers, setMapInteractionCallback, getMapFullscreen } from './map-chart.js';

let selectedIndices = new Set([0]);

export function initBuyerSelector(container) {
  // 生成 buyer 按钮 + 全选/清空操作按钮
  const buyerButtons = buyers.map((buyer, i) => `
    <button class="buyer-btn ${selectedIndices.has(i) ? 'active' : ''}" data-index="${i}">
      <span class="buyer-avatar">${buyer.avatar}</span>
      <span>${buyer.name}</span>
    </button>
  `).join('');

  const actionButtons = `
    <button class="buyer-btn buyer-action" data-action="select-all">全选</button>
    <button class="buyer-btn buyer-action" data-action="clear-all">清空</button>
  `;

  container.innerHTML = buyerButtons + actionButtons;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.buyer-btn');
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === 'select-all') {
      selectedIndices = new Set(buyers.map((_, i) => i));
      refreshButtons(container);
      selectBuyers(Array.from(selectedIndices));
      stopAutoRotate();
      return;
    }
    if (action === 'clear-all') {
      selectedIndices.clear();
      refreshButtons(container);
      selectBuyers([]);
      stopAutoRotate();
      return;
    }

    const index = parseInt(btn.dataset.index);
    if (selectedIndices.has(index)) {
      selectedIndices.delete(index);
    } else {
      selectedIndices.add(index);
    }
    refreshButtons(container);
    selectBuyers(Array.from(selectedIndices));
    resetAutoRotate();
  });
}

function refreshButtons(container) {
  container.querySelectorAll('.buyer-btn[data-index]').forEach(btn => {
    const idx = parseInt(btn.dataset.index);
    btn.classList.toggle('active', selectedIndices.has(idx));
  });
}

// ============ Auto-rotate with debounce ============
let autoRotateId = null;
let resumeTimerId = null;
const RESUME_DELAY = 15000;

function startAutoRotate(container) {
  stopAutoRotate();
  let currentIndex = 0;
  autoRotateId = setInterval(() => {
    if (getMapFullscreen()) return;
    currentIndex = (currentIndex + 1) % buyers.length;
    selectedIndices = new Set([currentIndex]);
    refreshButtons(container);
    selectBuyers([currentIndex]);
  }, 8000);
}

function stopAutoRotate() {
  if (autoRotateId) { clearInterval(autoRotateId); autoRotateId = null; }
}

function onMapInteraction() {
  stopAutoRotate();
  if (resumeTimerId) clearTimeout(resumeTimerId);
  resumeTimerId = setTimeout(() => {
    const container = document.getElementById('buyer-list');
    if (container) startAutoRotate(container);
  }, RESUME_DELAY);
}

function resetAutoRotate() {
  stopAutoRotate();
  if (resumeTimerId) clearTimeout(resumeTimerId);
  const container = document.getElementById('buyer-list');
  if (container) {
    resumeTimerId = setTimeout(() => startAutoRotate(container), RESUME_DELAY);
  }
}

export function startAutoRotateBuyers(container) {
  setMapInteractionCallback(onMapInteraction);
  startAutoRotate(container);
}

export function stopAutoRotateBuyers() {
  stopAutoRotate();
  if (resumeTimerId) clearTimeout(resumeTimerId);
  setMapInteractionCallback(null);
}
