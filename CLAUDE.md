# gpx-editor

Splits large GPX files into smaller segments compatible with Polar and Garmin.
Static site in `site/`, deployed to AWS via Terraform.

## Key files

- `site/` — the web app (Node/npm project).
- `terraform/` — infra to deploy `site/` to AWS.
- `Makefile` — `run` (local dev), `install`, `deploy`.

## How to run

`make run` starts the local dev server (`npm run dev` in `site/`). `make install`
installs `site/` dependencies first if needed. `make deploy` builds the site and
applies the Terraform stack (`terraform apply -auto-approve` — don't run this
without meaning to touch real infra).

## Conventions / gotchas

- `make deploy` is the production path — it both builds and applies Terraform in
  one step, so treat it as a real deploy, not a dry run.
