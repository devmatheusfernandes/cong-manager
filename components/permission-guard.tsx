"use client";

import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock } from "lucide-react";
import { podeEditar, type PermissaoSistema } from "@/lib/permissions";

interface PermissionGuardProps {
  children: ReactNode;
  permissao: PermissaoSistema;
  usuarioId?: string;
  congregacaoId?: string;
  fallback?: ReactNode;
  showAlert?: boolean;
}

/**
 * Componente que protege conteúdo baseado em permissões
 * Só renderiza o children se o usuário tiver a permissão necessária
 */
export function PermissionGuard({
  children,
  permissao,
  usuarioId = "550e8400-e29b-41d4-a716-446655440001", // ID padrão para teste
  congregacaoId = "660e8400-e29b-41d4-a716-446655440001", // ID padrão para teste
  fallback,
  showAlert = true
}: PermissionGuardProps) {
  const temPermissao = podeEditar(usuarioId, congregacaoId, permissao);

  if (temPermissao) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showAlert) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <Lock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Você não tem permissão para editar esta seção. Entre em contato com o responsável da congregação.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * Hook para verificar permissões em componentes
 */
export function usePermissionCheck(
  permissao: PermissaoSistema,
  usuarioId: string = "550e8400-e29b-41d4-a716-446655440001",
  congregacaoId: string = "660e8400-e29b-41d4-a716-446655440001"
) {
  return {
    podeEditar: podeEditar(usuarioId, congregacaoId, permissao),
    permissao
  };
}

/**
 * Componente para botões que só aparecem se o usuário tiver permissão
 */
interface PermissionButtonProps {
  children: ReactNode;
  permissao: PermissaoSistema;
  usuarioId?: string;
  congregacaoId?: string;
  className?: string;
}

export function PermissionButton({
  children,
  permissao,
  usuarioId = "550e8400-e29b-41d4-a716-446655440001",
  congregacaoId = "660e8400-e29b-41d4-a716-446655440001",
  className
}: PermissionButtonProps) {
  const temPermissao = podeEditar(usuarioId, congregacaoId, permissao);

  if (!temPermissao) {
    return null;
  }

  return <div className={className}>{children}</div>;
}

/**
 * Componente para mostrar status de permissão
 */
interface PermissionStatusProps {
  permissao: PermissaoSistema;
  usuarioId?: string;
  congregacaoId?: string;
  showIcon?: boolean;
}

export function PermissionStatus({
  permissao,
  usuarioId = "550e8400-e29b-41d4-a716-446655440001",
  congregacaoId = "660e8400-e29b-41d4-a716-446655440001",
  showIcon = true
}: PermissionStatusProps) {
  const temPermissao = podeEditar(usuarioId, congregacaoId, permissao);

  return (
    <div className={`flex items-center gap-2 text-sm ${
      temPermissao ? 'text-teal-600' : 'text-slate-400'
    }`}>
      {showIcon && (
        temPermissao ? (
          <Shield className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )
      )}
      <span>
        {temPermissao ? 'Pode editar' : 'Somente leitura'}
      </span>
    </div>
  );
}