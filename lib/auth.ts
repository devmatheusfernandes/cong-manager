export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
}

export type UserRole = 
  | 'admin'
  | 'carrinho'
  | 'nvc'
  | 'pregacao'
  | 'mecanicas'
  | 'oradores'
  | 'limpeza';

export type Permission = 
  | 'view_all'
  | 'edit_all'
  | 'view_discursos'
  | 'edit_discursos'
  | 'view_mecanicas'
  | 'edit_mecanicas'
  | 'view_limpeza'
  | 'edit_limpeza'
  | 'view_nvc'
  | 'edit_nvc'
  | 'view_carrinho'
  | 'edit_carrinho'
  | 'view_grupos'
  | 'edit_grupos'
  | 'view_pregacao'
  | 'edit_pregacao'
  | 'view_publicadores'
  | 'edit_publicadores';

import { supabase } from './supabase'

// Tabs disponíveis para usuários não logados
export const PUBLIC_TABS = [
  'discursos',
  'mecanicas', 
  'limpeza',
  'nvc',
  'carrinho',
  'grupos',
  'pregacao'
];

// Função para buscar usuário no Supabase
export async function getUserFromDatabase(userId: string): Promise<User | null> {
  try {
    // Buscar usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return null
    }

    // Buscar permissões do usuário
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', userId)

    if (permissionsError) {
      return null
    }

    const permissions = permissionsData?.map(p => p.permission as Permission) || []

    return {
      id: userData.id,
      username: userData.username,
      password: userData.password,
      role: userData.role as UserRole,
      permissions
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}

// Função para autenticar usuário
export async function authenticateUser(password: string): Promise<User | null> {
  try {
    // Buscar usuário pela senha
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('password', password)
      .single()

    if (userError || !userData) {
      return null
    }

    // Buscar permissões do usuário
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', userData.id)

    if (permissionsError) {
      return null
    }

    const permissions = permissionsData?.map(p => p.permission as Permission) || []

    return {
      id: userData.id,
      username: userData.username,
      password: userData.password,
      role: userData.role as UserRole,
      permissions
    }
  } catch (error) {
     console.error('Erro ao autenticar usuário:', error)
     return null
   }
 }

// Função para buscar todos os usuários (para admin)
export async function getAllUsers(): Promise<User[]> {
  try {
    // Buscar todos os usuários
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('username')

    if (usersError || !usersData) {
      return []
    }

    // Buscar todas as permissões
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('user_id, permission')

    if (permissionsError) {
      return []
    }

    // Mapear usuários com suas permissões
    const users: User[] = usersData.map(userData => {
      const userPermissions = permissionsData
        ?.filter(p => p.user_id === userData.id)
        ?.map(p => p.permission as Permission) || []

      return {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        role: userData.role as UserRole,
        permissions: userPermissions
      }
    })

    return users
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }
}

// Função para verificar se usuário tem permissão
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  
  // Admin tem todas as permissões
  if (user.permissions.includes('view_all') || user.permissions.includes('edit_all')) {
    return true;
  }
  
  return user.permissions.includes(permission);
}

// Função para verificar se usuário pode editar uma seção
export function canEdit(user: User | null, section: string): boolean {
  if (!user) return false;
  
  const editPermission = `edit_${section}` as Permission;
  return hasPermission(user, editPermission);
}

// Função para verificar se usuário pode visualizar uma seção
export function canView(user: User | null, section: string): boolean {
  if (!user) {
    // Usuários não logados podem ver apenas tabs públicas
    return PUBLIC_TABS.includes(section);
  }
  
  const viewPermission = `view_${section}` as Permission;
  return hasPermission(user, viewPermission);
}

// Função para obter tabs disponíveis para o usuário
export function getAvailableTabs(user: User | null): string[] {
  if (!user) {
    return PUBLIC_TABS;
  }
  
  const allTabs = [
    'discursos',
    'mecanicas',
    'limpeza', 
    'nvc',
    'carrinho',
    'grupos',
    'pregacao',
    'publicadores'
  ];
  
  // Admin vê todas as tabs
  if (user.permissions.includes('view_all')) {
    return [...allTabs, 'admin'];
  }
  
  // Filtrar tabs baseado nas permissões
  return allTabs.filter(tab => canView(user, tab));
}