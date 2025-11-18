<!-- app/caddy/README.md -->
# Prototype Caddy

Proxy reverso Caddy com HTTPS automático via Let's Encrypt para o protótipo MVP de marketplace de resíduos.

## Funcionalidades

- **HTTPS automático** via Let's Encrypt
- **Renovação automática** de certificados SSL
- **Proxy reverso** para frontend (`ui`) e backend (`api`)
- **Suporte a HTTP/2** e HTTP/3
- **Redirecionamento HTTP → HTTPS** em produção

## Configuração

Variáveis de ambiente (valores padrão no `docker-compose.yml`):

- `CADDY_DOMAIN` - Domínio para HTTPS (padrão: template-monorepo.cranio.dev)
- `CADDY_EMAIL` - Email para Let's Encrypt (padrão: admin@cranio.dev)

## Estrutura

- `Dockerfile` - Imagem base Caddy com Caddyfile
- `Caddyfile` - Configuração do proxy reverso e HTTPS
- `entrypoint.sh` - Script de inicialização

## Docker

A estrutura Docker segue as regras definidas em `AGENTS.md`:

- `Dockerfile` - Apenas instalação de dependências e cópia de configurações
- `docker-compose.yml` (raiz) - Configuração de variáveis, volumes, healthcheck
- `entrypoint.sh` - Script de inicialização

Ver `docker-compose.yml` na raiz do repositório para configuração completa.

## Documentação

Para instruções detalhadas de deploy e configuração, consulte:
- `docs/rup/99-anexos/MVP/plano-deploy-google-sso.md`

