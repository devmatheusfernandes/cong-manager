"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, MapPin, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function PregacaoPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finalizado':
        return CheckCircle;
      case 'em_andamento':
        return Clock;
      case 'pendente':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizado':
        return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'em_andamento':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'pendente':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finalizado':
        return 'Finalizado';
      case 'em_andamento':
        return 'Em Andamento';
      case 'pendente':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pregação</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Território
        </Button>
      </div>
      
      <div className="space-y-3">
        {mockData.territorios.map((territorio) => {
          // Determinando status baseado no campo finalizado
          const status = territorio.finalizado ? 'finalizado' : 'em_andamento';
          const StatusIcon = getStatusIcon(status);
          const statusColor = getStatusColor(status);
          const statusText = getStatusText(status);
          
          return (
            <CollapsibleCard
              key={territorio.id}
              title={territorio.nome}
              icon={MapPin}
              badge={statusText}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-lg border ${statusColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Status: {statusText}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      <span className="text-xs text-muted-foreground">Coordenadas:</span>
                      <p className="text-sm font-medium">{territorio.coordenada}</p>
                    </div>
                    {territorio.data_finalizacao && (
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                        <span className="text-xs text-green-600 dark:text-green-400">Data de Finalização:</span>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          {new Date(territorio.data_finalizacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Histórico
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