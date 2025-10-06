"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PermissionWrapper } from "@/components/permission-wrapper";
import { useAuth } from "@/components/auth-provider";
import { getAllUsers, User, deleteUser } from "@/lib/auth";
import { UserManagementDialog } from "@/components/user-management-dialog";
import { UserPermissionsDialog } from "@/components/user-permissions-dialog";
import {
  Shield,
  User as UserIcon,
  Settings,
  Lock,
  Plus,
  Edit,
  Trash2,
  Key,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para dialogs
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setUserDialogOpen(true);
  };

  const handleManagePermissions = (userToManage: User) => {
    setSelectedUser(userToManage);
    setPermissionsDialogOpen(true);
  };

  const handleDeleteUser = (userToDelete: User) => {
    setUserToDelete(userToDelete);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      toast.success("Usuário excluído com sucesso");
      await fetchUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleUserSaved = async () => {
    setUserDialogOpen(false);
    setSelectedUser(null);
    await fetchUsers();
  };

  const handlePermissionsSaved = async () => {
    setPermissionsDialogOpen(false);
    setSelectedUser(null);
    await fetchUsers();
  };

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
                <UserIcon className="h-5 w-5" />
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
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum usuário logado</p>
              )}
            </CardContent>
          </Card>

          {/* Lista de todos os usuários */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Usuários do Sistema
                  </CardTitle>
                  <CardDescription>
                    Lista de todos os usuários cadastrados e suas permissões
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCreateUser}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Carregando usuários...</p>
              ) : (
                <div className="space-y-4">
                  {allUsers.map((systemUser) => (
                    <div
                      key={systemUser.id}
                      className={`p-4 rounded-lg border ${
                        user?.id === systemUser.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {systemUser.username}
                          </span>
                          {user?.id === systemUser.id && (
                            <Badge variant="default" className="text-xs">
                              Você
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              systemUser.role === "admin"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {systemUser.role}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(systemUser)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleManagePermissions(systemUser)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Key className="h-3 w-3" />
                            </Button>
                            {user?.id !== systemUser.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(systemUser)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {systemUser.permissions.map((permission) => (
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
              )}
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

      {/* Dialogs */}
      <UserManagementDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
        onUserSaved={handleUserSaved}
      />

      <UserPermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        user={selectedUser}
        onPermissionsUpdated={handlePermissionsSaved}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{userToDelete?.username}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionWrapper>
  );
}
