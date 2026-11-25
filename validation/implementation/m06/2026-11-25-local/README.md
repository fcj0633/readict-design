# M06 收藏、快照与回看：本机实施和验证

日期：2026-11-25（Asia/Shanghai）。应用实现提交 `2e43155`；应用起点 `2b9af06`，设计起点 `304cc66`。本轮按用户“根据 M06 任务开发计划进行开发”的指令实施；保留设计仓库原有的原型、需求变更、audio/、dict/ 等未提交内容。

状态：**M06 本机功能与验证已完成**。最终代码遵循 Mapper/XML，完整回归、契约增补和浏览器复跑通过。开发库 V9 仍需单独批准，本记录不代替批准。

执行依据：[M06 0.1 原计划／0.2 状态](../../../../docs/technical/implementation/M06-收藏、快照与回看技术设计与执行文档.md)、[ADR-0002](../../../../docs/technical/decisions/ADR-0002-业务持久层采用MyBatis-Plus与XML.md)。原有退出条件不降低为“本机 MVP”。

## 实现对应

| 任务 | 交付与证据 |
| --- | --- |
| M06-01 | V9 三表、用户＋lemma／主体＋contextKey 唯一约束、快照字段和 FK；ContextKey 固定 UTF-8／大端向量；测试库 26 表 |
| M06-02 | lookup receipt 冻结义项最小快照；Session 范围、索引重建来源、首主体与首语境同事务；NONE／WORD／CONTEXT |
| M06-03 | 单词／句子投影、LIKE 字面转义、来源筛选、排序和绑定查询条件的稳定游标、详情和来源可用性 |
| M06-04 | 整主体取消、级联语境、24h 保存回执、同 key 异内容拒绝、取消后旧请求不复活、保存／删除竞争 |
| M06-05 | 删除书籍事务内解绑 book/chapter；快照继续可读；物理删除的 SET NULL 兜底；来源不可用不返回 anchor |
| M06-06 | 三态卡片、保存失败和原 key 重试、确认删除、收藏页与阅读工具栏入口、核验后回原文、390px 布局 |

收藏持久层为 `FavoriteRepository → FavoriteMapper → FavoriteMapper.xml`，遵循既定 MyBatis-Plus／XML 方案；复杂锁、归并、游标与快照 SQL 均在 XML，参数绑定；无业务 JdbcTemplate、`${}` 用户 SQL 或额外框架。原 BookMapper 的所属书锁与收藏 SQL 共享 Spring 事务，READ COMMITTED，瞬时冲突最多重试两次。

新增辅助接口 `GET /favorites/stats` 返回总主体／语境数；`POST /favorites/state-source` 从索引验证来源并寻找已有主体，供词典不可用时的 favoriteId 追加。后者依赖已有首词形／历史数据集词形证据，不允许创建未确认的首次收藏。

前端只将请求契约允许的 source 字段发送给服务器。收藏页和详情以纯文本渲染快照。返回阅读保留当前阅读锚点；明确回原文时核对 artifactId/hash/pipeline，交给引擎核验 CFI／唯一 quote，失败回章节并提示。目标词高亮依据核验后的索引位置重建，不插入正文包词节点。

## 数据库范围

- 只执行 `readict_test`，运行账号 `readict_test_app`，迁移账号独立；连接和测试清理都复核目标。
- V9 首次执行 1 个迁移，之后启动 0 个。`FoundationIT` 核对 26 张表、重复迁移和历史校验。原 V1～V8 未修改，见 [基线摘要](migration-baseline.json)。
- 三表 DDL、FK、索引、CHECK 和查询计划见 [schema-and-explain.txt](schema-and-explain.txt)。LIKE 前导通配不承诺 B-tree／全文检索性能。
- 开发库未迁移 V9，未启动新版本连接开发库；后续启用前单独批准。

## 验证结果

