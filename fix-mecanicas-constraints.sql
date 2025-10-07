-- Script para corrigir as restrições de chave estrangeira da tabela mecanicas
-- Este script remove as restrições que impedem a inserção de IDs de publicadores

-- Remover todas as restrições de chave estrangeira da tabela mecanicas
ALTER TABLE mecanicas DROP CONSTRAINT IF EXISTS mecanicas_indicador_entrada_id_fkey;
ALTER TABLE mecanicas DROP CONSTRAINT IF EXISTS mecanicas_indicador_auditorio_id_fkey;
ALTER TABLE mecanicas DROP CONSTRAINT IF EXISTS mecanicas_audio_video_id_fkey;
ALTER TABLE mecanicas DROP CONSTRAINT IF EXISTS mecanicas_volante_id_fkey;
ALTER TABLE mecanicas DROP CONSTRAINT IF EXISTS mecanicas_palco_id_fkey;
ALTER TABLE mecanicas DROP CONSTRAINT IF EXISTS mecanicas_leitor_sentinela_id_fkey;
ALTER TABLE mecanicas DROP CONSTRAINT IF EXISTS mecanicas_presidente_id_fkey;

-- Adicionar comentários às colunas para documentar que podem referenciar users ou publicadores
COMMENT ON COLUMN mecanicas.indicador_entrada_id IS 'ID do usuário ou publicador responsável pela entrada (pode ser UUID de users ou pub_UUID de publicadores)';
COMMENT ON COLUMN mecanicas.indicador_auditorio_id IS 'ID do usuário ou publicador responsável pelo auditório (pode ser UUID de users ou pub_UUID de publicadores)';
COMMENT ON COLUMN mecanicas.audio_video_id IS 'ID do usuário ou publicador responsável pelo áudio e vídeo (pode ser UUID de users ou pub_UUID de publicadores)';
COMMENT ON COLUMN mecanicas.volante_id IS 'ID do usuário ou publicador responsável pelo volante (pode ser UUID de users ou pub_UUID de publicadores)';
COMMENT ON COLUMN mecanicas.palco_id IS 'ID do usuário ou publicador responsável pelo palco (pode ser UUID de users ou pub_UUID de publicadores)';
COMMENT ON COLUMN mecanicas.leitor_sentinela_id IS 'ID do usuário ou publicador responsável pela leitura da sentinela (pode ser UUID de users ou pub_UUID de publicadores)';
COMMENT ON COLUMN mecanicas.presidente_id IS 'ID do usuário ou publicador responsável pela presidência (pode ser UUID de users ou pub_UUID de publicadores)';

-- Criar índices para melhorar a performance das consultas (opcional)
CREATE INDEX IF NOT EXISTS idx_mecanicas_indicador_entrada_id ON mecanicas(indicador_entrada_id);
CREATE INDEX IF NOT EXISTS idx_mecanicas_indicador_auditorio_id ON mecanicas(indicador_auditorio_id);
CREATE INDEX IF NOT EXISTS idx_mecanicas_audio_video_id ON mecanicas(audio_video_id);
CREATE INDEX IF NOT EXISTS idx_mecanicas_volante_id ON mecanicas(volante_id);
CREATE INDEX IF NOT EXISTS idx_mecanicas_palco_id ON mecanicas(palco_id);
CREATE INDEX IF NOT EXISTS idx_mecanicas_leitor_sentinela_id ON mecanicas(leitor_sentinela_id);
CREATE INDEX IF NOT EXISTS idx_mecanicas_presidente_id ON mecanicas(presidente_id);

-- Comentário geral sobre a tabela
COMMENT ON TABLE mecanicas IS 'Tabela de designações mecânicas que pode referenciar tanto usuários (users) quanto publicadores (publicadores)';