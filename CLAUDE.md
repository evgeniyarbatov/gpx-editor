# gpx-editor

Splits large GPX files into smaller segments compatible with Garmin.
Static site in `site/`, deployed to GitHub Pages.

## Key files

- `site/` — the web app (Node/npm project).
- `.github/workflows/pages.yml` — test, then build and publish `site/dist`.
- `Makefile` — `run` (local dev), `install`, `test`, `deploy` (local build only).

## How to run

`make run` starts the local dev server (`npm run dev` in `site/`). `make install`
installs `site/` dependencies first if needed. `make test` runs unit tests then
Playwright e2e (installs Chromium if needed). Push to `main` to publish; the
Pages workflow runs tests before deploy. `make deploy` builds `site/dist`
locally.

## Conventions / gotchas

- Production URL is `https://evgeniyarbatov.github.io/gpx-editor/`. The Pages
  build sets `VITE_BASE=/gpx-editor/`.
