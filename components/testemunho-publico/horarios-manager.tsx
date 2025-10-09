"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Clock } from "lucide-react"

interface Local {
  id: string
  nome: string
  endereco: string
}

interface Horario {
  id: string
  local_id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  ativo: boolean
  locais_carrinho: Local
}

interface HorarioFormData {
  local_id: string
  dia_semana: string
  hora_inicio: string
  hora_fim: string
}

const DIAS_SEMANA = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" }
]

export function HorariosManager() {
  const [locais, setLocais] = useState<Local[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null)
  const [formData, setFormData] = useState<HorarioFormData>({
    local_id: "",
    dia_semana: "",
    hora_inicio: "",
    hora_fim: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [locaisResponse, horariosResponse] = await Promise.all([
        fetch("/api/testemunho-publico/locais"),
        fetch("/api/testemunho-publico/horarios")
      ])

      if (locaisResponse.ok) {
        const locaisData = await locaisResponse.json()
        setLocais(locaisData)
      }

      if (horariosResponse.ok) {
        const horariosData = await horariosResponse.json()
        setHorarios(horariosData)
      }
    } catch (error) {
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.local_id || !formData.dia_semana || !formData.hora_inicio || !formData.hora_fim) {
      toast.error("Todos os campos são obrigatórios")
      return
    }

    // Validar se hora_fim é maior que hora_inicio
    if (formData.hora_inicio >= formData.hora_fim) {
      toast.error("Hora de fim deve ser maior que hora de início")
      return
    }

    try {
      const url = editingHorario 
        ? `/api/testemunho-publico/horarios/${editingHorario.id}`
        : "/api/testemunho-publico/horarios"
      
      const method = editingHorario ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          dia_semana: parseInt(formData.dia_semana)
        })
      })

      if (response.ok) {
        toast.success(editingHorario ? "Horário atualizado com sucesso!" : "Horário criado com sucesso!")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao salvar horário")
      }
    } catch (error) {
      toast.error("Erro ao salvar horário")
    }
  }

  const handleEdit = (horario: Horario) => {
    setEditingHorario(horario)
    setFormData({
      local_id: horario.local_id,
      dia_semana: horario.dia_semana.toString(),
      hora_inicio: horario.hora_inicio,
      hora_fim: horario.hora_fim
    })
    setDialogOpen(true)
  }

  const handleDelete = async (horario: Horario) => {
    if (!confirm(`Tem certeza que deseja excluir este horário?`)) {
      return
    }

    try {
      const response = await fetch(`/api/testemunho-publico/horarios/${horario.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Horário excluído com sucesso!")
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao excluir horário")
      }
    } catch (error) {
      toast.error("Erro ao excluir horário")
    }
  }

  const resetForm = () => {
    setFormData({
      local_id: "",
      dia_semana: "",
      hora_inicio: "",
      hora_fim: ""
    })
    setEditingHorario(null)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  const getDiaSemanaLabel = (dia: number) => {
    return DIAS_SEMANA.find(d => d.value === dia.toString())?.label || ""
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove seconds from HH:MM:SS
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários de Testemunho Público
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)} disabled={locais.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingHorario ? "Editar Horário" : "Novo Horário"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="local_id">Local *</Label>
                  <Select value={formData.local_id} onValueChange={(value) => setFormData({ ...formData, local_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um local" />
                    </SelectTrigger>
                    <SelectContent>
                      {locais.map((local) => (
                        <SelectItem key={local.id} value={local.id}>
                          {local.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dia_semana">Dia da Semana *</Label>
                  <Select value={formData.dia_semana} onValueChange={(value) => setFormData({ ...formData, dia_semana: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_SEMANA.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hora_inicio">Hora de Início *</Label>
                    <Input
                      id="hora_inicio"
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hora_fim">Hora de Fim *</Label>
                    <Input
                      id="hora_fim"
                      type="time"
                      value={formData.hora_fim}
                      onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingHorario ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {locais.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum local cadastrado ainda.</p>
            <p className="text-sm">Cadastre locais primeiro para criar horários.</p>
          </div>
        ) : horarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum horário cadastrado ainda.</p>
            <p className="text-sm">Clique em "Novo Horário" para começar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Local</TableHead>
                <TableHead>Dia da Semana</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {horarios.map((horario) => (
                <TableRow key={horario.id}>
                  <TableCell className="font-medium">
                    {horario.locais_carrinho?.nome || 'Local não informado'}
                  </TableCell>
                  <TableCell>
                    {getDiaSemanaLabel(horario.dia_semana)}
                  </TableCell>
                  <TableCell>
                    {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fim)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={horario.ativo ? "default" : "secondary"}>
                      {horario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(horario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(horario)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}