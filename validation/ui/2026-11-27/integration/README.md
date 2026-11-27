# UX-U02 原型融合与中性视觉优化验证

日期：2026-11-27。范围：[CR-0005](../../../../docs/requirements/changes/CR-0005-原型融合与中性视觉优化.md)。状态：原型完成、本机检查通过，视觉待评审。

## 预览与内容边界

在 `prototypes/reader-ui` 运行 `npm run dev -- --host 127.0.0.1 --port 5176 --strictPort`。

[主书架](http://127.0.0.1:5176/index.html#/books) · [收藏](http://127.0.0.1:5176/index.html#/favorites) · [账户](http://127.0.0.1:5176/index.html#/account) · [阅读设置](http://127.0.0.1:5176/index.html#/settings/reading) · [词典与发音](http://127.0.0.1:5176/index.html#/settings/pronunciation) · [登录](http://127.0.0.1:5176/index.html#/login)。

主要截图采用 `?demo=library` 的独立示例记录，进度 37% 不代表用户真实阅读进度；白色纸面是截图上下文主动选择的偏好，不重置已有暖纸或夜读记录。测试在独立浏览器上下文中执行，没有清除用户当前浏览器数据。现有工作区的六本样书用于展示；少量书籍仍保持固定封面尺寸。

正式前端与此原型分开：本原型词典为内置示例，发音为浏览器语音演示；COL 来源说明描述正式前端能力。没有真实认证、验证码发送或后端同步；没有将模拟导入描述为真实 EPUB 解析。

## 视觉迭代及截图

首轮：[书架](first-pass/first-books-1440.png)、[设置](first-pass/first-settings-1440.png)。第二轮将继续阅读封面放大到 128×192px，提高作者、状态字号，移除无用的重复展示页面样式，统一中性色和共用 Logo。最终截图如下：

| 页面 | 1440×900 | 1920×1080 |
| --- | --- | --- |
| 书架 | [截图](screenshots/books-1440x900.png) | [截图](screenshots/books-1920x1080.png) |
| 头像菜单 | [截图](screenshots/menu-1440x900.png) | [截图](screenshots/menu-1920x1080.png) |
| 个人账户 | [截图](screenshots/account-1440x900.png) | [截图](screenshots/account-1920x1080.png) |
| 资料弹窗 | [截图](screenshots/profile-1440x900.png) | [截图](screenshots/profile-1920x1080.png) |
| 密码弹窗 | [截图](screenshots/password-1440x900.png) | [截图](screenshots/password-1920x1080.png) |
| 阅读设置 | [截图](screenshots/reading-1440x900.png) | [截图](screenshots/reading-1920x1080.png) |
| 词典发音 | [截图](screenshots/pronunciation-1440x900.png) | [截图](screenshots/pronunciation-1920x1080.png) |
| 保存失败 | [截图](screenshots/save-error-1440x900.png) | [截图](screenshots/save-error-1920x1080.png) |
| 版本冲突 | [截图](screenshots/conflict-1440x900.png) | [截图](screenshots/conflict-1920x1080.png) |
| 登录 | [截图](screenshots/login-1440x900.png) | [截图](screenshots/login-1920x1080.png) |
| 收藏 | [截图](screenshots/favorites-1440x900.png) | [截图](screenshots/favorites-1920x1080.png) |

补充：[两本书](screenshots/two-books-1440x900.png)、[空书架](screenshots/empty-books-1440x900.png)、[搜索无结果](screenshots/search-empty-1440x900.png)、[阅读器查词](screenshots/reader-dictionary-1440x900.png)。

## 实际检查结果

- Chromium / Playwright MCP：[主流程 82 项检查通过](result-main.json)，运行错误为零；[兼容及少量内容 13 项通过](result-extra.json)。
- 搜索、清除搜索、模拟导入、删除确认、分页、查词收藏、句子视图及返回原文完整联通。两个桌面尺寸无横向溢出，660/720 比例预览保留差异。
- 设置失败和未解决冲突均不改变阅读器偏好；重试及两种冲突选择按预期同步。夜读仅应用于阅读器，返回书架和收藏恢复中性界面。
- 初次融合未自动覆盖旧偏好；用户中心设置优先显示，缺少时读取原有字体等偏好。保存保留原进度、翻译缓存和删除记录。
- 菜单键盘、外部点击、Tab 离开、Escape 及弹窗焦点恢复通过。最终截图阶段发现页面历史切换可残留菜单，改为按路由重建菜单后，浏览器后退关闭菜单补测通过。
- 退出失败保留身份与错误，重试成功进入同入口登录，登录返回来源；旧用户中心地址跳转且保留收藏与导入记录。
- `npm run build`、`npm run lint` 通过，静态检查无警告；`npm test` 现有 5 项测试通过。临时浏览器脚本留在忽略目录，未加入工程脚本。

未进行跨浏览器、正式认证、真实邮件／短信、真实 EPUB 解析、COL 在线查询、真人音频听辨或后端验收。历史用户中心证据保留；本次未覆盖既有未提交的书架、样书及文档文件。
