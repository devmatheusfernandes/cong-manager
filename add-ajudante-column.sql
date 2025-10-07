-- Script para adicionar a coluna ajudante_id na tabela grupos
-- Execute este script no SQL Editor do Supabase

-- Adicionar a coluna ajudante_id
ALTER TABLE grupos 
ADD COLUMN IF NOT EXISTS ajudante_id UUID REFERENCES publicadores(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_grupos_ajudante_id ON grupos(ajudante_id);

-- Adicionar comentário
COMMENT ON COLUMN grupos.ajudante_id IS 'ID do publicador que atua como ajudante do grupo (opcional)';

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'grupos' 
ORDER BY ordinal_position;