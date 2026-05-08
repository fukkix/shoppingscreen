/* ============================================
   Map Chart — 海淀区地图 + 商铺标注 + 购物轨迹
   支持 2D / 3D 切换
   2D: 强发光边界 + 涟漪散点
   3D: 玻璃质感建筑群 + 城市街区效果
   ============================================ */
import * as echarts from 'echarts';
import 'echarts-gl';
import { shops, buyers } from './mock-data.js';

let mapChart = null;
let currentBuyerIndex = 0;
let is3D = false;
let geoJsonData = null;

// === Building cluster generation ===
// For each shop, generate a cluster of buildings around it
function generateBuildingCluster(shop) {
  const [cx, cy] = shop.coords;
  const baseHeight = shop.todaySales / 25000;
  const clusterColor = getShopColor(shop.category);

  // Main tower (tallest)
  const buildings = [
    { offset: [0, 0], height: baseHeight * 1.0, size: 1.2, name: shop.name },
  ];

  // Surrounding buildings (2-4 smaller)
  const count = 2 + Math.floor(Math.random() * 3);
  const spread = 0.006; // geographic spread
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = spread * (0.4 + Math.random() * 0.6);
    buildings.push({
      offset: [Math.cos(angle) * dist, Math.sin(angle) * dist],
      height: baseHeight * (0.3 + Math.random() * 0.5),
      size: 0.6 + Math.random() * 0.6,
      name: ''
    });
  }

  return buildings.map(b => ({
    name: b.name,
    value: [cx + b.offset[0], cy + b.offset[1], b.height],
    barSize: b.size,
    itemStyle: {
      color: clusterColor,
      opacity: 0.85
    }
  }));
}

// Decorative "filler" buildings to create cityscape feel
function generateFillerBuildings() {
  const fillers = [];
  const center = [116.310, 40.005];
  const range = 0.06;

  for (let i = 0; i < 30; i++) {
    const x = center[0] + (Math.random() - 0.5) * range * 2;
    const y = center[1] + (Math.random() - 0.5) * range * 2;

    // Skip if too close to any shop
    const tooClose = shops.some(s =>
      Math.abs(s.coords[0] - x) < 0.008 && Math.abs(s.coords[1] - y) < 0.008
    );
    if (tooClose) continue;

    fillers.push({
      name: '',
      value: [x, y, 0.5 + Math.random() * 2],
      barSize: 0.3 + Math.random() * 0.4,
      itemStyle: {
        color: 'rgba(30, 35, 55, 0.6)',
        opacity: 0.35
      }
    });
  }
  return fillers;
}

function getShopColor(category) {
  const map = {
    '数码电子': '#e8863a',
    '服饰鞋包': '#d4a24c',
    '食品饮料': '#3dbd6e',
    '美妆护肤': '#c06060',
    '家居日用': '#8b6cc4',
    '文体教育': '#3a9ea8'
  };
  return map[category] || '#e8863a';
}

// ===================== Init =====================
export function initMapChart(container) {
  mapChart = echarts.init(container);

  fetch('/haidian.json')
    .then(r => r.json())
    .then(geoJson => {
      geoJsonData = geoJson;
      echarts.registerMap('haidian', geoJson);
      render2DMap();
      selectBuyer(0);
    });
}

// ===================== Toggle =====================
export function toggleMapMode() {
  is3D = !is3D;
  if (mapChart) {
    mapChart.clear();
    const container = mapChart.getDom();
    mapChart.dispose();
    mapChart = echarts.init(container);
  }
  if (is3D) {
    render3DMap();
  } else {
    render2DMap();
  }
  selectBuyer(currentBuyerIndex);
  return is3D;
}

export function getIs3D() { return is3D; }

