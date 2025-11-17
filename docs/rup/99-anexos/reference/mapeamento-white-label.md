<!-- docs/rup/99-anexos/reference/mapeamento-white-label.md -->
# Mapeamento de termos legados para limpeza white-label

## Método de inventário
- Comando: `rg -n "Millennium|MBRA|CLImate|dominio" README.md docs app branding`
- Objetivo: localizar marcas, domínios e produtos do projeto anterior para orientar substituição por termos genéricos.

## Ocorrências mapeadas
- **Identidade e organização anterior**
  - `Millennium Brasil` e sigla `MBRA` nos sumários principais (`README.md`, `docs/rup/README.md`, artefatos de visão e planejamento) e em checklists de UX/planejamento.
  - Referências em catálogos de requisitos e riscos (`docs/rup/02-planejamento/requisitos-spec.md`, `riscos-e-mitigacoes-spec.md`) e documentos de governança (`auditoria-e-rastreabilidade.md`, históricos de auditoria, planos de governança da extensão Chrome).
- **Produto anterior**
  - Nome completo **“App — CLImate INvestment”** em README, índices RUP, artefatos de visão/arquitetura e em templates de mailing/backend (por exemplo, `app/api/src/modules/mailing/` e `app/api/src/modules/gmail/`).
  - Identificação em scripts e comentários de automação (`app/Makefile`, `app/docker-compose.yml`, `.env.example`).
- **Domínio legado**
  - Uso de `dominio.com.br` em variáveis de ambiente, e-mails de contato e placeholders de URL (`app/docker-compose.yml`, `app/.env.example`).
- **Branding e ativos gráficos**
  - Logos PNG nomeadas com o prefixo anterior em `branding/assets/` e referenciadas nas telas de login e ativação (`app/ui/public/assets/`, `app/ui/src/pages/LoginPage.tsx`, `OnboardingActivationPage.tsx`).

## Próximos passos recomendados
- Substituir identificadores do produto e da organização por tokens configuráveis de marca (nome, domínio, e-mail padrão).
- Atualizar variáveis e exemplos de ambiente para usar domínios neutros (`app.localhost`, `example.com`).
- Trocar logos PNG pelo SVG genérico "APP" e referenciar via tokens compartilhados entre branding e front-end.
- Revisar templates de comunicação (e-mails, notificações, seeds) para remover cenários climáticos e textos dependentes do domínio anterior.
