/* ============================================
   Map Chart — 区域地图 + 商铺标注 + 购物轨迹
   支持 2D / 3D 切换
   2D: 顶部俯视，多层 geo 叠加发光边界 + effectScatter + lines
   3D: 倾角俯视，geo3D + bar3D + lines3D + scatter3D
   底层地图: ECharts 原生 geo / geo3D (基于 GeoJSON 矢量边界)
   可配置区域 —— 只需替换 MAP_GEO_URL 和 MAP_NAME
   ============================================ */
import * as echarts from 'echarts';
import 'echarts-gl';
import { shops, buyers } from './mock-data.js';

// ===================== 可配置区域 =====================
const MAP_NAME    = 'haidian';
const MAP_GEO_URL = './haidian.json';
const MAP_CENTER  = [116.310, 40.005];
const MAP_ZOOM_2D = 1.15;

let mapChart = null;
let currentBuyerIndex = 0;
let selectedBuyerIndices = new Set([0]);
let is3D = false;
let mapRegistered = false;
let interactionCallback = null; // 地图交互回调（拖拽/缩放时触发）

// 供外部设置交互回调
export function setMapInteractionCallback(cb) { interactionCallback = cb; }

// 供外部查询地图是否处于全屏
let mapFullscreen = false;
export function getMapFullscreen() { return mapFullscreen; }
export function setMapFullscreen(val) { mapFullscreen = val; }

// ===================== 注册地图 =====================
async function ensureMapRegistered() {
  if (mapRegistered) return;
  const resp = await fetch(MAP_GEO_URL);
  const geoData = await resp.json();
  echarts.registerMap(MAP_NAME, geoData);
  mapRegistered = true;
}

// ===================== Init =====================
export async function initMapChart(container) {
  mapChart = echarts.init(container);
  await ensureMapRegistered();
  render2DMap();
  selectBuyer(0);
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

// ===================== 颜色工具 =====================
function getShopColor(category) {
  const map = {
    '数码电子': '#4a7a8e',
    '服饰鞋包': '#ff8c4a',
    '食品饮料': '#4a8e8e',
    '美妆护肤': '#ff6b8a',
    '家居日用': '#5a7a7e',
    '文体教育': '#ffa64a'
  };
  return map[category] || '#4a7a8e';
}

// ===================== 建筑群生成 (3D) =====================
function generateBuildingCluster(shop) {
  const [cx, cy] = shop.coords;
  const baseHeight = shop.todaySales / 25000;
  const clusterColor = getShopColor(shop.category);
  const buildings = [
    { offset: [0, 0], height: baseHeight * 1.0, size: 1.2, name: shop.name },
  ];
  const count = 2 + Math.floor(Math.random() * 3);
  const spread = 0.006;
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
    itemStyle: { color: clusterColor, opacity: 0.9 }
  }));
}

function generateFillerBuildings() {
  const fillers = [];
  const range = 0.08;
  for (let i = 0; i < 120; i++) {
    const x = MAP_CENTER[0] + (Math.random() - 0.5) * range * 2;
    const y = MAP_CENTER[1] + (Math.random() - 0.5) * range * 2;
    const tooClose = shops.some(s =>
      Math.abs(s.coords[0] - x) < 0.008 && Math.abs(s.coords[1] - y) < 0.008
    );
    if (tooClose) continue;
    fillers.push({
      name: '',
      value: [x, y, 0.3 + Math.random() * 2.5],
      barSize: 0.2 + Math.random() * 0.3,
      itemStyle: { color: 'rgba(20, 30, 40, 0.5)', opacity: 0.6 }
    });
  }
  return fillers;
}

// ===================== 立体路牌生成 (3D) =====================
function generateSignposts() {
  return shops.map((shop, i) => {
    const baseHeight = shop.todaySales / 25000;
    // 每个路牌均匀分布在不同角度，避免重叠
    const angle = (Math.PI * 2 * i) / shops.length + 0.3;
    const dist = 0.0045;
    const postHeight = Math.max(baseHeight + 4, 8);
    return {
      name: shop.name,
      value: [
        shop.coords[0] + Math.cos(angle) * dist,
        shop.coords[1] + Math.sin(angle) * dist,
        postHeight
      ],
      barSize: 0.06,
      itemStyle: {
        color: '#e8863a',
        opacity: 0.95
      }
    };
  });
}

