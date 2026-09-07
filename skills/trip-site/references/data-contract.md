# 数据约定 v1

唯一输入为 JSON，完整示例在 `../assets/example.json`。全部文本按纯文本处理，不嵌 HTML。

| 字段 | 内容 |
| --- | --- |
| meta | title、subtitle、tagline、dates（显示文本）、start/end（可选 ISO 日期）、people（正整数）、origin、notice |
| cities[] | id（唯一）、name、en、color（#RRGGBB）、tagline、description；城市坐标可选 |
| spots[] | id（唯一）、name、city（city id）、type（view/ticket/hotel/food/station）、emoji、lat/lng（数值或同时 null）、coordSystem（GCJ-02/WGS84/unknown）、coordinateSource、ticket、hours、description、sourceUrl、checkedAt |
| days[] | id（唯一字符串）、title、date、city、summary、spotIds（按游览顺序）、timeline[{time,activity}]、tips |
| transport[] | from、to、mode、duration、price（显示文本）、note、sourceUrl、checkedAt |
| stays[] | name、city、note、price（显示文本）、sourceUrl、checkedAt；公开示例不放预订人、房间号和订单 |
| budget[] | item、low/high（非负数字或 null）、basis（person/group）、note；币种统一人民币，其他币种先确认换算口径 |
| tips[] | 自由文本提醒 |

预算 low/high 同时为空表示未知，不能一端有值一端缺失。group 已表示全团总价，person 会乘人数；不得把每晚房价直接作为全程住宿总价。应先写清房数×晚数再填全程金额。预算显示的是已知项目小计；存在 null 时禁止称“完整总费用”。

示例为历史设计演示，金额仅为演算，坐标沿用原稿且明确未核验。不用于现实出行决策。

坐标约定：高德底图模式只接受明确 GCJ-02 的点。未知/WGS84 点保留文本和地点关键词外链，不直接画到高德底图造成偏移。不做自动猜测转换，不把百度 BD-09 当 GCJ-02。海外旅行如需要实地图，适配经授权的 WGS84 底图并另行验证；当前版本的无底图示意模式和文字信息仍可用。

地图服务：当前默认 `meta.basemap="none"`，使用 Leaflet 在无第三方底图的画布上呈现 GCJ-02 点位顺序；`amap-legacy` 是继承原稿的兼容瓦片模式，仅供用户确认可使用该服务后启用。无 API key 不等于已获稳定服务授权。使用官方生产 API 时按服务商要求配置。无外部依赖网络时仍显示 HTML 行程和地图链接。

build-report.json 的 warnings 是审核线索，不是机器证明真实性；构建器只能校验结构、坐标范围和计算，不会联网替用户查证。
