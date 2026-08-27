-- 1. Criar e selecionar o banco de dados
CREATE DATABASE IF NOT EXISTS funil_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE funil_db;

-- 2. Limpar tabelas existentes
-- Ordem correta para respeitar as Foreign Keys
DROP TABLE IF EXISTS respostas_quiz;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS paginas_vendas;
DROP TABLE IF EXISTS perguntas;
DROP TABLE IF EXISTS funis;

-- 3. Tabela Principal: Funis
CREATE TABLE funis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    redirect_url VARCHAR(255) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 4. Tabela: Perguntas do Quiz
CREATE TABLE perguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funil_id INT NOT NULL,
    ordem INT NOT NULL,
    enunciado TEXT NOT NULL,
    imagem_url VARCHAR(255) NULL,

    -- Opções da pergunta armazenadas em JSON
    opcoes JSON NULL,

    CONSTRAINT fk_perguntas_funil 
        FOREIGN KEY (funil_id) 
        REFERENCES funis(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 5. Tabela: Páginas de Vendas (TSL Pré-pronta)
-- Transformamos os JSONs em colunas diretas para facilitar o formulário do Frontend
CREATE TABLE paginas_vendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funil_id INT NOT NULL UNIQUE,

    -- Bloco 1: Lead (Captura de Atenção)
    headline VARCHAR(255) NOT NULL,
    subheadline TEXT NULL,

    -- Bloco 2: Corpo (A História / Copy)
    video_url VARCHAR(255) NULL, -- Caso a pessoa queira colocar um vídeo (VLS) no topo da copy
    texto_corpo TEXT NULL,       -- O texto principal de vendas

    -- Bloco 3: Pitch (A Oferta)
    nome_produto VARCHAR(255) NULL,
    texto_oferta TEXT NULL,      -- Benefícios, o que inclui, garantia
    preco_texto VARCHAR(100) NULL, -- Ex: "12x de R$ 19,90" ou "R$ 97,00"

    -- Bloco 4: CTA (Chamada para Ação)
    cta_texto VARCHAR(100) DEFAULT 'Comprar Agora',
    cta_link VARCHAR(255) NOT NULL, -- Link de Checkout (Hotmart, Kiwify, etc)

    -- Customização
    cor_botao VARCHAR(20) DEFAULT '#10b981', -- Permite a pessoa escolher a cor do botão dela

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_paginas_vendas_funil 
        FOREIGN KEY (funil_id) 
        REFERENCES funis(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 6. Tabela: Leads Capturados no Quiz
CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funil_id INT NOT NULL,
    nome VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    whatsapp VARCHAR(50) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_leads_funil
        FOREIGN KEY (funil_id) 
        REFERENCES funis(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 7. Tabela: Respostas do Quiz por Lead
CREATE TABLE respostas_quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    pergunta_id INT NOT NULL,
    resposta_texto TEXT NOT NULL,
    respondido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_respostas_lead
        FOREIGN KEY (lead_id) 
        REFERENCES leads(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,

    CONSTRAINT fk_respostas_pergunta
        FOREIGN KEY (pergunta_id) 
        REFERENCES perguntas(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 8. Índices para otimização das consultas
CREATE INDEX idx_funis_slug 
    ON funis(slug);

CREATE INDEX idx_perguntas_funil_ordem 
    ON perguntas(funil_id, ordem);

CREATE INDEX idx_leads_funil 
    ON leads(funil_id);

CREATE INDEX idx_respostas_lead 
    ON respostas_quiz(lead_id);