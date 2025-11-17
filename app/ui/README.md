<!-- app/ui/README.md -->
# Prototype UI

Interface React para o protótipo MVP de marketplace de resíduos, baseada nos protótipos HTML definidos em `docs/rup/99-anexos/MVP/`.

## Páginas

- `/` - Listagem de lotes com busca
- `/lotes/novo` - Criação de novo lote de resíduos
- `/lotes/:id` - Detalhes de um lote específico
- `/transacoes/:id` - Detalhes de uma transação concluída

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Configuração

Variáveis de ambiente (valores padrão no `docker-compose.yml`):

- `VITE_API_BASE_URL` - URL base da API (padrão: http://api:3001)

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview
```

## Docker

A estrutura Docker segue as regras definidas em `AGENTS.md`:

- `Dockerfile` - Apenas instalação de dependências e build
- `docker-compose.yml` (raiz) - Configuração de variáveis, volumes, healthcheck
- `entrypoint.sh` - Script de inicialização

Ver `docker-compose.yml` na raiz do repositório para configuração completa.
