# 技术设计与选型

- [M05 单词定位、词典查询与卡片技术设计与执行文档](implementation/M05-单词定位、词典查询与卡片技术设计与执行文档.md)：本机 MVP 点词、规范原文、真实 COL 卡片及 A02-05 录音接入；2026-11-25 本机 MVP 已实现，完整验收未完成，见 [实施记录](../../validation/implementation/m05/2026-11-25-local-mvp/README.md)。

- [M06 收藏、快照与回看技术设计与执行文档](implementation/M06-收藏、快照与回看技术设计与执行文档.md)：V9 三表、lemma 主体与 contextKey、三态收藏、幂等回执、书籍删除快照保留、单词／句子回看、20 并发与本机验收矩阵；0.2 本机实现与验证完成，开发库 V9 待单独批准。

- [UX-R02 阅读器比例优化与视觉原型说明](implementation/UX-R02-阅读器比例优化与视觉原型说明.md)：参考微信读书的三张独立暖色视觉方案，等待选择；[方案与复核](../../validation/implementation/ux-r02/2026-11-25/README.md)。仅视觉设计，未修改正式前端。

- [UX-R01 正式阅读器视觉改版执行说明](implementation/UX-R01-正式阅读器视觉改版执行说明.md)：选定视觉稿落地至真实EPUB.js阅读器，独立于M04历史基线；[本轮截图与验证](../../validation/implementation/ux-r01/2026-11-25/README.md)。

技术设计与实施指导集中在本目录。正式应用 M00 已完成本机阶段验收，详见 [M00 实施与验收记录](../../validation/implementation/m00/README.md)；该结果不代表后续业务模块或生产部署已完成。

- [Readict V1.1 系统技术设计文档](architecture/Readict-V1.1-系统技术设计.md)：整体架构、模块、阅读器、数据库与 API、关键一致性规则及待验证任务；区分已有证据、工程设计和候选方案。
- [Readict V1.1 模块化开发计划](implementation/Readict-V1.1-模块化开发计划.md)：本机 MySQL 开发验收、M00～M09 详细任务／依赖／退出条件和独立A02发音安排；M00 已通过本机验收，其余模块按计划推进。
- [M00 工程基础与本机环境执行文档](implementation/M00-工程基础与本机环境执行文档.md)：目标目录、依赖、账号、YAML、Mapper／XML、类型处理、事务、API、命令和排障；是实施指导，不是已通过报告。
- [M01 用户认证与个人设置执行文档](implementation/M01-用户认证与个人设置执行文档.md)：基于真实 M00 的六项执行指导、V2～V4、Session／CSRF、账号设置和本地／真实验证阶段；核心与本地模拟已验收，真实通道待接入，见 [验收记录](../../validation/implementation/m01/README.md)。
- [M01 用户认证与个人设置流程图解](implementation/M01-用户认证与个人设置流程图解.md)：11 张 Mermaid 架构／ER／流程／时序／状态图，解释 M01 各业务链路与安全边界；仅为实施辅助，不代表已完成。
- [M02 COL词典数据底座技术设计与执行文档](implementation/M02-COL词典数据底座技术设计与执行文档.md)：六项任务、转换规则、JSONL／manifest、V5五表、独立导入、版本切换与查询验收；本机 LOCAL_MVP 可用子集已启用，完整质量仍未通过，见 [M02 实施记录](../../validation/implementation/m02/README.md)。
- [M03 文件、EPUB导入与书架技术设计与执行文档](implementation/M03-文件、EPUB导入与书架技术设计与执行文档.md)：存储与有界上传、流式解压与预算、Java 安全清洗、确定性产物与文本索引、V7 四表、书籍／导入任务 API、书架前端、六项任务与验收矩阵；0.3 本机核心已实现，接口与恢复矩阵、浏览器自动检查通过；真实 EPUB、V03 全量矩阵待办（readict_dev 已于 2026-11-23 迁移 V7），未整体验收。
- [M04 阅读内核、分页与进度技术设计与执行文档](implementation/M04-阅读内核、分页与进度技术设计与执行文档.md)：ReaderEngine 适配、单页分页与重排、CFI＋quote 恢复、进度保存与冲突、V8 reading_progress、GET／PUT progress、前端阅读页、六项任务与 R01～R20 矩阵；0.2 本机核心已实现，Edge 自动检查通过；真实 EPUB 与人工视觉待办，未整体验收。
- [ADR-0003](decisions/ADR-0003-M01会话认证与分阶段验证.md)：显式认证持久化、authVersion 和分阶段所有权验证。

- [ADR-0001](decisions/ADR-0001-本机环境与本地词典及翻译技术选型.md)：已采纳的本机环境、本地 COL、TMT 等方向及验证边界。
- [ADR-0002](decisions/ADR-0002-业务持久层采用MyBatis-Plus与XML.md)：业务持久层改为 MP Boot 4 Starter＋自定义 XML；驱动、连接池、Flyway 和 Session JDBC 各司其职。

- [架构与模块设计](architecture/README.md)：系统设计入口与后续模块设计规范。
- [ADR 决策记录](decisions/README.md)：记录已确认的技术取舍及替代关系。
- [阅读器核心实验报告](../../validation/technical/reader-core/REPORT.md)：EPUB、CFI、选词、在线词典/翻译的实验结果。
- [实验运行说明](../../validation/technical/reader-core/README.md)：复现方法、样本和外部输入。

当前选择 React + TypeScript、Java 模块化单体、MyBatis-Plus＋XML、本机 MySQL80 开发验收、本地 COL 数据和 TMT 目标；epub.js 经适配器封装。密码按数字＋字母规则，真实恢复通道待接入；A02 本机音频 MVP 底座可用，正式卡片待 M05，人工试听与数据权利未确认。方向已采纳不等于完整验收通过，质量、授权、兼容、安全和依赖治理仍以实际验证范围为准。

- [A02 本地发音库处理与播放接入执行文档](implementation/A02-本地发音库处理与播放接入执行文档.md)：独立六项任务、离线MP3、数据集与私有文件、鉴权Range接口、卡片播放及独立验收；不扩张M02任务。
- [ADR-0005](decisions/ADR-0005-独立发音库与离线MP3播放.md)：独立发音库、离线MP3和分阶段验收决定；样本证据不代表正式实现通过。
- [ADR-0008](decisions/ADR-0008-EPUB安全流水线与确定性产物.md)：**已采纳**；Java EPUB 安全流水线、确定性不可变产物与 `epub-safe-v1` 的取舍；已按此方案实现本机版本（ph-css 7.0.5），采纳不等于 V03／V04 已通过。

- [M06 实施与验证记录](../../validation/implementation/m06/2026-11-25-local/README.md)：收藏、三态卡片、快照、删书保留与回原文；V9 仅测试库，开发库迁移待单独批准。
