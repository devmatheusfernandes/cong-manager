import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      congregacoes: {
        Row: {
          id: string;
          nome: string;
          endereco: string | null;
          telefone: string | null;
          email: string | null;
          observacoes: string | null;
          horario_reuniao_meio_semana: string | null;
          horario_reuniao_fim_semana: string | null;
          dia_reuniao_meio_semana: string | null;
          dia_reuniao_fim_semana: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          endereco?: string | null;
          telefone?: string | null;
          email?: string | null;
          observacoes?: string | null;
          horario_reuniao_meio_semana?: string | null;
          horario_reuniao_fim_semana?: string | null;
          dia_reuniao_meio_semana?: string | null;
          dia_reuniao_fim_semana?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          endereco?: string | null;
          telefone?: string | null;
          email?: string | null;
          observacoes?: string | null;
          horario_reuniao_meio_semana?: string | null;
          horario_reuniao_fim_semana?: string | null;
          dia_reuniao_meio_semana?: string | null;
          dia_reuniao_fim_semana?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          password: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          permission: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          permission: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          permission?: string
          created_at?: string
        }
      }
      grupos: {
        Row: {
          id: string
          congregacao_id: string
          nome: string
          superintendente_id: string | null
          servo_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          congregacao_id: string
          nome: string
          superintendente_id?: string | null
          servo_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          congregacao_id?: string
          nome?: string
          superintendente_id?: string | null
          servo_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      grupo_publicadores: {
        Row: {
          id: string
          grupo_id: string
          publicador_id: string
          created_at: string
        }
        Insert: {
          id?: string
          grupo_id: string
          publicador_id: string
          created_at?: string
        }
        Update: {
          id?: string
          grupo_id?: string
          publicador_id?: string
          created_at?: string
        }
      }
      publicadores: {
        Row: {
          id: string
          congregacao_id: string
          nome: string
          telefone: string | null
          email: string | null
          privilegio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          congregacao_id: string
          nome: string
          telefone?: string | null
          email?: string | null
          privilegio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          congregacao_id?: string
          nome?: string
          telefone?: string | null
          email?: string | null
          privilegio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mecanicas: {
        Row: {
          id: string
          data: string
          tipo_reuniao: string
          indicador_entrada_id: string | null
          indicador_auditorio_id: string | null
          audio_video_id: string | null
          volante_id: string | null
          palco_id: string | null
          leitor_sentinela_id: string | null
          presidente_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          data: string
          tipo_reuniao: string
          indicador_entrada_id?: string | null
          indicador_auditorio_id?: string | null
          audio_video_id?: string | null
          volante_id?: string | null
          palco_id?: string | null
          leitor_sentinela_id?: string | null
          presidente_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          data?: string
          tipo_reuniao?: string
          indicador_entrada_id?: string | null
          indicador_auditorio_id?: string | null
          audio_video_id?: string | null
          volante_id?: string | null
          palco_id?: string | null
          leitor_sentinela_id?: string | null
          presidente_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      reunioes_nvc: {
        Row: {
          id: string
          congregacao_id: string
          periodo: string
          leitura_biblica: string | null
          presidente_id: string | null
          oracao_inicial_id: string | null
          oracao_final_id: string | null
          cantico_inicial: string | null
          cantico_intermediario: string | null
          cantico_final: string | null
          comentarios_iniciais: string | null
          comentarios_finais: string | null
          tesouros_titulo: string | null
          tesouros_duracao: string | null
          tesouros_responsavel_id: string | null
          joias_texto: string | null
          joias_pergunta: string | null
          joias_referencia: string | null
          joias_duracao: string | null
          joias_responsavel_id: string | null
          leitura_biblica_texto: string | null
          leitura_biblica_duracao: string | null
          leitura_biblica_responsavel_id: string | null
          evento_especial: string | null
          semana_visita_superintendente: boolean
          dia_terca: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          congregacao_id: string
          periodo: string
          leitura_biblica?: string | null
          presidente_id?: string | null
          oracao_inicial_id?: string | null
          oracao_final_id?: string | null
          cantico_inicial?: string | null
          cantico_intermediario?: string | null
          cantico_final?: string | null
          comentarios_iniciais?: string | null
          comentarios_finais?: string | null
          tesouros_titulo?: string | null
          tesouros_duracao?: string | null
          tesouros_responsavel_id?: string | null
          joias_texto?: string | null
          joias_pergunta?: string | null
          joias_referencia?: string | null
          joias_duracao?: string | null
          joias_responsavel_id?: string | null
          leitura_biblica_texto?: string | null
          leitura_biblica_duracao?: string | null
          leitura_biblica_responsavel_id?: string | null
          evento_especial?: string | null
          semana_visita_superintendente?: boolean
          dia_terca?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          congregacao_id?: string
          periodo?: string
          leitura_biblica?: string | null
          presidente_id?: string | null
          oracao_inicial_id?: string | null
          oracao_final_id?: string | null
          cantico_inicial?: string | null
          cantico_intermediario?: string | null
          cantico_final?: string | null
          comentarios_iniciais?: string | null
          comentarios_finais?: string | null
          tesouros_titulo?: string | null
          tesouros_duracao?: string | null
          tesouros_responsavel_id?: string | null
          joias_texto?: string | null
          joias_pergunta?: string | null
          joias_referencia?: string | null
          joias_duracao?: string | null
          joias_responsavel_id?: string | null
          leitura_biblica_texto?: string | null
          leitura_biblica_duracao?: string | null
          leitura_biblica_responsavel_id?: string | null
          evento_especial?: string | null
          semana_visita_superintendente?: boolean
          dia_terca?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      faca_seu_melhor_partes: {
        Row: {
          id: string
          reuniao_nvc_id: string
          tipo: string
          duracao: string
          descricao: string | null
          responsavel_id: string | null
          ajudante_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reuniao_nvc_id: string
          tipo: string
          duracao: string
          descricao?: string | null
          responsavel_id?: string | null
          ajudante_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reuniao_nvc_id?: string
          tipo?: string
          duracao?: string
          descricao?: string | null
          responsavel_id?: string | null
          ajudante_id?: string | null
          created_at?: string
        }
      }
      nossa_vida_crista_partes: {
        Row: {
          id: string
          reuniao_nvc_id: string
          tipo: string
          duracao: string
          conteudo: string | null
          responsavel_id: string | null
          leitor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reuniao_nvc_id: string
          tipo: string
          duracao: string
          conteudo?: string | null
          responsavel_id?: string | null
          leitor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reuniao_nvc_id?: string
          tipo?: string
          duracao?: string
          conteudo?: string | null
          responsavel_id?: string | null
          leitor_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type SupabaseClient = typeof supabase