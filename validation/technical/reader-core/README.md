# Readict 阅读器核心技术实验

这是独立的技术验证工程，不是完整产品。实验与 [UI 原型](../../../prototypes/reader-ui/README.md)相互独立；报告里的目录描述反映实验当时的状态。完整结果、适用边界及选型建议见 [REPORT.md](REPORT.md)。

## 运行

从 `readict-design` 仓库根目录执行：

在 PowerShell 中执行：

```powershell
cd validation/technical/reader-core
npm ci
npm run dev
```

访问 http://127.0.0.1:5174/ 。默认加载确定性 EPUB 3 测试书；“公开样书”加载完整《Moby-Dick》；右上角可导入自己的 EPUB。已导入文件保存至该浏览器此来源的 IndexedDB，阅读位置、字号和简化收藏保存至 localStorage。重新加载可恢复；不同浏览器不会自动共享这些存储。

“测试样书”返回初始书。章节下拉、上一页、下一页、左右方向键、字号选择可用。单击正文英文单词打开卡片，Escape 或空白处关闭。单击其他可见单词直接切换。原始书籍不会上传。

真实词典使用 Free Dictionary API，仅提供**英文释义**，不满足标准英汉词典全部要求。真实翻译使用 MyMemory，只在点击“翻译例句”后发送当前句子；原文中有明确提示。不要把此英英演示理解为已经接入商业英汉词典。

## 验证命令

```powershell
npm run build
npm run test:unit
npx playwright install chromium firefox webkit
npx playwright test --project=chromium --output=test-results-chromium
node scripts/compatibility.mjs
npx playwright test --project=webkit --grep 'untrusted|word split' --output=test-results-webkit
npm run probe
node --import tsx scripts/analysis.mjs
```

浏览器测试包含真实联网断言，网络和供应商状态会影响结果。带 `MOCK transport` 的测试用于稳定验证延迟、错误、缓存和竞态；其他模拟词典条目直接带 `MOCK` 字样。真实在线测试不拦截网络，真实响应保存于 `evidence/`。

`npm test` 执行全部三种浏览器，不会隐藏兼容性失败。Firefox 本机启动失败，WebKit 本机点击与跨浏览器恢复失败，详见报告。不要并行启动多个 Playwright 测试进程：它们共用 JSON/HTML 报告输出。先保存本轮报告再运行下一轮。

用户书测试路径默认使用本次提供的下载目录文件，文件不存在时该用例跳过；它不会被复制到 `public/`。换电脑后可修改该测试中的本地路径。性能脚本同样使用该本地路径。

## 性能与证据再现

```powershell
# 第一个终端
npm run build
npx vite preview --host 127.0.0.1 --port 5175 --strictPort
# 第二个终端
node scripts/performance.mjs
node scripts/capture.mjs
node scripts/summary.mjs
```

性能为本机生产构建，每本书 3 次、新浏览器上下文、每次 4 次翻页，无网络限速及 CPU 降速；不是设备覆盖或 SLA 证明。`capture.mjs` 使用开发服务器记录真实查词及主动翻译界面。`summary.mjs` 从保存的 Chromium JSON 提取可读摘要。

样例书和恶意样本已经随实验保存在 `public/books/`。`npm run fixtures` 重新生成自有测试文本，并从官方 IDPF release 资产接口下载公开样书；该命令可能因网络失败而只保留已下载的公开文件。下载来源和许可见 [SAMPLES.md](SAMPLES.md)。

## 证据索引

- `evidence/chromium-final-results.json`：最后完整的 Chromium 测试结果。
- `evidence/test-summary.json`：含 CFI、真实翻译、导入耗时等附件内容的简化结果。
- `evidence/chromium-html-report/index.html`：Chromium 报告副本；可用 `npx playwright show-report evidence/chromium-html-report` 打开。
- `evidence/webkit-final-results.json`、`evidence/cross-browser.json`：独立的失败和限制证据。
- `evidence/online-probes.json`：Node 真实请求，包含 HTTP 状态、CORS、时延、返回数据或错误。
- `evidence/online-ui.json`、`evidence/chromium-real-online-card.png`：真实词典加真实主动翻译，未使用 Mock。
- `evidence/performance.json`、`evidence/environment.json`：生产构建性能原始数据和测试环境。
- `evidence/text-analysis.json`：词形词性和句子边界诊断，含失败例。
- `evidence/dependency-audit.json`、`evidence/production-dependency-audit.json`：依赖审计。
- `evidence/books.json`、`evidence/user-book.json`：书籍版本、尺寸、结构及哈希。

## 实验限制

只验英语、可重排版 EPUB 和桌面阅读。实验限制导入 25 MiB、2500 个条目、声明解压大小 80 MiB；带 `encryption.xml`（包括字体混淆）的书籍暂时全部拒绝。安全预处理会改变书籍 DOM，因此 CFI 对应 `sanitize-v1` 处理后的版本。没有商业词典密钥、认证、后端、数据库、复习系统，也没有完整安全审计或 Safari 实机结论。

## 迁移与重跑说明

本工程原位于 `experiments/reader-tech-spike/`，现保持工程内部相对路径整体迁移。`REPORT.md`、`evidence/` 中的环境描述与原路径属于历史证据，迁移不改变其兼容性、安全、词典选型的未决结论。执行会写入 `evidence/` 的脚本前，先按日期保存原有证据，并将新结论单独归档；不要直接覆盖已提交证据后声称历史报告仍对应新结果。

用户下载目录的 EPUB 为外部可选输入，不在仓库中。换电脑时需要自行提供，并修改相关测试或性能脚本中的输入路径。
