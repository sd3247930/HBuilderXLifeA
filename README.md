# LifestyleApp uni-app 多端版

基于 uni-app（Vue 3，HBuilderX 工程）实现，界面/交互/功能对齐 Web 版（frontend-vue），兼容 iOS / Android / 微信小程序。

## 页面结构

- 登录 / 注册
- 主界面（底部 4 Tab：首页、记账、习惯、统计 + “更多”抽屉）
  - 首页：今日/本月收支、进行中习惯、今日任务、快捷入口
  - 记账：记一笔（收入/支出、金额、日期、分类、账户、备注）
  - 习惯：周视图打卡（前后周切换、打卡/取消）
  - 统计：指标卡 + SVG 风格 canvas 折线/环形/柱状图（无导出）
- “更多”抽屉：账户管理、分类管理、待办任务、新建任务、财务记录、设置、退出登录
- 财务记录：10 条/页、筛选、编辑、删除
- 设置：头像、深色模式、四套主题（无数据管理）

说明：按需求**未实现**统计导出（Excel/CSV）、帮助与支持、设置中“数据管理”。

## 运行

用 HBuilderX 打开本目录：

1. 运行到浏览器（H5）：菜单 运行 → 运行到浏览器
2. 运行到微信小程序：菜单 运行 → 运行到小程序模拟器 → 微信开发者工具（manifest 中已关闭 urlCheck）
3. 运行到手机（Android/iOS）：运行 → 运行到手机或模拟器（需自定义基座/证书）

后端接口地址在 `common/config.js` 的 `BASE_URL`：

- H5 / 微信开发者工具：默认 `http://127.0.0.1:8765`（微信开发者工具需勾选“不校验合法域名”）
- Android/iOS 真机：改为电脑局域网 IP（如 `http://192.168.x.x:8765`）
- 正式发布：改为已备案的 https 域名（小程序需配置 request 合法域名）

数据存储键与 Web 端一致：`lifestyleapp_token` / `lifestyleapp_nickname` / `lifestyleapp_theme` / `lifestyleapp_style` / `lifestyleapp_avatar`。
