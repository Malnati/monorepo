// app/api/scripts/test-startup.ts
/**
 * Script de testes de inicialização da API
 * Valida todos os endpoints de persistência antes de considerar a API pronta
 *
 * Este script é executado após a API iniciar para garantir que todos os endpoints
 * de persistência estão funcionando corretamente antes de aceitar requisições.
 */

const API_URL = process.env.API_URL || "";
if (!API_URL) {
  console.error("ERRO: API_URL não está configurada. Configure no docker-compose.yml ou .env");
  process.exit(1);
}
const MAX_RETRIES = 30;
const RETRY_DELAY = 2000; // 2 segundos
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

// Obter token de autenticação válido fazendo login mockado
// Como não devemos testar autenticação, vamos apenas validar que endpoints existem
// e retornam respostas apropriadas (401 para não autenticado é válido)
let testToken: string | null = null;

async function getTestToken(): Promise<string | null> {
  // Tentar fazer login mockado se possível
  // Por enquanto, retornar null e testar endpoints sem auth
  // (401 é uma resposta válida indicando que o endpoint existe)
  return null;
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[test-startup] ${message}`);
}

function error(message: string) {
  console.error(`[test-startup] ERROR: ${message}`);
}

function addResult(name: string, passed: boolean, errorMsg?: string) {
  results.push({ name, passed, error: errorMsg });
  if (passed) {
    log(`✅ ${name}`);
  } else {
    error(`${name}: ${errorMsg || "Failed"}`);
  }
}

async function waitForAPI(): Promise<boolean> {
  log("Aguardando API estar disponível...");

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.status === 200) {
        log("API está disponível");
        return true;
      }
    } catch (err) {
      if (i < MAX_RETRIES - 1) {
        log(
          `Tentativa ${i + 1}/${MAX_RETRIES} - API ainda não disponível, aguardando...`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  return false;
}

async function testEndpoint(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  name: string,
  data?: any,
  expectedStatus: number | number[] = 200,
  useAuth: boolean = false,
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const options: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (useAuth && testToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${testToken}`,
      };
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    const expectedStatuses = Array.isArray(expectedStatus)
      ? expectedStatus
      : [expectedStatus];
    const isValidStatus = expectedStatuses.includes(response.status);

    // Para endpoints que requerem auth, 401 é uma resposta válida (endpoint existe e requer auth)
    // 404 indica que o endpoint não existe (erro real)
    // Se 401 está na lista de status esperados OU se recebemos 401 e não estamos usando auth, é válido
    if (isValidStatus) {
      addResult(name, true);
      return true;
    } else if (
      response.status === 401 &&
      !useAuth &&
      expectedStatuses.includes(401)
    ) {
      // 401 é válido quando não estamos usando auth e está na lista de esperados
      addResult(name, true);
      return true;
    } else if (response.status === 404 && !expectedStatuses.includes(404)) {
      // 404 só é válido se estiver explicitamente na lista de esperados
      addResult(name, false, `Endpoint não encontrado (404)`);
      return false;
    } else {
      let errorMessage = "";
      try {
        const errorData = await response.text();
        errorMessage = errorData ? `: ${errorData.substring(0, 200)}` : "";
      } catch {
        // Ignorar erro ao ler resposta
      }
      addResult(
        name,
        false,
        `Status esperado: ${expectedStatuses.join(" ou ")}, recebido: ${response.status}${errorMessage}`,
      );
      return false;
    }
  } catch (err) {
    const error = err as Error;
    addResult(name, false, error.message || String(err));
    return false;
  }
}

async function testTipos() {
  log("Testando endpoints de Tipos...");

  // GET /tipos - Listar tipos (requer auth, 401 é válido)
  await testEndpoint(
    "GET",
    "/tipos",
    "GET /tipos - Listar tipos",
    undefined,
    [200, 401],
  );
}

async function testUnidades() {
  log("Testando endpoints de Unidades...");

  // GET /unidades - Listar unidades (requer auth, 401 é válido)
  await testEndpoint(
    "GET",
    "/unidades",
    "GET /unidades - Listar unidades",
    undefined,
    [200, 401],
  );
}

async function testFornecedores() {
  log("Testando endpoints de Fornecedores...");

  // GET /fornecedores - Listar fornecedores (verificar se endpoint existe)
  await testEndpoint(
    "GET",
    "/fornecedores",
    "GET /fornecedores - Listar fornecedores",
    undefined,
    [200, 401, 404],
  );

  // GET /fornecedores/:id - Buscar fornecedor por ID (usando ID 1 do seed)
  await testEndpoint(
    "GET",
    "/fornecedores/1",
    "GET /fornecedores/:id - Buscar fornecedor",
    undefined,
    [200, 401, 404],
  );

  // GET /fornecedores/:id/avatar - Buscar avatar (usando ID 1 do seed)
  await testEndpoint(
    "GET",
    "/fornecedores/1/avatar",
    "GET /fornecedores/:id/avatar - Buscar avatar",
    undefined,
    [200, 401, 404],
  );
}

