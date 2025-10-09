"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, FileText, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Publicador {
  id: string;
  nome: string;
}

interface EscalaCarrinho {
  id: string;
  horario_id: string;
  data: string;
  eh_fixa: boolean;
  observacoes?: string;
  publicador1?: { id: string; nome: string; };
  publicador2?: { id: string; nome: string; };
  publicador3?: { id: string; nome: string; };
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
    publicadores_ids: [] as string[],
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
      const publicadorIds = [];
      if (escala.publicador1) publicadorIds.push(escala.publicador1.id);
      if (escala.publicador2) publicadorIds.push(escala.publicador2.id);
      if (escala.publicador3) publicadorIds.push(escala.publicador3.id);
      
      setFormData({
        publicadores_ids: publicadorIds,
        data: escala.data,
        eh_fixa: escala.eh_fixa,
        observacoes: escala.observacoes || "",
      });
    } else {
      setFormData({
        publicadores_ids: [],
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
        ? { ...formData, id: escala.id }
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {formData.publicadores_ids.length > 0
                    ? publicadores
                        .filter(p => formData.publicadores_ids.includes(p.id))
                        .map(p => p.nome)
                        .join(", ")
                    : "Selecione publicador(es)..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar publicador..." />
                  <CommandEmpty>Nenhum publicador encontrado.</CommandEmpty>
                  <CommandGroup>
                    {publicadores.map((publicador) => (
                      <CommandItem
                        key={publicador.id}
                        onSelect={() => {
                          setFormData(prev => ({
                            ...prev,
                            publicadores_ids: prev.publicadores_ids.includes(publicador.id)
                              ? prev.publicadores_ids.filter(id => id !== publicador.id)
                              : [...prev.publicadores_ids, publicador.id]
                          }));
                        }}
                      >
                        <Checkbox
                          checked={formData.publicadores_ids.includes(publicador.id)}
                          className="mr-2"
                        />
                        {publicador.nome}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {formData.publicadores_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {publicadores
                  .filter(p => formData.publicadores_ids.includes(p.id))
                  .map(p => (
                    <Badge key={p.id} variant="secondary" className="flex items-center gap-1">
                      {p.nome}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            publicadores_ids: prev.publicadores_ids.filter(id => id !== p.id)
                          }));
                        }}
                        className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            )}
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