# M05 本机 MVP 实施记录（2026-11-25）

## 结论

本机已实现**点词查词 → 真实 COL 卡片 → 真实英／美音播放**主流程。应用提交 `2b9af06`，基线为设计 M05 0.1（2026-11-25）与应用 `cd5ae33`。

按 M05 文档，本轮只完成 MVP 必要主流程；完整质量、兼容性、键盘块内取词、人工试听和 M06/M07 仍未完成，因此**不登记 M05 整体验收通过**。

## 实际实现

- 后端 `POST /api/v1/dictionary/lookups`：Session／CSRF／账号状态保护；校验 book 所有权、READY、有效产物；按 M03 不可变 text-index 重建规范块、句段、UTF-16 偏移、surface 与 quote；拒绝伪造文本、跨句、越界、代理项切开、超预算来源。
- 复用 M02 `DictionaryProvider.lookup`；一次查询固定文字 DatasetRef；音频先读取一次活动数据集，再用同一 `audioDatasetId` 组装所有候选词头；音频依赖错误只影响音频。
- 新增 10 分钟进程内 lookupId（1000 条／16MiB 上限），不写 Session、不建表，供 M06 后续使用。
- `ReadingIndexCache` 加同步保护；安全配置只开放精确 POST 路由；响应 `Cache-Control: no-store`，日志不输出原句。
- 前端 `engine/selection.ts` 与引擎 content hook：caret 命中、跨 inline 词、重复词、撇号／连字符、Range 命中校验、iframe 坐标换算；复用块／句子哈希校验。
- 真实 `DictionaryCard`：严格 DTO 校验、加载／错误／空结果、FOUND／AMBIGUOUS／NOT_FOUND、候选按 lemma 去重、主释义＋两条其他释义、更多折叠、原文只高亮实际词、收藏保持 M06 禁用。
- `PronunciationPlayer`：单一 `Audio` 实例、`preload=none`、点击才设置同源 src；加载／播放／结束／失败状态；换词、翻页、关闭、面板、重排时停止并释放。
- 移除正式路径的 fixture／TTS／模拟翻译；不提供假收藏或假翻译。

## 实测结果

运行环境：本机 dev profile（`readict_dev`），使用一次性 `m05_*` 用户与自建 EPUB；检查后清理用户、书籍、进度和私有存储目录；未迁移 schema，未修改活动词典／音频指针。

| 检查 | 结果 |
| --- | --- |
| Q01 普通词 | `children` 点击命中，surface=`children`；重复词 / 行尾空白样例由单测覆盖 |
| Q02 来源校验 | 后端 3 个单测：规范重建、伪造 surface／越界、代理项边界；未单独跑真实 HTTP 伪造样本 |
| Q03 真实状态 | `children` → FOUND（child）；`best` → AMBIGUOUS（good／well，候选去重为 2）；`zzzz` → NOT_FOUND |
| Q04 鉴权 | 匿名无 CSRF=403；匿名带 CSRF=401；跨用户查词=404；浏览器真实 Session／CSRF |
| Q05 快速换词／迟到响应 | 代码使用 selectionId＋AbortController＋generation；未做可控延迟自动化 |
| Q06 真实录音 | 卡片显示 `child 英音`／`child 美音`；点击后按钮进入播放态，音频请求 `206 audio/mpeg`；未做人工试听 |
| Q07 停止／鉴权 | 关闭／换词／翻页调用 stop；匿名音频请求=401；未单独测量退出后播放停止 |
| Q08 卡片尺寸 | 1440 卡片 390px；390×844 卡片 358px，无横向溢出；关闭按钮可用；键盘块内取词未实现 |
| Q09 回归 | 后端 `mvn test` 109 通过；前端 lint 0、test 57 通过、build 通过 |

证据：`01-found-1440.png`、`02-audio-1440.png`、`03-found-390.png`、`04-ambiguous-1440.png`、`05-not-found-1440.png`、`summary.json`。

## 未完成与限制

- 键盘块内逐词导航／Enter 查询未实现；当前主路径为鼠标点词。
- 未实现跨独立段落组句、短语查询、compromise/NLP 词形推断（按文档后置）。
- M06 收藏、M07 翻译未接入；卡片中的收藏按钮禁用。
- 未做完整辅助技术矩阵、跨浏览器、全尺寸、性能压测、人工试听与全库音质／权利核实。
- 测试库 `readict_test` 当前没有活动词典／音频数据集；真实查词使用开发库已启用数据集，不能据此宣称测试库或生产数据完整可用。
- lookupId 仅进程内，重启即失效；M06 如需要跨重启再设计持久化。
- 应用提交在本次设计记录生成时已创建；推送如遇网络失败需单独报告，不伪造已推送。
