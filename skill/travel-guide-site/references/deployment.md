# 部署指南（Deployment）

攻略网站是**单文件静态页**（一个 index.html），无构建、无后端、无依赖安装，任何静态托管都能跑。

**部署前必过三关**：
1. `node scripts/verify.js <index.html路径>` 全 PASS（无 Node 则人工核对坐标与城市名）
2. 本地双击 index.html 用浏览器打开，确认：地图有底图、点导航链接能唤起高德、手机宽度下布局正常
3. 文件名是 `index.html`（不是 template.html / 攻略.html）——大多数托管平台只认这个名字当首页

---

## 方案选择（AI 执行时按此决策）

```
用户会拖拽网页/想最快分享       → 方案 A Netlify Drop（教用户拖文件夹，30 秒上线）
环境有 gh CLI 且已登录          → 方案 B GitHub Pages（可脚本化完成）
环境有 Node.js                 → 方案 C Surge（一条命令）
用户要长期稳定域名             → 方案 B（github.io 可控可自定义）
都不满足                       → 让用户选：装 Node 用 C，或用浏览器走 A
```

探测命令（Windows PowerShell 注意：**用 `;` 不用 `&&`**，老版本 PowerShell 不支持 `&&`）：

```powershell
node -v        # 有输出 → 有 Node.js
gh auth status # 已登录 → 可用 GitHub Pages
```

---

## 方案 A：Netlify Drop —— 零安装，浏览器拖拽即上线（推荐给小白）

1. 浏览器打开 `https://app.netlify.com/drop`
2. 把**包含 index.html 的文件夹**整个拖进页面（拖单文件也行，拖文件夹更稳）
3. 等待 10 秒，得到 `https://随机名.netlify.app` 公网地址，可直接微信分享

注意：
- 未注册账号也能部署，但**站点 24 小时后可能被回收**；注册（免费，邮箱即可）后永久保留
- 想改随机域名：Site settings → Change site name
- 此方案需要用户本人操作浏览器；AI 的角色是准备好文件夹并给出上面三步

## 方案 B：GitHub Pages —— 长期稳定，适合开源分享

### B1. 有 gh CLI（可全自动，AI 首选）

```powershell
# 在网站文件夹内（含 index.html）
git init
git add index.html
git commit -m "travel guide site"
gh repo create my-trip-guide --public --source=. --push
gh api repos/{owner}/my-trip-guide/pages -X POST -f "build_type=workflow" 2>$null
# 若上面 API 不适用，改用legacy源分支方式：
gh api repos/{owner}/my-trip-guide/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

部署成功后地址为 `https://<用户名>.github.io/my-trip-guide/`（首次生效需 1-3 分钟，404 就是还没生效，等一下再刷新）。

### B2. 无 CLI（网页手动，5 分钟）

1. github.com → New repository → 名字如 `my-trip-guide` → Public → Create
2. Add file → Upload files → 拖入 index.html → Commit
3. Settings → Pages → Source 选 `main` 分支 `/ (root)` → Save
4. 等 1-3 分钟，访问 `https://<用户名>.github.io/my-trip-guide/`

### GitHub Pages 故障排查

| 现象 | 原因与解决 |
|------|-----------|
| 404 | Pages 未生效（等 3 分钟）或 Source 没设；检查 Settings → Pages 状态条 |
| 404 但文件在 | 仓库名含大写或中文 → URL 区分大小写；index.html 必须在仓库根目录 |
| 页面样式乱 | 检查是不是传成了 template 副本且 TRIP_DATA 填错 |
| 想防 Jekyll 处理 | 上传一个空的 `.nojekyll` 文件到仓库根目录 |

## 方案 C：Surge —— 有 Node 就一条命令

```powershell
npm install -g surge
surge .  my-trip-guide.surge.sh     # 目录 . + 自定义子域名
```

- 首次运行要求输入邮箱+密码注册（免费）——**交互式，AI 无法代输**，让用户输一次，之后凭据存在 `~/.surge/config`（Windows 在 `C:\Users\<用户>\.surge\`）
- 已登录后可完全脚本化：`surge . xxx.surge.sh`
- 域名先到先得，被占用换一个（加后缀：`my-trip-hz`、`my-trip-2026`）

### Surge 故障排查

| 现象 | 原因与解决 |
|------|-----------|
| `command not found: surge` | 没装或 PATH 未生效：重开终端；`npm prefix -g` 确认全局 bin 在 PATH |
| `npm` 不存在 | 没 Node.js：去 nodejs.org 装 LTS 版（勾选 Add to PATH），重开终端 |
| 上传成功但打开空白 | 部署的是空目录/错文件：确认在含 index.html 的目录执行 `surge .` |
| `401 Unauthorized` | 凭据过期：删掉 `~/.surge/config` 重新 `surge login` |
| 项目名冲突 | 换子域名重发 |

## 部署后验收清单（AI 必做 / 指导用户做）

- [ ] 打开线上地址，地图**底图正常加载**（非灰色空白）
- [ ] 缩放/拖动地图，瓦片持续加载
- [ ] 点任意景点的「高德地图导航」，PC 跳高德网页版、手机唤起 App 且定位正确
- [ ] 切换城市标签页、点击某天行程「在地图上查看路线」功能正常
- [ ] 手机浏览器打开，汉堡菜单可展开、无横向滚动条

任一项失败：回本地打开同文件对比。本地正常线上不正常 → 部署的是旧文件，重新部署；本地也不正常 → 按 `amap-map.md` 空白排查表处理。

---

## 给 AI 的执行守则

1. **永远先本地验证再部署**，避免把坏版本发出去
2. 部署是**对外的动作**：执行前告知用户将使用哪个平台、得到什么地址；用户明确要分享再发
3. 交互式登录（surge 注册、gh auth login）只能让用户来做——清楚说明"需要你输入什么"，不要代替用户猜
4. 部署成功后把**线上地址 + 验收清单**一起交付，并提醒：改了本地文件要重新部署才会更新
