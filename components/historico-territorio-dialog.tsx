"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { History, User, Calendar, Clock, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoricoDesignacao {
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
}

interface HistoricoTerritorioDialogProps {
  territorioId: string;
  territorioNome: string;
  trigger?: React.ReactNode;
}

export function HistoricoTerritorioDialog({
  territorioId,
  territorioNome,
  trigger,
}: HistoricoTerritorioDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<HistoricoDesignacao[]>([]);

  const fetchHistorico = async () => {
    if (!open) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/territorios/${territorioId}/historico`
      );
      if (response.ok) {
        const data = await response.json();
        setHistorico(data);
      } else {
        toast.error("Erro ao carregar histórico");
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, [open, territorioId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <Badge variant="default" className="bg-amber-100 text-amber-800">
            Ativo
          </Badge>
        );
      case "finalizado":
        return (
          <Badge variant="secondary" className="bg-teal-100 text-teal-800">
            Finalizado
          </Badge>
        );
      case "cancelado":
        return (
          <Badge variant="destructive" className="bg-rose-100 text-rose-800">
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calcularDuracao = (dataInicio: string, dataFim?: string) => {
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : new Date();
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 dia";
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return meses === 1 ? "1 mês" : `${meses} meses`;
    }
    const anos = Math.floor(diffDays / 365);
    return anos === 1 ? "1 ano" : `${anos} anos`;
  };

  const defaultTrigger = (
    <Button size="sm" variant="outline" className="flex-1">
      <History className="h-4 w-4 mr-2" />
      Histórico
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico do Território
          </DialogTitle>
          <DialogDescription>
            Histórico de designações do território {territorioNome}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Carregando histórico..." />
          </div>
        ) : historico.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum histórico encontrado
            </h3>
            <p className="text-muted-foreground">
              Este território ainda não possui designações registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historico.map((designacao, index) => (
              <div
                key={designacao.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {designacao.publicador.nome}
                    </span>
                  </div>
                  {getStatusBadge(designacao.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Início: </span>
                      <span className="font-medium">
                        {format(
                          new Date(designacao.data_inicio),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </span>
                    </div>
                  </div>

                  {designacao.data_fim && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Fim: </span>
                        <span className="font-medium">
                          {format(new Date(designacao.data_fim), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Duração: </span>
                      <span className="font-medium">
                        {calcularDuracao(
                          designacao.data_inicio,
                          designacao.data_fim
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {designacao.observacoes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Observações:{" "}
                      </span>
                      <p className="text-sm">{designacao.observacoes}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
