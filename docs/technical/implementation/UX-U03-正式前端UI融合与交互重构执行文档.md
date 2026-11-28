# UX-U03 正式前端 UI 融合与交互重构详细设计及执行文档

- 版本：0.1；日期：2026-11-28；状态：详细设计已形成，待实施与视觉验收（不代表代码已修改）。
- 任务：UX-U03，承接 UX-U01／UX-U02、CR-0004／CR-0005；独立于 M01～M06 历史验收与 M07～M09 后续业务开发。
- 设计输入：readict-design main `9e304fcd081d6cd479ee575071e194c99dd386c3`；正式工程输入：readict-app main `6fcda1b3024c0314ad50a6ff592161eb52da6f55`。以下路径以相应仓库根目录为准。
- 本轮用户明确决定：将最新融合原型应用到正式前端；按原型的路由和导航效果重组；昵称等尚无正式实现的功能只保留接口/扩展点；不实现词典与发音设置界面。保留已有真实查词与录音播放。
- 本文仅为实施契约，不批准额外后端业务、数据库迁移或生产部署；最终视觉仍需人工确认。没有运行本机应用或逐像素复核截图，以下现状基于上述提交源码及既有报告，实际实施前须按第 9 节复核。

## 1. 目标、范围与不变量

目标是把当前正式工程从早期账号式页面布局升级为 UX-U02 的中性私人书架：书架和收藏为一级导航，头像菜单承载个人账户、阅读设置、退出登录；账号、认证、收藏与设置使用统一中性外观；独立阅读器保留已实施的 UX-R01 及 M04～M06 真正业务链路。

| 范围 | 本次实施 |
| --- | --- |
| 品牌、导航、通用页面 | 统一 Brand、应用 Shell、头像菜单、页脚、按钮、表单、弹窗、反馈 |
| 书架 | 继续阅读、固定比例封面、书籍网格、真实搜索/分页/导入/删除及异常 |
| 个人账户与认证 | 账户身份、联系方式状态、真实验证入口及改密弹窗，登录/注册/找回/重置，真实退出 |
| 阅读设置 | 五个已有阅读字段的控制、即时预览、真实自动保存、冲突和跨页一致性 |
| 收藏 | 单词/句子视图、筛选、排序、游标、详情、取消收藏、回原文 |
| 阅读器 | 仅必要品牌、路由衔接、设置共享状态适配；不改阅读器主体的已确认布局 |
| 未实现资料能力 | 昵称、头像上传、联系方式绑定/换绑：保留前端类型/能力边界，隐藏不可用的操作；不发出不存在的请求 |
| 词典与发音设置 | **不创建页面、不提供菜单/分类入口**；既有 pronunciation 字段原样保留；真实词典卡片、音频接口与播放器照常使用 |
| 不在本轮 | 翻译 M07、复习、会员、AI 消歧、真实邮件/短信供应商、生产环境、安全全矩阵、M08 清理、M09 全量验收 |

不可破坏的约束：

1. 当前需求基线仍为 PRD V1.1：主动收藏、同 lemma 主体与多语境，不扩张复习范围；未获采纳的昵称不进入 PRD 业务基线。
2. 不导入原型的 Mock、DemoProvider、示例账号、样书、示例进度、模拟认证/翻译、浏览器 TTS 或 localStorage 业务数据。正式页面只能使用已存在的 API 和服务器返回的数据。
3. 正式应用依旧 BrowserRouter；不移植 HashRouter、user-center.html 或原型演示状态工具。保持正式前后端独立构建，运行时不依赖 design 仓库。
4. 保持 Session JDBC、CSRF、所有权验证、幂等请求、版本检查、API 解码、错误契约、文件安全处理。不得改 V1～V9、增加 V10 或使用 root/开发库做验收。
5. 保留 EPUB.js 适配器、iframe 沙箱、文本索引/Range/CFI、quote 恢复、进度同步、查词竞态、录音生命周期、收藏回执及快照。不得为了视觉效果修改正文 DOM 或降低校验。

## 2. 输入材料与源码现状

### 2.1 设计资料优先顺序

