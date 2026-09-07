---
name: "travel-guide-site"
description: "生成精美可分享的单文件旅游攻略网站（高德地图实景交互+导航链接+一键部署）。当用户想制作旅游攻略网页、行程网站、旅行路线可视化，或提到'攻略网站''旅游网页''行程地图'时调用。Generate beautiful single-file travel guide websites with interactive Amap maps, nav links and one-click deployment."
version: "1.0.0"
category: "web-development"
platforms: ["trae", "claude", "glm", "workbuddy", "cursor"]
license: "MIT"
---

# 旅游攻略网站生成器（Travel Guide Site Maker）

把一次旅行做成一个精美的、可分享的单文件 HTML 攻略网站：高德实景交互地图 + 逐日行程时间轴 + 交通方案 + 美食指南 + 预算表，并一键部署到公网。

**核心资产**（本 skill 所在目录）：

| 文件 | 用途 |
|------|------|
| `assets/template.html` | 唯一模板。整站由其中 `TRIP_DATA` 对象驱动，生成新攻略**只替换数据区，不改任何代码** |
| `scripts/verify.js` | 生成后自检（语法/坐标/城市交叉引用/地图配置），必须全 PASS |
| `references/data-schema.md` | TRIP_DATA 全字段规范（**填写数据前必读**） |
| `references/amap-map.md` | 高德坐标获取、瓦片、导航链接的权威规则（**找坐标前必读**） |
| `references/design-system.md` | 主题配色预设与美观性守则 |
| `references/deployment.md` | 部署指南（Netlify Drop / GitHub Pages / Surge） |

---

## 工作流程（五步）

### 第 1 步：需求采集

用户最少只需给出：**出发地、旅游地（可多个）、天数**。其余由你补充。缺项时用一句话追问（不要连环提问）：

| 信息 | 必要性 | 缺省处理 |
|------|--------|----------|
| 出发地 / 回程地 | 必要 | 追问一次 |
| 旅游地（1~N 个） | 必要 | — |
| 天数（可为范围如"5-7天"） | 必要 | 范围时自选中位数并在方案里说明 |
| 出行日期 | 可选 | 用"Day 1 / Day 2"，dates 留空 |
| 人数 | 可选 | 默认 2 人 |
| 预算档位 | 可选 | 默认经济型 |
| 偏好 | 可选 | 默认经典路线 |

**个性化定制规则**（用户提出偏好时调整选点策略）：
- **预算敏感** → 优先免票景点（type:'view', ticket:'免费'，如城市公园、历史街区、夜景）；门票贵的景点列为"可选"；预算表给 low/high 区间并给省钱建议
- **打卡拍照** → 多选视觉地标（地标建筑、观景台、网红街区），desc 里写拍照机位建议
- **美食向** → foodSpots 加密（每城 6-10 家），days 时间轴里安排正餐节点
- **带娃/老人** → 每天景点 ≤3 个，午休写进 timeline

### 第 2 步：调研与选点

1. **先划定 cities 范围——默认只放目的地城市**：常规表述（"从 A 出发去 B/C 玩"）中 A 只是出发地，写进 `meta.origin` 即可，**不进 cities**（否则路线渲染成"北京→北京→大同…"且出发地景点标签页空白）。仅当用户明示要在出发地游玩（如"当天在本地玩完再出发"）才把它列为城市之一
2. 逐城市筛选景点（经典必去 + 特色小众），每城 5-10 个；美食每城 4-8 家
3. **坐标必须使用 GCJ-02 火星坐标系**（高德坐标系）。获取方法与易错点见 `references/amap-map.md`——这是本 skill 最重要的正确性规则，坐标错了导航就废了
4. 查证城际交通方式（高铁/大巴/地铁）与大致价格、时长
5. 按天数分配城市停留夜数，排每日行程（上午/下午/晚上节奏合理，避免一天塞 5 个景点）。跨县行程的城市命名要标注行政区划归属（如"大同（市内）/大同（浑源）/朔州（应县）"，或合并为"大同"+"朔州（应县）"），避免把不并列的行政区写成并列；拆分与否不强制，详见 `references/data-schema.md` 的 cities 章节

### 第 3 步：生成网站

1. 完整复制 `assets/template.html` 到输出目录（如 `my-trip/index.html`），**不要截断**
2. **只替换** `var TRIP_DATA = {` 到结尾顶格 `};` 之间的数据区，字段规范见 `references/data-schema.md`
3. 按目的地气质选主题预设（水乡青/古都红/海滨蓝…），见 `references/design-system.md`
4. 数据区之外的一个字都不要动——模板所有逻辑（地图、标签页、时间轴、预算表）都是数据驱动的，改代码反而会引入 bug

### 第 4 步：自检（必须执行，不可跳过）

```
node scripts/verify.js <生成的html路径>
```

**跳过自检直接交付/部署是被禁止的**——实测中未经自检的版本出现过地图背景空白、景点/美食标注缺失、每日路线丢失等问题。
输出 `PASS` 才能进入部署；出现 `FAIL` 按提示修复（坐标超范围=经纬度颠倒，city 不在 cities 列表=名字不一致等）。
出现 `WARN` 时自查是否为有意设计（如用户明示要在出发地游玩才把出发地放进 cities），无意混入则修复后重新校验。
若环境无 Node.js，改用人工核对：每个 lat 在 3-54、lng 在 73-136 之间；所有 mapSpots/foodSpots/days 的 city 与 cities[].name 完全一致；出发地未混入 cities。

### 第 5 步：部署分享

按 `references/deployment.md` 部署（推荐顺序：Netlify Drop 零安装 → GitHub Pages → Surge）。
部署后必须验证两件事：① 地图能加载出底图（不空白）；② 点一个"高德地图导航"链接确认定位正确。发现问题按 deployment.md 的故障排查表处理。

---

## 硬性规则（违反即返工）

1. **地图不能空白**：模板中瓦片地址 `webrd0{s}.is.autonavi.com` 与 `subdomains:['1','2','3','4']` 是刻意配置，任何情况下不得改动
2. **坐标用 GCJ-02**：从 GPS 设备、Google/Bing/OpenStreetMap 得到的是 WGS-84，直接用会偏 300-600 米。转换或重新拾取，详见 `references/amap-map.md`
3. **导航链接格式不变**：`uri.amap.com/navigation?to=经度,纬度,名称&mode=car&policy=1&callnative=1&src=travel_guide`（注意 to 参数是 `经度,纬度` 顺序）
4. **美观性优先**：保持模板的字体层级、留白节奏、卡片风格；desc 文案 40-80 字，具体、有画面感，不写空话
5. **数据真实性**：门票/班次/价格查不到确切值时给区间（如"约70-80元"）并在 note 里标注"以现场为准"，不要编造精确数字
