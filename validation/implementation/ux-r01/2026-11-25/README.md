# UX-R01 正式阅读器视觉改版验证报告

日期：2026-11-25（Asia/Shanghai）。结论：**本轮视觉改版及列明的18项浏览器检查通过；不代表M04整体验收完成。**

应用提交：`cd5ae33d45baf9379018951b715f1a92a4c06888`。应用改造前基线：`ea02e74`；设计资料基线：`8801694`。任务依据与边界见[独立执行说明](../../../../docs/technical/implementation/UX-R01-正式阅读器视觉改版执行说明.md)。

## 环境、输入与证据性质

本机Windows、真实Edge 158.0.4370.33＋Playwright，headless验证；页面使用正式React和epub.js 0.3.93。运行端口5174／8081，默认5173／8080由其他项目占用，未停止它们。正式浏览器验收连接readict_test，启动日志确认已有V8、无需迁移；未修改Java、SQL迁移或数据库结构。

启动排障曾尝试禁用Flyway，但被已有环境保护拒绝；最终保留保护并锁定目标V8。曾启动dev检查账号但未登录成功，正式验收改用test独立账号。测试账号通过已有注册接口建立，书籍通过真实上传／导入接口产生；未清空其他用户或数据库。

真实书籍为用户本机已有的Then There Were None（Tenery V B），不是将普通HTML注入阅读区。词典预览另用此前已有The Quiet Valley真实EPUB夹具，明确为测试内容。原始EPUB、凭据、Session、生成脚本及临时Vite配置均留本地忽略目录，不提交。测试偏好恢复为原始Georgia／20px／1.8／标准660／暖色／英音；本轮截图中的24px不是新默认值。

## 改造与合理调整

- ReaderLayout：品牌和返回入口、纸面内真实书名／章节；固定标题高度与长文字省略。ReaderPage：工具栏移入纸面、页码／状态分层、manifest宽度回退与操作完成后的页码同步。
- reader.css：纸面最大1560px、圆角14px，正文标准／宽松约900／1000px，工具栏相对纸面右上定位；900px以下横向排列。44px分页按钮、三种主题及窄屏布局协调。
- preferences.ts：普通段落基础间距0.65em，移除统一首行缩进覆盖，不加!important。书籍原有class、缩进、段后距及行距仍可能生效；本书部分段落在body设1.8时实际为1.5，未伪称全书段落都被覆盖为1.8。
- EpubJsEngine仅作必要适配：对新章节文档绑定一次键盘监听；观察实际阅读容器尺寸并调用既有resize；重排后复用原有CFI校验／唯一原文引文恢复；display成功后更新当前锚点。ReaderPage收到重排结果同步真实页码。不改变CFI格式、引用算法、后台位置契约或单页模式。
- 新增两项主题回归测试，覆盖所有字号／行距档位及不强制书籍缩进的约束；应用README仅补文档入口，没有创建应用docs目录。

参考图的暖色层级、品牌、纸面标题、竖向胶囊工具栏和分页层次已落地。未添加植物装饰、纸纹或装饰渐变；未隐藏EPUB自身章节标题。书籍真实分页、作者排版和用户字号决定每页内容，不能与设计图的固定文本／页码逐像素一致。

## 实际检查

| 检查 | 结果 |
|---|---|
| 前端lint | 通过 |
| 前端普通测试 | 51通过，0失败（原49＋新增2） |
| TypeScript与生产构建 | 通过；现有大chunk告警仍在，约699.03kB／gzip214.93kB |
| Java／数据库IT | 本轮未运行；后端和迁移没有修改 |
| 浏览器pageerror | 0 |
| 偏好恢复 | 已通过API确认恢复原值 |