// ===================== 2D Geo 配置 (黑白灰度战术风格) =====================
function buildGeoLayers2D() {
  return [
    // --- Layer 0: 最底层外发光阴影 (高亮白色大范围 glow) ---
    {
      map: MAP_NAME,
      roam: false,
      zoom: MAP_ZOOM_2D,
      center: MAP_CENTER,
      silent: true,
      label: { show: false },
      itemStyle: {
        areaColor: 'transparent',
        borderColor: 'rgba(232, 134, 58, 0.12)',
        borderWidth: 14,
        shadowColor: 'rgba(232, 134, 58, 0.35)',
        shadowBlur: 80,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      },
      zlevel: -3,
      z: 0
    },
    // --- Layer 1: 中层发光边框 (高亮灰白光晕) ---
    {
      map: MAP_NAME,
      roam: false,
      zoom: MAP_ZOOM_2D,
      center: MAP_CENTER,
      silent: true,
      label: { show: false },
      itemStyle: {
        areaColor: 'transparent',
        borderColor: 'rgba(232, 134, 58, 0.4)',
        borderWidth: 4,
        shadowColor: 'rgba(232, 134, 58, 0.5)',
        shadowBlur: 25,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      },
      zlevel: -2,
      z: 1
    },
    // --- Layer 2: 主地图层 (深黑填充 + 亮白精确边框) ---
    {
      map: MAP_NAME,
      roam: true,
      zoom: MAP_ZOOM_2D,
      center: MAP_CENTER,
      label: {
        show: true,
        color: '#ffffff',
        fontSize: 11,
        fontFamily: 'Orbitron, Noto Sans SC, sans-serif',
        textBorderColor: 'rgba(0,0,0,0.9)',
        textBorderWidth: 3,
        textShadowColor: 'rgba(255,255,255,0.3)',
        textShadowBlur: 4,
        formatter: p => `{bg|${p.name}}`,
        rich: {
          bg: {
            backgroundColor: 'rgba(0,0,0,0.75)',
            padding: [4, 10],
            color: '#ffffff',
            fontSize: 11,
            fontFamily: 'Orbitron, Noto Sans SC, sans-serif',
            letterSpacing: 1
          }
        }
      },
      itemStyle: {
        areaColor: {
          type: 'radial',
          x: 0.5, y: 0.5, r: 0.9,
          colorStops: [
            { offset: 0, color: 'rgba(15, 22, 30, 0.4)' },
            { offset: 0.4, color: 'rgba(10, 16, 26, 0.55)' },
            { offset: 0.8, color: 'rgba(6, 12, 20, 0.75)' },
            { offset: 1, color: 'rgba(4, 8, 16, 0.9)' }
          ]
        },
        borderColor: '#e8863a',
        borderWidth: 1.5,
        shadowColor: 'rgba(232, 134, 58, 0.4)',
        shadowBlur: 12
      },
      emphasis: {
        label: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 'bold'
        },
        itemStyle: {
          areaColor: 'rgba(20, 30, 40, 0.45)',
          borderColor: '#e8a050',
          borderWidth: 2,
          shadowColor: 'rgba(220, 220, 220, 0.6)',
          shadowBlur: 20
        }
      },
      zlevel: -1,
      z: 2
    }
  ];
}

// ===================== HUD 网格线系列 =====================
function buildHUDGridSeries() {
  return {
    name: 'HUD网格',
    type: 'scatter',
    coordinateSystem: 'geo',
    geoIndex: 2,
    data: [],
    symbolSize: 0,
    itemStyle: { opacity: 0 },
    zlevel: -4,
    z: -1
  };
}