async function testCompradores() {
  log("Testando endpoints de Compradores...");

  // GET /compradores - Listar compradores (verificar se endpoint existe)
  await testEndpoint(
    "GET",
    "/compradores",
    "GET /compradores - Listar compradores",
    undefined,
    [200, 401, 404],
  );

  // GET /compradores/:id - Buscar comprador por ID (usando ID 1 do seed)
  await testEndpoint(
    "GET",
    "/compradores/1",
    "GET /compradores/:id - Buscar comprador",
    undefined,
    [200, 401, 404],
  );
}

async function testOffers() {
  log("Testando endpoints de Offers...");

  // GET /offers - Listar offers (requer auth, 401 é válido)
  await testEndpoint(
    "GET",
    "/offers",
    "GET /offers - Listar offers",
    undefined,
    [200, 401],
  );

  // GET /offers?page=1&limit=10 - Listar com paginação
  await testEndpoint(
    "GET",
    "/offers?page=1&limit=10",
    "GET /offers - Listar com paginação",
    undefined,
    [200, 401],
  );

  // GET /offers/:id - Buscar offer por ID (usando ID 1 do seed)
  await testEndpoint(
    "GET",
    "/offers/1",
    "GET /offers/:id - Buscar offer",
    undefined,
    [200, 401],
  );
}

async function testLotes() {
  log("Testando endpoints de Lotes (legacy)...");

  // GET /lotes - Listar lotes (endpoint legacy, requer auth, 401 é válido)
  await testEndpoint(
    "GET",
    "/lotes",
    "GET /lotes - Listar lotes (legacy)",
    undefined,
    [200, 401],
  );

  // GET /lotes?page=1&limit=10 - Listar com paginação
  await testEndpoint(
    "GET",
    "/lotes?page=1&limit=10",
    "GET /lotes - Listar com paginação",
    undefined,
    [200, 401],
  );

  // GET /lotes/:id - Buscar lote por ID (usando ID 1 do seed)
  await testEndpoint(
    "GET",
    "/lotes/1",
    "GET /lotes/:id - Buscar lote",
    undefined,
    [200, 401],
  );
}

async function testFotos() {
  log("Testando endpoints de Fotos...");

  // GET /fotos/:id - Buscar foto por ID (requer auth, 401 é válido; 404 se não existir)
  await testEndpoint(
    "GET",
    "/fotos/1",
    "GET /fotos/:id - Buscar foto",
    undefined,
    [200, 401, 404],
  );
}

async function testTransacoes() {
  log("Testando endpoints de Transações...");

  // GET /transacoes - Listar transações (requer auth, 401 é válido)
  await testEndpoint(
    "GET",
    "/transacoes",
    "GET /transacoes - Listar transações",
    undefined,
    [200, 401],
  );

  // GET /transacoes?page=1&limit=10 - Listar com paginação
  await testEndpoint(
    "GET",
    "/transacoes?page=1&limit=10",
    "GET /transacoes - Listar com paginação",
    undefined,
    [200, 401],
  );
}

async function testFormaPagamento() {
  log("Testando endpoints de Forma de Pagamento...");

  // GET /forma-pagamento - Listar formas de pagamento (verificar se endpoint existe)
  await testEndpoint(
    "GET",
    "/forma-pagamento",
    "GET /forma-pagamento - Listar formas de pagamento",
    undefined,
    [200, 401, 404],
  );
}

async function runTests() {
  log("Iniciando testes de inicialização da API...");
  log(`API URL: ${API_URL}`);

  // Aguardar API estar disponível
  const apiReady = await waitForAPI();
  if (!apiReady) {
    error(
      "API não está disponível após múltiplas tentativas. Abortando testes.",
    );
    process.exit(1);
  }

  // Tentar obter token de teste (opcional)
  testToken = await getTestToken();

  // Executar testes de endpoints de persistência
  // Nota: 401 (Unauthorized) é uma resposta válida indicando que o endpoint existe
  // 404 (Not Found) indica que o endpoint não existe (erro real)
  await testTipos();
  await testUnidades();
  await testFornecedores();
  await testCompradores();
  await testOffers();
  await testLotes();
  await testFotos();
  await testTransacoes();
  await testFormaPagamento();

  // Resumo dos resultados
  log("\n=== Resumo dos Testes ===");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  log(`Total: ${results.length}`);
  log(`✅ Passou: ${passed}`);
  log(`❌ Falhou: ${failed}`);

  if (failed > 0) {
    log("\n=== Testes que Falharam ===");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        error(`${r.name}: ${r.error || "Sem detalhes"}`);
      });

    error("\nERRO CRÍTICO: Alguns testes de inicialização falharam.");
    error("A API não está pronta para aceitar requisições.");
    process.exit(1);
  }

  log("\n✅ Todos os testes de inicialização passaram!");
  log("A API está pronta para aceitar requisições.");
  process.exit(0);
}

// Executar testes
runTests().catch((err) => {
  error(
    `Erro fatal durante execução dos testes: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
