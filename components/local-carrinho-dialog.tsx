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
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

interface LocalCarrinho {
  id?: string;
  nome: string;
  endereco: string;
  congregacao_id: string;
}

interface LocalCarrinhoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  local?: LocalCarrinho | null;
  congregacaoId: string;
  onSuccess: () => void;
}

export function LocalCarrinhoDialog({
  open,
  onOpenChange,
  local,
  congregacaoId,
  onSuccess,
}: LocalCarrinhoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
  });

  const isEditing = !!local?.id;

  useEffect(() => {
    if (local) {
      setFormData({
        nome: local.nome,
        endereco: local.endereco,
      });
    } else {
      setFormData({
        nome: "",
        endereco: "",
      });
    }
  }, [local, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.endereco.trim()) {
      toast.error("Nome e endereço são obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing 
        ? `/api/carrinho/locais/${local.id}`
        : '/api/carrinho/locais';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const body = {
        nome: formData.nome.trim(),
        endereco: formData.endereco.trim(),
        ...(isEditing ? {} : { congregacao_id: congregacaoId }),
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
        throw new Error(error.error || 'Erro ao salvar local');
      }

      toast.success(
        isEditing 
          ? 'Local atualizado com sucesso!' 
          : 'Local criado com sucesso!'
      );
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar local:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar local');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !local?.id) return;

    if (!confirm('Tem certeza que deseja excluir este local? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/carrinho/locais/${local.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir local');
      }

      toast.success('Local excluído com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao excluir local:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isEditing ? 'Editar Local' : 'Novo Local de Carrinho'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações do local de carrinho.'
              : 'Adicione um novo local para o carrinho de literatura.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Local</Label>
            <Input
              id="nome"
              placeholder="Ex: Shopping Center Norte"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              disabled={loading}
              required
            />
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