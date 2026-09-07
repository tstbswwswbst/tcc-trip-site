# 设计系统与主题预设（Design System）

网站的第一竞争力是**美观**。模板的美感来自一套固定的设计语言——不要破坏它，只需选对主题色和写好文案。

---

## 1. 模板的设计语言（为什么它好看）

| 要素 | 实现 | 生成时必须保持 |
|------|------|----------------|
| 字体层级 | 标题衬线 `Noto Serif SC`（书卷气）+ 正文无衬线 `Noto Sans SC` | 不要改字体栈；标题的 `letter-spacing:.1em` 留白节奏是刻意的 |
| 纸色底 | 页面底色是暖纸色 `--paper`（不是纯白），内容卡片才是纯白 | theme 的 paper 系三色要同族递进（亮→深 3 档） |
| Hero 深色开场 | 深色渐变 + 白字 + 底部山峦剪影，首屏即定调 | heroGradient 第 1 色最深、第 3 色渐入主色；mountains 3 色与主色同族 |
| 大间距分区 | 每个区块 80px+ 垂直留白、居中的 section-header（小标签+大标题+副题） | 不要缩小 section 间距 |
| 卡片语言 | 白卡 + 细边框 + 8-12px 圆角 + 悬浮微上移 + 左侧色条（城市色） | 城市色通过 cities[].color 自动注入 |
| 图标 | Font Awesome 实心图标 + emoji 点缀 | 景点/餐厅用 emoji 做记忆点，保持每类一致 |
| 移动优先 | 断点 ~768px 单列堆叠、汉堡菜单、地图高度自适应 | 生成后必须过一遍手机宽度检查 |

## 2. 主题预设（复制进 theme 字段即可）

选主题：**跟目的地气质走**——水乡用青、古都用红金、海岛用蓝、大漠用暖沙、雪国用冷蓝灰。

### 水墨江南（默认）—— 苏杭 / 江浙古镇 / 徽州
```javascript
theme: {
  primary: '#2c8c99', primaryLight: '#5dbfc7', primaryDark: '#1a6068',
  secondary: '#c44536', secondaryLight: '#e07856',
  accent: '#4a7c59', accentLight: '#7ba88a',
  ink: '#1a1a2e', inkLight: '#2d2d44',
  paper: '#f7f3ee', paperDark: '#ebe5db', paperDarker: '#d9d0c4',
  heroGradient: ['#1a1a2e', '#16213e', '#2c8c99'],
  mountains: ['#2c8c99', '#1a6068', '#1a1a2e'],
},
```

### 古都风韵 —— 北京 / 西安 / 洛阳 / 南京
```javascript
theme: {
  primary: '#8e2323', primaryLight: '#c05252', primaryDark: '#5e1616',
  secondary: '#b8860b', secondaryLight: '#d4a938',
  accent: '#2f4858', accentLight: '#5d7a8c',
  ink: '#26170f', inkLight: '#3d2a1e',
  paper: '#f9f4ec', paperDark: '#efe5d3', paperDarker: '#ddd0b8',
  heroGradient: ['#26170f', '#3d1f14', '#8e2323'],
  mountains: ['#8e2323', '#5e1616', '#26170f'],
},
```

### 海滨假日 —— 三亚 / 青岛 / 厦门 / 威海
```javascript
theme: {
  primary: '#0277bd', primaryLight: '#4fa3d8', primaryDark: '#015083',
  secondary: '#ff8f3d', secondaryLight: '#ffb37a',
  accent: '#26a69a', accentLight: '#64c7be',
  ink: '#0d2b3e', inkLight: '#1d4059',
  paper: '#f2f8fb', paperDark: '#e0eef5', paperDarker: '#c6dbe7',
  heroGradient: ['#0d2b3e', '#0a4d74', '#0277bd'],
  mountains: ['#0277bd', '#015083', '#0d2b3e'],
},
```

### 大漠孤烟 —— 敦煌 / 青海湖 / 新疆 / 中卫
```javascript
theme: {
  primary: '#c17a3c', primaryLight: '#e0a56e', primaryDark: '#8f5724',
  secondary: '#4a6b8a', secondaryLight: '#7c99b3',
  accent: '#8a9a5b', accentLight: '#b4bf8e',
  ink: '#2e2016', inkLight: '#463426',
  paper: '#faf4ea', paperDark: '#f0e4d0', paperDarker: '#e0cdae',
  heroGradient: ['#2e2016', '#4d3320', '#c17a3c'],
  mountains: ['#c17a3c', '#8f5724', '#2e2016'],
},
```

