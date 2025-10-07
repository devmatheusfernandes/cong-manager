"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { PermissionGuard, PermissionStatus } from "@/components/permission-guard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  getAllPublicadores, 
  type Publicador,
  getAllEscalasLimpeza,
  createEscalaLimpeza,
  deleteEscalaLimpeza,
  type EscalaLimpeza,
  type CreateEscalaLimpezaData,
  canEdit
} from "@/lib/auth";
import { Plus, Calendar, User, Users, CalendarIcon, Info, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

// Função para filtrar publicadores com permissão de limpeza
const getPublicadoresLimpeza = (publicadores: Publicador[]) => {
  return publicadores.filter(publicador => 
    publicador.ativo && 
    publicador.permissions?.includes("perm_limpeza")
  );
};

export default function LimpezaPage() {
  // Hook de autenticação
  const { user } = useAuth();
  
  // Estados para dados
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [escalasLimpeza, setEscalasLimpeza] = useState<EscalaLimpeza[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para os modais
  const [isNovaEscalaModalOpen, setIsNovaEscalaModalOpen] = useState(false);
  const [isInstrucoesModalOpen, setIsInstrucoesModalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [novaEscala, setNovaEscala] = useState({
    publicadores: [] as string[],
    observacoes: ""
  });

  // Carregamento de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [publicadoresData, escalasData] = await Promise.all([
          getAllPublicadores(),
          getAllEscalasLimpeza()
        ]);
        setPublicadores(publicadoresData);
        setEscalasLimpeza(escalasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Verificar permissões
  const podeGerenciarLimpeza = canEdit(user, "limpeza");

  // Função para submeter nova escala
  const handleSubmitNovaEscala = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Por favor, selecione uma data");
      return;
    }

    if (novaEscala.publicadores.length === 0) {
      toast.error("Por favor, selecione pelo menos um publicador");
      return;
    }

    try {
      const novaEscalaData: CreateEscalaLimpezaData = {
        data_limpeza: format(date, "yyyy-MM-dd"),
        publicadores: novaEscala.publicadores,
        observacoes: novaEscala.observacoes,
        grupo_id: ""
      };

      const result = await createEscalaLimpeza(novaEscalaData);
      
      if (result.success && result.escala) {
        // Atualizar o estado local
        setEscalasLimpeza(prev => [...prev, result.escala!]);
      } else {
        throw new Error(result.error || "Erro desconhecido ao criar escala");
      }

      toast.success("Escala de limpeza criada com sucesso!");
      
      // Reset do formulário
      setDate(undefined);
      setNovaEscala({
        publicadores: [],
        observacoes: ""
      });
      setIsNovaEscalaModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar escala:", error);
      toast.error("Erro ao criar escala de limpeza");
    }
  };

  // Função para adicionar/remover publicador
  const togglePublicador = (publicadorId: string) => {
    setNovaEscala(prev => ({
      ...prev,
      publicadores: prev.publicadores.includes(publicadorId)
        ? prev.publicadores.filter(id => id !== publicadorId)
        : [...prev.publicadores, publicadorId]
    }));
  };

  // Função para excluir escala
  const handleDeleteEscala = async (escalaId: string) => {
    try {
      const result = await deleteEscalaLimpeza(escalaId);
      
      if (result.success) {
        // Atualizar o estado local
        setEscalasLimpeza(prev => prev.filter(escala => escala.id !== escalaId));
        toast.success("Escala de limpeza removida com sucesso!");
      } else {
        throw new Error(result.error || "Erro desconhecido ao remover escala");
      }
    } catch (error) {
      console.error("Erro ao remover escala:", error);
      toast.error("Erro ao remover escala de limpeza");
    }
  };

  // Ordenar escalas por data
  const escalasOrdenadas = escalasLimpeza.sort(
    (a, b) =>
      new Date(a.data_limpeza).getTime() - new Date(b.data_limpeza).getTime()
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Limpeza</h2>
            <PermissionStatus permissao="perm_limpeza" />
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Carregando publicadores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Limpeza</h2>
          <PermissionStatus permissao="perm_limpeza" />
        </div>
        <div className="flex gap-2">
          {/* Botão de Instruções - Visível para todos */}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsInstrucoesModalOpen(true)}
          >
            <Info className="h-4 w-4 mr-2" />
            Instruções
          </Button>
          
          {/* Botão Nova Escala - Apenas para quem tem permissão */}
          {podeGerenciarLimpeza && (
            <Button 
              size="sm"
              onClick={() => setIsNovaEscalaModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Escala
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {escalasOrdenadas.map((escala) => {
          const publicadoresResponsaveis = escala.publicadores
            .map((pubId) => publicadores.find((p) => p.id === pubId))
            .filter((publicador): publicador is NonNullable<typeof publicador> => publicador !== undefined);

          const dataFormatada = new Date(
            escala.data_limpeza
          ).toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <CollapsibleCard
              key={escala.id}
              title={dataFormatada}
              icon={Calendar}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      Famílias Responsáveis
                    </span>
                  </div>

                  <div className="space-y-2">
                    {publicadoresResponsaveis.map((publicador) => (
                      <div
                        key={publicador.id}
                        className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border"
                      >
                        <User className="h-3 w-3 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {publicador.nome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <PermissionGuard permissao="limpeza">
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDeleteEscala(escala.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            </CollapsibleCard>
          );
        })}
      </div>

      {/* Modal para Nova Escala */}
      <Dialog open={isNovaEscalaModalOpen} onOpenChange={setIsNovaEscalaModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Escala de Limpeza</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNovaEscala} className="space-y-4">
            {/* Data da Limpeza */}
            <div className="space-y-2">
              <Label htmlFor="data">Data da Limpeza</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Seleção de Publicadores */}
            <div className="space-y-2">
              <Label>Publicadores Responsáveis</Label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                {getPublicadoresLimpeza(publicadores).map((publicador) => (
                  <div
                    key={publicador.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                      novaEscala.publicadores.includes(publicador.id)
                        ? "bg-primary/10 border border-primary"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    onClick={() => togglePublicador(publicador.id)}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center",
                      novaEscala.publicadores.includes(publicador.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )}>
                      {novaEscala.publicadores.includes(publicador.id) && (
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm">{publicador.nome}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecionados: {novaEscala.publicadores.length}
              </p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Input
                id="observacoes"
                placeholder="Ex: Limpeza geral do salão, incluir banheiros..."
                value={novaEscala.observacoes}
                onChange={(e) => setNovaEscala(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsNovaEscalaModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Criar Escala
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Instruções */}
      <Dialog open={isInstrucoesModalOpen} onOpenChange={setIsInstrucoesModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Instruções para Limpeza do Salão do Reino
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Antes da Reunião */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Antes da Reunião
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li>• Chegar 30 minutos antes do início</li>
                <li>• Verificar se todas as luzes estão funcionando</li>
                <li>• Ajustar temperatura do ambiente</li>
                <li>• Organizar cadeiras e materiais</li>
                <li>• Verificar funcionamento do sistema de som</li>
              </ul>
            </div>

            {/* Durante a Reunião */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Durante a Reunião
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li>• Manter vigilância sobre a limpeza geral</li>
                <li>• Verificar banheiros periodicamente</li>
                <li>• Repor papel higiênico e toalhas se necessário</li>
                <li>• Manter área externa limpa</li>
              </ul>
            </div>

            {/* Após a Reunião */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                Após a Reunião
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li>• Organizar cadeiras em suas posições</li>
                <li>• Varrer e passar pano no salão principal</li>
                <li>• Limpar banheiros completamente</li>
                <li>• Esvaziar lixeiras e trocar sacos</li>
                <li>• Verificar se todas as luzes estão apagadas</li>
                <li>• Trancar todas as portas e janelas</li>
              </ul>
            </div>

            {/* Contatos de Emergência */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Contatos de Emergência
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• Coordenador de Limpeza: (11) 99999-9999</p>
                <p>• Ancião Responsável: (11) 88888-8888</p>
                <p>• Emergências: 190 / 193</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsInstrucoesModalOpen(false)}>
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
