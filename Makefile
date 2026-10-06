SITE_DIR = site

.PHONY: all help install run test deploy

all: deploy

help:
	@echo "install  - install site/ npm dependencies"
	@echo "run      - start the local Vite dev server"
	@echo "test     - unit tests, then Playwright e2e"
	@echo "deploy   - build site/dist (push to main publishes via GitHub Pages)"

install:
	cd $(SITE_DIR) && npm install

run:
	cd $(SITE_DIR) && npm run dev

test: install
	cd $(SITE_DIR) && npm test && npx playwright install --with-deps chromium && npm run test:e2e

deploy:
	cd $(SITE_DIR) && npm run build
	@echo "Built $(SITE_DIR)/dist. Push to main to publish via GitHub Pages."
