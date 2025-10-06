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

  const tabs = [];
  
  if (canView(user, 'discursos')) tabs.push('discursos');
  if (canView(user, 'mecanicas')) tabs.push('mecanicas');
  if (canView(user, 'limpeza')) tabs.push('limpeza');
  if (canView(user, 'nvc')) tabs.push('nvc');
  if (canView(user, 'carrinho')) tabs.push('carrinho');
  if (canView(user, 'grupos')) tabs.push('grupos');
  if (canView(user, 'pregacao')) tabs.push('pregacao');
  if (canView(user, 'publicadores')) tabs.push('publicadores');

  return tabs;
}

// ===== FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS (ADMIN) =====

export interface CreateUserData {
  username: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  role?: UserRole;
}

// Criar novo usuário
export async function createUser(userData: CreateUserData): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Verificar se username já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', userData.username)
      .single()

    if (existingUser) {
      return { success: false, error: 'Nome de usuário já existe' }
    }

    // Verificar se senha já existe
    const { data: existingPassword } = await supabase
      .from('users')
      .select('id')
      .eq('password', userData.password)
      .single()

    if (existingPassword) {
      return { success: false, error: 'Senha já está em uso' }
    }

    // Criar usuário
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        password: userData.password,
        role: userData.role
      })
      .select()
      .single()

    if (userError || !newUser) {
      return { success: false, error: 'Erro ao criar usuário' }
    }

    // Adicionar permissões
    if (userData.permissions.length > 0) {
      const permissionsToInsert = userData.permissions.map(permission => ({
        user_id: newUser.id,
        permission
      }))

      const { error: permissionsError } = await supabase
        .from('user_permissions')
        .insert(permissionsToInsert)

      if (permissionsError) {
        // Se falhar ao adicionar permissões, deletar o usuário criado
        await supabase.from('users').delete().eq('id', newUser.id)
        return { success: false, error: 'Erro ao adicionar permissões' }
      }
    }

    const user: User = {
      id: newUser.id,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role as UserRole,
      permissions: userData.permissions
    }

    return { success: true, user }
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Atualizar usuário
export async function updateUser(userId: string, userData: UpdateUserData): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Verificar se usuário existe
    const existingUser = await getUserFromDatabase(userId)
    if (!existingUser) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Verificar se novo username já existe (se fornecido)
    if (userData.username && userData.username !== existingUser.username) {
      const { data: usernameExists } = await supabase
        .from('users')
        .select('id')
        .eq('username', userData.username)
        .single()

      if (usernameExists) {
        return { success: false, error: 'Nome de usuário já existe' }
      }
    }

    // Verificar se nova senha já existe (se fornecida)
    if (userData.password && userData.password !== existingUser.password) {
      const { data: passwordExists } = await supabase
        .from('users')
        .select('id')
        .eq('password', userData.password)
        .single()

      if (passwordExists) {
        return { success: false, error: 'Senha já está em uso' }
      }
    }

    // Atualizar usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError || !updatedUser) {
      return { success: false, error: 'Erro ao atualizar usuário' }
    }

    const user: User = {
      id: updatedUser.id,
      username: updatedUser.username,
      password: updatedUser.password,
      role: updatedUser.role as UserRole,
      permissions: existingUser.permissions
    }

    return { success: true, user }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Deletar usuário
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const existingUser = await getUserFromDatabase(userId)
    if (!existingUser) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Deletar permissões primeiro
    const { error: permissionsError } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)

    if (permissionsError) {
      return { success: false, error: 'Erro ao deletar permissões do usuário' }
    }

    // Deletar usuário
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      return { success: false, error: 'Erro ao deletar usuário' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// ===== FUNÇÕES DE GERENCIAMENTO DE PERMISSÕES =====

// Adicionar permissão a um usuário
export async function addPermissionToUser(userId: string, permission: Permission): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const user = await getUserFromDatabase(userId)
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Verificar se permissão já existe
    if (user.permissions.includes(permission)) {
      return { success: false, error: 'Usuário já possui esta permissão' }
    }

    // Adicionar permissão
    const { error } = await supabase
      .from('user_permissions')
      .insert({
        user_id: userId,
        permission
      })

    if (error) {
      return { success: false, error: 'Erro ao adicionar permissão' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao adicionar permissão:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Remover permissão de um usuário
export async function removePermissionFromUser(userId: string, permission: Permission): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const user = await getUserFromDatabase(userId)
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Verificar se usuário possui a permissão
    if (!user.permissions.includes(permission)) {
      return { success: false, error: 'Usuário não possui esta permissão' }
    }

    // Remover permissão
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission', permission)

    if (error) {
      return { success: false, error: 'Erro ao remover permissão' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao remover permissão:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Atualizar todas as permissões de um usuário
export async function updateUserPermissions(userId: string, permissions: Permission[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const user = await getUserFromDatabase(userId)
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Remover todas as permissões existentes
    const { error: deleteError } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      return { success: false, error: 'Erro ao remover permissões existentes' }
    }

    // Adicionar novas permissões
    if (permissions.length > 0) {
      const permissionsToInsert = permissions.map(permission => ({
        user_id: userId,
        permission
      }))

      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert(permissionsToInsert)

      if (insertError) {
        return { success: false, error: 'Erro ao adicionar novas permissões' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}