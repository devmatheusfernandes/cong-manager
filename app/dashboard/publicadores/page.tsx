"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, User, Phone, Mail, Shield, Settings } from "lucide-react";
import Link from "next/link";

// Função para obter o label do privilégio
function getPrivilegioLabel(privilegio: string) {
  const privilegios: Record<string, string> = {
    anciao: "Ancião",
    servo_ministerial: "Servo Ministerial",
    pioneiro_regular: "Pioneiro Regular",
    publicador_batizado: "Publicador Batizado",
    publicador_nao_batizado: "Publicador Não Batizado"
  };
  return privilegios[privilegio] || privilegio;
}

// Função para obter a cor do badge do privilégio
function getPrivilegioBadgeColor(privilegio: string) {
  const cores: Record<string, string> = {
    anciao: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    servo_ministerial: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    pioneiro_regular: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    publicador_batizado: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    publicador_nao_batizado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  };
  return cores[privilegio] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
}

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
            defaultExpanded={false}
            badge={
              <Badge 
                variant="secondary" 
                className={getPrivilegioBadgeColor(publicador.privilegio)}
              >
                <Shield className="h-3 w-3 mr-1" />
                {getPrivilegioLabel(publicador.privilegio)}
              </Badge>
            }
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
                <Link href={`/dashboard/publicadores/${publicador.id}/permissoes`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Verificar Permissões
                  </Button>
                </Link>
              </div>
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  );
}
