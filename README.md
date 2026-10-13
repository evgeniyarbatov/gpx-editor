# GPX Editor

Split large GPX files into smaller segments compatible with Garmin.

Site: https://evgeniyarbatov.github.io/gpx-editor/

## How to run

- Local dev server: `make run` (runs `npm run dev` in `site/`).
- Tests: `make test` (unit tests, then Playwright against a real GPX download).
- Deploy: push to `main`. GitHub Pages runs tests, then builds `site/` and publishes it.
- `make deploy` only builds locally; it does not publish.
