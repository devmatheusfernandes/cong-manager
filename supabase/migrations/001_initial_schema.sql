-- Criação das tabelas principais para o Cong Manager

-- Tabela de congregações
CREATE TABLE congregacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_unico VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários (estende auth.users do Supabase)
CREATE TABLE usuarios (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    congregacao_id UUID REFERENCES congregacoes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'membro' CHECK (role IN ('admin', 'anciao', 'servo_ministerial', 'pioneiro_regular', 'pioneiro_auxiliar', 'membro')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_congregacoes_numero_unico ON congregacoes(numero_unico);
CREATE INDEX idx_usuarios_congregacao_id ON usuarios(congregacao_id);
CREATE INDEX idx_usuarios_role ON usuarios(role);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_congregacoes_updated_at 
    BEFORE UPDATE ON congregacoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE congregacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para congregacoes
CREATE POLICY "Usuários podem ver sua própria congregação" ON congregacoes
    FOR SELECT USING (
        id IN (
            SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins podem inserir congregações" ON congregacoes
    FOR INSERT WITH CHECK (true); -- Será refinado com lógica de negócio

CREATE POLICY "Admins podem atualizar sua congregação" ON congregacoes
    FOR UPDATE USING (
        id IN (
            SELECT congregacao_id FROM usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para usuarios
CREATE POLICY "Usuários podem ver seu próprio perfil" ON usuarios
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON usuarios
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Permitir inserção durante signup" ON usuarios
    FOR INSERT WITH CHECK (true); -- Será refinado após implementação completa

-- Função para gerar número único da congregação
CREATE OR REPLACE FUNCTION gerar_numero_congregacao()
RETURNS VARCHAR(20) AS $$
DECLARE
    novo_numero VARCHAR(20);
    existe BOOLEAN;
BEGIN
    LOOP
        -- Gera um número de 6 dígitos
        novo_numero := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Verifica se já existe
        SELECT EXISTS(SELECT 1 FROM congregacoes WHERE numero_unico = novo_numero) INTO existe;
        
        -- Se não existe, retorna o número
        IF NOT existe THEN
            RETURN novo_numero;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para criar congregação com número único
CREATE OR REPLACE FUNCTION criar_congregacao_com_admin(
    p_nome VARCHAR(255),
    p_cidade VARCHAR(255),
    p_user_id UUID,
    p_nome_admin VARCHAR(255),
    p_telefone VARCHAR(20) DEFAULT NULL
)
RETURNS TABLE(congregacao_id UUID, numero_unico VARCHAR(20)) AS $$
DECLARE
    v_congregacao_id UUID;
    v_numero_unico VARCHAR(20);
BEGIN
    -- Gera número único
    v_numero_unico := gerar_numero_congregacao();
    
    -- Cria a congregação
    INSERT INTO congregacoes (nome, cidade, numero_unico)
    VALUES (p_nome, p_cidade, v_numero_unico)
    RETURNING id INTO v_congregacao_id;
    
    -- Cria o usuário admin
    INSERT INTO usuarios (id, congregacao_id, nome, telefone, role)
    VALUES (p_user_id, v_congregacao_id, p_nome_admin, p_telefone, 'admin');
    
    RETURN QUERY SELECT v_congregacao_id, v_numero_unico;
END;
$$ LANGUAGE plpgsql;