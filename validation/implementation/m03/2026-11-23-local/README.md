# M03 本机实现与测试（2026-11-23）

状态：**部分完成**。后端与前端核心已实现并通过本机测试；前端书架页未做真实浏览器人工检查，若干异常／并发场景仅有单测或未覆盖，`readict_dev` 未迁移 V7。本记录不构成 M03 整体验收通过。

对应应用提交：`d08976b`（M03：实现文件存储、EPUB 导入、书架接口与页面）。设计契约：[M03 技术设计与执行文档](../../../../docs/technical/implementation/M03-文件、EPUB导入与书架技术设计与执行文档.md)。决策：[ADR-0008](../../../../docs/technical/decisions/ADR-0008-EPUB安全流水线与确定性产物.md)（提议）。

## 范围与环境

- 实现范围：M03-01 存储与有界上传、M03-02 解压与预算、M03-03 清洗／确定性产物／索引、M03-04 任务与租约、M03-05 书架接口与页面；M03-06 只覆盖下列矩阵中标注为 pass／partial 的项。
- 环境：Windows 11、JDK 21.0.10、Maven 3.9.14、Spring Boot 4.1.2、Node 24、MySQL 8.0.44。数据库只用 `readict_test`；私有存储根为被忽略目录下的 `readict_test`。
- 依赖：`com.helger:ph-css:7.0.5`（Apache-2.0；镜像可用版本，未使用文档曾提到的 8.4.0）。新增依赖已写入 POM，构建可离线重装。

## 运行与结果

| 命令 | 结果 |
|---|---|
| `mvn test` | 90 通过（其中 library 单测 16：EpubPipeline 3、EpubReader 5、TextIndexer 3、BookStorage 5） |
| `mvn -Pmysql-it verify` | 50 通过：FoundationIT 8、IdentityIT 20、DictionaryIT 10、AudioIT 8、AudioHttpIT 2、**LibraryIT 2** |
| `npm run lint` | 0 警告 0 错误 |
| `npm test` | 30 通过（新增 library 8：model 6、api 3 中的合计） |
| `npm run build` | 通过（tsc + vite） |

迁移：`readict_test` 由 V6 增量执行 V7（`book`／`book_artifact`／`book_chapter`／`import_task`），二次启动迁移数为 0；V1～V6 未修改。**`readict_dev` 未执行 V7。**

## LibraryIT 实际覆盖

- 上传合法 EPUB3 → 轮询至 `SUCCEEDED` → 书架出现 READY、标题来自 OPF、封面 URL 存在。
- `reader-manifest` 返回 2 个 spine、`epub-safe-v1` 与默认设置。
- 产物下载 200、`application/epub+zip`、ETag 命中返回 304。
- `text-index` 返回块且不含正文 `text`、`textHash` 为 64 位。
- 封面 200 且 `image/png`。
- 第二个用户访问书／封面／manifest／text-index 全部 404，书架列表不含该书。
- 同源重复上传返回 200（reused）。
- 删除返回 202、书架隐藏、manifest 返回 409。
- 缺 CSRF 上传 403；同键不同内容不返回 202；损坏 EPUB 异步 FAILED 且错误码为 `EPUB_INVALID_MIMETYPE`、书架状态 FAILED。

## 验收矩阵状态（A01～A22）

| 编号 | 状态 | 依据／缺口 |
|---|---|---|
| A01 | pass | LibraryIT + EpubPipelineTest |
| A02 | partial | EPUB2／NCX 仅 EpubReaderTest 解析覆盖，未走完整上传链路 |
| A03 | **未覆盖** | 无封面／无目录夹具未进入矩阵 |
| A04 | pass | hostile 夹具单测：脚本、事件、iframe、远程图片、form、隐藏文本均被剔除 |
| A05 | partial | 单条目预算真实阻断；条目数、累计总量、总时长未逐一验证 |
| A06 | partial | 解析器路径穿越单测；reader 级非法路径样本未独立断言 |
| A07 | **未覆盖** | DTD／外部实体仅由解析参数保证，无专门样本 |
| A08 | pass | `encryption.xml` 拒绝单测 |
| A09 | pass | 固定版式拒绝单测 |
| A10 | partial | 业务 413 单测；未做 26 MB 真实请求验证 |
| A11 | **未覆盖** | 无崩溃接管集成测试；租约 SQL 已实现但未验证接管路径 |
| A12 | **未覆盖** | 发布后 DB 失败未注入 |
| A13 | partial | READY 复用已在 IT 验证；IMPORTING／FAILED／DELETING 分支仅代码路径 |
| A14 | partial | 同键不同内容断言为“非 202”，未精确断言 409 |
| A15 | pass | LibraryIT 跨用户 404 |
| A16 | pass | LibraryIT 缺 CSRF 403 |
| A17 | partial | 删除后 manifest 409；发布前非 READY 未单独验证 |
| A18 | pass | 两次处理 artifactHash／index.json 字节一致 |
| A19 | partial | 索引块与 textHash 自洽；未做浏览器 DOM 对照（属 M05） |
| A20 | pass | 书架隐藏、manifest 拒绝；`cleanup_pending` 未断言 |
| A21 | partial | 未配置存储的 503 仅有代码路径，无 HTTP 断言 |
| A22 | pass | 全量 `verify` 回归通过，V1～V6 未变，表集合断言更新为 22 |

## 与文档的差异（已回写文档 0.2）

1. `spineHref` 统一使用包内完整路径（如 `OEBPS/Text/ch1.xhtml`），不是相对 OPF 的 href；DB、索引与 manifest 三者一致。
2. `<link rel="stylesheet">` 保留并指向包内 CSS（原文档 0.1 将 `link` 整体列为剔除）。
3. 共享错误类型改为新增 `com.readict.shared.web.ApiProblem`，未迁移 `identity.DomainProblem`，避免影响 M01 既有行为。
4. ph-css 使用 7.0.5（镜像可用），不是 8.4.0。
5. 新增错误码：`EPUB_INVALID_XHTML`、`COVER_NOT_FOUND`、`LEASE_LOST`、`BOOK_STATE_CONFLICT`；`text-index` 块的字段名为 `utf16Length`。
6. 确定性只在本机同 JDK 内验证；跨 JDK 未测。

## 未完成与风险

- 前端书架页只有单测与构建通过，**未做真实浏览器人工检查**（上传、进度、删除确认、390px 键盘流程）。
- 恶意样本覆盖窄于设计第 17 章 V03；CPU／内存是否可被预算完全约束未测。
- 崩溃接管、发布后 DB 失败、清理任务执行属 M08 范围，本轮未验证；`cleanup_pending` 只登记不执行。
- 真实 EPUB（公开 Moby-Dick、用户 EPUB2）本轮未纳入，全部使用自建夹具。
- `readict_dev` 未迁移；开发库启用需用户批准后再执行 V7。

## 复现方式

1. 用专用终端加载 `test` 单一环境凭据，设置 `READICT_BOOK_STORAGE_ROOT` 指向末级为 `readict_test` 的私有目录。
2. `backend/`：`mvn test`，再 `mvn -Pmysql-it verify`。
3. `frontend/`：`npm ci && npm run lint && npm test && npm run build`。
4. 证据索引：[test-summary.json](test-summary.json)。
