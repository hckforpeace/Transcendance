MODSEC_AUDIT= ./srcs/requirements/nginxModSec/log/modsec_audit.log
MODSEC_AUDIT_DIR= ./srcs/requirements/nginxModSec/log/
VOLUME_VAULT= /home/${USER}/volume/vault 
VOLUME_DB= /home/${USER}/volume/database
VOLUME_PROMETHEUS= /home/${USER}/volume/prometheus

all: up 
	@./vault.sh

up: build
	mkdir -p $(VOLUME_DB)
	mkdir -p $(VOLUME_VAULT)
	mkdir -p $(MODSEC_AUDIT_DIR)
	mkdir -p $(VOLUME_PROMETHEUS)
	@echo >> $(MODSEC_AUDIT)
	docker compose -f ./srcs/docker-compose.yml up -d

build: 
	docker compose -f ./srcs/docker-compose.yml build

down:
	docker compose -f ./srcs/docker-compose.yml down --remove-orphans 

clean: down
	sudo rm -rf $(VOLUME_VAULT)
	@rm -f init.json
	@rm -f $(MODSEC_AUDIT)

fclean: clean
	@sudo rm -rf	/home/${USER}/volume/ 

re: clean all

