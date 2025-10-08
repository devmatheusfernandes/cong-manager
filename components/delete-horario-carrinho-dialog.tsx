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

interface DeleteHorarioCarrinhoDialogProps {
  horarioId: string;
  horarioInfo: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function DeleteHorarioCarrinhoDialog({
  horarioId,
  horarioInfo,
  onSuccess,
  trigger,
}: DeleteHorarioCarrinhoDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/carrinho/horarios/${horarioId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir horário");
      }

      toast.success("Horário excluído com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao excluir horário:", error);
      toast.error("Erro ao excluir horário.");
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
            Excluir Horário
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
            horário "{horarioInfo}" e todas as escalas associadas a ele.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}