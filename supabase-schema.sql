-- Schema SQL para Supabase - Tabelas Faltantes
-- Execute este script no SQL Editor do Supabase para criar as tabelas que estão faltando

-- Função para atualizar updated_at automaticamente (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de congregações (faltando)
CREATE TABLE IF NOT EXISTS congregacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de grupos (faltando - necessária para a aplicação)
CREATE TABLE IF NOT EXISTS grupos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    congregacao_id UUID NOT NULL REFERENCES congregacoes(id),
    nome TEXT NOT NULL,
    superintendente_id UUID REFERENCES publicadores(id),
    servo_id UUID REFERENCES publicadores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento grupo-publicadores (faltando)
CREATE TABLE IF NOT EXISTS grupo_publicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo_id UUID NOT NULL REFERENCES grupos(id),
    publicador_id UUID NOT NULL REFERENCES publicadores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(grupo_id, publicador_id)
);

-- Atualizar tabela publicadores para incluir congregacao_id como UUID
-- (Assumindo que você quer manter consistência com UUIDs)
ALTER TABLE publicadores 
ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES congregacoes(id);

-- Tabela de mecânicas (se não existir ainda)
CREATE TABLE IF NOT EXISTS mecanicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    tipo_reuniao TEXT NOT NULL CHECK (tipo_reuniao = ANY (ARRAY['meio_semana'::text, 'fim_semana'::text])),
    indicador_entrada_id TEXT REFERENCES users(id),
    indicador_auditorio_id TEXT REFERENCES users(id),
    audio_video_id TEXT REFERENCES users(id),
    volante_id TEXT REFERENCES users(id),
    palco_id TEXT REFERENCES users(id),
    leitor_sentinela_id TEXT REFERENCES users(id),
    presidente_id TEXT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nota: As tabelas users, user_permissions, publicadores, oradores, discursos, 
-- escala_limpeza e mecanicas já existem no seu banco de dados.
-- Este script criará apenas as tabelas que estão faltando.

-- Índices para melhor performance (apenas para novas tabelas)
CREATE INDEX IF NOT EXISTS idx_publicadores_congregacao_id ON publicadores(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_grupos_congregacao_id ON grupos(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_grupos_superintendente_id ON grupos(superintendente_id);
CREATE INDEX IF NOT EXISTS idx_grupos_servo_id ON grupos(servo_id);
CREATE INDEX IF NOT EXISTS idx_grupo_publicadores_grupo_id ON grupo_publicadores(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupo_publicadores_publicador_id ON grupo_publicadores(publicador_id);

-- Tabela de territórios
CREATE TABLE IF NOT EXISTS territorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    congregacao_id UUID NOT NULL REFERENCES congregacoes(id),
    nome TEXT NOT NULL,
    coordenadas JSONB, -- Para armazenar GeoJSON
    imagem_url TEXT,
    cidade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de designações de territórios
CREATE TABLE IF NOT EXISTS designacoes_territorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    territorio_id UUID NOT NULL REFERENCES territorios(id),
    publicador_id UUID NOT NULL REFERENCES publicadores(id),
    data_inicio DATE NOT NULL,
    data_fim DATE, -- Data de devolução
    observacoes TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status = ANY (ARRAY['ativo'::text, 'finalizado'::text, 'cancelado'::text])),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_territorios_updated_at 
    BEFORE UPDATE ON territorios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designacoes_territorio_updated_at 
    BEFORE UPDATE ON designacoes_territorio 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_territorios_congregacao_id ON territorios(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_territorio_territorio_id ON designacoes_territorio(territorio_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_territorio_publicador_id ON designacoes_territorio(publicador_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_territorio_status ON designacoes_territorio(status);
CREATE INDEX IF NOT EXISTS idx_designacoes_territorio_data_inicio ON designacoes_territorio(data_inicio);

-- Dados iniciais (opcional)
-- Insere uma congregação padrão se não existir
INSERT INTO congregacoes (nome, endereco) 
SELECT 'Congregação Padrão', 'Endereço da Congregação'
WHERE NOT EXISTS (SELECT 1 FROM congregacoes LIMIT 1);

-- Insere permissões para usuários admin existentes se necessário
INSERT INTO user_permissions (user_id, permission) 
SELECT id, 'edit_all'
FROM users 
WHERE role = 'admin' 
AND NOT EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = users.id AND permission = 'edit_all'
);