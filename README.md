# LifestyleApp（uni-app 多端版）

基于 uni-app（Vue 3，HBuilderX 工程）的本地优先生活方式管理工具：记账、习惯打卡、待办任务与统计。**纯本地存储，不依赖任何后端服务**，数据保存在设备本地（App 系统存储 / H5 localStorage / 小程序平台存储）。

## 页面结构

- 登录 / 注册（本地账户，密码加盐哈希后保存）
- 主界面：底部 4 Tab（首页、记账、习惯、统计）+ “更多”抽屉
  - 首页：今日/本月财务摘要、进行中习惯、今日任务、快捷入口
  - 记账：收入/支出切换、金额、日期、分类底部弹层、资金账户、备注
  - 习惯：周视图打卡/取消、周切换、连续天数统计
  - 统计：三列指标卡、财务趋势图、支出分类甜甜圈图（按住/悬停扇区显示分类与金额）、习惯坚持
- 财务记录：分页列表、支出/收入筛选、编辑、删除
- 账户管理：昵称、密码、资金账户
- 分类管理：支出/收入分类的新增、改名、删除
- 设置：个人头像（上传/移除）、深色模式、四套主题（经典/毛玻璃/新拟态/新野兽派）、隐私与合规说明

## 运行

使用 HBuilderX 打开本目录：

1. 运行到浏览器（H5）：菜单 → 运行 → 运行到浏览器
2. 运行到微信小程序：菜单 → 运行 → 运行到小程序模拟器 → 微信开发者工具
3. 运行到手机（Android/iOS）：菜单 → 运行 → 运行到手机或模拟器

首次使用请在应用内注册本地账户，注册后自动写入预置分类与资金账户。

## 数据存储键

以下键仅保存在本机，不对外传输：

| 键名 | 用途 |
| --- | --- |
| `lifestyleapp_users` | 本地用户列表 |
| `lifestyleapp_session` / `lifestyleapp_token` / `lifestyleapp_nickname` | 登录会话 |
| `lifestyleapp_categories` / `lifestyleapp_accounts` | 分类与资金账户 |
| `lifestyleapp_records` | 记账记录 |
| `lifestyleapp_habits` / `lifestyleapp_checkins` | 习惯与打卡 |
| `lifestyleapp_tasks` | 待办任务 |
| `lifestyleapp_avatar` | 头像 dataURL |
| `lifestyleapp_theme` / `lifestyleapp_style` | 深色模式与主题风格 |
| `lifestyleapp_meta` | 存储版本信息 |

## 说明

- 当前版本不接入云端、不包含统计导出（CSV/Excel）、不包含“数据管理/重置”入口；
- 隐私与权限说明见应用内“设置 → 隐私与合规”。
