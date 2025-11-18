.PHONY: help build start stop clean format-prettier

help:
	@echo "Available targets: build start stop clean format-prettier"

build:
	@echo "No build pipeline is defined yet; add project-specific steps when components are introduced."

start:
	@echo "No runtime services are defined yet; configure start commands once applications are added."

stop:
	@echo "No runtime services are running; add stop commands alongside future start targets."

clean:
	@echo "No build artifacts to clean; extend this target when build outputs are created."

format-prettier:
	@if command -v act >/dev/null 2>&1 && docker info >/dev/null 2>&1; then \
		echo "✅ Usando act para executar workflow..."; \
		echo "⚠️  Nota: act pode requerer configuração adicional. Se falhar, use o script shell diretamente."; \
		act workflow_dispatch -W .github/workflows/prettier.yml \
			--input dry=false \
			--input no_commit=true \
			--secret GITHUB_TOKEN=dummy \
			--secret COPILOT_PAT=dummy || (echo "⚠️  act falhou, usando script shell como fallback..."; bash scripts/format-prettier.sh); \
	else \
		echo "⚠️  act não disponível, usando script shell..."; \
		bash scripts/format-prettier.sh; \
	fi
