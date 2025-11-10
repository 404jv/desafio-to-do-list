-- Script SQL para criar a tabela tasks no Supabase
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries by user_email
CREATE INDEX IF NOT EXISTS idx_tasks_user_email ON public.tasks(user_email);

-- Habilitar Row Level Security (RLS) - opcional para modo público
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura e escrita públicas (se necessário)
-- CREATE POLICY "Allow public read access" ON tasks FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON tasks FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update access" ON tasks FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete access" ON tasks FOR DELETE USING (true);

