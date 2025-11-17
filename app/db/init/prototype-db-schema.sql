--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: fn_update_location_geog(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_location_geog() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  coords text[];
  lat numeric;
  lng numeric;
  city_coords text[];
  city_lat numeric;
  city_lng numeric;
  neighborhood_coords text[];
  neighborhood_lat numeric;
  neighborhood_lng numeric;
BEGIN
  -- Processar localização real (existente)
  IF NEW.formatted_address IS NOT NULL AND 
     NEW.location_geog IS NULL AND
     NEW.localizacao IS NOT NULL AND 
     NEW.localizacao ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    coords := string_to_array(NEW.localizacao, ',');
    lat := coords[1]::numeric;
    lng := coords[2]::numeric;
    NEW.location_geog := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
  END IF;

  -- Processar localização da cidade
  IF NEW.city_location_raw IS NOT NULL AND 
     NEW.city_location_geog IS NULL AND
     NEW.city_location_raw ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    city_coords := string_to_array(NEW.city_location_raw, ',');
    city_lat := city_coords[1]::numeric;
    city_lng := city_coords[2]::numeric;
    NEW.city_location_geog := ST_SetSRID(ST_MakePoint(city_lng, city_lat), 4326)::geography;
  END IF;

  -- Processar localização do bairro
  IF NEW.neighborhood_location_raw IS NOT NULL AND 
     NEW.neighborhood_location_geog IS NULL AND
     NEW.neighborhood_location_raw ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    neighborhood_coords := string_to_array(NEW.neighborhood_location_raw, ',');
    neighborhood_lat := neighborhood_coords[1]::numeric;
    neighborhood_lng := neighborhood_coords[2]::numeric;
    NEW.neighborhood_location_geog := ST_SetSRID(ST_MakePoint(neighborhood_lng, neighborhood_lat), 4326)::geography;
  END IF;

  RETURN NEW;
END;
$_$;


ALTER FUNCTION public.fn_update_location_geog() OWNER TO postgres;

--
-- Name: FUNCTION fn_update_location_geog(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fn_update_location_geog() IS 'Função trigger que popula automaticamente location_geog a partir do campo localizacao (formato "lat,lng") quando formatted_address é fornecido mas location_geog está vazio. Mantém compatibilidade retroativa com dados existentes.';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tb_comprador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_comprador (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    whatsapp character varying(20),
    avatar bytea,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email character varying(255)
);


ALTER TABLE public.tb_comprador OWNER TO postgres;

--
-- Name: tb_comprador_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_comprador_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_comprador_id_seq OWNER TO postgres;

--
-- Name: tb_comprador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_comprador_id_seq OWNED BY public.tb_comprador.id;


--
-- Name: tb_forma_pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_forma_pagamento (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tb_forma_pagamento OWNER TO postgres;

--
-- Name: tb_forma_pagamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_forma_pagamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_forma_pagamento_id_seq OWNER TO postgres;

--
-- Name: tb_forma_pagamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_forma_pagamento_id_seq OWNED BY public.tb_forma_pagamento.id;


--
-- Name: tb_fornecedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_fornecedor (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    whatsapp character varying(20),
    avatar bytea,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email character varying(255)
);


ALTER TABLE public.tb_fornecedor OWNER TO postgres;

--
-- Name: tb_fornecedor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_fornecedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_fornecedor_id_seq OWNER TO postgres;

--
-- Name: tb_fornecedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_fornecedor_id_seq OWNED BY public.tb_fornecedor.id;


--
-- Name: tb_fotos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_fotos (
    id integer NOT NULL,
    lote_residuo_id integer NOT NULL,
    imagem bytea NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tb_fotos OWNER TO postgres;

--
-- Name: tb_fotos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_fotos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_fotos_id_seq OWNER TO postgres;

--
-- Name: tb_fotos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_fotos_id_seq OWNED BY public.tb_fotos.id;


--
-- Name: tb_lote_forma_pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_lote_forma_pagamento (
    lote_residuo_id integer NOT NULL,
    forma_pagamento_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tb_lote_forma_pagamento OWNER TO postgres;

--
-- Name: TABLE tb_lote_forma_pagamento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tb_lote_forma_pagamento IS 'Tabela de ligação entre lotes de resíduos e formas de pagamento aceitas';


--
-- Name: COLUMN tb_lote_forma_pagamento.lote_residuo_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_lote_forma_pagamento.lote_residuo_id IS 'Identificador do lote de resíduo';


--
-- Name: COLUMN tb_lote_forma_pagamento.forma_pagamento_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_lote_forma_pagamento.forma_pagamento_id IS 'Identificador da forma de pagamento';


--
-- Name: COLUMN tb_lote_forma_pagamento.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_lote_forma_pagamento.created_at IS 'Data e hora de criação da associação';


--
-- Name: tb_lote_residuo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_lote_residuo (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    preco numeric(12,2),
    quantidade numeric(12,2) NOT NULL,
    quantidade_vendida numeric(12,2) DEFAULT 0 NOT NULL,
    localizacao character varying(255),
    tipo_id integer,
    unidade_id integer,
    fornecedor_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    location_geog public.geography(Point,4326),
    formatted_address character varying(255),
    place_id character varying(64),
    geocoding_accuracy character varying(20),
    city_name character varying(120),
    city_location_raw character varying(255),
    city_location_geog public.geography(Point,4326),
    neighborhood_name character varying(120),
    neighborhood_location_raw character varying(255),
    neighborhood_location_geog public.geography(Point,4326),
    descricao text NOT NULL,
    approx_location_geog public.geography(Point,4326),
    approx_location_raw character varying(255),
    approx_formatted_address character varying(255),
    approx_geocoding_accuracy character varying(20),
    approx_place_id character varying(64),
    approx_city_name character varying(120),
    approx_city_location_raw character varying(255),
    approx_city_location_geog public.geography(Point,4326),
    approx_neighborhood_name character varying(120),
    approx_neighborhood_location_raw character varying(255),
    approx_neighborhood_location_geog public.geography(Point,4326)
);


ALTER TABLE public.tb_lote_residuo OWNER TO postgres;

--
-- Name: tb_lote_residuo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_lote_residuo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_lote_residuo_id_seq OWNER TO postgres;

--
-- Name: tb_lote_residuo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_lote_residuo_id_seq OWNED BY public.tb_lote_residuo.id;


--
-- Name: tb_publication_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_publication_reviews (
    id integer NOT NULL,
    publication_type character varying(50) NOT NULL,
    publication_id integer,
    user_id integer,
    status character varying(20) NOT NULL,
    reason text,
    issues jsonb,
    suggestions jsonb,
    ai_model character varying(100),
    ai_response jsonb,
    reviewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_by character varying(50) DEFAULT 'ai_agent'::character varying,
    prompt_version character varying(50),
    execution_id character varying(100),
    CONSTRAINT tb_publication_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['approved'::character varying, 'needs_revision'::character varying, 'blocked'::character varying])::text[])))
);


ALTER TABLE public.tb_publication_reviews OWNER TO postgres;

--
-- Name: TABLE tb_publication_reviews; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tb_publication_reviews IS 'Registro de moderação de publicações realizada por agentes de IA';


--
-- Name: COLUMN tb_publication_reviews.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.id IS 'Identificador único da revisão';


--
-- Name: COLUMN tb_publication_reviews.publication_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.publication_type IS 'Tipo de publicação (lote_residuo, credito_carbono, etc)';


--
-- Name: COLUMN tb_publication_reviews.publication_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.publication_id IS 'ID da publicação no sistema de origem';


--
-- Name: COLUMN tb_publication_reviews.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.user_id IS 'Referência ao usuário autor da publicação';


--
-- Name: COLUMN tb_publication_reviews.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.status IS 'Resultado da análise: approved, needs_revision, blocked';


--
-- Name: COLUMN tb_publication_reviews.reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.reason IS 'Justificativa da decisão';


--
-- Name: COLUMN tb_publication_reviews.issues; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.issues IS 'Lista de problemas identificados em formato JSON';


--
-- Name: COLUMN tb_publication_reviews.suggestions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.suggestions IS 'Sugestões de correção em formato JSON';


--
-- Name: COLUMN tb_publication_reviews.ai_model; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.ai_model IS 'Modelo de IA utilizado para análise';


--
-- Name: COLUMN tb_publication_reviews.ai_response; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.ai_response IS 'Resposta completa da IA em formato JSON';


--
-- Name: COLUMN tb_publication_reviews.reviewed_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.reviewed_at IS 'Timestamp da revisão';


--
-- Name: COLUMN tb_publication_reviews.reviewed_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.reviewed_by IS 'Identificador do agente revisor';


--
-- Name: COLUMN tb_publication_reviews.prompt_version; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.prompt_version IS 'Versão do prompt de detecção de dados sensíveis usado na análise (formato: YYYY-MM-DD-vX)';


--
-- Name: COLUMN tb_publication_reviews.execution_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_publication_reviews.execution_id IS 'ID único de execução da validação (formato: exec_timestamp_random)';


--
-- Name: tb_publication_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_publication_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_publication_reviews_id_seq OWNER TO postgres;

--
-- Name: tb_publication_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_publication_reviews_id_seq OWNED BY public.tb_publication_reviews.id;


--
-- Name: tb_tipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_tipo (
    id integer NOT NULL,
    nome character varying(255) NOT NULL
);


ALTER TABLE public.tb_tipo OWNER TO postgres;

--
-- Name: tb_tipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_tipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_tipo_id_seq OWNER TO postgres;

--
-- Name: tb_tipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_tipo_id_seq OWNED BY public.tb_tipo.id;


--
-- Name: tb_transacao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_transacao (
    id integer NOT NULL,
    fornecedor_id integer NOT NULL,
    comprador_id integer NOT NULL,
    lote_residuo_id integer NOT NULL,
    quantidade numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tb_transacao OWNER TO postgres;

--
-- Name: tb_transacao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_transacao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_transacao_id_seq OWNER TO postgres;

--
-- Name: tb_transacao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_transacao_id_seq OWNED BY public.tb_transacao.id;


--
-- Name: tb_unidade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_unidade (
    id integer NOT NULL,
    nome character varying(255) NOT NULL
);


ALTER TABLE public.tb_unidade OWNER TO postgres;

--
-- Name: tb_unidade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_unidade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_unidade_id_seq OWNER TO postgres;

--
-- Name: tb_unidade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_unidade_id_seq OWNED BY public.tb_unidade.id;


--
-- Name: tb_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_user (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    google_id character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    status_ativacao character varying(20) DEFAULT 'pendente'::character varying NOT NULL,
    token_ativacao character varying(255),
    token_expires_at timestamp without time zone,
    data_ativacao timestamp without time zone,
    email_validado_em timestamp without time zone
);


ALTER TABLE public.tb_user OWNER TO postgres;

--
-- Name: tb_user_activation_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_user_activation_audit (
    id integer NOT NULL,
    user_id integer NOT NULL,
    acao character varying(50) NOT NULL,
    ip_address character varying(45),
    user_agent text,
    sucesso boolean DEFAULT true,
    mensagem text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_audit_acao_valid CHECK (((acao)::text = ANY ((ARRAY['registro'::character varying, 'reenvio'::character varying, 'ativacao'::character varying, 'expiracao'::character varying])::text[]))),
    CONSTRAINT tb_user_activation_audit_acao_check CHECK (((acao)::text = ANY ((ARRAY['registro'::character varying, 'reenvio'::character varying, 'ativacao'::character varying, 'expiracao'::character varying])::text[])))
);


ALTER TABLE public.tb_user_activation_audit OWNER TO postgres;

--
-- Name: TABLE tb_user_activation_audit; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tb_user_activation_audit IS 'Tabela de auditoria para rastrear todas as ações relacionadas ao fluxo de ativação de usuários, incluindo registros, reenvios, ativações e expirações. Essencial para conformidade LGPD e investigação de abusos.';


--
-- Name: COLUMN tb_user_activation_audit.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_audit.user_id IS 'ID do usuário relacionado à ação auditada';


--
-- Name: COLUMN tb_user_activation_audit.acao; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_audit.acao IS 'Tipo de ação: registro (criação inicial), reenvio (novo e-mail solicitado), ativacao (link clicado com sucesso), expiracao (token expirou)';


--
-- Name: COLUMN tb_user_activation_audit.ip_address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_audit.ip_address IS 'Endereço IP da requisição (formato IPv4 ou IPv6). Usado para detectar tentativas de abuso e para relatórios de segurança.';


--
-- Name: COLUMN tb_user_activation_audit.user_agent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_audit.user_agent IS 'User-Agent HTTP do navegador/cliente. Auxilia na identificação de padrões de uso e potenciais bots.';


--
-- Name: COLUMN tb_user_activation_audit.sucesso; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_audit.sucesso IS 'Indica se a ação foi bem-sucedida (true) ou falhou (false). Usado para métricas de conversão.';


--
-- Name: COLUMN tb_user_activation_audit.mensagem; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_audit.mensagem IS 'Mensagem descritiva adicional sobre a ação ou erro ocorrido. Auxilia em debugging e suporte.';


--
-- Name: COLUMN tb_user_activation_audit.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_audit.created_at IS 'Timestamp da ação auditada (UTC). Preserva ordem cronológica para análise.';


--
-- Name: tb_user_activation_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_user_activation_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_user_activation_audit_id_seq OWNER TO postgres;

--
-- Name: tb_user_activation_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_user_activation_audit_id_seq OWNED BY public.tb_user_activation_audit.id;


--
-- Name: tb_user_activation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_user_activation_logs (
    id integer NOT NULL,
    user_id integer,
    status character varying(50) NOT NULL,
    reason text,
    metadata jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tb_user_activation_logs_status_check CHECK (((status)::text = ANY ((ARRAY['pending_activation'::character varying, 'activation_confirmed'::character varying, 'activation_denied'::character varying, 'token_sent'::character varying, 'token_expired'::character varying, 'domain_rejected'::character varying, 'eligibility_rejected'::character varying, 'eligibility_approved'::character varying])::text[])))
);


ALTER TABLE public.tb_user_activation_logs OWNER TO postgres;

--
-- Name: TABLE tb_user_activation_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tb_user_activation_logs IS 'Auditoria completa de eventos de ativação de usuários incluindo validações por IA';


--
-- Name: COLUMN tb_user_activation_logs.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.id IS 'Identificador único do log';


--
-- Name: COLUMN tb_user_activation_logs.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.user_id IS 'Referência ao usuário';


--
-- Name: COLUMN tb_user_activation_logs.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.status IS 'Status do evento de ativação';


--
-- Name: COLUMN tb_user_activation_logs.reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.reason IS 'Motivo ou descrição do evento';


--
-- Name: COLUMN tb_user_activation_logs.metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.metadata IS 'Dados adicionais em formato JSON (resposta IA, dados de validação, etc)';


--
-- Name: COLUMN tb_user_activation_logs.ip_address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.ip_address IS 'Endereço IP de origem da requisição';


--
-- Name: COLUMN tb_user_activation_logs.user_agent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.user_agent IS 'User agent do navegador/cliente';


--
-- Name: COLUMN tb_user_activation_logs.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tb_user_activation_logs.created_at IS 'Timestamp de criação do registro';


--
-- Name: tb_user_activation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_user_activation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_user_activation_logs_id_seq OWNER TO postgres;

--
-- Name: tb_user_activation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_user_activation_logs_id_seq OWNED BY public.tb_user_activation_logs.id;


--
-- Name: tb_user_comprador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_user_comprador (
    user_id integer NOT NULL,
    comprador_id integer NOT NULL
);


ALTER TABLE public.tb_user_comprador OWNER TO postgres;

--
-- Name: tb_user_fornecedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_user_fornecedor (
    user_id integer NOT NULL,
    fornecedor_id integer NOT NULL
);


ALTER TABLE public.tb_user_fornecedor OWNER TO postgres;

--
-- Name: tb_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_user_id_seq OWNER TO postgres;

--
-- Name: tb_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_user_id_seq OWNED BY public.tb_user.id;


--
-- Name: vw_lotes_disponiveis; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_lotes_disponiveis AS
 SELECT l.id,
    l.titulo,
    l.preco,
    l.quantidade,
    l.quantidade_vendida,
    l.localizacao,
    l.tipo_id,
    l.unidade_id,
    l.fornecedor_id,
    l.created_at,
    l.updated_at,
    l.location_geog,
    l.formatted_address,
    l.place_id,
    l.geocoding_accuracy,
    l.city_name,
    l.city_location_raw,
    l.city_location_geog,
    l.neighborhood_name,
    l.neighborhood_location_raw,
    l.neighborhood_location_geog,
    l.descricao,
        CASE
            WHEN (t.id IS NULL) THEN true
            ELSE false
        END AS esta_disponivel
   FROM (public.tb_lote_residuo l
     LEFT JOIN public.tb_transacao t ON ((t.lote_residuo_id = l.id)))
  WHERE ((t.id IS NULL) AND (l.quantidade_vendida = (0)::numeric));


ALTER VIEW public.vw_lotes_disponiveis OWNER TO postgres;

--
-- Name: VIEW vw_lotes_disponiveis; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vw_lotes_disponiveis IS 'View que retorna apenas lotes disponíveis para compra (sem transações e com quantidade_vendida = 0)';


--
-- Name: vw_lotes_publicados; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_lotes_publicados AS
 SELECT lr.id,
    lr.titulo,
    lr.descricao,
    lr.preco,
    lr.quantidade,
    lr.quantidade_vendida,
    lr.localizacao,
    lr.location_geog,
    lr.formatted_address,
    lr.place_id,
    lr.geocoding_accuracy,
    lr.city_name,
    lr.city_location_raw,
    lr.city_location_geog,
    lr.neighborhood_name,
    lr.neighborhood_location_raw,
    lr.neighborhood_location_geog,
    lr.tipo_id,
    lr.unidade_id,
    lr.fornecedor_id,
    lr.created_at,
    lr.updated_at,
    t.nome AS tipo_nome,
    u.nome AS unidade_nome,
    f.nome AS fornecedor_nome,
    f.whatsapp AS fornecedor_whatsapp,
    f.email AS fornecedor_email,
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM public.tb_transacao tr
              WHERE (tr.lote_residuo_id = lr.id))) THEN false
            ELSE true
        END AS disponivel
   FROM (((public.tb_lote_residuo lr
     LEFT JOIN public.tb_tipo t ON ((lr.tipo_id = t.id)))
     LEFT JOIN public.tb_unidade u ON ((lr.unidade_id = u.id)))
     LEFT JOIN public.tb_fornecedor f ON ((lr.fornecedor_id = f.id)));


