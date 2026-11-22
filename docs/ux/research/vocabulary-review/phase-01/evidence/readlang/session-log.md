# Readlang 会话记录

日期：2026-11-23，Asia/Shanghai。O 记录；截图 xx 对应同目录编号。部分网页工具原始时间为 UTC，发布的观察 JSON 已转换为 +08:00。

|时间|入口/动作|样本和结果|证据|
|---|---|---|---|
|约01:22|用户登录，Home→Practice→Words|中文/英语；原有48词；今日3；可练45；Blitz默认8|01～03|
|01:23～01:25|Library→Upload→私有原创短文|Other、AI生成、Public未勾选；标题见研究方法|04；research-protocol.md|
|01:25～01:31|点译6词，第二句再点luminous；拖选look after|luminous一条目两语境；6单词+1词组；结束显示7 translated|04～06|
|01:32～01:37|读完入口 Practice7，Blitz|新词介绍、选择、纠错、同轮再现，Session complete；今日10|07～11，observed-states.json|
|01:34:07左右|harbor错误选“好奇的”|Incorrect、正确答案“港口”|09|
|随后至01:36:13|依次diligent、curious、postpone、fragile正确，look after首次介绍|4道别词作答和1个介绍后harbor再现，选对；01:36:31再次出现harbor|observed-states.json|
|01:37～01:40|Classic，4，All|strolled不会、filtered模糊、moist会、brew会；三级自评|12、13|
|01:39～01:40|Classic重复|strolled第二次不会；filtered反向题会；strolled第三次会；结束今日14|14～16|
|01:41～01:46|Mastery，4，All|the/and/his Active；stone walkway Passive；选择后输入|17、18|
|01:43:37左右|the空答按回车|Skipped、正确词、按词跳过输入选项；未勾选|19|
|01:44:35左右|and输入aardvark|Incorrect，正确and|20|
|01:45:25左右|his输入HIS|Correct!，此样本大小写被接受|21|
|01:46:22～01:46:25|the、and再现后正确输入|结束今日18；可练37|22，observed-states.json|
|01:47～01:50|Words与状态/来源筛选|全词55，Learning18，NotStarted37，Learned0、Scheduled0；来源筛选升级提示|23、24；本表|
|01:51～01:52|选择luminous→Actions→Practice Words；不答Close；从Words再选同词|进入指定词成功；Close回Practice；重启同词问题相同、干扰项不同|25、26|
|01:52～01:53|Menu→Favorite word，返回Starred|luminous变实心星，在Starred中可见；本次未继续提交该题|27、28|
|01:53～01:54|Account→Settings，只读|Flashcard mode为混合Active/Passive；发音菜单禁用，未验听感|27、29|

## 固定观察到的反馈路径

- Classic：`strolled→Not at all；filtered→Almost；moist→Yes；brew→Yes；strolled→Not at all；filtered（反向）→Yes；strolled→Yes；结束`。
- Mastery：`the空答→Skipped；and错误→Incorrect；his大写HIS→Correct；the/and再次正确输入→结束`。三类输入处理不能合并成“都记为忘记”。
- Blitz中间追踪只证明本轮再现，不提供内部重排或固定间隔公式。

## 观察记录限制

observed-states.json为44个局部状态观察，包含部分题面和反馈，不是全程事件日志或完整自动操作审计。手工输入和Classic反馈以上表及截图为准。未归档内部连续截图；正式接受的视觉证据见索引。没有保存Google登录URL、凭据、Cookie或Token。

原始辅助查询404未阻止三种练习闭环，不据此推断调度失败；当前Auto-Pronounce禁用原因未查明。词形合并、删除恢复、跨日调度和支付会员能力仍待验证。
