/* Line Chart — 24h 销售趋势 (Orange theme) */
import * as echarts from 'echarts';
import { hourlyTrend } from './mock-data.js';

let chart = null;

export function initLineChart(container) {
  chart = echarts.init(container);
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  chart.setOption({
    backgroundColor: 'transparent',
    grid: { top: 30, right: 20, bottom: 30, left: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8,16,38,0.95)',
      borderColor: '#e8863a', borderWidth: 1,
      textStyle: { color: '#c8cdd8', fontSize: 11 },
      formatter: p => `${p[0].axisValue}<br/>销售额：<b style="color:#e8863a">¥${p[0].value.toLocaleString()}</b>`
    },
    xAxis: {
      type: 'category', data: hours,
      axisLine: { lineStyle: { color: 'rgba(100,120,160,0.2)' } },
      axisLabel: { color: '#6a7590', fontSize: 10, interval: 3 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(100,120,160,0.06)' } },
      axisLine: { show: false },
      axisLabel: { color: '#6a7590', fontSize: 10, formatter: v => v >= 10000 ? (v/10000)+'w' : v }
    },
    series: [{
      type: 'line', data: hourlyTrend, smooth: true,
      symbol: 'circle', symbolSize: 4, showSymbol: false,
      lineStyle: {
        color: new echarts.graphic.LinearGradient(0,0,1,0,[
          { offset: 0, color: '#e8863a' }, { offset: 1, color: '#d4a24c' }
        ]),
        width: 2, shadowColor: 'rgba(232,134,58,0.2)', shadowBlur: 10
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0,0,0,1,[
          { offset: 0, color: 'rgba(232,134,58,0.18)' }, { offset: 1, color: 'rgba(232,134,58,0)' }
        ])
      },
      itemStyle: { color: '#e8863a', borderColor: '#1a2040', borderWidth: 1 },
      emphasis: { showSymbol: true, symbolSize: 8 },
      animationDuration: 2000, animationEasing: 'cubicOut'
    }]
  });
}

export function resizeLine() { if (chart) chart.resize(); }
