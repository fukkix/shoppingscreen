/* Purchase Feed — 实时购物流水 */
import { purchases, randomItems, shops, buyers } from './mock-data.js';

let feedContainer = null;
let feedIndex = 0;
const MAX_VISIBLE = 12;

export function initPurchaseFeed(container) {
  feedContainer = container;
  // Render initial feed items
  const initial = purchases.slice(0, MAX_VISIBLE).reverse();
  initial.forEach((p, i) => {
    addFeedItem(p, i === 0);
  });
  // Start auto-generate
  startAutoFeed();
}

function addFeedItem(purchase, isNew) {
  const el = document.createElement('div');
  el.className = 'feed-item' + (isNew ? ' new' : '');
  el.innerHTML = `
    <span class="feed-buyer">${purchase.buyerName}</span>
    <span class="feed-item-name">${purchase.itemName}</span>
    <span class="feed-shop">${purchase.shopName}</span>
    <span class="feed-price">¥${purchase.price.toLocaleString()}</span>
  `;
  feedContainer.prepend(el);

  // Remove old items
  while (feedContainer.children.length > MAX_VISIBLE) {
    feedContainer.removeChild(feedContainer.lastChild);
  }

  // Remove "new" class after animation
  if (isNew) {
    setTimeout(() => el.classList.remove('new'), 1500);
  }
}

function startAutoFeed() {
  setInterval(() => {
    const item = randomItems[Math.floor(Math.random() * randomItems.length)];
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const shop = shops[Math.floor(Math.random() * shops.length)];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    addFeedItem({
      buyerName: buyer.name,
      itemName: item.name,
      price: item.price,
      shopName: shop.name,
      purchaseTime: timeStr
    }, true);
  }, 3000);
}
