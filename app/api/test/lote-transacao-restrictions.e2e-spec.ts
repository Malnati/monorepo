// app/api/test/lote-transacao-restrictions.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { TEST_USERS, TEST_OFFERS, authenticateAsUser } from "./test-helpers";
import { ERROR_CODES } from "../src/constants";

/**
 * Testes E2E para restrições de compra e visibilidade de ofertas
 *
 * IMPORTANTE: Estes testes requerem que o banco de dados esteja rodando.
 * Execute `make start` ou `docker compose up -d` antes de rodar os testes.
 *
 * Os testes utilizam os dados de seed de `app/db/init/migrations/011_seed_test_scenarios.sql`
 */
describe("Offer and Transacao Restrictions (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  }, 30000); // Timeout de 30 segundos para permitir conexão com banco

  afterAll(async () => {
    await app.close();
  });

  describe("Cenários Positivos", () => {
    describe("1. Registrar oferta como fornecedor", () => {
      it("deve permitir que Usuário A (fornecedor FA) crie uma nova oferta", async () => {
        const offerData = {
          title: "Teste E2E - Nova Oferta",
          description: "Descrição da oferta de teste",
          preco: 1000.0,
          quantidade: 15.0,
          tipo_id: 1,
          unidade_id: 1,
          location: {
            latitude: -15.7894,
            longitude: -47.8822,
          },
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .post("/app/api/offers")
          .send(offerData)
          .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.title).toBe(offerData.title);
        expect(response.body.quantidade).toBe(offerData.quantidade);
        expect(response.body.quantidade_vendida).toBe(0);
      });
    });

    describe("2. Comprar oferta de outro usuário", () => {
      it("deve permitir que Usuário B compre oferta L1 (de fornecedor FA)", async () => {
        const transacaoData = {
          fornecedor_id: TEST_OFFERS.L1.fornecedor_id,
          comprador_id: TEST_USERS.USER_B.comprador_id,
          offer_id: TEST_OFFERS.L1.id,
          quantidade: 3.0,
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_B.id)
          .post("/app/api/transacoes")
          .send(transacaoData)
          .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.quantidade).toBe(transacaoData.quantidade);
        expect(response.body.offer.id).toBe(TEST_OFFERS.L1.id);
      });
    });

    describe("3. Listar ofertas disponíveis", () => {
      it("deve retornar apenas ofertas disponíveis (sem transação completa)", async () => {
        const response = await request(app.getHttpServer())
          .get("/app/api/offers")
          .expect(200);

        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);

        // Verificar que L3 e L4 (vendidos) não aparecem na lista
        const offerIds = response.body.data.map((offer: any) => offer.id);
        expect(offerIds).not.toContain(TEST_OFFERS.L3.id);
        expect(offerIds).not.toContain(TEST_OFFERS.L4.id);

        // Verificar que L2 e L5 (disponíveis) aparecem
        // L1 pode ou não aparecer dependendo do teste anterior
        expect(offerIds).toContain(TEST_OFFERS.L2.id);
        expect(offerIds).toContain(TEST_OFFERS.L5.id);
      });
    });

    describe("4. Ver ofertas vendidas pelo usuário logado", () => {
      it("deve retornar ofertas vendidas por Usuário A (L3)", async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .get("/app/api/offers/meus")
          .expect(200);

        expect(response.body).toHaveProperty("offersVendidos");
        expect(Array.isArray(response.body.offersVendidos)).toBe(true);

        const offerIds = response.body.offersVendidos.map(
          (offer: any) => offer.id,
        );
        expect(offerIds).toContain(TEST_OFFERS.L3.id);

        // Verificar dados da transação
        const offerL3 = response.body.offersVendidos.find(
          (o: any) => o.id === TEST_OFFERS.L3.id,
        );
        if (offerL3) {
          expect(offerL3).toHaveProperty("transacao");
          expect(offerL3.transacao).toHaveProperty("quantidade_negociada");
          expect(offerL3.transacao).toHaveProperty("data_transacao");
        }
      });

      it("deve retornar ofertas compradas por Usuário A (L4)", async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .get("/app/api/offers/meus")
          .expect(200);

        expect(response.body).toHaveProperty("offersComprados");
        expect(Array.isArray(response.body.offersComprados)).toBe(true);

        const offerIds = response.body.offersComprados.map(
          (offer: any) => offer.id,
        );
        expect(offerIds).toContain(TEST_OFFERS.L4.id);

        // Verificar dados da transação
        const offerL4 = response.body.offersComprados.find(
          (o: any) => o.id === TEST_OFFERS.L4.id,
        );
        if (offerL4) {
          expect(offerL4).toHaveProperty("transacao");
          expect(offerL4.transacao).toHaveProperty("quantidade_negociada");
          expect(offerL4.transacao).toHaveProperty("data_transacao");
        }
      });
    });

    describe("5. Ver ofertas compradas pelo usuário logado", () => {
      it("deve retornar ofertas compradas por Usuário B (L3)", async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_B.id)
          .get("/app/api/offers/meus")
          .expect(200);

        expect(response.body).toHaveProperty("offersComprados");
        expect(Array.isArray(response.body.offersComprados)).toBe(true);

        const offerIds = response.body.offersComprados.map(
          (offer: any) => offer.id,
        );
        expect(offerIds).toContain(TEST_OFFERS.L3.id);

        // Verificar dados da transação
        const offerL3 = response.body.offersComprados.find(
          (o: any) => o.id === TEST_OFFERS.L3.id,
        );
        if (offerL3) {
          expect(offerL3).toHaveProperty("transacao");
          expect(offerL3.transacao).toHaveProperty("quantidade_negociada");
          expect(offerL3.transacao).toHaveProperty("data_transacao");
        }
      });
    });
  });

  describe("Cenários Negativos", () => {
    describe("1. Comprar mesma oferta duas vezes", () => {
      it("deve bloquear segunda compra de oferta já vendida (L3)", async () => {
        const transacaoData = {
          fornecedor_id: TEST_OFFERS.L3.fornecedor_id,
          comprador_id: TEST_USERS.USER_C.comprador_id,
          offer_id: TEST_OFFERS.L3.id,
          quantidade: 1.0,
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .post("/app/api/transacoes")
          .send(transacaoData)
          .expect(400);

        expect(response.body).toHaveProperty("code");
        expect([
          ERROR_CODES.OFFER_ALREADY_SOLD,
          ERROR_CODES.LOT_ALREADY_SOLD,
        ]).toContain(response.body.code);
        expect(response.body.message).toContain("já foi vendid");
      });
    });

    describe("2. Comprar oferta publicada pelo próprio usuário", () => {
      it("deve bloquear Usuário A de comprar oferta L5 (sua própria oferta)", async () => {
        const transacaoData = {
          fornecedor_id: TEST_OFFERS.L5.fornecedor_id,
          comprador_id: TEST_USERS.USER_A.comprador_id,
          offer_id: TEST_OFFERS.L5.id,
          quantidade: 2.0,
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .post("/app/api/transacoes")
          .send(transacaoData)
          .expect(400);

        expect(response.body).toHaveProperty("code");
        expect([
          ERROR_CODES.OWN_OFFER_PURCHASE,
          ERROR_CODES.OWN_LOT_PURCHASE,
        ]).toContain(response.body.code);
        expect(response.body.message).toContain("própria");
      });
    });

    describe("3. Ver oferta vendida para outro usuário (detalhes)", () => {
      it("deve permitir que Usuário C veja oferta L3 mas com flags corretas", async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .get(`/app/api/offers/${TEST_OFFERS.L3.id}`)
          .expect(200);

        expect(response.body.id).toBe(TEST_OFFERS.L3.id);
        expect(response.body.has_transacao).toBe(true);
        expect(response.body.is_user_fornecedor).toBe(false);

        // Usuário C não deve ver detalhes completos da transação (apenas flags)
        // A oferta deve estar marcada como indisponível
      });
    });

    describe('4. Ver oferta comprada/vendida por terceiros em "Meus"', () => {
      it("deve retornar listas vazias para Usuário C que não tem ofertas vendidas/compradas", async () => {
        const response = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .get("/app/api/offers/meus")
          .expect(200);

        expect(response.body).toHaveProperty("offersVendidos");
        expect(response.body).toHaveProperty("offersComprados");

        // Verificar que L3 e L4 não aparecem para Usuário C
        const vendidosIds = response.body.offersVendidos.map((o: any) => o.id);
        const compradosIds = response.body.offersComprados.map(
          (o: any) => o.id,
        );

        expect(vendidosIds).not.toContain(TEST_OFFERS.L3.id);
        expect(vendidosIds).not.toContain(TEST_OFFERS.L4.id);
        expect(compradosIds).not.toContain(TEST_OFFERS.L3.id);
        expect(compradosIds).not.toContain(TEST_OFFERS.L4.id);
      });
    });
  });

  describe("Validações de Integridade", () => {
    describe("Bloqueio de race condition", () => {
      it("deve prevenir múltiplas compras simultâneas da mesma oferta", async () => {
        // Este teste seria executado com múltiplas requisições concorrentes
        // Para simplificar, validamos que a verificação existe na transação

        const offerDisponivel = TEST_OFFERS.L2;

        const transacaoData = {
          fornecedor_id: offerDisponivel.fornecedor_id,
          comprador_id: TEST_USERS.USER_A.comprador_id,
          offer_id: offerDisponivel.id,
          quantidade: offerDisponivel.quantidade, // Comprar tudo
        };

        // Primeira compra deve suceder
        const response1 = await authenticateAsUser(app, TEST_USERS.USER_A.id)
          .post("/app/api/transacoes")
          .send(transacaoData)
          .expect(201);

        expect(response1.body).toHaveProperty("id");

        // Segunda tentativa imediata deve falhar
        const response2 = await authenticateAsUser(app, TEST_USERS.USER_C.id)
          .post("/app/api/transacoes")
          .send({
            ...transacaoData,
            comprador_id: TEST_USERS.USER_C.comprador_id,
          })
          .expect(400);

        expect([
          ERROR_CODES.OFFER_ALREADY_SOLD,
          ERROR_CODES.LOT_ALREADY_SOLD,
        ]).toContain(response2.body.code);
      });
    });

    describe("Validação de quantidade", () => {
      it("deve bloquear compra com quantidade maior que disponível", async () => {
        const transacaoData = {
          fornecedor_id: TEST_OFFERS.L5.fornecedor_id,
          comprador_id: TEST_USERS.USER_B.comprador_id,
          offer_id: TEST_OFFERS.L5.id,
          quantidade: TEST_OFFERS.L5.quantidade + 10, // Mais que disponível
        };

        const response = await authenticateAsUser(app, TEST_USERS.USER_B.id)
          .post("/app/api/transacoes")
          .send(transacaoData)
          .expect(400);

        expect(response.body).toHaveProperty("code");
        expect([
          ERROR_CODES.INSUFFICIENT_QUANTITY,
          ERROR_CODES.OFFER_ALREADY_SOLD,
          ERROR_CODES.LOT_ALREADY_SOLD,
        ]).toContain(response.body.code);
      });
    });
  });
});
