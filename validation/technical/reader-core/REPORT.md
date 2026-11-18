# 英语原版书阅读核心技术验证报告

验证日期：2026-11-18，北京时间。所有“已验证”结论以本目录代码、真实运行和保存的证据为限，不代表全 EPUB、全设备或生产安全认证。

## 结论与实施决策

**建议保留 React + TypeScript + epub.js 作为第一版阅读内核的候选方案，先限定 Chromium 桌面环境推进。核心阅读、正文点击、上下文、CFI 与浮层交互已运行通过；完整第一版技术方案尚未通过验收。** 标准英汉词典、跨浏览器交互、依赖漏洞治理是正式接入前的阻断项。规则词形和词性分析只适合作为排序提示。

| 验证项 | 结论 | 证据与边界 |
|---|---|---|
| EPUB 导入、单页分页、上下页、目录、字号 | 已验证可行 | Chromium；自建 EPUB 3、公开完整 EPUB 3、用户 EPUB 2 |
| 单词命中与点击 | 已验证可行 | 真鼠标点击；包含跨加粗节点的 `bro<strong>ken</strong>`；不逐词包装 span |
| 原文句子提取 | 部分可行，存在限制 | 精确保留原文字符与目标偏移；5 个诊断样例通过；任意缩写、跨块句子和复杂排版未全面验证 |
| 单词稳定定位 | 部分可行，存在限制 | 固定书籍及安全处理版本下，CFI 可在字号、窗口和刷新后恢复相同单词；DOM 包装可破坏 CFI；跨浏览器未通过 |
| 浮动词典卡片 | 已验证可行 | Chromium 三种桌面尺寸，左、右、下方目标；长内容内部滚动；不重排；完整目标矩形不被遮挡 |
| 词形还原与词性辅助 | 部分可行，存在限制 | 小型人工诊断集 9/12；失败例保留；不是语义消歧，也不是准确率基准 |
| 真实在线英英查词 | 已验证可行 | Node 5 个正常词返回 200、伪词 404；Chromium 真实卡片成功 |
| 标准英汉词典及商业授权 | 尚未验证 | 公开接口只有英文；商业服务无账号/凭据；不能据文档声明满足中文释义 |
| 主动翻译 | 已验证可行 | Chromium 真实请求得到中文；按钮实际点击和截图；初次 Node 请求失败亦保留 |
| 翻译缓存、故障隔离、旧请求防串词 | 已验证可行 | 明确标记的 Mock 传输验证；另有真实接口成功证据，二者不混用 |
| 性能 | 部分可行，存在限制 | 生产构建本机 3 次/书；有主线程长任务，缺低端机与持续压力结果 |
| 安全 | 部分可行，存在限制 | 有限恶意包阻断通过；仍存在运行依赖审计告警，未证明任意不可信 EPUB 安全 |
| Firefox 兼容性 | 尚未验证 | 安装成功但进程 `spawn UNKNOWN`，属于测试环境启动失败 |
| Windows Playwright WebKit 兼容性 | 验证失败 | 实际点击未打开卡片；迁移存储后的刷新恢复超时。不能等同于 Safari 实机结论 |

## 一 环境与实验隔离

验收记录：构建通过；4 项核心文本单元测试通过；Chromium 18 项浏览器测试通过（其中 2 项为补充 DOM/矩形不变量实验）；Windows WebKit 最后单独复测 2 项，安全样本通过、点击查询失败。所有 Mock 仅用于可控故障与状态测试，在线词典及翻译另有真实请求证据。

已阅读根目录 PRD V1.1、UI 需求、现有前端配置和阅读器界面调研文档的文字内容。现有 `frontend/` 仍为 React 初始模板，没有 EPUB 实现、已有书籍、后端或测试脚本；本次没有修改它。当前工作目录无 Git 元数据，无法创建有效 worktree/实验分支，采用独立 `experiments/reader-tech-spike/`。

Node 24.14.0，npm 11.9.0。实际锁定：React/React DOM 19.3.1、TypeScript 7.0.2、Vite 8.3.6、epubjs 0.3.93、JSZip 3.10.1、compromise 14.20.0、Floating UI DOM 1.8.0、DOMPurify 3.4.18、Playwright 1.65.1。依赖锁文件是版本依据，主机信息见 `evidence/environment.json`。

