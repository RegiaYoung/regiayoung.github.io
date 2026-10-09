# 内容操作

## 目录

- 修改前定位
- Blog 和技术文章
- Publications
- Repo
- About、新闻与联系方式
- CV
- 可选集成

## 修改前定位

先读目标文件和锁定版本的对应示例/实现。下面是最小输入模式，不是待发布的示例内容。不要在生产站点创建占位文章、占位论文或虚构履历。

## Blog 和技术文章

新文章放在 `_posts/YYYY-MM-DD-slug.md`。使用真实日期和内容；未来日期可能被 Jekyll 排除，不能为“显示出来”随意改日期。

```yaml
---
layout: post
title: "用户提供的真实标题"
date: YYYY-MM-DD HH:MM:SS +0800
description: "准确的一句话摘要"
tags: [systems]
categories: [research]
toc:
  sidebar: left
---
```

未单独设置 permalink 时，本站使用 `/blog/:year/:title/`。发布前确认路径、标签/分类归档和搜索结果。更新已有文章时保持原 permalink，必要时使用真实的 `last_updated` 或 `last_modified_at`。

按实际需要增加：

| 能力                  | 使用方式                                                                       |
| --------------------- | ------------------------------------------------------------------------------ |
| 列表缩略图            | front matter `thumbnail: /assets/img/真实图片.png`；确认文件和 alt             |
| 置顶                  | `featured: true`；确认列表与置顶的重复展示是否符合意图                         |
| 目录                  | `toc.sidebar: left` 或 `toc.beginning: true`，文章要有真实标题层级             |
| 公式                  | 确认 `al_math` 与全局 `enable_math`；使用 Markdown 数学语法并看实际渲染        |
| 图表、TikZ、代码 tabs | 读取目标版本官方文章示例及 owning plugin 的 front matter；不要猜测统一开关     |
| 相关文章              | 全局 `related_blog_posts.enabled`；按需设置单篇 `related_posts: false`         |
| Distill               | `layout: distill`，确认插件和全局 feature；按同版本官方示例填写作者/引用等字段 |
| 原生图片放大          | 使用 `figure.liquid` 的 `zoomable=true` 或 `data-zoomable`；实际测试点击       |
| 带链接的旧图库        | `images.lightbox2: true`，图片链接加 `data-lightbox="组名"`；测试切换和关闭    |

原生图片示例：

```liquid
{% include figure.liquid path="assets/img/真实图片.png" class="img-fluid" alt="描述图片内容" zoomable=true %}
```

当自动 WebP 转换打开时，确认图片在配置的输入目录内且构建确实生成 srcset 指向的文件。对于旧路径或非转换素材，按实际组件接口使用 `avoid_scaling=true`，不要生成不存在的衍生图片链接。

添加新标签后，再决定是否放进 `display_tags` / `display_categories` 首页导航；不要保留没有真实内容的 demo 标签。

## Publications

在 `_bibliography/papers.bib` 添加或更新正确的 BibTeX，核实作者、年份、venue、DOI/arXiv 和公开状态。常用原生字段：

- `selected={true}`：首页精选。
- `bibtex_show={true}`：Bib 按钮；`abstract`：摘要展开。
- `doi`、`arxiv`：使用标识符；`code`、`html`、`blog`、`website` 使用实际链接。
- `pdf`：完整 URL 或 `assets/pdf/` 下的文件名；poster/slides 等核对当前组件的路径约定。
- `abbr`：配合 `_data/venues.yml`；`preview` 配合 `assets/img/publication_preview/`。
- `scholar.first_name/last_name` 控制本人标注，`_data/coauthors.yml` 控制合作者链接。

保留 `_pages/publications.md` 中的 `{% include bib_search.liquid %}` 和 `{% bibliography %}`。不要用手写卡片或 CV 数据替代论文数据源。新增论文后更新测试里有意维护的预期论文数量，不能删除计数检查掩盖漏渲染。

## Repo

在 `_data/repositories.yml` 修改以下原生字段：

```yaml
github_users:
  - RegiaYoung
github_repos:
  - RegiaYoung/实际公开仓库
repo_description_lines_max: 3
```

保留 `repository/repo_user.liquid`、`repository/repo.liquid`、深浅色主题和本站代码可用性说明。仓库描述/语言/star/fork 由外部卡片服务提供，不是本站手填的静态统计。验证服务失败时直接链接仍可用，不把失败卡片当成成功渲染。

## About、新闻与联系方式

- biography 修改 `_pages/about.md`，保留 native about layout、news、latest_posts、selected_papers 和 social 的选择。
- 新闻写进 `_news/`；沿用已有 front matter。需要完整详情时才创建非 inline 新闻。
- 联系方式改 `_data/socials.yml`；使用实际值。保留 RSS 地址与 feed 配置一致。
- 用户提供头像后才设置 profile image；使用素材本身合适的裁剪和 alt，不补造地址/办公室信息。

## CV

修改 `_data/cv.yml` 的实际 `cv.sections`；保留 `layout: cv`、`cv_format: rendercv` 和目录配置。不要假定官网所有 RenderCV 字段都被当前 al_folio_cv HTML renderer 支持；读取本地 gem 的 section 模板。

在当前锁定版本里，自定义通用条目可用 `bullet`，或 `label` / `details`；不能只写任意字符串后把空白网页当成成功。比较完整渲染结果，尤其是 Education、Publications、Teaching。

只有实际 PDF 存在且内容已核验，才配置 `cv_pdf`。自动生成 PDF 是另一个可选 workflow，需要单独配置和验证，不由 `layout: cv` 自动完成。

## 可选集成

配置评论、newsletter、analytics、Scholar/citation 或外部 feeds 时，先确认用户所选服务及授权。不要复制官方 demo 的服务 ID 或第三方文章，也不要将仓库 secrets 写进配置/日志。未要求该集成时，保留可配置状态即可。
