-- app/db/init/migrations/modular/ddl/000_extensions.sql

-- Habilitar extensão PostGIS para suporte a tipos geoespaciais
CREATE EXTENSION IF NOT EXISTS postgis;

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';
