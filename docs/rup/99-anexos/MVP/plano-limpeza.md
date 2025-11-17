<!-- docs/rup/99-anexos/MVP/plano-limpeza.md -->
# Plano de Limpeza do Projeto para Template

## Propósito
Remover vestígios do projeto anterior, padronizar requisitos e deixar o repositório pronto para novos aplicativos da empresa.

## Premissas
- Preservar a estrutura RUP e os cabeçalhos de caminho em todos os arquivos.
- Sincronizar referências com `docs/rup/02-planejamento/especificacao-de-requisitos.md` e `docs/rup/02-planejamento/riscos-e-mitigacoes-spec.md`.
- Documentar mudanças textuais e justificar simplificações nas revisões.

## Sequência de Ações
1. **Inventário de nomes legados:** mapear marcas, produtos e URLs anteriores com `rg` em todo o repositório.
2. **Substituição por placeholders neutros:** trocar nomes legados por termos genéricos aprovados no manual de marca.
3. **Limpeza de requisitos obsoletos:** revisar requisitos não atendidos e reclassificar como pendentes ou removidos na especificação.
4. **Atualização de anexos e checklists:** alinhar referências e IDs (`REQ-###`, `RISK-###`) para refletir o estado de template.
5. **Validação de conformidade:** confirmar cabeçalhos de caminho, estrutura `docs/rup/` e consistência com auditorias de IA.
6. **Registro e governança:** resumir alterações no changelog e citar impactos em auditorias automáticas.

## Saídas Esperadas
- Repositório sem menções ao projeto anterior.
- Requisitos e riscos marcados apenas como aplicáveis ao template.
- Documentação pronta para novos times iniciarem MVPs alinhados à governança.
