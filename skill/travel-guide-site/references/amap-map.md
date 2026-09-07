# 高德地图权威指南（Amap Authoritative Guide）

本 skill 的灵魂是「高德地图实景交互 + 一键导航」。本文是坐标、瓦片、导航链接的唯一事实来源（single source of truth）。**生成任何攻略网站前必读。**

---

## 1. 坐标系：GCJ-02 是铁律

中国大陆所有坐标必须使用 **GCJ-02（火星坐标系）**——高德、腾讯、百度地图 App 使用的坐标系。

| 来源 | 坐标系 | 能否直接用 |
|------|--------|-----------|
| 高德地图 / 高德坐标拾取器 | GCJ-02 | ✅ 直接用 |
| 腾讯地图 | GCJ-02 | ✅ 直接用 |
| 百度地图 | BD-09 | ❌ 需转换（偏移更大） |
| Google 地图、GPS 设备、OpenStreetMap、维基百科坐标 | WGS-84 | ❌ 需转换（偏移 300-600 米） |

**用错坐标系的症状**：导航链接打开后定位到马路对面/河对岸/空地——用户会说"定位错了"，其实是坐标系错了。

### 获取正确坐标的三种方法（按优先级）

1. **高德坐标拾取器（推荐）**：浏览器打开 `https://lbs.amap.com/tools/picker`，搜索或点选地点，右侧显示 `lng,lat`（注意是**经度在前**）。模板数据里写 `lat: <后一个数>, lng: <前一个数>`
2. **高德网页版反查**：`https://ditu.amap.com` 搜索地点 → 分享/复制链接，URL 中含 `lng,lat`
3. **知识库近似坐标 + 人工核验**：知名景点用记忆中的坐标，但必须在交付说明里提醒用户在拾取器里抽查 2-3 个点

### WGS-84 → GCJ-02 转换（无法访问拾取器时）

让 AI 用以下公式转换（偏差 <2m，可直接嵌入临时脚本）：

```javascript
function wgs2gcj(wgsLat, wgsLng) {
  var a = 6378245.0, ee = 0.00669342162296594323;
  function transformLat(x, y) {
    var ret = -100.0 + 2.0*x + 3.0*y + 0.2*y*y + 0.1*x*y + 0.2*Math.sqrt(Math.abs(x));
    ret += (20.0*Math.sin(6.0*x*Math.PI) + 20.0*Math.sin(2.0*x*Math.PI)) * 2.0/3.0;
    ret += (20.0*Math.sin(y*Math.PI) + 40.0*Math.sin(y/3.0*Math.PI)) * 2.0/3.0;
    ret += (160.0*Math.sin(y/12.0*Math.PI) + 320*Math.sin(y*Math.PI/30.0)) * 2.0/3.0;
    return ret;
  }
  function transformLng(x, y) {
    var ret = 300.0 + x + 2.0*y + 0.1*x*x + 0.1*x*y + 0.1*Math.sqrt(Math.abs(x));
    ret += (20.0*Math.sin(6.0*x*Math.PI) + 20.0*Math.sin(2.0*x*Math.PI)) * 2.0/3.0;
    ret += (20.0*Math.sin(x*Math.PI) + 40.0*Math.sin(x/3.0*Math.PI)) * 2.0/3.0;
    ret += (150.0*Math.sin(x/12.0*Math.PI) + 300.0*Math.sin(x/30.0*Math.PI)) * 2.0/3.0;
    return ret;
  }
  var dLat = transformLat(wgsLng-105.0, wgsLat-35.0);
  var dLng = transformLng(wgsLng-105.0, wgsLat-35.0);
  var radLat = wgsLat/180.0*Math.PI, magic = Math.sin(radLat);
  magic = 1 - ee*magic*magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat*180.0)/((a*(1-ee))/(magic*sqrtMagic)*Math.PI);
  dLng = (dLng*180.0)/(a/sqrtMagic*Math.cos(radLat)*Math.PI);
  return { lat: wgsLat + dLat, lng: wgsLng + dLng };
}
```

### 经纬度顺序陷阱（最高频错误）