// ===================== 2D Map (战术 HUD 风格) =====================
function render2DMap() {
  const option = {
    backgroundColor: 'transparent',
    geo: buildGeoLayers2D(),
    tooltip: buildTooltip(),
    series: [
      buildHUDGridSeries(),
      buildShopScatter2D(),
      ...buyers.map(b => buildTrajectoryLines2D([], b.color, `轨迹-${b.name}`)),
      ...buyers.map(b => buildOrderScatter2D([], b.color, `顺序-${b.name}`))
    ],
    graphic: buildHUDGraphics()
  };
  mapChart.setOption(option);

  // 同步所有 geo 层的平移/缩放，并触发交互回调
  mapChart.on('georoam', function() {
    const opt = mapChart.getOption();
    const mainGeo = opt.geo[2];
    mapChart.setOption({
      geo: [
        { center: mainGeo.center, zoom: mainGeo.zoom },
        { center: mainGeo.center, zoom: mainGeo.zoom },
        {}
      ]
    });
    // 通知外部：地图被操作了
    if (interactionCallback) interactionCallback();
  });
}

// ===================== HUD 装饰图形 (黑白风格) =====================
function buildHUDGraphics() {
  const items = [];
  // 中心十字准星
  items.push({
    type: 'group',
    left: 'center', top: 'center',
    children: [
      {
        type: 'line',
        shape: { x1: -12, y1: 0, x2: 12, y2: 0 },
        style: { stroke: 'rgba(180,180,180,0.25)', lineWidth: 1 }
      },
      {
        type: 'line',
        shape: { x1: 0, y1: -12, x2: 0, y2: 12 },
        style: { stroke: 'rgba(180,180,180,0.25)', lineWidth: 1 }
      },
      {
        type: 'circle',
        shape: { cx: 0, cy: 0, r: 4 },
        style: { fill: 'none', stroke: 'rgba(180,180,180,0.2)', lineWidth: 1 }
      }
    ]
  });
  return items;
}

function buildShopScatter2D() {
  return {
    name: '商铺',
    type: 'effectScatter',
    coordinateSystem: 'geo',
    geoIndex: 2,
    data: shops.map(shop => ({
      name: shop.name,
      value: [...shop.coords, shop.todaySales],
    })),
    symbolSize: val => Math.max(14, val[2] / 18000),
    showEffectOn: 'render',
    rippleEffect: { brushType: 'stroke', scale: 5, period: 3 },
    itemStyle: {
      color: p => getShopColor(shops.find(s => s.name === p.name)?.category),
      shadowBlur: 4,
      shadowColor: 'rgba(200,200,200,0.15)'
    },
    label: {
      show: true, position: 'top',
      distance: 14,
      formatter: p => `{line|}\n{bg|${p.name}}`,
      color: '#ffffff', fontSize: 11, fontFamily: 'Orbitron, Noto Sans SC, sans-serif',
      textShadowColor: 'rgba(0,0,0,0.8)', textShadowBlur: 4,
      textBorderColor: 'rgba(0,0,0,0.6)', textBorderWidth: 1,
      rich: {
        line: {
          width: 2,
          height: 10,
          backgroundColor: 'rgba(255,255,255,0.6)',
          align: 'center'
        },
        bg: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: [5, 12],
          color: '#ffffff',
          fontSize: 12,
          fontFamily: 'Orbitron, Noto Sans SC, sans-serif',
          fontWeight: 'bold',
          letterSpacing: 1,
          align: 'center'
        }
      }
    },
    zlevel: 10
  };
}

function buildTrajectoryLines2D(data, color = '#aaaaaa', name = '购物轨迹') {
  return {
    name,
    type: 'lines',
    coordinateSystem: 'geo',
    geoIndex: 2,
    data,
    polyline: false,
    effect: {
      show: true, period: 4, trailLength: 0.5,
      symbol: 'arrow', symbolSize: 5, color
    },
    lineStyle: {
      color, width: 1, opacity: 0.55, curveness: 0.3
    },
    zlevel: 10
  };
}

function buildOrderScatter2D(data, color = '#e0e0e0', name = '轨迹顺序') {
  return {
    name,
    type: 'scatter',
    coordinateSystem: 'geo',
    geoIndex: 2,
    data,
    symbol: 'circle',
    symbolSize: 22,
    itemStyle: { color, shadowBlur: 12, shadowColor: color },
    label: {
      show: true, formatter: p => `{bg|${p.name}}`,
      color: '#fff', fontSize: 12, fontWeight: 'bold',
      rich: {
        bg: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: [3, 8],
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold'
        }
      }
    },
    zlevel: 10
  };
}

