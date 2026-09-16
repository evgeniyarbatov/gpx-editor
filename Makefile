SITE_DIR = site

all: deploy

install:
	cd $(SITE_DIR) && npm install

run:
	cd $(SITE_DIR) && npm run dev

deploy:
	cd $(SITE_DIR) && npm run build
	@echo "Built $(SITE_DIR)/dist. Push to main to publish via GitHub Pages."
