# scripts/format-prettier.sh
#!/bin/bash

# Script para executar Prettier localmente, replicando a lógica do workflow
# .github/workflows/prettier.yml

# Não usar set -e porque Prettier pode retornar códigos de saída diferentes de 0
# mesmo quando funciona corretamente (ex: arquivos que não podem ser formatados)
set -u  # Apenas falha em variáveis não definidas

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Procurando projetos Node.js..."

# Encontra todos os diretórios que contêm package.json na raiz
# Exclui node_modules, .git, e diretórios de referência/documentação
PROJECT_DIRS=$(find . -name "package.json" -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/docs/*" \
  -not -path "*/.ref/*" \
  -exec dirname {} \; | sort -u | sed 's|^\./||' | sed 's|$|/|' | tr '\n' ' ' | sed 's/[[:space:]]*$//')

# Se não houver projetos, avisa e sai
if [ -z "$PROJECT_DIRS" ]; then
  echo -e "${YELLOW}⚠️  Nenhum projeto Node.js encontrado. Prettier será ignorado.${NC}"
  exit 0
fi

echo -e "${GREEN}✅ Projetos Node.js encontrados: $PROJECT_DIRS${NC}"

# Verifica se o arquivo .prettierignore existe
IGNORE_PATH=".github/workflows/.prettierignore"
if [ ! -f "$IGNORE_PATH" ]; then
  echo -e "${YELLOW}⚠️  Arquivo $IGNORE_PATH não encontrado. Continuando sem ignore path.${NC}"
  IGNORE_OPTION=""
else
  IGNORE_OPTION="--ignore-path $IGNORE_PATH"
fi

# Verifica se Prettier está disponível
# Prioriza Prettier da raiz, depois global
if [ -f "node_modules/.bin/prettier" ]; then
  PRETTIER_CMD="node_modules/.bin/prettier"
elif command -v prettier >/dev/null 2>&1; then
  PRETTIER_CMD="prettier"
else
  echo -e "${RED}❌ Prettier não encontrado. Instale com: npm install prettier${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}📝 Executando Prettier nos projetos encontrados...${NC}"

# Prepara lista de diretórios para o Prettier (remove barras finais)
DIRS_FOR_PRETTIER=""
for DIR in $PROJECT_DIRS; do
  DIR_CLEAN=$(echo "$DIR" | sed 's|/$||')
  if [ -d "$DIR_CLEAN" ]; then
    DIRS_FOR_PRETTIER="$DIRS_FOR_PRETTIER $DIR_CLEAN"
  fi
done

# Executa Prettier uma única vez com todos os diretórios (como no workflow)
# --ignore-unknown: ignora arquivos desconhecidos
# --write: escreve as mudanças nos arquivos
if [ -n "$DIRS_FOR_PRETTIER" ]; then
  # Prettier pode retornar código de saída diferente de 0 mesmo quando funciona
  # Por isso não verificamos o código de saída diretamente
  $PRETTIER_CMD $IGNORE_OPTION --ignore-unknown --write $DIRS_FOR_PRETTIER || true
  echo -e "${GREEN}✅ Formatação concluída!${NC}"
else
  echo -e "${YELLOW}⚠️  Nenhum diretório válido encontrado para formatação.${NC}"
fi

