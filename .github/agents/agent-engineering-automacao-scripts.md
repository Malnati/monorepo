<!-- .github/agents/agent-engineering-automacao-scripts.md -->

---

name: Engenharia - Automação e Scripts
description: Garante conformidade com política de scripts e automações via Makefile e convenções robustas de configuração e orquestração Docker/NestJS
version: 1.2.0

---

# Agente: Engenharia - Automação e Scripts

## Propósito

Este agente garante que toda automação, configuração e orquestração sigam as políticas definidas em AGENTS.md, Makefile e convenções obrigatórias para sistemas Docker e NestJS, além de proibir scripts arbitrários.

## Itens obrigatórios cobertos

- Política de scripts e automações (AGENTS.md)
- Convenções de configuração para serviços e stacks Docker/NestJS
- Proibição de shell scripts para automação, exceto entrypoints Docker
- Makefile como único ponto de orquestração

## Convenções de configuração

- **Todos os serviços devem possuir:**
  - `Dockerfile`
  - `docker-compose.yml`
  - `docker-compose.dev.yml`
  - `Makefile`
  - `package.json`
  - `tsconfig.json`
  - `prometheus.yml` (quando aplicável)
  - `nest-cli.json` (aplicações NestJS)
- **Garantir que novos arquivos respeitem essa convenção.**
- **Ao criar/alterar targets de Makefile:**
  - Reutilizar nomes existentes (`build`, `start`, `stop`, `dev`, `logs`, `clean`, `monitoring` etc)
  - Manter padrão de invocação:  
    - `docker build -t $(SERVICE_NAME):latest .`
    - `$(COMPOSE) logs -f $(SERVICE_NAME)`
    - `$(COMPOSE) down -v --rmi all --remove-orphans`
  - Para cada serviço no `docker-compose.yml`, expor pelo menos:  
    - `build-<serviço>`, `start-<serviço>`, `stop-<serviço>`, `logs-<serviço>`, `clean-<serviço>`
    - Reutilizar variáveis: `$(COMPOSE) -f $(COMPOSE_FILE)`
    - Variantes adicionais (ex: `seed-<serviço>`) quando comandos globais dependem de um serviço único
- **Variáveis de ambiente:**  
  - Use o formato `${VAR:-default}` nos arquivos de orquestração
  - Não declare `version` em arquivos `docker-compose*.yml` para evitar avisos deprecatórios
- **Stacks Docker:**
  - Dockerfile + docker-compose*.yml + arquivos de configuração via volume e scripts de entrypoint devem ser totalmente parametrizados por variáveis de ambiente
  - Não crie variantes duplicadas de arquivos quando placeholders podem ser substituídos durante build/start
  - **Evite arquivos auxiliares só para aplicar valores de ambiente – prefira um único artefato com placeholders explícitos**
  - Cadeia obrigatória: configurações devem seguir `.env → docker-compose*.yml → código/serviço`
  - Ao introduzir novas variáveis, atualize todos os `.env` e `docker-compose*.yml` impactados (incluindo variantes dev)
- **Nome declarativo obrigatório:**  
  - Todo serviço declarado no `docker-compose.yml` **deve conter um nome explicitamente definido**  
    Exemplo:
    ```yaml
    services:
      minha-api:
        container_name: minha-api
        # ...
    ```
  - Proibir uso de nomes automáticos ou omissão de `container_name`.  
  - Facilita integração com alvos do Makefile e automações.

## Docker

- **Separação de responsabilidades:**  
  - Dockerfile: instala dependências e executa a aplicação  
  - docker-compose.yml: define variáveis de ambiente, volumes, healthchecks, exec/commands
- **Variáveis de ambiente:**  
  - Sempre conter valor padrão via `${VAR:-default}` no docker-compose.yml
  - Arquivos `.env` ou `.env.example`: apenas dados sensíveis e NÃO versionados com valores padrão
- **Estrutura mínima obrigatória:**
  - `docker-compose.yml` (raiz)
  - `Dockerfile` (subprojeto raiz)
  - `entrypoint.sh` (subprojeto, apenas se necessário)
- Todos os serviços no `docker-compose.yml` raiz devem ter alvos equivalentes no Makefile que funcionem com docker ou docker compose (`COMPOSE ?= docker compose`)
- **Manter apenas um docker-compose.yml na raiz**, subprojetos podem ter Dockerfile, entrypoint.sh e configs auxiliares, mas não seus próprios compose
- **Evite múltiplos manifestos por ambiente;** prefira parametrização via variáveis para cenários diferentes
- **Não declare a chave version nos arquivos de compose** e alinhe templates `.env.example`
- **Todo serviço no docker-compose.yml deve usar `container_name` explicitamente definido**

## Makefile

- **Reaproveite nomes existentes** (`build`, `start`, `stop`, `dev`, `logs`, `clean`, `monitoring` etc.) com variações por serviço (`build-<serviço>`, `start-<serviço>`...)
- Todos devem invocar o mesmo docker/docker compose configurado em variáveis comuns (`COMPOSE`)
- Forneça alvos de rebuild completos para cada serviço (`docker compose stop`, `docker compose rm -f`, `docker compose build --no-cache`, `docker compose up --force-recreate`)
- **Comandos de targets em Makefile devem ser indentados com TAB**
- **Registre no changelog que a revisão de conformidade da indentação foi executada**
- **Exemplo:**
  ```makefile
  build:
  	docker build -t $(SERVICE_NAME):latest .
  ```
  
