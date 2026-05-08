/* ============================================
   Mock Data — 购物数据可视化大屏
   ============================================ */

// ===== 商铺数据 =====
export const shops = [
  {
    name: '中关村商厦',
    address: '北京市海淀区中关村大街28号',
    coords: [116.316, 39.982],
    todayVisitors: 2345,
    todaySales: 186200,
    rating: 4.7,
    topProducts: ['iPhone 16', 'iPad Air', 'AirPods Pro'],
    openTime: '09:00 - 22:00',
    category: '数码电子'
  },
  {
    name: '五道口购物中心',
    address: '北京市海淀区成府路35号',
    coords: [116.338, 39.993],
    todayVisitors: 3120,
    todaySales: 245800,
    rating: 4.8,
    topProducts: ['Nike Air Max', 'Levi\'s 501', 'Uniqlo联名'],
    openTime: '10:00 - 22:00',
    category: '服饰鞋包'
  },
  {
    name: '金源燕莎Mall',
    address: '北京市海淀区远大路1号',
    coords: [116.268, 39.965],
    todayVisitors: 4210,
    todaySales: 389500,
    rating: 4.9,
    topProducts: ['SK-II神仙水', 'YSL口红', 'Dior香水'],
    openTime: '10:00 - 22:00',
    category: '美妆护肤'
  },
  {
    name: '海淀万柳华联',
    address: '北京市海淀区万柳中路6号',
    coords: [116.305, 39.970],
    todayVisitors: 1890,
    todaySales: 128700,
    rating: 4.5,
    topProducts: ['有机蔬果', '进口牛排', '精酿啤酒'],
    openTime: '08:00 - 22:00',
    category: '食品饮料'
  },
  {
    name: '清河万象汇',
    address: '北京市海淀区清河中街68号',
    coords: [116.345, 40.035],
    todayVisitors: 2780,
    todaySales: 198400,
    rating: 4.6,
    topProducts: ['宜家收纳', '无印良品', '戴森吸尘器'],
    openTime: '10:00 - 21:30',
    category: '家居日用'
  },
  {
    name: '上地环球购物',
    address: '北京市海淀区上地信息路28号',
    coords: [116.310, 40.040],
    todayVisitors: 1560,
    todaySales: 95600,
    rating: 4.3,
    topProducts: ['索尼相机', '大疆无人机', 'Switch游戏机'],
    openTime: '09:30 - 21:00',
    category: '数码电子'
  },
  {
    name: '学院路优品汇',
    address: '北京市海淀区学院路38号',
    coords: [116.360, 39.975],
    todayVisitors: 2100,
    todaySales: 156300,
    rating: 4.4,
    topProducts: ['考研资料', 'Kindle', '罗技键盘'],
    openTime: '09:00 - 21:00',
    category: '文体教育'
  },
  {
    name: '颐和园商业街',
    address: '北京市海淀区颐和园路5号',
    coords: [116.275, 39.998],
    todayVisitors: 3560,
    todaySales: 267800,
    rating: 4.8,
    topProducts: ['北京特产', '老北京布鞋', '景泰蓝工艺品'],
    openTime: '08:30 - 20:00',
    category: '文体教育'
  }
];

// ===== 购买人数据 =====
export const buyers = [
  {
    name: '张伟',
    avatar: '张',
    totalSpent: 28650,
    purchaseCount: 12,
    color: '#e8863a',
    trajectory: ['中关村商厦', '五道口购物中心', '海淀万柳华联', '学院路优品汇']
  },
  {
    name: '李娜',
    avatar: '李',
    totalSpent: 35200,
    purchaseCount: 18,
    color: '#d4a24c',
    trajectory: ['金源燕莎Mall', '五道口购物中心', '清河万象汇', '颐和园商业街']
  },
  {
    name: '王磊',
    avatar: '王',
    totalSpent: 19800,
    purchaseCount: 8,
    color: '#8b6cc4',
    trajectory: ['中关村商厦', '上地环球购物', '清河万象汇']
  },
  {
    name: '赵敏',
    avatar: '赵',
    totalSpent: 42100,
    purchaseCount: 22,
    color: '#c06060',
    trajectory: ['金源燕莎Mall', '海淀万柳华联', '颐和园商业街', '五道口购物中心', '学院路优品汇']
  },
  {
    name: '陈晨',
    avatar: '陈',
    totalSpent: 15600,
    purchaseCount: 6,
    color: '#3dbd6e',
    trajectory: ['学院路优品汇', '中关村商厦']
  },
  {
    name: '刘洋',
    avatar: '刘',
    totalSpent: 31400,
    purchaseCount: 15,
    color: '#3a9ea8',
    trajectory: ['上地环球购物', '清河万象汇', '金源燕莎Mall', '海淀万柳华联']
  }
];

