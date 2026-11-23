# M03 本机实现与测试（2026-11-23）

状态：**部分完成**。后端与前端核心已实现；接口、恢复矩阵与一次浏览器自动检查通过。人工视觉确认、真实 EPUB、V03 全量恶意矩阵、`readict_dev` 迁移与 M08 清理执行未完成，本记录不构成 M03 整体验收通过。

对应应用提交：`d08976b`（实现）、`158e37e`（恢复与边界验收补测、书架样式修正）。设计契约：[M03 技术设计与执行文档](../../../../docs/technical/implementation/M03-文件、EPUB导入与书架技术设计与执行文档.md)（0.3）。决策：[ADR-0008](../../../../docs/technical/decisions/ADR-0008-EPUB安全流水线与确定性产物.md)（已于 2026-11-23 采纳；V03／V04 仍是门槛）。

## 范围与环境

- 范围：M03-01～M03-05 全部；M03-06 覆盖下表矩阵状态。
- 环境：Windows 11、JDK 21.0.10、Maven 3.9.14、Spring Boot 4.1.2、Node 24、MySQL 8.0.44、Microsoft Edge（Playwright `channel=msedge`，headless）。
- 数据库只用 `readict_test`；浏览器检查另用独立私有存储根，结束后已删除。
- 依赖：`com.helger:ph-css:7.0.5`（Apache-2.0）。

## 运行与结果

| 命令／检查 | 结果 |
|---|---|
| `mvn test` | 94 通过（library 单测 20） |
| `mvn -Pmysql-it verify` | 52 通过：FoundationIT 8、IdentityIT 20、DictionaryIT 10、AudioIT 8、AudioHttpIT 2、**LibraryIT 2**、**LibraryRecoveryIT 2** |
| `npm run lint` | 0 警告 0 错误 |
| `npm test` | 30 通过 |
| `npm run build` | 通过 |
| Edge headless 书架检查 | 6 张截图，见下节 |

迁移：`readict_test` 由 V6 增量执行 V7，二次启动 0 迁移；V1～V6 未修改。`readict_dev` 于 2026-11-23 经用户批准执行 V7：首次 1 个迁移、二次启动 0 个，表数 18→22；既有 `dictionary_entry` 92907、`dictionary_audio_asset` 248283 计数不变，未执行任何清理。证据见 [dev-migration.json](dev-migration.json)。

## 新增补测（158e37e）

- **A11 过期租约接管**：直接构造 RUNNING＋过期租约任务，worker 回收后重新领取并发布到 READY；旧 owner 调用 `succeed`／`fail` 均返回 0，无法覆盖新结果。
- **A12 发布后数据库失败**：在提交事务的章节插入处注入一次异常；文件已原子发布但事务回滚，任务退避重试后成功。断言最终 READY、数据库仅 1 个产物流水，而磁盘留下 2 个产物目录（失败的为孤儿，交 M08 回收），证明从未出现“READY 指向未提交产物”。
- **A03 无目录／无封面**：读取回退 `SPINE`、封面为 null，流水线正常产出。
- **A05 条目数与累计总量**：极小预算夹具真实触发 `EPUB_ENTRY_LIMIT` 与 `EPUB_TOTAL_TOO_LARGE`。
- **A07 DTD／实体**：含 DOCTYPE 与外部实体的 XHTML 被 `EPUB_INVALID_XHTML` 拒绝。

## 浏览器自动检查

工具：设计仓库 `validation/technical/reader-core/node_modules/playwright`，Edge headless，视口 1440×900 与 390×900。流程：API 注册/登录 → 打开 `/books` → 选择自建样书 → 开始导入 → 等待完成 → 关闭完成弹窗 → 删除确认（取消）→ 390px 截图 → API 删除样书。

| 证据 | 结果 |
|---|---|
| `browser/01-empty-shelf-1440.png` | 空态与导入入口正常 |
| `browser/02-import-dialog.png` | 选择文件后显示对话框与文件信息 |
| `browser/03-import-done.png` | 显示“导入完成，已加入书架” |
| `browser/04-shelf-ready-1440.png` | 卡片显示 OPF 标题、作者、可阅读、日期；无封面占位正常 |
| `browser/05-delete-confirm.png` | 删除确认含“已收藏的单词和原文快照会保留”，确认按钮为危险色 |
| `browser/06-shelf-390.png` | 单列布局、标题不竖排、`scrollWidth == innerWidth` |
| `browser/summary.json` | 无脚本弹窗、无页面异常；删除接口 202，删除后书架为空 |