// ===================== 2D Map (Enhanced Glow) =====================
function render2DMap() {
  const option = {
    backgroundColor: 'transparent',
    geo: [
      // Shadow/glow layer (behind)
      {
        map: 'haidian',
        roam: true,
        zoom: 1.15,
        center: [116.310, 40.005],
        label: { show: false },
        silent: true,
        itemStyle: {
          areaColor: 'transparent',
          borderColor: '#e8863a',
          borderWidth: 3,
          shadowColor: 'rgba(232, 134, 58, 0.4)',
          shadowBlur: 35,
          shadowOffsetX: 0,
          shadowOffsetY: 0
        },
        zlevel: -1
      },
      // Main map layer
      {
        map: 'haidian',
        roam: true,
        zoom: 1.15,
        center: [116.310, 40.005],
        label: { show: false },
        itemStyle: {
          areaColor: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.8,
            colorStops: [
              { offset: 0, color: 'rgba(15, 25, 50, 0.5)' },
              { offset: 0.6, color: 'rgba(8, 15, 35, 0.75)' },
              { offset: 1, color: 'rgba(4, 8, 20, 0.9)' }
            ]
          },
          borderColor: 'rgba(180, 120, 60, 0.5)',
          borderWidth: 1.5,
          shadowColor: 'rgba(232, 134, 58, 0.3)',
          shadowBlur: 20
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(30, 40, 65, 0.5)',
            borderColor: '#e8863a',
            borderWidth: 2
          }
        }
      }
    ],
    tooltip: buildTooltip(),
    series: [
      buildShopScatter2D(),
      buildTrajectoryLines2D([])
    ]
  };
  mapChart.setOption(option);
}

function buildShopScatter2D() {
  return {
    name: '商铺',
    type: 'effectScatter',
    coordinateSystem: 'geo',
    geoIndex: 1,
    data: shops.map(shop => ({
      name: shop.name,
      value: [...shop.coords, shop.todaySales],
    })),
    symbolSize: val => Math.max(14, val[2] / 18000),
    showEffectOn: 'render',
    rippleEffect: { brushType: 'stroke', scale: 5, period: 3 },
    itemStyle: {
      color: '#e8863a',
      shadowBlur: 12,
      shadowColor: 'rgba(232,134,58,0.5)'
    },
    label: {
      show: true, position: 'right', formatter: '{b}',
      color: '#c8cdd8', fontSize: 11,
      textShadowColor: 'rgba(0,0,0,0.9)', textShadowBlur: 6,
      textBorderColor: 'rgba(10,15,30,0.6)', textBorderWidth: 2
    }
  };
}

function buildTrajectoryLines2D(data, color = '#e8863a') {
  return {
    name: '购物轨迹',
    type: 'lines',
    coordinateSystem: 'geo',
    geoIndex: 1,
    data,
    polyline: false,
    effect: {
      show: true, period: 4, trailLength: 0.5,
      symbol: 'arrow', symbolSize: 7, color
    },
    lineStyle: {
      color, width: 2.5, opacity: 0.7, curveness: 0.3,
      shadowColor: color, shadowBlur: 8
    }
  };
}

