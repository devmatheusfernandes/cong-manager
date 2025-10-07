"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Publicador {
  id: string
  nome: string
  telefone?: string
  email?: string
  privilegio?: string
}

interface Grupo {
  id?: string
  nome: string
  superintendente_id?: string | null
  servo_id?: string | null
  ajudante_id?: string | null
  membros?: Publicador[]
}

interface GrupoDialogProps {
  grupo?: Grupo
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function GrupoDialog({ grupo, onSuccess, trigger }: GrupoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [formData, setFormData] = useState({
    nome: grupo?.nome || "",
    tipo_lideranca: grupo?.superintendente_id ? "superintendente" : grupo?.servo_id ? "servo" : "",
    lider_id: grupo?.superintendente_id || grupo?.servo_id || "none",
    ajudante_id: grupo?.ajudante_id || "none",
    membros: grupo?.membros?.map(m => m.id) || []
  })

  const isEditing = !!grupo?.id

  useEffect(() => {
    if (open) {
      fetchPublicadores()
    }
  }, [open])

  const fetchPublicadores = async () => {
    try {
      const response = await fetch('/api/publicadores')
      if (response.ok) {
        const data = await response.json()
        setPublicadores(data)
      }
    } catch (error) {
      console.error('Erro ao buscar publicadores:', error)
      toast.error('Erro ao carregar publicadores')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validações no frontend
      if (!formData.tipo_lideranca) {
        toast.error('Selecione o tipo de liderança (Superintendente ou Servo)')
        setLoading(false)
        return
      }

      if (formData.lider_id === "none") {
        toast.error('Selecione um líder para o grupo')
        setLoading(false)
        return
      }

      const payload = {
        nome: formData.nome,
        superintendente_id: formData.tipo_lideranca === "superintendente" ? formData.lider_id : null,
        servo_id: formData.tipo_lideranca === "servo" ? formData.lider_id : null,
        ajudante_id: formData.ajudante_id === "none" ? null : formData.ajudante_id,
        membros: formData.membros
      }

      const url = isEditing ? `/api/grupos/${grupo.id}` : '/api/grupos'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(isEditing ? 'Grupo atualizado com sucesso!' : 'Grupo criado com sucesso!')
        setOpen(false)
        onSuccess()
        if (!isEditing) {
          setFormData({
            nome: "",
            tipo_lideranca: "",
            lider_id: "none",
            ajudante_id: "none",
            membros: []
          })
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao salvar grupo')
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error)
      toast.error('Erro ao salvar grupo')
    } finally {
      setLoading(false)
    }
  }

  const handleMembroChange = (publicadorId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      membros: checked 
        ? [...prev.membros, publicadorId]
        : prev.membros.filter(id => id !== publicadorId)
    }))
  }

  const anciaos = publicadores.filter(p => p.privilegio === 'anciao')
  const servos = publicadores.filter(p => p.privilegio === 'servo_ministerial')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            {isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {isEditing ? 'Editar' : 'Novo Grupo'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Grupo' : 'Novo Grupo'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Grupo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Grupo A"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Liderança</Label>
              <Select
                value={formData.tipo_lideranca}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  tipo_lideranca: value,
                  lider_id: "none" // Reset líder quando mudar tipo
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo de liderança" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superintendente">Superintendente</SelectItem>
                  <SelectItem value="servo">Servo de Grupo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {formData.tipo_lideranca === "superintendente" ? "Superintendente" : 
                   formData.tipo_lideranca === "servo" ? "Servo de Grupo" : "Líder"}
                </Label>
                <Select
                  value={formData.lider_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, lider_id: value }))}
                  disabled={!formData.tipo_lideranca}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.tipo_lideranca ? "Selecione primeiro o tipo de liderança" :
                      formData.tipo_lideranca === "superintendente" ? "Selecionar superintendente" :
                      "Selecionar servo de grupo"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {formData.tipo_lideranca === "superintendente" && anciaos.map((anciao) => (
                      <SelectItem key={anciao.id} value={anciao.id}>
                        {anciao.nome}
                      </SelectItem>
                    ))}
                    {formData.tipo_lideranca === "servo" && servos.map((servo) => (
                      <SelectItem key={servo.id} value={servo.id}>
                        {servo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.tipo_lideranca === "superintendente" ? "Apenas anciãos podem ser superintendentes" :
                   formData.tipo_lideranca === "servo" ? "Apenas servos ministeriais podem ser servos de grupo" :
                   "Selecione o tipo de liderança primeiro"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Ajudante</Label>
                <Select
                  value={formData.ajudante_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ajudante_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar ajudante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {publicadores.map((publicador) => (
                      <SelectItem key={publicador.id} value={publicador.id}>
                        {publicador.nome}
                        {publicador.privilegio && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({publicador.privilegio})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Qualquer publicador pode ser ajudante
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Regras:</strong> Cada grupo deve ter um superintendente (ancião) OU um servo de grupo (servo ministerial). 
              Opcionalmente pode ter um ajudante (qualquer publicador).
            </p>
          </div>

          <div className="space-y-3">
            <Label>Membros do Grupo</Label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
              {publicadores.map((publicador) => (
                <div key={publicador.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`membro-${publicador.id}`}
                    checked={formData.membros.includes(publicador.id)}
                    onCheckedChange={(checked) => 
                      handleMembroChange(publicador.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`membro-${publicador.id}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {publicador.nome}
                    {publicador.privilegio && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({publicador.privilegio})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}