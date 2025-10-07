"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { EditableContent } from "@/components/permission-wrapper";
import { LocalCarrinhoDialog } from "@/components/local-carrinho-dialog";
import { HorarioCarrinhoDialog } from "@/components/horario-carrinho-dialog";
import { EscalaCarrinhoDialog } from "@/components/escala-carrinho-dialog";
import { Plus, ShoppingCart, MapPin, Clock, User, Calendar, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EscalaCarrinho {
  id: string;
  horario_id: string;
  publicador_id: string;
  data: string;
  eh_fixa: boolean;
  observacoes?: string;
  publicador?: {
    nome: string;
  };
}

interface HorarioCarrinho {
  id: string;
  local_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  escalas?: EscalaCarrinho[];
}

interface LocalCarrinho {
  id: string;
  nome: string;
  endereco: string;
  congregacao_id: string;
  horarios: HorarioCarrinho[];
}

export default function CarrinhoPage() {
  const [locais, setLocais] = useState<LocalCarrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [localDialogOpen, setLocalDialogOpen] = useState(false);
  const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
  const [escalaDialogOpen, setEscalaDialogOpen] = useState(false);
  const [selectedLocal, setSelectedLocal] = useState<LocalCarrinho | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<HorarioCarrinho | null>(null);
  const [selectedHorarioForEscala, setSelectedHorarioForEscala] = useState<string>("");

  // ID da congregação padrão (pode ser obtido do contexto do usuário no futuro)
  const congregacaoId = '660e8400-e29b-41d4-a716-446655440001';

  const fetchLocais = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/carrinho/locais');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar locais');
      }
      
      const locaisData = await response.json();
      
      // Buscar escalas para cada horário
      const locaisComEscalas = await Promise.all(
        locaisData.map(async (local: LocalCarrinho) => {
          const horariosComEscalas = await Promise.all(
            local.horarios.map(async (horario: HorarioCarrinho) => {
              try {
                const escalasResponse = await fetch(`/api/carrinho/escalas?horario_id=${horario.id}`);
                if (escalasResponse.ok) {
                  const escalas = await escalasResponse.json();
                  return { ...horario, escalas };
                }
                return { ...horario, escalas: [] };
              } catch (error) {
                console.error(`Erro ao carregar escalas do horário ${horario.id}:`, error);
                return { ...horario, escalas: [] };
              }
            })
          );
          return { ...local, horarios: horariosComEscalas };
        })
      );
      
      setLocais(locaisComEscalas);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      toast.error('Erro ao carregar locais do carrinho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocais();
  }, []);

  const handleLocalSuccess = () => {
    fetchLocais();
    setSelectedLocal(null);
  };

  const handleHorarioSuccess = () => {
    fetchLocais();
    setSelectedHorario(null);
  };

  const handleEscalaClick = (horarioId: string) => {
    setSelectedHorarioForEscala(horarioId);
    setEscalaDialogOpen(true);
  };

  const handleEscalaSuccess = () => {
    fetchLocais();
    setSelectedHorarioForEscala("");
  };

  const handleEditLocal = (local: LocalCarrinho) => {
    setSelectedLocal(local);
    setLocalDialogOpen(true);
  };

  const handleAddHorario = (local: LocalCarrinho) => {
    setSelectedLocal(local);
    setSelectedHorario(null);
    setHorarioDialogOpen(true);
  };

  const handleEditHorario = (local: LocalCarrinho, horario: HorarioCarrinho) => {
    setSelectedLocal(local);
    setSelectedHorario(horario);
    setHorarioDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Carrinho</h2>
        <EditableContent section="carrinho">
          <Button size="sm" onClick={() => setLocalDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Local
          </Button>
        </EditableContent>
      </div>
      
      <div className="space-y-3">
        {locais.map((local) => {
          return (
            <CollapsibleCard
              key={local.id}
              title={local.nome}
              icon={ShoppingCart}
              badge={`${local.horarios.length} horários`}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Horários:</span>
                    <EditableContent section="carrinho">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddHorario(local)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Horário
                      </Button>
                    </EditableContent>
                  </div>
                  
                  {local.horarios.map((horario) => {
                    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                    
                    return (
                      <div key={horario.id} className="p-3 bg-muted/30 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">{diasSemana[horario.dia_semana]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{horario.hora_inicio} às {horario.hora_fim}</span>
                            </div>
                            <EditableContent section="carrinho">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEscalaClick(horario.id)}
                                  className="h-6 w-6 p-0"
                                  title="Gerenciar Escala"
                                >
                                  <User className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditHorario(local, horario)}
                                  className="h-6 w-6 p-0"
                                  title="Editar Horário"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </EditableContent>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {horario.escalas && horario.escalas.length > 0 ? (
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-muted-foreground">Escalas:</span>
                              {horario.escalas.slice(0, 3).map((escala) => (
                                <div key={escala.id} className="flex items-center justify-between p-2 bg-teal-50 dark:bg-teal-950/30 rounded border border-teal-200 dark:border-teal-800">
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                                    <span className="text-xs text-teal-900 dark:text-teal-100">
                                      {escala.publicador?.nome || 'Publicador não encontrado'}
                                    </span>
                                    {escala.eh_fixa && (
                                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-1 rounded">
                                        Fixa
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-teal-700 dark:text-teal-300">
                                    {new Date(escala.data).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              ))}
                              {horario.escalas.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{horario.escalas.length - 3} escalas adicionais
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Disponível para designação</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {local.horarios.length === 0 && (
                    <div className="p-3 bg-muted/20 rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum horário cadastrado para este local
                      </p>
                    </div>
                  )}
                </div>
                
                <EditableContent section="carrinho">
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleEditLocal(local)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar Local
                    </Button>
                  </div>
                </EditableContent>
              </div>
            </CollapsibleCard>
          );
        })}
        
        {locais.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum local cadastrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece adicionando um novo local para o carrinho
            </p>
            <EditableContent section="carrinho">
              <Button onClick={() => setLocalDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Local
              </Button>
            </EditableContent>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <LocalCarrinhoDialog
        open={localDialogOpen}
        onOpenChange={setLocalDialogOpen}
        local={selectedLocal}
        congregacaoId={congregacaoId}
        onSuccess={handleLocalSuccess}
      />

      <HorarioCarrinhoDialog
        open={horarioDialogOpen}
        onOpenChange={setHorarioDialogOpen}
        horario={selectedHorario}
        localId={selectedLocal?.id || ''}
        localNome={selectedLocal?.nome || ''}
        onSuccess={handleHorarioSuccess}
      />

      <EscalaCarrinhoDialog
        open={escalaDialogOpen}
        onOpenChange={setEscalaDialogOpen}
        escala={null}
        horarioId={selectedHorarioForEscala}
        onSuccess={handleEscalaSuccess}
      />
    </div>
  );
}