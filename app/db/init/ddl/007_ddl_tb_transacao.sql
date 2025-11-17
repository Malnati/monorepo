-- app/db/init/ddl/007_ddl_tb_transacao.sql

-- Tabela de transações entre fornecedores e compradores
CREATE TABLE IF NOT EXISTS tb_transacao (
    id SERIAL PRIMARY KEY,
    fornecedor_id INT NOT NULL REFERENCES tb_fornecedor(id) ON DELETE CASCADE,
    comprador_id INT NOT NULL REFERENCES tb_comprador(id) ON DELETE CASCADE,
    offer_id INT NOT NULL REFERENCES tb_offer(id) ON DELETE CASCADE,
    quantidade NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tb_transacao IS 'Transações de compra/venda de offers de resíduo';
COMMENT ON COLUMN tb_transacao.id IS 'Identificador único da transação';
COMMENT ON COLUMN tb_transacao.fornecedor_id IS 'FK para tb_fornecedor - vendedor';
COMMENT ON COLUMN tb_transacao.comprador_id IS 'FK para tb_comprador - comprador';
COMMENT ON COLUMN tb_transacao.offer_id IS 'FK para tb_offer - offer transacionado';
COMMENT ON COLUMN tb_transacao.quantidade IS 'Quantidade transacionada';
COMMENT ON COLUMN tb_transacao.created_at IS 'Data de criação da transação';
COMMENT ON COLUMN tb_transacao.updated_at IS 'Data da última atualização';
