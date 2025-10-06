"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, Calendar, User, UserCheck, Volume2, Monitor, Bell } from "lucide-react";

export default function MecanicasPage() {
  // Ordenar mecânicas por data
  const mecanicasOrdenadas = mockData.mecanicas.sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mecânicas</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Designação
        </Button>
      </div>
      
      <div className="space-y-3">
        {mecanicasOrdenadas.map((mecanica) => {
          const indicador = mockData.publicadores.find(p => p.id === mecanica.indicador_id);
          const leitor = mockData.publicadores.find(p => p.id === mecanica.leitor_id);
          const som = mockData.publicadores.find(p => p.id === mecanica.som_id);
          const palco = mockData.publicadores.find(p => p.id === mecanica.palco_id);
          
          const dataFormatada = new Date(mecanica.data).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          return (
            <CollapsibleCard
              key={mecanica.id}
              title={dataFormatada}
              icon={Calendar}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {/* Indicador - Entrada */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Indicador - Entrada</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {indicador?.nome || 'Não designado'}
                    </p>
                  </div>

                  {/* Indicador - Auditório */}
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Indicador - Auditório</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {leitor?.nome || 'Não designado'}
                    </p>
                  </div>

                  {/* Áudio e Vídeo */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Áudio e Vídeo</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {som?.nome || 'Não designado'}
                    </p>
                  </div>

                  {/* Volante */}
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Volante</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {palco?.nome || 'Não designado'}
                    </p>
                  </div>

                  {/* Palco */}
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Palco</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {palco?.nome || 'Não designado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Bell className="h-4 w-4 mr-1" />
                    Notificar
                  </Button>
                </div>
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    </div>
  );
}