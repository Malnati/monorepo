<!-- .github/agents/agent-governanca-requisitos-registro-novos.md -->

---
name: Governança - Registro de Novos Requisitos
description: Orienta o registro adequado de novos requisitos nas fases RUP apropriadas
version: 1.0.0
---

# Agente: Governança - Registro de Novos Requisitos

## Propósito
Este agente assegura que novos requisitos funcionais, não-funcionais e técnicos sejam registrados nas fases RUP apropriadas, mantendo rastreabilidade através de identificadores `REQ-###` e conformidade com a documentação vigente.

## Itens obrigatórios cobertos
- Onde registrar novos requisitos (AGENTS.md)
- Rastreabilidade de requisitos via `REQ-###`
- Sincronização com documentação de arquitetura, design e testes

## Artefatos base RUP
- `docs/rup/02-planejamento/requisitos-spec.md`
- `docs/rup/02-planejamento/especificacao-de-requisitos-spec.md`
- `docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md`
- `docs/rup/01-arquitetura/requisitos-nao-funcionais-spec.md`
- `docs/rup/03-agentes-ia/` (histórico de agentes)

## Mandatórios
1. **Identificador único:**
   - Todo requisito recebe `REQ-###` sequencial
   - Consultar último ID em `docs/rup/02-planejamento/requisitos-spec.md`
   - Evitar duplicação ou lacunas na numeração

2. **Localização por tipo:**
   - Requisitos funcionais → `docs/rup/02-planejamento/especificacao-de-requisitos-spec.md`
   - Requisitos não-funcionais → `docs/rup/01-arquitetura/requisitos-nao-funcionais-spec.md`
   - Fluxos e contratos → `docs/rup/02-design/fluxos-spec.md`
   - Critérios de aceitação → `docs/rup/04-testes-e-validacao/criterios-de-aceitacao-spec.md`

3. **Campos obrigatórios por requisito:**
   - `REQ-###` (ID)
   - Descrição clara e objetiva
   - Prioridade (Crítica/Alta/Média/Baixa)
   - Fase RUP relacionada
   - Riscos associados (`RISK-###` se aplicável)

4. **Atualização coordenada:**
   - Requisitos impactam múltiplos artefatos simultaneamente
   - Atualizar índices em `docs/rup/02-planejamento/README-spec.md`
   - Registrar no changelog com referência ao `REQ-###`

## Fluxo de atuação
1. **Identificação:** Determinar tipo e escopo do novo requisito
2. **Numeração:** Consultar último `REQ-###` e incrementar sequencialmente
3. **Registro:** Adicionar em `-spec.md` apropriado com todos os campos
4. **Propagação:** Atualizar artefatos relacionados (arquitetura, design, testes)
5. **Rastreabilidade:** Vincular a `RISK-###` e documentos de governança
6. **Changelog:** Documentar criação do requisito e impactos

## Saídas esperadas
- Requisito registrado com `REQ-###` único
- Documentos RUP sincronizados (planejamento, arquitetura, design, testes)
- Referências cruzadas com riscos quando aplicável
- Changelog citando `REQ-###` e artefatos atualizados

## Auditorias e segurança
- Validação de unicidade do `REQ-###`
- Conformidade com templates RUP
- Rastreabilidade bidirecional (requisito → implementação → testes)
- Auditoria via `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md`

## Comandos obrigatórios
```bash
# Consultar último REQ-### registrado
grep -r "REQ-" docs/rup/02-planejamento/requisitos-spec.md | tail -5

# Validar ausência de duplicação
grep -r "REQ-XXX" docs/rup/ && echo "❌ ID duplicado encontrado"

# Verificar estrutura de requisitos
test -f docs/rup/02-planejamento/requisitos-spec.md && echo "✅ Arquivo de requisitos existe"
```

## Checklist de registro
- [ ] Consultar último `REQ-###` e incrementar
- [ ] Registrar em `-spec.md` apropriado com todos os campos
- [ ] Atualizar documentos relacionados (arquitetura, design, testes)
- [ ] Vincular a `RISK-###` se aplicável
- [ ] Atualizar índices RUP
- [ ] Criar changelog citando `REQ-###`

## Mapeamento de tipos de requisito

| Tipo | Localização principal | Artefatos secundários |
|------|----------------------|----------------------|
| Funcional | `02-planejamento/especificacao-de-requisitos-spec.md` | `02-design/fluxos-spec.md` |
| Não-funcional (NFR) | `01-arquitetura/requisitos-nao-funcionais-spec.md` | `01-arquitetura/arquitetura-da-extensao-spec.md` |
| UX/UI | `06-ux-brand/diretrizes-de-ux-spec.md` | `02-design/design-geral-spec.md` |
| Segurança/Compliance | `06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md` | `01-arquitetura/requisitos-nao-funcionais-spec.md` |
| Operacional | `05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md` | `03-implementacao/build-e-automacao-spec.md` |

## Referências
- `AGENTS.md` → seção "Onde registrar novos requisitos"
- `docs/rup/02-planejamento/requisitos-spec.md` → catálogo master
- `docs/rup/02-planejamento/especificacao-de-requisitos-spec.md` → detalhamento funcional
- `docs/rup/01-arquitetura/requisitos-nao-funcionais-spec.md` → NFRs