| 浏览器场景 | 最终结果 |
|---|---|
| real EPUB and dynamic chapter heading | 通过 |
| desktop geometry 1920 | 通过 |
| desktop geometry 1440 | 通过 |
| desktop geometry 1366 | 通过 |
| contents overlay preserves EPUB geometry and iframe | 通过 |
| settings overlay preserves EPUB geometry | 通过 |
| previous next and keyboard navigation | 通过 |
| refresh restores actual quote | 通过 |
| font and width reflow retain visible original text | 通过 |
| white and dark themes | 通过 |
| all saved size and spacing options remain applied | 通过 |
| initial wide preference comes from manifest before settings load | 通过 |
| last book boundary through real chapter navigation | 通过 |
| network failure feedback and retry (browser-injected transport failure) | 通过 |
| real two-page progress conflict and server resolution | 通过 |
| 390px, long title and reduced motion | 通过 |
| shelf return flushes position | 通过 |
| fresh EPUB first boundary and development dictionary preview | 通过 |

三桌面宽松阅读区实测：1920×1080为1000×780，1440×900为1000×600，1366×768为1000×518；EPUB内部columnWidth随容器变化。标准宽度实测900px。工具栏均位于正文右侧，页脚在视口内，无页面横向溢出。EPUB使用横向多栏章节iframe，iframe本身可远宽于可见区，这是引擎实现；恢复检查将Range坐标加上iframe位移后，与reader-canvas实际裁剪窗口求交，不以整章文本存在或iframe全宽代替可见性。

目录／设置开关前后比较同一iframe身份、容器和iframe尺寸及页码。修改字号／宽度、改变窗口和刷新后实际检查原文quote是否仍出现在可见窗口。网络失败为浏览器定向中断PUT模拟，不冒充真实断网事故；进度冲突由两个真实页面产生409，并验证采用服务器位置。长标题检查临时改动测试DOM，未伪造正式书名。

完整机器结果见[browser-results.json](browser-results.json)、[检查摘要](checks.json)与[前端原始检查输出](frontend-checks.txt)。严格位置检查的局部结果另见[resize-quote-results.json](resize-quote-results.json)。

## 迭代和早期失败

首轮发现全局main最大950px、header／footer基础样式污染阅读页，已以阅读器局部样式隔离。真实浏览器又发现切章键盘监听、操作后页码滞后、宽度变化内部栏宽未更新，以及窗口变化CFI漂移；均进行了适配和复测。

早期脚本也有误判：body定位操作会滚动分页、只接受202而未接受合法重复导入200、程序focus代替真实Tab，以及quote可见性最初未计算iframe位移。保留first／second／third-run及before-* JSON，它们均是**被后续检查替代的诊断记录**，不能独立用作通过结论。最终以browser-results.json为准，严格坐标检查覆盖真实可见窗口。

## 截图与视觉复核

- [改版前1440](00-before-1440.png)：本轮实际捕获的首次标题页，非旧M04图，也不是同段落前后对比。
- [1920阅读态](reader-1920.png)、[1440阅读态](reader-1440.png)、[1366阅读态](reader-1366.png)。
- [目录](contents-1440.png)、[设置](settings-1440.png)、[词典开发预览](dictionary-preview-1440.png)。
- [白色](white-1440.png)、[深色](dark-1440.png)、[390px](reader-390.png)、[22px标准宽度](reader-22-standard.png)。
- [保存失败](save-failure.png)、[真实进度冲突](progress-conflict.png)。
- [用户参考图](reference.png)、[同1672×941视口对照](comparison-1672.png)、[首轮视觉复核](01-review-1920.png)。最终对照详见[design-qa.md](design-qa.md)；稳定截图参数见[visual-review.json](visual-review.json)。

## 已知边界

词典卡片仍是开发视觉预览，示例翻译／设备朗读不是正式服务；M06收藏入口禁用。本轮不接入A02音频，不新增任何查词、收藏或翻译后端能力。

控制台仍出现历史favicon404、epub.js的unload Permissions Policy提示；故障注入产生预期ERR_FAILED，不声称控制台零提示。主包体积告警未在本轮优化。Firefox／Safari、长时间内存、大量连续拖拽、完整EPUB安全矩阵和M04全部验收仍未覆盖。最终截图的视觉复核由本轮代理完成，用户主观审美确认另行反馈，不冒称用户已验收。

历史M04及其他模块证据未改写；其他原型、Quiet Library变更、音频和词典材料保留。本轮只提交UX-R01源码、独立说明与实际证据。
