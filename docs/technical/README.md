# 技术设计与选型

当前尚未发布完整的正式开发技术方案。

- [架构与模块设计](architecture/README.md)：未来按主题编写技术设计，使用统一模板。
- [ADR 决策记录](decisions/README.md)：记录已确认的技术取舍及替代关系。
- [阅读器核心实验报告](../../validation/technical/reader-core/REPORT.md)：EPUB、CFI、选词、在线词典/翻译的实验结果。
- [实验运行说明](../../validation/technical/reader-core/README.md)：复现方法、样本和外部输入。

实验建议保留 React + TypeScript + epub.js 为候选，尚有标准英汉词典、兼容性和依赖治理等未决问题。目录迁移与构建检查不能将这些未决问题改写为已解决。以实验报告的实际结论和限制为准。
