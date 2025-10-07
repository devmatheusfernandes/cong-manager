"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Loader2 } from "lucide-react";

interface HorarioCarrinho {
  id?: string;
  local_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
}

interface HorarioCarrinhoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horario?: HorarioCarrinho | null;
  localId: string;
  localNome: string;
  onSuccess: () => void;
}

const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export function HorarioCarrinhoDialog({
  open,
  onOpenChange,
  horario,
  localId,
  localNome,
  onSuccess,
}: HorarioCarrinhoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dia_semana: 0,
    hora_inicio: "",
    hora_fim: "",
  });

  const isEditing = !!horario?.id;

  useEffect(() => {
    if (horario) {
      setFormData({
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fim: horario.hora_fim,
      });
    } else {
      setFormData({
        dia_semana: 0,
        hora_inicio: "",
        hora_fim: "",
      });
    }
  }, [horario, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hora_inicio || !formData.hora_fim) {
      toast.error("Horário de início e fim são obrigatórios");
      return;
    }

    // Validar se hora de início é menor que hora de fim
    if (formData.hora_inicio >= formData.hora_fim) {
      toast.error("Horário de início deve ser menor que o horário de fim");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing 
        ? `/api/carrinho/horarios/${horario.id}`
        : '/api/carrinho/horarios';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const body = {
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        ...(isEditing ? {} : { local_id: localId }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar horário');
      }

      toast.success(
        isEditing 
          ? 'Horário atualizado com sucesso!' 
          : 'Horário criado com sucesso!'
      );
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar horário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !horario?.id) return;

    if (!confirm('Tem certeza que deseja excluir este horário? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/carrinho/horarios/${horario.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir horário');
      }

      toast.success('Horário excluído com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao excluir horário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir horário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isEditing ? 'Editar Horário' : 'Novo Horário'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Edite o horário para ${localNome}.`
              : `Adicione um novo horário para ${localNome}.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dia_semana">Dia da Semana</Label>
            <Select
              value={formData.dia_semana.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, dia_semana: parseInt(value) }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {diasSemana.map((dia) => (
                  <SelectItem key={dia.value} value={dia.value.toString()}>
                    {dia.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora de Início</Label>
              <Input
                id="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_fim">Hora de Fim</Label>
              <Input
                id="hora_fim"
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, hora_fim: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Excluir'
                )}
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isEditing ? 'Salvar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}