export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
}

export type UserRole =
  | "admin"
  | "carrinho"
  | "nvc"
  | "pregacao"
  | "mecanicas"
  | "oradores"
  | "limpeza";

export type Permission =
  | "view_all"
  | "edit_all"
  | "view_discursos"
  | "edit_discursos"
  | "view_mecanicas"
  | "edit_mecanicas"
  | "view_limpeza"
  | "edit_limpeza"
  | "view_nvc"
  | "edit_nvc"
  | "view_carrinho"
  | "edit_carrinho"
  | "view_testemunho-publico"
  | "edit_testemunho-publico"
  | "view_grupos"
  | "edit_grupos"
  | "view_pregacao"
  | "edit_pregacao"
  | "view_publicadores"
  | "edit_publicadores";

import { supabase } from "./supabase";

// Tabs disponíveis para usuários não logados
export const PUBLIC_TABS = [
  "discursos",
  "mecanicas",
  "limpeza",
  "nvc",
  "carrinho",
  "testemunho-publico",
  "grupos",
];

// Função para buscar usuário no Supabase
export async function getUserFromDatabase(
  userId: string
): Promise<User | null> {
  try {
    // Buscar usuário
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return null;
    }

    // Buscar permissões do usuário
    const { data: permissionsData, error: permissionsError } = await supabase
      .from("user_permissions")
      .select("permission")
      .eq("user_id", userId);

    if (permissionsError) {
      return null;
    }

    const permissions =
      permissionsData?.map((p) => p.permission as Permission) || [];

    return {
      id: userData.id,
      username: userData.username,
      password: userData.password,
      role: userData.role as UserRole,
      permissions,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}

// Função para autenticar usuário
export async function authenticateUser(password: string): Promise<User | null> {
  try {
    // Buscar usuário pela senha
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("password", password)
      .single();

    if (userError || !userData) {
      return null;
    }

    // Buscar permissões do usuário
    const { data: permissionsData, error: permissionsError } = await supabase
      .from("user_permissions")
      .select("permission")
      .eq("user_id", userData.id);

    if (permissionsError) {
      return null;
    }

    const permissions =
      permissionsData?.map((p) => p.permission as Permission) || [];

    return {
      id: userData.id,
      username: userData.username,
      password: userData.password,
      role: userData.role as UserRole,
      permissions,
    };
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return null;
  }
}

// Função para buscar todos os usuários (para admin)
export async function getAllUsers(): Promise<User[]> {
  try {
    // Buscar todos os usuários
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("username");

    if (usersError || !usersData) {
      return [];
    }

    // Buscar todas as permissões
    const { data: permissionsData, error: permissionsError } = await supabase
      .from("user_permissions")
      .select("user_id, permission");

    if (permissionsError) {
      return [];
    }

    // Mapear usuários com suas permissões
    const users: User[] = usersData.map((userData) => {
      const userPermissions =
        permissionsData
          ?.filter((p) => p.user_id === userData.id)
          ?.map((p) => p.permission as Permission) || [];

      return {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        role: userData.role as UserRole,
        permissions: userPermissions,
      };
    });

    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

// Função para verificar se usuário tem permissão
export function hasPermission(
  user: User | null,
  permission: Permission
): boolean {
  if (!user) return false;

  // Admin tem todas as permissões
  if (
    user.permissions.includes("view_all") ||
    user.permissions.includes("edit_all")
  ) {
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

  if (canView(user, "discursos")) tabs.push("discursos");
  if (canView(user, "mecanicas")) tabs.push("mecanicas");
  if (canView(user, "limpeza")) tabs.push("limpeza");
  if (canView(user, "nvc")) tabs.push("nvc");
  if (canView(user, "carrinho")) tabs.push("carrinho");
  if (canView(user, "testemunho-publico")) tabs.push("testemunho-publico");
  if (canView(user, "grupos")) tabs.push("grupos");
  if (canView(user, "pregacao")) tabs.push("pregacao");
  if (canView(user, "publicadores")) tabs.push("publicadores");

  // Para usuários admin, incluir as tabs admin e congregacao
  if (user.role === "admin") {
    tabs.push("admin");
    tabs.push("congregacao");
  }

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
export async function createUser(
  userData: CreateUserData
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Verificar se username já existe
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", userData.username)
      .single();

    if (existingUser) {
      return { success: false, error: "Nome de usuário já existe" };
    }

    // Verificar se senha já existe
    const { data: existingPassword } = await supabase
      .from("users")
      .select("id")
      .eq("password", userData.password)
      .single();

    if (existingPassword) {
      return { success: false, error: "Senha já está em uso" };
    }

    // Criar usuário
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        username: userData.username,
        password: userData.password,
        role: userData.role,
      })
      .select()
      .single();

    if (userError || !newUser) {
      return { success: false, error: "Erro ao criar usuário" };
    }

    // Adicionar permissões
    if (userData.permissions.length > 0) {
      const permissionsToInsert = userData.permissions.map((permission) => ({
        user_id: newUser.id,
        permission,
      }));

      const { error: permissionsError } = await supabase
        .from("user_permissions")
        .insert(permissionsToInsert);

      if (permissionsError) {
        // Se falhar ao adicionar permissões, deletar o usuário criado
        await supabase.from("users").delete().eq("id", newUser.id);
        return { success: false, error: "Erro ao adicionar permissões" };
      }
    }

    const user: User = {
      id: newUser.id,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role as UserRole,
      permissions: userData.permissions,
    };

    return { success: true, user };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// ===== INTERFACES PARA MECÂNICAS =====

export interface Mecanica {
  id: string;
  data: string;
  tipo_reuniao: "meio_semana" | "fim_semana";
  indicador_entrada_id?: string;
  indicador_auditorio_id?: string;
  audio_video_id?: string;
  volante_id?: string;
  palco_id?: string;
  leitor_sentinela_id?: string;
  presidente_id?: string;
  created_at?: string;
  updated_at?: string;
  // Para joins com usuários
  indicador_entrada?: User;
  indicador_auditorio?: User;
  audio_video?: User;
  volante?: User;
  palco?: User;
  leitor_sentinela?: User;
  presidente?: User;
}

export interface CreateMecanicaData {
  data: string;
  tipo_reuniao: "meio_semana" | "fim_semana";
  indicador_entrada_id?: string;
  indicador_auditorio_id?: string;
  audio_video_id?: string;
  volante_id?: string;
  palco_id?: string;
  leitor_sentinela_id?: string;
  presidente_id?: string;
}

export interface UpdateMecanicaData {
  data?: string;
  tipo_reuniao?: "meio_semana" | "fim_semana";
  indicador_entrada_id?: string;
  indicador_auditorio_id?: string;
  audio_video_id?: string;
  volante_id?: string;
  palco_id?: string;
  leitor_sentinela_id?: string;
  presidente_id?: string;
}

// ===== FUNÇÕES CRUD PARA MECÂNICAS =====

// Buscar todas as mecânicas
// Função auxiliar para buscar dados de usuário ou publicador
async function getUserOrPublicadorData(id: string): Promise<User | null> {
  if (!id) return null;

  // Se o ID tem prefixo 'pub_', buscar na tabela publicadores
  if (id.startsWith("pub_")) {
    const publicador = await getPublicadorById(id);
    if (publicador) {
      // Converter publicador para formato User para compatibilidade
      return {
        id: publicador.id,
        username: publicador.nome,
        password: "", // Não usado para exibição
        role: "pregacao" as UserRole, // Role padrão para publicadores
        permissions: [], // Não usado para exibição
      };
    }
  } else {
    // Buscar na tabela users
    return await getUserFromDatabase(id);
  }

  return null;
}

export async function getAllMecanicas(): Promise<Mecanica[]> {
  try {
    const { data, error } = await supabase
      .from("mecanicas")
      .select("*")
      .order("data", { ascending: true });

    if (error) {
      console.error("Erro ao buscar mecânicas:", error);
      return [];
    }

    if (!data) return [];

    // Buscar dados dos usuários/publicadores para cada mecânica
    const mecanicasComDados = await Promise.all(
      data.map(async (mecanica) => {
        const [
          indicador_entrada,
          indicador_auditorio,
          audio_video,
          volante,
          palco,
          leitor_sentinela,
          presidente,
        ] = await Promise.all([
          getUserOrPublicadorData(mecanica.indicador_entrada_id),
          getUserOrPublicadorData(mecanica.indicador_auditorio_id),
          getUserOrPublicadorData(mecanica.audio_video_id),
          getUserOrPublicadorData(mecanica.volante_id),
          getUserOrPublicadorData(mecanica.palco_id),
          getUserOrPublicadorData(mecanica.leitor_sentinela_id),
          getUserOrPublicadorData(mecanica.presidente_id),
        ]);

        return {
          ...mecanica,
          indicador_entrada,
          indicador_auditorio,
          audio_video,
          volante,
          palco,
          leitor_sentinela,
          presidente,
        };
      })
    );

    return mecanicasComDados;
  } catch (error) {
    console.error("Erro ao buscar mecânicas:", error);
    return [];
  }
}

// Buscar mecânica por ID
export async function getMecanicaById(id: string): Promise<Mecanica | null> {
  try {
    const { data, error } = await supabase
      .from("mecanicas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar mecânica:", error);
      return null;
    }

    if (!data) return null;

    // Buscar dados dos usuários/publicadores separadamente
    const [
      indicador_entrada,
      indicador_auditorio,
      audio_video,
      volante,
      palco,
      leitor_sentinela,
      presidente,
    ] = await Promise.all([
      data.indicador_entrada_id
        ? getUserOrPublicadorData(data.indicador_entrada_id)
        : null,
      data.indicador_auditorio_id
        ? getUserOrPublicadorData(data.indicador_auditorio_id)
        : null,
      data.audio_video_id ? getUserOrPublicadorData(data.audio_video_id) : null,
      data.volante_id ? getUserOrPublicadorData(data.volante_id) : null,
      data.palco_id ? getUserOrPublicadorData(data.palco_id) : null,
      data.leitor_sentinela_id
        ? getUserOrPublicadorData(data.leitor_sentinela_id)
        : null,
      data.presidente_id ? getUserOrPublicadorData(data.presidente_id) : null,
    ]);

    return {
      ...data,
      indicador_entrada: indicador_entrada || undefined,
      indicador_auditorio: indicador_auditorio || undefined,
      audio_video: audio_video || undefined,
      volante: volante || undefined,
      palco: palco || undefined,
      leitor_sentinela: leitor_sentinela || undefined,
      presidente: presidente || undefined,
    };
  } catch (error) {
    console.error("Erro ao buscar mecânica:", error);
    return null;
  }
}

// Criar nova mecânica
export async function createMecanica(
  mecanicaData: CreateMecanicaData
): Promise<{ success: boolean; error?: string; mecanica?: Mecanica }> {
  try {
    // Verificar se já existe uma mecânica para a mesma data
    const { data: existingMecanica } = await supabase
      .from("mecanicas")
      .select("id")
      .eq("data", mecanicaData.data)
      .single();

    if (existingMecanica) {
      return {
        success: false,
        error: "Já existe uma designação para esta data",
      };
    }

    const { data, error } = await supabase
      .from("mecanicas")
      .insert([mecanicaData])
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao criar mecânica:", error);
      return { success: false, error: "Erro ao criar designação" };
    }

    return { success: true, mecanica: data };
  } catch (error) {
    console.error("Erro ao criar mecânica:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar mecânica
export async function updateMecanica(
  id: string,
  mecanicaData: UpdateMecanicaData
): Promise<{ success: boolean; error?: string; mecanica?: Mecanica }> {
  try {
    // Verificar se a mecânica existe
    const { data: existingMecanica } = await supabase
      .from("mecanicas")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingMecanica) {
      return { success: false, error: "Designação não encontrada" };
    }

    // Se está alterando a data, verificar se não há conflito
    if (mecanicaData.data) {
      const { data: conflictMecanica } = await supabase
        .from("mecanicas")
        .select("id")
        .eq("data", mecanicaData.data)
        .neq("id", id)
        .single();

      if (conflictMecanica) {
        return {
          success: false,
          error: "Já existe uma designação para esta data",
        };
      }
    }

    const { data, error } = await supabase
      .from("mecanicas")
      .update(mecanicaData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao atualizar mecânica:", error);
      return { success: false, error: "Erro ao atualizar designação" };
    }

    if (!data) {
      return { success: false, error: "Erro ao atualizar designação" };
    }

    // Buscar dados dos usuários/publicadores separadamente
    const [
      indicador_entrada,
      indicador_auditorio,
      audio_video,
      volante,
      palco,
      leitor_sentinela,
      presidente,
    ] = await Promise.all([
      data.indicador_entrada_id
        ? getUserOrPublicadorData(data.indicador_entrada_id)
        : null,
      data.indicador_auditorio_id
        ? getUserOrPublicadorData(data.indicador_auditorio_id)
        : null,
      data.audio_video_id ? getUserOrPublicadorData(data.audio_video_id) : null,
      data.volante_id ? getUserOrPublicadorData(data.volante_id) : null,
      data.palco_id ? getUserOrPublicadorData(data.palco_id) : null,
      data.leitor_sentinela_id
        ? getUserOrPublicadorData(data.leitor_sentinela_id)
        : null,
      data.presidente_id ? getUserOrPublicadorData(data.presidente_id) : null,
    ]);

    const mecanicaWithUsers = {
      ...data,
      indicador_entrada: indicador_entrada || undefined,
      indicador_auditorio: indicador_auditorio || undefined,
      audio_video: audio_video || undefined,
      volante: volante || undefined,
      palco: palco || undefined,
      leitor_sentinela: leitor_sentinela || undefined,
      presidente: presidente || undefined,
    };

    return { success: true, mecanica: mecanicaWithUsers };
  } catch (error) {
    console.error("Erro ao atualizar mecânica:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Deletar mecânica
export async function deleteMecanica(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se a mecânica existe
    const { data: existingMecanica } = await supabase
      .from("mecanicas")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingMecanica) {
      return { success: false, error: "Designação não encontrada" };
    }

    const { error } = await supabase.from("mecanicas").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar mecânica:", error);
      return { success: false, error: "Erro ao deletar designação" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar mecânica:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar usuário
export async function updateUser(
  userId: string,
  userData: UpdateUserData
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Verificar se usuário existe
    const existingUser = await getUserFromDatabase(userId);
    if (!existingUser) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Verificar se novo username já existe (se fornecido)
    if (userData.username && userData.username !== existingUser.username) {
      const { data: usernameExists } = await supabase
        .from("users")
        .select("id")
        .eq("username", userData.username)
        .single();

      if (usernameExists) {
        return { success: false, error: "Nome de usuário já existe" };
      }
    }

    // Verificar se nova senha já existe (se fornecida)
    if (userData.password && userData.password !== existingUser.password) {
      const { data: passwordExists } = await supabase
        .from("users")
        .select("id")
        .eq("password", userData.password)
        .single();

      if (passwordExists) {
        return { success: false, error: "Senha já está em uso" };
      }
    }

    // Atualizar usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updatedUser) {
      return { success: false, error: "Erro ao atualizar usuário" };
    }

    const user: User = {
      id: updatedUser.id,
      username: updatedUser.username,
      password: updatedUser.password,
      role: updatedUser.role as UserRole,
      permissions: existingUser.permissions,
    };

    return { success: true, user };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Deletar usuário
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const existingUser = await getUserFromDatabase(userId);
    if (!existingUser) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Deletar permissões primeiro
    const { error: permissionsError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("user_id", userId);

    if (permissionsError) {
      return { success: false, error: "Erro ao deletar permissões do usuário" };
    }

    // Deletar usuário
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (userError) {
      return { success: false, error: "Erro ao deletar usuário" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// ===== FUNÇÕES DE GERENCIAMENTO DE PERMISSÕES =====

// Adicionar permissão a um usuário
export async function addPermissionToUser(
  userId: string,
  permission: Permission
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const user = await getUserFromDatabase(userId);
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Verificar se permissão já existe
    if (user.permissions.includes(permission)) {
      return { success: false, error: "Usuário já possui esta permissão" };
    }

    // Adicionar permissão
    const { error } = await supabase.from("user_permissions").insert({
      user_id: userId,
      permission,
    });

    if (error) {
      return { success: false, error: "Erro ao adicionar permissão" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar permissão:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Remover permissão de um usuário
export async function removePermissionFromUser(
  userId: string,
  permission: Permission
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const user = await getUserFromDatabase(userId);
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Verificar se usuário possui a permissão
    if (!user.permissions.includes(permission)) {
      return { success: false, error: "Usuário não possui esta permissão" };
    }

    // Remover permissão
    const { error } = await supabase
      .from("user_permissions")
      .delete()
      .eq("user_id", userId)
      .eq("permission", permission);

    if (error) {
      return { success: false, error: "Erro ao remover permissão" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover permissão:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar todas as permissões de um usuário
export async function updateUserPermissions(
  userId: string,
  permissions: Permission[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe
    const user = await getUserFromDatabase(userId);
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Remover todas as permissões existentes
    const { error: deleteError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return { success: false, error: "Erro ao remover permissões existentes" };
    }

    // Adicionar novas permissões
    if (permissions.length > 0) {
      const permissionsToInsert = permissions.map((permission) => ({
        user_id: userId,
        permission,
      }));

      const { error: insertError } = await supabase
        .from("user_permissions")
        .insert(permissionsToInsert);

      if (insertError) {
        return { success: false, error: "Erro ao adicionar novas permissões" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar permissões:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// ===== INTERFACES PARA ORADORES E DISCURSOS =====

export interface Orador {
  id: string;
  nome: string;
  congregacao_origem: string;
  created_at?: string;
  updated_at?: string;
}

export interface Discurso {
  id: string;
  orador_id: string;
  tema: string;
  data: string;
  cantico?: string;
  hospitalidade_id?: string;
  tem_imagem: boolean;
  created_at?: string;
  updated_at?: string;
  orador?: Orador; // Para joins
}

export interface CreateOradorData {
  nome: string;
  congregacao_origem: string;
}

export interface UpdateOradorData {
  nome?: string;
  congregacao_origem?: string;
}

export interface CreateDiscursoData {
  orador_id: string;
  tema: string;
  data: string;
  cantico?: string;
  hospitalidade_id?: string;
  tem_imagem?: boolean;
}

export interface UpdateDiscursoData {
  orador_id?: string;
  tema?: string;
  data?: string;
  cantico?: string;
  hospitalidade_id?: string;
  tem_imagem?: boolean;
}

// ===== FUNÇÕES CRUD PARA ORADORES =====

// Buscar todos os oradores
export async function getAllOradores(): Promise<Orador[]> {
  try {
    const { data, error } = await supabase
      .from("oradores")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar oradores:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar oradores:", error);
    return [];
  }
}

// Buscar oradores combinados (tabela oradores + publicadores que sejam anciãos ou servos ministeriais)
export async function getOradoresCombinados(): Promise<Orador[]> {
  try {
    // Buscar oradores da tabela oradores
    const { data: oradoresData, error: oradoresError } = await supabase
      .from("oradores")
      .select("*")
      .order("nome", { ascending: true });

    if (oradoresError) {
      console.error("Erro ao buscar oradores:", oradoresError);
    }

    // Buscar publicadores que sejam anciãos ou servos ministeriais
    const { data: publicadoresData, error: publicadoresError } = await supabase
      .from("publicadores")
      .select("*")
      .in("privilegio", ["anciao", "servo_ministerial"])
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (publicadoresError) {
      console.error("Erro ao buscar publicadores:", publicadoresError);
    }

    // Combinar os dados
    const oradores: Orador[] = oradoresData || [];

    // Converter publicadores para o formato de oradores
    const publicadoresComoOradores: Orador[] = (publicadoresData || []).map(
      (publicador) => ({
        id: `pub_${publicador.id}`, // Prefixo para distinguir de oradores reais
        nome: publicador.nome,
        congregacao_origem: "Local", // Publicadores são da congregação local
        created_at: publicador.created_at,
        updated_at: publicador.updated_at,
      })
    );

    // Combinar e ordenar por nome
    const oradoresCombinados = [...oradores, ...publicadoresComoOradores].sort(
      (a, b) => a.nome.localeCompare(b.nome)
    );

    return oradoresCombinados;
  } catch (error) {
    console.error("Erro ao buscar oradores combinados:", error);
    return [];
  }
}

// Buscar orador por ID
export async function getOradorById(id: string): Promise<Orador | null> {
  try {
    const { data, error } = await supabase
      .from("oradores")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar orador:", error);
    return null;
  }
}

// Buscar orador combinado por ID (oradores ou publicadores)
export async function getOradorCombinadoById(
  id: string
): Promise<Orador | null> {
  try {
    // Se o ID tem prefixo 'pub_', é um publicador
    if (id.startsWith("pub_")) {
      const publicadorId = id.replace("pub_", "");
      const { data, error } = await supabase
        .from("publicadores")
        .select("*")
        .eq("id", publicadorId)
        .single();

      if (error || !data) {
        return null;
      }

      // Converter publicador para formato de orador
      return {
        id: `pub_${data.id}`,
        nome: data.nome,
        congregacao_origem: "Local",
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } else {
      // É um orador normal
      const { data, error } = await supabase
        .from("oradores")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error("Erro ao buscar orador combinado:", error);
    return null;
  }
}

// Criar novo orador
export async function createOrador(
  oradorData: CreateOradorData
): Promise<{ success: boolean; error?: string; orador?: Orador }> {
  try {
    // Verificar se já existe um orador com o mesmo nome
    const { data: existingOrador } = await supabase
      .from("oradores")
      .select("id")
      .eq("nome", oradorData.nome)
      .single();

    if (existingOrador) {
      return { success: false, error: "Já existe um orador com este nome" };
    }

    const { data, error } = await supabase
      .from("oradores")
      .insert([oradorData])
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: "Erro ao criar orador" };
    }

    return { success: true, orador: data };
  } catch (error) {
    console.error("Erro ao criar orador:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar orador
export async function updateOrador(
  id: string,
  oradorData: UpdateOradorData
): Promise<{ success: boolean; error?: string; orador?: Orador }> {
  try {
    // Verificar se orador existe
    const existingOrador = await getOradorById(id);
    if (!existingOrador) {
      return { success: false, error: "Orador não encontrado" };
    }

    // Se está alterando o nome, verificar se já existe outro com o mesmo nome
    if (oradorData.nome && oradorData.nome !== existingOrador.nome) {
      const { data: duplicateOrador } = await supabase
        .from("oradores")
        .select("id")
        .eq("nome", oradorData.nome)
        .neq("id", id)
        .single();

      if (duplicateOrador) {
        return { success: false, error: "Já existe um orador com este nome" };
      }
    }

    const { data, error } = await supabase
      .from("oradores")
      .update(oradorData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: "Erro ao atualizar orador" };
    }

    return { success: true, orador: data };
  } catch (error) {
    console.error("Erro ao atualizar orador:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Deletar orador
export async function deleteOrador(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se orador existe
    const existingOrador = await getOradorById(id);
    if (!existingOrador) {
      return { success: false, error: "Orador não encontrado" };
    }

    // Verificar se há discursos associados
    const { data: discursos } = await supabase
      .from("discursos")
      .select("id")
      .eq("orador_id", id)
      .limit(1);

    if (discursos && discursos.length > 0) {
      return {
        success: false,
        error: "Não é possível deletar orador que possui discursos associados",
      };
    }

    const { error } = await supabase.from("oradores").delete().eq("id", id);

    if (error) {
      return { success: false, error: "Erro ao deletar orador" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar orador:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// ===== FUNÇÕES CRUD PARA DISCURSOS =====

// Buscar todos os discursos com informações do orador
export async function getAllDiscursos(): Promise<Discurso[]> {
  try {
    const { data, error } = await supabase
      .from("discursos")
      .select("*")
      .order("data", { ascending: false });

    if (error) {
      console.error("Erro ao buscar discursos:", error);
      return [];
    }

    if (!data) return [];

    // Buscar dados dos oradores para cada discurso
    const discursosComOradores = await Promise.all(
      data.map(async (discurso) => {
        // Primeiro tentar buscar na tabela oradores
        let orador = await getOradorById(discurso.orador_id);
        let oradorId = discurso.orador_id;

        // Se não encontrou, pode ser um publicador
        if (!orador) {
          const publicadorId = `pub_${discurso.orador_id}`;
          orador = await getOradorCombinadoById(publicadorId);
          if (orador) {
            oradorId = publicadorId; // Usar ID com prefixo
          }
        }

        return {
          ...discurso,
          orador_id: oradorId,
          orador,
        };
      })
    );

    return discursosComOradores;
  } catch (error) {
    console.error("Erro ao buscar discursos:", error);
    return [];
  }
}

// Buscar discurso por ID
export async function getDiscursoById(id: string): Promise<Discurso | null> {
  try {
    const { data, error } = await supabase
      .from("discursos")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    // Buscar dados do orador separadamente
    let orador = null;
    let oradorId = data.orador_id;

    // Primeiro tentar buscar como orador regular
    orador = await getOradorById(data.orador_id);

    // Se não encontrou, tentar como publicador
    if (!orador) {
      const publicadorId = `pub_${data.orador_id}`;
      orador = await getOradorCombinadoById(publicadorId);
      if (orador) {
        oradorId = publicadorId; // Usar ID com prefixo
      }
    }

    return {
      ...data,
      orador_id: oradorId,
      orador,
    };
  } catch (error) {
    console.error("Erro ao buscar discurso:", error);
    return null;
  }
}

// Criar novo discurso
export async function createDiscurso(
  discursoData: CreateDiscursoData
): Promise<{ success: boolean; error?: string; discurso?: Discurso }> {
  try {
    // Verificar se orador existe (incluindo publicadores)
    const orador = await getOradorCombinadoById(discursoData.orador_id);
    if (!orador) {
      return { success: false, error: "Orador não encontrado" };
    }

    // Extrair UUID do orador_id (remover prefixo 'pub_' se existir)
    const oradorUuid = discursoData.orador_id.startsWith("pub_")
      ? discursoData.orador_id.substring(4)
      : discursoData.orador_id;

    const { data, error } = await supabase
      .from("discursos")
      .insert([
        {
          ...discursoData,
          orador_id: oradorUuid, // Usar UUID limpo
          tem_imagem: discursoData.tem_imagem || false,
        },
      ])
      .select("*")
      .single();

    if (error || !data) {
      console.error("Erro ao criar discurso no Supabase:", error);
      return { success: false, error: "Erro ao criar discurso" };
    }

    // Adicionar dados do orador ao resultado com o ID original
    const discursoComOrador = {
      ...data,
      orador_id: discursoData.orador_id, // Manter ID original com prefixo
      orador,
    };

    return { success: true, discurso: discursoComOrador };
  } catch (error) {
    console.error("Erro ao criar discurso:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar discurso
export async function updateDiscurso(
  id: string,
  discursoData: UpdateDiscursoData
): Promise<{ success: boolean; error?: string; discurso?: Discurso }> {
  try {
    // Verificar se discurso existe
    const existingDiscurso = await getDiscursoById(id);
    if (!existingDiscurso) {
      return { success: false, error: "Discurso não encontrado" };
    }

    // Se está alterando o orador, verificar se existe (incluindo publicadores)
    if (discursoData.orador_id) {
      const orador = await getOradorCombinadoById(discursoData.orador_id);
      if (!orador) {
        return { success: false, error: "Orador não encontrado" };
      }
    }

    // Preparar dados para atualização, extraindo UUID se necessário
    const updateData = { ...discursoData };
    if (updateData.orador_id) {
      updateData.orador_id = updateData.orador_id.startsWith("pub_")
        ? updateData.orador_id.substring(4)
        : updateData.orador_id;
    }

    const { data, error } = await supabase
      .from("discursos")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("Erro ao atualizar discurso no Supabase:", error);
      return { success: false, error: "Erro ao atualizar discurso" };
    }

    // Buscar dados do orador atualizado
    const oradorId = discursoData.orador_id || data.orador_id;
    const orador = await getOradorCombinadoById(oradorId);
    const discursoComOrador = {
      ...data,
      orador_id: oradorId, // Manter ID original com prefixo se aplicável
      orador,
    };

    return { success: true, discurso: discursoComOrador };
  } catch (error) {
    console.error("Erro ao atualizar discurso:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Deletar discurso
export async function deleteDiscurso(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se discurso existe
    const existingDiscurso = await getDiscursoById(id);
    if (!existingDiscurso) {
      return { success: false, error: "Discurso não encontrado" };
    }

    const { error } = await supabase.from("discursos").delete().eq("id", id);

    if (error) {
      return { success: false, error: "Erro ao deletar discurso" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar discurso:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// ===== PUBLICADORES =====

export interface Publicador {
  id: string;
  nome: string;
  genero: "masculino" | "feminino";
  privilegio: "nao_batizado" | "batizado" | "servo_ministerial" | "anciao";
  pioneiro_regular: boolean;
  pioneiro_auxiliar: boolean;
  telefone?: string;
  email?: string;
  ativo: boolean;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatePublicadorData {
  nome: string;
  genero: "masculino" | "feminino";
  privilegio: "nao_batizado" | "batizado" | "servo_ministerial" | "anciao";
  pioneiro_regular?: boolean;
  pioneiro_auxiliar?: boolean;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  permissions?: string[];
}

export interface UpdatePublicadorData {
  nome?: string;
  genero?: "masculino" | "feminino";
  privilegio?: "nao_batizado" | "batizado" | "servo_ministerial" | "anciao";
  pioneiro_regular?: boolean;
  pioneiro_auxiliar?: boolean;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  permissions?: string[];
}

// Listar todos os publicadores
export async function getAllPublicadores(): Promise<Publicador[]> {
  try {
    const { data: publicadores, error } = await supabase
      .from("publicadores")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar publicadores:", error);
      return [];
    }

    // Buscar permissões para cada publicador
    const publicadoresComPermissoes = await Promise.all(
      (publicadores || []).map(async (publicador) => {
        const { data: permissions } = await supabase
          .from("publicador_permissions")
          .select("permission")
          .eq("publicador_id", publicador.id);

        return {
          ...publicador,
          permissions: permissions?.map((p) => p.permission) || [],
        };
      })
    );

    return publicadoresComPermissoes;
  } catch (error) {
    console.error("Erro ao buscar publicadores:", error);
    return [];
  }
}

// Buscar publicador por ID
export async function getPublicadorById(
  id: string
): Promise<Publicador | null> {
  try {
    const { data: publicador, error } = await supabase
      .from("publicadores")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !publicador) {
      return null;
    }

    // Buscar permissões do publicador
    const { data: permissions } = await supabase
      .from("publicador_permissions")
      .select("permission")
      .eq("publicador_id", id);

    return {
      ...publicador,
      permissions: permissions?.map((p) => p.permission) || [],
    };
  } catch (error) {
    console.error("Erro ao buscar publicador:", error);
    return null;
  }
}

// Criar novo publicador
export async function createPublicador(
  publicadorData: CreatePublicadorData
): Promise<{ success: boolean; error?: string; publicador?: Publicador }> {
  try {
    const { data: publicador, error } = await supabase
      .from("publicadores")
      .insert({
        nome: publicadorData.nome,
        genero: publicadorData.genero,
        privilegio: publicadorData.privilegio,
        ativo: publicadorData.ativo ?? true,
      })
      .select()
      .single();

    if (error || !publicador) {
      console.error("Erro ao criar publicador:", error);
      return { success: false, error: "Erro ao criar publicador" };
    }

    // Adicionar permissões se fornecidas
    if (publicadorData.permissions && publicadorData.permissions.length > 0) {
      const permissionsToInsert = publicadorData.permissions.map(
        (permission) => ({
          publicador_id: publicador.id,
          permission,
        })
      );

      const { error: permError } = await supabase
        .from("publicador_permissions")
        .insert(permissionsToInsert);

      if (permError) {
        console.error("Erro ao adicionar permissões:", permError);
        // Não falha a criação do publicador por causa das permissões
      }
    }

    const publicadorCompleto = await getPublicadorById(publicador.id);
    return { success: true, publicador: publicadorCompleto || undefined };
  } catch (error) {
    console.error("Erro ao criar publicador:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar publicador
export async function updatePublicador(
  id: string,
  publicadorData: UpdatePublicadorData
): Promise<{ success: boolean; error?: string; publicador?: Publicador }> {
  try {
    // Verificar se publicador existe
    const publicadorExistente = await getPublicadorById(id);
    if (!publicadorExistente) {
      return { success: false, error: "Publicador não encontrado" };
    }

    // Atualizar dados básicos do publicador
    const updateData: Partial<
      Pick<Publicador, "nome" | "genero" | "privilegio" | "ativo">
    > = {};
    if (publicadorData.nome !== undefined)
      updateData.nome = publicadorData.nome;
    if (publicadorData.genero !== undefined)
      updateData.genero = publicadorData.genero;
    if (publicadorData.privilegio !== undefined)
      updateData.privilegio = publicadorData.privilegio;
    if (publicadorData.ativo !== undefined)
      updateData.ativo = publicadorData.ativo;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("publicadores")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar publicador:", error);
        return { success: false, error: "Erro ao atualizar publicador" };
      }
    }

    // Atualizar permissões se fornecidas
    if (publicadorData.permissions !== undefined) {
      // Remover todas as permissões existentes
      await supabase
        .from("publicador_permissions")
        .delete()
        .eq("publicador_id", id);

      // Adicionar novas permissões
      if (publicadorData.permissions.length > 0) {
        const permissionsToInsert = publicadorData.permissions.map(
          (permission) => ({
            publicador_id: id,
            permission,
          })
        );

        const { error: permError } = await supabase
          .from("publicador_permissions")
          .insert(permissionsToInsert);

        if (permError) {
          console.error("Erro ao atualizar permissões:", permError);
          return { success: false, error: "Erro ao atualizar permissões" };
        }
      }
    }

    const publicadorAtualizado = await getPublicadorById(id);
    return { success: true, publicador: publicadorAtualizado || undefined };
  } catch (error) {
    console.error("Erro ao atualizar publicador:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Deletar publicador
export async function deletePublicador(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se publicador existe
    const publicador = await getPublicadorById(id);
    if (!publicador) {
      return { success: false, error: "Publicador não encontrado" };
    }

    // Verificar se publicador está sendo usado em mecânicas
    const { data: mecanicasUsando, error: checkError } = await supabase
      .from("mecanicas")
      .select("id")
      .or(
        `indicador_entrada_id.eq.${id},indicador_auditorio_id.eq.${id},audio_video_id.eq.${id},volante_id.eq.${id},palco_id.eq.${id},leitor_sentinela_id.eq.${id},presidente_id.eq.${id}`
      );

    if (checkError) {
      console.error("Erro ao verificar uso do publicador:", checkError);
      return { success: false, error: "Erro ao verificar dependências" };
    }

    if (mecanicasUsando && mecanicasUsando.length > 0) {
      return {
        success: false,
        error:
          "Não é possível excluir publicador que está sendo usado em designações",
      };
    }

    // Deletar publicador (as permissões serão deletadas automaticamente por CASCADE)
    const { error } = await supabase.from("publicadores").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar publicador:", error);
      return { success: false, error: "Erro ao deletar publicador" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar publicador:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar apenas as permissões de um publicador
export async function updatePublicadorPermissions(
  publicadorId: string,
  permissions: string[],
  additionalData?: { pioneiro_regular?: boolean; pioneiro_auxiliar?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se publicador existe
    const publicadorExistente = await getPublicadorById(publicadorId);
    if (!publicadorExistente) {
      return { success: false, error: "Publicador não encontrado" };
    }

    // Atualizar privilégios de serviço se fornecidos
    if (additionalData) {
      const updateFields: Partial<
        Pick<Publicador, "pioneiro_regular" | "pioneiro_auxiliar">
      > = {};
      if (additionalData.pioneiro_regular !== undefined) {
        updateFields.pioneiro_regular = additionalData.pioneiro_regular;
      }
      if (additionalData.pioneiro_auxiliar !== undefined) {
        updateFields.pioneiro_auxiliar = additionalData.pioneiro_auxiliar;
      }

      if (Object.keys(updateFields).length > 0) {
        const { error: updateError } = await supabase
          .from("publicadores")
          .update(updateFields)
          .eq("id", publicadorId);

        if (updateError) {
          console.error(
            "Erro ao atualizar privilégios de serviço:",
            updateError
          );
          return {
            success: false,
            error: "Erro ao atualizar privilégios de serviço",
          };
        }
      }
    }

    // Remover todas as permissões existentes
    await supabase
      .from("publicador_permissions")
      .delete()
      .eq("publicador_id", publicadorId);

    // Adicionar novas permissões
    if (permissions.length > 0) {
      const permissionsToInsert = permissions.map((permission) => ({
        publicador_id: publicadorId,
        permission,
      }));

      const { error: permError } = await supabase
        .from("publicador_permissions")
        .insert(permissionsToInsert);

      if (permError) {
        console.error("Erro ao atualizar permissões:", permError);
        return { success: false, error: "Erro ao atualizar permissões" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar permissões do publicador:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Buscar permissões de um publicador específico
export async function getPublicadorPermissions(
  publicadorId: string
): Promise<string[]> {
  try {
    const { data: permissions, error } = await supabase
      .from("publicador_permissions")
      .select("permission")
      .eq("publicador_id", publicadorId);

    if (error) {
      console.error("Erro ao buscar permissões:", error);
      return [];
    }

    return permissions?.map((p) => p.permission) || [];
  } catch (error) {
    console.error("Erro ao buscar permissões do publicador:", error);
    return [];
  }
}

// ===== ESCALAS DE LIMPEZA =====

export interface EscalaLimpeza {
  id: string;
  grupo_id: string;
  data_limpeza: string;
  publicadores: string[];
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEscalaLimpezaData {
  grupo_id: string;
  data_limpeza: string;
  publicadores: string[];
  observacoes?: string;
}

export interface UpdateEscalaLimpezaData {
  grupo_id?: string;
  data_limpeza?: string;
  publicadores?: string[];
  observacoes?: string;
}

// Buscar todas as escalas de limpeza
export async function getAllEscalasLimpeza(): Promise<EscalaLimpeza[]> {
  try {
    const { data, error } = await supabase
      .from("escala_limpeza")
      .select("*")
      .order("data_limpeza", { ascending: true });

    if (error) {
      console.error("Erro ao buscar escalas de limpeza:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar escalas de limpeza:", error);
    return [];
  }
}

// Buscar escala de limpeza por ID
export async function getEscalaLimpezaById(
  id: string
): Promise<EscalaLimpeza | null> {
  try {
    const { data, error } = await supabase
      .from("escala_limpeza")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar escala de limpeza:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar escala de limpeza:", error);
    return null;
  }
}

// Criar nova escala de limpeza
export async function createEscalaLimpeza(
  escalaData: CreateEscalaLimpezaData
): Promise<{ success: boolean; error?: string; escala?: EscalaLimpeza }> {
  try {
    const { data, error } = await supabase
      .from("escala_limpeza")
      .insert([escalaData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar escala de limpeza:", error);
      return { success: false, error: error.message };
    }

    return { success: true, escala: data };
  } catch (error) {
    console.error("Erro ao criar escala de limpeza:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Atualizar escala de limpeza
export async function updateEscalaLimpeza(
  id: string,
  escalaData: UpdateEscalaLimpezaData
): Promise<{ success: boolean; error?: string; escala?: EscalaLimpeza }> {
  try {
    const { data, error } = await supabase
      .from("escala_limpeza")
      .update({
        ...escalaData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar escala de limpeza:", error);
      return { success: false, error: error.message };
    }

    return { success: true, escala: data };
  } catch (error) {
    console.error("Erro ao atualizar escala de limpeza:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

// Deletar escala de limpeza
export async function deleteEscalaLimpeza(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("escala_limpeza")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar escala de limpeza:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar escala de limpeza:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
