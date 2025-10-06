"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PermissionWrapper } from "@/components/permission-wrapper";
import { useAuth } from "@/components/auth-provider";
import { FIXED_USERS } from "@/lib/auth";
import { Shield, User, Settings, Lock } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <PermissionWrapper 
      section="admin" 
      action="view"
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Administração</h2>
        </div>

        <div className="grid gap-6">
          {/* Informações do usuário atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Usuário Atual
              </CardTitle>
              <CardDescription>
                Informações sobre sua sessão atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Nome de usuário:</span>
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Função:</span>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Permissões:</span>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum usuário logado</p>
              )}
            </CardContent>
          </Card>

          {/* Lista de todos os usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Usuários do Sistema
              </CardTitle>
              <CardDescription>
                Lista de todos os usuários cadastrados e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {FIXED_USERS.map((fixedUser) => (
                  <div 
                    key={fixedUser.id} 
                    className={`p-4 rounded-lg border ${
                      user?.id === fixedUser.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fixedUser.username}</span>
                        {user?.id === fixedUser.id && (
                          <Badge variant="default" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <Badge 
                        variant={fixedUser.role === 'admin' ? 'default' : 'secondary'}
                      >
                        {fixedUser.role}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {fixedUser.permissions.map((permission) => (
                        <Badge 
                          key={permission} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações administrativas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Administrativas</CardTitle>
              <CardDescription>
                Ferramentas de gerenciamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled>
                  Backup de Dados
                </Button>
                <Button variant="outline" disabled>
                  Relatórios
                </Button>
                <Button variant="outline" disabled>
                  Configurações
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Funcionalidades em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionWrapper>
  );
}