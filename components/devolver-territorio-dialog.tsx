"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DevolverTerritorioDialogProps {
  designacaoId: string;
  territorioNome: string;
  publicadorNome: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DevolverTerritorioDialog({
  designacaoId,
  territorioNome,
  publicadorNome,
  onSuccess,
  trigger
}: DevolverTerritorioDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataDevolucao, setDataDevolucao] = useState<Date>();
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataDevolucao) {
      toast.error("Selecione a data de devolução");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/territorios/designacoes/${designacaoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_fim: dataDevolucao.toISOString().split('T')[0],
          status: 'finalizado',
          observacoes: observacoes || undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao devolver território');
      }

      toast.success("Território devolvido com sucesso!");
      setOpen(false);
      setDataDevolucao(undefined);
      setObservacoes("");
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao devolver território:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao devolver território");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="outline" className="flex-1">
      <RotateCcw className="h-4 w-4 mr-2" />
      Devolver
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Devolver Território</DialogTitle>
          <DialogDescription>
            Confirme a devolução do território "{territorioNome}" por {publicadorNome}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-devolucao">Data de Devolução *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataDevolucao && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataDevolucao ? (
                    format(dataDevolucao, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataDevolucao}
                  onSelect={setDataDevolucao}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Input
              id="observacoes"
              placeholder="Observações sobre a devolução (opcional)"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Devolvendo..." : "Devolver Território"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}