- 拾取器输出：`120.155070,30.274085`（**lng 在前**）
- 模板数据：`lat: 30.274085, lng: 120.155070`（**lat 在前**）
- 导航链接 to 参数：`120.155070,30.274085`（**lng 在前**）
- Leaflet 地图：`[30.274085, 120.155070]`（**lat 在前**）

中国范围校验（verify.js 自动执行）：lat ∈ [3, 54]，lng ∈ [73, 136]。颠倒会立刻报错。

---

## 2. 地图瓦片：为什么地图会空白，如何避免

模板使用高德标准瓦片，这段配置**一个字符都不能改**：

```javascript
L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
  subdomains: ['1', '2', '3', '4'],   // 必须是 1-4，少了地图空白
  attribution: '&copy; 高德地图 AutoNavi',
  maxZoom: 19,
})
```

**地图空白排查表**（按出现频率排序）：

| 症状 | 原因 | 解决 |
|------|------|------|
| 整片灰色空白 | `subdomains` 被删/改 | 恢复为 `['1','2','3','4']` |
| 整片空白 | 瓦片 URL 被改动 | 恢复 `webrd0{s}.is.autonavi.com/appmaptile?...` |
| 地图不显示，报 `L is not defined` | Leaflet CDN（unpkg）未加载或断网 | 确认 `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">` 在最前；换 `cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js` |
| 地图只显示一小块/中心错 | cities 的 lat/lng 写颠倒 | 跑 verify.js 会报"超出中国范围" |
| 标记点位置飘到河里/路对面 | 用了 WGS-84 坐标 | 见上文坐标系章节 |
| 本地 file:// 打开正常，部署后瓦片加载慢 | 正常，瓦片按需加载 | 稍等；或检查部署平台是否有资源防盗链 |
| zoom 后瓦片模糊 | maxZoom 被改小 | 保持 19 |

**模板内置的防空白机制**（不要移除）：
- `initLeafletMap` 里 `if (typeof L === 'undefined') return;` —— Leaflet 加载失败时整站其余部分照常渲染，不会白屏崩溃
- `fitBounds(allCityBounds.pad(0.35))` —— 初始视野自动适配所有城市，多城市路线不会被裁掉

---

## 3. 导航链接：格式与参数

模板的 `amapNav` 函数（已内置，勿改）：

```javascript
'https://uri.amap.com/navigation?to=' + lng + ',' + lat + ',' + encodeURIComponent(name) + '&mode=car&policy=1&callnative=1&src=travel_guide'
```

参数说明：
- `to=lng,lat,name`：目的地（**经度在前**），name 会显示在导航确认页
- `callnative=1`：手机上直接唤起高德 App（未装则跳网页版）——这是"随手点开就能导航"的关键
- `mode=car&policy=1`：驾车+推荐路线
- 起点不传 = 自动取用户当前位置，无需定位授权

**导航定位准确性 = 坐标准确性**。名称建议包含可识别后缀（如"灵隐寺·飞来峰"），提高高德 POI 匹配成功率。

**哪些地方必须带导航链接**（模板已实现）：每个景点卡片、每家餐厅、每个酒店、每个车站/机场。

---

## 4. 实景交互地图的行为设计（模板已内置）

- 城市大标签：红色城市名，白描边，随缩放常显
- 城际交通虚线：`transportRoutes` 数据驱动，hover 显示方式/时长/价格 tooltip
- 景点标记：按 `type` 区分图标（view/ticket/food/station/hotel），点击弹 info 窗含导航链接
- 快捷定位按钮：每城一个，点击 `flyTo` 平滑飞到该城 zoom 12
- 每日路线折线：`days[].route` 数组连线，颜色取当日城市色
- 美食图层开关：独立 toggle，不与景点混淆

---

## 5. 交通信息真实性守则

- 高铁：车次可写"建议上午出发车次，以 12306 为准"，**不要编造具体车次号**（除非用户提供了实际订单信息）
- 大巴：写"约 20-30 分钟一趟"这类频次区间
- 打车：写"约 88km · 1h13min · 需加高速费"这类估算
- 门票：查不到精确值写"约 70-80 元"
- 所有不确定的数字，在 `budget.note` 或卡片 `desc` 里注明"以现场/官方为准"
