"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { EditableContent } from "@/components/permission-wrapper";
import mockData from "@/data/mock-data.json";
import { Plus, ShoppingCart, MapPin, Clock, User, Calendar } from "lucide-react";

export default function CarrinhoPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Carrinho</h2>
        <EditableContent section="carrinho">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Local
          </Button>
        </EditableContent>
      </div>
      
      <div className="space-y-3">
        {mockData.locais_carrinho.map((local) => {
          const horarios = mockData.carrinho_horarios.filter(h => h.local_id === local.id);
          
          return (
            <CollapsibleCard
              key={local.id}
              title={local.nome}
              icon={ShoppingCart}
              badge={`${horarios.length} horários`}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Endereço</span>
                  </div>
                  <p className="text-sm text-blue-900 dark:text-blue-100">{local.endereco}</p>
                </div>
                
                <div className="space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Horários:</span>
                  {horarios.map((horario) => {
                    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                    
                    return (
                      <div key={horario.id} className="p-3 bg-muted/30 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">{diasSemana[horario.dia_semana]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{horario.hora_inicio} às {horario.hora_fim}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-primary" />
                          <span className="text-sm text-foreground">Disponível para designação</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {horarios.length === 0 && (
                    <div className="p-3 bg-muted/20 rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum horário cadastrado para este local
                      </p>
                    </div>
                  )}
                </div>
                
                <EditableContent section="carrinho">
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Escala
                    </Button>
                  </div>
                </EditableContent>
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    </div>
  );
}