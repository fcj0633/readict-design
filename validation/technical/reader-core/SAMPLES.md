# 样例书说明

## 公开真实书籍

《Moby-Dick》，Herman Melville，EPUB 3.0，可重排版，1,628,868 bytes，144 个 spine 条目（封面、版权、前言、正文等，不等同于 144 个正文章节）。

- 来源：[IDPF EPUB 3 Samples 官方发布](https://github.com/IDPF/epub3-samples/releases/tag/20230704)。
- 原文件：[moby-dick.epub](https://github.com/IDPF/epub3-samples/releases/download/20230704/moby-dick.epub)。
- 下载使用 GitHub release asset API：`https://api.github.com/repos/IDPF/epub3-samples/releases/assets/115540743`，请求头 `Accept: application/octet-stream`。普通下载域名本机连接超时，资产接口成功。
- 署名：Herman Melville；电子书制作贡献者 Dave Cramer / EPUB Samples project。书中保留了完整版权页、元数据及字体资源。
- OPF 声明该电子书以 [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) 分享。仓库保留原始下载包，没有将预处理后的副本另行发布。阅读时只在本机内存中安全预处理。
- SHA-256：`81bc079841a38e91a02a7776d04786a2fc311cfd300064e9fc533ce7c54cf7b4`。
- 本机文件：`public/books/moby-dick.epub`。

最初 Project Gutenberg 两个下载入口均返回 HTTP 503；Standard Ebooks 和 epub.js S3 样书入口连接失败；未将这些失败请求记录为书籍渲染通过。

## 用户本地书籍

《Then There Were None》，OPF 作者为 V. B. Tenery；不是按书名推断的其他作者作品。用户指定本地文件用于测试，未核验该文件获取许可；不作为公开授权样本计入。

- 原路径：`C:\Users\Administrator\Downloads\Then There Were None (Tenery V B) (z-library.sk, 1lib.sk, z-lib.sk).epub`。
- 657,441 bytes，EPUB 2.0，51 个 spine 条目，OPF 为 `content.opf`，未发现 `META-INF/encryption.xml`。
- SHA-256：`d405d558cf13ccf94e1bbaff1c687f0aa1532cf0f711f8730d7c8765bf8de525`。
- 未改动下载目录的文件，未复制进可公开访问的样书目录。由本机浏览器文件导入，IndexedDB 保存本地副本供刷新恢复。
- 测试第五索引正文段、翻页、字号和刷新后的 CFI 恢复；截图仅作为用户请求的本地测试证据。

## 自建标准结构测试包

`fixture.epub`，EPUB 3.0，3 个 spine 条目，生成脚本 `scripts/fixtures.mjs`。包含 OPF、nav、container、首个未压缩 mimetype 条目、正文 XHTML、CSS、SVG；300 段长章节覆盖纯文本、加粗、斜体、跨 inline 节点的单词、内部章节链接和外部链接。

文本是本实验原创确定性测试数据。结构经 JSZip 和 epub.js 运行验证；未运行 EPUBCheck，因此不声称已通过完整标准一致性校验。

`hostile.epub` 在相同包结构中增加父窗口脚本写入、onclick、onerror、远程图片、javascript 链接和 iframe。它是有限攻击样本，不代表全部 EPUB 攻击面。
