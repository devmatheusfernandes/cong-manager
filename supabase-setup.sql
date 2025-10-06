-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de permissões dos usuários
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission)
);

-- Inserir usuários fixos
INSERT INTO users (id, username, password, role) VALUES
  ('admin', 'Administrador', 'admin', 'admin'),
  ('carrinho', 'Carrinho', 'carrinho', 'carrinho'),
  ('nvc', 'Vida e Ministério', 'nvc', 'nvc'),
  ('pregacao', 'Pregação', 'pregacao', 'pregacao'),
  ('mecanicas', 'Mecânicas', 'mecanicas', 'mecanicas'),
  ('oradores', 'Oradores', 'oradores', 'oradores'),
  ('limpeza', 'Limpeza', 'limpeza', 'limpeza')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Inserir permissões para admin
INSERT INTO user_permissions (user_id, permission) VALUES
  ('admin', 'view_all'),
  ('admin', 'edit_all')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Inserir permissões para carrinho
INSERT INTO user_permissions (user_id, permission) VALUES
  ('carrinho', 'view_carrinho'),
  ('carrinho', 'edit_carrinho'),
  ('carrinho', 'view_grupos'),
  ('carrinho', 'view_pregacao')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Inserir permissões para nvc
INSERT INTO user_permissions (user_id, permission) VALUES
  ('nvc', 'view_nvc'),
  ('nvc', 'edit_nvc'),
  ('nvc', 'view_publicadores')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Inserir permissões para pregacao
INSERT INTO user_permissions (user_id, permission) VALUES
  ('pregacao', 'view_pregacao'),
  ('pregacao', 'edit_pregacao'),
  ('pregacao', 'view_grupos'),
  ('pregacao', 'edit_grupos'),
  ('pregacao', 'view_publicadores')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Inserir permissões para mecanicas
INSERT INTO user_permissions (user_id, permission) VALUES
  ('mecanicas', 'view_mecanicas'),
  ('mecanicas', 'edit_mecanicas'),
  ('mecanicas', 'view_publicadores')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Inserir permissões para oradores
INSERT INTO user_permissions (user_id, permission) VALUES
  ('oradores', 'view_discursos'),
  ('oradores', 'edit_discursos'),
  ('oradores', 'view_publicadores')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Inserir permissões para limpeza
INSERT INTO user_permissions (user_id, permission) VALUES
  ('limpeza', 'view_limpeza'),
  ('limpeza', 'edit_limpeza'),
  ('limpeza', 'view_grupos'),
  ('limpeza', 'view_publicadores')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at na tabela users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela de oradores
CREATE TABLE IF NOT EXISTS oradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  congregacao_origem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de discursos
CREATE TABLE IF NOT EXISTS discursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orador_id UUID NOT NULL REFERENCES oradores(id) ON DELETE CASCADE,
  tema TEXT NOT NULL,
  data DATE NOT NULL,
  cantico TEXT,
  hospitalidade_id TEXT,
  tem_imagem BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_discursos_data ON discursos(data);
CREATE INDEX IF NOT EXISTS idx_discursos_orador_id ON discursos(orador_id);
CREATE INDEX IF NOT EXISTS idx_oradores_nome ON oradores(nome);

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE discursos ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas (ajustar conforme necessário)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can view all permissions" ON user_permissions FOR SELECT USING (true);
CREATE POLICY "Users can view all oradores" ON oradores FOR SELECT USING (true);
CREATE POLICY "Users can view all discursos" ON discursos FOR SELECT USING (true);
CREATE POLICY "Users can insert oradores" ON oradores FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert discursos" ON discursos FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update oradores" ON oradores FOR UPDATE USING (true);
CREATE POLICY "Users can update discursos" ON discursos FOR UPDATE USING (true);
CREATE POLICY "Users can delete oradores" ON oradores FOR DELETE USING (true);
CREATE POLICY "Users can delete discursos" ON discursos FOR DELETE USING (true);