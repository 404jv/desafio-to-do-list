-- Script SQL para criar a tabela users no Supabase
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) - opcional para modo público
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura e escrita públicas (se necessário)
-- CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);