### 雪国森林 —— 哈尔滨 / 漠河 / 长白山 / 阿勒泰
```javascript
theme: {
  primary: '#3d6b6b', primaryLight: '#6d9a9a', primaryDark: '#264747',
  secondary: '#b34a4a', secondaryLight: '#d17e7e',
  accent: '#5b7d9e', accentLight: '#8ba7c2',
  ink: '#1c2b33', inkLight: '#2e4350',
  paper: '#f4f7f8', paperDark: '#e5ecee', paperDarker: '#ccd9de',
  heroGradient: ['#1c2b33', '#2c4a52', '#3d6b6b'],
  mountains: ['#3d6b6b', '#264747', '#1c2b33'],
},
```

### 蜀地烟火 —— 成都 / 重庆 / 乐山
```javascript
theme: {
  primary: '#4a5568', primaryLight: '#7f8ca3', primaryDark: '#2d3748',
  secondary: '#c53030', secondaryLight: '#e06b6b',
  accent: '#b7791f', accentLight: '#d9a441',
  ink: '#1f2023', inkLight: '#34363b',
  paper: '#faf6f2', paperDark: '#f0e8df', paperDarker: '#dfd3c5',
  heroGradient: ['#1f2023', '#33202a', '#4a5568'],
  mountains: ['#4a5568', '#2d3748', '#1f2023'],
},
```

### 云贵多彩 —— 云南 / 贵州 / 桂林
```javascript
theme: {
  primary: '#5b8c5a', primaryLight: '#8ab588', primaryDark: '#3d6b3f',
  secondary: '#d4652f', secondaryLight: '#e8926a',
  accent: '#4a7b9e', accentLight: '#7ea5c2',
  ink: '#23301f', inkLight: '#384a33',
  paper: '#f6f5ee', paperDark: '#e9e8dc', paperDarker: '#d4d5c4',
  heroGradient: ['#23301f', '#31452c', '#5b8c5a'],
  mountains: ['#5b8c5a', '#3d6b3f', '#23301f'],
},
```

## 3. 自定义配色守则

需要新主题时按此推导，不要凭感觉乱配：

1. **primary**：从目的地的标志性色彩取（西湖的水青、故宫的墙红、青海湖的湖蓝），饱和度中低（衬线字 + 低饱和 = 高级感；高饱和 = 廉价感）
2. **light/dark 变体**：primaryLight ≈ 提亮 25%，primaryDark ≈ 加深 35%（可用取色器在同色相上移动）
3. **secondary**：primary 的对比补色（青配红、蓝配橙），只用于徽章和强调，面积要小
4. **paper 三档**：同族暖灰/冷灰，亮度差约 5% 一档；永远不要用纯白 `#ffffff` 做页面底
5. **heroGradient**：`[ink, 中间过渡色, primary]`，从暗到亮的对角线渐变（135deg）
6. **对比度自检**：primary 上的白字要清晰（WCAG AA 4.5:1）；paper 上的 ink 正文要柔和不刺眼
7. **城市色（cities[].color）**：从主题色系里拉开色相（如 青/红/绿），保证地图上多城标记可区分；单城行程直接用 primary

## 4. 文案美学（desc 字段）——数据美的另一半

用户对"信息质量"的感知 80% 来自文案。规则：

- **40-80 字**，一句话讲清"这是什么 + 为什么值得去 + 一个具体细节"
- ✅ 好文案：`世界文化遗产，杭州地标。断桥残雪、苏堤春晓等西湖十景闻名天下。`
- ❌ 坏文案：`很美的景点，非常值得一去，风景优美。`（全是空话，等于没写）
- 具体名词优先：写"白娘子传说发源地"不写"有历史文化底蕴"
- 有实操信息更好：`建议早起避开人潮` `学生证半价` `晚上更有氛围`
- 时间轴 activity 同理：写"断桥 → 白堤"不写"游览西湖"

## 5. emoji 使用规范

- 景点：与内容强相关（🏔️ 山、🌉 桥、🛕 寺、🏡 园林、🏖️ 海滩、🏮 古镇街区）
- 美食：菜系相关（🍜 面、🐟 鱼、🦆 鸭、🍡 小吃、🥟 点心）
- 交通：🚄 高铁 🚌 大巴 🚕 出租 🚗 自驾 ✈️ 飞机
- 住宿：⭐（模板自动用金色星标包裹）
- 每城 1-2 个"招牌" emoji 保持一致，避免满屏花哨
