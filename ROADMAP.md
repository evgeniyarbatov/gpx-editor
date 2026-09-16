# Roadmap

## Why keep going

This is the one GPX tool in the portfolio that's actually deployed as a public site rather than a personal script — someone other than you can use it right now. That's a different kind of investment than most of this portfolio: it's not "does this satisfy my own curiosity," it's "does this actually work for a stranger."

## What it opens up

Analytics (already flagged as the next step) turns a shipped-and-forgotten tool into one you actually know is used — the same question `github-stats`/`google-analytics` ask about repos and static sites generally, but here it's specific to one concrete public utility. Once you know whether anyone uses it, you can decide whether it deserves the same public-facing polish as `gpx-plus-tcx` (README notes that one might be worth publicizing too).

## Capability this builds

Shipping and maintaining a small public tool end to end (site, deploy, analytics) — a different muscle than the personal-analysis repos that dominate this portfolio, and one that transfers directly to any future public-facing project.

## Connects to

- **gpx-plus-tcx** — same shape: a narrowly-scoped public GPX tool. That one still deploys via Terraform to S3.
- **garmin-etrex-courses** — same "split a large GPX for a specific device's limits" problem, solved independently in Python instead of JS.
