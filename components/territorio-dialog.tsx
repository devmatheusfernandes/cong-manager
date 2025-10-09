"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Territorio {
  id?: string;
  nome: string;
  coordenadas?: any; // GeoJSON
  imagem_url?: string;
  cidade?: string;
  congregacao_id: string;
}

interface TerritorioDialogProps {
  territorio?: Territorio;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function TerritorioDialog({
  territorio,
  onSuccess,
  trigger,
}: TerritorioDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: territorio?.nome || "",
    coordenadas: territorio?.coordenadas
      ? JSON.stringify(territorio.coordenadas, null, 2)
      : "",
    imagem_url: territorio?.imagem_url || "",
    cidade: territorio?.cidade || "",
    congregacao_id: territorio?.congregacao_id || "",
  });

  const isEditing = !!territorio?.id;

  // Buscar congregação padrão se não estiver editando
  useEffect(() => {
    if (!isEditing && !formData.congregacao_id) {
      // Por enquanto, vamos usar uma congregação padrão
      // Em uma implementação real, você buscaria da API ou contexto
      setFormData((prev) => ({
        ...prev,
        congregacao_id: process.env.NEXT_PUBLIC_CONGREGATION_DEFAULT_ID!,
      }));
    }
  }, [isEditing, formData.congregacao_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar GeoJSON se fornecido
      let coordenadasParsed = null;
      if (formData.coordenadas.trim()) {
        try {
          coordenadasParsed = JSON.parse(formData.coordenadas);
        } catch (error) {
          toast.error(
            "Formato de coordenadas inválido. Use um GeoJSON válido."
          );
          setLoading(false);
          return;
        }
      }

      const payload = {
        nome: formData.nome,
        coordenadas: coordenadasParsed,
        imagem_url: formData.imagem_url || null,
        cidade: formData.cidade || null,
        congregacao_id: formData.congregacao_id,
      };

      const url = isEditing
        ? `/api/territorios/${territorio.id}`
        : "/api/territorios";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar território");
      }

      toast.success(
        isEditing
          ? "Território atualizado com sucesso!"
          : "Território criado com sucesso!"
      );
      setOpen(false);
      onSuccess();

      // Limpar formulário se for criação
      if (!isEditing) {
        setFormData({
          nome: "",
          coordenadas: "",
          imagem_url: "",
          cidade: "",
          congregacao_id: formData.congregacao_id, // Manter a congregação
        });
      }
    } catch (error) {
      console.error("Erro ao salvar território:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar território"
      );
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Novo Território
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isEditing ? "Editar Território" : "Novo Território"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Território *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
              placeholder="Ex: Território 1 - Vila Madalena"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cidade: e.target.value }))
              }
              placeholder="Ex: São Paulo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagem_url">URL da Imagem</Label>
            <Input
              id="imagem_url"
              type="url"
              value={formData.imagem_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imagem_url: e.target.value }))
              }
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordenadas">Coordenadas (GeoJSON)</Label>
            <textarea
              id="coordenadas"
              className="w-full min-h-[120px] p-3 border border-input rounded-md bg-background text-sm resize-vertical"
              value={formData.coordenadas}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  coordenadas: e.target.value,
                }))
              }
              placeholder={`{
  "type": "Polygon",
  "coordinates": [[
    [-46.6333, -23.5505],
    [-46.6300, -23.5505],
    [-46.6300, -23.5480],
    [-46.6333, -23.5480],
    [-46.6333, -23.5505]
  ]]
}`}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Insira um GeoJSON válido para definir a área do
              território.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
