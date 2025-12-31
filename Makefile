SITE_DIR = site
TERRAFORM_DIR = terraform

all: deploy

install:
	cd $(SITE_DIR) && npm install

run:
	cd $(SITE_DIR) && npm run dev

deploy:
	cd $(SITE_DIR) && npm run build
	cd $(TERRAFORM_DIR) && terraform apply -auto-approve
