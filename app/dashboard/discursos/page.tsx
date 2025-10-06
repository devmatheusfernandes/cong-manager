"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, Calendar, User, CheckCircle, AlertCircle, Building2, Music } from "lucide-react";

export default function DiscursosPage() {
  // Ordenar discursos por data
  const discursosOrdenados = mockData.discursos.sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Discursos</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Discurso
        </Button>
      </div>
      
      <div className="space-y-3">
        {discursosOrdenados.map((discurso) => {
          const orador = mockData.oradores.find(o => o.id === discurso.orador_id);
          const congregacao = mockData.congregacoes.find(c => c.id === discurso.congregacao_id);
          const hospitalidade = mockData.publicadores.find(p => p.id === discurso.hospitalidade_id);
          
          const dataFormatada = new Date(discurso.data).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          return (
            <CollapsibleCard
              key={discurso.id}
              title={`${dataFormatada} - ${discurso.tema}`}
              icon={Calendar}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                {/* Informações do Orador */}
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Orador</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{orador?.nome || 'Não designado'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{orador?.congregacao_origem || ''}</p>
                </div>

                {/* Grid com informações */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Congregação */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Congregação</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{congregacao?.nome || 'Não definida'}</p>
                  </div>

                  {/* Hospitalidade */}
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Hospitalidade</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{hospitalidade?.nome || 'Não definida'}</p>
                  </div>

                  {/* Cântico */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Music className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Cântico</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{discurso.cantico || 'Não definido'}</p>
                  </div>

                  {/* Status da Imagem */}
                  <div className={`p-3 rounded-lg border ${
                    discurso.tem_imagem 
                      ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800' 
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {discurso.tem_imagem ? (
                        <CheckCircle className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      )}
                      <span className={`text-xs font-medium ${
                        discurso.tem_imagem 
                          ? 'text-teal-600 dark:text-teal-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        Imagem
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {discurso.tem_imagem ? 'Disponível' : 'Não disponível'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Contato
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