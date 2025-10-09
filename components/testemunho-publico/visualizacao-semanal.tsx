"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Users } from "lucide-react"

interface Publicador {
  id: string
  nome: string
}

interface Local {
  id: string
  nome: string
}

interface Horario {
  ativo: boolean
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
  horario: Horario
  publicador1?: Publicador
  publicador2?: Publicador
  publicador3?: Publicador
}

const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado"
]

const DIAS_SEMANA_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function VisualizacaoSemanal() {
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  useEffect(() => {
    fetchData()
  }, [currentWeek])

  const fetchData = async () => {
    try {
      const startOfWeek = getStartOfWeek(currentWeek)
      const endOfWeek = getEndOfWeek(currentWeek)
      
      const [escalasResponse, horariosResponse] = await Promise.all([
        fetch(`/api/testemunho-publico/escalas?data_inicio=${startOfWeek.toISOString().split('T')[0]}&data_fim=${endOfWeek.toISOString().split('T')[0]}`),
        fetch("/api/testemunho-publico/horarios")
      ])

      if (escalasResponse.ok) {
        const escalasData = await escalasResponse.json()
        setEscalas(escalasData)
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

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    return start
  }

  const getEndOfWeek = (date: Date) => {
    const end = new Date(date)
    const day = end.getDay()
    const diff = end.getDate() + (6 - day)
    end.setDate(diff)
    end.setHours(23, 59, 59, 999)
    return end
  }

  const getWeekDays = () => {
    const startOfWeek = getStartOfWeek(currentWeek)
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getEscalasForDay = (dayIndex: number, date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return escalas.filter(escala => {
      const escalaDate = new Date(escala.data).toISOString().split('T')[0]
      return escala.horario.dia_semana === dayIndex && escalaDate === dateString
    })
  }

  const getHorariosForDay = (dayIndex: number) => {
    return horarios.filter(horario => horario.dia_semana === dayIndex && horario.ativo)
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newWeek)
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  const weekDays = getWeekDays()
  const startOfWeek = getStartOfWeek(currentWeek)
  const endOfWeek = getEndOfWeek(currentWeek)

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
            <Calendar className="h-5 w-5" />
            Visualização Semanal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, dayIndex) => {
            const escalasDay = getEscalasForDay(dayIndex, day)
            const horariosDay = getHorariosForDay(dayIndex)
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <div key={dayIndex} className="space-y-2">
                <div className={`text-center p-2 rounded-lg ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="font-semibold text-sm">
                    {DIAS_SEMANA_ABREV[dayIndex]}
                  </div>
                  <div className="text-xs">
                    {formatDate(day)}
                  </div>
                </div>

                <div className="space-y-2">
                  {horariosDay.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-4">
                      Sem horários
                    </div>
                  ) : (
                    horariosDay.map((horario) => {
                      const escalaHorario = escalasDay.find(e => e.horario_id === horario.id)
                      
                      return (
                        <Card key={horario.id} className="p-3 border-l-4 border-l-primary">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin className="h-3 w-3" />
                              <span className="font-medium truncate">
                                {horario.locais_carrinho?.nome || 'Local não informado'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fim)}
                              </span>
                            </div>

                            {escalaHorario ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs">
                                  <Users className="h-3 w-3" />
                                  <span className="text-muted-foreground">Publicadores:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {escalaHorario.publicador1 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {escalaHorario.publicador1.nome.split(' ')[0]}
                                    </Badge>
                                  )}
                                  {escalaHorario.publicador2 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {escalaHorario.publicador2.nome.split(' ')[0]}
                                    </Badge>
                                  )}
                                  {escalaHorario.publicador3 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {escalaHorario.publicador3.nome.split(' ')[0]}
                                    </Badge>
                                  )}
                                </div>
                                {escalaHorario.eh_fixa && (
                                  <Badge variant="secondary" className="text-xs">
                                    Fixa
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                Sem publicadores designados
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {horarios.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum horário cadastrado ainda.</p>
            <p className="text-sm">Cadastre horários para visualizar a programação semanal.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}