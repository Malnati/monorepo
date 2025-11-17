-- app/db/init/migrations/005_create_tb_user.sql

-- Tabela de usuários autenticados via Google SSO
CREATE TABLE tb_user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_user_email_valid CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Tabela de relacionamento N:M entre usuário e fornecedor
CREATE TABLE tb_user_fornecedor (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES tb_user(id) ON DELETE CASCADE,
    fornecedor_id INT NOT NULL REFERENCES tb_fornecedor(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_user_fornecedor UNIQUE (user_id, fornecedor_id)
);

-- Tabela de relacionamento N:M entre usuário e comprador
CREATE TABLE tb_user_comprador (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES tb_user(id) ON DELETE CASCADE,
    comprador_id INT NOT NULL REFERENCES tb_comprador(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_user_comprador UNIQUE (user_id, comprador_id)
);

-- Índices para performance
CREATE INDEX idx_user_email ON tb_user(email);
CREATE INDEX idx_user_google_id ON tb_user(google_id);
CREATE INDEX idx_user_fornecedor_user_id ON tb_user_fornecedor(user_id);
CREATE INDEX idx_user_fornecedor_fornecedor_id ON tb_user_fornecedor(fornecedor_id);
CREATE INDEX idx_user_comprador_user_id ON tb_user_comprador(user_id);
CREATE INDEX idx_user_comprador_comprador_id ON tb_user_comprador(comprador_id);
