# gpx-editor

Splits large GPX files into smaller segments compatible with Polar and Garmin.
Static site in `site/`, deployed to GitHub Pages.

## Key files

- `site/` — the web app (Node/npm project).
- `.github/workflows/pages.yml` — build and publish `site/dist` to GitHub Pages.
- `terraform/` — previous AWS S3 hosting; not used for deploys.
- `Makefile` — `run` (local dev), `install`, `deploy` (local build only).

## How to run

`make run` starts the local dev server (`npm run dev` in `site/`). `make install`
installs `site/` dependencies first if needed. `make test` runs unit tests then
Playwright e2e (installs Chromium if needed). Push to `main` to publish; the
Pages workflow runs tests before deploy. `make deploy` builds `site/dist`
locally and does not apply Terraform.

## Conventions / gotchas

- Production URL is `https://evgeniyarbatov.github.io/gpx-editor/`. The Pages
  build sets `VITE_BASE=/gpx-editor/`.
- `terraform/` is leftover S3 hosting. Do not `terraform apply` unless you
  intend to stand that stack back up.