// ===================== 3D Map =====================
function render3DMap() {
  const shopClusters = shops.flatMap(shop => generateBuildingCluster(shop));
  const fillerBuildings = generateFillerBuildings();
  const allBuildings = [...shopClusters, ...fillerBuildings];
  const signposts = generateSignposts();

  const option = {
    backgroundColor: 'transparent',
    geo3D: {
      map: MAP_NAME,
      roam: true,
      center: MAP_CENTER,
      viewControl: {
        distance: 100,
        alpha: 45,
        beta: 20,
        panSensitivity: 1,
        rotateSensitivity: 1,
        zoomSensitivity: 1,
        autoRotate: false,
        panMouseButton: 'left',
        rotateMouseButton: 'right'
      },
      label: { show: false },
      itemStyle: {
        color: 'rgba(6, 10, 16, 0.95)',
        borderColor: '#1a3a4a',
        borderWidth: 1.5,
        opacity: 1
      },
      emphasis: {
        itemStyle: {
          color: 'rgba(15, 22, 30, 0.7)',
          borderColor: '#4a7a8e',
          borderWidth: 2
        }
      },
      environment: 'auto',
      shading: 'lambert',
      postEffect: {
        enable: true,
        bloom: { enable: true, intensity: 0.8 },
        SSAO: { enable: true, radius: 5, intensity: 1.2 }
      },
      light: {
        main: { intensity: 2.5, shadow: true, shadowQuality: 'high', alpha: 45, beta: 30 },
        ambient: { intensity: 0.35 }
      },
      regionHeight: 0.2,
      groundPlane: {
        show: true,
        color: '#060a14'
      }
    },
    tooltip: buildTooltip(),
    series: [
      {
        name: '商铺建筑',
        type: 'bar3D',
        coordinateSystem: 'geo3D',
        data: allBuildings,
        barSize: 1.2,
        minHeight: 0.5,
        shading: 'lambert',
        label: {
          show: true, distance: 12,
          formatter: p => p.name || '',
          textStyle: {
            color: '#ffffff', fontSize: 12, fontFamily: 'Orbitron, Noto Sans SC, sans-serif',
            backgroundColor: 'rgba(20,40,50,0.9)', padding: [6, 14],
            borderWidth: 1, borderColor: 'rgba(80,100,110,0.9)',
            borderRadius: 2
          }
        },
        emphasis: {
          label: {
            show: true, fontSize: 14, fontWeight: 'bold', distance: 14,
            textStyle: {
              color: '#ffffff', fontSize: 14, fontWeight: 'bold',
              backgroundColor: 'rgba(25,45,55,0.95)', padding: [8, 16],
              borderWidth: 1, borderColor: 'rgba(90,110,120,1)',
              borderRadius: 2
            }
          },
          itemStyle: { color: '#6a8a8e', opacity: 1 }
        },
        animationDurationUpdate: 800,
        animationEasingUpdate: 'cubicOut'
      },
      {
        name: '商铺基座',
        type: 'scatter3D',
        coordinateSystem: 'geo3D',
        data: shops.map(shop => ({
          name: shop.name,
          value: [...shop.coords, 0]
        })),
        symbolSize: 12,
        itemStyle: { color: '#e8863a', opacity: 0.8, borderColor: '#d4a24c', borderWidth: 2 },
        label: { show: false }
      },
      ...buyers.map(b => ({
        name: `轨迹3D-${b.name}`,
        type: 'lines3D',
        coordinateSystem: 'geo3D',
        data: [{ coords: [[116.31, 40.00, 0], [116.31, 40.00, 0]], lineStyle: { opacity: 0 } }],
        effect: { show: true, period: 4, trailWidth: 4, trailLength: 0.5, trailColor: b.color },
        lineStyle: { color: b.color, width: 2, opacity: 0.7 }
      })),
      // --- 立体路牌 ---
      {
        name: '立体路牌',
        type: 'bar3D',
        coordinateSystem: 'geo3D',
        data: signposts,
        barSize: 0.06,
        minHeight: 0.5,
        shading: 'lambert',
        label: {
          show: true,
          distance: 8,
          formatter: p => p.name || '',
          textStyle: {
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Noto Sans SC, sans-serif',
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            padding: [8, 18],
            borderWidth: 1,
            borderColor: '#e8863a',
            borderRadius: 4,
            textShadowColor: 'rgba(0, 0, 0, 0.4)',
            textShadowBlur: 4
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
            fontWeight: 'bold',
            distance: 10,
            textStyle: {
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 'bold',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              padding: [10, 22],
              borderWidth: 1,
              borderColor: '#ffaa55',
              borderRadius: 4,
              textShadowColor: 'rgba(0, 0, 0, 0.4)',
              textShadowBlur: 6
            }
          },
          itemStyle: { color: '#ffaa55', opacity: 1 }
        },
        animationDurationUpdate: 800,
        animationEasingUpdate: 'cubicOut',
        zlevel: 15
      }
    ]
  };
  mapChart.setOption(option);

  // 3D 地图拖拽/缩放时触发交互回调
  mapChart.on('georoam3D', function() {
    if (interactionCallback) interactionCallback();
  });
}