ALTER VIEW public.vw_lotes_publicados OWNER TO postgres;

--
-- Name: vw_users_pending_activation; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_users_pending_activation AS
 SELECT u.id,
    u.email,
    u.status_ativacao,
    u.token_ativacao,
    u.token_expires_at,
    u.created_at,
    count(uf.fornecedor_id) AS fornecedor_count,
    count(uc.comprador_id) AS comprador_count
   FROM ((public.tb_user u
     LEFT JOIN public.tb_user_fornecedor uf ON ((u.id = uf.user_id)))
     LEFT JOIN public.tb_user_comprador uc ON ((u.id = uc.user_id)))
  WHERE (((u.status_ativacao)::text = 'pendente'::text) AND (u.token_ativacao IS NULL))
  GROUP BY u.id, u.email, u.status_ativacao, u.token_ativacao, u.token_expires_at, u.created_at
 HAVING ((count(uf.fornecedor_id) = 0) AND (count(uc.comprador_id) = 0));


ALTER VIEW public.vw_users_pending_activation OWNER TO postgres;

--
-- Name: VIEW vw_users_pending_activation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vw_users_pending_activation IS 'View otimizada para consultar usuários elegíveis para ativação automática (sem vínculo com fornecedor ou comprador)';


--
-- Name: tb_comprador id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_comprador ALTER COLUMN id SET DEFAULT nextval('public.tb_comprador_id_seq'::regclass);