## Política de scripts e automações

- **Proibido criar ou utilizar arquivos de shell script (`.sh`, `.bash` ou similares) para execução de tarefas**
- **Toda automação DEVE ser feita exclusivamente por meio do Makefile**
- **Não adicione shebangs (`#!/bin/bash`, `#!/usr/bin/env sh` etc.) a arquivos que não sejam scripts de entrypoint referenciados por Dockerfile**
- **Não adicione novos alvos ao Makefile sem solicitação explícita**
- **Testes E2E devem ser escritos em JavaScript/TypeScript e utilizar exclusivamente Puppeteer, executados via npm run test:e2e ou targets Makefile**
- **Únicos shell scripts permitidos: entrypoints referenciados por Dockerfiles**

## Fluxo de atuação

1. **Detecção:** Identificar tentativa de criar shell script para automação
2. **Validação:** Verificar se já existe target Makefile equivalente
3. **Bloqueio:** Impedir criação de script arbitrário ou duplicado
4. **Orientação:** Direcionar para uso de Makefile ou npm scripts
5. **Registro:** Documentar conformidade no changelog

## Saídas esperadas

- Nenhum shell script de automação criado indevidamente
- Automações via Makefile ou npm scripts
- Testes E2E em JavaScript/TypeScript + Puppeteer
- Changelog confirmando conformidade
- Todos os artefatos de configuração, build e operação presentes por serviço conforme convenções
- Todos os serviços do `docker-compose.yml` possuem nomes explicitamente definidos

## Auditorias e segurança

- Validação da ausência de scripts `.sh` não autorizados
- Verificação de shebangs apenas em entrypoints
- Conformidade com estrutura, convenção e automação estabelecida
- Rastreabilidade dos targets Makefile adicionados
- Conferência de nomes explicitamente definidos via `container_name` em todos os serviços `docker-compose.yml`

## Comandos obrigatórios para auditoria

```bash
# Listar shell scripts existentes (apenas entrypoints permitidos)
find . -name "*.sh" -not -path "./node_modules/*" -not -path "./scripts/*"

# Verificar shebangs não autorizados
grep -r "^#!/bin/" --include="*.sh" --exclude-dir=node_modules | \
  grep -v entrypoint.sh | \
  grep -v scripts/

# Validar que testes E2E usam Puppeteer
grep -r "puppeteer" tests/ e2e/ --include="*.ts" --include="*.js"

# Listar targets disponíveis no Makefile
make help

# Confirmar ausência de scripts de automação paralelos
! find . -name "deploy.sh" -o -name "build.sh" -o -name "test.sh" \
  -not -path "./scripts/*" && echo "✅ Sem scripts de automação paralelos"

# Listar todos os serviços do docker-compose.yml com nome explicitamente definido
grep "container_name:" docker-compose.yml
```

## Checklist de conformidade

- [ ] Nenhum shell script criado para automação
- [ ] Apenas entrypoints Docker possuem shebangs
- [ ] Automação via Makefile ou npm scripts
- [ ] Testes E2E em JS/TS + Puppeteer
- [ ] Scripts em `scripts/` apenas para bootstrapping aprovado
- [ ] Nenhum target Makefile adicionado sem solicitação
- [ ] Todos os artefatos obrigatórios presentes por serviço (Dockerfile, Makefile, compose, etc.)
- [ ] Estrutura Docker parametrizada por variáveis nos manifestos
- [ ] Alvos do Makefile respeitam convenção, nomes e indentação
- [ ] **Todos os serviços do docker-compose.yml possuem nomes explicitamente definidos**

## Estrutura correta de automação

### ✅ Correto: Automação via Makefile

```makefile
# Makefile
test-e2e:
	npm run test:e2e

deploy-staging:
	$(COMPOSE) -f docker-compose.yml up -d
	@echo "Deploy concluído"
```

### ❌ Incorreto: Script shell paralelo

```bash
#!/bin/bash
# deploy.sh - PROIBIDO
docker-compose up -d
echo "Deploy concluído"
```

### ✅ Correto: Entrypoint Docker permitido

```bash
#!/bin/bash
# app/api/entrypoint.sh
set -e
npm run migration:run
exec "$@"
```

### ✅ Correto: Teste E2E em TypeScript

```typescript
// tests/e2e/login.spec.ts
import puppeteer from "puppeteer";

describe("Login flow", () => {
  it("should login successfully", async () => {
    const browser = await puppeteer.launch();
    // ...
  });
});
```

### ✅ Correto: Serviço com nome explicitamente definido

```yaml
services:
  minha-api:
    container_name: minha-api
    image: minha-api:latest
    # ...
```

## Exceções documentadas

- Scripts em `scripts/bootstrap-gh.sh` e `scripts/mcp-github/mcp-bootstrap.sh` aprovados para setup inicial
- Entrypoints Docker (`*/entrypoint.sh`) permitidos
- Scripts de migração de banco permitidos se referenciados pelo Makefile

## Referências

- `AGENTS.md` → seção "Política de scripts e automações"
- `docs/rup/03-implementacao/build-e-automacao-spec.md`
- `Makefile` → ponto único de orquestração conforme convenção
- `scripts/` → bootstrapping aprovado
- Estruturas obrigatórias de configuração conforme convenção Docker/NestJS/NPM