// ===================== Shared: Tooltip =====================
function buildTooltip() {
  return {
    trigger: 'item',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    textStyle: { color: '#d0d0d0', fontSize: 12 },
    formatter: function(params) {
      const shop = shops.find(s => s.name === params.name);
      if (shop) {
        const bar = (val, max) => {
          const pct = Math.min(100, Math.round((val / max) * 100));
          return `<span style="display:inline-block;width:28px;height:3px;background:#333;border-radius:1px;overflow:hidden;vertical-align:middle;margin-left:6px;"><span style="display:block;height:100%;width:${pct}%;background:#e8863a;border-radius:1px;"></span></span>`;
        };
        return `
          <div style="background:rgba(12,16,22,0.96);border-radius:6px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.6);min-width:200px;font-family:'Orbitron','Noto Sans SC',sans-serif;">
            <div style="background:#c45e1a;padding:8px 14px;color:#fff;font-size:14px;font-weight:bold;letter-spacing:1px;">
              ${shop.name}
            </div>
            <div style="padding:10px 14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;color:#a0a0a0;font-size:11px;margin-bottom:8px;">
                <span>${shop.address}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;color:#d0d0d0;font-size:12px;margin-bottom:6px;">
                <span>今日客流</span>
                <span style="color:#fff;font-weight:bold;">${shop.todayVisitors.toLocaleString()} 人${bar(shop.todayVisitors, 5000)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;color:#d0d0d0;font-size:12px;margin-bottom:6px;">
                <span>今日销售</span>
                <span style="color:#fff;font-weight:bold;">¥${(shop.todaySales/10000).toFixed(1)}万${bar(shop.todaySales, 300000)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;color:#d0d0d0;font-size:12px;margin-bottom:6px;">
                <span>评分</span>
                <span style="color:#fff;font-weight:bold;">★ ${shop.rating}${bar(shop.rating*20, 100)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;color:#d0d0d0;font-size:12px;margin-bottom:2px;">
                <span>营业时间</span>
                <span style="color:#fff;font-weight:bold;">${shop.openTime}</span>
              </div>
              <div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);color:#909090;font-size:11px;">
                畅销品：${shop.topProducts.join('、')}
              </div>
            </div>
          </div>`;
      }
      return '';
    }
  };
}

// ===================== Buyer Selection (多选) =====================
export function selectBuyer(index) {
  selectBuyers([index]);
}

export function selectBuyers(indices) {
  if (!mapChart) return;
  selectedBuyerIndices = new Set(indices);
  currentBuyerIndex = indices.length > 0 ? indices[indices.length - 1] : 0;

  const shopMap = {};
  shops.forEach(s => { shopMap[s.name] = s.coords; });

  if (is3D) {
    selectBuyers3D(indices, shopMap);
  } else {
    selectBuyers2D(indices, shopMap);
  }
}

