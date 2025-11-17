-- app/db/init/migrations/019_rename_nome_add_descricao_comments.sql

COMMENT ON COLUMN tb_lote_residuo.titulo IS 'Título do lote de resíduo (anteriormente chamado de nome)';
COMMENT ON COLUMN tb_lote_residuo.descricao IS 'Descrição detalhada do lote de resíduo, incluindo informações sobre armazenamento, condições especiais e outros detalhes relevantes';