--
-- Name: tb_forma_pagamento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_forma_pagamento ALTER COLUMN id SET DEFAULT nextval('public.tb_forma_pagamento_id_seq'::regclass);


--
-- Name: tb_fornecedor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_fornecedor ALTER COLUMN id SET DEFAULT nextval('public.tb_fornecedor_id_seq'::regclass);


--
-- Name: tb_fotos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_fotos ALTER COLUMN id SET DEFAULT nextval('public.tb_fotos_id_seq'::regclass);


--
-- Name: tb_lote_residuo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_residuo ALTER COLUMN id SET DEFAULT nextval('public.tb_lote_residuo_id_seq'::regclass);


--
-- Name: tb_publication_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_publication_reviews ALTER COLUMN id SET DEFAULT nextval('public.tb_publication_reviews_id_seq'::regclass);


--
-- Name: tb_tipo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_tipo ALTER COLUMN id SET DEFAULT nextval('public.tb_tipo_id_seq'::regclass);


--
-- Name: tb_transacao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_transacao ALTER COLUMN id SET DEFAULT nextval('public.tb_transacao_id_seq'::regclass);


--
-- Name: tb_unidade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_unidade ALTER COLUMN id SET DEFAULT nextval('public.tb_unidade_id_seq'::regclass);


--
-- Name: tb_user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user ALTER COLUMN id SET DEFAULT nextval('public.tb_user_id_seq'::regclass);


