# Ruijia Yang's personal website

Academic homepage for **https://regia.me**, using [al-folio](https://github.com/alshedivat/al-folio) v1.x and Jekyll.

Navigation: **About / Publications / Repo / Blog / CV**.

## Edit content

| Content                         | File                       |
| ------------------------------- | -------------------------- |
| Biography and homepage          | `_pages/about.md`          |
| Publications (BibTeX)           | `_bibliography/papers.bib` |
| GitHub profiles, repos, status  | `_data/repositories.yml`   |
| CV                              | `_data/cv.yml`             |
| News                            | `_news/*.md`               |
| Blog                            | `_posts/`                  |
| Contact links                   | `_data/socials.yml`        |
| Domain, metadata, feature flags | `_config.yml`              |

The original 2021 BIOS article keeps its `/post/教程-硬刷biosx370主板成功进化/` permalink and original image paths. Its article text is preserved. The old generated Hugo pages and custom Python builder have been replaced by Jekyll source content; previous versions remain in git history.

No photo, Google Scholar ID, or downloadable CV PDF is configured. Add these only when available. The CV page currently renders verified information from YAML.

### CV and shared publications

Edit education, research experience, honors, and teaching in `_data/cv.yml`. Keep its `Publications: []` slot: `_plugins/cv_publications.rb` fills it in memory at every Jekyll build from `_bibliography/papers.bib`, ordered by descending year and month. Update paper metadata and PDF/code/arXiv/DOI links only in the bibliography; do not maintain a second publication list in the CV YAML.

The adapter uses the existing BibTeX dependency and the native CV renderer, with no CV template override. Because the pinned renderer does not display `authors` directly, the adapter also puts the full author list and available links in its supported `summary` field. Local PDF filenames resolve under `assets/pdf/`, as on Publications. This integration builds the website only; any future standalone RenderCV PDF workflow must also consume the shared bibliography.

Award date ranges use an en dash (for example `2020–2023`), since the native award renderer treats an ASCII hyphen as an ISO date separator and otherwise displays only the first year.

## Blog and repository pages

Blog and Repo reuse al-folio's native starter pages and runtime includes. The blog supports thumbnails, reading time, year/tag/category archives, pagination (five posts per page), and optional featured posts (`featured: true`). Only existing tags and categories are shown; no demo posts are included. New posts belong in `_posts/YYYY-MM-DD-slug.md` with a `layout: post`, title, description, tags and categories. A `thumbnail` is optional. The old `/notes/` URL redirects to `/blog/`.

Repository profile/stats cards use the native `github_users`, `github_repos`, and `repo_description_lines_max` settings in `_data/repositories.yml`. The additional `repositories` entries preserve code availability and paper links. Cards load public statistics from the upstream GitHub stats service; the direct GitHub links and code availability remain usable if that service is unavailable. Site search is enabled for pages, posts, and publications.

## Local development

Use Ruby 3.3.5, Bundler 4.0.6, Node.js 22, and Python 3.

```sh
bundle install
npm ci
bundle exec jekyll serve
```

Open `http://localhost:4000/`. Unlike the upstream demo, this site has an **empty baseurl** because it is hosted at the root of a custom domain.

```sh
npm run lint:prettier
bundle exec al-folio upgrade audit --no-fail
JEKYLL_ENV=production bundle exec jekyll build
python3 scripts/check_site.py
npx playwright install chromium
npm run test:site
```

## Publishing and domain setup

The workflow builds and checks pull requests without deploying them. It deploys only the `main` branch, after checks pass. In repository **Settings → Pages**, select **GitHub Actions** as the publishing source.

Set **Custom domain** to `regia.me` in GitHub Pages settings, then configure the domain's DNS provider. For an apex domain using A records, GitHub currently documents these four values:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optional: point a `www` CNAME at `regiayoung.github.io`. Enable **Enforce HTTPS** when GitHub has issued the certificate. DNS propagation and certificate provisioning may take time.

The repository's `CNAME` records the intended domain; with a custom Actions workflow, the domain must also be set in GitHub Pages settings. Editing that file alone does not bind the domain. This migration does not change DNS or Pages administration settings.

Official guide: [Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Theme maintenance

The [native feature audit](docs/native-feature-audit.md) records restored features, content-dependent options, and integrations that remain unconfigured. Check it before simplifying or disabling native functionality.

Agents should use the repository's [al-folio maintenance skill](.agents/skills/al-folio-maintain/SKILL.md). It covers content updates, official documentation, dependency upgrades, and feature preservation. CI runs its read-only native feature check; update the policy only when an intentional site change requires it.

Starter snapshot: `alshedivat/al-folio@d83066c21e6cdb9c0846e548a499064abe23e0ef`. Runtime gems and transitive dependencies are pinned in `Gemfile` / `Gemfile.lock`.

Presentation rules live in `_sass/_regia.scss`. Three small, intentional theme overrides retain all upstream functionality: `assets/css/main.scss` adds that Sass module after the native imports; `_layouts/about.liquid` puts selected papers before news/latest posts and uses a uniform name heading; `_includes/repository/repo_user.liquid` accepts an optional card title from `github_user_titles` in `_data/repositories.yml`. Repo shows repository cards and code availability before profile statistics. Blog and CV keep their native renderers.

These overrides are acknowledged in `.al-folio-overrides.yml`. On every theme upgrade, run `bundle exec al-folio upgrade overrides audit`, inspect `overrides diff PATH` for each affected file, and reconcile upstream changes before `overrides accept PATH`. Do not accept unexplained drift or replace the theme's full Sass module list with the site stylesheet. See the feature audit for the retained components and the maintenance skill for the complete workflow.

Update gem pins and the lockfile deliberately, run the upgrade audit, then rebuild and check the site. Keep plugin activation in `_config.yml` aligned with `Gemfile`. See the [upstream maintenance guidance](https://github.com/alshedivat/al-folio/blob/main/docs/INSTALL.md#maintaining-dependencies).

The al-folio template is used under its MIT license; see `LICENSE`. Article content remains the author's own work.
