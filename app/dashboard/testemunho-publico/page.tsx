"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionWrapper } from "@/components/permission-wrapper"
import { LocaisManager } from "@/components/testemunho-publico/locais-manager"
import { HorariosManager } from "@/components/testemunho-publico/horarios-manager"
import { EscalasManager } from "@/components/testemunho-publico/escalas-manager"
import { VisualizacaoSemanal } from "@/components/testemunho-publico/visualizacao-semanal"
import { useAuth } from "@/components/auth-provider"

export default function TestemunhoPublicoPage() {
  const { user } = useAuth()

  // Para usuários não logados, mostrar apenas a visualização semanal
  if (!user) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Testemunho Público</h1>
            <p className="text-muted-foreground">
              Visualização das escalas de testemunho público
            </p>
          </div>
        </div>

        <VisualizacaoSemanal />
      </div>
    )
  }

  // Para usuários logados, mostrar todas as abas com permissões
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testemunho Público</h1>
          <p className="text-muted-foreground">
            Gerencie locais, horários e escalas de publicadores para o testemunho público
          </p>
        </div>
      </div>

      <Tabs defaultValue="semanal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="locais">Locais</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
          <TabsTrigger value="escalas">Escalas</TabsTrigger>
        </TabsList>

        <TabsContent value="locais">
          <PermissionWrapper section="testemunho-publico" action="edit" fallback={
            <PermissionWrapper section="testemunho-publico" action="view">
              <LocaisManager />
            </PermissionWrapper>
          }>
            <LocaisManager />
          </PermissionWrapper>
        </TabsContent>

        <TabsContent value="horarios">
          <PermissionWrapper section="testemunho-publico" action="edit" fallback={
            <PermissionWrapper section="testemunho-publico" action="view">
              <HorariosManager />
            </PermissionWrapper>
          }>
            <HorariosManager />
          </PermissionWrapper>
        </TabsContent>

        <TabsContent value="escalas">
          <PermissionWrapper section="testemunho-publico" action="edit" fallback={
            <PermissionWrapper section="testemunho-publico" action="view">
              <EscalasManager />
            </PermissionWrapper>
          }>
            <EscalasManager />
          </PermissionWrapper>
        </TabsContent>

        <TabsContent value="semanal">
          <PermissionWrapper section="testemunho-publico" action="view">
            <VisualizacaoSemanal />
          </PermissionWrapper>
        </TabsContent>
      </Tabs>
    </div>
  )
}