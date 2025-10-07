"use client";

import { useState, useEffect, JSXElementConstructor,  ReactElement, ReactNode, ReactPortal, Key } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { Badge } from "@/components/ui/badge";
import { ImportPdfDialog } from "@/components/import-pdf-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NossaVidaCristaParte } from "@/lib/mock-data-reunioes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { canEdit } from "@/lib/auth";
import {
  Calendar,
  BookOpen,
  Clock,
  Music,
  Target,
  Heart,
  Lightbulb,
  MessageSquare,
  User,
  Users,
  AlertTriangle,
  Plus,
  Upload,
  Loader2,
  Filter,
} from "lucide-react";

export default function NVCPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [reunioes, setReunioes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [selectedMes, setSelectedMes] = useState<string>(() => {
    // Definir o mês corrente como padrão
    const currentMonth = new Date().getMonth() + 1; // getMonth() retorna 0-11, então +1 para 1-12
    return currentMonth.toString();
  });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Verificar se o usuário pode editar NVC
  const canEditNVC = canEdit(user, 'nvc');

  // Função para buscar reuniões do Supabase
  const fetchReunioes = async (fallbackToAll = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir URL com filtros
      const params = new URLSearchParams();
      if (selectedMes && selectedMes !== "all" && !fallbackToAll) {
        params.append('mes', selectedMes);
      }
      
      const response = await fetch(`/api/nvc?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar reuniões');
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.nossa_vida_crista) {
        const reunioesData = data.data.nossa_vida_crista;
        
        // Se é o carregamento inicial e não há dados para o mês corrente, buscar todos
        if (!initialLoadDone && reunioesData.length === 0 && selectedMes !== "all" && !fallbackToAll) {
          setSelectedMes("all");
          await fetchReunioes(true);
          return;
        }
        
        setReunioes(reunioesData);
        setInitialLoadDone(true);
      } else {
        setReunioes([]);
        setInitialLoadDone(true);
      }
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Erro ao carregar reuniões');
      setInitialLoadDone(true);
    } finally {
      setLoading(false);
    }
  };

  // Carregar reuniões ao montar o componente e quando filtros mudarem
  useEffect(() => {
    fetchReunioes();
  }, [selectedMes]);

  const handleImportSuccess = (importedData: any) => {
    // Após importar com sucesso, recarregar os dados do Supabase
    fetchReunioes();
    toast.success('Reuniões importadas com sucesso!');
  };

  // Lista de meses
  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nossa Vida Cristã</h2>
        {canEditNVC && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(true)}
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar PDF
            </Button>
            <Button 
              onClick={() => router.push("/dashboard/nvc/nova")}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Reunião
            </Button>
          </div>
        )}
      </div>

      {/* Filtros de Mês */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Filtros:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Mês:</span>
          <Select value={selectedMes} onValueChange={setSelectedMes}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMes !== "all" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedMes("all");
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando reuniões...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
            Erro ao carregar reuniões
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {error}
          </p>
          <Button 
            variant="outline" 
            onClick={() => fetchReunioes()}
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
        {reunioes.map((reuniao) => {
          // Verificar se é evento especial
          if (reuniao.eventoEspecial) {
            return (
              <CollapsibleCard
                key={reuniao.id}
                title={`${reuniao.periodo} • ${reuniao.eventoEspecial}`}
                icon={AlertTriangle}
                defaultExpanded={false}
              >
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-1">
                    {reuniao.eventoEspecial}
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Não haverá reunião Nossa Vida Cristã nesta semana
                  </p>
                </div>
              </CollapsibleCard>
            );
          }

          const tituloReuniao = reuniao.semanaVisitaSuperintendente 
            ? `${reuniao.periodo} • ${reuniao.leituraBiblica} • Visita do Superintendente`
            : `${reuniao.periodo} • ${reuniao.leituraBiblica}`;

          const diaReuniao = reuniao.diaTerca ? " (Terça-feira)" : "";

          return (
            <CollapsibleCard
              key={reuniao.id}
              title={tituloReuniao + diaReuniao}
              icon={Calendar}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                {/* Presidente e Orações */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Presidente
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.presidente?.nome}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Oração Inicial
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.oracoes?.inicial?.nome}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Oração Final
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.oracoes?.final?.nome}
                    </p>
                  </div>
                </div>

                {/* Cânticos */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Inicial
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.canticos?.inicial}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Intermediário
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.canticos?.intermediario}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Final
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.canticos?.final}
                    </p>
                  </div>
                </div>

                {/* Tesouros da Palavra de Deus */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="text-base font-semibold text-yellow-600 dark:text-yellow-400">
                      Tesouros da Palavra de Deus
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Discurso */}
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {reuniao.tesourosPalavra?.titulo}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {reuniao.tesourosPalavra?.duracao}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {reuniao.tesourosPalavra?.responsavel?.nome}
                        </span>
                      </div>
                    </div>

                    {/* Joias Espirituais */}
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Joias Espirituais
                        </h4>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {reuniao.tesourosPalavra?.joiasEspirituais?.duracao}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {reuniao.tesourosPalavra?.joiasEspirituais?.responsavel?.nome}
                        </span>
                      </div>
                    </div>

                    {/* Leitura da Bíblia */}
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Leitura da Bíblia: {reuniao.tesourosPalavra?.leituraBiblica?.texto}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {reuniao.tesourosPalavra?.leituraBiblica?.duracao}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {reuniao.tesourosPalavra?.leituraBiblica?.responsavel?.nome}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Faça Seu Melhor */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
                      Faça Seu Melhor
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {reuniao.facaSeuMelhor?.map((parte: { tipo: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; duracao: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; descricao: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; responsavel: { nome: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; ajudante: { nome: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; }, index: Key | null | undefined) => (
                      <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {parte.tipo}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {parte.duracao}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {parte.descricao}
                        </p>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {parte.responsavel?.nome}
                            </span>
                          </div>
                          {parte.ajudante && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {parte.ajudante?.nome}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nossa Vida Cristã */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    <h3 className="text-base font-semibold text-rose-600 dark:text-rose-400">
                      Nossa Vida Cristã
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {reuniao.nossaVidaCrista?.map((parte: NossaVidaCristaParte, index: Key | null | undefined) => (
                      <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {parte.tipo}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {parte.duracao}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {parte.conteudo}
                        </p>

                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {parte.responsavel?.nome}
                          </span>
                        </div>
                        {parte.tipo === "Estudo bíblico de congregação" && (parte as NossaVidaCristaParte).leitor && (
                          <div className="flex items-center gap-1 mt-1">
                            <BookOpen className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Leitor: {((parte as NossaVidaCristaParte).leitor as any).nome}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>



                <div className="flex gap-2 pt-2">
                  {canEditNVC && (
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className={canEditNVC ? "flex-1" : "w-full"}>
                    Imprimir
                  </Button>
                </div>
              </div>
            </CollapsibleCard>
          );
        })}
        </div>
      )}

      <ImportPdfDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
