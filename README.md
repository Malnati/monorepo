<!-- README.md -->
# Template de Projeto Multiplataforma

O **Template de Projeto Multiplataforma** é uma estrutura base para desenvolvimento de aplicações corporativas, seguindo as melhores práticas de engenharia de software. Este repositório concentra os artefatos oficiais do ciclo RUP (Rational Unified Process), assegurando rastreabilidade, governança técnica e conformidade regulatória.

## Panorama geral

A documentação e os ativos técnicos estão organizados em diretórios especializados que cobrem visão, arquitetura, design, planejamento, implementação, testes, implantação, governança, UX, contribuição e anexos de apoio. Utilize os índices abaixo para navegar pela base de conhecimento vigente.

### Documentação RUP (`docs/rup/`)

- [`docs/rup/00-visao/`](./docs/rup/00-visao/)
  - [`README.md`](./docs/rup/00-visao/README.md) – apresenta o propósito da fase e os artefatos disponíveis.
  - Artefatos principais: [`visao-do-produto.md`](./docs/rup/00-visao/visao-do-produto.md), [`escopo.md`](./docs/rup/00-visao/escopo.md), [`stakeholders.md`](./docs/rup/00-visao/stakeholders.md), [`lgpd.md`](./docs/rup/00-visao/lgpd.md).
- [`docs/rup/01-arquitetura/`](./docs/rup/01-arquitetura/)
  - [`README.md`](./docs/rup/01-arquitetura/README.md) – descreve a macroarquitetura e destaca os artefatos-chave.
  - Destaques: [`arquitetura-da-extensao.md`](./docs/rup/01-arquitetura/arquitetura-da-extensao.md), [`integracoes-com-apis.md`](./docs/rup/01-arquitetura/integracoes-com-apis.md), [`requisitos-nao-funcionais.md`](./docs/rup/01-arquitetura/requisitos-nao-funcionais.md).
- [`docs/rup/02-design/`](./docs/rup/02-design/)
  - [`README.md`](./docs/rup/02-design/README.md) – introduz a fase de design detalhado e seus artefatos.
  - Destaques: [`design-geral.md`](./docs/rup/02-design/design-geral.md), [`componentes.md`](./docs/rup/02-design/componentes.md), [`fluxos.md`](./docs/rup/02-design/fluxos.md).
- [`docs/rup/02-planejamento/`](./docs/rup/02-planejamento/)
  - [`README.md`](./docs/rup/02-planejamento/README.md) – mantém cronogramas, governança, milestones, riscos, roadmap e WBS.
  - Subdocumentos: [`cronograma.md`](./docs/rup/02-planejamento/cronograma.md), [`governanca.md`](./docs/rup/02-planejamento/governanca.md), [`milestones.md`](./docs/rup/02-planejamento/milestones.md), [`riscos-e-mitigacoes.md`](./docs/rup/02-planejamento/riscos-e-mitigacoes.md), [`roadmap.md`](./docs/rup/02-planejamento/roadmap.md), [`wbs.md`](./docs/rup/02-planejamento/wbs.md).
- [`docs/rup/03-implementacao/`](./docs/rup/03-implementacao/)
  - [`README.md`](./docs/rup/03-implementacao/README.md) – registra orientações de estrutura, automação, padrões de código e testes.
  - Subdocumentos: [`estrutura-de-projeto.md`](./docs/rup/03-implementacao/estrutura-de-projeto.md), [`build-e-automacao.md`](./docs/rup/03-implementacao/build-e-automacao.md), [`padroes-de-codigo.md`](./docs/rup/03-implementacao/padroes-de-codigo.md), [`testes.md`](./docs/rup/03-implementacao/testes.md).
- [`docs/rup/04-testes-e-validacao/`](./docs/rup/04-testes-e-validacao/)
  - [`README.md`](./docs/rup/04-testes-e-validacao/README.md) – resume a fase de QA com estratégia geral, critérios, E2E e validação de marcos.
  - Subdocumentos: [`estrategia-geral.md`](./docs/rup/04-testes-e-validacao/estrategia-geral.md), [`criterios-de-aceitacao.md`](./docs/rup/04-testes-e-validacao/criterios-de-aceitacao.md), [`testes-end-to-end.md`](./docs/rup/04-testes-e-validacao/testes-end-to-end.md), [`validacao-de-marcos.md`](./docs/rup/04-testes-e-validacao/validacao-de-marcos.md).
