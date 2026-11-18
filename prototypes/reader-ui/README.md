# Readict · 原版阅读与语境收藏

首阶段可交互 UI 原型。React + TypeScript + Vite、Tailwind CSS v4、shadcn/ui（Base UI）、Floating UI、Lucide、React Router 与 Sonner。

## 本地运行

从 `readict-design` 仓库根目录执行：

```powershell
cd prototypes/reader-ui
npm install
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

打开 http://127.0.0.1:4173/ 。默认进入《Pride and Prejudice》；书架为 `#/books`，收藏为 `#/favorites`。

## 可以体验的流程

- 阅读两本内置英文样书节选，切换章节，点击翻页或使用键盘左右键。
- 点击 acknowledged、truth、fortune、extraordinary 等词语打开浮动词典；主释义之外默认再显示两条释义，余下折叠。
- 词典不添加其他例句；独立原文语境显示书中当前句子，翻译仅在主动点击后触发。
- 收藏单词及原句；同一 lemma 不重复建词，遇到新句子显示“收藏本句”。
- 在收藏中搜索、筛选、切换单词/句子视图、查看详情、返回原文和取消收藏。
- 修改字体、字号、行距、正文宽度与白/暖/深主题，实际重新分页并恢复阅读位置。
- 通过书架模拟导入和删除；删除书籍仍保留收藏的原文快照。
- Tab 进入当前页面段落，Enter 进入词语选择，左右键移动，Enter 查词，Escape 关闭。

## 可重复的异常演示

打开《Pride and Prejudice》的第三章“交互体验”：

| 内容 | 行为 |
|---|---|
| `timeout` | 首次词典请求失败，重试恢复 |
| `mystery` | 未收录词条，原文保留 |
| `storm` | 当前句子首次翻译失败，重试恢复 |
| `archive` | 首次收藏失败，重试成功 |
| `runs` / `running` | 同一 lemma 多语境收藏 |
| `extraordinary` | 长语境、长释义与内部滚动 |

模拟导入检查 .epub 后缀、非空及最大 50 MB；文件名包含 `fail` 或 `drm` 时模拟失败。成功导入仅采用文件名，并复用内置样书正文，不解析或上传文件。

## 检查与截图

```powershell
npm run build
npm run lint
npm test
npm run test:ux
node scripts/mcp-browser.mjs scripts/browser-integrity.js
```

浏览器检查需要上面的开发服务正在运行以及本机 Chrome。脚本通过官方 Playwright MCP 启动隔离的无头浏览器，不占用现有 MCP 的浏览器目录；验证记录与截图在 原型目录下的 `.artifacts/ux/`（已忽略）。

`npm test` 验证收藏归并/去重、原文范围、词义数、请求取消与导入检查。`test:ux` 验证完整用户流程；补充脚本检查分页完整性、键盘、三主题对比度和存储回退。

设计与组件划分见 [设计规范](../../docs/ux/design-spec.md)，历史视觉验收见 [2026-11-18 报告](../../validation/ui/2026-11-18/report.md)。[修订视觉稿](../../docs/ux/assets/concepts/reader-selected.png)为实现依据；历史对照图保存在该报告旁的 `evidence/`。

运行输出可通过 `READICT_UX_OUTPUT_DIR` 环境变量指定，绝对路径直接使用，相对路径以原型根目录为基准。默认输出不会覆盖归档证据。历史记录中的旧绝对路径用于追溯当时环境，不要求它们继续存在。

## 原型边界

- 样书为少量英文节选，词典只收录演示词。没有词条时明确显示未收录，不虚构释义。
- 翻译只为部分固定句子提供示例，其他句子明确说明尚未收录。
- 发音使用设备已有英语语音；无可用语音时提示，不保证每台设备能播放。
- 所有状态只保存在当前浏览器，没有真实用户系统、数据库、在线词典或翻译接口。
- 当前验证为本机 Chrome；尚未验证 Safari、Firefox 和真实 EPUB 兼容性。
- 清除浏览器站点数据会重置阅读与收藏记录。

## 参考与素材

视觉依据来自本仓库 PRD、UI/UX 文档、Word 调研中的截图，以及选定的 ImageGen 修订稿。书封通过 Open Library 的 ISBN 封面接口取得，仅用于本地样书演示：

- https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg
- https://covers.openlibrary.org/b/isbn/9780141321066-M.jpg

内置英文节选分别出自 Jane Austen 的 *Pride and Prejudice* 和 Frances Hodgson Burnett 的 *The Secret Garden*。第三章为验证交互所用的示例文字。
