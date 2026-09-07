# TRIP_DATA 数据规范（Data Schema）

模板 `assets/template.html` 是**全数据驱动**的单文件网站：城市、配色、地图范围、行程、美食、预算全部由 `<script>` 内的 `var TRIP_DATA = {...}` 对象决定。

**生成新攻略 = 只替换数据区**（从 `var TRIP_DATA = {` 到结尾顶格 `};`），模板其余部分一个字不改。

填写规则：
- 所有坐标必须 GCJ-02（见 `amap-map.md`），lat 纬度在前
- 所有字符串用单引号 `'`，不要用中文引号 `''`
- 数组最后一项后不留逗号；对象字段间用逗号分隔
- `city` 字段的值必须与 `cities[].name` **逐字一致**（verify.js 会交叉校验）
- 日期不确定时写相对格式（如 `'Day 1'`）；确定时写 `'7月20日'` + weekday

---

## 顶层结构总览

```javascript
var TRIP_DATA = {
  meta: {...},            // 站点元信息（标题、日期、人数）
  theme: {...},           // 全站配色（注入 CSS 变量）
  cities: [...],          // 城市列表（驱动地图视野/标签页/图例）
  transportRoutes: [...], // 地图上的城际交通虚线
  transportLegs: [...],   // 02 区块的交通方案卡片
  mapSpots: [...],       // 地图景点标记 + 03 区块景点卡片
  foodSpots: [...],      // 地图美食图层 + 美食指南
  days: [...],           // 逐日行程（时间轴/路线/预算）
  budget: {...},         // 预算表
  weather: {...},         // 天气提示
  packing: {...},        // 行李清单
  rainyDayPlan: [...],   // 雨天备选
  foodGuide: {...},      // 每城代表美食清单
};
```

---

## meta —— 站点元信息

```javascript
meta: {
  title: '江南行旅',                 // 导航栏/Hero/浏览器标签页主标题
  subtitle: '江浙沪 精华路线',        // Hero 副标题
  badge: '2026 暑期 · 毕业旅行',     // Hero 左上角徽章（出行主题）
  tagline: '杭州 · 乌镇 · 苏州 — 一条路线，三重江南',  // Hero 标语
  logoIcon: 'fa-water',             // 导航栏 Logo 图标（Font Awesome 类名）
  favicon: '🌊',                    // 浏览器标签页 emoji 图标
  dates: '2026.07.20 - 07.27',      // 日期范围文本
  days: 8, nights: 7, people: 8,    // 天/夜/人数（数字，用于统计条）
  transport: '高铁+大巴',           // 主要交通方式文本
  origin: '西安',                   // 出发地
  base: '杭州5晚+乌镇1晚+苏州1晚',   // 住宿分布摘要
},
```

## theme —— 全站配色

变量会注入 CSS，全站（导航/Hero/卡片/按钮）随之变色。色值取 hex。预设与选色守则见 `design-system.md`。

```javascript
theme: {
  primary: '#2c8c99', primaryLight: '#5dbfc7', primaryDark: '#1a6068',   // 主色（导航/Hero/地图强调）
  secondary: '#c44536', secondaryLight: '#e07856',                       // 副色（徽章/高亮）
  accent: '#4a7c59', accentLight: '#7ba88a',                             // 点缀色
  ink: '#1a1a2e', inkLight: '#2d2d44',                                  // 深色文字/深色块
  paper: '#f7f3ee', paperDark: '#ebe5db', paperDarker: '#d9d0c4',        // 纸色背景系
  heroGradient: ['#1a1a2e', '#16213e', '#2c8c99'],  // Hero 渐变（深→主色，3 色）
  mountains: ['#2c8c99', '#1a6068', '#1a1a2e'],     // Hero 底部山峦剪影 3 色
},
```

## cities —— 目的地城市列表（核心）

每个城市控制：地图大标签、初始视野（fitBounds 自动适配全部城市）、快捷定位按钮、景点标签页、图例、每日路线颜色。**城市顺序 = 行程顺序**。

> **⚠️ 出发地默认不进 cities**
>
> 常规表述（如"从北京出发去大同玩"）中，北京只是出发地：写进 `meta.origin` 和 `transportRoutes`/`transportLegs` 的 `from` 字段即可，**不要**写成 cities 的一项——否则 Hero/概览的路线会渲染成"北京→北京→大同→…"（重复），且出发地的景点标签页因没有数据而空白。
>
> 例外：用户明示要在出发地游玩（如"当天在北京玩半天再出发"）时，才把它列为城市之一。

