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
import { initMapChart, resizeMap, toggleMapMode, setMapFullscreen } from './js/map-chart.js';
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
    const isMapFs = mapContainer.classList.toggle('map-fullscreen');
    fsBtn.classList.toggle('active', isMapFs);
    fsBtn.querySelector('.mode-label').textContent = isMapFs ? '退出' : '全屏';
    setMapFullscreen(isMapFs);
    // 通知地图 resize
    setTimeout(() => resizeMap(), 300);
  });

  // Page Fullscreen (F11 效果，使用浏览器 Fullscreen API)
  const pageFsBtn = document.getElementById('page-fullscreen-btn');
  pageFsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });

  // 监听浏览器全屏状态变化（F11 / ESC / 代码触发都会触发此事件）
  document.addEventListener('fullscreenchange', () => {
    const pageFsBtn = document.getElementById('page-fullscreen-btn');
    const isPageFs = !!document.fullscreenElement;
    pageFsBtn.classList.toggle('active', isPageFs);
    pageFsBtn.querySelector('.fs-label').textContent = isPageFs ? '退出' : '全屏';
    // 全屏/退出全屏后视口尺寸变化，重新适配缩放
    setTimeout(() => {
      adaptScale();
      resizeMap();
    }, 100);
  });

  // ESC 键：优先退出地图全屏，再退出页面全屏
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const mapContainer = document.getElementById('map-container');
    const fsBtn = document.getElementById('map-fullscreen-btn');
    // 优先退出地图 CSS 全屏
    if (mapContainer.classList.contains('map-fullscreen')) {
      mapContainer.classList.remove('map-fullscreen');
      fsBtn.classList.remove('active');
      fsBtn.querySelector('.mode-label').textContent = '全屏';
      setMapFullscreen(false);
      setTimeout(() => resizeMap(), 300);
      e.preventDefault();
    }
    // 地图未全屏时，让浏览器默认行为退出页面全屏（Fullscreen API）
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