--
-- Name: tb_user_activation_audit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_activation_audit ALTER COLUMN id SET DEFAULT nextval('public.tb_user_activation_audit_id_seq'::regclass);


--
-- Name: tb_user_activation_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_activation_logs ALTER COLUMN id SET DEFAULT nextval('public.tb_user_activation_logs_id_seq'::regclass);


--
-- Name: tb_user_comprador PK_0640a073fb3608f821162961a5c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_comprador
    ADD CONSTRAINT "PK_0640a073fb3608f821162961a5c" PRIMARY KEY (user_id, comprador_id);


--
-- Name: tb_user_fornecedor PK_bfec844bbd8f3f241c86e3ec42d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_fornecedor
    ADD CONSTRAINT "PK_bfec844bbd8f3f241c86e3ec42d" PRIMARY KEY (user_id, fornecedor_id);


--
-- Name: tb_comprador tb_comprador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_comprador
    ADD CONSTRAINT tb_comprador_pkey PRIMARY KEY (id);


--
-- Name: tb_forma_pagamento tb_forma_pagamento_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_forma_pagamento
    ADD CONSTRAINT tb_forma_pagamento_nome_key UNIQUE (nome);


--
-- Name: tb_forma_pagamento tb_forma_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_forma_pagamento
    ADD CONSTRAINT tb_forma_pagamento_pkey PRIMARY KEY (id);