| 检查 | 实际结果 |
| --- | --- |
| 后端普通测试 | `mvn test` 所覆盖的 110 项通过；不连接数据库 |
| 后端全量 MySQL IT | `mvn -Pmysql-it verify`：110 项普通测试＋67 项 IT 全部通过 |
| 最终契约增补 | 5 项相关普通测试＋11 项收藏 IT 通过，含跨账号 HTTP 404、fallback state-source、未确认词条拒绝 |
| 前端检查 | lint 通过；62 项测试通过；构建通过，保留现有大包提示 |
| 浏览器首轮 | 1440×900、390×844，真实登录／导入／查词／收藏／追加／详情／搜索／筛选／返回阅读／回原文／取消／删书保留 |
| 响应丢失 | 在真实提交后丢弃响应，再点击重试；两次同一 key，最终 1 主体／1 语境 |
| 移动端 | 390px 页面未横向溢出；详情、删除确认和空态截图已归档 |

`FavoriteIT` 的 11 项覆盖：20 并发同词同句、同句多目标不重复、首次快照不覆盖、同词不同位置追加、两用户隔离、稳定分页及查询条件绑定、搜索 `%_!` 转义、24h 回执过期、取消后旧回执 deleted、保存／取消竞争、跨书籍并发归并、context 写入失败回滚、解绑失败回滚、删书与物理清理后快照保留。鉴权与 CSRF 通过真实 HTTP；控制故障通过测试 Spy／浏览器拦截注入，不能当作真实数据库宕机证据。

测试账号、书籍、收藏、回执及临时词典行按本轮精确 ID 清理；活动词典恢复为原来的 NULL，版本按 CAS 递增，不倒改版本。忽略目录中可保留自建样书和排障产物，不提交个人资料或凭据。

## 首轮失败与修复

1. 自建索引长度标错，来源验证拒绝；修正夹具，不放宽生产校验。
2. DATETIME 返回 LocalDateTime，强转 Timestamp 失败；明确按 UTC 解码。
3. 首轮全量回归与浏览器服务同时消费同一测试库的导入任务，不同存储根导致 3 项书籍测试失败；关闭验收服务，各测试私有根独立、结束后关闭上下文，默认测试根为空，重跑全量通过。
4. 本机运行中的 JAR 被打包过程占用；预览改为运行忽略目录中的副本，构建与运行产物分离。
5. 浏览器发现原 M03 前端将 `202 {bookId,state:DELETING}` 按空响应解析；改为校验删除回执并补测试。该项为既有删除范围内缺陷，不修改 M03 历史验收结论。
6. 最后按 ADR-0002 将收藏持久层收敛到 Repository／Mapper／XML，重新执行完整回归，结果独立于整理前的通过记录。

最终检查摘要见 [test-results.json](test-results.json)，结构化运行历史见 [verification-history.json](verification-history.json)。本轮未改写历史证据或把失败计入通过。

## 浏览器证据与边界

最终包复跑：见 [browser-summary.json](browser-summary.json) 及 `final-xml/`。Chromium 158.0.8127.37，首次收藏＋第二句追加为 1 主体／2 语境；回原文提示原句核验成功，屏幕高亮与目标词 Range 的位置误差小于 1 CSS px；390px 无横向溢出；删书 HTTP 202、界面 0 错误，两条快照保留且回原文链接为 0；整主体取消后计数均为 0。最终两个预览服务已停止。

首轮：`01-saved-1440.png`、`02-detail-1440.png`、`03-return-1440.png`、`04-sentences-1440.png`、`05-sentences-390.png`、`06-card-390.png`、`07-deleted-source-390.png`、`08-delete-confirm-390.png`、`09-empty-390.png`。

自建 `child/children` 词条和英文样书用于验证功能，查词仍走正式 DictionaryProvider、MySQL 和正式阅读器；这不是完整 COL 数据质量、权利或音频试听验收。音频未配置不影响收藏。

最终复跑的首张截图遇到初始字体重排，卡片按阅读器既有重排行为关闭；该截图保存在 `final-xml/00-initial-reflow-1440.png`，不列为卡片成功证据。等待字体和版式稳定后重跑，卡片保持、追加、回原文高亮和删书保留通过，成功截图单独保存，不覆盖初始截图。

仅验证本机 Chromium 的上述尺寸与流程。EPUB.js 既有 iframe 禁脚本及 unload 策略控制台信息另列，不放开沙箱权限。没有声称 Firefox／Safari、生产部署、全量大书、完整无障碍／性能矩阵通过。翻译、复习、导出、分享和自动重连已删来源不在 M06 原范围。
