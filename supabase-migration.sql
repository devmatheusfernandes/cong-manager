-- Script para verificar e adicionar colunas faltantes na tabela congregacoes

-- 1. Verificar estrutura atual da tabela
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

-- 2. Adicionar coluna email se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'congregacoes' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE congregacoes ADD COLUMN email TEXT;
        RAISE NOTICE 'Coluna email adicionada';
    ELSE
        RAISE NOTICE 'Coluna email já existe';
    END IF;
END $$;

-- 3. Adicionar coluna telefone se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'congregacoes' 
        AND column_name = 'telefone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE congregacoes ADD COLUMN telefone TEXT;
        RAISE NOTICE 'Coluna telefone adicionada';
    ELSE
        RAISE NOTICE 'Coluna telefone já existe';
    END IF;
END $$;

-- 4. Adicionar coluna observacoes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'congregacoes' 
        AND column_name = 'observacoes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE congregacoes ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada';
    ELSE
        RAISE NOTICE 'Coluna observacoes já existe';
    END IF;
END $$;

-- 5. Adicionar colunas de horários das reuniões se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'congregacoes' 
        AND column_name = 'horario_reuniao_meio_semana'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE congregacoes ADD COLUMN horario_reuniao_meio_semana TEXT;
        RAISE NOTICE 'Coluna horario_reuniao_meio_semana adicionada';
    ELSE
        RAISE NOTICE 'Coluna horario_reuniao_meio_semana já existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'congregacoes' 
        AND column_name = 'horario_reuniao_fim_semana'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE congregacoes ADD COLUMN horario_reuniao_fim_semana TEXT;
        RAISE NOTICE 'Coluna horario_reuniao_fim_semana adicionada';
    ELSE
        RAISE NOTICE 'Coluna horario_reuniao_fim_semana já existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'congregacoes' 
        AND column_name = 'dia_reuniao_meio_semana'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE congregacoes ADD COLUMN dia_reuniao_meio_semana TEXT;
        RAISE NOTICE 'Coluna dia_reuniao_meio_semana adicionada';
    ELSE
        RAISE NOTICE 'Coluna dia_reuniao_meio_semana já existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'congregacoes' 
        AND column_name = 'dia_reuniao_fim_semana'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE congregacoes ADD COLUMN dia_reuniao_fim_semana TEXT;
        RAISE NOTICE 'Coluna dia_reuniao_fim_semana adicionada';
    ELSE
        RAISE NOTICE 'Coluna dia_reuniao_fim_semana já existe';
    END IF;
END $$;

-- 6. Verificar estrutura final da tabela
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

-- 7. Mostrar dados de exemplo
SELECT * FROM congregacoes LIMIT 1;