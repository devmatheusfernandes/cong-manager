"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, User, Phone, Mail } from "lucide-react";

export default function NomesDataPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nomes e Datas</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Publicador
        </Button>
      </div>

      <div className="space-y-3">
        {mockData.publicadores.map((publicador) => (
          <CollapsibleCard
            key={publicador.id}
            title={publicador.nome}
            icon={User}
            badge={(publicador as any).privilegio}
            defaultExpanded={false}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {publicador.telefone && (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{publicador.telefone}</span>
                  </div>
                )}
                {publicador.email && (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{publicador.email}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Editar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Designações
                </Button>
              </div>
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  );
}
