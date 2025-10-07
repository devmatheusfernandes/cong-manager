"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCheck, Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Territorio {
  id: string
  nome: string
  cidade?: string
}

interface Publicador {
  id: string
  nome: string
  telefone?: string
  email?: string
}

interface DesignarTerritorioDialogProps {
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function DesignarTerritorioDialog({ onSuccess, trigger }: DesignarTerritorioDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [territorios, setTerritorios] = useState<Territorio[]>([])
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [formData, setFormData] = useState({
    territorio_id: "",
    publicador_id: "",
    data_inicio: "",
    data_fim: "",
    observacoes: ""
  })

  // Buscar territórios e publicadores quando o modal abrir
  useEffect(() => {
    if (open) {
      fetchTerritorios()
      fetchPublicadores()
    }
  }, [open])

  const fetchTerritorios = async () => {
    try {
      const response = await fetch('/api/territorios')
      if (response.ok) {
        const data = await response.json()
        // Filtrar apenas territórios que não estão atualmente designados
        const territoriosDisponiveis = data.filter((territorio: any) => {
          return !territorio.designacoes?.some((designacao: any) => designacao.status === 'ativo')
        })
        setTerritorios(territoriosDisponiveis)
      }
    } catch (error) {
      console.error('Erro ao buscar territórios:', error)
      toast.error('Erro ao carregar territórios')
    }
  }

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
      // Validações
      if (!formData.territorio_id || !formData.publicador_id || !formData.data_inicio) {
        toast.error('Território, publicador e data de início são obrigatórios')
        setLoading(false)
        return
      }

      // Validar se data de fim é posterior à data de início
      if (formData.data_fim && formData.data_inicio && formData.data_fim <= formData.data_inicio) {
        toast.error('A data de devolução deve ser posterior à data de início')
        setLoading(false)
        return
      }

      const payload = {
        territorio_id: formData.territorio_id,
        publicador_id: formData.publicador_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        observacoes: formData.observacoes || null
      }

      const response = await fetch('/api/territorios/designacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao designar território')
      }

      toast.success('Território designado com sucesso!')
      setOpen(false)
      onSuccess()
      
      // Limpar formulário
      setFormData({
        territorio_id: "",
        publicador_id: "",
        data_inicio: "",
        data_fim: "",
        observacoes: ""
      })
    } catch (error) {
      console.error('Erro ao designar território:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao designar território')
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button size="sm" variant="outline">
      <UserCheck className="h-4 w-4 mr-2" />
      Designar Território
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Designar Território
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="territorio">Território *</Label>
            <Select
              value={formData.territorio_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, territorio_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um território" />
              </SelectTrigger>
              <SelectContent>
                {territorios.map((territorio) => (
                  <SelectItem key={territorio.id} value={territorio.id}>
                    {territorio.nome} {territorio.cidade && `- ${territorio.cidade}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {territorios.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum território disponível para designação
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicador">Publicador *</Label>
            <Select
              value={formData.publicador_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, publicador_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um publicador" />
              </SelectTrigger>
              <SelectContent>
                {publicadores.map((publicador) => (
                  <SelectItem key={publicador.id} value={publicador.id}>
                    {publicador.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Devolução</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                min={formData.data_inicio}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              className="w-full min-h-[80px] p-3 border border-input rounded-md bg-background text-sm resize-vertical"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre a designação..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Designar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}