// ===================== 3D Map (City Buildings) =====================
function render3DMap() {
  // Pre-generate all building data
  const shopClusters = shops.flatMap(shop => generateBuildingCluster(shop));
  const fillerBuildings = generateFillerBuildings();
  const allBuildings = [...shopClusters, ...fillerBuildings];

  const option = {
    backgroundColor: 'transparent',
    geo3D: {
      map: 'haidian',
      roam: true,
      viewControl: {
        distance: 80,
        alpha: 40,
        beta: 20,
        minAlpha: 5,
        maxAlpha: 75,
        minDistance: 40,
        maxDistance: 200,
        center: [0, 0, 0],
        autoRotate: false,
        panSensitivity: 1.5,
        rotateSensitivity: 1.5,
        zoomSensitivity: 1.5,
        damping: 0.9
      },
      label: { show: false },
      itemStyle: {
        color: 'rgba(6, 12, 25, 0.95)',
        borderColor: 'rgba(140, 100, 50, 0.3)',
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          color: 'rgba(20, 28, 45, 0.6)',
          borderColor: '#e8863a'
        }
      },
      environment: 'transparent',
      shading: 'realistic',
      realisticMaterial: {
        roughness: 0.8,
        metalness: 0.1
      },
      light: {
        main: {
          intensity: 1.5,
          shadow: true,
          shadowQuality: 'high',
          alpha: 40,
          beta: 30
        },
        ambient: { intensity: 0.4 },
        ambientCubemap: { exposure: 1, diffuseIntensity: 0.5 }
      },
      groundPlane: {
        show: true,
        color: 'rgba(3, 6, 14, 0.85)'
      },
      postEffect: {
        enable: true,
        bloom: { enable: true, intensity: 0.15 },
        SSAO: { enable: true, radius: 5, intensity: 1.2 },
        depthOfField: { enable: false }
      },
      temporalSuperSampling: { enable: true },
      regionHeight: 1.5
    },
    tooltip: buildTooltip(),
    series: [
      // City buildings
      {
        name: '商铺建筑',
        type: 'bar3D',
        coordinateSystem: 'geo3D',
        data: allBuildings,
        barSize: 1.2,
        minHeight: 0.5,
        shading: 'realistic',
        realisticMaterial: {
          roughness: 0.2,
          metalness: 0.6,
          detailTexture: null
        },
        label: {
          show: true,
          distance: 3,
          formatter: p => p.name || '',
          textStyle: {
            color: '#c8cdd8',
            fontSize: 11,
            backgroundColor: 'rgba(8,16,30,0.85)',
            padding: [3, 8],
            borderRadius: 3,
            borderColor: 'rgba(232,134,58,0.4)',
            borderWidth: 1
          }
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: { color: '#e8a050', opacity: 1 }
        },
        animationDurationUpdate: 800,
        animationEasingUpdate: 'cubicOut'
      },
      // Glowing base points
      {
        name: '商铺基座',
        type: 'scatter3D',
        coordinateSystem: 'geo3D',
        data: shops.map(shop => ({
          name: shop.name,
          value: [...shop.coords, 0]
        })),
        symbolSize: 12,
        itemStyle: {
          color: '#e8863a',
          opacity: 0.8,
          borderColor: '#d4a24c',
          borderWidth: 2
        },
        label: { show: false }
      },
      // 3D trajectory lines
      {
        name: '购物轨迹3D',
        type: 'lines3D',
        coordinateSystem: 'geo3D',
        data: [],
        effect: {
          show: true,
          period: 4,
          trailWidth: 4,
          trailLength: 0.5,
          trailColor: '#e8863a'
        },
        lineStyle: { color: '#e8863a', width: 2, opacity: 0.7 }
      }
    ]
  };
  mapChart.setOption(option);
}

// ===================== Shared: Tooltip =====================
function buildTooltip() {
  return {
    trigger: 'item',
    backgroundColor: 'rgba(8, 16, 35, 0.95)',
    borderColor: '#e8863a',
    borderWidth: 1,
    textStyle: { color: '#c8cdd8', fontSize: 12 },
    formatter: function(params) {
      const shop = shops.find(s => s.name === params.name);
      if (shop) {
        return `<div style="font-size:14px;font-weight:bold;color:#e8863a;margin-bottom:6px;">${shop.name}</div>
          <div style="color:#6a7590;font-size:11px;margin-bottom:6px;">${shop.address}</div>
          <div>今日客流：<span style="color:#3dbd6e;font-weight:bold;">${shop.todayVisitors.toLocaleString()}</span> 人</div>
          <div>今日销售：<span style="color:#d4a24c;font-weight:bold;">¥${shop.todaySales.toLocaleString()}</span></div>
          <div>评分：<span style="color:#d4a24c;">★ ${shop.rating}</span></div>
          <div style="margin-top:4px;color:#6a7590;">畅销品：${shop.topProducts.join('、')}</div>`;
      }
      return '';
    }
  };
}

