"use client";

import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock } from "lucide-react";
import { canEdit } from "@/lib/auth";
import { useAuth } from "@/components/auth-provider";

interface PermissionGuardProps {
  children: ReactNode;
  permissao: string;
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
  fallback,
  showAlert = true
}: PermissionGuardProps) {
  const { user } = useAuth();
  const temPermissao = canEdit(user, permissao);

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
export function usePermissionCheck(permissao: string) {
  const { user } = useAuth();
  return {
    podeEditar: canEdit(user, permissao),
    permissao
  };
}

/**
 * Componente para botões que só aparecem se o usuário tiver permissão
 */
interface PermissionButtonProps {
  children: ReactNode;
  permissao: string;
  className?: string;
}

export function PermissionButton({
  children,
  permissao,
  className
}: PermissionButtonProps) {
  const { user } = useAuth();
  const temPermissao = canEdit(user, permissao);

  if (!temPermissao) {
    return null;
  }

  return <div className={className}>{children}</div>;
}

/**
 * Componente para mostrar status de permissão
 */
interface PermissionStatusProps {
  permissao: string;
  showIcon?: boolean;
}

export function PermissionStatus({
  permissao,
  showIcon = true
}: PermissionStatusProps) {
  const { user } = useAuth();
  const temPermissao = canEdit(user, permissao);

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