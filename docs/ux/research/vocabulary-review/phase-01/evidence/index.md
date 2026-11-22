# 证据索引

任务：`RESEARCH-REVIEW-01`；查阅日期：2026-11-23（Asia/Shanghai）。

## 编号和边界

`RL-O-*` / `BB-O-*` 为实际观察，`RL-D-*` / `BB-D-*` 为官方资料。截图放在本目录对应产品子目录；操作记录写在各产品报告。官方材料不补造未完成的实操，历史说明不能证明当前 UI 与规则完全相同。

## 官方资料

|编号|来源|发布日期及作者|可支持的有限结论|限制|
|---|---|---|---|---|
|RL-D-01|[Learn Words with Flashcards](https://forum.readlang.com/t/learn-words-with-flashcards/54)|2024-06-05，steve|Classic：选卡数、在句中回忆、揭示答案、必要时编辑、自评；官方称使用受 SM2 启发的间隔重复，并参考词频|仅适用于 Classic；不能据此还原当前公式|
|RL-D-02|[How do I use the practice tab](https://forum.readlang.com/t/how-do-i-use-the-practice-tab/4481)|2025-10-08，steve 回复|Mode 区分 Classic、Blitz 选择题、Mastery 含输入题；Length 为词/词组数；Source 可指定文本，说明称至少翻译该文 6 个词|需实测当前语言与账号是否适用；不代表固定每日必做量|
|RL-D-03|[How do I add words to practice](https://forum.readlang.com/t/how-do-i-add-words-to-practice/454)|2024-08-09，Steve 回复|星标提高优先级但仍遵守调度；词表可选择条目后 Actions → Practice Flashcards|不是“星标每天必出”；历史入口需实测|
|RL-D-04|[Feedback wanted on new practice session](https://forum.readlang.com/t/feedback-wanted-on-new-practice-session/59)|2024-06-05 起，Steve 的首帖及后续回复|新模式按选择/输入表现判分；首次呈现可用于检查释义；Mastery 可区分主动与被动回忆；错误后可能在同一轮重复|只采用维护者明确说明，不把用户意见或提议写成已实现功能|
|RL-D-05|[Feedback wanted… page 2](https://forum.readlang.com/t/feedback-wanted-on-new-practice-session/59?page=2)|2024 年，具体回复日期未核实；Steve 回复|Blitz 用于避免输入题；Mastery 可按词关闭输入，空答后可能出现对应选项|具体选项和当前行为待实测|
|RL-D-06|[Feedback wanted… page 3](https://forum.readlang.com/t/feedback-wanted-on-new-practice-session/59?page=3)|2024-07-03、07-12，Steve 回复|当时说明 Mastery 大小写不敏感；设置中的无输入选项当时仅用于 Classic；按词跳过输入曾修复|历史修复记录不等于本次回归通过|
|RL-D-07|[Delete Button for Flashcard Review](https://forum.readlang.com/t/delete-button-for-flashcard-review/1601)|2025-01-09，Steve 回复|官方当时增加 Blitz/Mastery 的 Ctrl+D（Mac 为 Cmd+D）删除快捷键|当前删除确认、影响和恢复能力待测|
|BB-D-01|[不背单词官网](https://www.bbdc.cn/)|页面未标版本；查阅于 2026-11-23|官方介绍真实语境原声例句、词根词缀、动态学习安排、拼写测试和柯林斯词典|宣传页不披露具体调度公式；页面中的历史用户评价不作为本次规则或反馈证据|

## 连接准备记录

|编号|时间|检查及结果|证据范围|
|---|---|---|---|
|ENV-01|2026-11-23，约 01:08–01:13|Windows WPD 列出一加 Ace 5；浏览器工具原仅有空白标签|只证明设备识别和独立浏览器会话存在|
|ENV-02|2026-11-23，约 01:12–01:18|Readlang 首页可加载、控件可读取，点击 Sign in 后出现 Apple/Google/email 登录选项|未证明登录后学习或复习可用|
|ENV-03|2026-11-23，约 01:18–01:20|官方 scrcpy 5.0.1 包摘要核对一致；adb 启动成功，设备列表为空|未完成 USB 调试授权和手机画面/输入验证|

连接记录来自当次工具返回，不伪造截图或录屏。正式功能证据在连接就绪后追加。
## 正式实测证据

2026-11-23 用户完成两端准备后，Readlang登录与手机USB控制均通过。准备阶段的空设备列表和待登录状态不代表当前受阻。

- [不背单词会话记录](bubeidanci/session-log.md)、[部分连续状态](bubeidanci/observed-states.json)
- [Readlang会话记录](readlang/session-log.md)、[部分连续状态](readlang/observed-states.json)
- [截图尺寸、保存时间和SHA-256](manifest.json)。共71张正式截图，均为当次实际画面并已查看。
- Readlang编号10的首次词组图因底部操作区裁切而拒收，保存在本机忽略目录；正式索引保留缺号。NEW PHRASE事实有当次DOM和局部连续记录支持，不以拒收图作视觉依据。
- `RL-O-10` 作为非截图事件编号保留：01:36:12（+08:00）读到 `NEW PHRASE / look after`，含义为“照看”，并有 Explain or edit / Continue；见 [Readlang 连续状态](readlang/observed-states.json) 与会话记录。截图清单没有 10，不代表把拒收图片作为证据。
- 初始部分文件命名沿用了预期动作；归档已更正明显误名，并以本表中实际画面为准。推广/升级提示是阻挡状态证据，不能冒充成功功能页。

### 不背单词

|编号|实际画面|截图|保存时间（+08:00）|
|---|---|---|---|
|BB-O-01|USB调试开启画面（连接证据）|[查看](bubeidanci/01-connection-screen.png)|01:24:02|
|BB-O-02|首页推广层，非学习卡片|[查看](bubeidanci/02-home-promotion.png)|01:24:26|
|BB-O-03|仍有待复习词时的新学提示|[查看](bubeidanci/03-learn-setup.png)|01:24:49|
|BB-O-04|Learn四选一题面|[查看](bubeidanci/04-new-word.png)|01:25:07|
|BB-O-05|看答案后的语境和助记|[查看](bubeidanci/05-new-word-answer.png)|01:25:28|
|BB-O-06|正确选择后的阶段标记|[查看](bubeidanci/06-new-correct.png)|01:25:59|
|BB-O-07|学习卡更多菜单|[查看](bubeidanci/07-learning-options.png)|01:26:23|
|BB-O-08|当前学习设置|[查看](bubeidanci/08-learning-settings.png)|01:26:58|
|BB-O-09|带语境的认识/不认识题|[查看](bubeidanci/09-recognition-question.png)|01:27:45|
|BB-O-10|不认识后揭示答案|[查看](bubeidanci/10-recognition-forgot.png)|01:27:52|
|BB-O-11|故意选错后的红/绿纠正|[查看](bubeidanci/11-wrong-choice.png)|01:28:28|
|BB-O-12|认识后允许记错了|[查看](bubeidanci/12-recognized-can-correct.png)|01:30:08|
|BB-O-13|第一个词完成，1/10|[查看](bubeidanci/13-first-word-complete.png)|01:30:33|
|BB-O-14|8/10退出后的首页余量|[查看](bubeidanci/14-exit-learning.png)|01:39:04|
|BB-O-15|重进保留8/10但换词|[查看](bubeidanci/15-resume-learning.png)|01:39:18|
|BB-O-16|辨识10/10|[查看](bubeidanci/16-learn-ten-complete.png)|01:40:55|
|BB-O-17|辨识完成与可选整组拼写|[查看](bubeidanci/17-post-learning.png)|01:40:59|
|BB-O-18|整组拼写题面|[查看](bubeidanci/18-spelling-start.png)|01:41:16|
|BB-O-19|错误拼写与正确答案对照|[查看](bubeidanci/19-spelling-incorrect.png)|01:41:44|
|BB-O-20|放弃拼写的限制提示|[查看](bubeidanci/20-exit-spelling.png)|01:41:56|
|BB-O-21|辨识组小结/答错次数|[查看](bubeidanci/21-learning-summary.png)|01:42:13|
|BB-O-22|学习会话结束统计|[查看](bubeidanci/22-learning-session-complete.png)|01:42:34|
|BB-O-23|Review三级自评题面|[查看](bubeidanci/23-review-question.png)|01:42:45|
|BB-O-24|忘记了后的详情|[查看](bubeidanci/24-review-forgot.png)|01:43:06|
|BB-O-25|模糊后的详情与纠正入口|[查看](bubeidanci/25-review-vague.png)|01:43:42|
|BB-O-26|Review10/10完成词|[查看](bubeidanci/26-review-ten.png)|01:46:59|
|BB-O-27|记错了退回9/10|[查看](bubeidanci/27-review-correction.png)|01:47:14|
|BB-O-28|复习反向题（英文隐藏）|[查看](bubeidanci/28-review-repeat.png)|01:47:27|
|BB-O-29|一次不认识后同词立即再现|[查看](bubeidanci/29-review-repeat-after-failure.png)|01:47:42|
|BB-O-30|第二次不认识后的答案|[查看](bubeidanci/30-review-second-failure.png)|01:48:04|
|BB-O-31|复习小结/1天/61天/剩余447|[查看](bubeidanci/31-review-completion.png)|01:48:24|
|BB-O-32|返回首页出现推广层|[查看](bubeidanci/32-home-promotion.png)|01:49:18|
|BB-O-33|我的内容与词书/已学/词本入口|[查看](bubeidanci/33-content-books.png)|01:49:44|
|BB-O-34|单词本列表，生词本2词|[查看](bubeidanci/34-wordbooks.png)|01:50:00|
|BB-O-35|生词本列表和辅助工具|[查看](bubeidanci/35-custom-wordbook.png)|01:50:14|
|BB-O-36|词条行内展开释义|[查看](bubeidanci/36-custom-word-detail.png)|01:50:33|
|BB-O-37|词本更多菜单|[查看](bubeidanci/37-wordbook-options.png)|01:50:46|
|BB-O-38|批量编辑态|[查看](bubeidanci/38-wordbook-batch.png)|01:51:28|
|BB-O-39|在学四级词书未学习2845|[查看](bubeidanci/39-active-book.png)|01:51:46|
|BB-O-40|本次流程后的首页2845/447|[查看](bubeidanci/40-home-after-sessions.png)|01:52:19|
|BB-O-41|星标instruct，进度仍0/10|[查看](bubeidanci/41-save-word.png)|01:53:15|
|BB-O-42|生词本增为3词|[查看](bubeidanci/42-saved-word-in-book.png)|01:53:39|
|BB-O-43|instruct仍处未学习筛选|[查看](bubeidanci/43-saved-unlearned.png)|01:53:56|

### Readlang

|编号|实际画面|截图|保存时间（+08:00）|
|---|---|---|---|
|RL-O-01|Dashboard入口与连续学习目标|[查看](readlang/01-dashboard.png)|01:22:45|
|RL-O-02|Practice参数和初始今日3|[查看](readlang/02-practice-setup.png)|01:22:56|
|RL-O-03|初始词表48|[查看](readlang/03-words-baseline.png)|01:23:16|
|RL-O-04|阅读点击译文|[查看](readlang/04-reading-translation.png)|01:25:54|
|RL-O-05|luminous一词两条语境|[查看](readlang/05-word-two-contexts.png)|01:28:08|
|RL-O-06|阅读结束/7条目练习入口|[查看](readlang/06-reading-finished.png)|01:31:59|
|RL-O-07|Blitz新词介绍|[查看](readlang/07-blitz-new-word.png)|01:32:28|
|RL-O-08|Blitz选择题|[查看](readlang/08-blitz-question.png)|01:34:06|
|RL-O-09|Blitz错误反馈|[查看](readlang/09-blitz-incorrect.png)|01:34:42|
|RL-O-11|Blitz结束/今日10|[查看](readlang/11-blitz-session-complete.png)|01:37:05|
|RL-O-12|Classic问号题面|[查看](readlang/12-classic-question.png)|01:37:53|
|RL-O-13|Classic当前三级自评|[查看](readlang/13-classic-three-ratings.png)|01:38:10|
|RL-O-14|遗忘词同轮再现|[查看](readlang/14-classic-forgotten-reappears.png)|01:39:13|
|RL-O-15|Classic反向卡和可选Typing Mode|[查看](readlang/15-classic-reverse-card.png)|01:40:00|
|RL-O-16|Classic结束/今日14|[查看](readlang/16-classic-session-complete.png)|01:40:54|
|RL-O-17|Mastery按词选择Active/Passive|[查看](readlang/17-mastery-learning-choice.png)|01:41:30|
|RL-O-18|Mastery输入题面|[查看](readlang/18-mastery-typing-question.png)|01:43:36|
|RL-O-19|空答Skipped和跳过输入选项|[查看](readlang/19-mastery-skipped.png)|01:43:53|
|RL-O-20|错误输入Incorrect|[查看](readlang/20-mastery-incorrect.png)|01:45:03|
|RL-O-21|大写HIS正确|[查看](readlang/21-mastery-uppercase-correct.png)|01:45:43|
|RL-O-22|Mastery结束/今日18|[查看](readlang/22-mastery-session-complete.png)|01:46:58|
|RL-O-23|Free Limited来源筛选升级提示|[查看](readlang/23-source-filter-upgrade.png)|01:47:55|
|RL-O-24|Learning18状态列表|[查看](readlang/24-learning-state-list.png)|01:48:47|
|RL-O-25|指定luminous立即练习|[查看](readlang/25-selected-word-practice.png)|01:51:22|
|RL-O-26|未答退出后重新指定同词/干扰项变化|[查看](readlang/26-selected-word-restart.png)|01:52:13|
|RL-O-27|练习菜单/自动发音禁用|[查看](readlang/27-practice-menu.png)|01:52:37|
|RL-O-28|luminous星标后在Starred中|[查看](readlang/28-starred-sample.png)|01:53:16|
|RL-O-29|当前Active/Passive混合设置|[查看](readlang/29-recall-settings.png)|01:54:24|

## 非结论和资料限制

O证据没有覆盖的规则保留Q。D证据只表示官方在对应发布时间说过，不能取代当前界面或验证隐藏公式；I仅用于候选机制和研究问题。没有收集真实用户访谈、学习效果、长期留存或满意度数据。

没有全程录屏，因此不提供虚构录屏时间戳。没有把账号凭据、手机序列号、个人EPUB文件、临时工具、OAuth链接或原始完整UI导出纳入本资料。
