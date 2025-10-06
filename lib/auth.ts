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

// Usuários fixos do sistema
export const FIXED_USERS: User[] = [
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
];

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

// Função para autenticar usuário usando apenas senha
export function authenticateUser(password: string): User | null {
  const user = FIXED_USERS.find(u => u.password === password);
  return user || null;
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