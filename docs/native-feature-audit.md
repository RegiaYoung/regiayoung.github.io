# Native al-folio feature audit

Reviewed against starter `alshedivat/al-folio@d83066c21e6cdb9c0846e548a499064abe23e0ef` and this site's pinned runtime gems on 2026-10-09. This is a feature/configuration audit, not a dependency upgrade. Current navigation: About / Publications / Projects / Blog / CV (updated by user on 2026-10-26).

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

Blog and Repo retain the upstream starter page structures and native components, with personal content, navigation, and section ordering changes.

The CV update on 2026-10-10 adds a site-owned data adapter, `_plugins/cv_publications.rb`, rather than a template override. It populates the native CV publication fields from the same `papers.bib` used by Publications at each build, including authors via the supported `summary` field and existing paper/code links. Education, honors, and other CV sections still use the native renderer and sidebar. Scholarship date ranges use en dashes to preserve both endpoints in its date badges.

## Intentional presentation overrides (2026-10-10)

The initial presentation review added consistent name/title weights, selected publications before news/latest posts, a smaller Blog header and social icons, larger paper buttons, and clearer publication years. Later user feedback on the same day supersedes the compact CV and repository-first choices: CV section/contact sizing is restored, and the native GitHub profile again comes first. All feature gates and native components remain in place.

| Local file              | Scope                                                              | Preserved upstream behavior                                                                           |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `_layouts/about.liquid` | Reorder existing sections; allow a news title; add a styling scope | Profile, news, latest posts, selected papers, social links, newsletter, and their conditions/includes |
| `assets/css/main.scss`  | Append `@use "regia"`                                              | Every upstream Sass module and the configured content width                                           |

The site-owned `_sass/_regia.scss` scopes the visual changes to native components; it does not replace a gem partial. Publication self-author matching still uses native Scholar configuration, with the same semibold emphasis as CV. CV content shortens repeated research descriptions while retaining the advisor, roles, dates, degree, awards, and teaching records. The native CV renderer, TOC, and shared bibliography adapter are unchanged. No runtime JavaScript override is added.

`.al-folio-overrides.yml` records the reviewed upstream baselines. After updating the owning gem, run the official overrides audit and diff, merge any upstream changes into these small copies, then accept each reviewed file. Never accept an override just to silence an audit. The repository browser tests cover homepage section order and readable Repo links when external cards fail, alongside existing search, archives, publication controls, CV/TOC, theme, and gallery checks.

## Follow-up corrections (2026-10-10)

- **Typography:** use Open Sans 400, matching the reference homepage's declared body family, rather than the native Roboto 300. Keep the Google Fonts configuration and Sass stack aligned, and preserve icon/monospace fonts and system fallbacks.
- **About:** label news “What's new” via front matter; keep the existing news route/include. Clarify the verified undergraduate degree/year and link the two public systems from the research paragraph.
- **Feed:** `/index.xml` returns valid Atom XML, not a broken page. Its site title was `blank` and the entry author was empty. A real `title` and `author` now populate the native feed; no route or feed format changes. The social link explicitly says it subscribes to the blog.
- **Venue badges:** the native abbreviation can contain a `div` that receives the global black text color in light mode. Set both the badge and its text children to white, and test the rendered text contrast against each venue background in both themes.
- **Repo:** remove the custom-title include override, data, and manifest entry. Restore the earlier profile-first page and native nickname lookup; the user confirmed “Okabe” is correct. Repository cards, trophies gate, and direct links remain.
- **CV:** remove compact heading/contact overrides. Keep the native width, grid, sidebar, and section templates. The current Tailwind runtime lacks the native CV's list-group reset, so scope block-entry/list-reset styles to `.cv`; preserve nested highlight lists. This fixes the detached dots without replacing the renderer. Keep the previously verified CV facts and shared publications.

Visual regression checks cover the venue label's actual child text (not just its wrapper), CV row alignment and nested lists, and both desktop/mobile themes. Do not treat “no horizontal overflow” alone as proof of a correct layout.

## About and search refinement (2026-10-11)

The About introduction explicitly names Computer Science in the B.Eng. sentence and describes SlideFormer/SlideDP as publicly released work. Keep the compact biography and research paragraphs; do not infer or disclose unreleased projects.

The native search trigger uses a compact pill with a smaller monospace shortcut and leading search icon, styled only in `_sass/_regia.scss`. Keep `#search-toggle .nav-link` intact: the installed `al_search` plugin rewrites its contents to show ⌘ K on Mac. The original button label, click handler, keyboard shortcuts, mobile menu collapse, and modal remain plugin-owned. Verify both light/dark contrast and desktop/mobile interaction when changing this styling; no header or JavaScript override is needed.

