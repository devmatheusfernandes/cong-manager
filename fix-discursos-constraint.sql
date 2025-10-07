-- Script para corrigir a restrição de chave estrangeira na tabela discursos
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a restrição de chave estrangeira existente
ALTER TABLE discursos 
DROP CONSTRAINT IF EXISTS discursos_orador_id_fkey;

-- 2. Adicionar comentário explicativo na coluna
COMMENT ON COLUMN discursos.orador_id IS 'UUID que pode referenciar oradores ou publicadores';

-- 3. Criar índice para melhor performance (opcional)
CREATE INDEX IF NOT EXISTS idx_discursos_orador_id ON discursos(orador_id);

-- Verificar a estrutura da tabela após as mudanças
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'discursos' 
-- ORDER BY ordinal_position;