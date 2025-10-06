"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, Calendar, User, Users } from "lucide-react";

export default function LimpezaPage() {
  // Ordenar escalas por data
  const escalasOrdenadas = mockData.escala_limpeza.sort(
    (a, b) =>
      new Date(a.data_limpeza).getTime() - new Date(b.data_limpeza).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Limpeza</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Escala
        </Button>
      </div>

      <div className="space-y-3">
        {escalasOrdenadas.map((escala) => {
          const publicadoresResponsaveis = escala.publicadores
            .map((pubId) => mockData.publicadores.find((p) => p.id === pubId))
            .filter((publicador): publicador is NonNullable<typeof publicador> => publicador !== undefined);

          const dataFormatada = new Date(
            escala.data_limpeza
          ).toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <CollapsibleCard
              key={escala.id}
              title={dataFormatada}
              icon={Calendar}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      Famílias Responsáveis
                    </span>
                  </div>

                  <div className="space-y-2">
                    {publicadoresResponsaveis.map((publicador) => (
                      <div
                        key={publicador.id}
                        className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border"
                      >
                        <User className="h-3 w-3 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {publicador.nome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Remover
                  </Button>
                </div>
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    </div>
  );
}
