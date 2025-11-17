# Makefile
# App - CLImate INvestment
# Automação Docker Compose conforme AGENTS.md

# Configuração padrão
COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yml
PROJECT_NAME ?= app

# Serviços definidos no docker-compose.yml
SERVICES = db landing holding oauth2

# ========================================
# Targets principais
# ========================================

.PHONY: build start stop dev logs clean help

build: ## Build all services
	$(COMPOSE) -f $(COMPOSE_FILE) build

start: ## Start all services
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

stop: ## Stop all services
	$(COMPOSE) -f $(COMPOSE_FILE) down

dev: ## Start services in development mode with logs
	$(COMPOSE) -f $(COMPOSE_FILE) up

logs: ## Show logs for all services
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f

clean: ## Stop and remove all containers, networks, images and volumes
	$(COMPOSE) -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans

# ========================================
# Targets por serviço
# ========================================

.PHONY: build-db start-db stop-db logs-db clean-db
build-db: ## Build database service
	$(COMPOSE) -f $(COMPOSE_FILE) build db

start-db: ## Start database service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d db

stop-db: ## Stop database service
	$(COMPOSE) -f $(COMPOSE_FILE) stop db

logs-db: ## Show database logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f db

clean-db: ## Remove database container and volumes
	$(COMPOSE) -f $(COMPOSE_FILE) stop db
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f db
	docker volume rm -f $(PROJECT_NAME)_db_data || true

.PHONY: build-landing start-landing stop-landing logs-landing clean-landing
build-landing: ## Build landing page service
	$(COMPOSE) -f $(COMPOSE_FILE) build landing

start-landing: ## Start landing page service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d landing

stop-landing: ## Stop landing page service
	$(COMPOSE) -f $(COMPOSE_FILE) stop landing

logs-landing: ## Show landing page logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f landing

clean-landing: ## Remove landing container
	$(COMPOSE) -f $(COMPOSE_FILE) stop landing
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f landing

.PHONY: build-holding start-holding stop-holding logs-holding clean-holding
build-holding: ## Build holding page service
	$(COMPOSE) -f $(COMPOSE_FILE) build holding

start-holding: ## Start holding page service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d holding

stop-holding: ## Stop holding page service
	$(COMPOSE) -f $(COMPOSE_FILE) stop holding

logs-holding: ## Show holding page logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f holding

clean-holding: ## Remove holding page container
	$(COMPOSE) -f $(COMPOSE_FILE) stop holding
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f holding

.PHONY: build-oauth2 start-oauth2 stop-oauth2 logs-oauth2 clean-oauth2
build-oauth2: ## Build OAuth2 proxy service
	$(COMPOSE) -f $(COMPOSE_FILE) build oauth2

start-oauth2: ## Start OAuth2 proxy service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d oauth2

stop-oauth2: ## Stop OAuth2 proxy service
	$(COMPOSE) -f $(COMPOSE_FILE) stop oauth2

logs-oauth2: ## Show OAuth2 proxy logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f oauth2

clean-oauth2: ## Remove OAuth2 container
	$(COMPOSE) -f $(COMPOSE_FILE) stop oauth2
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f oauth2

# ========================================
# Rebuild completos por serviço
# ========================================

.PHONY: rebuild-db rebuild-landing rebuild-oauth2
rebuild-db: ## Rebuild database from scratch
	$(COMPOSE) -f $(COMPOSE_FILE) stop db
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f db
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache db
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --force-recreate db

rebuild-landing: ## Rebuild landing from scratch  
	$(COMPOSE) -f $(COMPOSE_FILE) stop landing
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f landing
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache landing
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --force-recreate landing

rebuild-oauth2: ## Rebuild OAuth2 from scratch
	$(COMPOSE) -f $(COMPOSE_FILE) stop oauth2
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f oauth2
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache oauth2
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --force-recreate oauth2

# ========================================
# Utilitários
# ========================================

.PHONY: status health monitoring
status: ## Show container status
	$(COMPOSE) -f $(COMPOSE_FILE) ps

health: ## Check service health
	@echo "=== Database Health ==="
	docker exec -it ${APP_DB_CONTAINER_NAME:-dominio-db} 2>/dev/null pg_isready -U postgres -d app || echo "Database not ready"
	@echo "=== Landing Health ==="
	curl -s -o /dev/null -w "%{http_code}" http://localhost:7777 2>/dev/null || echo "Landing not accessible"
	@echo "=== Holding Page Health ==="
	curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null || echo "Holding page not accessible"
	@echo "=== OAuth2 Health ==="
	curl -s -o /dev/null -w "%{http_code}" http://localhost:5180 2>/dev/null || echo "OAuth2 not accessible"

monitoring: ## Show resource usage
	docker stats --no-stream

help: ## Show this help message
	@echo "App - CLImate INvestment"
	@echo "================================"
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'
	@echo ""
	@echo "Services: $(SERVICES)"
	@echo "Compose file: $(COMPOSE_FILE)"
# ========================================
# Prototype Job targets
# ========================================

.PHONY: build-job start-job stop-job logs-job clean-job rebuild-job
build-job: ## Build job service
	$(COMPOSE) -f $(COMPOSE_FILE) build job

start-job: ## Start job service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d job

stop-job: ## Stop job service
	$(COMPOSE) -f $(COMPOSE_FILE) stop job

logs-job: ## Show job logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f job

clean-job: ## Remove job container and volumes
	$(COMPOSE) -f $(COMPOSE_FILE) stop job
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f job
	docker volume rm -f $(PROJECT_NAME)_job_inbox || true
	docker volume rm -f $(PROJECT_NAME)_job_processed || true
	docker volume rm -f $(PROJECT_NAME)_job_failed || true

rebuild-job: ## Rebuild job from scratch
	$(COMPOSE) -f $(COMPOSE_FILE) stop job
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f job
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache job
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --force-recreate job

.PHONY: build-api start-api stop-api logs-api rebuild-api
build-api: ## Build api service
	$(COMPOSE) -f $(COMPOSE_FILE) build api

start-api: ## Start api service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d api

stop-api: ## Stop api service
	$(COMPOSE) -f $(COMPOSE_FILE) stop api

logs-api: ## Show api logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f api

rebuild-api: ## Rebuild api from scratch
	$(COMPOSE) -f $(COMPOSE_FILE) stop api
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f api
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache api
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --force-recreate api

.PHONY: build-db start-db stop-db logs-db rebuild-db
build-db: ## Build db service
	$(COMPOSE) -f $(COMPOSE_FILE) build db

start-db: ## Start db service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d db

stop-db: ## Stop db service
	$(COMPOSE) -f $(COMPOSE_FILE) stop db

logs-db: ## Show db logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f db

rebuild-db: ## Rebuild db from scratch
	$(COMPOSE) -f $(COMPOSE_FILE) stop db
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f db
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache db
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --force-recreate db

.PHONY: build-ui start-ui stop-ui logs-ui rebuild-ui
build-ui: ## Build ui service
	$(COMPOSE) -f $(COMPOSE_FILE) build ui

start-ui: ## Start ui service
	$(COMPOSE) -f $(COMPOSE_FILE) up -d ui

stop-ui: ## Stop ui service
	$(COMPOSE) -f $(COMPOSE_FILE) stop ui

logs-ui: ## Show ui logs
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f ui

rebuild-ui: ## Rebuild ui from scratch
	$(COMPOSE) -f $(COMPOSE_FILE) stop ui
	$(COMPOSE) -f $(COMPOSE_FILE) rm -f ui
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache ui
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --force-recreate ui
