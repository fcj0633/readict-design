# 技术设计与选型

技术设计与实施指导集中在本目录。正式应用 M00 已完成本机阶段验收，详见 [M00 实施与验收记录](../../validation/implementation/m00/README.md)；该结果不代表后续业务模块或生产部署已完成。

- [Readict V1.1 系统技术设计文档](architecture/Readict-V1.1-系统技术设计.md)：整体架构、模块、阅读器、数据库与 API、关键一致性规则及待验证任务；区分已有证据、工程设计和候选方案。
- [Readict V1.1 模块化开发计划](implementation/Readict-V1.1-模块化开发计划.md)：本机 MySQL 开发验收、M00～M09 详细任务／依赖／退出条件和音频待材料安排；M00 已通过本机验收，其余模块按计划推进。
- [M00 工程基础与本机环境执行文档](implementation/M00-工程基础与本机环境执行文档.md)：目标目录、依赖、账号、YAML、Mapper／XML、类型处理、事务、API、命令和排障；是实施指导，不是已通过报告。
- [M01 用户认证与个人设置执行文档](implementation/M01-用户认证与个人设置执行文档.md)：基于真实 M00 的六项执行指导、V2～V4、Session／CSRF、账号设置和本地／真实验证阶段；尚未实施。
- [ADR-0003](decisions/ADR-0003-M01会话认证与分阶段验证.md)：显式认证持久化、authVersion 和分阶段所有权验证。

- [ADR-0001](decisions/ADR-0001-本机环境与本地词典及翻译技术选型.md)：已采纳的本机环境、本地 COL、TMT 等方向及验证边界。
- [ADR-0002](decisions/ADR-0002-业务持久层采用MyBatis-Plus与XML.md)：业务持久层改为 MP Boot 4 Starter＋自定义 XML；驱动、连接池、Flyway 和 Session JDBC 各司其职。

- [架构与模块设计](architecture/README.md)：系统设计入口与后续模块设计规范。
- [ADR 决策记录](decisions/README.md)：记录已确认的技术取舍及替代关系。
- [阅读器核心实验报告](../../validation/technical/reader-core/REPORT.md)：EPUB、CFI、选词、在线词典/翻译的实验结果。
- [实验运行说明](../../validation/technical/reader-core/README.md)：复现方法、样本和外部输入。

当前选择 React + TypeScript、Java 模块化单体、MyBatis-Plus＋XML、本机 MySQL80 开发验收、本地 COL 数据和 TMT 目标；epub.js 经适配器封装。密码按数字＋字母规则，恢复服务待定；音频待用户后续文件。方向已采纳不等于实现已通过，质量、授权、兼容、安全和依赖治理仍以实际验证门槛为准。
