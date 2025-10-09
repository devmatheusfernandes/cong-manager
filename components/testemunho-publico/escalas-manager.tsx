"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Users, Calendar, RefreshCw } from "lucide-react"

interface Publicador {
  id: string
  nome: string
}

interface Local {
  id: string
  nome: string
}

interface Horario {
  id: string
  local_id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  locais_carrinho: Local
}

interface Escala {
  id: string
  horario_id: string
  data: string
  eh_fixa: boolean
  observacoes?: string
  horario: Horario
  publicador1?: Publicador
  publicador2?: Publicador
  publicador3?: Publicador
}

interface EscalaFormData {
  horario_id: string
  data: string
  fixo: boolean
  publicador_ids: string[]
}

const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado"
]

export function EscalasManager() {
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null)
  const [formData, setFormData] = useState<EscalaFormData>({
    horario_id: "",
    data: "",
    fixo: false,
    publicador_ids: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [publicadoresResponse, horariosResponse, escalasResponse] = await Promise.all([
        fetch("/api/publicadores"),
        fetch("/api/testemunho-publico/horarios"),
        fetch("/api/testemunho-publico/escalas")
      ])

      if (publicadoresResponse.ok) {
        const publicadoresData = await publicadoresResponse.json()
        setPublicadores(publicadoresData)
      }

      if (horariosResponse.ok) {
        const horariosData = await horariosResponse.json()
        setHorarios(horariosData)
      }

      if (escalasResponse.ok) {
        const escalasData = await escalasResponse.json()
        setEscalas(escalasData)
      }
    } catch (error) {
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const validateDateWithHorario = () => {
    if (!formData.horario_id || !formData.data) return true
    
    const selectedHorario = horarios.find(h => h.id === formData.horario_id)
    if (!selectedHorario) return true
    
    // Usar uma abordagem mais confiável para obter o dia da semana
    // Evitar problemas de fuso horário ao interpretar a data
    const dateParts = formData.data.split('-')
    const selectedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))
    const selectedDayOfWeek = selectedDate.getDay() // 0 = Domingo, 1 = Segunda, etc.
    
    if (selectedDayOfWeek !== selectedHorario.dia_semana) {
      const diaSemanaHorario = DIAS_SEMANA[selectedHorario.dia_semana]
      const diaSemanaData = DIAS_SEMANA[selectedDayOfWeek]
      toast.error(`A data selecionada (${diaSemanaData}) não corresponde ao dia do horário (${diaSemanaHorario})`)
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.horario_id || !formData.data || formData.publicador_ids.length < 2 || formData.publicador_ids.length > 3) {
      toast.error("Selecione um horário, data e entre 2 a 3 publicadores")
      return
    }

    if (!validateDateWithHorario()) {
      return
    }

    try {
      const url = editingEscala 
        ? `/api/testemunho-publico/escalas/${editingEscala.id}`
        : "/api/testemunho-publico/escalas"
      
      const method = editingEscala ? "PUT" : "POST"
      
      // Mapear os dados para o formato esperado pela API
      const apiData = {
        horario_id: formData.horario_id,
        data: formData.data,
        eh_fixa: formData.fixo,
        publicadores: formData.publicador_ids
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        toast.success(editingEscala ? "Escala atualizada com sucesso!" : "Escala criada com sucesso!")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao salvar escala")
      }
    } catch (error) {
      toast.error("Erro ao salvar escala")
    }
  }

  const handleEdit = (escala: Escala) => {
    setEditingEscala(escala)
    const publicadorIds = []
    if (escala.publicador1) publicadorIds.push(escala.publicador1.id)
    if (escala.publicador2) publicadorIds.push(escala.publicador2.id)
    if (escala.publicador3) publicadorIds.push(escala.publicador3.id)
    
    setFormData({
      horario_id: escala.horario_id,
      data: escala.data,
      fixo: escala.eh_fixa,
      publicador_ids: publicadorIds
    })
    setDialogOpen(true)
  }

  const handleDelete = async (escala: Escala) => {
    if (!confirm(`Tem certeza que deseja excluir esta escala?`)) {
      return
    }

    try {
      const response = await fetch(`/api/testemunho-publico/escalas/${escala.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Escala excluída com sucesso!")
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao excluir escala")
      }
    } catch (error) {
      toast.error("Erro ao excluir escala")
    }
  }

  const handleGerarEscalasFixas = async () => {
    if (!confirm("Deseja gerar escalas fixas para as próximas 4 semanas? Isso criará automaticamente escalas baseadas nas escalas fixas existentes.")) {
      return
    }

    try {
      const response = await fetch("/api/testemunho-publico/escalas/gerar-fixas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ semanas: 4 })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao gerar escalas fixas")
      }
    } catch (error) {
      toast.error("Erro ao gerar escalas fixas")
    }
  }

  const resetForm = () => {
    setFormData({
      horario_id: "",
      data: "",
      fixo: false,
      publicador_ids: []
    })
    setEditingEscala(null)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  const handlePublicadorToggle = (publicadorId: string) => {
    const currentIds = formData.publicador_ids
    if (currentIds.includes(publicadorId)) {
      setFormData({
        ...formData,
        publicador_ids: currentIds.filter(id => id !== publicadorId)
      })
    } else if (currentIds.length < 3) {
      setFormData({
        ...formData,
        publicador_ids: [...currentIds, publicadorId]
      })
    } else {
      toast.error("Máximo de 3 publicadores por escala")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  const getDiaSemanaLabel = (dia: number) => {
    return DIAS_SEMANA[dia] || ""
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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Escalas de Testemunho Público
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleGerarEscalasFixas}
              disabled={escalas.filter(e => e.eh_fixa).length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Escalas Fixas
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setDialogOpen(true)} disabled={horarios.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Escala
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEscala ? "Editar Escala" : "Nova Escala"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="horario_id">Horário *</Label>
                  <Select value={formData.horario_id} onValueChange={(value) => setFormData({ ...formData, horario_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((horario) => (
                        <SelectItem key={horario.id} value={horario.id}>
                          {horario.locais_carrinho?.nome || 'Local não informado'} - {getDiaSemanaLabel(horario.dia_semana)} {formatTime(horario.hora_inicio)}-{formatTime(horario.hora_fim)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data">Data *</Label>
                  <input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fixo"
                    checked={formData.fixo}
                    onCheckedChange={(checked) => setFormData({ ...formData, fixo: checked as boolean })}
                  />
                  <Label htmlFor="fixo">Escala fixa (repetir semanalmente)</Label>
                </div>
                <div>
                  <Label>Publicadores * (selecione 2 a 3)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
                    {publicadores.map((publicador) => (
                      <div key={publicador.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={publicador.id}
                          checked={formData.publicador_ids.includes(publicador.id)}
                          onCheckedChange={() => handlePublicadorToggle(publicador.id)}
                        />
                        <Label htmlFor={publicador.id} className="text-sm">
                          {publicador.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Selecionados: {formData.publicador_ids.length}/3
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingEscala ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {horarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum horário cadastrado ainda.</p>
            <p className="text-sm">Cadastre horários primeiro para criar escalas.</p>
          </div>
        ) : escalas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma escala cadastrada ainda.</p>
            <p className="text-sm">Clique em "Nova Escala" para começar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Local</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Publicadores</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalas.map((escala) => (
                <TableRow key={escala.id}>
                  <TableCell className="font-medium">
                    {escala.horario.locais_carrinho?.nome || 'Local não informado'}
                  </TableCell>
                  <TableCell>
                    {getDiaSemanaLabel(escala.horario.dia_semana)} {formatTime(escala.horario.hora_inicio)}-{formatTime(escala.horario.hora_fim)}
                  </TableCell>
                  <TableCell>
                    {formatDate(escala.data)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {escala.publicador1 && (
                        <Badge variant="outline" className="text-xs">
                          {escala.publicador1.nome}
                        </Badge>
                      )}
                      {escala.publicador2 && (
                        <Badge variant="outline" className="text-xs">
                          {escala.publicador2.nome}
                        </Badge>
                      )}
                      {escala.publicador3 && (
                        <Badge variant="outline" className="text-xs">
                          {escala.publicador3.nome}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={escala.eh_fixa ? "default" : "secondary"}>
                      {escala.eh_fixa ? "Fixa" : "Única"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(escala)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(escala)}
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