# Personal website

This site uses al-folio v1.x, with pinned runtime gems. Keep changes in content, data, and configuration where possible. There are no local theme overrides.

Before content, configuration, layout, dependency, or deployment work, read `.agents/skills/al-folio-maintain/SKILL.md`. It provides the official documentation route, content recipes, upgrade workflow, and site-specific feature policy. Read `docs/native-feature-audit.md` before disabling or replacing native functionality. User instructions take precedence; document intentional changes instead of silently weakening the checks.

- Navigation: About / Publications / Repo / Blog / CV.
- Domain: https://regia.me, with an empty baseurl.
- Keep the original BIOS article permalink and image paths intact.
- Do not invent personal details, credentials, dates, photo, Scholar ID, or CV PDF.
- Update Gemfile and `_config.yml` together when activating or removing plugins.
- Runtime ownership and upgrade guidance: https://github.com/alshedivat/al-folio/blob/main/docs/BOUNDARIES.md
- Validate with `npm ci`, `npm run lint:prettier`, `bundle exec al-folio upgrade audit --no-fail`, and `bundle exec jekyll build` (the upstream demo baseurl `/al-folio` does not apply here).
- Run `ruby .agents/skills/al-folio-maintain/scripts/check_native_features.rb --root .` to detect missing native wiring; retain the build/link and affected browser checks because static presence is not proof of rendering.
