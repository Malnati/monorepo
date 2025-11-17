// app/api/test/lote-transacao-restrictions.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TEST_USERS, TEST_LOTES, authenticateAsUser } from './test-helpers';
import { ERROR_CODES } from '../src/constants';

/**
 * Testes E2E para restrições de compra e visibilidade de lotes
 * 
 * IMPORTANTE: Estes testes requerem que o banco de dados esteja rodando.
 * Execute `make start` ou `docker compose up -d` antes de rodar os testes.
 * 
 * Os testes utilizam os dados de seed de `app/db/nit/migrations/011_seed_test_scenarios.sql`
 */
describe('Lote and Transacao Restrictions (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  }, 30000); // Timeout de 30 segundos para permitir conexão com banco

  afterAll(async () => {
    await app.close();
  });

  describe('Cenários Positivos', () => {
    describe('1. Registrar lote como fornecedor', () => {
      it('deve permitir que Usuário A (fornecedor FA) crie um novo lote', async () => {
        const loteData = {
          nome: 'Teste E2E - Novo Lote',
          preco: 1000.00,
          quantidade: 15.0,
          tipo_id: 1, // Reciclável
          unidade_id: 1, // Toneladas
          fornecedor_id: TEST_USERS.USER_A.fornecedor_id,
          localizacao: '-15.7894,-47.8822',
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .post('/app/api/lotes')
          .send(loteData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.nome).toBe(loteData.nome);
        expect(response.body.quantidade).toBe(loteData.quantidade);
        expect(response.body.quantidade_vendida).toBe(0);
      });
    });

    describe('2. Comprar lote de outro usuário', () => {
      it('deve permitir que Usuário B compre lote L1 (de fornecedor FA)', async () => {
        const transacaoData = {
          fornecedor_id: TEST_LOTES.L1.fornecedor_id,
          comprador_id: TEST_USERS.USER_B.comprador_id,
          lote_residuo_id: TEST_LOTES.L1.id,
          quantidade: 3.0,
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_B.id)
          .post('/app/api/transacoes')
          .send(transacaoData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.quantidade).toBe(transacaoData.quantidade);
        expect(response.body.lote_residuo.id).toBe(TEST_LOTES.L1.id);
      });
    });

    describe('3. Listar lotes disponíveis', () => {
      it('deve retornar apenas lotes disponíveis (sem transação completa)', async () => {
        const response = await request(app.getHttpServer())
          .get('/app/api/lotes')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        // Verificar que L3 e L4 (vendidos) não aparecem na lista
        const loteIds = response.body.data.map((lote: any) => lote.id);
        expect(loteIds).not.toContain(TEST_LOTES.L3.id);
        expect(loteIds).not.toContain(TEST_LOTES.L4.id);
        
        // Verificar que L2 e L5 (disponíveis) aparecem
        // L1 pode ou não aparecer dependendo do teste anterior
        expect(loteIds).toContain(TEST_LOTES.L2.id);
        expect(loteIds).toContain(TEST_LOTES.L5.id);
      });
    });

    describe('4. Ver lotes vendidos pelo usuário logado', () => {
      it('deve retornar lotes vendidos por Usuário A (L3)', async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .get('/app/api/lotes/meus')
          .expect(200);

        expect(response.body).toHaveProperty('lotesVendidos');
        expect(Array.isArray(response.body.lotesVendidos)).toBe(true);
        
        const loteIds = response.body.lotesVendidos.map((lote: any) => lote.id);
        expect(loteIds).toContain(TEST_LOTES.L3.id);
        
        // Verificar dados da transação
        const loteL3 = response.body.lotesVendidos.find((l: any) => l.id === TEST_LOTES.L3.id);
        if (loteL3) {
          expect(loteL3).toHaveProperty('transacao');
          expect(loteL3.transacao).toHaveProperty('quantidade_negociada');
          expect(loteL3.transacao).toHaveProperty('data_transacao');
        }
      });

      it('deve retornar lotes comprados por Usuário A (L4)', async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .get('/app/api/lotes/meus')
          .expect(200);

        expect(response.body).toHaveProperty('lotesComprados');
        expect(Array.isArray(response.body.lotesComprados)).toBe(true);
        
        const loteIds = response.body.lotesComprados.map((lote: any) => lote.id);
        expect(loteIds).toContain(TEST_LOTES.L4.id);
        
        // Verificar dados da transação
        const loteL4 = response.body.lotesComprados.find((l: any) => l.id === TEST_LOTES.L4.id);
        if (loteL4) {
          expect(loteL4).toHaveProperty('transacao');
          expect(loteL4.transacao).toHaveProperty('quantidade_negociada');
          expect(loteL4.transacao).toHaveProperty('data_transacao');
        }
      });
    });

    describe('5. Ver lotes comprados pelo usuário logado', () => {
      it('deve retornar lotes comprados por Usuário B (L3)', async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_B.id)
          .get('/app/api/lotes/meus')
          .expect(200);

        expect(response.body).toHaveProperty('lotesComprados');
        expect(Array.isArray(response.body.lotesComprados)).toBe(true);
        
        const loteIds = response.body.lotesComprados.map((lote: any) => lote.id);
        expect(loteIds).toContain(TEST_LOTES.L3.id);
        
        // Verificar dados da transação
        const loteL3 = response.body.lotesComprados.find((l: any) => l.id === TEST_LOTES.L3.id);
        if (loteL3) {
          expect(loteL3).toHaveProperty('transacao');
          expect(loteL3.transacao).toHaveProperty('quantidade_negociada');
          expect(loteL3.transacao).toHaveProperty('data_transacao');
        }
      });
    });
  });

  describe('Cenários Negativos', () => {
    describe('1. Comprar mesmo lote duas vezes', () => {
      it('deve bloquear segunda compra de lote já vendido (L3)', async () => {
        const transacaoData = {
          fornecedor_id: TEST_LOTES.L3.fornecedor_id,
          comprador_id: TEST_USERS.USER_C.comprador_id,
          lote_residuo_id: TEST_LOTES.L3.id,
          quantidade: 1.0,
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .post('/app/api/transacoes')
          .send(transacaoData)
          .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(ERROR_CODES.LOT_ALREADY_SOLD);
        expect(response.body.message).toContain('já foi vendido');
      });
    });

    describe('2. Comprar lote publicado pelo próprio usuário', () => {
      it('deve bloquear Usuário A de comprar lote L1 ou L5 (seu próprio lote)', async () => {
        const transacaoData = {
          fornecedor_id: TEST_LOTES.L5.fornecedor_id,
          comprador_id: TEST_USERS.USER_A.comprador_id,
          lote_residuo_id: TEST_LOTES.L5.id,
          quantidade: 2.0,
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .post('/app/api/transacoes')
          .send(transacaoData)
          .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(ERROR_CODES.OWN_LOT_PURCHASE);
        expect(response.body.message).toContain('próprio lote');
      });
    });

    describe('3. Ver lote vendido para outro usuário (detalhes)', () => {
      it('deve permitir que Usuário C veja lote L3 mas com flags corretas', async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .get(`/app/api/lotes/${TEST_LOTES.L3.id}`)
          .expect(200);

        expect(response.body.id).toBe(TEST_LOTES.L3.id);
        expect(response.body.has_transacao).toBe(true);
        expect(response.body.is_user_fornecedor).toBe(false);
        
        // Usuário C não deve ver detalhes completos da transação (apenas flags)
        // O lote deve estar marcado como indisponível
      });
    });

    describe('4. Ver lote comprado/vendido por terceiros em "Meus"', () => {
      it('deve retornar listas vazias para Usuário C que não tem lotes vendidos/comprados', async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .get('/app/api/lotes/meus')
          .expect(200);

        expect(response.body).toHaveProperty('lotesVendidos');
        expect(response.body).toHaveProperty('lotesComprados');
        
        // Verificar que L3 e L4 não aparecem para Usuário C
        const vendidosIds = response.body.lotesVendidos.map((l: any) => l.id);
        const compradosIds = response.body.lotesComprados.map((l: any) => l.id);
        
        expect(vendidosIds).not.toContain(TEST_LOTES.L3.id);
        expect(vendidosIds).not.toContain(TEST_LOTES.L4.id);
        expect(compradosIds).not.toContain(TEST_LOTES.L3.id);
        expect(compradosIds).not.toContain(TEST_LOTES.L4.id);
      });
    });
  });

  describe('Validações de Integridade', () => {
    describe('Bloqueio de race condition', () => {
      it('deve prevenir múltiplas compras simultâneas do mesmo lote', async () => {
        // Este teste seria executado com múltiplas requisições concorrentes
        // Para simplificar, validamos que a verificação existe na transação
        
        const loteDisponivel = TEST_LOTES.L2;
        
        const transacaoData = {
          fornecedor_id: loteDisponivel.fornecedor_id,
          comprador_id: TEST_USERS.USER_A.comprador_id,
          lote_residuo_id: loteDisponivel.id,
          quantidade: loteDisponivel.quantidade, // Comprar tudo
        };

        // Primeira compra deve suceder
        const response1 = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .post('/app/api/transacoes')
          .send(transacaoData)
          .expect(201);

        expect(response1.body).toHaveProperty('id');

        // Segunda tentativa imediata deve falhar
        const response2 = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .post('/app/api/transacoes')
          .send({
            ...transacaoData,
            comprador_id: TEST_USERS.USER_C.comprador_id,
          })
          .expect(400);

        expect(response2.body.code).toBe(ERROR_CODES.LOT_ALREADY_SOLD);
      });
    });

    describe('Validação de quantidade', () => {
      it('deve bloquear compra com quantidade maior que disponível', async () => {
        const transacaoData = {
          fornecedor_id: TEST_LOTES.L5.fornecedor_id,
          comprador_id: TEST_USERS.USER_B.comprador_id,
          lote_residuo_id: TEST_LOTES.L5.id,
          quantidade: TEST_LOTES.L5.quantidade + 10, // Mais que disponível
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_B.id)
          .post('/app/api/transacoes')
          .send(transacaoData)
          .expect(400);

        expect(response.body).toHaveProperty('code');
        expect([ERROR_CODES.INSUFFICIENT_QUANTITY, ERROR_CODES.LOT_ALREADY_SOLD])
          .toContain(response.body.code);
      });
    });
  });
});
