-- app/db/init/migrations/modular/seeds/014_seed_tb_transacao.sql

-- Seed de transações de teste para demonstração
-- Cria algumas transações de exemplo entre fornecedores e compradores

-- Transação 1: Compra de Garrafas PET (Concluída)
INSERT INTO tb_transacao (
    offer_id, comprador_id, quantidade, preco_unitario, preco_total,
    status, data_transacao, created_at, updated_at
)
SELECT 
    o.id, 1, 100.00, 150.00, 15000.00,
    'concluida', CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tb_offer o
WHERE o.title = 'Garrafas PET Incolor Premium'
  AND NOT EXISTS (
    SELECT 1 FROM tb_transacao t 
    WHERE t.offer_id = o.id AND t.comprador_id = 1
  );

-- Transação 2: Compra de Latas de Alumínio (Pendente)
INSERT INTO tb_transacao (
    offer_id, comprador_id, quantidade, preco_unitario, preco_total,
    status, data_transacao, created_at, updated_at
)
SELECT 
    o.id, 1, 50.00, 350.00, 17500.00,
    'pendente', CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tb_offer o
WHERE o.title = 'Latas de Alumínio'
  AND NOT EXISTS (
    SELECT 1 FROM tb_transacao t 
    WHERE t.offer_id = o.id AND t.comprador_id = 1
  );
