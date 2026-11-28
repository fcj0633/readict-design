# UX-U03 正式前端融合与交互重构验证

日期：2026-11-28（Asia/Shanghai）。状态：**UX-U03-01～06 已实现并完成本机主要自动验证；UX-U03-07 的自动回归与截图归档完成，最终人工视觉确认及下列明确未覆盖组合待完成，不登记整体验收通过。**

## 基线、范围与环境

- 应用输入 `6fcda1b`，设计输入 `0e71ccb`；两仓库 AGENTS、PRD V1.1、CR-0004/0005、UX-U02 最终原型与 UX-R01 阅读器为依据。输出应用提交 [`b9cada1`](https://github.com/fcj0633/readict-app/commit/b9cada168ba5367400d600d209ea184e5f2842f6)；设计提交见 Git 历史。
- 应用初始工作区干净；设计原有 requirements/changes、旧书架原型、dict/audio及封面改动保留，不纳入本任务提交。见 [基线](baseline.json)。
- Windows、Java 21.0.10、Maven 3.9.14、Node 24.14.0、npm 11.9.0；本机 Chrome/Playwright 隔离上下文。共享 MCP 浏览器占用时未终止它，改用已安装的 Playwright 隔离 Chrome。
- 主验收：test profile、8082/5175、readict_test、私有书籍根末级 readict_test。完整 MySQL IT 与浏览器阶段顺序运行，互不争用消费队列。
- 用户批准的例外：dev 的独立临时账号与 8083/5177 仅用于 DEV_LOCAL 联系方式验证、找回、改密。该实例关闭书籍存储/导入消费者，Flyway target=9；日志证明既有 V9、执行0个迁移。真实邮件/短信未接入。
- 两库仍V9、26表，V1～V9原文件摘要不变；测试库真实COL包经既有工具导入、激活，验收后按数据集精确清理并条件恢复空指针。最终状态见 [数据库](database-state.json)、[迁移校验](migration-check.json)。

## 实际交付与逐项退出记录

| 任务 | 实际修改与检查 |
| --- | --- |
| UX-U03-01 | 冻结提交/工作区/依赖/迁移；保存改造前页面；前端npm ci及后端111/67基线通过。先前npm ci文件锁失败有保留原因与修复记录。 |
| UX-U03-02 | BrowserRouter嵌套Shell、独立reader/status、安全回跳、旧设置重定向；中性token、Brand、Base UI菜单/弹窗、局部状态页CSS；路由与菜单浏览器检查。 |
| UX-U03-03 | 三个请求域、游标分页、去重/无进展保护、独立续读扫描、鉴权封面/占位、25MiB、上传/删除未知结果原key重试；真实21+本书及第二页候选验证。 |
| UX-U03-04 | 真实账户派生模型与认证表单，默认读者/头像；未实现能力全false；真实改密弹窗、退出、DEV_LOCAL恢复。登录/注册切换以不同key清除敏感表单状态。 |
| UX-U03-05 | 唯一用户作用域偏好协调器、draft/committed/server区分、原requestId重试、跨标签版本保护、10秒有界等待退出、beforeunload；五字段UI保留pronunciation；reader临时预览与设置页草稿隔离。 |
| UX-U03-06 | 真实收藏外观与公共弹窗、独立统计失败、详情迟到请求失效、安全返回；保留三态/追加/快照/进度。按用户另行批准修复下述锚点契约。 |
| UX-U03-07 | 最终前端lint/74测试/build、后端111普通/67MySQL通过；四尺寸截图与回归矩阵归档；临时服务与精确夹具清理完成。人工视觉评审仍待完成。 |

## 获批的最小后端差异

真实重复原句验证发现：FavoriteQueries 的 anchor.cfi 原来返回 word_range_cfi，但 blockOffset/quote 是句子坐标。用户另行批准改为既有 sentence_range_cfi，补 FavoriteIT 断言，未增加DTO字段或迁移。阅读器原 contentMatches 比较页首 CFI，分页会把它放在句子之前；改为验证保存的精确 CFI，并要求不可变文本索引校验通过。保留 quote 回退及现有引擎，不修改正文DOM。重复原句的真实回原文现已正确高亮。

## 验证结果与边界

[测试结果](test-results.json)：前端74项、后端普通111项、MySQL67项，均0失败/错误/跳过；lint、构建通过。原JS约727.80kB，最终约882.83kB（gzip约277.14kB），增加主要来自可访问菜单/弹窗与新增交互；既有500kB体积提示保留。

新增依赖仅精确锁定 @base-ui/react@1.9.0，React peer支持19；最终锁文件在忽略目录隔离执行npm ci复核通过，避免运行中Vite锁住原生模块；不复制原型锁文件、不整体引入Tailwind/shadcn/Sonner。审计仍报告原 EPUB.js→xmldom 链2项问题（1 moderate、1 high），未以破坏性升级阅读引擎掩盖；不声称依赖安全问题已解决。

自建EPUB通过真实上传、解析、文本索引和EPUB.js打开；文字查询使用真实COL Provider，覆盖children、best、thought及故障重试。录音在本轮测试库未配置，仅验证不可用分支，**未进行真实录音播放/人工试听**；既有播放器协议未替换，未引入浏览器TTS。COL全库质量、数据权利、真实供应商、Firefox/Safari、生产部署和全恶意矩阵不扩大验收。

每项U01～U30的实际口径见 [回归矩阵](regression-results.json)。主要机器可读证据：

- [设置、阅读与收藏主链路](browser-main.json)、[真实409与退出失败](browser-conflict.json)、[阅读器共享设置补查](browser-followup.json)。
- [DEV_LOCAL验证/找回/改密](browser-dev.json)、[双账号及四尺寸](browser-visual.json)、[路由状态边界](browser-guard.json)。
- [上传/删除丢响应](browser-import.json)、[收藏双语境与删书快照](browser-favorites.json)、[真实COL状态](browser-dictionary.json)。
- [第二页续读](browser-continue.json)、[四书籍状态与文件边界](browser-states.json)。

受控注入与自然结果分开：设置/收藏/删除是在真实提交后丢响应；multipart流无法由route.fetch忠实重放，因此上传故障测试以捕获的同一key和同一自建文件通过真实HTTP提交，再中断浏览器响应，真实客户端重试验证无重复。三种非READY书状态由精确测试行布置；第二页续读用真实阅读进度并把该测试书的last_read_at回置created_at布置排序，不修改其他用户数据。没有用原型数组或Mock冒充集成。

首次失败与更正见 [验证历史](verification-history.json)；after中 failure/first-failure 图片保留，不把失败截图当最终图。pageErrors为0仅指相应浏览器脚本捕获的页面异常，不宣称console全洁净。

## 截图与视觉差异

[改造前](screenshots/before/)与[改造后](screenshots/after/)分开，原型参考仍位于 UX-U02 历史目录，不复制样书封面。

| 页面 | 1440 | 1920 | 390 |
| --- | --- | --- | --- |
| 书架 | [图](screenshots/after/final-books-1440.png) | [图](screenshots/after/final-books-1920.png) | [图](screenshots/after/final-books-390.png) |
| 菜单 | [图](screenshots/after/final-menu-1440.png) | [图](screenshots/after/final-menu-1920.png) | [图](screenshots/after/final-menu-390.png) |
| 账户 | [图](screenshots/after/final-account-1440.png) | [图](screenshots/after/final-account-1920.png) | [图](screenshots/after/final-account-390.png) |
| 改密 | [图](screenshots/after/final-password-1440.png) | [图](screenshots/after/final-password-1920.png) | [图](screenshots/after/final-password-390.png) |
| 阅读设置 | [图](screenshots/after/final-reading-1440.png) | [图](screenshots/after/final-reading-1920.png) | [图](screenshots/after/final-reading-390.png) |
| 收藏 | [图](screenshots/after/final-favorites-1440.png) | [图](screenshots/after/final-favorites-1920.png) | [图](screenshots/after/final-favorites-390.png) |
| 登录 | [图](screenshots/after/final-login-1440.png) | [图](screenshots/after/final-login-1920.png) | [图](screenshots/after/final-login-390.png) |

1366截图同目录。补充：[真实查词](screenshots/after/final-real-dictionary-1440.png)、[删书快照](screenshots/after/final-deleted-source-1440.png)、[书状态/封面失败](screenshots/after/final-book-states-1440.png)、[窄屏阅读器](screenshots/after/final-reader-390.png)。

批准差异：无昵称/头像编辑和绑定按钮；无词典发音分类；无原型标签；书籍/统计/进度来自服务端；缺章节/作者/封面时不编造。预览使用自写排版示例。样书封面为自建测试图，不代表产品内置书。代理检查确认四尺寸主页面无横向溢出，但最终风格、完整历史/键盘组合及极限文案仍需人工确认，不以截图代替该确认。

## 清理、运行与回退

本轮两次浏览器测试的test账号共3个、dev本地验证账号1个，及其书籍/进度/收藏/回执/挑战/恢复凭证已按精确UUID清理；对应私有书籍目录逐文件清理，本地验证码文件已不存在。测试库活动文字指针恢复为空，版本由141条件推进至142；最终集成测试自行推进至148，未倒退版本。开发库COL仍为原数据集、版本1。

临时8082/5175与8083/5177服务均已停止。原8080开发后端、5173正式前端和5176原型保留。正式前端热更新可见；原8080后端需按README重启才加载获批的句子锚点修复，不把旧进程当新版本验收。

一次性脚本、JAR、私有凭据、完整词典和EPUB均在忽略目录，不提交；原始日志在应用.artifacts/ux-u03。回退使用本轮应用提交的git revert，无数据库迁移需回退；不得用清用户数据恢复视觉。
