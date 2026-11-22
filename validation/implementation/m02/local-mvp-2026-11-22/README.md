# M02 当前 COL 的 LOCAL_MVP 实施验收

日期：2026-11-22（Asia/Shanghai）。代码基线：应用 `46e2e40`，设计 `049261a`；应用实现提交：[f9be2e1](https://github.com/fcj0633/readict-app/commit/f9be2e1)，已推送；设计记录提交见本仓库 Git 历史。依据：[M02 执行文档](../../../../docs/technical/implementation/M02-COL词典数据底座技术设计与执行文档.md)、[ADR-0006](../../../../docs/technical/decisions/ADR-0006-COL本机MVP有限覆盖采用.md)及用户批准计划。

**M02 本机 MVP 词典底座完成：当前 COL 可用子集已导入并启用，内部查询验收通过；源缺陷及覆盖优化保留后续处理，完整质量门槛尚未通过。**

## 采用与不采用

沿用同一 COL，不更换、补词、在线翻译或应用人工修正表。col-extract-r4／readict-col-converter-4，仅采用必要区域完整的源记录；FAIL 的局部内容仍隔离。附加 see also／compare 不连带否定独立释义，无效链接不作为可用链接返回；其他必要引用及明确词形关系严格检查。完整 source pattern 列表仅映射到所属主组件，不根据索引名差异猜词形。

关系复核发现旧的未锚定正则会将语法说明中的片段误作目标，例如已检查的 already／plural／best／stricken 等。已限制为明确词形断言，增加回归；原释义不改写。早期 converter-2 试验包不用于开发库。最终必要关系检查使 best、tries、try 三条源继续隔离，不以字数或成功率增加为目标。

| 计数 | r3 诊断基线 | 本次 LOCAL_MVP |
|---|---:|---:|
| 全源记录 | 121872 | 121872 |
| 成功（含 ALIAS） | 91060 | 91268 |
| 跳过 | 25293 | 25293 |
| 隔离 FAIL | 5519 | 5311 |
| 词条组件 | 92644 | 92907 |
| 义项 | 147883 | 149337 |
| 正式映射 | 尚未生成 | 73624 |

实际不同 lemmaKey 为 62738，词头与映射去重后的可检索键为 88141。组件数及映射行数不能当作不同单词数。隔离数量也不能当作词典损坏数量：其中包括格式未支持、边界未识别、关系不可用及真实源缺陷。

## 数据包与独立校验

最终 datasetId：`9ebe9056-db26-8dac-99c6-f45713f0b6d9`，datasetVersion=`col-local-mvp-1`，usageProfile=`LOCAL_MVP`，adoptionPolicy=`col-local-mvp-v1`。manifest、文件字节、身份及计数见 [转换摘要](conversion-summary.json)和[manifest 元数据](bundle-manifest.json)。完整全文包仅在应用忽略目录 `.artifacts/m02-mvp-20261122-v4-b`／`v4-c`。

两次完整转换全部文件逐字节相同，包含 manifest。耗时分别 253.492／268.889 秒，进程 maxRSS 分别 693.3／490.4 MiB；包文件合计 185.20 MiB。最大 JSONL 行、原输入 SHA-256、文件摘要和每轮计数均记录于摘要；未放宽预算。验证器流式计算文件摘要，限制冻结暂存总量及每行长度。converter-4首轮A曾触发RSS超限，保留partial并拒绝发布；随后固定V8堆512MiB重跑B/C，未提高1GiB RSS门槛。最终版本还固定关系证据排序，复核与converter-3相比全部词条、义项及关系内容不变，见[语义对照](final-semantic-comparison.json)，200条已核对内容仍有效。最终forms按surfaceKey／entryId／relation的UTF-8字节序排列，已同步设计并移除ASCII后续键的locale比较；逐行复核最终73624条排序一致，输出字节不变。跨平台合成包夹具固定LF，避免Windows检出改变摘要。

Node 与 Java 独立核对源／文件摘要、sourceOrdinal 完整覆盖、UUIDv8、各表引用、字段与源位置范围、必需义项、计数及隔离原因；Java 对实际包的每个 entry／sense 重算身份，并对全部词头核对 Java 规范化结果。二者默认拒绝 LOCAL_MVP；显式 --allow-local-mvp 不允许导入采样、诊断或 partial。

## 200 条抽查

按 SHA256(JSON([sourceHash,十进制序号])) 排序，从 r3 FAIL→当前 ENTRY 和其余 ENTRY 各取100条；选择清单见 [样本清单](sample-manifest.json)。最终100条恢复样本包含按原排序补入的16813；9891因最终必要关系检查而隔离，不再属于采用池，原检查记录留在本机，不把它当未见样本。

执行代理核对200条源、237个组件、861条已输出义项，范围为中文边界、主／子词归属、IPA、rawPos、标签和顺序；完整源结构及标注留本机忽略目录。机械中文源对齐0失败，执行代理未发现严重提取错误；这不是对全词典准确率的估计，也不是用户人工审批。仅派生说明不生成假义项，子组件不继承主词IPA。

源文仍存在需后续校订的问题。例如62320 liveware的英汉对应存在疑点，61244／61259 leucocyte可见中文用字疑点，65998／65999 megaphone译名需后续核对；这些是源文内容问题的待核项，不在本次自动改写。stricken 英文关系目标残缺而中文括注有内容，本轮不猜补或生成错误目标映射。完整 FAIL 处置见 [5311条隔离清单](source-review-queue.csv)，审批状态均未修正，仅按已批准MVP策略隔离。

## 查询与性能

固定50词全部保留，真实 Provider 返回30 FOUND、3 AMBIGUOUS、17 NOT_FOUND，见 [逐词结果](fixed-50-results.csv)。未命中：read, reads, saw, see, seen, thought, think, left, leave, lie, lying, light, spring, close, open, quickly, can't。没有替换失败词或通过猜原型伪造命中。children／mice／ran／went等可通过源文件其他完整词形表的明确证据查询，不代表其缺损源记录已被修正。

| 模式 | 命中样本 | 命中 P95 ms | 未命中 P95 ms | 错误 |
|---|---:|---:|---:|---:|
| 顺序冷内容缓存 | 660 | 16.354 | 8.309 | 0 |
| 5并发冷内容缓存 | 660 | 17.678 | 7.700 | 0 |
| 顺序暖查询 | 660 | 1.475 | 1.380 | 0 |
| 5并发暖查询 | 660 | 3.477 | 2.844 | 0 |

每模式50词各20轮，共1000次；命中与未命中分别统计。冷指每次新建 Provider，未清除 MySQL／OS 缓存，也未停止共享服务。冷 P95≤300ms、暖 P95≤100ms均达到。预跑曾发现 OR＋相关子查询扩大扫描，现已改为分别使用词头／词形索引取候选ID再批量读取。最终完整结果见 [查询及性能摘要](query-and-performance.json)。


新增7词开发库真实查询：beautifully=FOUND；aah=FOUND；acclimatise=FOUND；moved=AMBIGUOUS；2,4-D=UNSUPPORTED_QUERY；3.5G=UNSUPPORTED_QUERY；a/c=UNSUPPORTED_QUERY。不支持的符号词仍返回UNSUPPORTED_QUERY，源缺陷／隔离导致的无结果仍如实返回，未补词。

## 工程验证与运行范围

Node 63／63；Java普通测试55／55；真实MySQL IT 38／38。完整回归后，对最终校验字段与缓存补充执行普通测试及lexical IT；结果无失败、无跳过，明细与双JAR摘要见 [测试摘要](test-summary.json)。未新增前端代码或HTTP接口，因此未将浏览器查词体验标为已交付。

独立工具在认证HMAC未设置时实际运行，SecurityFilterChain、SessionRepository、用户验证任务bean均为0。普通文件validate不启动Spring或连接数据库；数据库命令只加载必要配置。V1～V4原文件未修改，V5实际五表及复合外键／唯一约束生效，Foundation表集合为十四张。

| 验收 | 本次证据 |
|---|---|
| D01 | 原6.0.6全源读取证据继续有效，源摘要未变；重复key及跨块UTF-8自建夹具回归 |
| D02 | LOCAL_MVP包内抽查通过；50词覆盖如实登记，完整质量不宣称通过 |
| D03～D04 | 精确与有证据词形共同查询；歧义保留；缺字源及必要关系错误仍隔离 |
| D05～D08 | 两包逐字节一致，Node／Java身份及完整性校验；坏输入／篡改／诊断拒绝测试 |
| D09 | V5真实迁移、重复启动零增量、十四表；UUID／UTC原回归保持 |
| D10～D12 | 真实MySQL自建包幂等、同身份冲突、500行批次、2MiB参数分批、批次回滚、提交后丢响应续跑、租约接管及旧owner拦截 |
| D13～D14 | 验证失败不能READY或激活；跨dataset FK拒绝；激活竞争、同目标幂等、回退及固定Ref |
| D15 | 正／负缓存、10分钟／30秒到期、2000键／16MiB估算限制、超256KiB不缓存、版本隔离、结果副本 |
| D16 | 未配置／数据库故障独立报错，不作为未命中；文件validate不依赖DB |
| D17 | 测试对象仅按已记录UUID清理，恢复活动指针采用版本条件；实际已恢复原空活动指针，按UUID删除早期及最终测试数据集，见test-cleanup.json与test-v4-cleanup.json |
| D18 | M00／M01完整后端回归及秘密／产物提交检查；不使用数据库清空或停服务故障测试 |

丢响应及事务内故障使用受控测试钩子注入，租约过期通过精确修改本次夹具数据集的期限制造；事务、约束、断点及owner检查实际在MySQL执行。MySQL异常与并发测试使用自建最小包，数据库为真实 readict_test；完整COL用于真实导入、查询及性能。二者证据分别登记，不声称所有故障实验都用全量COL重跑。

## 开发库与清理记录

开发库前置检查发现仅V1，六张M01业务表未创建。用户随后明确批准按原样补执行V2～V4并继续启用；Flyway依次成功执行V2～V5，旧迁移文件未修改。完整COL包导入READY后，读取实际活动版本0并以条件更新激活至版本1，datasetId=`9ebe9056-db26-8dac-99c6-f45713f0b6d9`。两个独立JVM进程分别验证50词及7条新增回归，输出摘要完全一致，证明重启后活动数据与查询仍可用；认证HMAC未设置、Security／Session／用户验证任务bean均为0。新增M01业务表计数均为0，未清理任何账号或业务记录。见[启用及重启证据](dev-enablement.json)、[迁移前检查](dev-precheck.json)和[迁移后业务计数](dev-business-after.json)。

数据权利继续UNVERIFIED、snapshotAllowed=false、distributionAllowed=false，音频null；本轮未分析音频库。原r2／r3分析及全量质量未通过记录保留。后续优化处理覆盖和源质量，M05再接入阅读查词，M06再处理收藏与历史引用。

测试库清理已完成：先按UUID删除两个早期试验集并恢复空活动指针（[早期清理](test-cleanup.json)）；最终converter-4全量数据集也按UUID精确删除，活动指针经版本53条件恢复为空并递增至54（[最终清理](test-v4-cleanup.json)）。检测到外部版本变化即停止的保护仍保留。没有清理其他数据集或业务记录，V5迁移保留，开发库活动COL保留。
