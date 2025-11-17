-- app/db/init/migrations/017_add_publication_review_tracking.sql

-- Adicionar campos de rastreabilidade à tabela tb_publication_reviews
-- Conforme plano: docs/rup/99-anexos/MVP/plano-revisao-prompts-dados-sensiveis.md
-- Requisitos: REQ-031 a REQ-035 (auditoria e rastreabilidade)

ALTER TABLE tb_publication_reviews 
ADD COLUMN IF NOT EXISTS prompt_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS execution_id VARCHAR(100);

-- Criar índice para facilitar consultas por prompt_version
CREATE INDEX IF NOT EXISTS idx_publication_reviews_prompt_version 
ON tb_publication_reviews(prompt_version);

-- Criar índice para facilitar consultas por execution_id
CREATE INDEX IF NOT EXISTS idx_publication_reviews_execution_id 
ON tb_publication_reviews(execution_id);

-- Comentários descrevendo os novos campos
COMMENT ON COLUMN tb_publication_reviews.prompt_version IS 
'Versão do prompt de detecção de dados sensíveis usado na análise (formato: YYYY-MM-DD-vX)';

COMMENT ON COLUMN tb_publication_reviews.execution_id IS 
'ID único de execução da validação (formato: exec_timestamp_random)';
