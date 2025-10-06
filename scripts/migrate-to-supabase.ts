import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Dados dos usuários fixos
const FIXED_USERS = [
  {
    id: 'admin',
    username: 'Administrador',
    password: 'admin',
    role: 'admin',
    permissions: ['view_all', 'edit_all']
  },
  {
    id: 'carrinho',
    username: 'Carrinho',
    password: 'carrinho',
    role: 'carrinho',
    permissions: ['view_carrinho', 'edit_carrinho', 'view_grupos', 'view_pregacao']
  },
  {
    id: 'nvc',
    username: 'Vida e Ministério',
    password: 'nvc',
    role: 'nvc',
    permissions: ['view_nvc', 'edit_nvc', 'view_publicadores']
  },
  {
    id: 'pregacao',
    username: 'Pregação',
    password: 'pregacao',
    role: 'pregacao',
    permissions: ['view_pregacao', 'edit_pregacao', 'view_grupos', 'edit_grupos', 'view_publicadores']
  },
  {
    id: 'mecanicas',
    username: 'Mecânicas',
    password: 'mecanicas',
    role: 'mecanicas',
    permissions: ['view_mecanicas', 'edit_mecanicas', 'view_publicadores']
  },
  {
    id: 'oradores',
    username: 'Oradores',
    password: 'oradores',
    role: 'oradores',
    permissions: ['view_discursos', 'edit_discursos', 'view_publicadores']
  },
  {
    id: 'limpeza',
    username: 'Limpeza',
    password: 'limpeza',
    role: 'limpeza',
    permissions: ['view_limpeza', 'edit_limpeza', 'view_grupos', 'view_publicadores']
  }
]

async function migrateUsers() {
  console.log('🚀 Iniciando migração de usuários para o Supabase...')

  try {
    // 1. Criar tabelas (se não existirem)
    console.log('📋 Criando tabelas...')
    
    // Inserir usuários
    console.log('👥 Inserindo usuários...')
    for (const user of FIXED_USERS) {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          username: user.username,
          password: user.password,
          role: user.role
        })

      if (error) {
        console.error(`❌ Erro ao inserir usuário ${user.username}:`, error)
      } else {
        console.log(`✅ Usuário ${user.username} inserido com sucesso`)
      }
    }

    // Inserir permissões
    console.log('🔐 Inserindo permissões...')
    for (const user of FIXED_USERS) {
      // Primeiro, limpar permissões existentes
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', user.id)

      // Inserir novas permissões
      for (const permission of user.permissions) {
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: user.id,
            permission: permission
          })

        if (error) {
          console.error(`❌ Erro ao inserir permissão ${permission} para ${user.username}:`, error)
        }
      }
      console.log(`✅ Permissões para ${user.username} inseridas com sucesso`)
    }

    console.log('🎉 Migração concluída com sucesso!')

    // Verificar dados inseridos
    console.log('\n📊 Verificando dados inseridos...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('username')

    if (usersError) {
      console.error('❌ Erro ao verificar usuários:', usersError)
    } else {
      console.log(`✅ ${users?.length || 0} usuários encontrados no banco`)
    }

    const { data: permissions, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('*')

    if (permissionsError) {
      console.error('❌ Erro ao verificar permissões:', permissionsError)
    } else {
      console.log(`✅ ${permissions?.length || 0} permissões encontradas no banco`)
    }

  } catch (error) {
    console.error('💥 Erro durante a migração:', error)
  }
}

// Executar migração
migrateUsers()