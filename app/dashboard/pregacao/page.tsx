"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { TerritorioDialog } from "@/components/territorio-dialog";
import { DesignarTerritorioDialog } from "@/components/designar-territorio-dialog";
import { DevolverTerritorioDialog } from "@/components/devolver-territorio-dialog";
import { HistoricoTerritorioDialog } from "@/components/historico-territorio-dialog";
import { Plus, MapPin, CheckCircle, AlertCircle, Clock, UserCheck, Edit, History, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { canEdit } from "@/lib/auth";

interface Territorio {
  id: string;
  nome: string;
  coordenadas?: any;
  imagem_url?: string;
  cidade?: string;
  congregacao_id: string;
  designacoes?: Array<{
    id: string;
    data_inicio: string;
    data_fim?: string;
    observacoes?: string;
    status: string;
    publicador: {
      id: string;
      nome: string;
      telefone?: string;
      email?: string;
    };
  }>;
}

export default function PregacaoPage() {
  const { user } = useAuth();
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [loading, setLoading] = useState(true);
  
  const canEditPregacao = canEdit(user, 'pregacao');

  const fetchTerritorios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/territorios');
      if (response.ok) {
        const data = await response.json();
        setTerritorios(data);
      } else {
        toast.error('Erro ao carregar territórios');
      }
    } catch (error) {
      console.error('Erro ao buscar territórios:', error);
      toast.error('Erro ao carregar territórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerritorios();
  }, []);

  const getStatusFromDesignacoes = (designacoes?: Array<any>) => {
    if (!designacoes || designacoes.length === 0) {
      return 'disponivel';
    }
    
    const designacaoAtiva = designacoes.find(d => d.status === 'ativo');
    if (designacaoAtiva) {
      return 'designado';
    }
    
    return 'disponivel';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'designado':
        return UserCheck;
      case 'disponivel':
        return MapPin;
      default:
        return MapPin;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'designado':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'disponivel':
        return 'text-teal-600 bg-teal-50 border-teal-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'designado':
        return 'Designado';
      case 'disponivel':
        return 'Disponível';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pregação</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando territórios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pregação</h2>
        {canEditPregacao && (
          <div className="flex gap-2">
            <TerritorioDialog onSuccess={fetchTerritorios} />
            <DesignarTerritorioDialog onSuccess={fetchTerritorios} />
          </div>
        )}
      </div>
      
      {territorios.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Nenhum território cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            {canEditPregacao 
              ? "Comece criando seu primeiro território para organizar a pregação."
              : "Nenhum território foi cadastrado ainda."
            }
          </p>
          {canEditPregacao && <TerritorioDialog onSuccess={fetchTerritorios} />}
        </div>
      ) : (
        <div className="space-y-3">
          {territorios.map((territorio) => {
            const status = getStatusFromDesignacoes(territorio.designacoes);
            const StatusIcon = getStatusIcon(status);
            const statusColor = getStatusColor(status);
            const statusText = getStatusText(status);
            const designacaoAtiva = territorio.designacoes?.find(d => d.status === 'ativo');
            
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
                      {territorio.cidade && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                          <span className="text-xs text-muted-foreground">Cidade:</span>
                          <p className="text-sm font-medium">{territorio.cidade}</p>
                        </div>
                      )}
                      
                      {territorio.coordenadas && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                          <span className="text-xs text-muted-foreground">Coordenadas:</span>
                          <p className="text-sm font-medium">GeoJSON definido</p>
                        </div>
                      )}
                      
                      {designacaoAtiva && (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                          <span className="text-xs text-amber-600 dark:text-amber-400">Designado para:</span>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            {designacaoAtiva.publicador.nome}
                          </p>
                          <span className="text-xs text-amber-600 dark:text-amber-400">Desde:</span>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            {new Date(designacaoAtiva.data_inicio).toLocaleDateString('pt-BR')}
                          </p>
                          {designacaoAtiva.data_fim && (
                            <>
                              <span className="text-xs text-amber-600 dark:text-amber-400">Devolução prevista:</span>
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                {new Date(designacaoAtiva.data_fim).toLocaleDateString('pt-BR')}
                              </p>
                            </>
                          )}
                          {designacaoAtiva.observacoes && (
                            <>
                              <span className="text-xs text-amber-600 dark:text-amber-400">Observações:</span>
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                {designacaoAtiva.observacoes}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {canEditPregacao && (
                      <TerritorioDialog 
                        territorio={territorio} 
                        onSuccess={fetchTerritorios}
                        trigger={
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        }
                      />
                    )}
                    {canEditPregacao && designacaoAtiva && (
                      <DevolverTerritorioDialog
                        designacaoId={designacaoAtiva.id}
                        territorioNome={territorio.nome}
                        publicadorNome={designacaoAtiva.publicador.nome}
                        onSuccess={fetchTerritorios}
                        trigger={
                          <Button size="sm" variant="outline" className="flex-1">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Devolver
                          </Button>
                        }
                      />
                    )}
                    <HistoricoTerritorioDialog
                      territorioId={territorio.id}
                      territorioNome={territorio.nome}
                      trigger={
                        <Button size="sm" variant="outline" className="flex-1">
                          <History className="h-4 w-4 mr-2" />
                          Histórico
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CollapsibleCard>
            );
          })}
        </div>
      )}
    </div>
  );
}