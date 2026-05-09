/* ============================================
   Main Entry — 购物数据可视化大屏
   ============================================ */

// CSS Imports
import './css/index.css';
import './css/layout.css';
import './css/components.css';
import './css/animations.css';

// Module Imports
// mapbox-gl 已移除，使用 ECharts 原生 geo 渲染区域边界
import { initMapChart, resizeMap, toggleMapMode } from './js/map-chart.js';
import { initLineChart, resizeLine } from './js/line-chart.js';
import { initBarChart, resizeBar } from './js/bar-chart.js';
import { initPieChart, resizePie } from './js/pie-chart.js';
import { initRadarChart, resizeRadar } from './js/radar-chart.js';
import { initKpiCards } from './js/kpi-cards.js';
import { initShopPanel } from './js/shop-panel.js';
import { initPurchaseFeed } from './js/purchase-feed.js';
import { initBuyerSelector, startAutoRotateBuyers } from './js/buyer-selector.js';
import { initParticles } from './js/particles.js';

// ===== Scale Adapter =====
function adaptScale() {
  const root = document.getElementById('screen-root');
  const sw = 1920, sh = 1080;
  const ww = window.innerWidth, wh = window.innerHeight;
  const scale = Math.min(ww / sw, wh / sh);
  root.style.transform = `scale(${scale})`;
  root.style.transformOrigin = 'top left';
  // Center if needed
  const ox = (ww - sw * scale) / 2;
  const oy = (wh - sh * scale) / 2;
  root.style.marginLeft = ox + 'px';
  root.style.marginTop = oy + 'px';
}

// ===== Clock =====
function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const str = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const el = document.getElementById('header-clock');
  if (el) el.textContent = str;
}

// ===== Init =====
async function init() {
  // Scale
  adaptScale();
  window.addEventListener('resize', () => {
    adaptScale();
    resizeMap();
    resizeLine();
    resizeBar();
    resizePie();
    resizeRadar();
  });

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Particles
  initParticles(document.getElementById('particle-canvas'));

  // KPI
  initKpiCards(document.getElementById('kpi-cards'));

  // Pie Chart
  initPieChart(document.getElementById('pie-chart'));

  // Map
  await initMapChart(document.getElementById('map-chart'));

  // Map 2D/3D Toggle
  const toggleBtn = document.getElementById('map-mode-toggle');
  toggleBtn.addEventListener('click', () => {
    const is3D = toggleMapMode();
    toggleBtn.classList.toggle('active-3d', is3D);
    toggleBtn.querySelector('.mode-label').textContent = is3D ? '2D 平面' : '3D 街区';
    toggleBtn.querySelector('.mode-icon').textContent = is3D ? '◆' : '◇';
  });

  // Map Fullscreen
  const fsBtn = document.getElementById('map-fullscreen-btn');
  fsBtn.addEventListener('click', () => {
    const mapContainer = document.getElementById('map-container');
    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  });

  // Buyer Selector
  const buyerList = document.getElementById('buyer-list');
  initBuyerSelector(buyerList);
  startAutoRotateBuyers(buyerList);

  // Shop Panel
  initShopPanel(document.getElementById('shop-carousel'));

  // Purchase Feed
  initPurchaseFeed(document.getElementById('purchase-feed'));

  // Footer Charts
  initLineChart(document.getElementById('line-chart'));
  initBarChart(document.getElementById('bar-chart'));
  initRadarChart(document.getElementById('radar-chart'));

  // 解除防闪烁隐藏：所有模块初始化完成后淡入显示
  document.body.style.transition = 'opacity 0.3s ease';
  document.body.style.opacity = '0';
  document.body.style.visibility = 'visible';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
}

document.addEventListener('DOMContentLoaded', init);
