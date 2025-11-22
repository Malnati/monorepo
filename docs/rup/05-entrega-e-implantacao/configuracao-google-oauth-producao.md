<!-- docs/rup/05-entrega-e-implantacao/configuracao-google-oauth-producao.md -->
# Configuração Google OAuth em Produção

## Problemas Identificados

### 1. Erro: "The given origin is not allowed for the given client ID"

**Sintoma:**
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

**Causa:**
O domínio `monorepo.cranio.dev` não está autorizado no Google Cloud Console para o Client ID configurado.

**Solução:**
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Navegue até **APIs & Services** → **Credentials**
3. Selecione o OAuth 2.0 Client ID usado pela aplicação
4. Em **Authorized JavaScript origins**, adicione:
   - `https://monorepo.cranio.dev`
5. Em **Authorized redirect URIs**, adicione:
   - `https://monorepo.cranio.dev/oauth2/callback` (se usar OAuth2 Proxy)
   - `https://monorepo.cranio.dev` (para callback direto)
6. Salve as alterações

---

### 2. Erro: CORS - "XMLHttpRequest cannot load http://localhost:3001"

**Sintoma:**
```
XMLHttpRequest cannot load http://localhost:3001/app/api/auth/google due to access control checks.
```

**Causa:**
A variável `APP_UI_VITE_API_BASE_URL` está configurada como `http://localhost:3001` mas a aplicação está rodando em produção em `https://monorepo.cranio.dev`. Isso causa:
- Mixed content (HTTPS tentando acessar HTTP)
- CORS bloqueado pelo navegador

**Solução:**

1. **Atualizar variável de ambiente em produção:**

No arquivo `.env` (não versionado) ou nas variáveis de ambiente do servidor:

```bash
# Produção (via Caddy reverse proxy)
APP_UI_VITE_API_BASE_URL=https://monorepo.cranio.dev
```

**IMPORTANTE:** Não inclua `/api` no final da URL. O código já adiciona automaticamente.

2. **Rebuild da aplicação UI:**

Após alterar a variável, é necessário fazer rebuild do container:

```bash
cd app
docker compose build monorepo-ui
docker compose up -d monorepo-ui
```

3. **Verificar configuração do Caddy:**

O Caddy deve estar configurado para fazer proxy reverso da API. Verifique se há rota `/api` apontando para o serviço `monorepo-api`.

---

### 3. Erro: Network Error

**Sintoma:**
```
Login error: Network Error (AxiosError)
```

**Causa:**
Consequência dos problemas anteriores (CORS e origem não autorizada).

**Solução:**
Resolver os problemas 1 e 2 acima.

---

## Checklist de Configuração

### Google Cloud Console
- [ ] Client ID configurado
- [ ] `https://monorepo.cranio.dev` adicionado em **Authorized JavaScript origins**
- [ ] Redirect URIs configurados corretamente

### Variáveis de Ambiente

**Frontend (UI):**
- [ ] `APP_UI_VITE_API_BASE_URL=https://monorepo.cranio.dev` (produção)
- [ ] `APP_UI_VITE_GOOGLE_CLIENT_ID` configurado com o Client ID correto

**Backend (API):**
- [ ] `GOOGLE_CLIENT_ID` configurado com o mesmo Client ID do frontend
- [ ] `GOOGLE_CLIENT_SECRET` configurado
- [ ] `APP_API_CORS_ORIGIN=https://monorepo.cranio.dev` (produção) ou `*` (desenvolvimento)

### Infraestrutura
- [ ] Caddy configurado para proxy reverso `/api` → `monorepo-api:3001`
- [ ] Container `monorepo-ui` rebuildado após alterar variáveis
- [ ] Container `monorepo-api` com CORS configurado:
  - `APP_API_CORS_ORIGIN=https://monorepo.cranio.dev` (produção)
  - Ou `APP_API_CORS_ORIGIN=*` (desenvolvimento)

### Testes
- [ ] Login Google funciona em `https://monorepo.cranio.dev`
- [ ] Sem erros de CORS no console do navegador
- [ ] Sem erros de "origin not allowed" no console

---

## Configuração de Desenvolvimento vs Produção

### Desenvolvimento Local
```bash
APP_UI_VITE_API_BASE_URL=http://localhost:3001
APP_UI_VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Authorized origins no Google Cloud Console:**
- `http://localhost:5173`
- `http://localhost:5174`

### Produção
```bash
APP_UI_VITE_API_BASE_URL=https://monorepo.cranio.dev
APP_UI_VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Authorized origins no Google Cloud Console:**
- `https://monorepo.cranio.dev`

---

## Referências

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [CORS Configuration - NestJS](https://docs.nestjs.com/security/cors)
- Documentação do projeto: `docs/rup/05-entrega-e-implantacao/ambientes-e-configuracoes.md`