- [`docs/rup/04-qualidade-testes/`](./docs/rup/04-qualidade-testes/) – documentação anterior de QA preservada para consulta.
- [`docs/rup/05-entrega-e-implantacao/`](./docs/rup/05-entrega-e-implantacao/)
  - [`README.md`](./docs/rup/05-entrega-e-implantacao/README.md) – cobre ambientes, empacotamento, versionamento e operação contínua.
  - Subdocumentos: [`ambientes-e-configuracoes.md`](./docs/rup/05-entrega-e-implantacao/ambientes-e-configuracoes.md), [`empacotamento.md`](./docs/rup/05-entrega-e-implantacao/empacotamento.md), [`publicacao-e-versionamento.md`](./docs/rup/05-entrega-e-implantacao/publicacao-e-versionamento.md), [`operacao-e-manutencao.md`](./docs/rup/05-entrega-e-implantacao/operacao-e-manutencao.md).
- [`docs/rup/05-operacao-release/`](./docs/rup/05-operacao-release/) – registros legados de ambientes, publicação e versionamento anteriores à fase atual.
- [`docs/rup/06-governanca-tecnica-e-controle-de-qualidade/`](./docs/rup/06-governanca-tecnica-e-controle-de-qualidade/)
  - [`README.md`](./docs/rup/06-governanca-tecnica-e-controle-de-qualidade/README.md) – reúne governança técnica, controle de qualidade, auditoria e revisões com IA.
  - Subdocumentos: [`governanca-tecnica.md`](./docs/rup/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md), [`controle-de-qualidade.md`](./docs/rup/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md), [`auditoria-e-rastreabilidade.md`](./docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md), [`revisoes-com-ia.md`](./docs/rup/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md).
- [`docs/rup/06-ux-brand/`](./docs/rup/06-ux-brand/)
  - [`README.md`](./docs/rup/06-ux-brand/README.md) – indica diretrizes de UX, acessibilidade e identidade visual.
  - Subdocumentos: [`diretrizes-de-ux.md`](./docs/rup/06-ux-brand/diretrizes-de-ux.md), [`acessibilidade.md`](./docs/rup/06-ux-brand/acessibilidade.md), [`identidades-visuais.md`](./docs/rup/06-ux-brand/identidades-visuais.md).
- [`docs/rup/07-contribuicao/`](./docs/rup/07-contribuicao/)
  - [`README.md`](./docs/rup/07-contribuicao/README.md) – orienta sobre colaboração, commits e PRs.
  - Subdocumentos: [`contribuindo.md`](./docs/rup/07-contribuicao/contribuindo.md), [`padroes-de-commit.md`](./docs/rup/07-contribuicao/padroes-de-commit.md), [`template-de-pr.md`](./docs/rup/07-contribuicao/template-de-pr.md).
- [`docs/rup/03-agentes-ia/`](./docs/rup/03-agentes-ia/) – histórico de agentes, pipelines e políticas legadas para auditoria de IA.
- [`docs/rup/99-anexos/`](./docs/rup/99-anexos/)
  - [`README.md`](./docs/rup/99-anexos/README.md) – consolida glossário e referências de apoio.
  - Subdocumentos: [`glossario.md`](./docs/rup/99-anexos/glossario.md), [`referencias.md`](./docs/rup/99-anexos/referencias.md).
- [`docs/rup/README.md`](./docs/rup/README.md) – índice raiz do acervo RUP e instruções gerais.

### Estrutura do projeto (`app/`)

O projeto está organizado como um monorepo com os seguintes serviços principais:

- [`app/api/`](./app/api/) – API backend NestJS com autenticação Google SSO, integração Gmail API e processamento de dados
- [`app/ui/`](./app/ui/) – Interface frontend React/Vite com autenticação Google e integração com a API
- [`app/db/`](./app/db/) – Banco de dados PostgreSQL com migrações e seeds
- [`app/job/`](./app/job/) – Worker NestJS para processamento assíncrono (ex: onboarding de CSV)
- [`app/caddy/`](./app/caddy/) – Proxy reverso Caddy com HTTPS automático via Let's Encrypt

### Outros diretórios relevantes

- [`branding/`](./branding/) – Assets de identidade visual e tokens de design para white-label
- [`scripts/`](./scripts/) – Scripts utilitários para automação e manutenção
- [`CHANGELOG/`](./CHANGELOG/) – Registro cronológico das alterações efetuadas
- [`docs/rup/99-anexos/checklists/`](./docs/rup/99-anexos/checklists/) – Checklists operacionais e de QA que devem ser referenciados nos planos de auditoria, mantendo rastreabilidade direta com as diretrizes de governança descritas em [`AGENTS.md`](./AGENTS.md)

## Onde registrar novos requisitos

