# 发布：免费静态托管，不等于匿名永久托管

核查日期：2026-09-07。三个路径均不需要自己的电脑持续开机。读者打开公开站一般无需账号；发布者的账号要求是另一回事。免费额度、可见性和网络可达性按服务商当前规则处理。

## 推荐给已用 AI 编程工具的人：Surge

1. 确认 Node.js 18+ 已安装，终端执行 `node --version`。
2. 安装命令：`npm install --global surge`。
3. 在项目根目录生成网页后执行：`surge ./output`。按提示输入/登录自己的邮箱与密码，填写一个未占用的 `.surge.sh` 域名。
4. 以 CLI 实际返回的 HTTPS URL 为准。不要把文档中的示例域名当作已经发布。
5. 更新时向同一个域名部署新的 output；不要把仓库根目录和原始旅行资料一起上传。

已登录后，AI 可以执行构建和发布；用户不需要每天重新学命令。首次邮箱密码由用户亲自输入，不粘贴到聊天或仓库。

官方：[Getting Started](https://surge.sh/docs/getting-started)。

## 推荐给排斥终端的人：Netlify Drop

1. 在浏览器登录自己的 Netlify 账号。
2. 打开 [Netlify Drop](https://app.netlify.com/drop)。
3. 将**包含 index.html 的 output 文件夹**拖入，等部署完成。
4. 确认站点为公开可访问；在未登录的浏览器窗口打开新网址。
5. 更新已有站点时进入该站点 Deploys 页面，上传新 output；重新到 Drop 新建可能生成另一个站点。

官方文档目前支持未登录拖拽发布静态文件，也支持 CLI 匿名临时部署；CLI 临时项目需在一小时内认领。这不能证明匿名链接可以永久保留，所以教程默认登录管理。部分团队的新项目可能默认私有，必须检查可见性。

官方：[Create deploys](https://docs.netlify.com/deploy/create-deploys/)。

## GitHub Pages：适合已经有仓库的人

需要 GitHub 账号和仓库权限。`github.io` 是托管域名，不是匿名上传入口。

本仓库 `.github/workflows/pages.yml` 仅把 `demo/` 成品发布到 Pages。首次到仓库 Settings → Pages → Build and deployment，选择 GitHub Actions，然后在 Actions 中运行 Deploy demo。Fork 用户使用自己的 Pages URL，不会自动拥有作者的网址。

你的私人旅行网站建议放单独仓库，只上传脱敏后的成品。别为了部署把聊天记录、票据与联系人一起放进公开仓库。

官方：[Pages Quickstart](https://docs.github.com/en/pages/quickstart)。

## 什么叫“发布完成”

部署成功后分别确认：HTTPS 首页、card.html、地图切日、弹窗、手机宽度、匿名窗口访问。再用真实手机的移动网络测试一次，尤其是目标观众主要在中国大陆时。第三方托管/底图的可达性不是 Skill 能保证的。

没有完成发布验证时，交付措辞是“本地文件已完成，发布待登录/待验证”，不是“你的网站已上线”。
