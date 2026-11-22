# 阶段一：竞品真实功能调查

任务：`RESEARCH-REVIEW-01`；调查日期：2026-11-23（Asia/Shanghai）。状态：**阶段一报告已提交，待人工评审**。

## 阅读顺序

1. [不背单词功能报告](reports/bubeidanci.md)：USB 真机操作，新学、复习、拼写退出、收藏与词本。
2. [Readlang 功能报告](reports/readlang.md)：真实登录会话，阅读积累、多语境、Blitz / Classic / Mastery、词表与付费边界。
3. [竞品深度分析：目标用户、功能逻辑、功能对比、产品现状、页面体验与结论](reports/competitive-experience-analysis.md)：以不背单词为主要参考，区分观察事实与设计推论；按要求不分析数据表现。
4. [对照矩阵、设计问题与候选机制](reports/comparison-and-questions.md)：覆盖用户提出的十个重点。
5. [证据索引](evidence/index.md)、[证据清单与摘要](evidence/manifest.json)、两产品的会话记录。
6. [研究方法与环境](research-protocol.md)、[人工评审记录](review-record.md)。

## 本次完成与边界

- 手机：一加 Ace 5、Android 16、不背单词 5.9.21，USB 连接、屏幕读取和输入控制均实测通过。完成一组 10 词辨识；复习组包含进入前已完成的 1 词，本次新增完成 9 词；可选拼写只测试错误和放弃分支。
- Readlang：用户登录可控 Chrome，中文母语/学习英语，Free Limited。新增私有短文与 7 个词/词组，完成 Blitz 7、Classic 4、Mastery 4 条目；账号已有今日 3 条，本次后显示 18。
- 结论区分实际观察、官方说明、推断和待验证。不是算法审计、学习效果实验或完整兼容性验收。
- 不改 Readict 业务代码、PRD、算法、数据表或技术架构；V1.1 保持收藏定位，不创建复习需求批准或 ADR。
- 16 个编号待验证问题列在两份报告，含长期调度、纯首次学习、删除/重置、会员差异与音频听感。

研究期间账号数据变化已获用户授权，无恢复要求。没有购买会员、公开分享样本文本、发送消息或自动进入阶段二。其他未提交工作原样保留。
