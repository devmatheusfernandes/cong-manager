import mockData from "@/data/mock-data.json";

// Tipos para as permissões de sistema
export type PermissaoSistema = 
  | 'perm_carrinho'
  | 'perm_pregacao' 
  | 'perm_nvc'
  | 'perm_mecanicas'
  | 'perm_discurso'
  | 'perm_limpeza';

// Labels das permissões para exibição
export const PERMISSOES_LABELS: Record<PermissaoSistema, string> = {
  perm_carrinho: 'Carrinho',
  perm_pregacao: 'Pregação',
  perm_nvc: 'Nossa Vida Cristã',
  perm_mecanicas: 'Mecânicas',
  perm_discurso: 'Discursos',
  perm_limpeza: 'Limpeza'
};

// Descrições das permissões
export const PERMISSOES_DESCRICOES: Record<PermissaoSistema, string> = {
  perm_carrinho: 'Gerenciar locais e escalas de carrinho',
  perm_pregacao: 'Gerenciar territórios e atividades de pregação',
  perm_nvc: 'Gerenciar programação da reunião Nossa Vida Cristã',
  perm_mecanicas: 'Gerenciar escalas de som, palco e indicadores',
  perm_discurso: 'Gerenciar discursos públicos e oradores',
  perm_limpeza: 'Gerenciar grupos e escalas de limpeza'
};

/**
 * Verifica se um usuário tem uma permissão específica
 * @param usuarioId ID do usuário
 * @param congregacaoId ID da congregação
 * @param permissao Permissão a ser verificada
 * @returns true se o usuário tem a permissão, false caso contrário
 */
export function verificarPermissao(
  usuarioId: string,
  congregacaoId: string,
  permissao: PermissaoSistema
): boolean {
  const permissaoUsuario = mockData.permissoes_sistema.find(
    p => p.usuario_id === usuarioId && p.congregacao_id === congregacaoId
  );

  if (!permissaoUsuario) {
    return false;
  }

  return permissaoUsuario[permissao] === true;
}

/**
 * Verifica se um usuário é responsável pela congregação
 * @param usuarioId ID do usuário
 * @param congregacaoId ID da congregação
 * @returns true se o usuário é responsável, false caso contrário
 */
export function verificarResponsavel(
  usuarioId: string,
  congregacaoId: string
): boolean {
  const usuarioCongregacao = mockData.usuarios_congregacoes.find(
    uc => uc.usuario_id === usuarioId && uc.congregacao_id === congregacaoId
  );

  return usuarioCongregacao?.eh_responsavel === true;
}

/**
 * Obtém todas as permissões de um usuário
 * @param usuarioId ID do usuário
 * @param congregacaoId ID da congregação
 * @returns Objeto com todas as permissões do usuário
 */
export function obterPermissoesUsuario(
  usuarioId: string,
  congregacaoId: string
) {
  const permissaoUsuario = mockData.permissoes_sistema.find(
    p => p.usuario_id === usuarioId && p.congregacao_id === congregacaoId
  );

  if (!permissaoUsuario) {
    return {
      perm_carrinho: false,
      perm_pregacao: false,
      perm_nvc: false,
      perm_mecanicas: false,
      perm_discurso: false,
      perm_limpeza: false
    };
  }

  return {
    perm_carrinho: permissaoUsuario.perm_carrinho,
    perm_pregacao: permissaoUsuario.perm_pregacao,
    perm_nvc: permissaoUsuario.perm_nvc,
    perm_mecanicas: permissaoUsuario.perm_mecanicas,
    perm_discurso: permissaoUsuario.perm_discurso,
    perm_limpeza: permissaoUsuario.perm_limpeza
  };
}

/**
 * Verifica se o usuário pode editar uma seção específica
 * @param usuarioId ID do usuário
 * @param congregacaoId ID da congregação
 * @param secao Seção que se deseja verificar
 * @returns true se pode editar, false caso contrário
 */
export function podeEditar(
  usuarioId: string,
  congregacaoId: string,
  secao: PermissaoSistema
): boolean {
  // Responsáveis sempre podem editar tudo
  if (verificarResponsavel(usuarioId, congregacaoId)) {
    return true;
  }

  // Verifica permissão específica
  return verificarPermissao(usuarioId, congregacaoId, secao);
}

/**
 * Hook para usar em componentes React (simulado para uso futuro)
 * @param usuarioId ID do usuário
 * @param congregacaoId ID da congregação
 * @returns Objeto com funções de verificação de permissão
 */
export function usePermissoes(usuarioId: string, congregacaoId: string) {
  const permissoes = obterPermissoesUsuario(usuarioId, congregacaoId);
  const ehResponsavel = verificarResponsavel(usuarioId, congregacaoId);

  return {
    permissoes,
    ehResponsavel,
    verificarPermissao: (permissao: PermissaoSistema) => 
      verificarPermissao(usuarioId, congregacaoId, permissao),
    podeEditar: (secao: PermissaoSistema) => 
      podeEditar(usuarioId, congregacaoId, secao)
  };
}