<!-- app/api/README.md -->
# Prototype API

API NestJS para o protótipo MVP de marketplace de resíduos, conforme plano definido em `docs/rup/99-anexos/MVP/PLAN.md`.

## Estrutura

- `src/main.ts` - Entry point da aplicação
- `src/app.module.ts` - Módulo principal
- `src/modules/` - Módulos funcionais:
  - `tipo/` - Tipos de resíduo
  - `unidade/` - Unidades de medida
  - `fornecedor/` - Fornecedores
  - `comprador/` - Compradores
  - `lote-residuo/` - Lotes de resíduos
  - `transacao/` - Transações
  - `fotos/` - Gerenciamento de fotos

## Endpoints

### GET /app/api/health
Health check da API

### GET /app/api/tipos
Lista todos os tipos de resíduo

### GET /app/api/unidades
Lista todas as unidades de medida

### POST /app/api/lotes
Cria um novo lote de resíduos

### GET /app/api/lotes
Lista lotes com busca e paginação (query params: `search`, `page`, `limit`)

### GET /app/api/lotes/:id
Detalhes de um lote específico

### POST /app/api/transacoes
Cria uma nova transação

### GET /app/api/transacoes/:id
Detalhes de uma transação específica

### GET /app/api/fotos/:id
Download de uma foto (retorna imagem como stream)

## Configuração

Variáveis de ambiente (valores padrão no `docker-compose.yml`):

- `PORT` - Porta da API (padrão: 3001)
- `HOST` - Host da API (padrão: 0.0.0.0)
- `CORS_ORIGIN` - Origem permitida para CORS (padrão: *)
- `DATABASE_HOST` - Host do banco de dados
- `DATABASE_PORT` - Porta do banco de dados
- `DATABASE_USER` - Usuário do banco de dados
- `DATABASE_PASSWORD` - Senha do banco de dados
- `DATABASE_NAME` - Nome do banco de dados

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run start:dev

# Build
npm run build

# Rodar produção
npm run start:prod
```

## Docker

A estrutura Docker segue as regras definidas em `AGENTS.md`:

- `Dockerfile` - Apenas instalação de dependências e build
- `docker-compose.yml` (raiz) - Configuração de variáveis, volumes, healthcheck
- `entrypoint.sh` - Script de inicialização

Ver `docker-compose.yml` na raiz do repositório para configuração completa.
