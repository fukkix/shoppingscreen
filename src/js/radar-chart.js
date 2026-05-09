/* Radar Chart — 客流量分析 (Orange theme) */
import * as echarts from 'echarts';
import { radarData } from './mock-data.js';

let chart = null;

export function initRadarChart(container) {
  chart = echarts.init(container);

  // Remap series colors to warm palette
  const warmSeriesColors = ['#e8863a', '#3a9ea8', '#8b6cc4'];

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(10,16,28,0.95)', borderColor: '#e8863a', borderWidth: 1,
      textStyle: { color: '#c8cdd8', fontSize: 11 }
    },
    legend: {
      bottom: 0, textStyle: { color: '#6a7590', fontSize: 10 },
      data: radarData.series.map(s => s.name)
    },
    radar: {
      indicator: radarData.indicators,
      shape: 'polygon',
      center: ['50%', '45%'],
      radius: '60%',
      axisName: { color: '#6a7590', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(100,110,120,0.08)' } },
      splitArea: { areaStyle: { color: ['rgba(100,110,120,0.01)', 'rgba(100,110,120,0.03)'] } },
      axisLine: { lineStyle: { color: 'rgba(100,110,120,0.1)' } }
    },
    series: [{
      type: 'radar',
      data: radarData.series.map((s, i) => {
        const c = warmSeriesColors[i];
        return {
          name: s.name, value: s.values,
          lineStyle: { color: c, width: 2 },
          areaStyle: { color: c + '20' },
          itemStyle: { color: c },
          symbol: 'circle', symbolSize: 4
        };
      }),
      animationDuration: 1500
    }]
  });
}

export function resizeRadar() { if (chart) chart.resize(); }
