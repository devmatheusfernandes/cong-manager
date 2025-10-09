-- Script para alterar a tabela discursos no Supabase
-- Remover a coluna hospitalidade_id e adicionar hospitalidade como TEXT

-- 1. Remover a coluna hospitalidade_id (se existir)
ALTER TABLE discursos DROP COLUMN IF EXISTS hospitalidade_id;

-- 2. Adicionar a coluna hospitalidade como TEXT
ALTER TABLE discursos ADD COLUMN IF NOT EXISTS hospitalidade TEXT;

-- 3. Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'discursos' 
ORDER BY ordinal_position;