# 在 WorkBuddy 使用与分发

核查日期：2026-09-07。参考 [WorkBuddy 官方 Skill 文档](https://open.workbuddy.cn/en/docs/skill)。官方说明了技能市场、SKILL.md、references/scripts/templates 结构，以及开放平台 zip 解析与上架元数据。界面可能随版本变化。

## 使用

优先下载本仓库 Release 的 `trip-site-skill.zip`，解压到任务可访问的目录，让 WorkBuddy 读取 SKILL.md、运行构建。若你的版本提供本地技能导入，用该入口导入；不预设一个未经验证的固定菜单路径。

这个文件夹按通用 Agent Skill 结构组织。文件夹读取执行的路径与商店“一键安装”是两件事：本仓库未声称已通过 WorkBuddy 商店审核。

## 作者准备上架

Release 额外提供 `trip-site-workbuddy.zip`，在通用包的基础上添加官方文档所列 description_zh、description_en、version、author 等元数据。上架包和通用包是两种打包方式，功能与资产一致。

1. 登录 WorkBuddy 开放平台，检查当前伙伴入驻、上传和审核要求。
2. 上传 workbuddy 包，查看解析结果；若解析器要求额外分类/作者身份资料，以当前页面为准补齐。
3. 使用脱敏例子实跑：“杭州 3 天 2 人，生成旅行网站和随身摘要”。验收地图切日和两页同源更新。
4. 通过审核并获得技能详情链接后，再把安装按钮加到 README 与教程。
5. 若解析失败，对照官方目录与元数据；需要支持时走官方文档列出的运营联系入口。

**发布包已准备 ≠ 已上架。** 本次只保证通用包结构与构建可运行；未冒充完成 WorkBuddy 客户端安装与商店审核。
