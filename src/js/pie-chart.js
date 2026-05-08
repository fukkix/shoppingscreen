/* Pie Chart — 品类销售分布 (Orange theme) */
import * as echarts from 'echarts';
import { categoryData } from './mock-data.js';

let chart = null;

export function initPieChart(container) {
  chart = echarts.init(container);
  const total = categoryData.reduce((s, d) => s + d.value, 0);

  // Remap colors to warm desaturated palette
  const warmColors = ['#e8863a', '#d4a24c', '#c06030', '#8b6cc4', '#3a9ea8', '#3dbd6e'];

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(8,16,38,0.95)', borderColor: '#e8863a', borderWidth: 1,
      textStyle: { color: '#c8cdd8', fontSize: 11 },
      formatter: p => `${p.name}<br/>¥${p.value.toLocaleString()} (${p.percent}%)`
    },
    legend: { show: false },
    series: [{
      type: 'pie', radius: ['45%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: 'rgba(6,10,20,0.8)', borderWidth: 2, borderRadius: 4
      },
      label: {
        color: '#c8cdd8', fontSize: 10,
        formatter: '{b}\n{d}%'
      },
      labelLine: { lineStyle: { color: 'rgba(100,120,160,0.2)' } },
      emphasis: {
        label: { fontSize: 12, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(232,134,58,0.2)' }
      },
      data: categoryData.map((d, i) => ({
        name: d.name, value: d.value,
        itemStyle: { color: warmColors[i % warmColors.length] }
      })),
      animationType: 'scale', animationEasing: 'elasticOut', animationDuration: 1500
    },
    {
      type: 'pie', radius: ['0%', '38%'],
      center: ['50%', '50%'],
      silent: true,
      label: {
        show: true, position: 'center',
        formatter: `{a|¥${(total/10000).toFixed(1)}万}\n{b|总销售额}`,
        rich: {
          a: { color: '#e8863a', fontSize: 18, fontWeight: 'bold', fontFamily: 'Orbitron', lineHeight: 28 },
          b: { color: '#6a7590', fontSize: 10, lineHeight: 18 }
        }
      },
      data: [{ value: 0, itemStyle: { color: 'transparent' } }]
    }]
  });
}

export function resizePie() { if (chart) chart.resize(); }
