# M04 本机实施记录（2026-11-23）

## 1. 结论

M04 的后端 V8 与进度 API、前端阅读页、恢复与保存链路已在本机落地，`readict_test` 的自动检查通过。**这不是 M04 整体验收**：人工视觉确认、真实大书、跨版式精确恢复、多候选 quote、两窗口 UI 冲突、Firefox/Safari 与内存观察均未完成，`readict_dev` 未迁移 V8。

应用提交：`afa5425`（`M04：实现阅读内核、进度持久化与阅读页`）。

## 2. 环境与数据库

- Java 21、Spring Boot 4.1.2、MySQL 8、Edge（Playwright `channel: msedge`，headless）。
- 数据库 `readict_test`；应用账号 `readict_test_app`，迁移账号 `readict_test_migrate`。测试结束已删除本轮 `reader_*@readict.test` 用户、书籍与私有存储目录。
- V8：首次启动 `Migrating schema readict_test to version "8 - reading progress"`，二次启动 `now at version v8` 且 0 迁移；`FoundationIT` 表集合断言更新为 23 表并保持 8 项通过。
- `readict_dev` **未执行 V8**；既有 V7、词典 92,907、音频 248,283 未触碰。

## 3. 自动检查

### 3.1 后端

| 命令 | 结果 |
| --- | --- |
| `mvn test` | 102 通过，0 失败（新增 `ProgressCalculatorTest` 4、`ProgressValidationTest` 4） |
| `mvn -Pmysql-it verify` | 56 通过，0 失败：Foundation 8、Identity 20、Dictionary 10、Audio 8、AudioHttp 2、Library 2、LibraryRecovery 2、ReadingProgress 4 |
| V8 迁移 | 首次 1 个成功，二次 0 个；`reading_progress` 外键/CHECK/索引可用 |

ReadingProgressIT 覆盖：创建版本 1 与比例投影、版本条件冲突、同 requestId 同载荷重放、不同载荷 409、块偏移/引文/产物摘要/章节校验、跨用户 404、删除书同事务删除进度并更新 `last_read_at`。

### 3.2 前端

| 命令 | 结果 |
| --- | --- |
| `npm run lint` | 0 警告，0 错误 |
| `npm test` | 39 通过（原 30 + reader 9：anchor 4、blocks 2、progress 3） |
| `npm run build` | 通过；因 epubjs 主包 680 kB，Vite 给出 >500 kB 分包警告（未优化，记录为遗留） |

## 4. 浏览器检查（Edge headless）

脚本：导入两章样书 → 书架“打开” → 阅读页首段 → 下一页 → 设置字号 24 → 刷新恢复 → 书架进度 → 390px 重开。产物在 `browser/`，机器结果在 `browser/summary.json`。

| 检查 | 结果 |
| --- | --- |
| 打开与首段渲染 | 通过；iframe 内 `Call me Ishmael.` 可见 |
| 翻页 | 通过；页码由第 1/4 页变为第 2/4 页 |
| 恢复 | 保存进度 `version=1`、`blockId=b-4`、`progressRatio≈0.0768`；刷新后 `GET progress` 仍为版本 1，页面显示“全书 8%” |
| 设置 | 字号 24 生效并保存（`/me/settings` 返回 `fontSize=24`），刷新后保持 |
| 书架联动 | 卡片显示“已读 8%” |
| 390px | 正文可见，`scrollWidth` 未超过视口，无横向溢出 |
| 控制台 | 无 `pageerror`；有 favicon 404 与 epub.js 触发的 “Permissions policy violation: unload” 警告，非业务错误 |

截图：`01-reader-1440.png`、`02-reader-next.png`、`03-reader-settings.png`、`04-reader-reloaded.png`、`05-reader-390.png`。人工视觉确认仍未完成，截图只作为自动检查证据。

## 5. 矩阵状态（相对 M04 文档 R01～R20）

| 项 | 状态 | 说明 |
| --- | --- | --- |
| R01 首开渲染 | 通过 | 浏览器实跑 |
| R02 目录 | 部分 | 面板渲染，未在脚本中点击跳转 |
| R03 翻页 | 部分 | 下一页可见；首页/末页按钮禁用未断言 |
| R04 键盘 | 未覆盖 | 代码存在，未在 iframe 内验证 |
| R05 设置 | 部分 | 字号生效；宽度与“位置不跳”未度量 |
| R06 390px | 通过 | 文本可见、无横向溢出 |
| R07 刷新恢复 | 通过 | 版本保持 1，比例回显 |
| R08 版式变化 | 部分 | 字号 24 后刷新恢复；旋转/缩放与跨版式隔离未做 |
| R09 跨章恢复 | 未覆盖 | 样书仅两章，未切章验证 |
| R10 quote 回退 | 未覆盖 | 390px 出现降级提示，但结果为 chapter-start，quote 路径未被触发 |
| R11 多候选 | 未覆盖 | 无重复文本样书 |
| R12 产物失配 | 未覆盖 | 未注入摘要/版本不一致 |
| R13 首写 version=1 | 通过 | ReadingProgressIT |
| R14 防抖/间隔/串行 | 部分 | 保存成功；未断言 5s 间隔与并发串行 |
| R15 冲突呈现 | 部分 | IT 触发 409 带 currentVersion/serverProgress；两窗口 UI 未验 |
| R16 幂等 | 通过 | IT 同 requestId 同载荷重放 |
| R17 本地待同步 | 部分 | 单测覆盖；浏览器断网未验 |
| R18 删除清进度 | 通过 | IT |
| R19 401/404/CSRF | 部分 | IT 覆盖跨用户 404；HTTP 401/CSRF 未单独断言 |
| R20 索引失配 | 部分 | 客户端块摘要校验存在；未注入失配 |

## 6. 实现补记（与 0.1 草案的差异）

1. 阅读页全屏渲染，不套账号页头尾（`/reader/:bookId` 提前返回独立路由）。
2. 块定位改为“按相同块规则在 `body` 重新提取 + 逐块长度/摘要校验”，不依赖 `data-readict-block`。
3. `quote.exact` 从块偏移起点开始取，最多 128 UTF-16 单元；prefix/suffix 最多 64。
4. 跨 iframe `Range` 用结构判断而非父窗口 `instanceof`。
5. 恢复完成后 800ms 内的 `relocated` 不保存；`saving` 与 `unsynced` 分离，避免正常防抖被误报为失败。
6. `BookView.progressRatio` 使用 `BigDecimal`；书架 SQL 的 `book` 列全部限定前缀。
7. epubjs 0.3.93 带 31 个传递包，`npm audit` 2 个告警；按 V02 记录，不据此宣称安全通过。

## 7. 未完成

- 人工视觉确认（书架 + 阅读页）。
- 真实 EPUB 大书（长章、图片、脚注、异常排版）和滚动/分页性能、内存与 Blob 生命周期观察。
- 跨版式（宽度/窗口尺寸）精确恢复、跨章恢复、多候选 quote、R12/R20 失配注入。
- 两窗口 409 UI 选择、断网重试、多标签同步（BroadcastChannel 未实现）。
- Firefox/Safari 明确暂不支持；Range 下载、M08 物理回收、M05/M06/M07 仍未开发。
- `readict_dev` V8 迁移待用户批准。