--
-- Name: tb_fornecedor tb_fornecedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_fornecedor
    ADD CONSTRAINT tb_fornecedor_pkey PRIMARY KEY (id);


--
-- Name: tb_fotos tb_fotos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_fotos
    ADD CONSTRAINT tb_fotos_pkey PRIMARY KEY (id);


--
-- Name: tb_lote_forma_pagamento tb_lote_forma_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_forma_pagamento
    ADD CONSTRAINT tb_lote_forma_pagamento_pkey PRIMARY KEY (lote_residuo_id, forma_pagamento_id);


--
-- Name: tb_lote_residuo tb_lote_residuo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_residuo
    ADD CONSTRAINT tb_lote_residuo_pkey PRIMARY KEY (id);


--
-- Name: tb_publication_reviews tb_publication_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_publication_reviews
    ADD CONSTRAINT tb_publication_reviews_pkey PRIMARY KEY (id);


--
-- Name: tb_tipo tb_tipo_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_tipo
    ADD CONSTRAINT tb_tipo_nome_key UNIQUE (nome);


--
-- Name: tb_tipo tb_tipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_tipo
    ADD CONSTRAINT tb_tipo_pkey PRIMARY KEY (id);


--
-- Name: tb_transacao tb_transacao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_transacao
    ADD CONSTRAINT tb_transacao_pkey PRIMARY KEY (id);


