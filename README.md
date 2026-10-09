# Ruijia Yang's personal website

An English research homepage for Ruijia Yang, with selected publications,
research projects, news, experience, and an archive of the original Arclight
hardware post. This site is static and requires no frontend dependencies.

## Update the website

1. Edit `content/site.json` to update publications, news, contact links, or the
   canonical domain. Edit `templates/home.html` for biography and experience.
2. Run `python3 scripts/build.py` from this directory.
3. Commit the source files and generated HTML together. The repository root
   remains the GitHub Pages publishing directory.

CSS and browser interactions live in `assets/site.css` and `assets/site.js`.
Core content and links work without JavaScript. JavaScript adds theme
switching, publication filters, and citation copying; BibTeX is always readable.
All assets for the new design are local, with no external font, icon, or runtime
dependencies. Layouts adapt to desktop and mobile, respect reduced motion,
include keyboard focus indicators, and support light/dark themes.

To preview locally, run `python3 -m http.server 8000`, then open
`http://localhost:8000/`. To verify a project-site prefix, serve this directory
from its parent and open its folder path instead.

## Original content and URLs

The original BIOS article stays at
`post/教程-硬刷biosx370主板成功进化/`. Its text is preserved in
`content/archive-body.html`; only the surrounding layout and displayed image
sizes change. Full image links still point to the original source images.
Old test posts, assets, archive paths, and the `CNAME` file remain in the base
repository. `/about/` redirects to the new biography section. Existing legacy
blog pages retain their original layout unless explicitly migrated.

The original `CNAME` is `arclight.top`. Its present availability has not been
verified. Canonical metadata currently follows that existing configuration;
change `base_url` and `CNAME` together if moving to another domain. Renaming the
repository or changing Pages settings is a separate hosting operation.

## Content sources

- SlideFormer: https://arxiv.org/abs/2603.16428 and
  https://github.com/RegiaYoung/SlideFormer
- SlideDP: https://arxiv.org/abs/2609.34162 and
  https://github.com/RegiaYoung/SlideDP
- Efficient Mask Learning: https://zeyiwen.github.io/papers/cikm2025_masking.pdf
- Advisor and PhD cohort: https://zeyiwen.github.io/students.html

SlideDP is labeled a preprint. Its repository currently releases a reference
multi-GPU extension; the optimized runtime in the paper is forthcoming.
No private research drafts or submission statuses are included.
