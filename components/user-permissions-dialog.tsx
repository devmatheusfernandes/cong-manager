"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  User,
  Permission,
  updateUserPermissions,
  getUserFromDatabase,
} from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onPermissionsUpdated: () => void;
}

const ALL_PERMISSIONS: Permission[] = [
  "view_all",
  "edit_all",
  "view_discursos",
  "edit_discursos",
  "view_mecanicas",
  "edit_mecanicas",
  "view_limpeza",
  "edit_limpeza",
  "view_nvc",
  "edit_nvc",
  "view_carrinho",
  "edit_carrinho",
  "view_grupos",
  "edit_grupos",
  "view_pregacao",
  "edit_pregacao",
  "view_publicadores",
  "edit_publicadores",
];

const PERMISSION_LABELS: Record<Permission, string> = {
  view_all: "Ver Tudo",
  edit_all: "Editar Tudo",
  view_discursos: "Ver Discursos",
  edit_discursos: "Editar Discursos",
  view_mecanicas: "Ver Mecânicas",
  edit_mecanicas: "Editar Mecânicas",
  view_limpeza: "Ver Limpeza",
  edit_limpeza: "Editar Limpeza",
  view_nvc: "Ver NVC",
  edit_nvc: "Editar NVC",
  view_carrinho: "Ver Carrinho",
  edit_carrinho: "Editar Carrinho",
  view_grupos: "Ver Grupos",
  edit_grupos: "Editar Grupos",
  view_pregacao: "Ver Pregação",
  edit_pregacao: "Editar Pregação",
  view_publicadores: "Ver Publicadores",
  edit_publicadores: "Editar Publicadores",
};

const PERMISSION_CATEGORIES = {
  Geral: ["view_all", "edit_all"],
  Discursos: ["view_discursos", "edit_discursos"],
  Mecânicas: ["view_mecanicas", "edit_mecanicas"],
  Limpeza: ["view_limpeza", "edit_limpeza"],
  NVC: ["view_nvc", "edit_nvc"],
  Carrinho: ["view_carrinho", "edit_carrinho"],
  Grupos: ["view_grupos", "edit_grupos"],
  Pregação: ["view_pregacao", "edit_pregacao"],
  Publicadores: ["view_publicadores", "edit_publicadores"],
};

export function UserPermissionsDialog({
  open,
  onOpenChange,
  user,
  onPermissionsUpdated,
}: UserPermissionsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (user && open) {
      // Buscar dados atualizados do usuário
      const fetchUserData = async () => {
        const userData = await getUserFromDatabase(user.id);
        if (userData) {
          setCurrentUser(userData);
          setSelectedPermissions([...userData.permissions]);
        }
      };
      fetchUserData();
    } else {
      setSelectedPermissions([]);
      setCurrentUser(null);
    }
  }, [user, open]);

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, permission] : prev.filter((p) => p !== permission)
    );
  };

  const handleSelectAll = (category: string, checked: boolean) => {
    const categoryPermissions =
      PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];

    setSelectedPermissions((prev) => {
      if (checked) {
        // Adicionar todas as permissões da categoria que não estão selecionadas
        const newPermissions = categoryPermissions.filter(
          (p) => !prev.includes(p as Permission)
        );
        return [...prev, ...(newPermissions as Permission[])];
      } else {
        // Remover todas as permissões da categoria
        return prev.filter((p) => !categoryPermissions.includes(p));
      }
    });
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryPermissions =
      PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    return categoryPermissions.every((p) =>
      selectedPermissions.includes(p as Permission)
    );
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissions =
      PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    return (
      categoryPermissions.some((p) =>
        selectedPermissions.includes(p as Permission)
      ) && !isCategoryFullySelected(category)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Usuário não encontrado");
      return;
    }

    setLoading(true);

    try {
      const result = await updateUserPermissions(
        currentUser.id,
        selectedPermissions
      );

      if (result.success) {
        toast.success("Permissões atualizadas com sucesso!");
        onPermissionsUpdated();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Erro ao atualizar permissões");
      }
    } catch (error) {
      toast.error("Erro interno do servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Gerenciar Permissões - {currentUser.username}
          </DialogTitle>
          <DialogDescription>
            Selecione as permissões que este usuário deve ter no sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {Object.entries(PERMISSION_CATEGORIES).map(
              ([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center space-x-2 border-b pb-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={isCategoryFullySelected(category)}
                      ref={(el) => {
                        if (el) {
                          (el as HTMLInputElement).indeterminate =
                            isCategoryPartiallySelected(category);
                        }
                      }}
                      onCheckedChange={(checked) =>
                        handleSelectAll(category, checked as boolean)
                      }
                      disabled={loading}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-base font-semibold cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 ml-6">
                    {permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={permission}
                          checked={selectedPermissions.includes(
                            permission as Permission
                          )}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission as Permission,
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label
                          htmlFor={permission}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {PERMISSION_LABELS[permission as Permission]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Resumo das permissões selecionadas */}
          <div className="bg-muted p-4 rounded-lg">
            <Label className="text-sm font-medium">
              Permissões Selecionadas: {selectedPermissions.length} de{" "}
              {ALL_PERMISSIONS.length}
            </Label>
            {selectedPermissions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedPermissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary"
                  >
                    {PERMISSION_LABELS[permission]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Permissões
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