--
-- Name: tb_unidade tb_unidade_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_unidade
    ADD CONSTRAINT tb_unidade_nome_key UNIQUE (nome);


--
-- Name: tb_unidade tb_unidade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_unidade
    ADD CONSTRAINT tb_unidade_pkey PRIMARY KEY (id);


--
-- Name: tb_user_activation_audit tb_user_activation_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_activation_audit
    ADD CONSTRAINT tb_user_activation_audit_pkey PRIMARY KEY (id);


--
-- Name: tb_user_activation_logs tb_user_activation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_activation_logs
    ADD CONSTRAINT tb_user_activation_logs_pkey PRIMARY KEY (id);


--
-- Name: tb_user tb_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user
    ADD CONSTRAINT tb_user_email_key UNIQUE (email);


--
-- Name: tb_user tb_user_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user
    ADD CONSTRAINT tb_user_google_id_key UNIQUE (google_id);


--
-- Name: tb_user tb_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user
    ADD CONSTRAINT tb_user_pkey PRIMARY KEY (id);


--
-- Name: IDX_2a1e4da629f22fb484b2987522; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2a1e4da629f22fb484b2987522" ON public.tb_user_fornecedor USING btree (user_id);


--
-- Name: IDX_5c7ef716ecb94dfaecf66fbf77; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5c7ef716ecb94dfaecf66fbf77" ON public.tb_user_comprador USING btree (user_id);


