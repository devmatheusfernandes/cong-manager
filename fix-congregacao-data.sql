-- Script para inserir a congregação com o ID específico usado na aplicação
-- Execute este script no SQL Editor do Supabase

-- Inserir a congregação com o ID específico se não existir
INSERT INTO congregacoes (id, nome, endereco) 
VALUES ('660e8400-e29b-41d4-a716-446655440001', 'Congregação Central', 'São Paulo, SP')
ON CONFLICT (id) DO NOTHING;

-- Verificar se a congregação foi inserida
SELECT id, nome, endereco FROM congregacoes WHERE id = '660e8400-e29b-41d4-a716-446655440001';