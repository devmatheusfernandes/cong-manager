"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteNVCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  reunioes: any[];
}

export function DeleteNVCDialog({
  open,
  onOpenChange,
  onSuccess,
  reunioes,
}: DeleteNVCDialogProps) {
  const [tipo, setTipo] = useState<"semana" | "mes" | "">("");
  const [periodo, setPeriodo] = useState("");
  const [loading, setLoading] = useState(false);

  // Extrair meses únicos das reuniões
  const mesesDisponiveis = Array.from(
    new Map(
      reunioes
        .map((reuniao) => {
          const periodo = reuniao.periodo?.toUpperCase();
          const meses = [
            "JANEIRO",
            "FEVEREIRO",
            "MARÇO",
            "ABRIL",
            "MAIO",
            "JUNHO",
            "JULHO",
            "AGOSTO",
            "SETEMBRO",
            "OUTUBRO",
            "NOVEMBRO",
            "DEZEMBRO",
          ];
          
          for (let i = 0; i < meses.length; i++) {
            if (periodo?.includes(meses[i])) {
              return [i + 1, { nome: meses[i], numero: i + 1 }] as [number, { nome: string; numero: number }];
            }
          }
          return null;
        })
        .filter((item): item is [number, { nome: string; numero: number }] => item !== null)
    ).values()
  ).sort((a, b) => a.numero - b.numero);

  // Extrair semanas únicas das reuniões
  const semanasDisponiveis = Array.from(
    new Set(
      reunioes
        .map((reuniao) => reuniao.periodo)
        .filter(Boolean)
    )
  ).sort();

  const handleDelete = async () => {
    if (!tipo || !periodo) {
      toast.error("Selecione o tipo e período para deletar");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        tipo,
        periodo: tipo === "mes" ? periodo : periodo,
      });

      const response = await fetch(`/api/nvc?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(data.error || "Erro ao deletar registros");
      }
    } catch (error) {
      console.error("Erro ao deletar registros:", error);
      toast.error("Erro ao deletar registros");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTipo("");
    setPeriodo("");
  };

  const getConfirmationMessage = () => {
    if (!tipo || !periodo) return "";

    if (tipo === "semana") {
      return `Tem certeza que deseja deletar a reunião da semana "${periodo}"?`;
    } else if (tipo === "mes") {
      const mesNome = mesesDisponiveis.find((m: any) => m.numero.toString() === periodo)?.nome;
      const reunioesDoMes = reunioes.filter((r) =>
        r.periodo?.toUpperCase().includes(mesNome)
      );
      return `Tem certeza que deseja deletar todas as ${reunioesDoMes.length} reuniões do mês de ${mesNome}?`;
    }

    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-rose-600" />
            Deletar Registros NVC
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Deleção</Label>
            <Select value={tipo} onValueChange={(value: "semana" | "mes") => {
              setTipo(value);
              setPeriodo("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Semana Específica</SelectItem>
                <SelectItem value="mes">Mês Inteiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === "semana" && (
            <div className="space-y-2">
              <Label htmlFor="semana">Semana</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a semana" />
                </SelectTrigger>
                <SelectContent>
                  {semanasDisponiveis.map((semana, index) => (
                    <SelectItem key={`semana-${index}-${semana}`} value={semana}>
                      {semana}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === "mes" && (
            <div className="space-y-2">
              <Label htmlFor="mes">Mês</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {mesesDisponiveis.map((mes: any, index) => (
                    <SelectItem key={`mes-${index}-${mes.numero}`} value={mes.numero.toString()}>
                      {mes.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {getConfirmationMessage() && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Atenção!</p>
                <p>{getConfirmationMessage()}</p>
                <p className="mt-1 text-xs">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!tipo || !periodo || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}