- [需求入口](../../requirements/README.md)、[PRD V1.1](../../requirements/prd/PRD-v1.1.md)、[CR-0004](../../requirements/changes/CR-0004-用户中心交互原型.md)、[CR-0005](../../requirements/changes/CR-0005-原型融合与中性视觉优化.md)。
- [UX-U02 融合报告与最终截图](../../../validation/ui/2026-11-27/integration/README.md)为本次应用外壳与页面视觉基线；[UX-U01 用户中心报告](../../../validation/ui/2026-11-27/user-center/README.md)为账号细节参考。首轮截图不是最终样式。
- [UX-R01 正式阅读器执行说明](UX-R01-正式阅读器视觉改版执行说明.md)及[验证记录](../../../validation/implementation/ux-r01/2026-11-25/README.md)为阅读器基线。UX-R02 候选稿不自动采用。
- [系统技术设计](../architecture/Readict-V1.1-系统技术设计.md)、[模块计划](Readict-V1.1-模块化开发计划.md)、[M06 验证](../../../validation/implementation/m06/2026-11-25-local/README.md)为真实业务依据。
- 原型最终代码：`prototypes/reader-ui/src/App.tsx`、`integrated/{Shell,Brand,Bookshelf}.tsx`、`integrated/modern.css`、`user-center/{screens,model}.tsx`、`user-center/user-center.css`、`components/Favorites.tsx`、`readict.css`。样式以后出现的覆盖规则为准（例如 128×192 继续阅读封面）。
- 正式工程基线：[readict-app 固定提交](https://github.com/fcj0633/readict-app/tree/6fcda1b3024c0314ad50a6ff592161eb52da6f55/frontend)。实施前检查两个仓库是否推进；如有冲突先记录实际差异，不机械照搬本文。

### 2.2 代码对照与明确处理结论

以下正式路径省略 `frontend/src/` 前缀。

| 源码位置 / 当前行为 | UX-U03 的处理 |
| --- | --- |
| App.tsx：根路由是状态页；Shell 手动判断阅读器路径；账号与设置直接在导航中 | 改成嵌套路由与 Outlet；根跳书架；状态页移至 /status；阅读器独立；菜单整合账号和设置 |
| auth/Pages.tsx Protected：只记录 pathname；auth/api.ts safeReturnTo 仅允许 /account 和 /settings，默认 /account | 提取路由纯函数，支持安全的书架、收藏、阅读器及阅读设置深链；保留允许的查询参数；默认 /books |
| auth/api.ts User：id、email、phone、emailVerified、phoneVerified | 不扩展现有服务端契约；派生 AccountPresentation；昵称/头像/绑定扩展能力默认不可用 |
| AuthProvider.tsx：认证 checking/guest/authenticated/unavailable，BroadcastChannel；写 documentElement.dataset.theme | 认证逻辑保留，删除全局阅读主题职责；会话清理继续清 CSRF 和用户作用域数据 |
| settings/SettingsPage.tsx：页面实例 PreferenceSaver，离开 dispose；草稿主题写全局根节点 | 改为用户作用域共享保存协调器，五个字段独立预览，纸面主题隔离；离开设置页不销毁保存实例 |
| settings/model.ts：500ms 防抖、完整 Preferences PUT、保存回执/版本/409、失败重试 | 保留协议和测试；共享协调器需补充并发、跨页与成功快照契约，勿改变 pronunciation |
| library/BookshelfPage.tsx：load 只取首屏；列表和导入共用 request ref；删除先关闭确认窗、每次新 key | 分离列表/续读/导入请求；增加游标、失败回退、重试同 key、导入取消语义；不修改后端 |
| library/model.ts、api.ts：Book 无章节/副标题/total；25 MiB；GET /books 返回 items+nextCursor | 采用真实字段，补续读详情查询；不杜撰总量、章节、封面或进度 |
| backend BookQueryService.shelf / BookMapper.xml：last_read_at DESC,id DESC，默认20最大50；导入完成也更新时间；progress 左连接 | 不能把首条或 lastReadAt 非空直接判为读过；用 progressRatio 非 null+READY；分页按实际排序查找候选 |
| BookCard.tsx：封面失败隐藏图，READY 按钮 title 仍称 M04 未接入 | 改成可访问的封面占位；修正文案；保持状态门控 |
| favorites/FavoritesPage.tsx：真实 stats/sources/list/detail/remove、游标与返回阅读状态 | 保留查询/分页/删除/详情及历史来源；迁移外观，不用原型本地收藏数组 |
| favorites/model.ts：contextLink 生成 reader?favorite=&context=；returnPath 使用宽松 UUID 字符类 | 将返回路径与统一路由规则对齐，不丢失合法收藏深链；保留 favoriteTarget 校验 |
| reader/ReaderPage.tsx：manifest+进度+引擎、独立 PreferenceSaver、真实 DictionaryCard/FavoriteButton、返回原文 | 仅接入共享偏好、必要离开协调和共用品牌；保留所有锚点、安全和生命周期 |
| index.css/account.css：全局 main/header/footer/button/h1 规则，根主题影响整个应用 | 缩减全局 reset；状态页和旧页面样式局部化；新布局 token 不污染 reader 和 iframe |
| 原型 integrated/Shell：DemoProvider、路由 surface、DemoTools；原型 App.tsx HashRouter | 复用结构与视觉而非模拟身份/数据；正式采用嵌套路由 |
| 原型 integrated/Bookshelf：样书、章节、计算进度、本地搜索/删除、50MB 模拟导入 | 仅复用布局与交互模式，真实数据和限制以 M03/M04 为准 |
| 原型 user-center/screens：昵称、联系方式模拟、密码演示、两分类设置 | 改接真实 API；隐藏资料编辑/绑定等未实现功能和词典发音分类 |

已知问题作为本轮明确的适配工作，非所有旧工程问题均需修复。未涉及的历史缺陷单独登记，不修改旧验收报告。

## 3. 技术架构与复用决策

### 3.1 依赖与样式策略（实施默认）

正式工程现有 React/React DOM 19.3.1、React Router 7.18.5、Vite 8.3.8、TypeScript 7.0.2、lucide-react 1.75.0、epubjs 0.3.93；原型另含 Base UI、Tailwind v4、shadcn/ui、Sonner、Floating UI 等。

选择 **原生 CSS + Base UI 按需引入 + 现有 Lucide**。不整体引入 Tailwind、shadcn CLI、Geist 字体、Sonner、Floating UI；原型最终的大部分页面类来自普通 CSS，移植其视觉参数和 JSX 结构，重写少量 utility 类即可。使用 Base UI Menu/Dialog 的无障碍行为，避免重复手写焦点管理。以原型锁文件对应版本（package.json 声明 ^1.9.0）为候选，实施前核对实际锁定版本、React peer dependency、构建和安全审计，精确锁定经验证的版本；若不能兼容则先记录阻断，不静默升级 React 或大范围引入新依赖。若确需新增依赖记录 ADR 或执行文档中的具体取舍及验证，不替换原正式 package-lock。通知优先行内 role=status/alert + 公共反馈组件，不依赖 toast 才能读到错误。

### 3.2 目标目录（只新增有实际职责的文件）

```text
frontend/src/
  App.tsx                       # Router、根 providers、嵌套路由
  app/
    routes.ts                  # 路径常量、returnTo 校验、URL 构造
    routes.test.ts
    AppLayout.tsx              # 中性 Shell、Outlet、页脚、页面标题
    AppHeader.tsx              # 品牌、书架/收藏、账户菜单
    UserMenu.tsx               # 菜单状态及真实退出交互
    AuthLayout.tsx             # 认证页面独立布局
    RouteGuard.tsx             # Protected 的等价迁移
  components/ui/
    Brand.tsx
    Button.tsx
    Dialog.tsx                 # Base UI 包装，支持焦点/关闭规则
    Menu.tsx
    Feedback.tsx               # 空/加载/错误/状态，可按需合并
  styles/
    tokens.css
    base.css
    app-shell.css
  features/auth/
    AuthProvider.tsx           # 保留认证与广播，不再写全局纸面主题
    api.ts                     # 真实接口
    Pages.tsx                  # 认证功能可拆成小页面文件
    AccountPage.tsx            # 真实账户视图
    AccountPresentation.ts     # 派生身份、未实现能力接口
    account-presentation.test.ts
  features/settings/
    model.ts                   # PreferenceSaver
    PreferencesProvider.tsx    # 用户会话级唯一实例与共享订阅
    SettingsPage.tsx           # 阅读设置单页
    ReadingControls.tsx
    ReadingPreview.tsx
    settings.css
  features/library/
    BookshelfPage.tsx          # 请求、控制及业务协调
    shelf-model.ts             # 续读选择、分页/去重纯逻辑
    shelf-model.test.ts
    BookshelfView.tsx
    ContinueReading.tsx
    BookCard.tsx
    ImportDialog.tsx
    library.css
  features/favorites/
    FavoritesPage.tsx          # 保留现有真实逻辑，提取适度视图组件
    favorites.css
  features/reader/             # 不重组 engine/progress/preview
  features/dictionary/         # 不重组
  lib/http.ts, lib/api.ts      # 保持协议
```

路径为实施建议的明确目标；若现有文件能承担职责，可少建文件，但不得回到单个巨型 Shell 或复制 Mock。测试文件应接入现有 npm test 的显式 glob；新增 app、components 测试时同步脚本。禁止将正式组件从设计仓库运行时导入。业务组件不访问另一个模块的私有 UI 状态；复用公共显示组件以 props 输入数据/事件。请求异常通过现有 ApiError；不以 catch 后默认成功代替失败。

### 3.3 主题、CSS 和视觉契约

中性外壳来自 modern.css 的最终规则：
```css
.app-shell, .auth-shell {
  --canvas: #f5f7f8;
  --paper: #fff;
  --ink: #26332f;
  --secondary: #687570;
  --line: #dfe6e3;
  --green: #32635c;
  --highlight: #deeee7;
  --soft: #edf3f0;
  color-scheme: light;
  font-family: system-ui, "Segoe UI", "Microsoft YaHei", sans-serif;
}
```
- 全局只保留 box-sizing、body margin、基础字体/焦点、必要可访问性；禁止无作用域的 main/header/footer/button/h1 布局规则。旧状态页样式限定 .status-page；旧 account.css 按功能迁出或清理。先基线截图，再验证各文件加载顺序和选择器覆盖。
- 公共 Shell 顶栏 76px、桌面内容最大 1400px、左右 64px；品牌书形 r、字号 27px、导航间距约36px；主导航「我的书架」「我的收藏」，激活色 #32635c；头像右侧。页脚去掉原型标记、调试信息和示例状态。认证页只显示必要品牌，无虚假的已登录菜单。
- 书架标题 28px；继续阅读白色卡片 12px 圆角，桌面最小高240px、封面128×192px（760px 以上最终覆盖规则）；正文书名 Georgia 32px（1600px 以上36px）。全部书籍固定 2:3 封面，不随少量书籍拉伸：桌面6列，1100px 以下4列，760px 以下3列，420px 以下2列；触屏删除/打开操作不依赖 hover；长书名换行/截断但保留可访问全名。
- 账户页白色身份区、连续信息列表、改密弹窗；设置页保留阅读分类与返回账户，只有一项时不留下空白词典分类；单列布局用于窄屏；登录注册居中卡片。收藏使用中性卡片、列表和清晰的单词/句子切换。
- 阅读纸面单独作用域：`.reader-shell[data-theme]` 与 `.reading-preview[data-theme]`；去掉 AuthProvider/SettingsPage 对 documentElement.dataset.theme 的写入、旧 saved/preview-ended 全局事件和遗留 CSS 根主题依赖；不得移除 ReaderPage 已有局部 theme。应用根可用 surface 标记，但不能把 paper 主题传给全局。
- 预览采用固定的英文示例段落，仅用于演示排版，不是用户书籍。字体/字号/行高一致；宽度保留后端 660/720 枚举，按 1:1.0909 的纸面比例展示，可在窄屏等比缩小。正式阅读器当前 standard/wide CSS 不在本轮重设；不宣称预览像素宽度就是 EPUB 真实宽度。
- Portal 弹窗/菜单需在中性 token 范围内（portal 容器位于 app layout 或显式赋予同一 token），不能依赖全局根主题；reader 字典定位不变。关闭 CSS transition 时保留 prefers-reduced-motion；文本对比度与键盘焦点需验证。
- 视觉对照基准：UX-U02 integration/screenshots 下 books、menu、account、password、reading、login、favorites 的1440×900、1920×1080最终截图。去除未支持的按钮/字段、模拟标签属于批准差异；不使用原型假数据填补截图。实现后记录视觉差异说明；不以像素自动比较代替人工评审。

## 4. 路由、导航与认证

### 4.1 正式路由表

保留 BrowserRouter 和服务器 SPA history fallback。目标为原型的页面组织和切换效果，不复制 hash URL。路由常量和路径解析放 app/routes.ts。

| 路径 | 布局与权限 | 说明 |
| --- | --- | --- |
| / | redirect replace → /books | 默认首页；未登录由 Guard 转登录 |
| /books | AppLayout + Guard | 书架；登录默认目标 |
| /favorites | AppLayout + Guard | 收藏；允许 from=合法阅读路径 |
| /account | AppLayout + Guard | 个人账户 |
| /settings | redirect replace → /settings/reading | 兼容旧正式链接 |
| /settings/reading | AppLayout + Guard | 阅读设置 |
| /settings/pronunciation、其余 /settings/* | redirect replace → /settings/reading | 不实现词典与发音页；不显示入口 |
| /reader/:bookId | 独立 ReaderLayout + Guard | UUID；可含 favorite/context 对；非法 ID 显示安全错误/回书架，不请求后端 |
| /login | AuthLayout | 登录 |
| /register | AuthLayout | 注册不自动登录 |
| /forgot-password | AuthLayout | 真实恢复流程 |
| /reset-password | AuthLayout | 需要 RecoveryProvider 内存凭证，无则返回找回页 |
| /status | 独立 StatusPage | 保留 M00 状态诊断能力，不占一级导航；不需要身份 |
| * | replace → /books | 无效路径回默认入口，不泄露业务信息 |

设计结构示意（实现可等价调整）：
```tsx
<BrowserRouter>
  <AuthProvider>
    <RecoveryProvider>
      <PreferencesProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/status" element={<StatusPage />} />
          <Route element={<AuthLayout />}>
            {/* login, register, forgot-password, reset-password */}
          </Route>
          <Route element={<RouteGuard />}>
            <Route element={<AppLayout />}>
              {/* books, favorites, account, settings redirects and reading */}
            </Route>
            <Route path="/reader/:bookId" element={<ReaderPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </PreferencesProvider>
    </RecoveryProvider>
  </AuthProvider>
</BrowserRouter>
```
RouteGuard 使用 Outlet；checking 显示加载，不渲染私有内容；guest 使用 replace 跳转；unavailable 显示错误和重新检查，不能伪装为访客。登录页已登录时安全回跳，但不要让 auth.refresh 与组件自动 Navigate 产生相互竞争；只保留一个成功跳转责任。路由切换更新 document.title，普通页面切换滚动顶部（阅读器进度由引擎处理），关闭菜单并释放旧焦点/请求；不要重挂整个 AuthProvider。

### 4.2 安全回跳契约

新增纯函数 `safeReturnTo(raw: string | null): string`（可由 auth/api.ts re-export 兼容测试）、`loginHref(location)`、`readerPath(bookId)`、`parseReaderPath(raw)`。默认 /books。仅允许站内明确路径，绝不将未经校验的参数交给 navigate/Location。不要用 startsWith('/reader') 或任意同源 URL 作为白名单。

输入已由 URLSearchParams 解码一层，先拒绝控制字符、反斜杠、协议、双斜杠开头、fragment、路径百分号、路径规范化前后的异常形式；不要二次 decodeURIComponent。用固定本地虚拟 origin 解析并校验原始路径与白名单，不允许 dot segments、重复斜杠、编码斜杠或凭据。路径仅接受精确 /books、/favorites、/account、/settings/reading、兼容 /settings，以及严格 UUID 形式 /reader/:bookId（8-4-4-4-12 十六进制）。/settings/pronunciation 可正规化成阅读设置；其余不在回跳白名单。

查询只保留白名单：
- /books、/account、/settings/reading：不保留任意查询；有未知查询可丢弃并回到同一合法页面。
- /favorites：只接受一个 from，其值必须是无查询、无 hash 的合法 reader UUID 路径；否则去掉。
- /reader/:bookId：favorite 与 context 必须成对、各唯一、严格 UUID；缺失/不合法则去掉成对参数，回普通阅读位置。禁止保留 preview=dictionary、demo、returnTo 等演示或递归参数。合法 URL 由 URLSearchParams 重新序列化。
- 拒绝外部 URL、//host、反斜杠、javascript:、/../、%2f、%252f、编码控制字符、重复安全敏感参数；对于合法路径但非法查询，只保留安全路径，不执行不安全查询。
- Guard 将 pathname+search 交给上述函数后编码至 /login?returnTo=...；注册、找回、重置和登录之间传递已验证的 returnTo，默认 /books；重置凭证仍只存在 RecoveryProvider 内存，URL 不含 token/密码。注册后登录继续原目标，改密后回登录且允许重新进入账户；主动退出后回登录（不自动带私有页面深链）。
- 从收藏回阅读：保留现有 `location.state.returnAnchor` 只在同一用户当前会话内使用；刷新/重登状态丢失则由已保存进度恢复，不把完整 anchor/原句写 URL。收藏显式回原文仍由 favorite/context 触发服务端校验，不因合法路径而授予资源访问权限。

测试至少覆盖：/books、/favorites、/account、/settings、/settings/reading、合法 reader UUID/合法成对查询；未知路径、外站、双重编码、协议、dot segments、反斜杠、重复参数、非 UUID、/login 循环；401 后重新登录回原页面、刷新深链、浏览器后退。更新 auth/api.test.ts 旧断言（此前 /books 被拒绝）属于明确契约变化；不要删除其他认证测试。

### 4.3 用户菜单与认证状态

AppHeader 仅在 authenticated 展示完整菜单与身份；菜单项：个人账户 → /account、阅读设置 → /settings/reading、退出登录。品牌点击回书架；收藏与书架保持独立 NavLink active。头像为默认图形或经后端未来支持的真实头像；菜单显示从真实账户派生的名称与脱敏联系方式。菜单通过 Base UI Menu 实现触发器 aria-haspopup/expanded、上下键、Escape、Tab、点击外部关闭；路由变化关闭；弹窗关闭回触发器；退出中避免二次触发。

退出调用 auth/api.logout()；仅真实204成功后 auth.clear()+announce()，清用户作用域数据、草稿、回执和私有 UI，再 replace 到 /login。请求失败保留当前身份/菜单可见错误并允许重试；401 表明会话失效时以 AuthProvider 真正状态为准。禁止调用 DemoProvider，禁止先清身份后假装退出成功。用户明确退出且尚有设置待同步时见第 6 节的离开协调。跨标签收到退出/身份变化时应卸载旧用户组件，不保留上一账户可见内容。

## 5. 业务模块详细实施

### 5.1 个人账户与认证页

真实接口沿用 `features/auth/api.ts`：me、register、login、logout、changePassword、requestContact/verifyContact、requestReset/verifyReset/completeReset；由 lib/http 处理 /api/v1 前缀、Session Cookie 和 CSRF。不得替换为裸 fetch 或浏览器身份状态。

账户呈现模型（只定义前端扩展契约，**不声称服务端已支持**）：
```ts
type ContactView =
  | { kind: 'unbound' }
  | { kind: 'bound'; value: string; verified: boolean };

type AccountPresentation = {
  displayName: string;
  email: ContactView;
  phone: ContactView;
  avatarUrl?: string;
};
type ProfileCapabilities = {
  editNickname: boolean;
  uploadAvatar: boolean;
  bindContact: boolean;
  changeContact: boolean;
};
type ProfileExtension = {
  nickname?: string;
  avatarUrl?: string;
};
interface ProfileEditorPort {
  updateProfile(input: { nickname?: string }, signal?: AbortSignal): Promise<ProfileExtension>;
}
```
当前适配器从 User 真实字段派生两条联系方式；displayName 使用「Reader」或「读者」固定显示名（不冒充可持久化昵称）；头像默认图形，avatarUrl 不设置，所有 ProfileCapabilities 为 false，ProfileEditorPort 不提供运行时实例。未来业务批准后再定义真实端点、服务端模型、校验、授权；当前不创建虚假的 PATCH 路径、数据库字段或模拟成功函数。不展示可点击编辑资料、头像上传、绑定/换绑按钮；如视觉需要保留位置，用静态「默认头像」等说明，不能显示可操作但无响应的按钮。不将 nickname 放 localStorage 或改变现有 User 解码。

账户页布局：身份区 → 账户与安全列表（邮箱、手机号、登录密码）→ 阅读设置跳转。已绑定且 verified=true 才显示已验证；未绑定显示「尚未绑定」，已绑定未验证显示「未验证」，不合并两条布尔状态；菜单脱敏，账户页可显示真实自有联系方式，截图需脱敏。真实验证入口仅用于已有绑定联系方式，保留 challenge、冷却、6位验证码和请求反馈；默认供应商不可用 503 显示明确原因；DEV_LOCAL 模拟成功显示模拟提示，不将 verified 置 true。没有后端绑定能力就不实现新增联系方式。

改密弹窗：当前密码、新密码、确认新密码，使用原 passwordValid（8～128 Unicode code point、UTF-8 ≤512 bytes、ASCII 字母+数字），确认一致；不 trim 密码。独立显示/隐藏按钮、autoComplete、pending、错误与取消；提交时锁定防重复，成功才清密码、清 Session/广播并导航登录，失败保留可重试状态；关闭清除敏感输入，忙时不允许误关闭；禁止记录密码、验证码、token。密码修改后所有设备旧 Session 失效的语义不变。

认证页：按原型居中卡片与品牌，保留邮箱/固定+86 切换、号码规范化、注册后真实登录、真实找回挑战/验证码/重置。禁止原型「仅预览重置」入口；无有效恢复证明不能显示可提交重置表单。服务不可用与未知账号遵守现有错误/隐私策略，不显示未经服务端确认的「已发送」。保留响应错误 requestId 供排障。表单加载、提交中、字段错误、服务端错误、限流、冷却、成功通知均需存在。切换登录/注册要清理不适用的密码与错误状态。

### 5.2 书架

源：library/BookshelfPage.tsx、BookCard.tsx、api.ts、model.ts；视觉参考 integrated/Bookshelf.tsx、modern.css。保留后端 `GET /books?q=&cursor=&limit=`（默认20，最大50）、上传、任务查询、删除、封面接口。后端 BookView 无 total、subtitle、章节字段；不改后端。

#### 数据与请求

将页面列表与导入分成独立请求域：
```ts
type ShelfState = {
  query: string;
  items: Book[];
  nextCursor: string | null;
  phase: 'initial' | 'ready' | 'refreshing' | 'loadingMore' | 'error';
  error?: string;
};
type ContinueState =
  | { phase: 'loading' }
  | { phase: 'empty' }
  | { phase: 'ready'; book: Book; chapterTitle?: string; detailUnavailable?: boolean }
  | { phase: 'error'; message: string };
```
- 列表搜索 trim、≤100字符，250ms 防抖；每个搜索代次有独立 AbortController/generation；切换 query 立即失效旧代次和游标，不能出现旧结果覆盖新结果。首页成功替换列表，loadMore 只追加同 query 同代次数据；UUID 去重，服务器顺序保留；游标原样传回，不自行计算。并发 loadMore 锁定；失败保留已有结果与游标，按钮重试；不把请求失败当空书架。检测重复 cursor 或无进展分页，停止循环并给重试提示。
- 真实书架没有 total 字段，只有 nextCursor：未加载完显示「已加载 N 本」或「已找到 N 本（还有更多）」；只有游标为 null 时才显示该查询的 N 本。不要用搜索列表数量当全库数量；标题不宣称虚假总数。若以后要求真实总数，另走后端需求。
- 当前列表 load 和导入共用 request.current，搜索可能中断上传/轮询。改为 listController、continueController、importController 三个独立 ref，登出/卸载取消各请求；列表刷新不能取消上传，关闭导入也不能取消搜索。
- 导入/删除成功后刷新当前查询和续读，重置游标并保持 query，明确页数重置行为；回书架重新获取真实进度；多标签页可在重新聚焦时安全刷新，不引入实时推送。本轮不为书架增加全局持久缓存。

#### 继续阅读（独立于搜索）

后端 BookMapper.shelf 按 last_read_at DESC、id DESC 排序，但 markReady/reimport 也会写 last_read_at；真正存在阅读进度的依据是 LEFT JOIN 得到的 progressRatio 非 null（0 也可能是有效记录）。
- 首次进入、导入/删除/阅读返回后，按无搜索条件获取书架第一页（可使用 limit=50，若 API 函数新增可选参数保持旧调用兼容）。顺序扫描所有页直至找到第一本 READY 且 progressRatio 非 null；记住首次 READY 作为未阅读候选。找到真实已阅读候选即停止；若直到末页无已读书，则用首次 READY 显示「开启一段新的阅读 / 开始阅读」，没有 READY 则不展示推荐卡。必须以实际返回游标顺序为准；不下载 EPUB、不查询每本书的详情；避免无界并行请求。长书架扫描可显示独立加载态，取消/代次保护；错误时保留上一已确认候选或显示重试，不把错误伪装无阅读记录。若数据更新造成重复 ID/游标无进展，停止并重试刷新。
- 书名、作者、coverUrl、progressRatio 使用真实投影；有限数字按 [0,1] 合法范围校验后 Math.round(*100)，null 不渲染进度，异常值显示未知，不臆造37%。选定候选后如需「上次读到章节」，仅对该书调用 reader/api.loadProgress + loadManifest（不调用 downloadEpub），比对 progress.anchor.artifactId/hash/pipeline、spineHref 和 manifest.spine；命中后使用真实章名。缺失/不一致/失败时隐藏章节行或显示「上次阅读位置」而不杜撰章名；不阻断打开书籍。
- 最新书架主卡和所有卡片都只在 READY 可导航。IMPORTING 显示处理中、FAILED 显示失败及重新选择文件、BROKEN 显示不可用并提供重新导入（按 canRetry）或删除。非 READY 不显示可点击阅读链接。真正进入 reader 仍做服务端所有权/READY 检查。

#### 上传与删除

- 导入弹窗可点选/拖拽，一个 EPUB 文件；校验 localFileError、MAX_UPLOAD_BYTES=25*1024*1024、非空、扩展名。文案统一「25 MiB（约26 MB）」或「25 MiB」，不移植50 MB。选择后显示文件名/大小，明确开始上传按钮；上传进度来自 XHR；服务端阶段 VALIDATING/PARSING/SANITIZING/PUBLISHING，不能使用假百分比；处理中显示不确定进度、真实阶段和可重试错误。
- 保留 createImport/fetchImport、pollDelay、terminal state 和 Idempotency-Key。对一次逻辑上传（同一文件）在响应未知/网络失败时沿用原 key；任务已确认失败后用户明确重新发起新尝试才生成新 key，选择不同文件时新 key；不得并发提交。任务 SUCCEEDED/reused 才提示成功、刷新列表。
- 关闭弹窗不是后端取消：上传尚未获回执时提示「停止本次客户端等待，服务端可能已收到文件」；已获 importId 后提示后台继续，关闭只停止轮询并刷新书架；对未知结果保留本会话可重试的 file/key（不持久化文件），允许用户明确丢弃该尝试。禁止把 abort 当删除已导入书籍。后端未提供任务取消端点，不预造。
- 删除弹窗列明书籍、原始文件/阅读进度移除、已收藏快照保留。保持确认窗直到成功或明确取消；提交锁、防重复，失败显示错误且保留目标；响应未知时用同一 Idempotency-Key 重试并刷新真实列表核对，不能提前提示成功。当前 DELETE 返回202且 body 为 {bookId,state:'DELETING'}，必须走既有 decodeDeleteAccepted，不当空响应，也不声称物理文件已立即删除。401/404/409 显示真实状态并按需刷新。
- 封面用已有鉴权 coverUrl，仅接受应用同源的合法 /api/v1/books/{id}/cover 路径（或现有契约校验过的路径），加载失败时渲染固定比例文字/书形占位；不拉取原型 CDN 或样书封面。失败/无封面/长标题/2本书/空态/搜索无结果/导入中均需截图与测试。

### 5.3 收藏页

复用 FavoritesPage 的查询、stats、sources、list、detail、remove、cursor、generation、returnPath、contextLink；保留 view=words/sentences、搜索、来源过滤、原有排序与加载更多。视觉迁移原型的页头、工具条、词条卡和详情弹窗，不按 localStorage 计算词数，不把单词与句子合并为复习功能。
- stats 不可用显示独立未知/失败，不将 0 冒充真实统计；搜索结果与总体计数区分。
- 单词显示 lemma、ipa（可空）、pos、meaning、contextCount；句子通过 sentence.slice(wordStart,wordEnd) 与 surface 校验后高亮，用 React 文本节点，禁止 innerHTML。
- 删除确认只删除整个单词及其全部语境，保持原事务；操作失败保留详情和可重试状态。过滤条件切换时重置 cursor 并取消旧请求；详情响应晚到不能重开已经关闭的弹窗；关闭或换账号使旧 generation 无效。保留现有 API decode 和收藏快照。
- 从阅读器工具栏进入 /favorites?from=/reader/{id}，保留 state.returnAnchor；显示「返回阅读」用于继续之前位置。详情中的「回原文」用已有 contextLink 生成 favorite/context 查询，由 ReaderPage 重新校验来源与锚点。已删原书或来源不可用显示说明，不提供无效链接；无锚点不生成新锚点。收藏页只展示后端已有 translation 非空值；M07 未实现时不展示虚假译文。
- Dialog 可统一 Base UI，但原有焦点恢复、Esc、modal 叠层、提交锁与键盘路径必须验证。取消收藏后同步 stats、当前列表/详情，不能假成功。

## 6. 阅读设置共享状态、主题和阅读器衔接

### 6.1 数据契约

现有 `GET/PUT /api/v1/me/settings`，View={preferences,version}；PUT={preferences,expectedVersion,requestId}。Preferences 仍包含 font、fontSize、lineHeight、width、theme、pronunciation；不因隐藏词典与发音页面而删除 pronunciation 或重置它。保留 decode 白名单、原枚举与服务器版本。
```ts
type ReadingPatch = Partial<Pick<Preferences,
  'font' | 'fontSize' | 'lineHeight' | 'width' | 'theme'>>;
```
UI 仅允许上述五项 patch，合并到当前完整草稿再传 PreferenceSaver.edit；禁止以五字段对象直接 PUT 或用默认 en-GB 覆盖用户现存 en-US。原型字体 Georgia/Palatino Linotype/Arial；字号18/20/22/24，行距1.6/1.8/2，宽度660/720，theme white/warm/dark。控件 aria-pressed 或正确 radio 语义。发音偏好保留存储和原读取能力，本次没有独立页面、接口调用或排序变更；已有录音播放继续有效。

### 6.2 单一用户作用域协调器

当前 SettingsPage 实例在离开时 dispose，ReaderPage 另建一个 PreferenceSaver；可能丢失防抖中草稿，并存在两套状态。选择共享 PreferencesProvider（位于 AuthProvider 下、RouteGuard 上；按 authenticated user.id 生命周期管理），不另建两套存储：
```ts
interface ReadingPreferenceContext {
  state: SaveState;                // 保留 loading/saved/saving/unsynced/conflict
  committed?: View;                // 最近一次真实 GET / 成功 PUT 或选择服务器结果
  editReading(patch: ReadingPatch): void;
  retry(): void;
  resolve(keepDraft: boolean): void;
  flush(): Promise<void>;
  reload(): Promise<void>;
}
```
- authenticated 后创建唯一实例并加载；guest/unavailable 或身份切换使旧实例 abort/dispose，清除草稿与已提交快照，所有回调检查用户代次。不要把设置写 localStorage。checking 时不渲染私有页面；同一已登录用户正常路由切换不销毁控制器。
- 扩展 PreferenceSaver 的通知机制以明确 committed：成功 GET、成功 PUT 和选择服务器版本才能更新；编辑草稿不会更新 committed。409 保留 draft 和服务器版本，不能覆盖用户未提交修改。保留原 pending 的 requestId+完整载荷，网络未知结果重试原请求，不为同一次重试生成新 id。
- SettingsPage 只订阅和展示控制器，不直接 GET/PUT、不操作全局 dataset；预览始终用 draft，保存状态来自真实请求。快速连续编辑合并最近 draft，500ms 防抖、串行发送；旧成功响应只推进版本/已提交快照，不覆盖更新草稿；若还有修改继续发送。
- 其他标签 settings 广播只触发已登录相同用户刷新，不循环广播；本标签成功 PUT 后更新自身 committed 并通过 auth.announce('settings') 通知其他标签（接收端只 GET，不能再广播）。接收端有 dirty/in-flight 时保留本地草稿，比较服务端版本与当前版本：相同版本不制造冲突，变化版本进入冲突；如果刷新与当前 PUT 完成竞态，以代次/版本单调性和后续实际 GET 重新核对，不能把旧版本覆盖新版本。
- 保存错误：保留草稿、错误提示、重试；加载错误且无草稿则 retry GET，控件不可用；冲突展示「使用已保存设置」「保留当前修改并重新保存」，没有拿到 server snapshot 时仅允许重取，不能盲提交。成功/冲突/网络未知全部新增模型回归。
- 共享实例使站内切换书架/收藏/设置不丢失草稿。进入阅读器时优先使用已提交偏好；未提交/冲突草稿不自动改变阅读器（但从阅读器内面板发起的本地编辑需要即时预览）。区分编辑来源：设置页 draft 只作用于设置预览，ReaderPanels 发起的 draft 只作用于当前阅读器临时预览；成功后统一 committed，冲突/失败显示状态，离开 reader 取消临时呈现但保留共享草稿。禁止同时混入不同页面的两份偏好，使用同一个共享 draft；进入另一编辑页显示同一草稿及状态并可继续解决。
- 用户从阅读器直接编辑：保留当前即时重排与 anchor 恢复；ReaderPage 初始化先用已核验 manifest.settings（现有协议），再按共享 committed 版本不低于 manifest 或重新 GET 成功时应用。版本0的 manifest 回退值只用于暂时渲染，不可当可保存版本；共享 GET 失败时显示未同步并禁止无版本保存。设置变更不能重建 EPUB 引擎或改变 CFI 语义。
- ReaderPage 内原独立 settingsRef/PreferenceSaver 删除，仅接入共享状态和 edit/retry/resolve；保留引擎、进度 saver、查词/音频、收藏状态。防止 shared provider 渲染使引擎 effect 重建：依赖仅保留真正 bookId/artifact/用户切换及已有稳定函数，设置改变通过 applyPreferences 处理；偏好版本落后时不倒退。
- 主动退出前若 saving/unsynced/conflict，先显示「等待保存/重试/放弃未同步修改并退出/取消」的明确操作；不因偏好错误阻止用户最终退出。flush 只能在非冲突有效版本执行；等待有界，失败回到确认，不宣称同步。刷新/关闭浏览器存在未保存草稿时使用必要 beforeunload 提示，不尝试 sendBeacon 绕过 CSRF；已经退出或会话失效则不得阻止导航，清除私有数据。普通路由切换无需阻塞。
- 测试：500ms 内离开设置、返回后草稿与状态一致；连续编辑跨页面、保存失败、响应未知原 key、409双分支、同版本广播、旧响应、401/换账号、阅读器即时预览与重排、夜读返回中性页面。

### 6.3 阅读器保护与离开衔接

保留 `ReaderPage.tsx`、`ReaderLayout.tsx`、`engine/EpubJsEngine.ts`、`engine/selection.ts`、`progress/model.ts`、`DictionaryCard.tsx`、`PronunciationPlayer.ts`、`FavoriteButton.tsx` 已有核心协议。
- 独立 reader shell 继续原 UX-R01：纸面/正文/工具轨/页码；品牌可用同一 Brand 的 compact variant，颜色继承 reader 局部 palette，不引入应用主导航。
- 从 reader 返回 /books 继续 await progressSaver.flush；进入收藏时保留 from+returnAnchor，在有 pending 时仍遵循既有进度策略，尽量 await flush 后导航；如果保存失败，保留已有本地待同步机制，不以跳转成功冒充同步成功。不要改进度冲突策略；仅做必要导航协调。
- 查词浮层的定位/关闭/播放生命周期不替换，不引入原型逐词包 span。多义条目、NOT_FOUND、AMBIGUOUS、未配置音频、源偏移修复（[M05 2026-11-26](../../../validation/implementation/m05/2026-11-26-source-offset-fix/README.md)）必须回归。
- 旧开发预览参数 preview=dictionary 不作为正式导航或回跳能力；正式默认永远使用真实词典。若调试入口仍在代码中，隔离在现有开发预览范围，不显示在正式产品路径。
- 本轮不改变读者页的音频口音呈现和播放器协议；不从原型翻译、设备发音或假词条取得数据。

## 7. 执行任务与退出条件

每项任务以当前仓库源码为起点，完成后记录修改、原因、验证；内部小步骤无需单独提交。本轮实施计划可分阶段审查，按用户/AGENTS 约定完整任务统一提交。以下所有路径均为预期正式前端路径。

| 任务 | 前置 | 实施范围与文件 | 必须退出条件 |
| --- | --- | --- | --- |
| UX-U03-01 基线冻结 | 本文 | 核对设计与应用 HEAD、工作区、原型最终截图、数据库环境、现有构建/测试；建立前后截图和已知问题清单 | 两仓库提交/配置/基线记录齐全，真实测试环境可用；未通过项明确，不擅自迁移开发库 |
| UX-U03-02 Shell 与 UI 基础 | 01 | App.tsx、app/routes.ts、RouteGuard、AppLayout/AuthLayout/Header/UserMenu、Brand、公共 Dialog/Menu/Button、styles；状态页局部 CSS、路由测试 | 根→书架、旧路径、保护/回跳、导航、菜单、状态页、独立 reader 正常；lint/test/build；旧 UI 能过渡展示不出现全局样式破坏 |
| UX-U03-03 书架 | 02 | library/BookshelfPage、BookCard、View、ContinueReading、ImportDialog、shelf-model、library.css、必要 api 参数；分页/控制器拆分 | 真实数据驱动，21+书籍/搜索/继续阅读、无封面/失败/导入/删除全部覆盖，25 MiB 与真实幂等保持 |
| UX-U03-04 用户中心与认证 | 02 | auth/Pages、AccountPage、AccountPresentation、AuthProvider 菜单退出与回跳；真实表单、改密、恢复、联系方式显示 | 无 Mock、不可用能力无请求；真实登录/注册/改密/退出/失败/本地恢复；真实供应商未接入明确标记 |
| UX-U03-05 阅读设置与主题 | 02,04 | PreferencesProvider、model、SettingsPage/controls/preview、AuthProvider 主题清理、ReaderPage/ReaderPanels 最小适配；不建 pronunciation 页 | 五项设置真实保存/回显/冲突/跨页面/跨标签，未编辑 pronunciation 不变；主题仅阅读纸面；阅读器原行为保持 |
| UX-U03-06 收藏与阅读器衔接 | 03,05 | FavoritesPage、favorites.css、必要 model/route helper、ReaderLayout/ReaderPage 导航；保护真实词典/收藏/进度 | 真实收藏三态、追加、分页/筛选/详情/取消、回阅读/回原文、删书保留；不重写 engine/字典 |
| UX-U03-07 全量验收 | 01～06 | 测试、实机浏览器、截图对照、回归、文档索引、应用 README 与实施报告 | 第8、9节矩阵、阻断记录与人工视觉确认；不以 Mock 或截图代替真实链路；未达门槛则部分完成 |

允许并行准备03与04，但合并先统一02；05与06要顺序验证。后端与迁移默认零变更；若现有契约确实无法完成关键功能，先记录缺口与备选，另行批准，不偷偷扩张。开发时不得覆盖另有用途的用户未提交改动。UI 改动只依赖当前 V1～V9 正式 API。

## 8. 详细验收矩阵

以下为待执行用例，非已通过结果。T=前端自动测试；I=真实 HTTP/MySQL/浏览器集成；V=视觉/手工浏览器检查。测试环境使用独立账号、自建夹具或有权使用的样书/词条，不采集真实凭据。

| 编号 | 方法 | 场景 / 预期 |
| --- | --- | --- |
| U01 | T,I | /、登录默认落书架；登录后合法 books/favorites/account/settings/reader 深链返回 |
| U02 | T,I | 拒绝外部、//、反斜杠、编码路径、dot segment、重复参数；合法收藏查询成对保留 |
| U03 | I | guest 私有路由不渲染数据；checking 不闪访客页；unavailable 提示重试；/status 独立可访问 |
| U04 | I,V | 刷新/后退/前进/直达设置、收藏、reader；旧 /settings 跳转；无发音设置入口/页面 |
| U05 | V | 头像菜单上下键、Escape、外部点击、Tab、焦点恢复、路由关闭；小屏不截断菜单 |
| U06 | I | 真登录/注册、固定+86、密码规则、请求失败/冷却；注册不自动登录 |
| U07 | I | 退出204清会话并广播；网络失败保持身份并重试；401 触发清理 |
| U08 | I | 双标签改密旧 Session 失效；真实/本地模拟恢复边界；默认无供应商不假成功 |
| U09 | T,I,V | 两种绑定状态、验证标识准确、无昵称/头像/绑定请求；长联系方式、默认头像 |
| U10 | T,I | 设置5字段完整 PUT 保留原 pronunciation；加载失败、实际持久化、刷新回显 |
| U11 | T,I | 500ms 内换路由、连续修改、旧响应、未知结果原 requestId、保存中切换页面 |
| U12 | T,I | 409使用服务端/保留草稿重存、无 server snapshot 重取、同版本广播不伪冲突 |
| U13 | I,V | 同一账号设置页→阅读器→书架，夜读只影响纸面；未保存设置不自动污染 reader；reader 面板即时预览 |
| U14 | I | 设置 pending 时退出/放弃/取消；401、切换用户后旧草稿/旧请求不泄露 |
| U15 | T,I | 0/2/21+本书；游标加载完整、去重、空搜索、快速搜索旧响应不覆盖、失败重试 |
| U16 | T,I | 最近导入未读书不抢占已阅读候选，含首屏非 READY、第二页候选、progressRatio=0/null；搜索不影响续读 |
| U17 | I,V | 封面真实/缺失/失败、作者未知、长标题、4种书状态；进度与章节可核实，缺失不编造 |
| U18 | T,I | 空文件/非EPUB/超25MiB/恶意或DRM/固定版式按真实契约反馈；有效EPUB实际导入/打开 |
| U19 | I | 上传 XHR 真实进度/服务端阶段；搜索不取消上传；关闭弹窗后台可能继续；重试同 key/reused |
| U20 | I | 删除202回执、失败不假成功、双击锁、未知响应同 key，删书保留收藏快照 |
| U21 | I | 单词/句子切换、来源过滤、排序、游标、总统计与搜索结果分离、加载错误不当空态 |
| U22 | I | 三态收藏、同 lemma 追加语境、取消主体全部语境、响应丢失重试，真实快照未丢 |
| U23 | I | 从阅读进入收藏、返回原阅读位置、明确回原文高亮；删书/来源不可用不返回 anchor；恶意链接不越权 |
| U24 | I | EPUB 翻页、目录、调整字号/行距、刷新 CFI+quote 恢复；进度冲突/断网策略回归 |
| U25 | I | COL真实查词/歧义/未命中/故障重试、跨 inline 词与句内偏移；有录音播放、缺失/未配置明确提示，翻页/切词停止播放 |
| U26 | V | 1440×900、1920×1080 与 UX-U02 最终图对照：书架、菜单、账户、改密、阅读设置、认证、收藏 |
| U27 | V | 1366×768、390×844 检查横向溢出、长标题/邮箱、弹窗可滚动、键盘、触屏按钮 |
| U28 | T,I | 前端 lint/test/build；真实后端未修改契约、历史回归；未迁移开发库；两个账号隔离 |
| U29 | I,V | 检查产物无 demo 标签、示例身份、Mock、假 EPUB/翻译、模拟存储键；无敏感数据进入截图/日志 |
| U30 | V | 正式 UX-R01 阅读器纸面/正文/工具轨/分页及词典定位前后对照，不被全局 CSS/Portal 污染 |

对既有不可用环境（真实邮件短信、完整 COL/录音质量、Firefox/Safari、生产环境）不得扩大通过口径。真实录音未配置时可验证不可用分支；若有已授权录音夹具则补真实播放，不用 TTS 代替。数据样本质量与应用链路测试分开登记。

## 9. 实施前检查、运行与交付

1. 在两仓库分别检查 git status --short、git rev-parse HEAD、git log -1；保留未提交修改。对比本文固定提交；必要时更新基线记录。冻结原型 UX-U02 最终截图、正式旧页面截图、页面 URL 与现有失败证据。
2. 正式前端在 frontend 执行 npm ci、npm run lint、npm test、npm run build，记录原始计数、失败及构建大小；设计原型可独立 npm ci + dev（5176），只用于对照。新增 Base UI 后重复安装、依赖树/审计、构建，不浮动升级依赖；对 bundle 大小增加说明。
3. 正式后端按应用 README 配置 test 专用账号、私有书籍/音频存储根（末级 readict_test）、认证 HMAC。先只读核对连接目标、flyway_schema_history、已有 V9 与运行端口。历史记录仅证明 V9 测试库通过，不能推断 dev 当前状态；本轮无权自动启动会迁移 dev 的后端。必要时用独立 test 配置、回环端口、独立测试数据和存储，不与正在运行的消费者共用测试库；正式验收后按本轮精确ID清理，禁止清库/停止他人 MySQL。
4. 后端普通 mvn test 与 mvn -Pmysql-it verify 按现有规范执行，若无后端改动也至少验证真实链路，完整回归在最终阶段执行；测试运行和浏览器验收顺序隔离，不同时使用同一测试库和不同存储根。前端 Vite /api 代理指向实际 test 服务，不改正式默认端口配置；记录临时命令。浏览器以真实 Session 登录两个测试账号，导入自建/合法 EPUB，使用正式词典 Provider/数据库与必要自建测试词条；不以 Mock 代替集成。受控网络故障/409 可通过真实服务与拦截注入，明确标注注入方式。
5. 浏览器基线以 Chromium/Edge 本机为主，至少1440×900、1920×1080及390×844；真实大书、Firefox/Safari、完整恶意矩阵另属历史待验，不在本轮伪造通过。核对 /status、深链刷新、浏览器历史、触屏/键盘、设置跨标签、两账号隔离。生产部署 SPA fallback 单列后续风险。
6. 验收输出：`validation/implementation/ux-u03/YYYY-MM-DD/README.md`、test-results.json、regression-results.json、screenshots/；明确实施代码提交、设计提交、实际环境、用例编号/成功失败未执行、实际截图与差异、历史失败与修复。原型参考与正式截图分开，敏感账号/书籍内容脱敏，保留首次失败证据。应用 README 仅更新运行/路由/能力摘要；设计仓库更新技术索引。若正式交付基线尚未发布，本文作为任务执行输入而不是声称 BASELINE 已批准。
7. 完整任务完成后，按 AGENTS.md 分别提交相关仓库、中文标题正文、只包含本任务改动；按现有授权推送。未满足退出条件时状态写部分完成/待材料/待视觉评审。回退以 Git revert 本轮应用提交为主，数据库无新增迁移；不能回退/清理用户数据来恢复视觉。

## 10. 明确的预留接口与后续事项

| 项目 | 当前行为 | 后续触发条件 |
| --- | --- | --- |
| 昵称、头像 | AccountPresentation/ProfileCapabilities/ProfileEditorPort 仅扩展契约；默认显示名/头像，不可编辑 | 单独批准 CR，设计正式字段/API/授权/校验后接入 |
| 联系方式新增/换绑 | 仅真实已绑定状态和现有验证，未绑定只显示 | 单独业务设计，所有权证明/会话失效规则 |
| 词典与发音设置 | 不建 UI；原 pronunciation 字段及真实音频功能保留 | 用户明确要求时独立任务 |
| 翻译 | 不迁移模拟翻译；仅保留原有领域接口/可空字段 | M07 |
| 书架真实总数/章节简化接口 | 本次使用游标和候选详情 GET，无额外后端 | 性能或产品需要经批准再加投影/API |
| 真实邮件/短信、音频/词典权利 | 现有边界和错误态保留 | 真实材料、授权及验收 |
| 视觉 | 采用 UX-U02 最终融合设计为基准，扣除用户明确排除功能 | 实施后人工评审；UX-R02 不自动生效 |

### 11. 设计完成条件

本文件明确了范围、代码对应、技术选型、真实路由、主题、设置状态、书架数据策略、未实现能力扩展契约、业务保护和逐项验收。具备进入 UX-U03-01/02 的设计条件；开始正式实施前必须确认基线、测试环境及实际依赖兼容性。本文未执行任何代码、数据库迁移或浏览器验收；不登记 UI 重构已完成。

