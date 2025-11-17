<!-- app/jobREADME.md -->
# job

Worker NestJS para ingestão automatizada de CSV de onboarding de usuários.

## Objetivo

Processar arquivos CSV com dados de usuários para onboarding na plataforma APP, conforme especificado em `docs/rup/99-anexos/MVP/plano-job-onboarding-project.md`.

## Funcionalidades

- Monitoramento automático de diretório inbox (cron a cada minuto)
- Parsing de CSV com suporte a UTF-8 BOM
- Validação e normalização de dados (CPF, telefone, CEP, datas)
- Deduplicação por email + tipo de usuário
- Envio em lotes para `api` com retry exponencial
- Auditoria completa com logs estruturados
- Exposição de métricas para Prometheus

## Estrutura de diretórios

```
/var/data/
  inbox/      - Arquivos CSV a processar
  processed/  - Arquivos processados com sucesso
  failed/     - Arquivos com erro + relatórios JSON
```

## Formato do CSV

O CSV deve seguir o padrão definido em `docs/rup/99-anexos/MVP/sample.csv`:

- Colunas obrigatórias: E-mail, Nome completo, CPF, Data de nascimento, Telefone, CEP, Cidade, Estado
- Colunas opcionais: Lgpd_termos, Lgpd_autorizacao, Lista (PF/PJ)
- Encoding: UTF-8 com suporte a BOM
- Separador: vírgula

## Variáveis de Ambiente

Consulte `.env.example` para a lista completa. Principais:

- `APP_JOB_INBOX` - Diretório de entrada
- `APP_JOB_PROCESSED` - Diretório de sucesso
- `APP_JOB_FAILED` - Diretório de falhas
- `APP_API_BASE_URL` - URL da api
- `APP_API_TOKEN` - Token de autenticação
- `APP_JOB_POLL_INTERVAL` - Intervalo de varredura (ms)
- `APP_JOB_BATCH_SIZE` - Tamanho do lote (padrão: 100)

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run start:dev

# Build
npm run build

# Executar em produção
npm run start:prod
```

## Docker

```bash
# Build
docker build -t job:latest .

# Executar
docker run -d \
  -e APP_API_BASE_URL=http://api:3001 \
  -e APP_API_TOKEN=your-token \
  -v /path/to/inbox:/var/data/inbox \
  -v /path/to/processed:/var/data/processed \
  -v /path/to/failed:/var/data/failed \
  job:latest
```

## Endpoints

- `GET /health` - Health check
- `GET /metrics` - Métricas JSON
- `GET /metrics/prometheus` - Métricas formato Prometheus

## Integração com api

O job envia lotes de usuários para o endpoint:

```
POST /app/api/internal/onboarding/batch
Authorization: Bearer <token>

{
  "source": "job",
  "users": [...]
}
```

Resposta esperada:

```json
{
  "batchId": "uuid",
  "total": 100,
  "created": 95,
  "updated": 0,
  "skipped": 5,
  "errors": []
}
```

## Observabilidade

- Logs estruturados com Pino
- Métricas Prometheus:
  - `app_job_total_imported` - Total importado
  - `app_job_total_failed` - Total com falha
  - `app_job_last_runtime_ms` - Tempo última execução

## Governança

- Conformidade LGPD: dados sensíveis mascarados em logs
- Retenção de arquivos processados: 30 dias
- Auditoria completa em formato JSON
- Documentação RUP em `docs/rup/`