// ===== 购买记录 =====
export const purchases = [
  { id: 1, buyerName: '张伟', itemName: 'MacBook Pro 14寸', price: 14999, category: '数码电子', purchaseTime: '2026-05-08 09:23:15', shopName: '中关村商厦' },
  { id: 2, buyerName: '李娜', itemName: 'SK-II神仙水230ml', price: 1590, category: '美妆护肤', purchaseTime: '2026-05-08 09:45:32', shopName: '金源燕莎Mall' },
  { id: 3, buyerName: '赵敏', itemName: 'Dior真我香水', price: 1280, category: '美妆护肤', purchaseTime: '2026-05-08 10:02:18', shopName: '金源燕莎Mall' },
  { id: 4, buyerName: '王磊', itemName: '索尼A7M4相机', price: 16999, category: '数码电子', purchaseTime: '2026-05-08 10:15:44', shopName: '中关村商厦' },
  { id: 5, buyerName: '刘洋', itemName: '大疆Mini 4 Pro', price: 4788, category: '数码电子', purchaseTime: '2026-05-08 10:28:56', shopName: '上地环球购物' },
  { id: 6, buyerName: '陈晨', itemName: '考研英语真题全集', price: 89, category: '文体教育', purchaseTime: '2026-05-08 10:33:21', shopName: '学院路优品汇' },
  { id: 7, buyerName: '张伟', itemName: 'Nike Air Jordan 1', price: 1299, category: '服饰鞋包', purchaseTime: '2026-05-08 10:55:10', shopName: '五道口购物中心' },
  { id: 8, buyerName: '李娜', itemName: 'Levi\'s 501牛仔裤', price: 799, category: '服饰鞋包', purchaseTime: '2026-05-08 11:12:45', shopName: '五道口购物中心' },
  { id: 9, buyerName: '赵敏', itemName: '有机蔬果礼盒', price: 268, category: '食品饮料', purchaseTime: '2026-05-08 11:30:08', shopName: '海淀万柳华联' },
  { id: 10, buyerName: '王磊', itemName: 'Switch OLED', price: 2599, category: '数码电子', purchaseTime: '2026-05-08 11:48:33', shopName: '上地环球购物' },
  { id: 11, buyerName: '刘洋', itemName: '戴森V15吸尘器', price: 4990, category: '家居日用', purchaseTime: '2026-05-08 12:05:17', shopName: '清河万象汇' },
  { id: 12, buyerName: '张伟', itemName: '进口澳洲牛排套餐', price: 398, category: '食品饮料', purchaseTime: '2026-05-08 12:22:49', shopName: '海淀万柳华联' },
  { id: 13, buyerName: '李娜', itemName: '无印良品香薰机', price: 580, category: '家居日用', purchaseTime: '2026-05-08 12:45:03', shopName: '清河万象汇' },
  { id: 14, buyerName: '赵敏', itemName: '景泰蓝花瓶', price: 1680, category: '文体教育', purchaseTime: '2026-05-08 13:10:28', shopName: '颐和园商业街' },
  { id: 15, buyerName: '陈晨', itemName: 'AirPods Pro 2', price: 1799, category: '数码电子', purchaseTime: '2026-05-08 13:35:52', shopName: '中关村商厦' },
  { id: 16, buyerName: '刘洋', itemName: 'YSL小金条口红', price: 320, category: '美妆护肤', purchaseTime: '2026-05-08 14:02:14', shopName: '金源燕莎Mall' },
  { id: 17, buyerName: '张伟', itemName: 'Kindle Paperwhite', price: 998, category: '文体教育', purchaseTime: '2026-05-08 14:25:37', shopName: '学院路优品汇' },
  { id: 18, buyerName: '李娜', itemName: '老北京布鞋', price: 199, category: '服饰鞋包', purchaseTime: '2026-05-08 14:50:41', shopName: '颐和园商业街' },
  { id: 19, buyerName: '赵敏', itemName: 'Uniqlo联名T恤', price: 149, category: '服饰鞋包', purchaseTime: '2026-05-08 15:15:09', shopName: '五道口购物中心' },
  { id: 20, buyerName: '王磊', itemName: '宜家BILLY书架', price: 499, category: '家居日用', purchaseTime: '2026-05-08 15:40:23', shopName: '清河万象汇' },
  { id: 21, buyerName: '赵敏', itemName: '罗技G Pro键盘', price: 699, category: '文体教育', purchaseTime: '2026-05-08 16:05:56', shopName: '学院路优品汇' },
  { id: 22, buyerName: '刘洋', itemName: '精酿啤酒礼盒', price: 188, category: '食品饮料', purchaseTime: '2026-05-08 16:30:42', shopName: '海淀万柳华联' },
];

