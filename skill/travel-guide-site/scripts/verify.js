#!/usr/bin/env node
/* verify.js —— 攻略网站生成后的自检脚本（零依赖，仅需 Node.js）
 * 用法：node verify.js <待校验的html文件路径>
 * 校验失败时以非零码退出，并打印可操作的错误信息。
 */
var fs = require("fs")
var path = require("path")

var file = process.argv[2] || path.join(__dirname, "..", "assets", "template.html")
if (!fs.existsSync(file)) { console.error("FILE_NOT_FOUND: " + file); process.exit(1) }
var html = fs.readFileSync(file, "utf8")

var errors = []
var warnings = []
function err(msg) { errors.push(msg) }
function warn(msg) { warnings.push(msg) }

/* ---------- 1. 内联 script 语法检查 ---------- */
var scripts = []
var re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi
var m
while ((m = re.exec(html)) !== null) scripts.push(m[1])
if (scripts.length === 0) err("NO_INLINE_SCRIPT: 页面没有内联脚本，模板可能被破坏")
scripts.forEach(function (code, i) {
  try { new Function(code) } catch (e) { err("SCRIPT_" + i + "_SYNTAX_ERROR: " + e.message) }
})

/* ---------- 2. 提取并解析 TRIP_DATA ---------- */
/* 注意：模板注释里也写了 "var TRIP_DATA = {" 字样，必须用 "{后紧跟换行" 来锁定真正的代码行 */
var dm = html.match(/\n[ \t]*var TRIP_DATA = \{[ \t]*\r?\n/)
var data = null
if (!dm) { err("TRIP_DATA_NOT_FOUND: 缺少数据区 var TRIP_DATA = {") }
else {
  var braceStart = html.indexOf("{", dm.index)
  var endIdx = html.indexOf("\n};", braceStart)
  if (endIdx === -1) { err("TRIP_DATA_END_NOT_FOUND: 数据区缺少结尾的顶格 };") }
  else {
    var dataSrc = html.slice(braceStart, endIdx + 2)
    try { data = (new Function("return " + dataSrc))() }
    catch (e) { err("TRIP_DATA_EVAL_ERROR: " + e.message + "（检查数据区是否有多余逗号/引号缺失/中文引号）") }
  }
}

if (data) {
  var cityNames = []
  if (Array.isArray(data.cities)) cityNames = data.cities.map(function (c) { return c.name })
  else err("DATA_MISSING: cities 数组缺失或为空")

  /* 结构完整性 */
  var req = [
    ["meta", data.meta && data.meta.days && data.meta.title],
    ["meta.dates", data.meta && data.meta.dates],
    ["meta.origin", data.meta && data.meta.origin],
    ["theme.primary", data.theme && data.theme.primary],
    ["theme.heroGradient", data.theme && Array.isArray(data.theme.heroGradient) && data.theme.heroGradient.length >= 3],
    ["mapSpots", Array.isArray(data.mapSpots) && data.mapSpots.length],
    ["foodSpots", Array.isArray(data.foodSpots) && data.foodSpots.length],
    ["days", Array.isArray(data.days) && data.days.length],
    ["budget", data.budget && Array.isArray(data.budget.categories) && data.budget.categories.length && data.budget.totalLow],
    ["weather", data.weather && data.weather.tips && Array.isArray(data.weather.tips)],
    ["packing", data.packing && Array.isArray(data.packing.must) && Array.isArray(data.packing.sun) && Array.isArray(data.packing.medicine) && Array.isArray(data.packing.hotel)],
    ["rainyDayPlan", Array.isArray(data.rainyDayPlan) && data.rainyDayPlan.length],
    ["foodGuide", data.foodGuide && Object.keys(data.foodGuide).length],
  ]
  req.forEach(function (r) { if (!r[1]) err("DATA_MISSING: " + r[0]) })

  /* 每个城市必须有坐标与颜色 */
  ;(data.cities || []).forEach(function (c, i) {
    if (!c.name || !c.lat || !c.lng) err("cities[" + i + "] 缺少 name/lat/lng")
    if (!c.color) err("cities[" + i + "].color 缺失（景点标签页与图例依赖它）")
  })

  /* 出发地混入 cities 提醒（WARN 不阻断：确有"在出发地玩半天再走"的合法行程） */
  if (data.meta && data.meta.origin && Array.isArray(data.cities)) {
    var hit = data.cities.find(function (c) { return c.name === data.meta.origin })
    if (hit) warn("cities 含出发地 '" + hit.name + "'：若用户明示要在出发地游玩则属正常设计；常规行程出发地只放 meta.origin 与 transportRoutes/transportLegs 的 from，否则路线 chips 会重复（如 北京→北京→大同）且该城景点标签页空白")
  }

  /* 坐标中国范围校验（可捕获经纬度颠倒 / 位数错误 / 漏小数点） */
  function checkCoord(lat, lng, where) {
    if (typeof lat !== "number" || typeof lng !== "number") { err(where + ": lat/lng 不是数字"); return }
    if (!(lat >= 3 && lat <= 54)) err(where + ": lat=" + lat + " 超出中国范围(3-54)，疑似经纬度颠倒")
    if (!(lng >= 73 && lng <= 136)) err(where + ": lng=" + lng + " 超出中国范围(73-136)，疑似经纬度颠倒")
  }

  if (Array.isArray(data.mapSpots)) data.mapSpots.forEach(function (s, i) {
    checkCoord(s.lat, s.lng, "mapSpots[" + i + "] " + (s.name || "?"))
    if (cityNames.length && cityNames.indexOf(s.city) === -1) err("mapSpots[" + i + "] '" + s.name + "' 的 city='" + s.city + "' 不在 cities 列表中")
  })
  if (Array.isArray(data.foodSpots)) data.foodSpots.forEach(function (s, i) {
    checkCoord(s.lat, s.lng, "foodSpots[" + i + "] " + (s.name || "?"))
    if (cityNames.length && cityNames.indexOf(s.city) === -1) err("foodSpots[" + i + "] '" + s.name + "' 的 city='" + s.city + "' 不在 cities 列表中")
  })
  ;(data.cities || []).forEach(function (c, i) { checkCoord(c.lat, c.lng, "cities[" + i + "] " + c.name) })
  if (Array.isArray(data.days)) data.days.forEach(function (d, i) {
    if (cityNames.length && d.city && cityNames.indexOf(d.city) === -1) err("days[" + i + "] 的 city='" + d.city + "' 不在 cities 列表中")
    if (!Array.isArray(d.route) || d.route.length < 2) warn("days[" + i + "] '" + (d.title || "") + "' 的 route 少于 2 个点，当日路线折线不会显示")
  })

  /* 城际交通线两端必须可解析到坐标 */
  ;(data.transportRoutes || []).forEach(function (r, i) {
    function resolve(name) {
      var c = (data.cities || []).find(function (x) { return x.name === name })
      if (c) return true
      var leg = (data.transportLegs || []).find(function (x) {
        return (x.from === name && x.fromLat != null) || (x.to === name && x.toLat != null)
      })
      if (leg) return true
      var s = (data.mapSpots || []).find(function (x) { return x.name === name })
      return !!s
    }
    if (!resolve(r.from) || !resolve(r.to)) warn("transportRoutes[" + i + "] '" + r.from + "→" + r.to + "' 无法解析坐标，该段虚线将被跳过")
  })

  /* days[].locations 的坐标也做范围校验 */
  if (Array.isArray(data.days)) data.days.forEach(function (d, i) {
    (d.locations || []).forEach(function (loc, j) { checkCoord(loc.lat, loc.lng, "days[" + i + "].locations[" + j + "] " + loc.name) })
  })
}

/* ---------- 3. DOM ID 引用完整性 ----------
 * id 定义扫描全文件（含 JS 模板字符串里动态生成的 id，如 modalClose / viewOnMapBtn） */
var definedIds = {}
var idMatches = html.match(/id="([^"]+)"/g) || []
idMatches.forEach(function (im) { definedIds[im.slice(4, -1)] = true })
scripts.forEach(function (code) {
  var refs = code.match(/getElementById\('([^']+)'\)/g) || []
  refs.forEach(function (rm) {
    var id = rm.slice(16, -2)
    if (!definedIds[id]) err("DOM_ID_MISSING: JS 引用了 #" + id + " 但 HTML 中不存在该 id")
  })
})

/* ---------- 4. 关键静态资源检查（地图瓦片 / Leaflet） ---------- */
if (html.indexOf("webrd0{s}.is.autonavi.com") === -1) err("TILE_URL_BROKEN: 高德瓦片地址被改动，地图会空白")
if (html.indexOf("subdomains: ['1', '2', '3', '4']") === -1) err("TILE_SUBDOMAINS_BROKEN: 瓦片 subdomains 配置丢失，地图会空白")
if (html.indexOf("unpkg.com/leaflet") === -1) err("LEAFLET_MISSING: Leaflet 引用丢失")

/* ---------- 输出 ---------- */
warnings.forEach(function (w) { console.log("WARN : " + w) })
if (errors.length) {
  errors.forEach(function (e) { console.error("FAIL : " + e) })
  console.error("\n共 " + errors.length + " 个错误。请修复后重新校验。")
  process.exit(1)
}
console.log("PASS : script 语法、" + (data ? "TRIP_DATA 结构、坐标范围、城市交叉引用、" : "") + "DOM id、" + "地图配置 全部通过")
process.exit(0)
