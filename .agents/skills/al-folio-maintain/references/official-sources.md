# 官方来源与版本边界

核对日期：2026-10-09。官方 starter 当时的 main 为 `d83066c21e6cdb9c0846e548a499064abe23e0ef`。这是审查基线，不是“永远最新”的版本。版本升级时重新读取目标发布记录及对应源码。

## 官方阅读路径

| 要解决的问题                             | 一手来源                                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 功能总览、哪些服务要配置                 | [README Features](https://github.com/alshedivat/al-folio#features)                                                                                                                                                                                                                        |
| v1 运行时归属、静默门控、覆盖规则        | [ARCHITECTURE](https://github.com/alshedivat/al-folio/blob/main/docs/ARCHITECTURE.md)、[BOUNDARIES](https://github.com/alshedivat/al-folio/blob/main/docs/BOUNDARIES.md)                                                                                                                  |
| 日常使用：CV、论文、Repo、文章、第三方库 | [CUSTOMIZE](https://github.com/alshedivat/al-folio/blob/main/docs/CUSTOMIZE.md)                                                                                                                                                                                                           |
| 安装、依赖、升级、部署                   | [INSTALL](https://github.com/alshedivat/al-folio/blob/main/docs/INSTALL.md)、[FAQ](https://github.com/alshedivat/al-folio/blob/main/docs/FAQ.md)                                                                                                                                          |
| 原生配置、依赖和页面                     | [\_config.yml](https://github.com/alshedivat/al-folio/blob/main/_config.yml)、[Gemfile](https://github.com/alshedivat/al-folio/blob/main/Gemfile)、[\_pages](https://github.com/alshedivat/al-folio/tree/main/_pages)、[\_posts](https://github.com/alshedivat/al-folio/tree/main/_posts) |
| 官方 agent 工作流                        | [bootstrap skill](https://github.com/alshedivat/al-folio/blob/main/.agents/skills/al-folio-bootstrap/SKILL.md)、[v1 migration skill](https://github.com/alshedivat/al-folio/blob/main/.agents/skills/al-folio-v1-migration/SKILL.md)                                                      |
| 新版本变化                               | [starter releases](https://github.com/alshedivat/al-folio/releases) 及下表各插件自己的 releases/CHANGELOG                                                                                                                                                                                 |

精确复现本基线时，将 GitHub URL 中的 `main` 替换为上述 SHA。内容说明与安装代码不一致时，读取锁定 gem 内实现及它自己的官方说明，报告差异，不把文档示例机械覆盖到用户网站。

## 运行时归属

| 功能                                         | 官方仓库 / gem                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| 页面、导航、BibTeX 展示、Repo includes、样式 | [al-folio-core](https://github.com/al-org-dev/al-folio-core) / `al_folio_core`          |
| CV                                           | [al-folio-cv](https://github.com/al-org-dev/al-folio-cv) / `al_folio_cv`                |
| Distill                                      | [al-folio-distill](https://github.com/al-org-dev/al-folio-distill) / `al_folio_distill` |
| 升级与覆盖审计                               | [al-folio-upgrade](https://github.com/al-org-dev/al-folio-upgrade) / `al_folio_upgrade` |
| 搜索 / 公式 / 图表 / 图库                    | `al-org-dev/al-search`、`al-math`、`al-charts`、`al-img-tools`；gem 使用下划线          |
| 图标 / 引用 / 外部文章                       | `al-org-dev/al-icons`、`al-citations`、`al-ext-posts`                                   |
| 评论 / 分析 / 订阅 / cookie                  | `al-org-dev/al-comments`、`al-analytics`、`al-newsletter`、`al-cookie`                  |

## 必须区分的情况

- 官方 demo 是项目站，示例 `baseurl: /al-folio`；regia.me 是根域名，必须为空。不可直接复制 demo 构建参数。
- 官方 INSTALL 的部分部署指导使用 `gh-pages` 分支；本站实际采用 GitHub Actions Pages artifact/deploy。除非任务就是迁移部署，不替换当前流程，不扩大 workflow 权限。
- starter 与插件分别发布。升级模板不等于合并官方 main 全部内容；通常只需更新相关 gem pin、lock 和必要配置。
- 官方 `lint:style-contract` 针对 starter 自身。用户网站可以有明确且已审计的本地覆盖，不能据此删除合法自定义。
- 官方库默认值不等于用户偏好。不要导入 Einstein、示例论文、外部示例 feed、演示评论账号或被用户排除的页面。
- GitHub trophy 在本基线也默认关闭；它不是迁移遗漏。服务可用性会变化，启用前重新核实。
- 关于相关文章的选择算法、特殊 CV 字段等，读取锁定版本实现；不要仅据泛化文档承诺不存在的行为。
