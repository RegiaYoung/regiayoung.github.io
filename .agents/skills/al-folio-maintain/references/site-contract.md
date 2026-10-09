# regia.me 维护约定

适用于 Git remote 指向 `RegiaYoung/regiayoung.github.io` 的仓库。读取当前仓库的 `AGENTS.md`、`docs/native-feature-audit.md` 和配置，以确认本记录之后是否有已授权变化。不要把此文件用于其他人的站点。

## 路由与内容归属

| 内容            | 数据/页面                                            | 公开地址         |
| --------------- | ---------------------------------------------------- | ---------------- |
| About           | `_pages/about.md`                                    | `/`              |
| Publications    | `_bibliography/papers.bib`、`_pages/publications.md` | `/publications/` |
| Repo            | `_data/repositories.yml`、`_pages/repo.md`           | `/repo/`         |
| Blog            | `_posts/`、`_pages/blog.md`                          | `/blog/`         |
| CV              | `_data/cv.yml`、`_pages/cv.md`                       | `/cv/`           |
| 新闻 / 联系方式 | `_news/`、`_data/socials.yml`                        | 首页及 `/news/`  |
| Atom feed       | `feed.path`                                          | `/index.xml`     |

导航保持 About / Publications / Repo / Blog / CV；用户已明确用 Repo，不加 Projects。域名 `https://regia.me`，`baseurl: ""`，CNAME 为 `regia.me`。不要恢复 Arclight 品牌或旧域名。

保留 BIOS 文章 `/post/教程-硬刷biosx370主板成功进化/` 和已有图片地址。`/notes/`、`/archives/`、`/post/` 转向 Blog；`/repositories/` 转向 Repo。检查源页面是否产生重复 permalink，尤其不要同时保留旧 Blog 跳转页和新 Blog 页面。

## 个人信息与发布边界

- 只使用用户确认或可核实的公开个人资料。不要补猜学位日期、奖项、照片、Scholar ID 或 CV PDF。
- SlideFormer / SlideDP 使用公开代码链接。区分已发布实现与尚未公开的优化 runtime；不要把私有研究仓库、内部计划或投稿材料带到主页。
- Repo 在原生 `github_users` / `github_repos` 之外保留本站 `repositories` 可用性说明及论文链接。
- Publications 使用原生 BibTeX，CV 使用 RenderCV YAML；可能需要同步同一项公开信息，但不要复制演示 resume。
- 保留文字联系方式作为直接入口；原生社交图标不是删除可用联系方式的理由。

## 已知兼容点

1. 社交插件的 `rss_icon` 在当前版本固定指向 `/feed.xml`；本站使用自定义 RSS social entry 指向 `/index.xml`。启用/重写图标后要实际请求 feed。
2. BIOS 原图带有链接。使用 `images.lightbox2: true` 和原生 `data-lightbox` 接管点击；只给链接内图片加 `data-zoomable` 可能仍会导航到图片文件。
3. 原生 post 只有在 URL 以 `/blog/` 开头时才给标题区标签/年份加归档链接；旧文章地址保持不变，其 Blog 列表中的归档链接可用。这是兼容取舍，不要偷偷改旧 permalink。
4. 论文预览、featured、分页、相关文章都是内容驱动；当前文章少时没有对应 UI 不代表要删功能。
5. GitHub SVG 卡片可能返回 HTTP 200 的错误图；检查实际内容、深浅色图片加载和可见性，保留普通 GitHub 链接。

## 明确保留的可选状态

- 评论、统计、newsletter、citation badges 等等待用户自己的配置。
- 头像、CV PDF、论文图等待真实素材。
- 自动 WebP：gem 已安装，转换开关关闭；使用前配置 ImageMagick 及输入目录。
- Jupyter：gem/plugin 尚未启用；需要同时安装 Ruby/Python 转换依赖并实际测试。
- JSONResume、额外 collections、masonry、固定 footer 不因“恢复默认”而自动启用。
- 这些状态及理由以仓库功能审计为记录，不要为它们创建占位内容。

## 检查策略

`references/regia-native-policy.json` 是本站已选择的功能基线。只读脚本检查此基线，不会自动改配置。用户明确取消功能、重命名导航或升级到不兼容版本时，可连同实现一起修改策略并解释理由；禁止为掩盖意外退化修改策略。
