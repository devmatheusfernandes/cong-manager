"use client";

import { useState, useEffect, JSXElementConstructor,  ReactElement, ReactNode, ReactPortal, Key } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { Badge } from "@/components/ui/badge";
import { ImportPdfDialog } from "@/components/import-pdf-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Edit,
  Printer,
} from "lucide-react";

export default function NVCPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [reunioes, setReunioes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReuniao, setEditingReuniao] = useState<any>(null);
  const [publicadores, setPublicadores] = useState<any[]>([]);
  const [loadingPublicadores, setLoadingPublicadores] = useState(false);
  
  // Estados para controlar os valores dos selects
  const [presidenteValue, setPresidenteValue] = useState<string>("");
  const [oracaoInicialValue, setOracaoInicialValue] = useState<string>("");
  const [oracaoFinalValue, setOracaoFinalValue] = useState<string>("");
  const [tesourosPalavraResponsavelValue, setTesourosPalavraResponsavelValue] = useState<string>("");
  const [joiasResponsavelValue, setJoiasResponsavelValue] = useState<string>("");
  const [leituraResponsavelValue, setLeituraResponsavelValue] = useState<string>("");
  const [facaSeuMelhorResponsaveis, setFacaSeuMelhorResponsaveis] = useState<string[]>([]);
  const [nossaVidaCristaResponsaveis, setNossaVidaCristaResponsaveis] = useState<string[]>([]);
  
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

  // Função para buscar publicadores
  const fetchPublicadores = async () => {
    try {
      setLoadingPublicadores(true);
      const response = await fetch('/api/publicadores');
      if (response.ok) {
        const data = await response.json();
        setPublicadores(data);
      } else {
        toast.error('Erro ao carregar publicadores');
      }
    } catch (error) {
      console.error('Erro ao buscar publicadores:', error);
      toast.error('Erro ao carregar publicadores');
    } finally {
      setLoadingPublicadores(false);
    }
  };

  // Função para abrir modal de edição
  const handleEditReuniao = (reuniao: any) => {
    setEditingReuniao(reuniao);
    
    // Inicializar valores dos selects
    setPresidenteValue(reuniao.presidente?.nome || "");
    setOracaoInicialValue(reuniao.oracoes?.inicial?.nome || "");
    setOracaoFinalValue(reuniao.oracoes?.final?.nome || "");
    setTesourosPalavraResponsavelValue(reuniao.tesourosPalavra?.responsavel?.nome || "");
    setJoiasResponsavelValue(reuniao.tesourosPalavra?.joiasEspirituais?.responsavel?.nome || "");
    setLeituraResponsavelValue(reuniao.tesourosPalavra?.leituraBiblica?.responsavel?.nome || "");
    
    // Inicializar arrays de responsáveis
    if (Array.isArray(reuniao.facaSeuMelhor)) {
      setFacaSeuMelhorResponsaveis(reuniao.facaSeuMelhor.map((parte: any) => parte.responsavel?.nome || ""));
    } else {
      setFacaSeuMelhorResponsaveis([]);
    }
    
    if (Array.isArray(reuniao.nossaVidaCrista)) {
      setNossaVidaCristaResponsaveis(reuniao.nossaVidaCrista.map((parte: any) => parte.responsavel?.nome || ""));
    } else {
      setNossaVidaCristaResponsaveis([]);
    }
  };

  // Função para verificar conflitos (mesma pessoa em semanas seguidas)
  const verificarConflitos = (publicadorNome: string, reuniaoAtual: any) => {
    if (!publicadorNome || !reuniaoAtual) return [];
    
    const conflitos: { reuniao: any; partes: string[]; }[] = [];
    const dataAtual = new Date(reuniaoAtual.periodo);
    
    // Verificar reuniões próximas (semana anterior e posterior)
    reunioes.forEach(reuniao => {
      if (reuniao.id === reuniaoAtual.id) return;
      
      const dataReuniao = new Date(reuniao.periodo);
      const diffDias = Math.abs((dataAtual.getTime() - dataReuniao.getTime()) / (1000 * 60 * 60 * 24));
      
      // Se a diferença for de 7 dias (uma semana)
      if (diffDias === 7) {
        // Verificar se a pessoa tem alguma parte nesta reunião
        const temParte = verificarSeTemParte(publicadorNome, reuniao);
        if (temParte.length > 0) {
          conflitos.push({
            reuniao: reuniao.periodo,
            partes: temParte
          });
        }
      }
    });
    
    return conflitos;
  };

  // Função auxiliar para verificar se uma pessoa tem parte em uma reunião
  const verificarSeTemParte = (publicadorNome: string, reuniao: any) => {
    const partes = [];
    
    // Verificar presidente
    if (reuniao.presidente?.nome === publicadorNome) {
      partes.push('Presidente');
    }
    
    // Verificar orações
    if (reuniao.oracoes?.inicial?.nome === publicadorNome) {
      partes.push('Oração Inicial');
    }
    if (reuniao.oracoes?.final?.nome === publicadorNome) {
      partes.push('Oração Final');
    }
    
    // Verificar Tesouros da Palavra de Deus
    if (Array.isArray(reuniao.tesourosPalavra)) {
      reuniao.tesourosPalavra.forEach((parte: any, index: number) => {
        if (parte.responsavel?.nome === publicadorNome) {
          partes.push(`Tesouros - ${parte.tipo || `Parte ${index + 1}`}`);
        }
      });
    }
    
    // Verificar Faça Seu Melhor no Ministério
    if (Array.isArray(reuniao.facaSeuMelhor)) {
      reuniao.facaSeuMelhor.forEach((parte: any, index: number) => {
        if (parte.responsavel?.nome === publicadorNome) {
          partes.push(`Ministério - ${parte.tipo || `Parte ${index + 1}`}`);
        }
        if (parte.ajudante?.nome === publicadorNome) {
          partes.push(`Ministério - ${parte.tipo || `Parte ${index + 1}`} (Ajudante)`);
        }
      });
    }
    
    // Verificar Nossa Vida Cristã
    if (Array.isArray(reuniao.nossaVidaCrista)) {
      reuniao.nossaVidaCrista.forEach((parte: any, index: number) => {
        if (parte.responsavel?.nome === publicadorNome) {
          partes.push(`NVC - ${parte.tipo || `Parte ${index + 1}`}`);
        }
        if (parte.leitor?.nome === publicadorNome) {
          partes.push(`NVC - ${parte.tipo || `Parte ${index + 1}`} (Leitor)`);
        }
      });
    }
    
    return partes;
  };

  // Função para imprimir reuniões do mês
  const handleSaveReuniao = async () => {
    if (!editingReuniao) return;

    try {
      // Coletar dados dos inputs
      const formData = new FormData();
      
      // Dados básicos - usando valores dos estados
      const presidente = presidenteValue;
      const oracaoInicial = oracaoInicialValue;
      const oracaoFinal = oracaoFinalValue;

      // Tesouros da Palavra
      const tesourosPalavraResponsavel = tesourosPalavraResponsavelValue;
      const joiasResponsavel = joiasResponsavelValue;
      const leituraResponsavel = leituraResponsavelValue;
      
      // Coletar valores dos campos das Jóias Espirituais
      const joiasTexto = (document.getElementById('joias-texto') as HTMLInputElement)?.value || '';
      const joiasPergunta = (document.getElementById('joias-pergunta') as HTMLInputElement)?.value || '';
      const joiasReferencia = (document.getElementById('joias-referencia') as HTMLInputElement)?.value || '';
      
      const tesourosPalavra = editingReuniao.tesourosPalavra ? {
        titulo: editingReuniao.tesourosPalavra.titulo || '',
        duracao: editingReuniao.tesourosPalavra.duracao || '',
        responsavel: tesourosPalavraResponsavel ? { nome: tesourosPalavraResponsavel, id: tesourosPalavraResponsavel } : { nome: '', id: '' },
        joiasEspirituais: {
          texto: joiasTexto,
          pergunta: joiasPergunta,
          referencia: joiasReferencia,
          duracao: editingReuniao.tesourosPalavra.joiasEspirituais?.duracao || '',
          responsavel: joiasResponsavel ? { nome: joiasResponsavel, id: joiasResponsavel } : { nome: '', id: '' }
        },
        leituraBiblica: {
          texto: editingReuniao.tesourosPalavra.leituraBiblica?.texto || '',
          duracao: editingReuniao.tesourosPalavra.leituraBiblica?.duracao || '',
          responsavel: leituraResponsavel ? { nome: leituraResponsavel, id: leituraResponsavel } : { nome: '', id: '' }
        }
      } : null;

      // Faça Seu Melhor no Ministério
      const facaSeuMelhor = Array.isArray(editingReuniao.facaSeuMelhor)
        ? editingReuniao.facaSeuMelhor.map((parte: any, index: number) => {
            const responsavelNome = facaSeuMelhorResponsaveis[index] || '';
            const ajudanteNome = (document.querySelector(`[id="ministerio-ajudante-${index}"] [data-state="closed"]`) as HTMLElement)?.textContent?.trim() || '';
            
            return {
              ...parte,
              responsavel: responsavelNome ? { nome: responsavelNome, id: responsavelNome } : { nome: '', id: '' },
              ...(parte.ajudante && {
                ajudante: ajudanteNome ? { nome: ajudanteNome, id: ajudanteNome } : { nome: '', id: '' }
              })
            };
          })
        : [];

      // Nossa Vida Cristã
      const nossaVidaCrista = Array.isArray(editingReuniao.nossaVidaCrista)
        ? editingReuniao.nossaVidaCrista.map((parte: any, index: number) => {
            const responsavelNome = nossaVidaCristaResponsaveis[index] || '';
            const leitorNome = (document.querySelector(`[id="nvc-leitor-${index}"] [data-state="closed"]`) as HTMLElement)?.textContent?.trim() || '';
            
            return {
              ...parte,
              responsavel: responsavelNome ? { nome: responsavelNome, id: responsavelNome } : { nome: '', id: '' },
              ...(parte.leitor && {
                leitor: leitorNome ? { nome: leitorNome, id: leitorNome } : { nome: '', id: '' }
              })
            };
          })
        : [];

      const updatedReuniao = {
        ...editingReuniao,
        presidente: presidente ? { nome: presidente, id: presidente } : null,
        oracoes: {
          inicial: oracaoInicial ? { nome: oracaoInicial, id: oracaoInicial } : { nome: '', id: '' },
          final: oracaoFinal ? { nome: oracaoFinal, id: oracaoFinal } : { nome: '', id: '' }
        },
        tesourosPalavra,
        facaSeuMelhor,
        nossaVidaCrista
      };

      // Formato esperado pelo validador: { nossa_vida_crista: [reuniao] }
      const dataToSend = {
        nossa_vida_crista: [updatedReuniao]
      };

      const response = await fetch('/api/nvc/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar reunião');
      }

      toast.success('Reunião salva com sucesso!');
      setEditingReuniao(null);
      
      // Recarregar dados
      await fetchReunioes();
      
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
      toast.error('Erro ao salvar reunião');
    }
  };

  const imprimirMes = (mesNumero: string) => {
    // Filtrar reuniões do mês específico
    const reunioesMes = reunioes.filter(reuniao => {
      if (mesNumero === "all") return true;
      
      const mesesPortugues = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      
      const mesNome = mesesPortugues[parseInt(mesNumero) - 1];
      return reuniao.periodo?.toLowerCase().includes(mesNome);
    });

    if (reunioesMes.length === 0) {
      toast.error('Nenhuma reunião encontrada para este mês');
      return;
    }

    // Gerar HTML para impressão
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Programação da Reunião do Meio de Semana</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                  font-size: 12px;
                  background-color: #fdfdfd;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
              }
              td, th {
                  border: 1px solid #ccc;
                  padding: 5px 8px;
                  vertical-align: top;
                  text-align: left;
              }
              .header {
                  font-weight: bold;
                  background-color: #f0f0f0;
                  text-align: center;
                  font-size: 14px;
              }
              .section-header {
                  font-weight: bold;
                  color: #fff;
                  text-align: center;
                  text-transform: uppercase;
              }
              .section-treasures {
                  background-color: #4F46E5;
              }
              .section-ministry {
                  background-color: #F59E0B;
              }
              .section-life {
                  background-color: #F43F5E;
              }
              .date-header {
                  font-weight: bold;
                  font-size: 13px;
              }
              .name-field {
                  background-color: #f9f9f9;
                  font-weight: normal;
              }
              .spacer td {
                  border: none;
              }
              @media print {
                  body {
                      font-size: 10pt;
                      margin: 1cm;
                  }
                  table {
                      margin-bottom: 1.5cm;
                  }
                  #schedules-container table:nth-of-type(2n) {
                      page-break-after: always;
                  }
                  #schedules-container table:last-of-type {
                      page-break-after: auto;
                  }
              }
          </style>
      </head>
      <body>
          <div id="schedules-container">
              ${reunioesMes.map(reuniao => `
                  <table>
                      <tr class="header">
                          <td colspan="2">${reuniao.periodo} • ${reuniao.leituraBiblica}</td>
                      </tr>
                      <tr>
                          <td class="date-header">Presidente:</td>
                          <td class="name-field">${reuniao.presidente?.nome || ''}</td>
                      </tr>
                      <tr>
                          <td class="date-header">Cântico inicial:</td>
                          <td class="name-field">${reuniao.canticos?.inicial || ''}</td>
                      </tr>
                      <tr>
                          <td class="date-header">Oração inicial:</td>
                          <td class="name-field">${reuniao.oracoes?.inicial?.nome || ''}</td>
                      </tr>
                      <tr class="section-header section-treasures">
                          <td colspan="2">Tesouros da Palavra de Deus</td>
                      </tr>
                      ${reuniao.tesourosPalavra ? `
                          <tr>
                              <td>${reuniao.tesourosPalavra.titulo || ''}</td>
                              <td class="name-field">${reuniao.tesourosPalavra.responsavel?.nome || ''}</td>
                          </tr>
                          ${reuniao.tesourosPalavra.joiasEspirituais ? `
                              <tr>
                                  <td>Jóias espirituais (${reuniao.tesourosPalavra.joiasEspirituais.duracao || ''})</td>
                                  <td class="name-field">${reuniao.tesourosPalavra.joiasEspirituais.responsavel?.nome || ''}</td>
                              </tr>
                          ` : ''}
                          ${reuniao.tesourosPalavra.leituraBiblica ? `
                              <tr>
                                  <td>Leitura da Bíblia (${reuniao.tesourosPalavra.leituraBiblica.duracao || ''})</td>
                                  <td class="name-field">${reuniao.tesourosPalavra.leituraBiblica.responsavel?.nome || ''}</td>
                              </tr>
                          ` : ''}
                      ` : ''}
                      <tr class="section-header section-ministry">
                          <td colspan="2">Faça Seu Melhor no Ministério</td>
                      </tr>
                      ${reuniao.facaSeuMelhor?.map((item: any) => `
                          <tr>
                              <td>${item.tipo || ''} (${item.duracao || ''})</td>
                              <td class="name-field">${item.responsavel?.nome || ''}</td>
                          </tr>
                      `).join('') || ''}
                      <tr class="section-header section-life">
                          <td colspan="2">Nossa Vida Cristã</td>
                      </tr>
                      ${reuniao.nossaVidaCrista?.map((item: any) => `
                          <tr>
                              <td>${item.tipo || ''} (${item.duracao || ''})</td>
                              <td class="name-field">${item.responsavel?.nome || ''}</td>
                          </tr>
                      `).join('') || ''}
                      <tr>
                          <td class="date-header">Comentários finais:</td>
                          <td class="name-field">${reuniao.comentarios?.finais || ''}</td>
                      </tr>
                      <tr>
                          <td class="date-header">Cântico final:</td>
                          <td class="name-field">${reuniao.canticos?.final || ''}</td>
                      </tr>
                      <tr>
                          <td class="date-header">Oração final:</td>
                          <td class="name-field">${reuniao.oracoes?.final?.nome || ''}</td>
                      </tr>
                  </table>
              `).join('')}
          </div>
      </body>
      </html>
    `;

    // Abrir nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Carregar reuniões ao montar o componente e quando filtros mudarem
  useEffect(() => {
    fetchReunioes();
  }, [selectedMes]);

  // Carregar publicadores ao montar o componente
  useEffect(() => {
    fetchPublicadores();
  }, []);

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

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => imprimirMes(selectedMes)}
          disabled={loading || reunioes.length === 0}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
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



                {canEditNVC && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={() => handleEditReuniao(reuniao)}
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          );
        })}
        </div>
      )}

      <Dialog open={!!editingReuniao} onOpenChange={() => setEditingReuniao(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold">
              Editar Reunião - {editingReuniao?.periodo}
            </DialogTitle>
          </DialogHeader>
          
          {editingReuniao && (
            <div className="space-y-8 py-4">
              {/* Presidente e Orações */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2">
                  👨‍💼 Presidente e Orações
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="presidente">Presidente</Label>
                    <Select value={presidenteValue} onValueChange={setPresidenteValue}>
                      <SelectTrigger id="presidente">
                        <SelectValue placeholder="Selecione o presidente" />
                      </SelectTrigger>
                      <SelectContent>
                        {publicadores
                          .filter(pub => pub.privilegio === 'anciao' || pub.privilegio === 'servo_ministerial')
                          .map(publicador => {
                            const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                            return (
                              <SelectItem 
                                key={publicador.id} 
                                value={publicador.nome}
                                className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                              >
                                {publicador.nome}
                                {conflitos.length > 0 && " ⚠️"}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    {(() => {
                      const nomePresidente = editingReuniao.presidente?.nome;
                      if (nomePresidente) {
                        const conflitos = verificarConflitos(nomePresidente, editingReuniao);
                        if (conflitos.length > 0) {
                          return (
                            <div className="text-sm text-amber-600 mt-1">
                              ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                  <div>
                    <Label htmlFor="oracaoInicial">Oração Inicial</Label>
                    <Select value={oracaoInicialValue} onValueChange={setOracaoInicialValue}>
                      <SelectTrigger id="oracaoInicial">
                        <SelectValue placeholder="Selecione para oração inicial" />
                      </SelectTrigger>
                      <SelectContent>
                        {publicadores.map(publicador => {
                          const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                          return (
                            <SelectItem 
                              key={publicador.id} 
                              value={publicador.nome}
                              className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                            >
                              {publicador.nome}
                              {conflitos.length > 0 && " ⚠️"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {(() => {
                      const nomeOracaoInicial = editingReuniao.oracoes?.inicial?.nome;
                      if (nomeOracaoInicial) {
                        const conflitos = verificarConflitos(nomeOracaoInicial, editingReuniao);
                        if (conflitos.length > 0) {
                          return (
                            <div className="text-sm text-amber-600 mt-1">
                              ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                  <div>
                    <Label htmlFor="oracaoFinal">Oração Final</Label>
                    <Select value={oracaoFinalValue} onValueChange={setOracaoFinalValue}>
                      <SelectTrigger id="oracaoFinal">
                        <SelectValue placeholder="Selecione para oração final" />
                      </SelectTrigger>
                      <SelectContent>
                        {publicadores.map(publicador => {
                          const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                          return (
                            <SelectItem 
                              key={publicador.id} 
                              value={publicador.nome}
                              className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                            >
                              {publicador.nome}
                              {conflitos.length > 0 && " ⚠️"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {(() => {
                      const nomeOracaoFinal = editingReuniao.oracoes?.final?.nome;
                      if (nomeOracaoFinal) {
                        const conflitos = verificarConflitos(nomeOracaoFinal, editingReuniao);
                        if (conflitos.length > 0) {
                          return (
                            <div className="text-sm text-amber-600 mt-1">
                              ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Tesouros da Palavra de Deus */}
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 border-b pb-2">
                  💎 Tesouros da Palavra de Deus
                </h3>
                <div className="space-y-4">
                  {editingReuniao.tesourosPalavra && (
                    <>
                      {/* Discurso Principal */}
                      <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-800">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">🎤 Discurso Principal</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-medium">Título: {editingReuniao.tesourosPalavra.titulo}</Label>
                            <Label className="text-sm text-muted-foreground block mt-1">Duração: {editingReuniao.tesourosPalavra.duracao}</Label>
                          </div>
                          <div>
                            <Label htmlFor="tesouros-responsavel">Responsável</Label>
                            <Select value={tesourosPalavraResponsavelValue} onValueChange={setTesourosPalavraResponsavelValue}>
                              <SelectTrigger id="tesouros-responsavel">
                                <SelectValue placeholder="Selecione responsável" />
                              </SelectTrigger>
                              <SelectContent>
                                {publicadores
                                  .filter(p => p.anciao || p.servo_ministerial)
                                  .map(publicador => {
                                    const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                                    return (
                                      <SelectItem 
                                        key={publicador.id} 
                                        value={publicador.nome}
                                        className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                                      >
                                        {publicador.nome}
                                        {conflitos.length > 0 && " ⚠️"}
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>
                            {(() => {
                              const nomeResponsavel = editingReuniao.tesourosPalavra.responsavel?.nome;
                              if (nomeResponsavel) {
                                const conflitos = verificarConflitos(nomeResponsavel, editingReuniao);
                                if (conflitos.length > 0) {
                                  return (
                                    <div className="text-sm text-amber-600 mt-1">
                                      ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Jóias Espirituais */}
                      {editingReuniao.tesourosPalavra.joiasEspirituais && (
                        <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-800">
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">💍 Jóias Espirituais</h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">Duração: {editingReuniao.tesourosPalavra.joiasEspirituais.duracao}</Label>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="joias-texto">Texto</Label>
                                <Input 
                                  id="joias-texto"
                                  defaultValue={editingReuniao.tesourosPalavra.joiasEspirituais.texto || ''}
                                  placeholder="Texto das Jóias Espirituais"
                                />
                              </div>
                              <div>
                                <Label htmlFor="joias-pergunta">Pergunta</Label>
                                <Input 
                                  id="joias-pergunta"
                                  defaultValue={editingReuniao.tesourosPalavra.joiasEspirituais.pergunta || ''}
                                  placeholder="Pergunta das Jóias Espirituais"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="joias-referencia">Referência</Label>
                                <Input 
                                  id="joias-referencia"
                                  defaultValue={editingReuniao.tesourosPalavra.joiasEspirituais.referencia || ''}
                                  placeholder="Referência das Jóias Espirituais"
                                />
                              </div>
                              <div>
                                <Label htmlFor="joias-responsavel">Responsável</Label>
                                <Select value={joiasResponsavelValue} onValueChange={setJoiasResponsavelValue}>
                                  <SelectTrigger id="joias-responsavel">
                                    <SelectValue placeholder="Selecione responsável" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {publicadores.map(publicador => {
                                      const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                                      return (
                                        <SelectItem 
                                          key={publicador.id} 
                                          value={publicador.nome}
                                          className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                                        >
                                          {publicador.nome}
                                          {conflitos.length > 0 && " ⚠️"}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Leitura da Bíblia */}
                      {editingReuniao.tesourosPalavra.leituraBiblica && (
                        <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-800">
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">📖 Leitura da Bíblia</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="font-medium">Texto: {editingReuniao.tesourosPalavra.leituraBiblica.texto}</Label>
                              <Label className="text-sm text-muted-foreground block mt-1">Duração: {editingReuniao.tesourosPalavra.leituraBiblica.duracao}</Label>
                            </div>
                            <div>
                              <Label htmlFor="leitura-responsavel">Responsável</Label>
                              <Select value={leituraResponsavelValue} onValueChange={setLeituraResponsavelValue}>
                                <SelectTrigger id="leitura-responsavel">
                                  <SelectValue placeholder="Selecione responsável" />
                                </SelectTrigger>
                                <SelectContent>
                                  {publicadores.map(publicador => {
                                    const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                                    return (
                                      <SelectItem 
                                        key={publicador.id} 
                                        value={publicador.nome}
                                        className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                                      >
                                        {publicador.nome}
                                        {conflitos.length > 0 && " ⚠️"}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Faça Seu Melhor no Ministério */}
              <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 border-b pb-2">
                  🎯 Faça Seu Melhor no Ministério
                </h3>
                <div className="space-y-4">
                  {Array.isArray(editingReuniao.facaSeuMelhor) && editingReuniao.facaSeuMelhor.map((parte: any, index: number) => (
                    <div key={index} className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-slate-800">
                      <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                        📝 Parte {index + 1}: {parte.tipo}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Duração: {parte.duracao}</Label>
                        </div>
                        <div>
                          <Label htmlFor={`ministerio-responsavel-${index}`}>Responsável</Label>
                          <Select 
                            value={facaSeuMelhorResponsaveis[index] || ""} 
                            onValueChange={(value) => {
                              const newResponsaveis = [...facaSeuMelhorResponsaveis];
                              newResponsaveis[index] = value;
                              setFacaSeuMelhorResponsaveis(newResponsaveis);
                            }}
                          >
                            <SelectTrigger id={`ministerio-responsavel-${index}`}>
                              <SelectValue placeholder="Selecione responsável" />
                            </SelectTrigger>
                            <SelectContent>
                              {publicadores.map(publicador => {
                                const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                                return (
                                  <SelectItem 
                                    key={publicador.id} 
                                    value={publicador.nome}
                                    className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                                  >
                                    {publicador.nome}
                                    {conflitos.length > 0 && " ⚠️"}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {(() => {
                            const nomeResponsavel = parte.responsavel?.nome;
                            if (nomeResponsavel) {
                              const conflitos = verificarConflitos(nomeResponsavel, editingReuniao);
                              if (conflitos.length > 0) {
                                return (
                                  <div className="text-sm text-amber-600 mt-1">
                                    ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}
                        </div>
                        {parte.ajudante && (
                          <div>
                            <Label htmlFor={`ministerio-ajudante-${index}`}>Ajudante</Label>
                            <Select defaultValue={parte.ajudante?.nome || undefined}>
                              <SelectTrigger id={`ministerio-ajudante-${index}`}>
                                <SelectValue placeholder="Selecione ajudante" />
                              </SelectTrigger>
                              <SelectContent>
                                {publicadores.map(publicador => {
                                  const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                                  return (
                                    <SelectItem 
                                      key={publicador.id} 
                                      value={publicador.nome}
                                      className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                                    >
                                      {publicador.nome}
                                      {conflitos.length > 0 && " ⚠️"}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            {(() => {
                              const nomeAjudante = parte.ajudante?.nome;
                              if (nomeAjudante) {
                                const conflitos = verificarConflitos(nomeAjudante, editingReuniao);
                                if (conflitos.length > 0) {
                                  return (
                                    <div className="text-sm text-amber-600 mt-1">
                                      ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nossa Vida Cristã */}
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 border-b pb-2">
                  ❤️ Nossa Vida Cristã
                </h3>
                <div className="space-y-4">
                  {Array.isArray(editingReuniao.nossaVidaCrista) && editingReuniao.nossaVidaCrista.map((parte: any, index: number) => (
                    <div key={index} className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-white dark:bg-slate-800">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                        🎭 Parte {index + 1}: {parte.tipo}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Duração: {parte.duracao}</Label>
                        </div>
                        <div>
                          <Label htmlFor={`nvc-responsavel-${index}`}>Responsável</Label>
                          <Select 
                            value={nossaVidaCristaResponsaveis[index] || ""} 
                            onValueChange={(value) => {
                              const newResponsaveis = [...nossaVidaCristaResponsaveis];
                              newResponsaveis[index] = value;
                              setNossaVidaCristaResponsaveis(newResponsaveis);
                            }}
                          >
                            <SelectTrigger id={`nvc-responsavel-${index}`}>
                              <SelectValue placeholder="Selecione responsável" />
                            </SelectTrigger>
                            <SelectContent>
                              {publicadores
                                .filter(p => p.anciao || p.servo_ministerial)
                                .map(publicador => {
                                  const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                                  return (
                                    <SelectItem 
                                      key={publicador.id} 
                                      value={publicador.nome}
                                      className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                                    >
                                      {publicador.nome}
                                      {conflitos.length > 0 && " ⚠️"}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          {(() => {
                            const nomeResponsavel = parte.responsavel?.nome;
                            if (nomeResponsavel) {
                              const conflitos = verificarConflitos(nomeResponsavel, editingReuniao);
                              if (conflitos.length > 0) {
                                return (
                                  <div className="text-sm text-amber-600 mt-1">
                                    ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}
                        </div>
                        {parte.leitor && (
                          <div>
                            <Label htmlFor={`nvc-leitor-${index}`}>Leitor</Label>
                            <Select defaultValue={parte.leitor?.nome || undefined}>
                              <SelectTrigger id={`nvc-leitor-${index}`}>
                                <SelectValue placeholder="Selecione leitor" />
                              </SelectTrigger>
                              <SelectContent>
                                {publicadores.map(publicador => {
                                  const conflitos = verificarConflitos(publicador.nome, editingReuniao);
                                  return (
                                    <SelectItem 
                                      key={publicador.id} 
                                      value={publicador.nome}
                                      className={conflitos.length > 0 ? "text-amber-600 font-medium" : ""}
                                    >
                                      {publicador.nome}
                                      {conflitos.length > 0 && " ⚠️"}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            {(() => {
                              const nomeLeitor = parte.leitor?.nome;
                              if (nomeLeitor) {
                                const conflitos = verificarConflitos(nomeLeitor, editingReuniao);
                                if (conflitos.length > 0) {
                                  return (
                                    <div className="text-sm text-amber-600 mt-1">
                                      ⚠️ Conflito: {conflitos.map(c => `${c.reuniao} (${c.partes.join(', ')})`).join('; ')}
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReuniao(null)}>
              Cancelar
            </Button>
            <Button onClick={() => handleSaveReuniao()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportPdfDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