已检查可用 Skills、MCP 和浏览器工具。使用 Playwright MCP 做实际页面检查，独立 Playwright Test 做可重复断言，Node 进行真实 HTTP 探测和生产构建性能测量。本任务是最小技术实验，未套用完整站点发布、产品视觉改版或后端开发流程。

PRD V1.1 与本次明确要求优先于旧 UI 文档中“模拟翻译”“复习页面”的描述。只实现必要控制器、简化收藏和本地持久化。

## 二 EPUB 阅读与位置

首选方案没有更换。已查阅 [epub.js 官方仓库](https://github.com/futurepress/epub.js)、[官方 API](https://github.com/futurepress/epub.js/blob/master/documentation/md/API.md) 和 [iframe 实现](https://github.com/futurepress/epub.js/blob/master/src/managers/views/iframe.js)。公开网页文档入口曾超时，转而读取仓库文档和安装版本源码。

实际使用 `ePub(ArrayBuffer, {replacements:'blobUrl'})`、`book.ready`、`book.loaded.navigation`、`book.spine`、`book.renderTo`、`rendition.display/next/prev`、`themes.fontSize/default`、`hooks.content.register`、`relocated`、`contents.cfiFromRange`、`rendition.getRange` 和 `book.destroy`。

渲染选项明确为 `manager:'default'`、`flow:'paginated'`、`spread:'none'`。正文位于 iframe，父页面限制阅读宽度；不是上下连续滚动。CSS 分栏形成章内页；普通正文、图片、强调样式与内部超链接均在浏览器断言中检查。书籍外部超链接被安全预处理移除 href，第一版不会直接跳出阅读器。

测试材料：

| 材料 | 大小 | 版本与结构 | 用途 |
|---|---:|---|---|
| 原创 fixture | 3,482 bytes | EPUB 3.0，3 spine 项 | 可确定的纯文本、粗斜体、链接、SVG、长章、跨节点单词 |
| 官方《Moby-Dick》 | 1,628,868 bytes | EPUB 3.0，144 spine 项 | 完整真实可重排版书；正文 `Call me Ishmael` 实际渲染与分页 |
| 用户《Then There Were None》 | 657,441 bytes | EPUB 2.0，51 spine 项 | 本地文件导入、正文翻页、IndexedDB 保存与刷新恢复 |
| hostile | 92,619 bytes | EPUB 3.0，3 spine 项 | 有限恶意内容测试 |

来源、版权声明、原始 SHA-256 和章节结构见 `SAMPLES.md`、`evidence/books.json` 与 `evidence/user-book.json`。保留了真实书籍要求，没有仅靠自建短文本判定通过。

对 A4 的回答：

1. **当前位置**使用 `relocated` 回传的 `start.cfi` 与 `start.href`。保存按原始 EPUB SHA-256 分区，带 `sanitize-v1` 处理版本；不把页码当主键。
2. **页码会变化**。长章在 18px、1440×900 下为 68 页，改为 28px 并缩至 1366×768 后为 151 页。它是当前版式的章内页码；本实验不生成整本固定页码或整书进度百分比。
3. **CFI 可以持久化**。相同布局的刷新测试恢复了同一页首 CFI；上传原 EPUB 存于 IndexedDB，再次预处理后复用位置。
4. **重排后应检查内容锚点而非旧页号**。测试保存 `running` 的 Range CFI，改字号、改窗口并刷新后仍解析到 `running`，目标矩形在阅读区域内。样本不证明所有图片布局和字体迟到场景均无偏差。
5. **改变 DOM 有风险**。实际将原文本节点包进 span 后旧 CFI 不再解析为原词；撤回包装后恢复。不能为点击查词批量包词。选区高亮和父页面浮层不改变正文节点与分页。
6. **主题可协调但需边界**。已实测注入 serif、行高、图片限制及字号。未验证任意出版方 CSS 都能无损覆盖；复杂表格、竖排、固定版式不在已通过范围。

安装版本中 `currentLocation()` 的异步分支没有返回 Promise 的结果，且章节切换期间可能返回空位置。测试最初对此取值过早而失败，现通过等待 `relocated`/状态稳定和可选字段轮询修正；正式适配器应以事件位置为准，避免无条件调用后读取 `.start`。

## 三 正文点击 句子与稳定锚点

在 `hooks.content` 中注册 iframe 文档事件，以 `caretPositionFromPoint` 获取文本节点与偏移，兼容回退 `caretRangeFromPoint`。参见 [MDN 定位 API](https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint)。

对最近段落或语义块建立 TreeWalker 文本节点偏移映射；用字母、内部撇号和连字符规则找 token，再将偏移还原为 DOM Range。跨多个 inline 节点的单词使用同一个 Range；空白和标点不触发新查询。链接保留章节导航语义。

句子使用 [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)，补上常见称谓缩写合并；先保留全部原始字符，再分句，不先压缩空白。单词在句内的起止偏移用于精准高亮，不用全局 replace，因此不混淆同句重复词。

原始 Segmenter 在 `Dr. Smith`、`Mr. Jones` 上把称谓断开，首次诊断仅 3/5；加入缩写修正后当前 5/5。**这不是任意英语书籍的完整句子准确性证明。** 跨段落、`br` 的语义空格、脚注、诗歌、隐藏 CSS 文本、复杂缩写、异常 XHTML 都需要扩大语料验证。当前提取范围是最近块，不能保证跨块完整句子。

实际上下文对象包含：原文词形、lemma、推测词性、原句、句内偏移、Range CFI、spine href、原文件 hash、文本 exact/prefix/suffix。Range 和 iframe 仅为会话对象，不存储；收藏去掉它们后保存快照。

CFI 只对**相同书籍和相同预处理后的 DOM 结构**稳定，不承诺书籍换版、重新打包或安全算法变化后仍有效。文本 quote 已保存，自动回退重定位尚未实现；正式版应验证 CFI 命中后再核对 exact，失败时只在同 spine 项按 prefix/exact/suffix 查找，唯一匹配才接受，不能静默跳到同词的其他出现位置。

## 四 卡片与异步交互

父页面使用固定定位卡片；DOM Range 矩形加 iframe 外部偏移，并考虑 iframe 尺寸比例，形成 [Floating UI virtual element](https://floating-ui.com/docs/virtual-elements)。优先右侧，再左/下/上，使用 `offset`、`flip`、`shift`，卡片尺寸变化后重新计算。空间仍不足时缩小可滚动卡片高度，避开目标矩形。

实测 1366×768、1440×900、1920×1080，每种选择左侧、右侧和底部可见词，长释义不会出视口；另外验证连续点击 `running`、`Smith`、`bold`，完整目标 Range 矩形无重叠。前后 `location` 保持一致。截图已人工打开检查。

关闭、Escape、父页面和 iframe 空白关闭、连续切换、翻页/章节/字号变化关闭已实现。没有全屏遮罩。原词使用浏览器 Selection 高亮；卡片未实现产品级可访问性焦点管理及精确三角指向装饰，后续 UI 完善时仍需验收。

查词及翻译均使用 AbortController，并在写入状态前检查 aborted。词典缓存与翻译缓存独立。翻译操作绑定当前 Context 身份；曾发现旧翻译触发状态会带到新词导致自动请求，已经修复，并通过主动翻译及快速切换用例复测。

## 五 词形 词性与在线数据源

[compromise 官方文档](https://github.com/spencermountain/compromise) 对应本实验的上下文 term tags、动词原形和名词单数化 API。按词在句中的实际偏移匹配 term，而不是仅按相同字符串选第一个结果；`I saw a saw.` 两次出现能分别判断动词和名词。

诊断集 12 例，仅 9 例同时满足预期 lemma 和 POS。失败包括 `The leaves fell.`、`better → good` 和否定缩写 `doesn’t`。所有实际返回和预期见 `evidence/text-analysis.json`。词性分类是启发式标签，没有可靠概率；代码没有伪造置信度。当前主要释义只把相同词性的分组前移，其余保留供应商顺序，不把“经营”误称为已完成语义消歧。

| 数据源 | 官方调研 | 实际验证 | 决策 |
|---|---|---|---|
| [Free Dictionary API](https://dictionaryapi.dev/) | JSON 词条、POS、英文 definitions、音标/音频 URL | run/running/children/gaunt/book 返回 200，伪词 404，CORS 为 `*`；真实浏览器卡片通过 | 仅作英英接口集成基线；不能替代标准英汉词典 |
| [Merriam-Webster Collegiate](https://www.dictionaryapi.com/products/api-collegiate-dictionary) | 官方列出释义、词形、音标、音频，需 API key；此产品不是英汉词典 | 没有凭据，未查询 | 不选为中文释义的直接来源；商业使用、缓存许可需核实 |
| [Oxford Dictionaries API](https://developer.oxforddictionaries.com/) | 官方分别提供词典、词级翻译和词法数据 | 没有凭据；英语到中文具体覆盖和返回字段未验证 | 标准英汉候选，须拿实际数据与授权再决策 |
| [Cambridge Dictionary API](https://dictionary-api.cambridge.org/) | 此次入口返回 403，未获得可验证的接口说明 | 未查询 | 尚未验证，不能仅凭品牌断言可接入 |

Free Dictionary 的英文释义并未被机器翻译后冒充中文词典释义。真实响应中的发音条目及词义质量也不足以证明标准商业词典要求；现有按钮只证明音频 URL 接线，音频播放成功、口音选择和授权未完整验证。

**正式版词典选型门槛**：实际返回中文释义、lemma、POS、音标、音频和来源标识；对常用词、变形、冷僻词、多音词做固定词表测试；明确展示、持久缓存、音频和收藏快照的商业许可。任一条件未达成，标准英汉词典需求保持“尚未验证”。

## 六 主动翻译

参照 [MyMemory 接口规范](https://mymemory.translated.net/doc/spec.php)，使用 Get 端点、`en|zh-CN`、只发送当前句子，不调用贡献翻译的 Set 端点。官方限制单次 q 为 500 UTF-8 字节；实验遇到超限直接给错误，保留原句和查词。公开匿名 [用量说明](https://mymemory.translated.net/doc/usagelimits.php) 为 5000 字符/日；此额度不适合直接承担正式业务。

真实 Node 请求最初连接失败，保留在 `online-probes.json`；随后 Chromium 无拦截请求成功，45 字符测试句返回“孩子们正朝老房子跑去。”，最终复测记录耗时约 6950ms。另通过实际按钮翻译整句对话，结果及截图在 `online-ui.json` 和 `chromium-real-online-card.png`。这两种结果不互相覆盖，也不能推断服务始终可达。

缓存按服务版本、源语言、目标语言和完整原句建立 key。默认查词 0 次翻译请求、主动点击才执行、相同句二次命中缓存、503 失败仍可阅读释义，均有明确 Mock 传输断言。第三方收到原句的行为已在卡片中说明；不发送书籍全文。

该实验没有比较翻译质量或付费供应商 SLA。正式版通过独立服务端适配器管理凭据、超时、限流、缓存及数据处理条款。

## 七 性能 兼容性与安全

生产构建测量环境见 `environment.json`。每本书 3 次，独立浏览器上下文，本地文件，无 CPU 降速；导入耗时从原始 buffer 开始预处理，到首次 display 完成，**不包括用户选择文件、网络下载或 IDB 写入**。翻页测量到 relocated，先排空上次章节的定位事件。

| 样书 | 导入耗时范围 | 12 次翻页耗时范围 | 本次页面生命周期观测到的最长主线程任务 |
|---|---:|---:|---:|
| fixture | 136–149ms | 21.2–34.4ms | 222ms |
| Moby-Dick | 462–494ms | 23.7–34.5ms | 209ms |
| 用户 EPUB | 413–436ms | 23.0–34.4ms | 235ms |

最终一次开发模式首次点击处理记录 52.3ms，包括文本映射、CFI 与 NLP；不是稳定分位值。构建主 JS 约 1,062.56kB，gzip 约 373.20kB。读取整个 EPUB 后在主线程预处理全部 XHTML 会形成长任务，不能推导大书、低端机和大量连续使用无卡顿。建议正式版懒加载 NLP、Web Worker 做可移出的 ZIP/文本处理、限制导入预算并对大章按需索引。

翻页后 iframe 数量保持 1，替换书籍会调用 `book.destroy()`，监听器及 ResizeObserver 有清理路径。尚未做长时间 heap 快照、Blob URL 回收数量或真实泄漏审计，不能把 iframe 数量等同于无内存泄漏。

跨浏览器迁移明确复制 Chromium 的 storageState，以同一 hash/CFI 测试，不假设不同浏览器的 localStorage 自然共享。Chromium 刷新前后同一 CFI、同一原文且在视口内；Firefox 无法启动；WebKit 恢复超时。Windows WebKit 的真鼠标点击也没有触发查询卡片。`cross-browser.json` 和 `webkit-final-results.json` 保留失败，Safari/macOS/iOS、Edge、移动触屏和浏览器缩放尚未验证。若第一版必须同时支持 Chrome/Firefox/Safari，该选型当前不能放行。

安全处理：ZIP 文件/条目/声明解压大小预算、路径检查、mimetype、加密/固定版式拒绝、XML 实体声明拒绝；DOMPurify 在进入 iframe 前清理脚本/事件/嵌套框架；移除外部正文资源与外链；过滤 CSS import/外部 URL；iframe CSP 禁用 script/connect/frame；保留 epub.js 默认 `sandbox="allow-same-origin"`，不开启 allow-scripts。

恶意脚本、事件属性、远程 tracker 图片与 iframe 的有限攻击样本通过，未看到 example.com 网络请求。最初发现 SVG 被安全处理包成 HTML、图片无法解码，现已专门保留 SVG 根节点并通过 naturalWidth 检查。

**仍未关闭的安全风险**：

- 全依赖审计为 7 个包告警（6 high、1 moderate）；仅生产依赖为 2 个包告警（`@xmldom/xmldom` high、`epubjs` moderate，后者包含传递影响）。这不等于两个独立漏洞，也不等于当前浏览器路径已证实可利用；但上线前必须修复或经过可达性审计，不能忽略。
- ZIP 大小预算使用锁定 JSZip 版本的内部元数据，不是流式受限解压；恶意 ZIP、错误压缩大小、CSS/XML 复杂度、畸形 SVG 及资源耗尽没有完整对抗验证。
- 清理不等于完整 EPUB 安全边界：远程 OPF manifest、资源依赖和特殊 URL 仍需集中白名单验证；当前攻击样本未覆盖全部资源加载路径。
- 原始上传包仅保存在本机浏览器；正式服务应在与主应用隔离的资源域处理导入，控制响应头、CSP、链接策略与服务器解压预算，不向正文开放主应用权限或密钥。

## 八 推荐正式方案与进入开发条件

保留 React + TypeScript，建立 EPUB reader adapter，将加载、导航、主题、事件、位置和销毁封装起来；不让业务页面依赖 iframe 及 epub.js 私有字段。暂不换阅读引擎：当前证据证明其核心能力成立，未获得足以替代它的实测比较；如果跨浏览器问题必须成为 P0，则增加候选引擎对同一测试包的对照实验后再决策。

建议的最小业务接口：

- `ReaderLocation`：书籍 hash、预处理版本、spine href、CFI；页码仅展示。
- `WordContext`：原文词形、候选 lemma/POS、原句及句内偏移、CFI、quote；候选不能覆盖原文。
- `DictionaryProvider.lookup`：标准化词条、POS/有序义项、中文释义、音标/音频、来源及许可元数据；缓存和超时独立于阅读器。
- `TranslationProvider.translate`：原句、语言、供应商/版本；只允许显式用户操作发起。
- 收藏主体按 lemma 归并，关联上下文按 book hash + spine href + range CFI 去重，并保存来源快照。实验只有本地最小证明，不是正式数据库设计。

开发顺序与门槛：

1. 先拿标准英汉词典真实凭据和许可，验证固定词表及各必要字段；当前不允许宣称词典选型完成。
2. 修复或隔离依赖审计问题，补全资源白名单、受限解压及恶意包测试；冻结预处理版本及 CFI 契约。
3. 用真实 Firefox、Chrome、Safari 环境重测点击、页面恢复、坐标和字体时序；Windows WebKit 失败不可被 Mock 或单纯 JS dispatch 替代。
4. 扩大英语句界/词形/POS 人工标注语料；低确定性回退词典默认排序，保留所有义项，不能承诺词义消歧。
5. 在通过上述门槛后将 adapter 接入正式前端，再开展服务端持久化、业务收藏和账号系统；当前实验不直接移入正式业务模块。

可复现命令与全部证据索引见 README。未完成的部分明确保留为限制或尚未验证，不以“官方文档支持”代替运行结果。
