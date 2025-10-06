"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, Users, User, Crown, UserCheck, Phone, Mail } from "lucide-react";

export default function GruposPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Grupos</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>
      
      <div className="space-y-3">
        {mockData.grupos.map((grupo) => {
          const grupoPublicadores = mockData.grupo_publicadores.find(gp => gp.grupo_id === grupo.id);
          const membrosIds = grupoPublicadores?.publicador_ids || [];
          const membros = membrosIds.map(id => mockData.publicadores.find(p => p.id === id)).filter(Boolean);
          const superintendente = mockData.publicadores.find(p => p.id === grupo.superintendente_id);
          const ajudante = mockData.publicadores.find(p => p.id === grupo.servo_id);
          
          return (
            <CollapsibleCard
              key={grupo.id}
              title={grupo.nome}
              icon={Users}
              badge={`${membros.length} membros`}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {superintendente && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Superintendente</span>
                      </div>
                      <p className="text-sm font-semibold">{superintendente.nome}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {superintendente.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{superintendente.telefone}</span>
                          </div>
                        )}
                        {superintendente.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{superintendente.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {ajudante && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-600">Servo Ministerial</span>
                      </div>
                      <p className="text-sm font-semibold">{ajudante.nome}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {ajudante.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{ajudante.telefone}</span>
                          </div>
                        )}
                        {ajudante.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{ajudante.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Membros do Grupo:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {membros.map((publicador) => {
                      if (!publicador) return null;
                      
                      return (
                        <div key={publicador.id} className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">{publicador.nome}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {publicador.telefone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{publicador.telefone}</span>
                              </div>
                            )}
                            {publicador.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{publicador.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Relatórios
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