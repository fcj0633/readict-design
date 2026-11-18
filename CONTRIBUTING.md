# 资料维护与协作流程

## 文档层级

需求由 docs/requirements 管理；交互和视觉由 docs/ux 管理；技术设计、架构和 ADR 由 docs/technical 管理。prototypes 与 validation 保存可运行的验证实现。正式开发位于另一个 Git 仓库 readict-app。

## 需求变更

1. 从 [变更模板](templates/requirement-change.md) 创建 `docs/requirements/changes/CR-0001-主题.md`，编号递增。
2. 描述背景、原行为、目标行为、影响、验收及关联资料；初始状态为“草案”。
3. 明确批准后才更新需求基线和设计；旧 PRD 不因目录整理而重写版本语义。
4. 更新 [登记表](docs/requirements/changes/README.md)，将验证与开发提交关联到变更。

## 技术设计与决定

模块设计使用 [技术设计模板](templates/technical-design.md)，放到 docs/technical/architecture 下，按主题命名。涉及方案取舍的重要决定使用 [ADR 模板](templates/architecture-decision.md)，放到 docs/technical/decisions，编号递增。实验报告可以作为证据，但“建议采用”不能直接当成“已采纳”。

## 验证

使用 [验证报告模板](templates/validation-report.md)，写明运行环境、样本、方法、真实/模拟边界、成功与失败证据和限制。UI 结果按日期归档；新技术验证按主题建立独立工程。依赖、构建和临时结果留在本地，已选定的验收证据显式归档。既有实验 evidence 是历史基线，重跑前先保留版本并把新结论单独归档。

## 向开发交付

使用 [交付模板](templates/development-handoff.md)，发布 `BASELINE-0001-主题.md` 到 docs/handoffs，列明 PRD/CR/ADR/设计/验证的版本与 Git 提交，并列出阻断项。开发仓库通过基线编号与设计仓库提交引用，不使用本机绝对路径。当前尚无正式开发交付基线。

## 中文提交说明

所有提交标题与正文使用中文，示例：

```text
调整查词卡片的默认释义展示

修改：主释义之外默认展示两条释义，其余内容折叠。
原因：减少展开操作，同时保持阅读浮层紧凑。
验证：构建、独立测试和桌面浮层边界检查通过。
关联：对应的需求变更编号或设计文档。
```

只写“更新”“修改文件”等描述不充分。提交前检查差异与暂存清单；不得提交密钥、个人书籍、node_modules、dist 或新运行的临时日志。两个仓库各自提交，不在父目录操作 Git。仓库的本地 Git 提交模板不随克隆自动传播，新克隆可按本规范配置。
