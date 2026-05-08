/* Buyer Selector — 购买人选择器 */
import { buyers } from './mock-data.js';
import { selectBuyer } from './map-chart.js';

export function initBuyerSelector(container) {
  container.innerHTML = buyers.map((buyer, i) => `
    <button class="buyer-btn ${i === 0 ? 'active' : ''}" data-index="${i}">
      <span class="buyer-avatar">${buyer.avatar}</span>
      <span>${buyer.name}</span>
    </button>
  `).join('');

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.buyer-btn');
    if (!btn) return;
    const index = parseInt(btn.dataset.index);
    // Update active state
    container.querySelectorAll('.buyer-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Update map trajectory
    selectBuyer(index);
  });
}

// Auto-rotate buyers
let autoRotateId = null;

export function startAutoRotateBuyers(container) {
  let currentIndex = 0;
  autoRotateId = setInterval(() => {
    currentIndex = (currentIndex + 1) % buyers.length;
    const btns = container.querySelectorAll('.buyer-btn');
    btns.forEach(b => b.classList.remove('active'));
    btns[currentIndex].classList.add('active');
    selectBuyer(currentIndex);
  }, 8000);
}

export function stopAutoRotateBuyers() {
  if (autoRotateId) clearInterval(autoRotateId);
}
