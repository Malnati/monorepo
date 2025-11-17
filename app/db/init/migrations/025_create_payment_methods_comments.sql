-- app/db/init/migrations/021_create_payment_methods_comments.sql

COMMENT ON TABLE tb_forma_pagamento IS 'Tabela de domínio para formas de pagamento aceitas na plataforma';
COMMENT ON COLUMN tb_forma_pagamento.id IS 'Identificador único da forma de pagamento';
COMMENT ON COLUMN tb_forma_pagamento.nome IS 'Nome da forma de pagamento (ex: PIX, Cartão de crédito)';
COMMENT ON COLUMN tb_forma_pagamento.ativo IS 'Indica se a forma de pagamento está ativa e disponível para uso';
COMMENT ON COLUMN tb_forma_pagamento.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN tb_forma_pagamento.updated_at IS 'Data e hora da última atualização do registro';

COMMENT ON TABLE tb_lote_forma_pagamento IS 'Tabela de ligação entre lotes de resíduos e formas de pagamento aceitas';
COMMENT ON COLUMN tb_lote_forma_pagamento.lote_residuo_id IS 'Identificador do lote de resíduo';
COMMENT ON COLUMN tb_lote_forma_pagamento.forma_pagamento_id IS 'Identificador da forma de pagamento';
COMMENT ON COLUMN tb_lote_forma_pagamento.created_at IS 'Data e hora de criação da associação';
