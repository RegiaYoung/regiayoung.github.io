# Personal website

This site uses al-folio v1.x, with pinned runtime gems. Keep changes in content, data, and configuration where possible. There are no local theme overrides.

- Navigation: About / Publications / Repo / Notes / CV.
- Domain: https://regia.me, with an empty baseurl.
- Keep the original BIOS article permalink and image paths intact.
- Do not invent personal details, credentials, dates, photo, Scholar ID, or CV PDF.
- Update Gemfile and `_config.yml` together when activating or removing plugins.
- Runtime ownership and upgrade guidance: https://github.com/alshedivat/al-folio/blob/main/docs/BOUNDARIES.md
- Validate with `npm ci`, `npm run lint:prettier`, `bundle exec al-folio upgrade audit --no-fail`, and `bundle exec jekyll build` (the upstream demo baseurl `/al-folio` does not apply here).
