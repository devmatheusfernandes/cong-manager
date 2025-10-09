"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CongregacaoData {
  id: string
  nome: string
  endereco: string | null
  telefone: string | null
  email: string | null
  observacoes: string | null
  horario_reuniao_meio_semana: string | null
  horario_reuniao_fim_semana: string | null
  dia_reuniao_meio_semana: string | null
  dia_reuniao_fim_semana: string | null
  created_at: string
  updated_at: string
}

interface CongregacaoEditDialogProps {
  congregacao: CongregacaoData
  onUpdate: (updatedData: CongregacaoData) => void
}

export function CongregacaoEditDialog({ congregacao, onUpdate }: CongregacaoEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CongregacaoData>(congregacao)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/congregacao/${congregacao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar congregação')
      }

      const updatedCongregacao = await response.json()
      onUpdate(updatedCongregacao)
      setOpen(false)
      toast.success('Congregação atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar congregação:', error)
      toast.error('Erro ao atualizar congregação')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CongregacaoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'nome' || field === 'id' || field === 'created_at' || field === 'updated_at' 
        ? value 
        : value.trim() === '' ? null : value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Congregação</DialogTitle>
          <DialogDescription>
            Faça alterações nas informações da congregação aqui.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endereco" className="text-right">
                Endereço
              </Label>
              <Input
                id="endereco"
                value={formData.endereco || ''}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">
                Telefone
              </Label>
              <Input
                id="telefone"
                value={formData.telefone || ''}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observacoes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}