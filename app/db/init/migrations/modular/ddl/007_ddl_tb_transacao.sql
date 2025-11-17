-- app/db/init/migrations/modular/ddl/007_ddl_tb_transacao.sql

-- Tabela de transações entre fornecedores e compradores
CREATE TABLE IF NOT EXISTS tb_transacao (
    id SERIAL PRIMARY KEY,
    offer_id INT NOT NULL REFERENCES tb_offer(id) ON DELETE CASCADE,
    comprador_id INT NOT NULL REFERENCES tb_comprador(id) ON DELETE CASCADE,
    quantidade NUMERIC(12,2) NOT NULL,
    preco_unitario NUMERIC(12,2),
    preco_total NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'pendente',
    data_transacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tb_transacao IS 'Transações de compra/venda de offers de resíduo';
COMMENT ON COLUMN tb_transacao.id IS 'Identificador único da transação';
COMMENT ON COLUMN tb_transacao.offer_id IS 'FK para tb_offer - offer transacionado';
COMMENT ON COLUMN tb_transacao.comprador_id IS 'FK para tb_comprador - comprador';
COMMENT ON COLUMN tb_transacao.quantidade IS 'Quantidade transacionada';
COMMENT ON COLUMN tb_transacao.preco_unitario IS 'Preço unitário na transação';
COMMENT ON COLUMN tb_transacao.preco_total IS 'Valor total da transação';
COMMENT ON COLUMN tb_transacao.status IS 'Status da transação (pendente, concluida, cancelada)';
COMMENT ON COLUMN tb_transacao.data_transacao IS 'Data de efetivação da transação';
COMMENT ON COLUMN tb_transacao.created_at IS 'Data de criação da transação';
COMMENT ON COLUMN tb_transacao.updated_at IS 'Data da última atualização';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tb_transacao_offer_id ON tb_transacao(offer_id);
CREATE INDEX IF NOT EXISTS idx_tb_transacao_comprador_id ON tb_transacao(comprador_id);
CREATE INDEX IF NOT EXISTS idx_tb_transacao_status ON tb_transacao(status);