export function getSelectedBuyerIndices() {
  return Array.from(selectedBuyerIndices);
}

function selectBuyers2D(indices, shopMap) {
  const updates = [];

  buyers.forEach((buyer, i) => {
    const isSelected = indices.includes(i);

    if (isSelected) {
      const lineData = [];
      for (let j = 0; j < buyer.trajectory.length - 1; j++) {
        const from = buyer.trajectory[j];
        const to = buyer.trajectory[j + 1];
        if (shopMap[from] && shopMap[to]) {
          lineData.push({
            fromName: from, toName: to,
            coords: [shopMap[from], shopMap[to]]
          });
        }
      }

      const orderData = buyer.trajectory.map((shopName, idx) => {
        const coords = shopMap[shopName];
        if (!coords) return null;
        return {
          name: `${idx + 1}`,
          value: coords,
          itemStyle: { color: buyer.color, shadowBlur: 4, shadowColor: buyer.color }
        };
      }).filter(Boolean);

      updates.push({
        name: `轨迹-${buyer.name}`,
        type: 'lines',
        data: lineData,
        effect: {
          show: true, period: 4, trailLength: 0.3,
          symbol: 'arrow', symbolSize: 5, color: buyer.color
        },
        lineStyle: {
          color: buyer.color, width: 2, opacity: 0.6, curveness: 0.3,
          shadowColor: buyer.color, shadowBlur: 3
        }
      });
      updates.push({
        name: `顺序-${buyer.name}`,
        type: 'scatter',
        data: orderData,
        itemStyle: { color: buyer.color, shadowBlur: 4, shadowColor: buyer.color },
        label: { show: true, formatter: '{b}', color: '#fff', fontSize: 12, fontWeight: 'bold' }
      });
    } else {
      updates.push({
        name: `轨迹-${buyer.name}`,
        type: 'lines',
        data: [],
        effect: { show: false },
        lineStyle: { opacity: 0 }
      });
      updates.push({
        name: `顺序-${buyer.name}`,
        type: 'scatter',
        data: []
      });
    }
  });

  mapChart.setOption({ series: updates });
}

function selectBuyers3D(indices, shopMap) {
  const updates = [];

  // 多选时建筑保持原色，不做高亮/变暗
  const shopClusters = shops.flatMap(shop => generateBuildingCluster(shop));
  const fillerBuildings = generateFillerBuildings();
  updates.push({
    name: '商铺建筑',
    type: 'bar3D',
    data: [...shopClusters, ...fillerBuildings]
  });

  updates.push({ name: '商铺基座', type: 'scatter3D' });

  buyers.forEach((buyer, i) => {
    const isSelected = indices.includes(i);

    if (isSelected) {
      const lineData = [];
      for (let j = 0; j < buyer.trajectory.length - 1; j++) {
        const from = buyer.trajectory[j];
        const to = buyer.trajectory[j + 1];
        if (shopMap[from] && shopMap[to]) {
          lineData.push({
            fromName: from, toName: to,
            coords: [shopMap[from], shopMap[to]]
          });
        }
      }
      const lines3DData = lineData.map(l => ({
        coords: l.coords.map(c => [...c, 5])
      }));

      updates.push({
        name: `轨迹3D-${buyer.name}`,
        type: 'lines3D',
        data: lines3DData.length ? lines3DData : [{ coords: [[0,0,0], [0,0,0]], lineStyle: { opacity: 0 } }],
        effect: { show: true, period: 4, trailWidth: 3, trailLength: 0.3, trailColor: buyer.color },
        lineStyle: { color: buyer.color, width: 2, opacity: 0.7 }
      });
    } else {
      updates.push({
        name: `轨迹3D-${buyer.name}`,
        type: 'lines3D',
        data: [{ coords: [[0,0,0], [0,0,0]], lineStyle: { opacity: 0 } }],
        effect: { show: false }
      });
    }
  });

  updates.push({ name: '立体路牌', type: 'bar3D' });

  mapChart.setOption({ series: updates });
}

// ===================== Utility =====================
export function getCurrentBuyerIndex() { return currentBuyerIndex; }
export function resizeMap() { if (mapChart) mapChart.resize(); }
