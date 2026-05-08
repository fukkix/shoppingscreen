/* Bar Chart — 商铺销售排行 (Orange theme) */
import * as echarts from 'echarts';
import { shops } from './mock-data.js';

let chart = null;

export function initBarChart(container) {
  chart = echarts.init(container);
  const sorted = [...shops].sort((a, b) => a.todaySales - b.todaySales);
  chart.setOption({
    backgroundColor: 'transparent',
    grid: { top: 10, right: 60, bottom: 20, left: 100 },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(8,16,38,0.95)', borderColor: '#e8863a', borderWidth: 1,
      textStyle: { color: '#c8cdd8', fontSize: 11 }
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(100,120,160,0.06)' } },
      axisLine: { show: false }, axisLabel: { show: false }
    },
    yAxis: {
      type: 'category',
      data: sorted.map(s => s.name),
      axisLine: { lineStyle: { color: 'rgba(100,120,160,0.2)' } },
      axisLabel: { color: '#c8cdd8', fontSize: 11 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar', data: sorted.map(s => s.todaySales),
      barWidth: 14, barCategoryGap: '40%',
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0,0,1,0,[
          { offset: 0, color: 'rgba(232,134,58,0.2)' }, { offset: 1, color: '#e8863a' }
        ])
      },
      label: {
        show: true, position: 'right', color: '#d4a24c', fontSize: 11,
        formatter: p => '¥' + p.value.toLocaleString()
      },
      animationDuration: 1500, animationEasing: 'cubicOut'
    }]
  });
}

export function resizeBar() { if (chart) chart.resize(); }
