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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface HorariosReuniaoData {
  id: string
  horario_reuniao_meio_semana: string
  horario_reuniao_fim_semana: string
  dia_reuniao_meio_semana: string
  dia_reuniao_fim_semana: string
}

interface HorariosReuniaoDialogProps {
  congregacao: HorariosReuniaoData
  onUpdate: (updatedData: any) => void
}

const diasSemana = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
]

export function HorariosReuniaoDialog({ congregacao, onUpdate }: HorariosReuniaoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<HorariosReuniaoData>(congregacao)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/congregacao/${congregacao.id}/horarios`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          horario_reuniao_meio_semana: formData.horario_reuniao_meio_semana,
          horario_reuniao_fim_semana: formData.horario_reuniao_fim_semana,
          dia_reuniao_meio_semana: formData.dia_reuniao_meio_semana,
          dia_reuniao_fim_semana: formData.dia_reuniao_fim_semana,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar horários')
      }

      const updatedCongregacao = await response.json()
      onUpdate(updatedCongregacao)
      setOpen(false)
      toast.success('Horários atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar horários:', error)
      toast.error('Erro ao atualizar horários')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof HorariosReuniaoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Configurar Horários
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Horários das Reuniões</DialogTitle>
          <DialogDescription>
            Configure os dias e horários das reuniões da congregação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Reunião de Meio de Semana */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground border-b pb-2">
                Reunião de Meio de Semana
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dia-meio-semana">Dia da Semana</Label>
                  <Select
                    value={formData.dia_reuniao_meio_semana || ""}
                    onValueChange={(value) => handleInputChange('dia_reuniao_meio_semana', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario-meio-semana">Horário</Label>
                  <Input
                    id="horario-meio-semana"
                    type="time"
                    value={formData.horario_reuniao_meio_semana || ""}
                    onChange={(e) => handleInputChange('horario_reuniao_meio_semana', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Reunião de Fim de Semana */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground border-b pb-2">
                Reunião de Fim de Semana
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dia-fim-semana">Dia da Semana</Label>
                  <Select
                    value={formData.dia_reuniao_fim_semana || ""}
                    onValueChange={(value) => handleInputChange('dia_reuniao_fim_semana', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario-fim-semana">Horário</Label>
                  <Input
                    id="horario-fim-semana"
                    type="time"
                    value={formData.horario_reuniao_fim_semana || ""}
                    onChange={(e) => handleInputChange('horario_reuniao_fim_semana', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar horários
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}