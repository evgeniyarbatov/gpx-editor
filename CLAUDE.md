# gpx-editor

Splits large GPX files into smaller segments compatible with Polar and Garmin.
Static site in `site/`. Live hosting is still AWS S3 (`terraform/`). GitHub Pages
is configured but cannot be enabled while the repo is private on the current
plan.

## Key files

- `site/` — the web app (Node/npm project).
- `.github/workflows/pages.yml` — would publish `site/dist` to GitHub Pages.
- `terraform/` — current public site (`gpx-editor.gritcuriosityandperseverance.org`).
- `Makefile` — `run` (local dev), `install`, `deploy` (local build only).

## How to run

`make run` starts the local dev server (`npm run dev` in `site/`). `make install`
installs `site/` dependencies first if needed. `make deploy` builds `site/dist`
locally. Push to `main` does not publish until Pages is enabled.

## Conventions / gotchas

- Pages URL would be `https://evgeniyarbatov.github.io/gpx-editor/` with
  `VITE_BASE=/gpx-editor/`. Do not treat that URL as live while the repo is
  private.
- To update the current public site: `cd site && npm run build` then
  `cd terraform && terraform apply`. That is a real deploy.
