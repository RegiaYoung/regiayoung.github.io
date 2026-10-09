# 升级与验证

## 先区分任务

- 内容更新：通常不动 gem/CDN 版本。
- 同一 v1 系列的修复：读取相应插件 release/CHANGELOG，升级需要的包。
- 跨版本迁移：使用官方 migration 指导，先盘点内容、路由、功能和覆盖；v1 规则不能盲套未来 major。
- 运行时定制：确认 owning gem，优先已有配置，必要时使用有记录的最小本地覆盖。

## 建立可比较的基线

1. 检查 remote、分支、未提交修改和 PR 状态。在用户仓库的合适工作分支上操作，不向 `alshedivat/al-folio` 推送个人站点改动。
2. 记录当前 Gemfile/lock、starter 来源、全局开关、页面 front matter 和已有覆盖。
3. 运行本站功能检查和已有验证，记录基线失败；必要时保留受影响页面截图。
4. 比较“安装版本 → 目标版本”的官方变更；不要拿 demo 当前页面的内容数量当作功能规格。

## 更新依赖和配置

- 先选定实际目标版本，再改精确 gem pin，运行对应的 `bundle update GEM_NAMES` 更新 lock。需要全面更新时才扩大依赖范围，并说明连带变化。
- 同步 `Gemfile` 与 `_config.yml` 的 plugin activation；核对名称差异，如 `jekyll-scholar` gem 对应 `jekyll/scholar` activation。
- 保留 `theme: al_folio_core` 与 `al_folio` API/style-engine/tailwind/distill contract；按目标版本迁移，不删除报错字段来消音。
- 官方 safe codemod 是可选的迁移工具，不是自动批准所有改动。执行前看支持项，执行后审查 diff。
- CDN 版本、实际 URL、对应 SRI 必须一起核验。先确认响应是真正的 JS/CSS，不能对错误 HTML 页面算哈希后“修好”SRI；不能简单删除 integrity。
- 不提交本机 `path:` gem、临时 CDN 代理、下载凭据或测试文章。不因本机网络限制把整套运行时复制入仓库。

## 本地覆盖

用户站点允许本地覆盖，官方 starter 的限制不能误套。对有意保留的覆盖：

```bash
bundle exec al-folio upgrade overrides audit
bundle exec al-folio upgrade overrides diff ACTUAL_PATH
# 只有已经审阅并理解差异后：
bundle exec al-folio upgrade overrides accept ACTUAL_PATH
```

提交 `.al-folio-overrides.yml`。未来 gem 更新后重新检查 drift；不要用 accept 批量掩盖未审查的差异。

## 验证命令

先读取目标仓库脚本和 CI。本站目前的完整验证是：

```bash
npm ci
npm run lint:prettier
ruby .agents/skills/al-folio-maintain/scripts/check_native_features.rb --root .
bundle exec al-folio upgrade audit --no-fail
JEKYLL_ENV=production bundle exec jekyll build
python3 scripts/check_site.py
npm run test:site
```

初次运行浏览器测试时按仓库说明安装 Playwright 浏览器；不要假定先前会话的浏览器路径存在。使用 workflow 指定的 Ruby/Node 版本，本机已有合适环境可直接用；不要为普通修改无关重建系统。

`--no-fail` 只控制退出码，必须查看 blocking/non-blocking 数量与报告。升级时可用官方严格 audit 和 report，并解决实际阻塞。不要因为返回 0 就宣称无问题。

对单纯 skill/文档改动，重点检查 skill、脚本和 CI 连接；不重复无关页面测试。页面/配置/依赖变化时按具体风险验证：

| 改动             | 实际检查                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| About / 导航     | 新旧入口、最新文章、联系链接、手机菜单                                   |
| Publications     | 筛选与清空、Bib/Abs 按钮、预览图与真实外链                               |
| Blog / 路由      | 列表、缩略图、标签/分类/年份、搜索、旧 URL、RSS；有足够内容再测分页/置顶 |
| Repo             | 深浅色 SVG 实际加载、错误图、服务不可用时的直接链接                      |
| CV / TOC         | 各 section 非空、目录点击、手机换行与横向溢出                            |
| 文章/公式/图库   | 真实公式排版、放大/切图/关闭、目录跳转、阅读进度、图片地址               |
| CDN/runtime 升级 | 浏览器控制台/SRI/网络加载、桌面手机与深浅色                              |
| 发布流程         | 现有 workflow 条件、最小权限、PR 不发布而 main 发布的约定                |

临时样例验证后删除生产源里的测试内容，并重新构建干净产物。源码静态检查、构建、浏览器交互是不同证据，不能互相替代。

## 发布与回退

保持当前 workflow 和自定义域名；CNAME 文件不是后台域名配置的替代品。已有发布授权则按它继续；否则提供具体 PR/预览，不宣称已经上线。遇到失败保留可审阅改动和明确错误，不自行强推 main。

发布后检查实际网站的改动页面、资源和关键旧地址。需要回退时按仓库既定方式 revert 本次变更，保留用户并行更新；不要用过时快照覆盖整个网站。