## Deliberate exclusions and setup still required

| Feature                                                | Current state and reason                                                                                                                | To use it                                                                                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Books, Teaching and People demo pages                  | Omitted from the requested five-page site; project categories and masonry are disabled                                                  | Add real content/collections and the relevant flags if the site's scope expands                                                       |
| Portrait, office details                               | No verified assets supplied; no placeholder identity information is published                                                           | Supply the assets/details, then enable the existing native fields                                                                     |
| Comments, newsletter, analytics, cookie consent        | Plugins remain installed; service configuration is empty                                                                                | Configure the chosen service and its IDs/endpoints; enable consent if needed for analytics                                            |
| Citation/attention badges and Scholar refresh workflow | Disabled; the verified Scholar profile is linked, but citation metadata and scheduled scraping remain unconfigured                      | Choose the desired providers/workflow before enabling                                                                                 |
| GitHub trophies                                        | Disabled in the upstream starter as well                                                                                                | Configure an available/self-hosted service before enabling                                                                            |
| External feeds                                         | No sources configured; upstream example feeds were removed                                                                              | Add the user's intended sources to `external_sources`                                                                                 |
| Responsive WebP generation                             | `jekyll-imagemagick` is installed but automatic conversion is disabled; existing BIOS images already have preserved responsive variants | Enable `imagemagick`, provide source images under its input directories, and ensure ImageMagick is installed in the build environment |
| Jupyter notebook embedding                             | `jekyll-jupyter-notebook` was removed from both Gemfile and plugins; no current post uses it                                            | Restore the gem/plugin together and install the Python notebook conversion requirements before adding notebook posts                  |
| JSONResume input                                       | CV uses the supported RenderCV format; the upstream Einstein resume importer was removed                                                | Supply a real resume JSON and configure `jekyll_get_json` / `cv_format: jsonresume`                                                   |
| Fixed footer                                           | Disabled to keep longer pages in normal document flow                                                                                   | Restore `footer_fixed` if desired; unrelated to feature availability                                                                  |

