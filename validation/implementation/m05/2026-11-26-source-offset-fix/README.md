# M05 查词来源偏移缺陷修复（2026-11-26）

用户反馈阅读时反复出现“阅读位置不可用，请刷新后重试”。本机服务日志显示连续 POST 请求返回 HTTP 422、SOURCE_INVALID。修复属于原有 M05 点词查词范围，不新增产品功能。

## 原因与修改

EpubJsEngine.selectionAt 使用索引中的段落坐标构造 DOM Range，同时直接将 word.start/end 作为查词请求的 wordStart/End。后端 LookupSourceValidator 按契约将这两个值解释为当前句子内的 UTF-16 偏移。第一句起点为 0 时二者恰好一致；后续句子起点非 0 时，请求会因词面或范围不匹配被拒绝。这也影响相同来源的收藏状态请求。重复刷新无法修正旧客户端的计算。

修复将请求字段计算改为 word.start/end 减 sentence.start。段落内句子起止、DOM Range、CFI 的构造保持使用各自正确坐标。后端继续严格校验原文和词面，不放宽来源验证。未改词典、数据库、书籍产物或迁移。

## 验证

- 前端 npm test：63 项通过，含新增多句段落首句、第二句和末尾 FRAGMENT 的来源坐标回归。
- 前端 npm run lint、npm run build：通过；保留既有大于 500 kB 的构建体积提示。
- 后端 mvn -Dtest=LookupSourceValidatorTest test：4 项通过。新增第二句句内偏移通过、旧段落偏移被 SOURCE_INVALID 拒绝的契约测试；普通测试不连接数据库。
- Chromium 浏览器加载本机 Vite 提供的正式 EpubJsEngine，使用真实 iframe DOM、文字布局、caret 命中、Range 和文本摘要校验，执行 selectionAt 取词：同段三句/片段共四词，重复三轮，12/12 正确。包含 inline em 包裹的 children。索引与 CFI 适配器为隔离夹具，不是真实 EPUB 导入或真实 HTTP 全流程验收，未覆盖实际翻页、收藏保存及用户原书。

浏览器中的测试文本为自建：First book. The children are running. Last word。第二句起点 12，children 返回 wordStart=4、wordEnd=12（修复前错误值为 16、24）；末尾片段起点 38，word 返回 5、9。所有结果满足 sentence.slice(wordStart, wordEnd) === surface。

旧浏览器页面需要刷新一次以加载新代码。开发后端未修改业务代码，无需为此修复重启或迁移。
