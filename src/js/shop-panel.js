/* Shop Panel — 商铺信息轮播 */
import { shops } from './mock-data.js';

let currentShopIndex = 0;
let intervalId = null;

export function initShopPanel(container) {
  renderShops(container);
  startAutoRotate(container);
}

function renderShops(container) {
  container.innerHTML = shops.map((shop, i) => {
    const stars = '★'.repeat(Math.floor(shop.rating)) + (shop.rating % 1 >= 0.5 ? '☆' : '');
    const cls = i === currentShopIndex ? 'active' : (i === (currentShopIndex + 1) % shops.length ? 'dimmed' : '');
    return `
      <div class="shop-card ${cls}" data-index="${i}">
        <div class="shop-name">${shop.name}</div>
        <div class="shop-stats">
          <div class="shop-stat">
            <span class="shop-stat-label">今日客流</span>
            <span class="shop-stat-value" style="color:#3dbd6e">${shop.todayVisitors.toLocaleString()} 人</span>
          </div>
          <div class="shop-stat">
            <span class="shop-stat-label">今日销售额</span>
            <span class="shop-stat-value" style="color:#e8863a">¥${shop.todaySales.toLocaleString()}</span>
          </div>
          <div class="shop-stat">
            <span class="shop-stat-label">商铺评分</span>
            <span class="shop-rating">${stars} ${shop.rating}</span>
          </div>
          <div class="shop-stat">
            <span class="shop-stat-label">营业时间</span>
            <span class="shop-stat-value" style="font-size:11px">${shop.openTime}</span>
          </div>
        </div>
        <div class="shop-top-products">
          <div class="shop-top-label">畅销品 TOP3</div>
          <div class="shop-top-list">
            ${shop.topProducts.map(p => `<span class="shop-top-tag">${p}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function startAutoRotate(container) {
  intervalId = setInterval(() => {
    currentShopIndex = (currentShopIndex + 1) % shops.length;
    updateCards(container);
  }, 4000);
}

function updateCards(container) {
  const cards = container.querySelectorAll('.shop-card');
  cards.forEach((card, i) => {
    card.className = 'shop-card';
    if (i === currentShopIndex) card.classList.add('active');
    else if (i === (currentShopIndex + 1) % shops.length) card.classList.add('dimmed');
  });
  // Scroll active into view
  const active = container.querySelector('.shop-card.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function focusShop(index, container) {
  clearInterval(intervalId);
  currentShopIndex = index;
  updateCards(container);
  startAutoRotate(container);
}