Upstream references: [feature inventory](https://github.com/alshedivat/al-folio#features), [customization](https://github.com/alshedivat/al-folio/blob/main/docs/CUSTOMIZE.md), and [runtime ownership](https://github.com/alshedivat/al-folio/blob/main/docs/BOUNDARIES.md).

## Public profile refresh (2026-10-26; supersedes earlier choices)

- Disable only the homepage latest-posts block through its native front-matter flag. Keep Blog, the original BIOS permalink, RSS, search, archives and the native include.
- Rename the Repo destination to Projects (`/projects/`); retain direct redirects from `/repo/` and `/repositories/`. Add sourced SlideFormer/SlideDP descriptions and paper results, clearly separated from current code availability. Keep native profile/card/trophy gates; Okabe remains the native nickname.
- Add one reviewed override, `_includes/metadata.liquid`, to support separate browser/social titles, consistent OG/Twitter titles, large-image cards and PNG/ICO links. Preserve all native description, social-schema, conditional OG and page-specific image behavior. Site/visible name stays Ruijia Yang. Native Apple touch configuration supplies the 180px PNG.
- Preserve the original SVG mark. Rasterize it at 16, 32, 48, 192 and 180 pixels; provide a multi-size ICO and an editable 1200x630 SVG/PNG share card.
- Enable the native CV PDF link with a visible CSS label. Generate the PDF from `_data/cv.yml` using the same bibliography adapter via `scripts/export_cv.rb`; CI builds it before Jekyll. No CV template override or duplicate paper list.
- Verify Scholar profile `iPRd0kcAAAAJ` (matched name, HKUST(GZ), verified school email and four papers). Its current public table lists SlideFormer as DAC 2026, pages 1-7. Add its direct ACM landing link and publisher/pages; add CIKM pages 301-311 from ACM metadata. Add EHR-Bench as an October 2026 preprint with all eight authors, arXiv/PDF/code links. Include it in homepage selections and the shared CV. No submission venue or citation counts are inferred.

Sources checked: [Google Scholar](https://scholar.google.com/citations?user=iPRd0kcAAAAJ), [SlideFormer](https://arxiv.org/abs/2603.16428), [ACM DOI](https://dl.acm.org/doi/10.1145/3770743.3804125), [CIKM](https://dl.acm.org/doi/10.1145/3746252.3761178), [SlideDP](https://arxiv.org/abs/2609.34162), [EHR-Bench](https://arxiv.org/abs/2610.16689). ACM's direct page blocked automated retrieval; the existing DOI was retained, Scholar supplied DAC pages, and ACM's indexed CIKM record supplied its pages.

Follow-up homepage selection (2026-10-26): the user requested that EHR-Bench remain in Publications and the shared CV but not appear in homepage selections or news. Set its native `selected` field to false and remove its inline announcement. Also remove the June 30 SlideFormer revision announcement. Keep the What's new section and its other announcements enabled.

## User-supplied portraits (2026-11-01)

The homepage now uses the native profile field with an adjusted travel portrait, right-aligned on desktop and centered on mobile. The supplied formal portrait is used in the HTML CV contact card and PDF header. A site-owned post-render adapter adds the HTML image while preserving the native CV renderer and sections. The PDF remains generated from shared CV data. Portrait assets are now supplied; earlier statements that a portrait is unavailable are superseded.

## CV skills and download scope (2026-11-06)

The user confirmed a concise Technical Skills section ordered as programming/frameworks, systems optimization, then GPU programming. The emphasis remains training systems and the user's first-author work. It uses native CV bullet entries. No proficiency ratings, internship availability, or separate profiling section are added. The undergraduate major is Computer Science and Technology; Computer Architecture is not an additional degree track.

Teaching remains in the HTML CV and native sidebar. The public PDF intentionally omits it through `_data/cv.yml`'s `pdf.exclude_sections`, passed by the shared export adapter to the renderer. Awards use compact inline formatting in the PDF while retaining the same names, dates, and roles. The renderer validates included and excluded sections; the bibliography remains shared and complete.

Private application materials are maintained outside this public repository and its build inputs. Unreleased research titles, manuscripts, submission details, and private application PDFs must not be added to the public bibliography, assets, or review branches without explicit publication authorization.

## Research-focused CV revision (2026-11-06; supersedes the earlier CV arrangement)

The user requested First-Author Research (SlideFormer, SlideDP, OOM, CTRL) and Other Research (EHR-Bench, CIKM mask learning, Dovetail), with each work appearing once. The CV bibliography adapter now resolves explicit `bib_key` references into native generic bullet entries; public titles, full author lists and links still come from `papers.bib`. It fails on unknown or duplicated references and on public papers omitted from the CV. The public Publications page and its bibliography are unchanged. The native CV layout, sidebar, education, awards and teaching remain active.

The user explicitly authorized OOM, CTRL and Dovetail titles and concise research descriptions in the public CV and its downloadable PDF. Their user-confirmed status is “Under review”; no submission venue, manuscript, private repository URL, or invented paper link is published. They are CV-only research entries and are not added to Publications, Projects, the homepage or news. This authorization supersedes the earlier exclusion for these three CV entries only.

Technical Skills is last, with Programming & GPU development (Python, C++, CUDA, Triton), Frameworks (FSDP without a version suffix), and Systems optimization. The short research-interest statement stays in the academic webpage; application PDFs use a compact header line. ASC 2026 retains First Prize and Advisor without the team name. Teaching remains web-only. The PDF carries research interests in its header rather than a separate section. The PDF uses author roles rather than repeating full bibliographic author lists and integrates key results into contribution paragraphs.

## Restore the academic CV presentation (2026-11-06; supersedes the research grouping above)

The user clarified that the website CV should keep its previous academic layout and bullet structure. Restore Education, Research Interests, Technical Skills, Publications, Research Experience, Honors and Awards, and Teaching in their original order. Restore the native publication rows with year badges, complete available author lists and paper links, and the two doctoral/undergraduate research bullets. Do not apply the application resume's Primary Research / Other Research grouping or contribution paragraphs to the website. Retain the already confirmed C++/FSDP skill corrections and concise Advisor role.

The CV-only additional_publications data contains OOM, CTRL and Dovetail with Under review status and no links. OOM/CTRL show the verified first-author role without inventing the remaining author list; Dovetail retains its supplied full author list. A CV-only publication_status override marks SlideDP Under review while preserving its public paper/code links. All four existing published/preprint entries still derive from papers.bib; the separate Publications page remains unchanged. Teaching stays on the webpage and is omitted from the academic PDF download. Application PDFs remain separate one-page recruiting documents.

## Academic CV section order (2026-11-06)

Move Technical Skills to the end so the academic reading order is Education, Research Interests, Publications, Research Experience, Honors and Awards, Teaching, and Technical Skills. Preserve every section's content, native renderer, bullet structure, publication rows, and sidebar navigation. The public PDF follows the same shared order while continuing to omit Teaching. The separate application resumes are unchanged by this reorder.
