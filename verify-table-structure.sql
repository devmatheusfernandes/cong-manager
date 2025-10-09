-- Script para verificar a estrutura atual da tabela congregacoes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'congregacoes' 
    AND table_schema = 'public'
ORDER BY 
    ordinal_position;

-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'congregacoes'
) as table_exists;

-- Mostrar dados de exemplo (se existir)
SELECT * FROM congregacoes LIMIT 1;