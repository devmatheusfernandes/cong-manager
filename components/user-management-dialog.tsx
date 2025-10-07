"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { User, UserRole, Permission, CreateUserData, UpdateUserData, createUser, updateUser } from "@/lib/auth"
import { Loader2, Eye, EyeOff } from "lucide-react"

interface UserManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null // Se fornecido, é modo edição
  onUserSaved: () => void
}

const ALL_PERMISSIONS: Permission[] = [
  'view_all',
  'edit_all',
  'view_discursos',
  'edit_discursos',
  'view_mecanicas',
  'edit_mecanicas',
  'view_limpeza',
  'edit_limpeza',
  'view_nvc',
  'edit_nvc',
  'view_carrinho',
  'edit_carrinho',
  'view_grupos',
  'edit_grupos',
  'view_pregacao',
  'edit_pregacao',
  'view_publicadores',
  'edit_publicadores'
]

const USER_ROLES: UserRole[] = [
  'admin',
  'carrinho',
  'nvc',
  'pregacao',
  'mecanicas',
  'oradores',
  'limpeza'
]

const PERMISSION_LABELS: Record<Permission, string> = {
  'view_all': 'Ver Tudo',
  'edit_all': 'Editar Tudo',
  'view_discursos': 'Ver Discursos',
  'edit_discursos': 'Editar Discursos',
  'view_mecanicas': 'Ver Mecânicas',
  'edit_mecanicas': 'Editar Mecânicas',
  'view_limpeza': 'Ver Limpeza',
  'edit_limpeza': 'Editar Limpeza',
  'view_nvc': 'Ver NVC',
  'edit_nvc': 'Editar NVC',
  'view_carrinho': 'Ver Carrinho',
  'edit_carrinho': 'Editar Carrinho',
  'view_grupos': 'Ver Grupos',
  'edit_grupos': 'Editar Grupos',
  'view_pregacao': 'Ver Pregação',
  'edit_pregacao': 'Editar Pregação',
  'view_publicadores': 'Ver Publicadores',
  'edit_publicadores': 'Editar Publicadores'
}

const ROLE_LABELS: Record<UserRole, string> = {
  'admin': 'Administrador',
  'carrinho': 'Carrinho',
  'nvc': 'NVC',
  'pregacao': 'Pregação',
  'mecanicas': 'Mecânicas',
  'oradores': 'Oradores',
  'limpeza': 'Limpeza'
}

export function UserManagementDialog({ open, onOpenChange, user, onUserSaved }: UserManagementDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '' as UserRole | '',
    permissions: [] as Permission[]
  })

  const isEditMode = !!user

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: user.password,
        role: user.role,
        permissions: [...user.permissions]
      })
    } else {
      setFormData({
        username: '',
        password: '',
        role: '',
        permissions: []
      })
    }
  }, [user, open])

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim()) {
      toast.error("Nome de usuário é obrigatório")
      return
    }

    if (!formData.password.trim()) {
      toast.error("Senha é obrigatória")
      return
    }

    if (!formData.role) {
      toast.error("Função é obrigatória")
      return
    }

    setLoading(true)

    try {
      let result

      if (isEditMode && user) {
        // Modo edição
        const updateData: UpdateUserData = {
          username: formData.username,
          password: formData.password,
          role: formData.role
        }
        result = await updateUser(user.id, updateData)
      } else {
        // Modo criação
        const createData: CreateUserData = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          permissions: formData.permissions
        }
        result = await createUser(createData)
      }

      if (result.success) {
        toast.success(isEditMode ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!")
        onUserSaved()
        onOpenChange(false)
      } else {
        toast.error(result.error || "Erro ao salvar usuário")
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Erro interno do servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Usuário" : "Criar Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Edite as informações do usuário abaixo." 
              : "Preencha as informações para criar um novo usuário."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome de usuário */}
          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Digite o nome de usuário"
              disabled={loading}
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite a senha"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Função */}
          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissões */}
          <div className="space-y-4">
            <Label>Permissões</Label>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
              {ALL_PERMISSIONS.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission, checked as boolean)
                    }
                    disabled={loading}
                  />
                  <Label 
                    htmlFor={permission} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {PERMISSION_LABELS[permission]}
                  </Label>
                </div>
              ))}
            </div>
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
              {isEditMode ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}