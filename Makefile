SITE_DIR = site

.DEFAULT_GOAL := help

.PHONY: all help setup run test deploy

all: deploy

help:
	@echo "setup    - install site/ npm dependencies"
	@echo "run      - start the local Vite dev server"
	@echo "test     - unit tests, then Playwright e2e"
	@echo "deploy   - build site/dist (push to main publishes via GitHub Pages)"

setup:
	cd $(SITE_DIR) && npm install

run:
	cd $(SITE_DIR) && npm run dev

test: setup
	cd $(SITE_DIR) && npm test && npx playwright install --with-deps chromium && npm run test:e2e

deploy:
	cd $(SITE_DIR) && npm run build
	@echo "Built $(SITE_DIR)/dist. Push to main to publish via GitHub Pages."