// ===== 24h 销售趋势 =====
export const hourlyTrend = [
  820, 1200, 600, 350, 280, 420,
  1580, 3200, 5800, 8200, 9500, 10200,
  11800, 10500, 9200, 8800, 9600, 12400,
  14200, 13800, 11000, 8200, 4500, 2100
];

// ===== 品类销售数据 =====
export const categoryData = [
  { name: '数码电子', value: 42385, color: '#e8863a' },
  { name: '服饰鞋包', value: 28650, color: '#d4a24c' },
  { name: '食品饮料', value: 18540, color: '#3dbd6e' },
  { name: '美妆护肤', value: 35200, color: '#c06060' },
  { name: '家居日用', value: 22100, color: '#8b6cc4' },
  { name: '文体教育', value: 15600, color: '#3a9ea8' }
];

// ===== 雷达图数据 =====
export const radarData = {
  indicators: [
    { name: '工作日早晨', max: 100 },
    { name: '工作日中午', max: 100 },
    { name: '工作日晚间', max: 100 },
    { name: '周末早晨', max: 100 },
    { name: '周末中午', max: 100 },
    { name: '周末晚间', max: 100 }
  ],
  series: [
    { name: '购物中心', values: [35, 65, 80, 70, 90, 95], color: '#e8863a' },
    { name: '专卖店', values: [45, 55, 70, 50, 75, 60], color: '#3a9ea8' },
    { name: '超市/便利', values: [80, 90, 60, 65, 85, 45], color: '#8b6cc4' }
  ]
};

// ===== KPI 数据 =====
export const kpiData = [
  { label: '今日总销售额', value: 1286450, prefix: '¥', trend: 12.5, unit: '' },
  { label: '今日总订单数', value: 8462, prefix: '', trend: 8.3, unit: '笔' },
  { label: '活跃购买人数', value: 3215, prefix: '', trend: -2.1, unit: '人' },
  { label: '在线商铺', value: 8, prefix: '', trend: 0, unit: '/8' }
];

// 用于模拟实时流水的新商品列表
export const randomItems = [
  { name: 'Apple Watch Ultra', price: 6299, category: '数码电子' },
  { name: '兰蔻小黑瓶', price: 890, category: '美妆护肤' },
  { name: '三只松鼠大礼包', price: 128, category: '食品饮料' },
  { name: '优衣库羽绒服', price: 599, category: '服饰鞋包' },
  { name: '小米台灯Pro', price: 249, category: '家居日用' },
  { name: '新概念英语全套', price: 156, category: '文体教育' },
  { name: 'Sony WH-1000XM5', price: 2499, category: '数码电子' },
  { name: 'Gucci围巾', price: 3200, category: '服饰鞋包' },
  { name: '茅台飞天53度', price: 1499, category: '食品饮料' },
  { name: '雅诗兰黛眼霜', price: 720, category: '美妆护肤' },
  { name: '戴森吹风机', price: 3190, category: '家居日用' },
  { name: '故宫文创礼盒', price: 298, category: '文体教育' },
];
