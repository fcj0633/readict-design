# 2026-11-18 双仓库迁移记录

本次仅整理实际开发前的资料并修复迁移路径，没有把原型或技术实验接入正式开发仓库，也没有改变已归档功能、网络、安全和兼容性结论。

## 迁移映射

| 原位置（父工作目录下） | 新位置（readict-design 仓库下） |
|---|---|
| 原版书英语阅读与场景化词汇学习系统_PRD_V1.1.md | docs/requirements/prd/PRD-v1.1.md |
| ui-ux设计需求.md | docs/ux/requirements.md |
| 阅读器界面调研分析.docx | docs/ux/research/阅读器界面调研分析.docx |
| frontend/ | prototypes/reader-ui/ |
| frontend/DESIGN.md | docs/ux/design-spec.md |
| frontend/design-qa.md | validation/ui/2026-11-18/report.md |
| experiments/reader-tech-spike/ | validation/technical/reader-core/ |
| artifacts/ux/concepts/ | docs/ux/assets/concepts/ |
| artifacts/ux/references/ | docs/ux/assets/references/ |
| artifacts/ux/ 中其余文件 | validation/ui/2026-11-18/evidence/ |
| .playwright-mcp/（空） | .local/playwright-mcp/（忽略） |

`readict-app` 是平级独立 Git 仓库，仅建立 main 分支及首次空提交，无工程骨架。父目录没有 Git 仓库。

## 文件完整性

- [迁移前清单](inventory-before.json)：218 个原始文件的路径、大小和 SHA-256；不含依赖和构建目录。
- [移动后核对](integrity-after-move.json)：218 个文件移动后均存在且哈希完全一致。
- [最终核对](verification-final.json)：列出后续有意调整的运行脚本、说明及链接，并检查其他文件未变。
- [核对脚本](verify-migration.py)：可重复执行，检查缺失文件、未授权内容变化、主要文档链接和旧输出路径。

原始 PRD、UI 需求、Word、图片、样书、实验 REPORT 和原始证据保持字节不变。有意调整仅涉及当前导航、运行说明与原型输出路径；历史日志和追踪中的旧绝对路径保持原样。依赖、构建与临时测试产物留在本地但不提交。

## 新位置验证

| 检查 | 结果 |
|---|---|
| UI 原型生产构建 | 通过 |
| UI 原型静态检查 | 通过，无警告 |
| UI 原型独立测试 | 5 项通过 |
| UI 原型浏览器检查 | 41 项通过；脚本异常 0、控制台错误 0 |
| 默认输出目录 | 已写入 prototypes/reader-ui/.artifacts/ux，未覆盖归档 |
| READICT_UX_OUTPUT_DIR 覆盖 | 已以 .artifacts/migration-output-check 验证 |
| 技术实验构建 | 通过；保留既有大包体积提示 |
| 技术实验单元测试 | 4 项通过 |

浏览器结果摘要见 [本次检查记录](browser-check-results.json)。新运行的大量截图和完整 MCP 输出留在原型 `.artifacts/`，不混入旧 UI 验收证据。本次未重跑技术实验的真实联网、跨浏览器和安全验收，不改变其原有已知限制。

## 运行与外部输入

UI 原型端口 4173；技术实验开发端口 5174、构建预览端口 5175。原有这三个预览服务因迁移暂停后，已从新目录重新启动。

实验测试和性能脚本仍包含可选用户 EPUB 的本机下载目录路径。该书不随仓库分发，缺失时对应测试可跳过；换设备需自行提供或修改输入路径。Git 提交模板为本地配置，不随仓库克隆传播。既有报告与原始结果里的旧路径仅用于追溯历史环境。

## Git 提交约定

两个仓库都使用中文提交标题和正文，记录修改、原因、验证与关联资料。沿用现有作者身份，不修改全局 Git 配置；本次不建立远程仓库、不推送、不添加提交钩子。
