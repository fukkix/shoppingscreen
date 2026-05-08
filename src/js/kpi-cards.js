/* KPI Cards — 核心指标数字翻牌器 */
import { kpiData } from './mock-data.js';

export function initKpiCards(container) {
  container.innerHTML = kpiData.map((kpi, i) => {
    const trendClass = kpi.trend > 0 ? 'up' : kpi.trend < 0 ? 'down' : '';
    const trendIcon = kpi.trend > 0 ? '↑' : kpi.trend < 0 ? '↓' : '—';
    const trendText = kpi.trend !== 0 ? `${trendIcon} ${Math.abs(kpi.trend)}%` : '— 持平';
    const displayVal = kpi.prefix + kpi.value.toLocaleString() + kpi.unit;
    return `
      <div class="kpi-card anim-enter anim-delay-${i + 1}" id="kpi-${i}">
        <div class="kpi-label">${kpi.label}</div>
        <div class="kpi-value" data-target="${kpi.value}" data-prefix="${kpi.prefix}" data-unit="${kpi.unit}">
          ${displayVal}
        </div>
        <div class="kpi-trend ${trendClass}">${trendText}</div>
      </div>
    `;
  }).join('');

  // Animate count up
  setTimeout(() => animateCountUp(), 300);
}

function animateCountUp() {
  document.querySelectorAll('.kpi-value').forEach(el => {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const unit = el.dataset.unit || '';
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + current.toLocaleString() + unit;
    }, 25);
  });
}
