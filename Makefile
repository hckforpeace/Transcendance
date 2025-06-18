MODSEC_AUDIT= ./srcs/requirements/nginxModSec/log/modsec_audit.log
MODSEC_AUDIT_DIR= ./srcs/requirements/nginxModSec/log/

all: up 

up: build
	mkdir -p $(MODSEC_AUDIT_DIR)
	@echo >> $(MODSEC_AUDIT)
	docker compose -f ./srcs/docker-compose.yml up -d

build: 
	docker compose -f ./srcs/docker-compose.yml build

down:
	docker compose -f ./srcs/docker-compose.yml down --remove-orphans 

clean: down
	@rm -f $(MODSEC_AUDIT)

re: clean all

