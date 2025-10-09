"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  hasPermission,
  getAllMecanicas,
  createMecanica,
  updateMecanica,
  deleteMecanica,
  getAllPublicadores,
  type Mecanica,
  type CreateMecanicaData,
  type Publicador,
} from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Calendar as CalendarLucide,
  User as UserIcon,
  UserCheck,
  Volume2,
  Monitor,
  Edit,
  Trash2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ImportMecanicasPdfDialog } from "@/components/import-mecanicas-pdf-dialog";

// Funções para filtrar publicadores por permissões específicas
const getPublicadoresComPermissao = (publicadores: Publicador[], permissao: string) => {
  return publicadores.filter(publicador => 
    publicador.ativo && 
    publicador.permissions?.includes(permissao)
  );
};

const getPublicadoresIndicadores = (publicadores: Publicador[]) => {
  return getPublicadoresComPermissao(publicadores, "perm_indicador_entrada")
    .concat(getPublicadoresComPermissao(publicadores, "perm_indicador_palco"))
    .filter((publicador, index, self) => 
      index === self.findIndex(p => p.id === publicador.id)
    );
};

const getPublicadoresAudioVideo = (publicadores: Publicador[]) => {
  return getPublicadoresComPermissao(publicadores, "perm_audio_video");
};

const getPublicadoresVolante = (publicadores: Publicador[]) => {
  return getPublicadoresComPermissao(publicadores, "perm_volante");
};

const getPublicadoresPalco = (publicadores: Publicador[]) => {
  return getPublicadoresComPermissao(publicadores, "perm_palco");
};

const getPublicadoresLeitor = (publicadores: Publicador[]) => {
  return getPublicadoresComPermissao(publicadores, "perm_leitor");
};

const getPublicadoresPresidencia = (publicadores: Publicador[]) => {
  return getPublicadoresComPermissao(publicadores, "perm_presidencia");
};

