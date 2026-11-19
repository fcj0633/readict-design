# 技术设计与选型

当前已形成正式开发技术设计草案，尚未实现或发布开发交付基线。

- [Readict V1.1 系统技术设计文档](architecture/Readict-V1.1-系统技术设计.md)：整体架构、模块、阅读器、数据库与 API、关键一致性规则及待验证任务；区分已有证据、工程设计和候选方案。

- [架构与模块设计](architecture/README.md)：系统设计入口与后续模块设计规范。
- [ADR 决策记录](decisions/README.md)：记录已确认的技术取舍及替代关系。
- [阅读器核心实验报告](../../validation/technical/reader-core/REPORT.md)：EPUB、CFI、选词、在线词典/翻译的实验结果。
- [实验运行说明](../../validation/technical/reader-core/README.md)：复现方法、样本和外部输入。

系统设计选择 React + TypeScript 和经适配器封装的 epub.js 作为实施方向；这不等于技术已全面通过生产验收。标准英汉词典、兼容性、安全处理和依赖治理等问题仍以设计中的验证门槛及实验报告的实际结论为准，目录迁移与构建检查不能将其改写为已解决。