> **⚠️ 跨县行程标注行政区划归属**
>
> 县属于哪个市要说清，避免把不并列的行政区写成并列。例如浑源县属大同市，而应县属**朔州市**（与大同并列）：若写成"大同、应县"并列会误导读者以为应县属大同。
>
> 推荐写法（二选一，不强制拆分）：
> - 拆分：`'大同（市内）'`、`'大同（浑源）'`、`'朔州（应县）'`
> - 合并：`'大同'`（市内+浑源的景点都收进来）+ `'朔州（应县）'`
>
> 注意：选定 name 后，`mapSpots/foodSpots/days/foodGuide` 中所有引用处必须与之**逐字一致**。

```javascript
cities: [
  { name: '杭州', en: 'Hangzhou',        // name 是全站关联键，多处引用必须逐字一致
    lat: 30.2741, lng: 120.1551,         // 城市中心坐标（GCJ-02）
    color: '#2c8c99',                    // 该城专属色（标签页/标记/路线都用它）
    icon: 'fa-water',                    // Font Awesome 图标
    tagline: '西湖 · 灵隐 · 西溪 · 运河', // 城市卡片标语
    description: '大本营住5晚。...',     // 城市卡片描述（60-100字）
    days: [0,1,2,3],                     // 在哪些行程日（Day 索引，从 0 起）
    nights: '5晚(7.20-7.24)' },          // 住几晚（文本）
],
```

多城市注意：各城 `color` 要区分度明显（如同行 3 城取 青/红/绿）。

## transportRoutes —— 地图城际虚线

```javascript
transportRoutes: [
  { from: '西安', to: '杭州',            // 端点：城市名 或 mapSpots/transportLegs 中的地名
    mode: '高铁G1896',                  // 交通方式（tooltip 显示）
    time: '约7时55分', distance: '约1500km',
    color: '#1565c0',                   // 虚线颜色（蓝=高铁 橙=大巴 绿=地铁）
    note: '西安北08:32→杭州东16:27 · ¥730.5' },  // tooltip 补充
],
```

from/to 若在 cities、transportLegs（含 fromLat/fromLng 或 toLat/toLng）、mapSpots 中都找不到，该段虚线会被静默跳过（不报错）。

## transportLegs —— 交通方案卡片

```javascript
transportLegs: [
  { icon: '🚄', title: '去程高铁', route: '西安北 → 杭州东',
    from: '西安', to: '杭州',            // 关联城市名
    fromLat: 34.3728, fromLng: 108.9397, // 出发站坐标（跨城长途才需要）
    toLat: 30.2911, toLng: 120.2126,     // 到达站坐标
    options: [                           // 该段的所有备选方式
      { type: '高铁G1896', cost: '¥730.5', detail: '西安北 08:32 → 杭州东 16:27 · 历时7时55分', icon: '🚄' },
      { type: '大巴', cost: '¥29/人', detail: '约1.5小时 · 20分钟一趟', icon: '🚌' },
    ] },
],
```

## mapSpots —— 地图景点标记

`type` 决定标记样式：

| type | 样式 | 说明 |
|------|------|------|
| `view` | 城市色水滴 | 免费观光点 |
| `ticket` | 城市色水滴 | 收费景点 |
| `food` | 城市色水滴 | 美食街区（单店放 foodSpots） |
| `station` | 小圆圈 | 车站/机场；**不进景点列表、不进每日路线** |
| `hotel` | 金色星标 | 住宿 |
| `pokemon` | 金色特殊标 | 特色打卡点（弹窗类型标签取 `label` 字段，如 '宝可梦'） |

```javascript
mapSpots: [
  { name: '西湖', city: '杭州',            // city 必须与 cities[].name 一致
    lat: 30.2592, lng: 120.1683,
    type: 'view', emoji: '🏞️',            // emoji 显示在标记水滴与卡片标题
    ticket: '免费',                        // '—' 表示不显示该行
    hours: '全天开放',
    desc: '世界文化遗产，杭州地标。断桥残雪…（40-80字，具体有画面感）' },
  { name: '宝可梦官方卡牌道馆杭州', city: '杭州', lat: 30.2490, lng: 120.1720,
    type: 'pokemon', label: '宝可梦', emoji: '⚡', ticket: '—', hours: '10:00-22:00',
    desc: '地址：上城区延安路90号工联cc商场b1楼。' },
],
```