export default function MecanicasPage() {
  // Estados para dados
  const [mecanicas, setMecanicas] = useState<Mecanica[]>([]);
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMecanica, setEditingMecanica] = useState<Mecanica | null>(null);
  const [date, setDate] = useState<Date>();
  const [novaDesignacao, setNovaDesignacao] = useState({
    tipoReuniao: "",
    indicadorEntrada: "",
    indicadorAuditorio: "",
    audioVideo: "",
    volante: "",
    palco: "",
    // Campos específicos para fim de semana
    leitorSentinela: "",
    presidente: "",
  });

  const { user } = useAuth();

  // Verificar permissões
  const podeGerenciarMecanicas = user
    ? hasPermission(user, "edit_mecanicas")
    : false;

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [mecanicasData, publicadoresData] = await Promise.all([
          getAllMecanicas(),
          getAllPublicadores(),
        ]);

        setMecanicas(mecanicasData);
        setPublicadores(publicadoresData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Por favor, selecione uma data");
      return;
    }

    if (!novaDesignacao.tipoReuniao) {
      toast.error("Por favor, selecione o tipo de reunião");
      return;
    }

    // Validações específicas para fim de semana
    if (novaDesignacao.tipoReuniao === "fim_semana") {
      if (!novaDesignacao.leitorSentinela) {
        toast.error("Por favor, selecione o leitor de sentinela");
        return;
      }
      if (!novaDesignacao.presidente) {
        toast.error("Por favor, selecione o presidente");
        return;
      }
    }

    try {
      const mecanicaData: CreateMecanicaData = {
        data: format(date, "yyyy-MM-dd"),
        tipo_reuniao: novaDesignacao.tipoReuniao as
          | "meio_semana"
          | "fim_semana",
        indicador_entrada_id: novaDesignacao.indicadorEntrada || undefined,
        indicador_auditorio_id: novaDesignacao.indicadorAuditorio || undefined,
        audio_video_id: novaDesignacao.audioVideo || undefined,
        volante_id: novaDesignacao.volante || undefined,
        palco_id: novaDesignacao.palco || undefined,
        leitor_sentinela_id: novaDesignacao.leitorSentinela || undefined,
        presidente_id: novaDesignacao.presidente || undefined,
      };

      let result;
      if (isEditMode && editingMecanica) {
        result = await updateMecanica(editingMecanica.id, mecanicaData);
      } else {
        result = await createMecanica(mecanicaData);
      }

      if (result.success) {
        toast.success(
          isEditMode
            ? "Designação atualizada com sucesso!"
            : "Designação criada com sucesso!"
        );

        // Recarregar dados
        const [mecanicasData, publicadoresData] = await Promise.all([
          getAllMecanicas(),
          getAllPublicadores(),
        ]);
        setMecanicas(mecanicasData);
        setPublicadores(publicadoresData);

        // Reset do formulário
        resetForm();
      } else {
        toast.error(result.error || "Erro ao salvar designação");
      }
    } catch (error) {
      console.error("Erro ao salvar designação:", error);
      toast.error("Erro interno do servidor");
    }
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setDate(undefined);
    setNovaDesignacao({
      tipoReuniao: "",
      indicadorEntrada: "",
      indicadorAuditorio: "",
      audioVideo: "",
      volante: "",
      palco: "",
      leitorSentinela: "",
      presidente: "",
    });
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingMecanica(null);
  };

  // Função para editar mecânica
  const handleEditMecanica = (mecanica: Mecanica) => {
    setIsEditMode(true);
    setEditingMecanica(mecanica);
    setDate(new Date(mecanica.data));
    setNovaDesignacao({
      tipoReuniao: mecanica.tipo_reuniao,
      indicadorEntrada: mecanica.indicador_entrada_id || "",
      indicadorAuditorio: mecanica.indicador_auditorio_id || "",
      audioVideo: mecanica.audio_video_id || "",
      volante: mecanica.volante_id || "",
      palco: mecanica.palco_id || "",
      leitorSentinela: mecanica.leitor_sentinela_id || "",
      presidente: mecanica.presidente_id || "",
    });
    setIsModalOpen(true);
  };

  // Função para deletar mecânica
  const handleDeleteMecanica = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta designação?")) {
      return;
    }

    try {
      const result = await deleteMecanica(id);

      if (result.success) {
        toast.success("Designação excluída com sucesso!");

        // Recarregar dados
        const [mecanicasData, publicadoresData] = await Promise.all([
          getAllMecanicas(),
          getAllPublicadores(),
        ]);
        setMecanicas(mecanicasData);
        setPublicadores(publicadoresData);
      } else {
        toast.error(result.error || "Erro ao excluir designação");
      }
    } catch (error) {
      console.error("Erro ao excluir designação:", error);
      toast.error("Erro interno do servidor");
    }
  };

  // Mostrar loading se ainda carregando
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mecânicas</h2>
        </div>
        <div className="text-center py-8">
          <LoadingSpinner text="Carregando designações..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mecânicas</h2>
        {podeGerenciarMecanicas && (
          <div className="flex gap-2">
            <ImportMecanicasPdfDialog 
              onImportSuccess={() => {
                // Recarregar dados após importação bem-sucedida
                const loadData = async () => {
                  try {
                    const mecanicasData = await getAllMecanicas();
                    setMecanicas(mecanicasData);
                    toast.success("Dados atualizados!");
                  } catch (error) {
                    console.error("Erro ao recarregar dados:", error);
                  }
                };
                loadData();
              }}
            />
            <Dialog
              open={isModalOpen}
              onOpenChange={(open) => {
                setIsModalOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Designação
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode
                    ? "Editar Designação de Mecânicas"
                    : "Nova Designação de Mecânicas"}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Edite a designação para uma reunião (meio de semana ou fim de semana)."
                    : "Crie uma nova designação completa para uma reunião (meio de semana ou fim de semana)."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de Reunião */}
                <div className="space-y-2">
                  <Label htmlFor="tipoReuniao">Tipo de Reunião</Label>
                  <Select
                    value={novaDesignacao.tipoReuniao}
                    onValueChange={(value) =>
                      setNovaDesignacao((prev) => ({
                        ...prev,
                        tipoReuniao: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de reunião" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meio_semana">
                        Meio de Semana
                      </SelectItem>
                      <SelectItem value="fim_semana">Fim de Semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label>Data da Reunião</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date
                          ? format(date, "PPP", { locale: ptBR })
                          : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Indicador - Entrada */}
                <div className="space-y-2">
                  <Label htmlFor="indicadorEntrada">Indicador - Entrada</Label>
                  <Select
                    value={novaDesignacao.indicadorEntrada}
                    onValueChange={(value) =>
                      setNovaDesignacao((prev) => ({
                        ...prev,
                        indicadorEntrada: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o indicador da entrada" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPublicadoresIndicadores(publicadores)
                        .map((publicador) => (
                          <SelectItem key={publicador.id} value={publicador.id}>
                            {publicador.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Indicador - Auditório */}
                <div className="space-y-2">
                  <Label htmlFor="indicadorAuditorio">
                    Indicador - Auditório
                  </Label>
                  <Select
                    value={novaDesignacao.indicadorAuditorio}
                    onValueChange={(value) =>
                      setNovaDesignacao((prev) => ({
                        ...prev,
                        indicadorAuditorio: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o indicador do auditório" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPublicadoresIndicadores(publicadores)
                        .map((publicador) => (
                          <SelectItem key={publicador.id} value={publicador.id}>
                            {publicador.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Áudio e Vídeo */}
                <div className="space-y-2">
                  <Label htmlFor="audioVideo">Áudio e Vídeo</Label>
                  <Select
                    value={novaDesignacao.audioVideo}
                    onValueChange={(value) =>
                      setNovaDesignacao((prev) => ({
                        ...prev,
                        audioVideo: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione responsável pelo áudio e vídeo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPublicadoresAudioVideo(publicadores)
                        .map((publicador) => (
                          <SelectItem key={publicador.id} value={publicador.id}>
                            {publicador.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Volante */}
                <div className="space-y-2">
                  <Label htmlFor="volante">Volante</Label>
                  <Select
                    value={novaDesignacao.volante}
                    onValueChange={(value) =>
                      setNovaDesignacao((prev) => ({ ...prev, volante: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o volante" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPublicadoresVolante(publicadores)
                        .map((publicador) => (
                          <SelectItem key={publicador.id} value={publicador.id}>
                            {publicador.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Palco */}
                <div className="space-y-2">
                  <Label htmlFor="palco">Palco</Label>
                  <Select
                    value={novaDesignacao.palco}
                    onValueChange={(value) =>
                      setNovaDesignacao((prev) => ({ ...prev, palco: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione responsável pelo palco" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPublicadoresPalco(publicadores)
                        .map((publicador) => (
                          <SelectItem key={publicador.id} value={publicador.id}>
                            {publicador.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos específicos para Fim de Semana */}
                {novaDesignacao.tipoReuniao === "fim_semana" && (
                  <>
                    {/* Leitor de Sentinela */}
                    <div className="space-y-2">
                      <Label htmlFor="leitorSentinela">
                        Leitor de Sentinela
                      </Label>
                      <Select
                        value={novaDesignacao.leitorSentinela}
                        onValueChange={(value) =>
                          setNovaDesignacao((prev) => ({
                            ...prev,
                            leitorSentinela: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o leitor de sentinela" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPublicadoresLeitor(publicadores)
                            .map((publicador) => (
                              <SelectItem key={publicador.id} value={publicador.id}>
                                {publicador.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Presidente */}
                    <div className="space-y-2">
                      <Label htmlFor="presidente">Presidente</Label>
                      <Select
                        value={novaDesignacao.presidente}
                        onValueChange={(value) =>
                          setNovaDesignacao((prev) => ({
                            ...prev,
                            presidente: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o presidente" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPublicadoresPresidencia(publicadores)
                            .map((publicador) => (
                              <SelectItem key={publicador.id} value={publicador.id}>
                                {publicador.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {isEditMode ? "Atualizar Designação" : "Criar Designação"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {mecanicas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma designação encontrada.</p>
            {podeGerenciarMecanicas && (
              <p className="text-sm mt-2">
                Clique em &quot;Nova Designação&quot; para criar a primeira.
              </p>
            )}
          </div>
        ) : (
          mecanicas.map((mecanica) => {
            const dataFormatada = new Date(mecanica.data).toLocaleDateString(
              "pt-BR",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            return (
              <CollapsibleCard
                key={mecanica.id}
                title={dataFormatada}
                icon={CalendarLucide}
                defaultExpanded={false}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {/* Indicador - Entrada */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Indicador - Entrada
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {publicadores.find(
                          (p) => p.id === mecanica.indicador_entrada_id
                        )?.nome || "Não designado"}
                      </p>
                    </div>

                    {/* Indicador - Auditório */}
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Indicador - Auditório
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {publicadores.find(
                          (p) => p.id === mecanica.indicador_auditorio_id
                        )?.nome || "Não designado"}
                      </p>
                    </div>

                    {/* Áudio e Vídeo */}
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          Áudio e Vídeo
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {publicadores.find((p) => p.id === mecanica.audio_video_id)
                          ?.nome || "Não designado"}
                      </p>
                    </div>

                    {/* Volante */}
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          Volante
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {publicadores.find((p) => p.id === mecanica.volante_id)
                          ?.nome || "Não designado"}
                      </p>
                    </div>

                    {/* Palco */}
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                          Palco
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {publicadores.find((p) => p.id === mecanica.palco_id)
                          ?.nome || "Não designado"}
                      </p>
                    </div>
                  </div>

                  {podeGerenciarMecanicas && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditMecanica(mecanica)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDeleteMecanica(mecanica.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleCard>
            );
          })
        )}
      </div>
    </div>
  );
}
