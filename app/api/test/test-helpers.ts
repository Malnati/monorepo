// app/api/test/test-helpers.ts
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

/**
 * Dados dos usuários de teste conforme seed 011_seed_test_scenarios.sql
 */
export const TEST_USERS = {
  USER_A: {
    id: 100,
    email: 'usuario.a@teste.com',
    fornecedor_id: 100,
    comprador_id: 100,
  },
  USER_B: {
    id: 101,
    email: 'usuario.b@teste.com',
    fornecedor_id: 101,
    comprador_id: 101,
  },
  USER_C: {
    id: 102,
    email: 'usuario.c@teste.com',
    comprador_id: 102,
  },
};

/**
 * Dados das ofertas de teste conforme seed 011_seed_test_scenarios.sql
 * @deprecated Use TEST_OFFERS instead. Kept for backward compatibility.
 */
export const TEST_LOTES = {
  L1: {
    id: 1000,
    nome: 'L1 - Produto Premium Teste',
    fornecedor_id: 100,
    quantidade: 10.0,
  },
  L2: {
    id: 1001,
    nome: 'L2 - Produto Categoria B Teste',
    fornecedor_id: 101,
    quantidade: 5.0,
  },
  L3: {
    id: 1002,
    nome: 'L3 - Produto Mix Teste (VENDIDO)',
    fornecedor_id: 100,
    vendido_para_comprador_id: 101,
  },
  L4: {
    id: 1003,
    nome: 'L4 - Produto Categoria C Teste (VENDIDO)',
    fornecedor_id: 101,
    vendido_para_comprador_id: 100,
  },
  L5: {
    id: 1004,
    nome: 'L5 - Produto Teste (Para teste auto-compra)',
    fornecedor_id: 100,
    quantidade: 6.0,
  },
};

/**
 * Dados das ofertas de teste conforme seed 011_seed_test_scenarios.sql
 */
export const TEST_OFFERS = TEST_LOTES;

/**
 * Gera um token JWT fake para testes
 * Em produção, isso seria feito pelo AuthService
 */
export function generateTestToken(userId: number, email: string): string {
  // Para testes E2E, podemos usar um token JWT real ou mock
  // Por simplicidade, vamos retornar um token que será validado pelo mock do AuthGuard
  return `Bearer test-token-user-${userId}`;
}

/**
 * Faz autenticação como um usuário de teste
 */
export function authenticateAsUser(
  app: INestApplication,
  userId: number,
) {
  const userEmail = 
    userId === 100 ? TEST_USERS.USER_A.email :
    userId === 101 ? TEST_USERS.USER_B.email :
    userId === 102 ? TEST_USERS.USER_C.email :
    'unknown@teste.com';
  
  const token = generateTestToken(userId, userEmail);
  return request(app.getHttpServer()).set('Authorization', token);
}

/**
 * Limpa dados de teste específicos (se necessário entre testes)
 */
export async function cleanupTestData(app: INestApplication): Promise<void> {
  // Implementar limpeza se necessário
  // Por enquanto, como usamos IDs fixos nos seeds, não precisamos limpar
}
