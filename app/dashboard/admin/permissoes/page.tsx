"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ShoppingCart,
  MessageSquare,
  Users,
  Mic,
  Sparkles,
  Settings,
  Crown,
  User,
  UserCheck,
} from "lucide-react";
import mockData from "@/data/mock-data.json";
import {
  PERMISSOES_LABELS,
  PERMISSOES_DESCRICOES,
  type PermissaoSistema,
} from "@/lib/permissions";

// Ícones para cada permissão
const PERMISSOES_ICONS: Record<PermissaoSistema, React.ComponentType<{ className?: string }>> = {
  perm_carrinho: ShoppingCart,
  perm_pregacao: MessageSquare,
  perm_nvc: Users,
  perm_mecanicas: Settings,
  perm_discurso: Mic,
  perm_limpeza: Sparkles,
  perm_publicadores: UserCheck,
};

export default function AdminPermissoesPage() {
  const [permissoes, setPermissoes] = useState(mockData.permissoes_sistema);

  // Obter usuários da congregação
  const usuarios = mockData.usuarios.filter((usuario) =>
    mockData.usuarios_congregacoes.some(
      (uc) =>
        uc.usuario_id === usuario.id &&
        uc.congregacao_id === "660e8400-e29b-41d4-a716-446655440001"
    )
  );

  // Verificar se usuário é responsável
  const isResponsavel = (usuarioId: string) => {
    return (
      mockData.usuarios_congregacoes.find(
        (uc) =>
          uc.usuario_id === usuarioId &&
          uc.congregacao_id === "660e8400-e29b-41d4-a716-446655440001"
      )?.eh_responsavel === true
    );
  };

  // Atualizar permissão
  const atualizarPermissao = (
    usuarioId: string,
    permissao: PermissaoSistema,
    valor: boolean
  ) => {
    setPermissoes((prev) =>
      prev.map((p) =>
        p.usuario_id === usuarioId ? { ...p, [permissao]: valor } : p
      )
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold">Administração de Permissões</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie quem pode editar informações em cada seção do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {usuarios.map((usuario) => {
          const permissaoUsuario = permissoes.find(
            (p) => p.usuario_id === usuario.id
          );
          const ehResponsavel = isResponsavel(usuario.id);

          return (
            <Card key={usuario.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {ehResponsavel ? (
                        <Crown className="h-5 w-5 text-amber-600" />
                      ) : (
                        <User className="h-5 w-5 text-slate-500" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {usuario.nome}
                        </CardTitle>
                        <CardDescription>{usuario.email}</CardDescription>
                      </div>
                    </div>
                    {ehResponsavel && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800"
                      >
                        Responsável
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {ehResponsavel ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Como responsável da congregação, este usuário tem acesso
                      total a todas as seções.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(PERMISSOES_LABELS).map(([key, label]) => {
                      const permissaoKey = key as PermissaoSistema;
                      const Icon = PERMISSOES_ICONS[permissaoKey];
                      const temPermissao =
                        permissaoUsuario?.[permissaoKey] || false;

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`h-5 w-5 ${
                                temPermissao
                                  ? "text-teal-600"
                                  : "text-slate-400"
                              }`}
                            />
                            <div>
                              <Label className="text-sm font-medium">
                                {label}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {PERMISSOES_DESCRICOES[permissaoKey]}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={temPermissao}
                            onCheckedChange={(checked) =>
                              atualizarPermissao(
                                usuario.id,
                                permissaoKey,
                                checked
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Legenda das Permissões</h3>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              {Object.entries(PERMISSOES_LABELS).map(([key, label]) => {
                const permissaoKey = key as PermissaoSistema;
                const Icon = PERMISSOES_ICONS[permissaoKey];

                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-600" />
                    <span className="font-medium">{label}:</span>
                    <span className="text-muted-foreground text-xs">
                      {PERMISSOES_DESCRICOES[permissaoKey]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
