import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas
export interface Congregacao {
  id: string
  numero_unico: string
  nome: string
  cidade: string
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  congregacao_id: string
  nome: string
  telefone?: string
  role: 'admin' | 'anciao' | 'servo_ministerial' | 'pioneiro_regular' | 'pioneiro_auxiliar' | 'membro'
  is_active: boolean
  created_at: string
  updated_at: string
}

// Tipos para formulários
export interface SignupCongregacaoData {
  congregacao: {
    [x: string]: any
    nome: string
    cidade: string
  }
  responsavel: {
    nome: string
    email: string
    telefone?: string
    senha: string
    confirmarSenha: string
  }
}

export interface SignupUsuarioData {
  usuario: {
    nome: string
    email: string
    telefone?: string
    codigoCongregacao: string
    senha: string
    confirmarSenha: string
  }
}