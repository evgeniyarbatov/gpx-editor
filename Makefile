SITE_DIR = site

all: deploy

install:
	cd $(SITE_DIR) && npm install

run:
	cd $(SITE_DIR) && npm run dev

test:
	cd $(SITE_DIR) && npm test && npx playwright install chromium && npm run test:e2e

deploy:
	cd $(SITE_DIR) && npm run build
	@echo "Built $(SITE_DIR)/dist. Push to main to publish via GitHub Pages."
