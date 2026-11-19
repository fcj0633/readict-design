# ADR-0002：业务持久层采用 MyBatis-Plus 与 XML

状态：已采纳（方案），正式集成与验收未开始。日期：2026-11-19。  
确认依据：用户明确要求数据库访问改为 MyBatis／MyBatis-Plus，在选项中选择“MyBatis-Plus＋自定义 XML”，并要求实施文档修订方案。  
替代范围：[ADR-0001](ADR-0001-本机环境与本地词典及翻译技术选型.md)中原业务持久层及系统设计 0.2 的 Spring JDBC／JdbcClient 选择；本机数据库、COL、TMT、认证和音频阶段安排不变。

关联：[系统设计 0.3](../architecture/Readict-V1.1-系统技术设计.md)、[模块计划 0.2](../implementation/Readict-V1.1-模块化开发计划.md)、[M00 执行文档](../implementation/M00-工程基础与本机环境执行文档.md)。框架替换不改变产品功能，不新增需求 CR。

## 背景与证据

正式 readict-app 尚无业务代码，不存在必须执行的 JDBC 代码迁移。本机缓存有 MP 3.5.15 Boot 3 Starter 等，但没有证据证明目标 Boot 4 组合可运行；不得为使用缓存将两代 Starter 混装。

2026-11-19 官方资料确认：MP 提供 `mybatis-plus-spring-boot4-starter`，示例版本 3.5.18，且提示不要重复直接引入普通 MyBatis Starter／MyBatis-Spring。Boot 4 Flyway 使用专用 Starter，MySQL 需要 flyway-mysql。来源：[MP 安装](https://baomidou.com/getting-started/install/)、[MyBatis Starter 要求](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)、[Boot 初始化](https://docs.spring.io/spring-boot/how-to/data-initialization.html)。官方支持、本机缓存和项目实际通过必须区分。

## 决定

1. Java 21／Boot 4.1.2 目标保留，只直接引入 `com.baomidou:mybatis-plus-spring-boot4-starter:3.5.18`。MP／MyBatis 核心及适配包由该 Starter 传递解析，不再另加普通／Boot 3 Starter 或显式覆盖 MyBatis-Spring 版本。
2. 业务持久层采用 Repository → Mapper；简单单表 CRUD 用 BaseMapper，复杂 JOIN、FOR UPDATE、收藏归并／去重、游标和版本更新用显式 MyBatis XML。
3. HikariCP、Connector/J、Spring 事务不被替代；Flyway Starter＋MySQL 模块独占 schema 管理；Session JDBC 在 M01 按框架实现，不重写为业务 Mapper。
4. 用户隔离放 Repository／应用服务，Mapper 参数绑定，不拼用户 SQL；Controller 不直接接触 Mapper，selectById 不代表鉴权。
5. UUID／BINARY(16)、IdType.INPUT、UTC DATETIME(3)、首次快照／唯一约束／删除生命周期保持。统一 TypeHandler、autoResultMap、MapperScan 与资源路径。
6. 不默认启用全局逻辑删除、雪花 ID、自动 DDL、二级缓存、乐观锁／多租户／分页插件；显式版本条件和业务状态继续控制一致性。

## 替代方案与理由

- 继续 JdbcClient：SQL 透明、依赖简单，但用户明确希望采用熟悉的 MyBatis 体系，当前无实现迁移成本，故替代。
- 纯 MyBatis XML：同样可行，但常规单表需更多重复代码；选择 MP 简化 CRUD，同时复杂逻辑继续显式 SQL，不将所有操作强塞 Wrapper。
- MP 全自动策略／代码生成：省样板却可能改变既定 UUID、删除和版本语义，本版不采用；没有实际需要不额外加插件和生成工程。
- 降为 Boot 3 以复用缓存：官方已有 Boot 4 Starter，无必要单纯为缓存改现有目标；实际兼容失败先核对依赖并验证，不静默切换。

## 代价、风险与验证门槛

- 新增框架和映射配置成本；升级／缓存不匹配可能导致 Bean、SqlSessionFactory 或 XML statement 问题。M00 检查 effective POM、依赖树、实际注入和 jar 资源。
- 通用 CRUD 不能覆盖权限和锁语义；M00 建立调用边界，后续每模块真实两用户负向验证。
- UUID／null／时间在自动和自定义映射上可能不同；BaseMapper、XML、TypeHandler／毫秒精度都纳入 M00，不能仅单独测 Java 转换函数。
- 事务必须经代理且同 DataSource；用无测试事务包裹的 commit／rollback IT 证明，不以框架自动回滚替代。
- Flyway 作为唯一迁移来源，迁移与运行账号分开；test initializer 在连接和迁移前拒绝误连 readict_dev，实际连接后再复核 DATABASE()。

M00 通过条件和命令以独立执行文档为准。本次只修订文档，没有下载依赖、创建工程、访问数据库、执行上述 IT 或将模块状态改成完成。正式源码和证据在未来任务提交中追溯；本次文档提交见 Git 历史，不自动推送。