--
-- Name: IDX_6b0faf93ca5a71069b71e5bdde; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6b0faf93ca5a71069b71e5bdde" ON public.tb_user_fornecedor USING btree (fornecedor_id);


--
-- Name: IDX_cf90dc198c761cda652477743d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cf90dc198c761cda652477743d" ON public.tb_user_comprador USING btree (comprador_id);


--
-- Name: idx_activation_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activation_logs_created_at ON public.tb_user_activation_logs USING btree (created_at);


--
-- Name: idx_activation_logs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activation_logs_status ON public.tb_user_activation_logs USING btree (status);


--
-- Name: idx_activation_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activation_logs_user_id ON public.tb_user_activation_logs USING btree (user_id);


--
-- Name: idx_audit_acao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_acao ON public.tb_user_activation_audit USING btree (acao);


--
-- Name: idx_audit_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_created_at ON public.tb_user_activation_audit USING btree (created_at);


--
-- Name: idx_audit_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_user_id ON public.tb_user_activation_audit USING btree (user_id);


--
-- Name: idx_lote_forma_pagamento_forma; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lote_forma_pagamento_forma ON public.tb_lote_forma_pagamento USING btree (forma_pagamento_id);


--
-- Name: idx_lote_forma_pagamento_lote; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lote_forma_pagamento_lote ON public.tb_lote_forma_pagamento USING btree (lote_residuo_id);


--
-- Name: idx_publication_reviews_execution_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_publication_reviews_execution_id ON public.tb_publication_reviews USING btree (execution_id);


--
-- Name: idx_publication_reviews_prompt_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_publication_reviews_prompt_version ON public.tb_publication_reviews USING btree (prompt_version);


--
-- Name: idx_publication_reviews_reviewed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_publication_reviews_reviewed_at ON public.tb_publication_reviews USING btree (reviewed_at);


--
-- Name: idx_publication_reviews_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_publication_reviews_status ON public.tb_publication_reviews USING btree (status);


--
-- Name: idx_publication_reviews_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_publication_reviews_type_id ON public.tb_publication_reviews USING btree (publication_type, publication_id);


--
-- Name: idx_publication_reviews_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_publication_reviews_user_id ON public.tb_publication_reviews USING btree (user_id);


--
-- Name: tb_lote_residuo trg_update_location_geog; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_location_geog BEFORE INSERT OR UPDATE ON public.tb_lote_residuo FOR EACH ROW EXECUTE FUNCTION public.fn_update_location_geog();