限制：这是自动截图与断言，**不等于人工视觉确认**；唯一控制台 404 为浏览器请求 `/favicon.ico`（前端未提供图标），与本功能无关。

## 验收矩阵状态（A01～A22）

| 编号 | 状态 | 依据／缺口 |
|---|---|---|
| A01 | pass | LibraryIT + EpubPipelineTest |
| A02 | partial | EPUB2／NCX 仅解析单测，未走完整上传链路 |
| A03 | pass | 无目录／无封面夹具（reader 与 pipeline） |
| A04 | pass | hostile 夹具：脚本、事件、iframe、远程图片、form、隐藏文本均被剔除 |
| A05 | partial | 单条、条目数、累计总量已验；总时长预算未单独构造 |
| A06 | partial | 解析器路径穿越单测；reader 级非法路径样本未独立断言 |
| A07 | pass | DTD／外部实体夹具被 `EPUB_INVALID_XHTML` 拒绝 |
| A08 | pass | `encryption.xml` 拒绝单测 |
| A09 | pass | 固定版式拒绝单测 |
| A10 | partial | 业务 413 单测；未构造 26 MB 真实请求 |
| A11 | pass | LibraryRecoveryIT：接管成功、旧 owner 提交被拒 |
| A12 | pass | LibraryRecoveryIT：无 READY、重试成功、孤儿目录可识别 |
| A13 | partial | READY 复用已验；IMPORTING／FAILED／DELETING 分支仅代码路径 |
| A14 | partial | 同键不同内容断言“非 202”，未精确断言 409 |
| A15 | pass | LibraryIT 跨用户 404 |
| A16 | pass | LibraryIT 缺 CSRF 403 |
| A17 | partial | 删除后 manifest 409；发布前非 READY 未单独验证 |
| A18 | pass | 两次处理 `artifactHash`／index.json 字节一致 |
| A19 | partial | 索引块与 textHash 自洽；浏览器 DOM 对照属 M05 |
| A20 | pass | 书架隐藏、manifest 拒绝；`cleanup_pending` 未断言 |
| A21 | partial | 未配置存储的 503 只有代码路径，无 HTTP 断言 |
| A22 | pass | 全量 `verify` 回归通过，V1～V6 未变，表集合断言 22 |

## 与文档的差异（已回写 0.3）

1. `spineHref` 为包内完整路径（如 `OEBPS/Text/ch1.xhtml`），DB、索引、manifest 与接口一致。
2. `<link rel="stylesheet">` 保留，仅限包内 CSS。
3. 共享错误类型为新增 `com.readict.shared.web.ApiProblem`，未迁移 `identity.DomainProblem`。
4. ph-css 使用 7.0.5（不是 8.4.0）。
5. 新增错误码 `EPUB_INVALID_XHTML`、`COVER_NOT_FOUND`、`LEASE_LOST`、`BOOK_STATE_CONFLICT`；`text-index` 块字段 `utf16Length`。
6. 导入完成后对话框保持打开直到用户关闭（显示完成提示），属交互选择而非缺陷。
7. 确定性只在本机同 JDK 内验证；跨 JDK 未测。

## 未完成与风险

- 人工视觉确认（自动截图只能证明结构与文案）。
- 真实 EPUB（公开 Moby-Dick、用户 EPUB2）未纳入；全部为自建夹具。
- V03 全量恶意矩阵（压缩比极端、资源耗尽、CPU／内存观察）与 V04 浏览器 DOM 对照未执行。
- 开发库 `readict_dev` 已迁移并二次启动验证；正式开发环境的浏览器验收仍建议人工确认。
- M08 的物理清理、孤儿回收、巡检未执行；当前只登记 `cleanup_pending` 并验证孤儿目录存在。
- 下载不支持 Range；阅读器与进度属 M04。

## 复现方式

1. 专用终端加载 `test` 单一环境凭据，设置 `READICT_BOOK_STORAGE_ROOT` 指向末级为 `readict_test` 的私有目录。
2. `backend/`：`mvn test`，再 `mvn -Pmysql-it verify`。
3. `frontend/`：`npm ci && npm run lint && npm test && npm run build`。
4. 浏览器：以 test 配置启动后端与 `npm run dev`，用 [browser/summary.json](browser/summary.json) 中记录的流程复跑。
