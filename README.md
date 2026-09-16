# GPX Editor

Split large GPX files into smaller segments compatible with Polar and Garmin.

Site: https://gpx-editor.gritcuriosityandperseverance.org

## How to run

- Local dev server: `make run` (runs `npm run dev` in `site/`).
- `make deploy` builds `site/dist` locally.

GitHub Pages is wired in `.github/workflows/pages.yml`, but this repository is
private and the current GitHub plan does not allow Pages on private repos. The
live site is still the S3 stack. Making the repo public (or upgrading the plan)
would publish to https://evgeniyarbatov.github.io/gpx-editor/. Until then,
`cd site && npm run build` and `cd terraform && terraform apply` still updates
the current domain.