// ===================== Buyer Selection =====================
export function selectBuyer(index) {
  if (!mapChart) return;
  currentBuyerIndex = index;
  const buyer = buyers[index];
  const shopMap = {};
  shops.forEach(s => { shopMap[s.name] = s.coords; });

  const lineData = [];
  for (let i = 0; i < buyer.trajectory.length - 1; i++) {
    const from = buyer.trajectory[i];
    const to = buyer.trajectory[i + 1];
    if (shopMap[from] && shopMap[to]) {
      lineData.push({
        fromName: from, toName: to,
        coords: [shopMap[from], shopMap[to]]
      });
    }
  }

  if (is3D) {
    selectBuyer3D(buyer, lineData, shopMap);
  } else {
    selectBuyer2D(buyer, lineData, shopMap);
  }
}

function selectBuyer2D(buyer, lineData, shopMap) {
  const orderData = buyer.trajectory.map((shopName, idx) => {
    const coords = shopMap[shopName];
    if (!coords) return null;
    return { name: `${idx + 1}`, value: [...coords, idx] };
  }).filter(Boolean);

  mapChart.setOption({
    series: [
      // index 0: keep shop scatter unchanged
      {
        name: '商铺',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        geoIndex: 1,
        data: shops.map(shop => ({
          name: shop.name,
          value: [...shop.coords, shop.todaySales],
        })),
        symbolSize: val => Math.max(14, val[2] / 18000),
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 5, period: 3 },
        itemStyle: {
          color: '#e8863a',
          shadowBlur: 12,
          shadowColor: 'rgba(232,134,58,0.5)'
        },
        label: {
          show: true, position: 'right', formatter: '{b}',
          color: '#c8cdd8', fontSize: 11,
          textShadowColor: 'rgba(0,0,0,0.9)', textShadowBlur: 6,
          textBorderColor: 'rgba(10,15,30,0.6)', textBorderWidth: 2
        }
      },
      // index 1: trajectory lines
      {
        name: '购物轨迹',
        type: 'lines',
        coordinateSystem: 'geo',
        geoIndex: 1,
        data: lineData,
        effect: {
          show: true, period: 4, trailLength: 0.5,
          symbol: 'arrow', symbolSize: 7, color: buyer.color
        },
        lineStyle: {
          color: buyer.color, width: 2.5, opacity: 0.7, curveness: 0.3,
          shadowColor: buyer.color, shadowBlur: 8
        }
      },
      // index 2: trajectory order markers
      {
        name: '轨迹顺序',
        type: 'scatter',
        coordinateSystem: 'geo',
        geoIndex: 1,
        data: orderData,
        symbol: 'circle', symbolSize: 22,
        itemStyle: { color: buyer.color, shadowBlur: 12, shadowColor: buyer.color },
        label: { show: true, formatter: '{b}', color: '#fff', fontSize: 12, fontWeight: 'bold' },
        zlevel: 10
      }
    ]
  });
}

function selectBuyer3D(buyer, lineData, shopMap) {
  const lines3DData = lineData.map(l => ({
    coords: l.coords.map(c => [...c, 5])
  }));

  // Rebuild buildings with trajectory highlighting
  const trajShopNames = new Set(buyer.trajectory);
  const highlightedClusters = shops.flatMap(shop => {
    const cluster = generateBuildingCluster(shop);
    const onTrajectory = trajShopNames.has(shop.name);
    return cluster.map(b => ({
      ...b,
      itemStyle: {
        ...b.itemStyle,
        color: onTrajectory ? buyer.color : b.itemStyle.color,
        opacity: onTrajectory ? 0.95 : 0.5
      }
    }));
  });
  const fillers = generateFillerBuildings().map(f => ({
    ...f,
    itemStyle: { ...f.itemStyle, opacity: 0.25 }
  }));

  mapChart.setOption({
    series: [
      {
        name: '商铺建筑',
        data: [...highlightedClusters, ...fillers]
      },
      { name: '商铺基座' },
      {
        name: '购物轨迹3D',
        data: lines3DData,
        effect: { show: true, period: 4, trailWidth: 5, trailLength: 0.5, trailColor: buyer.color },
        lineStyle: { color: buyer.color, width: 3, opacity: 0.85 }
      }
    ]
  });
}

// ===================== Utility =====================
export function getCurrentBuyerIndex() { return currentBuyerIndex; }
export function resizeMap() { if (mapChart) mapChart.resize(); }
