"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash } from "lucide-react";

interface DeleteLocalCarrinhoDialogProps {
  localId: string;
  localNome: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function DeleteLocalCarrinhoDialog({
  localId,
  localNome,
  onSuccess,
  trigger,
}: DeleteLocalCarrinhoDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/carrinho/locais/${localId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir local");
      }

      toast.success("Local excluído com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao excluir local:", error);
      toast.error("Erro ao excluir local.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Excluir Local
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
            local "{localNome}" e todos os seus horários e escalas associadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Excluindo..." : "Excluir"
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}