- Utilize o índice RUP (`docs/rup/README.md`) para escolher o diretório correspondente à natureza do requisito (visão, arquitetura, design, testes, implantação etc.), mantendo a organização incremental da documentação.
- Requisitos não funcionais ou restrições técnicas devem ser adicionados/atualizados em [`docs/rup/01-arquitetura/`](./docs/rup/01-arquitetura/), especialmente em [`requisitos-nao-funcionais.md`](./docs/rup/01-arquitetura/requisitos-nao-funcionais.md) ou em artefatos correlatos de arquitetura e integrações.
- Especificações funcionais, fluxos e contratos detalhados devem ser registrados em [`docs/rup/02-design/`](./docs/rup/02-design/), alinhando-se aos artefatos de design geral, componentes e fluxos operacionais.
- Critérios e planos de teste derivados de novos requisitos devem ser refletidos em [`docs/rup/04-testes-e-validacao/`](./docs/rup/04-testes-e-validacao/), garantindo cobertura desde estratégia geral até cenários ponta a ponta e validação de marcos.
- Sempre que o requisito implicar em processos de entrega, governança ou UX, vincule atualizações adicionais nos diretórios correspondentes ([`docs/rup/05-entrega-e-implantacao`](./docs/rup/05-entrega-e-implantacao/), [`docs/rup/06-governanca-tecnica-e-controle-de-qualidade`](./docs/rup/06-governanca-tecnica-e-controle-de-qualidade/), [`docs/rup/06-ux-brand`](./docs/rup/06-ux-brand/)) para manter a rastreabilidade completa do ciclo de vida.

## Plano de Limpeza Executado

**Status:** ✅ Concluído em 2025-11-17

### O que foi limpo
- **Nomes legados:** "App — CLImate INvestment" → "Template de Projeto Multiplataforma"
- **Organização:** "Millennium Brasil (MBRA)" → "Template Corporation"  
- **Domínios:** "dominio.com.br" → "template-monorepo.cranio.dev"
- **Termos específicos:** "marketplace de resíduos", "créditos de carbono", "plataforma bancária climática" → descrições genéricas
- **Estrutura:** Removidos serviços legados (landing, holding-page) e consolidada estrutura em monorepo com api, ui, db, job e caddy

### Arquivos principais atualizados
- Documentação: README.md, docs/rup/README*.md, especificações de requisitos
- Configuração: `app/docker-compose.yml`, `app/.env.example`, `app/api/.env.example`, `app/caddy/Caddyfile`
- Código: serviços de e-mail (`app/api/src/modules/mailing/`, `app/api/src/modules/gmail/`), agentes de IA, templates de comunicação
- Frontend: componentes React em `app/ui/src/` com integração Google SSO
- Checklists: referências corporativas e de governança em `docs/rup/99-anexos/checklists/`

### Como usar este template
1. **Clone o repositório** para seu novo projeto
2. **Substitua "Template Corporation"** pelo nome da sua organização
3. **Configure o domínio** atualizando `APP_CADDY_DOMAIN` e variáveis relacionadas em `app/.env` (padrão: `template-monorepo.cranio.dev`)
4. **Configure autenticação Google** adicionando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `app/.env`
5. **Adapte os requisitos genéricos** (REQ-###) para seu caso de uso específico
6. **Configure as variáveis de ambiente** conforme sua infraestrutura (consulte `app/.env.example`)

### Início rápido

1. **Configure as variáveis de ambiente:**
   ```bash
   cd app
   cp .env.example .env
   # Edite .env e configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e outras variáveis necessárias
   ```

2. **Inicie os serviços:**
   ```bash
   cd app
   make build    # Build de todas as imagens Docker
   make start    # Inicia todos os serviços em modo detached
   make logs     # Visualiza logs de todos os serviços
   ```

3. **Acesse a aplicação:**
   - Frontend: `http://localhost:5174` (desenvolvimento) ou `https://template-monorepo.cranio.dev` (produção via Caddy)
   - API: `http://localhost:3001/app/api/health`
   - Banco de dados: `localhost:5432`

Para mais detalhes sobre cada serviço, consulte os READMEs individuais em `app/api/README.md`, `app/ui/README.md`, etc.

### Para novos times
- Consulte o changelog completo: [`CHANGELOG/20251117204729.md`](./CHANGELOG/20251117204729.md)
- Siga as diretrizes em [`AGENTS.md`](./AGENTS.md) para desenvolvimento
- Use os checklists em [`docs/rup/99-anexos/checklists/`](./docs/rup/99-anexos/checklists/) para validação

## Governança e contribuição

Todos os artefatos devem seguir as políticas descritas em [`AGENTS.md`](./AGENTS.md). Para sugestões ou ajustes, consulte as diretrizes na [seção de contribuição](./docs/rup/07-contribuicao/README.md) antes de abrir mudanças. Lembre-se de atualizar o [`CHANGELOG`](./CHANGELOG) e, quando aplicável, os checklists em [`docs/rup/99-anexos/checklists/`](./docs/rup/99-anexos/checklists/) para refletir alterações aprovadas.

---

© Template Corporation — uso corporativo restrito. A documentação deve ser mantida atualizada conforme auditorias e revisões periódicas do programa.
