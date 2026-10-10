# Native al-folio feature audit

Reviewed against starter `alshedivat/al-folio@d83066c21e6cdb9c0846e548a499064abe23e0ef` and this site's pinned runtime gems on 2026-10-09. This is a feature/configuration audit, not a dependency upgrade. Keep the five-page navigation: About / Publications / Repo / Blog / CV.

## Restored during migration review

| Area              | Native functionality                                                                                  | Site configuration                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| About             | News, latest posts, selected publications, social icons                                               | Native about layout; real email/GitHub/RSS links, five news items and three latest posts                               |
| Publications      | In-page filtering, BibTeX, abstracts, paper/code links, preview images                                | Native bibliography and `bib_search.liquid`; thumbnails enabled and shown only when an entry supplies a preview        |
| Repo              | Profile and repository cards, light/dark images                                                       | Native includes and `github_users` / `github_repos`; direct links remain available if the external stats service fails |
| Blog              | Post list, thumbnails, dates, reading time, tags/categories/year archives, featured posts, pagination | Native starter page; five posts per page; only real article tags/categories                                            |
| Articles          | Table of contents, reading progress, image zoom, related posts                                        | Native runtime; BIOS article gets a sidebar TOC and a native lightbox gallery on its existing image links              |
| CV                | RenderCV sections and sidebar table of contents                                                       | Native CV layout with `toc.sidebar: left`                                                                              |
| Technical writing | MathJax and Distill layout                                                                            | Restore `enable_math` and the installed Distill feature; no demo posts are published                                   |
| Discovery         | Site search, RSS, sitemap, canonical/OG/schema metadata                                               | Search enabled; existing Atom feed kept at `/index.xml`; the social RSS link explicitly uses that path                 |

Featured cards, a next-page button, related articles, and publication thumbnails require corresponding content. One current blog article does not warrant a featured duplicate or pagination controls. Publication author lists deliberately remain complete instead of using the upstream three-author collapse limit.

The BIOS article keeps its historical `/post/…/` permalink and all original image paths. The native post layout only links header tags/year to archives for `/blog/…/` URLs, so this legacy article's header metadata stays plain text; the Blog page provides working archive links. No layout override is needed to preserve its address.

## Available when content requests it

The installed native plugins still provide syntax highlighting/code copy, tabs (`tabs: true`), Mermaid/Plotly/ECharts/Chart.js, TikZ/pseudocode, galleries/lightboxes/sliders, video/audio embeds, article citations/references, and external posts. They are not all loaded on every page. Use the upstream documented front matter and data fields when adding content.

No local layout, include, CSS, or JavaScript overrides have been introduced. Blog and Repo retain the upstream starter page structures, with personal content and navigation changes.

The CV update on 2026-10-10 adds a site-owned data adapter, `_plugins/cv_publications.rb`, rather than a template override. It populates the native CV publication fields from the same `papers.bib` used by Publications at each build, including authors via the supported `summary` field and existing paper/code links. Education, honors, and other CV sections still use the native renderer and sidebar. Scholarship date ranges use en dashes to preserve both endpoints in its date badges.

## Deliberate exclusions and setup still required

| Feature                                                | Current state and reason                                                                                                                | To use it                                                                                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Projects, Books, Teaching and People demo pages        | Omitted from the requested five-page site; project categories and masonry are disabled                                                  | Add real content/collections and the relevant flags if the site's scope expands                                                       |
| Portrait, office details, CV PDF                       | No verified assets supplied; no placeholder identity information is published                                                           | Supply the assets/details, then enable the existing native fields                                                                     |
| Comments, newsletter, analytics, cookie consent        | Plugins remain installed; service configuration is empty                                                                                | Configure the chosen service and its IDs/endpoints; enable consent if needed for analytics                                            |
| Citation/attention badges and Scholar refresh workflow | Disabled; no verified Scholar profile or citation metadata configured; no scheduled scraping added                                      | Supply the identifiers and choose the desired providers/workflow                                                                      |
| GitHub trophies                                        | Disabled in the upstream starter as well                                                                                                | Configure an available/self-hosted service before enabling                                                                            |
| External feeds                                         | No sources configured; upstream example feeds were removed                                                                              | Add the user's intended sources to `external_sources`                                                                                 |
| Responsive WebP generation                             | `jekyll-imagemagick` is installed but automatic conversion is disabled; existing BIOS images already have preserved responsive variants | Enable `imagemagick`, provide source images under its input directories, and ensure ImageMagick is installed in the build environment |
| Jupyter notebook embedding                             | `jekyll-jupyter-notebook` was removed from both Gemfile and plugins; no current post uses it                                            | Restore the gem/plugin together and install the Python notebook conversion requirements before adding notebook posts                  |
| JSONResume input                                       | CV uses the supported RenderCV format; the upstream Einstein resume importer was removed                                                | Supply a real resume JSON and configure `jekyll_get_json` / `cv_format: jsonresume`                                                   |
| Fixed footer                                           | Disabled to keep longer pages in normal document flow                                                                                   | Restore `footer_fixed` if desired; unrelated to feature availability                                                                  |

Upstream references: [feature inventory](https://github.com/alshedivat/al-folio#features), [customization](https://github.com/alshedivat/al-folio/blob/main/docs/CUSTOMIZE.md), and [runtime ownership](https://github.com/alshedivat/al-folio/blob/main/docs/BOUNDARIES.md).
