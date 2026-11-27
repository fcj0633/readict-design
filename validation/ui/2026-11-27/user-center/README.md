# UX-U01 用户中心原型执行与验证记录

日期：2026-11-27。范围：[CR-0004](../../../../docs/requirements/changes/CR-0004-用户中心交互原型.md)。状态：原型实施与本机浏览器检查完成，等待视觉评审；不标记为用户设计验收通过。

## 预览

在 `prototypes/reader-ui` 运行 `npm run dev -- --host 127.0.0.1 --port 5176 --strictPort`。

- [个人账户](http://127.0.0.1:5176/user-center.html#/user-center/account)
- [书架与头像](http://127.0.0.1:5176/user-center.html#/user-center/books)
- [阅读设置](http://127.0.0.1:5176/user-center.html#/user-center/settings/reading)
- [词典与发音](http://127.0.0.1:5176/user-center.html#/user-center/settings/pronunciation)
- [登录](http://127.0.0.1:5176/user-center.html#/user-center/login)
- 原有原型仍使用 `/index.html#/`；其数据键保持不变。

页面右下“原型演示状态”是评审工具。选择下次保存失败或冲突后，再修改一项设置触发；退出失败为一次性演示。示例身份默认邮箱已绑定但未验证、手机未绑定，验证状态可独立切换。保存只发生在本浏览器，不模拟真实网络成功的证据。

## 视觉迭代

首轮 [账户](first-pass/first-account.png) 与 [阅读设置](first-pass/first-reading.png) 显示 900px 高度下纸面控件落在首屏之外。第二轮压缩标题间距和分组间距，使最终 1440×900 控件底部约 861px，1920×1080 约 1045px；保留独立预览的纸张层次和大字号阅读内容。账户采用身份区加连续列表；设置只用两项轻量分类。

最终截图均为浏览器实际渲染：

| 页面 | 1440×900 | 1920×1080 |
| --- | --- | --- |
| 书架头像 | [截图](screenshots/books-1440x900.png) | [截图](screenshots/books-1920x1080.png) |
| 头像菜单 | [截图](screenshots/menu-1440x900.png) | [截图](screenshots/menu-1920x1080.png) |
| 个人账户 | [截图](screenshots/account-1440x900.png) | [截图](screenshots/account-1920x1080.png) |
| 编辑资料 | [截图](screenshots/profile-1440x900.png) | [截图](screenshots/profile-1920x1080.png) |
| 修改密码 | [截图](screenshots/password-1440x900.png) | [截图](screenshots/password-1920x1080.png) |
| 阅读设置 | [截图](screenshots/reading-1440x900.png) | [截图](screenshots/reading-1920x1080.png) |
| 词典发音 | [截图](screenshots/pronunciation-1440x900.png) | [截图](screenshots/pronunciation-1920x1080.png) |
| 保存失败 | [截图](screenshots/save-error-1440x900.png) | [截图](screenshots/save-error-1920x1080.png) |
| 版本冲突 | [截图](screenshots/conflict-1440x900.png) | [截图](screenshots/conflict-1920x1080.png) |
| 登录 | [截图](screenshots/login-1440x900.png) | [截图](screenshots/login-1920x1080.png) |

补充：[联系方式状态](screenshots/contact-scenarios-1920x1080.png)、[退出失败](screenshots/logout-error-1920x1080.png)、[找回密码不可用提示](screenshots/forgot-password-1920x1080.png)。

## 实际验证

Chromium，通过 Playwright MCP 独立浏览器上下文测试，不接触用户已有会话。本轮主检查 67 项断言通过，浏览器运行错误为 0；后续针对焦点和独立资产补充检查通过。

- 两个尺寸下页面、菜单、对话框、失败和冲突状态无横向溢出。
- 菜单支持外部点击、Escape 关闭和焦点恢复、方向键导航；普通 Tab 离开菜单会关闭。
- 昵称编辑保存仅影响本原型，默认头像无上传入口；密码规则与确认不一致校验有效。显示密码切换正常，密码弹窗在 900px 高度内完整呈现。
- 资料对话框复测发现受控模式关闭后焦点回到 body，已通过 Base UI `finalFocus` 显式恢复触发按钮，补测通过。
- 阅读设置全部即时响应，660→720 宽度按 1.0909 比例映射；在两种尺寸中实测约 611→666px、563→614px。纸面主题不改变应用外观。
- 保存失败保留修改、重试成功；冲突分别测试保留当前修改、使用已保存设置。连续修改后刷新恢复最新保存值。
- 口音切换与自动保存正常，未把词性偏好或录音可用性伪装为真实查询验收。
- 退出失败保留身份，重试后回登录；已修复处理中按钮禁用导致失焦提前收起菜单、错误不可见的问题。
- 登录、注册、改密后重新登录、找回不可用提示、重置演示均完成。固定 +86 不重复展示；注册不宣称创建了真实账号。
- 独立封面七个图片元素加载成功。长邮箱文本布局压力检查可在账户行内换行。
- 已有 `readict-prototype-v1` 写入哨兵后经本原型保存、刷新仍原样保留；本原型只写专用昵称与偏好键，没有持久化密码或恢复凭据。

工程检查：`npm run build`、`npm run lint` 均通过，静态检查无警告；`npm test` 现有 5 项轻量测试通过。临时检查脚本留在忽略的 `.artifacts/ux/2026-11-27/user-center/`，未纳入正式工程工具。

限制：尚未验证真实认证、邮件/短信发送、恢复凭据、正式设置同步、CSRF、COL 在线查询与音频播放；未进行跨浏览器或后端验收。登录刷新恢复为默认示例身份，是专用演示状态而非真实会话持久化。第二阶段才接入正式模块。此前未提交的 Quiet Library 改动未纳入本任务提交。
