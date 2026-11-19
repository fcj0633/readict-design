# Readict 设计与验证仓库

本仓库统一保存需求、UX 设计、技术设计、原型、实施记录和验证证据。平级 `readict-app` 是独立的正式源码仓库，M00 已完成本机阶段验收。父目录不是 Git 仓库；两个仓库分别提交，不使用子模块。

## 导航

| 内容 | 入口 | 当前状态 |
|---|---|---|
| 需求基线 | [需求索引](docs/requirements/README.md) | PRD V1.1；收藏，不包含复习 |
| 需求变更 | [变更登记](docs/requirements/changes/README.md) | 提供流程，尚未新建变更单 |
| UX 与视觉 | [UX 索引](docs/ux/README.md) | 第一张视觉方向与确认修订 |
| 技术设计 | [技术索引](docs/technical/README.md) | 技术基线及实施指导；M00 本机基础已验收 |
| UI 原型 | [运行说明](prototypes/reader-ui/README.md) | Mock，可交互，非正式产品 |
| 验证 | [验证索引](validation/README.md) | UI、技术实验及正式工程验收分别管理 |
| M00 实施验收 | [M00 记录](validation/implementation/m00/README.md) | 对应应用提交 ced5f6e，本机阶段通过 |
| 开发交付 | [交付索引](docs/handoffs/README.md) | 尚未发布正式开发基线 |
| 模板与协作 | [协作规范](CONTRIBUTING.md) | 需求变更、技术设计、ADR、验证、交付 |
| 本次整理 | [迁移记录](validation/migration/2026-11-18/README.md) | 清单、哈希与迁移后检查 |

## 目录地图

```text
docs/requirements/   PRD 及需求变更
docs/ux/             交互需求、设计规范、调研与视觉素材
docs/technical/      后续架构设计和 ADR
docs/handoffs/       向实际开发交付的基线
prototypes/          可运行的设计原型
validation/ui/       按日期保存的 UI 验收报告和证据
validation/technical/ 可运行的技术验证工程及证据
validation/implementation/ 正式应用各模块的实施与验收记录
validation/migration/ 目录重组的核对记录
templates/           可复用文档模板
```

## 运行

从本仓库根目录进入对应工程，两个工程独立安装依赖：

```powershell
cd prototypes/reader-ui
npm ci
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

UI 原型使用 4173 端口。技术验证入口为 `validation/technical/reader-core`，开发端口 5174，完整命令见其 README。无需安装依赖即可阅读文档与证据。

## 管理边界

- 原型验证界面与流程；技术实验验证可行性。实验建议不等于已采纳设计，也不等于正式产品能力。
- 锁文件、源码、设计资产、可分发样书和已归档证据纳入版本控制；依赖、构建、临时输出与本地配置忽略。
- 原型新的浏览器输出位于自身 `.artifacts/ux/`，不要覆盖日期归档。
- 原始日志/报告中出现的旧路径属于历史环境。迁移映射见迁移记录。
- `.gitattributes` 禁用自动换行转换，以保留迁移基线的原始字节与哈希，文本差异仍可正常查看。
- 所有提交标题与正文使用中文，说明修改、原因和必要验证。执行规范见 [CONTRIBUTING](CONTRIBUTING.md)。
- 两仓库通过交付基线编号及 Git 提交建立关联，不通过本机绝对路径、跨仓库导入或共享依赖绑定。