每个城市建议：景点 5-10 个（含 1-2 个免票街区）、车站 1-2 个、酒店 1 个。

## foodSpots —— 美食（独立图层）

```javascript
foodSpots: [
  { name: '知味观（湖滨总店）', city: '杭州', lat: 30.2555, lng: 120.1685,
    emoji: '🍜', price: '40-60元',         // 人均
    desc: '百年老字号杭帮菜…（说明为什么值得去）',
    dishes: ['片儿川', '猫耳朵', '幸福双'] },  // 招牌菜（显示为小标签）
],
```

## days —— 逐日行程（内容最重的区块）

```javascript
days: [
  { day: 0,                              // 从 0 连续递增
    title: '西安 → 杭州',                // 当日主题
    date: '7月20日', weekday: '周一',
    city: '杭州',                        // 当日所在城市（必须 ∈ cities[].name）
    color: '#78909c',                    // 当日时间轴颜色（交通日用灰，游玩日用城市色）
    summary: '高铁G1896出发，下午到达…',   // 一句话总结
    highlights: ['高铁G1896', '下午到杭州东', '入住'],  // 亮点标签 3-7 个
    budget: { transport: 731, food: 55, tickets: 0, total: 786 },  // 当日预算（元/人）
    timeline: [                          // 时间轴（自上而下）
      { time: '08:32', activity: '西安北出发，高铁G1896' },
      { time: '16:27', activity: '到达杭州东站' },
    ],
    tips: '到达后坐地铁进城…（该日实用提示）',
    route: [[34.3728,108.9397],[30.2911,120.2126]],   // 当日路线折线 [lat,lng] 数组
    locations: [                          // 当日关键地点（在每日路线图层显示）
      { name: '西安北站', lat: 34.3728, lng: 108.9397, description: '高铁出发 · G1896(08:32)' },
      { name: '杭州东站', lat: 30.2911, lng: 120.2126, description: '高铁到达 · 地铁进城' },
    ] },
],
```

要点：
- `locations[].name` 若与 `mapSpots[].name` 同名，会自动复用其标记样式；同名时坐标要保持一致
- `route` 点序 = 移动顺序；至少 2 个点才有折线
- 交通日（纯赶路）color 用 `#78909c` 灰，游玩日用城市色

## budget —— 预算表

```javascript
budget: {
  note: '预算口径说明（含大交通与否、人均还是全包）',
  categories: [
    { item: '去程高铁G1896（西安北→杭州东）', low: 731, high: 731, note: '08:32→16:27 · 已选定' },
    { item: '杭州市内交通', low: 100, high: 300, note: '地铁为主，少量打车' },
  ],
  totalLow: 3403, totalHigh: 4653,        // 自动核对：应≈各 categories low/high 之和
},
```

预算敏感行程：把收费景点集中放"可选"条目，note 里给免票替代方案。

## weather / packing / rainyDayPlan / foodGuide —— 辅助区块

```javascript
weather: { title: '7月天气预警', temp: '32-38°C', condition: '高温潮湿 · 午后雷阵雨',
           uv: '极强', tips: ['每人每天至少带1瓶水出门', '...'] },
packing: { must: ['身份证', '学生证', ...],          // 必带
           sun: ['防晒霜', '遮阳帽', ...],            // 季节性（冬装则改保暖项，键名不变）
           medicine: ['藿香正气类', ...], hotel: ['一次性内裤/袜子', ...] },
rainyDayPlan: [ { original: '西湖暴走', alternative: '浙江省博物馆/商场' }, ... ],
foodGuide: { '杭州': ['片儿川', '葱包桧', ...],       // 键 = cities[].name
             '苏州': ['松鼠桂鱼', ...] },
```

---

## 最小可用数据量（别偷工减料）

| 区块 | 最少 | 推荐 |
|------|------|------|
| cities | 1 | 1-4 |
| mapSpots | 每城 4 | 每城 6-12 |
| foodSpots | 每城 3 | 每城 4-8 |
| days | 天数一致 | 同总天数 |
| transportLegs | 1（去程） | 去程+城际+返程 |
| 每日 timeline | 5 条 | 6-12 条 |

数据填完后运行 `node scripts/verify.js <文件>` 全 PASS 再交付。
