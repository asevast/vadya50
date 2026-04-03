-- Create the 'postgres' role that all Supabase services expect
-- This must run before 001_initial.sql (alphabetical order)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'Gangneung!26';
  END IF;
END
$$;

-- Create the 'anon' and 'authenticated' roles expected by Supabase
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END
$$;

-- Create schemas expected by Supabase services
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

-- Create Ecto-compatible schema_migrations table for realtime
-- Ecto expects: version (bigint) + inserted_at (timestamp)
CREATE TABLE IF NOT EXISTS realtime.schema_migrations (
  version BIGINT PRIMARY KEY,
  inserted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Grant necessary permissions
GRANT anon TO authenticated;
GRANT authenticated TO service_role;
GRANT service_role TO supabase_admin;
GRANT service_role TO postgres;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;