--
-- Name: tb_transacao FK_0861f48bc28a47ea25140a46a16; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_transacao
    ADD CONSTRAINT "FK_0861f48bc28a47ea25140a46a16" FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedor(id) ON DELETE CASCADE;


--
-- Name: tb_lote_residuo FK_15a6fba588013a2c13670aff69d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_residuo
    ADD CONSTRAINT "FK_15a6fba588013a2c13670aff69d" FOREIGN KEY (unidade_id) REFERENCES public.tb_unidade(id) ON DELETE SET NULL;


--
-- Name: tb_user_fornecedor FK_2a1e4da629f22fb484b29875229; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_fornecedor
    ADD CONSTRAINT "FK_2a1e4da629f22fb484b29875229" FOREIGN KEY (user_id) REFERENCES public.tb_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tb_transacao FK_36bccddb8133518fc2a348da1ac; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_transacao
    ADD CONSTRAINT "FK_36bccddb8133518fc2a348da1ac" FOREIGN KEY (comprador_id) REFERENCES public.tb_comprador(id) ON DELETE CASCADE;


--
-- Name: tb_user_comprador FK_5c7ef716ecb94dfaecf66fbf77c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_comprador
    ADD CONSTRAINT "FK_5c7ef716ecb94dfaecf66fbf77c" FOREIGN KEY (user_id) REFERENCES public.tb_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tb_user_fornecedor FK_6b0faf93ca5a71069b71e5bdde8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_fornecedor
    ADD CONSTRAINT "FK_6b0faf93ca5a71069b71e5bdde8" FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedor(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tb_lote_residuo FK_8aac6ecad2b1a259d2f95bc2206; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_residuo
    ADD CONSTRAINT "FK_8aac6ecad2b1a259d2f95bc2206" FOREIGN KEY (tipo_id) REFERENCES public.tb_tipo(id) ON DELETE SET NULL;


--
-- Name: tb_transacao FK_c3040b8ffb69a2224865a0c428d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_transacao
    ADD CONSTRAINT "FK_c3040b8ffb69a2224865a0c428d" FOREIGN KEY (lote_residuo_id) REFERENCES public.tb_lote_residuo(id) ON DELETE CASCADE;


--
-- Name: tb_user_comprador FK_cf90dc198c761cda652477743d5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_comprador
    ADD CONSTRAINT "FK_cf90dc198c761cda652477743d5" FOREIGN KEY (comprador_id) REFERENCES public.tb_comprador(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tb_lote_residuo FK_d8d22a897f3feb679d5c9183eed; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_residuo
    ADD CONSTRAINT "FK_d8d22a897f3feb679d5c9183eed" FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedor(id);


--
-- Name: tb_fotos FK_ed181c02cbe588c46d83dedfb04; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_fotos
    ADD CONSTRAINT "FK_ed181c02cbe588c46d83dedfb04" FOREIGN KEY (lote_residuo_id) REFERENCES public.tb_lote_residuo(id) ON DELETE CASCADE;


--
-- Name: tb_lote_forma_pagamento tb_lote_forma_pagamento_forma_pagamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_forma_pagamento
    ADD CONSTRAINT tb_lote_forma_pagamento_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_forma_pagamento(id) ON DELETE CASCADE;


--
-- Name: tb_lote_forma_pagamento tb_lote_forma_pagamento_lote_residuo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote_forma_pagamento
    ADD CONSTRAINT tb_lote_forma_pagamento_lote_residuo_id_fkey FOREIGN KEY (lote_residuo_id) REFERENCES public.tb_lote_residuo(id) ON DELETE CASCADE;


--
-- Name: tb_publication_reviews tb_publication_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_publication_reviews
    ADD CONSTRAINT tb_publication_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.tb_user(id) ON DELETE SET NULL;


--
-- Name: tb_user_activation_audit tb_user_activation_audit_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_activation_audit
    ADD CONSTRAINT tb_user_activation_audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.tb_user(id) ON DELETE CASCADE;


--
-- Name: tb_user_activation_logs tb_user_activation_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_user_activation_logs
    ADD CONSTRAINT tb_user_activation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.tb_user(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

