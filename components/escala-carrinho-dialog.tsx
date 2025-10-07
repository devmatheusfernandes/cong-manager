"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, User, Clock, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Publicador {
  id: string;
  nome: string;
}

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

interface EscalaCarrinhoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escala?: EscalaCarrinho | null;
  horarioId: string;
  onSuccess: () => void;
}

export function EscalaCarrinhoDialog({
  open,
  onOpenChange,
  escala,
  horarioId,
  onSuccess,
}: EscalaCarrinhoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [formData, setFormData] = useState({
    publicador_id: "",
    data: "",
    eh_fixa: false,
    observacoes: "",
  });

  // Carregar publicadores
  useEffect(() => {
    const fetchPublicadores = async () => {
      try {
        const response = await fetch("/api/publicadores");
        if (response.ok) {
          const data = await response.json();
          setPublicadores(data);
        }
      } catch (error) {
        console.error("Erro ao carregar publicadores:", error);
      }
    };

    if (open) {
      fetchPublicadores();
    }
  }, [open]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (escala) {
      setFormData({
        publicador_id: escala.publicador_id,
        data: escala.data,
        eh_fixa: escala.eh_fixa,
        observacoes: escala.observacoes || "",
      });
    } else {
      setFormData({
        publicador_id: "",
        data: "",
        eh_fixa: false,
        observacoes: "",
      });
    }
  }, [escala, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = escala 
        ? `/api/carrinho/escalas/${escala.id}`
        : "/api/carrinho/escalas";
      
      const method = escala ? "PUT" : "POST";
      
      const payload = escala 
        ? formData
        : { ...formData, horario_id: horarioId };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(escala ? "Escala atualizada com sucesso!" : "Escala criada com sucesso!");
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.text();
        toast.error(error || "Erro ao salvar escala");
      }
    } catch (error) {
      console.error("Erro ao salvar escala:", error);
      toast.error("Erro ao salvar escala");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!escala) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/carrinho/escalas/${escala.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Escala removida com sucesso!");
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.text();
        toast.error(error || "Erro ao remover escala");
      }
    } catch (error) {
      console.error("Erro ao remover escala:", error);
      toast.error("Erro ao remover escala");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {escala ? "Editar Escala" : "Nova Escala"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publicador">Publicador</Label>
            <Select
              value={formData.publicador_id}
              onValueChange={(value) =>
                setFormData({ ...formData, publicador_id: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um publicador" />
              </SelectTrigger>
              <SelectContent>
                {publicadores.map((publicador) => (
                  <SelectItem key={publicador.id} value={publicador.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {publicador.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="data"
                type="date"
                value={formatDate(formData.data)}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="eh_fixa"
              checked={formData.eh_fixa}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, eh_fixa: checked })
              }
            />
            <Label htmlFor="eh_fixa" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Escala fixa (recorrente)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Observações adicionais..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {escala && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : escala ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}