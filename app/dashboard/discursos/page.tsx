"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CollapsibleCard } from "@/components/collapsible-card";
import {
  Plus,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Music,
  CalendarIcon,
  Edit,
  Trash2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getAllDiscursos,
  getOradoresCombinados,
  createDiscurso,
  createOrador,
  updateDiscurso,
  deleteDiscurso,
  hasPermission,
  type Discurso,
  type Orador,
} from "@/lib/auth";

export default function DiscursosPage() {
  const [discursos, setDiscursos] = useState<Discurso[]>([]);
  const [oradores, setOradores] = useState<Orador[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOradorModalOpen, setIsOradorModalOpen] = useState(false);
  const [editDiscursoOpen, setEditDiscursoOpen] = useState(false);
  const [selectedDiscurso, setSelectedDiscurso] = useState<Discurso | null>(
    null
  );
  const [date, setDate] = useState<Date>();
  const [novoDiscurso, setNovoDiscurso] = useState({
    tema: "",
    data: "",
    orador_id: "",
    cantico: "",
    hospitalidade_id: "",
    tem_imagem: false,
  });

  const [novoOrador, setNovoOrador] = useState({
    nome: "",
    congregacao_origem: "",
  });

  // Carregar dados do Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [discursosData, oradoresData] = await Promise.all([
        getAllDiscursos(),
        getOradoresCombinados(),
      ]);
      setDiscursos(discursosData);
      setOradores(oradoresData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  const podeGerenciarDiscursos = user
    ? hasPermission(user, "edit_discursos")
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novoDiscurso.tema || !novoDiscurso.data || !novoDiscurso.orador_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const result = await createDiscurso({
        tema: novoDiscurso.tema,
        data: novoDiscurso.data,
        orador_id: novoDiscurso.orador_id,
        cantico: novoDiscurso.cantico || undefined,
        hospitalidade_id: novoDiscurso.hospitalidade_id || undefined,
        tem_imagem: novoDiscurso.tem_imagem,
      });

      if (result.success) {
        toast.success("Discurso criado com sucesso!");
        setIsModalOpen(false);
        setNovoDiscurso({
          tema: "",
          data: "",
          orador_id: "",
          cantico: "",
          hospitalidade_id: "",
          tem_imagem: false,
        });
        fetchData(); // Recarregar dados
      } else {
        toast.error(result.error || "Erro ao criar discurso");
      }
    } catch (error) {
      console.error("Erro ao criar discurso:", error);
      toast.error("Erro interno do servidor");
    }
  };

  const handleOradorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novoOrador.nome || !novoOrador.congregacao_origem) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const result = await createOrador(novoOrador);

      if (result.success) {
        toast.success("Orador criado com sucesso!");
        setIsOradorModalOpen(false);
        setNovoOrador({
          nome: "",
          congregacao_origem: "",
        });
        fetchData(); // Recarregar dados
      } else {
        toast.error(result.error || "Erro ao criar orador");
      }
    } catch (error) {
      console.error("Erro ao criar orador:", error);
      toast.error("Erro interno do servidor");
    }
  };

  const handleEditDiscurso = (discurso: Discurso) => {
    setSelectedDiscurso(discurso);
    setNovoDiscurso({
      tema: discurso.tema,
      data: discurso.data,
      orador_id: discurso.orador_id,
      cantico: discurso.cantico || "",
      hospitalidade_id: discurso.hospitalidade_id || "",
      tem_imagem: discurso.tem_imagem,
    });
    setEditDiscursoOpen(true);
  };

  const handleUpdateDiscurso = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedDiscurso ||
      !novoDiscurso.tema ||
      !novoDiscurso.data ||
      !novoDiscurso.orador_id
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const result = await updateDiscurso(selectedDiscurso.id, {
        tema: novoDiscurso.tema,
        data: novoDiscurso.data,
        orador_id: novoDiscurso.orador_id,
        cantico: novoDiscurso.cantico || undefined,
        hospitalidade_id: novoDiscurso.hospitalidade_id || undefined,
        tem_imagem: novoDiscurso.tem_imagem,
      });

      if (result.success) {
        toast.success("Discurso atualizado com sucesso!");
        setEditDiscursoOpen(false);
        setSelectedDiscurso(null);
        setNovoDiscurso({
          tema: "",
          data: "",
          orador_id: "",
          cantico: "",
          hospitalidade_id: "",
          tem_imagem: false,
        });
        fetchData(); // Recarregar dados
      } else {
        toast.error(result.error || "Erro ao atualizar discurso");
      }
    } catch (error) {
      console.error("Erro ao atualizar discurso:", error);
      toast.error("Erro interno do servidor");
    }
  };

  const handleDeleteDiscurso = async (discurso: Discurso) => {
    if (
      !confirm(`Tem certeza que deseja deletar o discurso "${discurso.tema}"?`)
    ) {
      return;
    }

    try {
      const result = await deleteDiscurso(discurso.id);

      if (result.success) {
        toast.success("Discurso deletado com sucesso!");
        fetchData(); // Recarregar dados
      } else {
        toast.error(result.error || "Erro ao deletar discurso");
      }
    } catch (error) {
      console.error("Erro ao deletar discurso:", error);
      toast.error("Erro interno do servidor");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner text="Carregando discursos..." />
        </div>
      </div>
    );
  }

  // Ordenar discursos por data
  const discursosOrdenados = discursos.sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Discursos</h2>
        {podeGerenciarDiscursos && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Discurso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Discurso</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema *</Label>
                  <Input
                    id="tema"
                    value={novoDiscurso.tema}
                    onChange={(e) =>
                      setNovoDiscurso({ ...novoDiscurso, tema: e.target.value })
                    }
                    placeholder="Digite o tema do discurso"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!date}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          if (selectedDate) {
                            setNovoDiscurso({
                              ...novoDiscurso,
                              data: selectedDate.toISOString().split("T")[0],
                            });
                          }
                        }}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orador">Orador *</Label>
                    {podeGerenciarDiscursos && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOradorModalOpen(true)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Novo Orador
                      </Button>
                    )}
                  </div>
                  <Select
                    value={novoDiscurso.orador_id}
                    onValueChange={(value) =>
                      setNovoDiscurso({ ...novoDiscurso, orador_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o orador" />
                    </SelectTrigger>
                    <SelectContent>
                      {oradores.map((orador) => (
                        <SelectItem key={orador.id} value={orador.id}>
                          {orador.nome} - {orador.congregacao_origem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantico">Cântico</Label>
                  <Input
                    id="cantico"
                    value={novoDiscurso.cantico}
                    onChange={(e) =>
                      setNovoDiscurso({
                        ...novoDiscurso,
                        cantico: e.target.value,
                      })
                    }
                    placeholder="Número do cântico"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospitalidade">Hospitalidade</Label>
                  <Select
                    value={novoDiscurso.hospitalidade_id}
                    onValueChange={(value) =>
                      setNovoDiscurso({
                        ...novoDiscurso,
                        hospitalidade_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quem oferecerá hospitalidade (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {oradores.map((orador) => (
                        <SelectItem key={orador.id} value={orador.id}>
                          {orador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tem_imagem"
                    checked={novoDiscurso.tem_imagem}
                    onCheckedChange={(checked) =>
                      setNovoDiscurso({ ...novoDiscurso, tem_imagem: checked })
                    }
                  />
                  <Label htmlFor="tem_imagem">Tem imagem</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Criar Discurso
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Modal para editar discurso */}
      <Dialog open={editDiscursoOpen} onOpenChange={setEditDiscursoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Discurso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDiscurso} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tema-edit">Tema *</Label>
              <Input
                id="tema-edit"
                value={novoDiscurso.tema}
                onChange={(e) =>
                  setNovoDiscurso({ ...novoDiscurso, tema: e.target.value })
                }
                placeholder="Digite o tema do discurso"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={novoDiscurso.data}
                onChange={(e) =>
                  setNovoDiscurso({ ...novoDiscurso, data: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orador-edit">Orador *</Label>
              <Select
                value={novoDiscurso.orador_id}
                onValueChange={(value) =>
                  setNovoDiscurso({ ...novoDiscurso, orador_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o orador" />
                </SelectTrigger>
                <SelectContent>
                  {oradores.map((orador) => (
                    <SelectItem key={orador.id} value={orador.id}>
                      {orador.nome} - {orador.congregacao_origem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantico-edit">Cântico</Label>
              <Input
                id="cantico-edit"
                value={novoDiscurso.cantico}
                onChange={(e) =>
                  setNovoDiscurso({ ...novoDiscurso, cantico: e.target.value })
                }
                placeholder="Número do cântico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalidade-edit">Hospitalidade</Label>
              <Select
                value={novoDiscurso.hospitalidade_id}
                onValueChange={(value) =>
                  setNovoDiscurso({ ...novoDiscurso, hospitalidade_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione quem oferecerá hospitalidade (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {oradores.map((orador) => (
                    <SelectItem key={orador.id} value={orador.id}>
                      {orador.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="tem_imagem-edit"
                checked={novoDiscurso.tem_imagem}
                onCheckedChange={(checked) =>
                  setNovoDiscurso({ ...novoDiscurso, tem_imagem: checked })
                }
              />
              <Label htmlFor="tem_imagem-edit">Tem imagem</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDiscursoOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Atualizar Discurso
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para criar novo orador */}
      <Dialog open={isOradorModalOpen} onOpenChange={setIsOradorModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Orador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOradorSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome-orador">Nome Completo *</Label>
              <Input
                id="nome-orador"
                value={novoOrador.nome}
                onChange={(e) =>
                  setNovoOrador({ ...novoOrador, nome: e.target.value })
                }
                placeholder="Digite o nome completo do orador"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="congregacao-origem">
                Congregação de Origem *
              </Label>
              <Input
                id="congregacao-origem"
                value={novoOrador.congregacao_origem}
                onChange={(e) =>
                  setNovoOrador({
                    ...novoOrador,
                    congregacao_origem: e.target.value,
                  })
                }
                placeholder="Digite a congregação do orador"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOradorModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Criar Orador
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {discursosOrdenados.map((discurso) => {
          const orador = oradores.find((o) => o.id === discurso.orador_id);
          const hospitalidade = oradores.find(
            (p) => p.id === discurso.hospitalidade_id
          );

          const dataFormatada = new Date(discurso.data).toLocaleDateString(
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
                    <span className="text-sm font-medium text-primary">
                      Orador
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {orador?.nome || "Não designado"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {orador?.congregacao_origem || ""}
                  </p>
                </div>

                {/* Grid com informações */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Hospitalidade */}
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Hospitalidade
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {hospitalidade?.nome || "Não definida"}
                    </p>
                  </div>

                  {/* Cântico */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Music className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Cântico
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {discurso.cantico || "Não definido"}
                    </p>
                  </div>

                  {/* Status da Imagem */}
                  <div
                    className={`p-3 rounded-lg border ${
                      discurso.tem_imagem
                        ? "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800"
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {discurso.tem_imagem ? (
                        <CheckCircle className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          discurso.tem_imagem
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        Imagem
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {discurso.tem_imagem ? "Disponível" : "Não disponível"}
                    </p>
                  </div>
                </div>

                {podeGerenciarDiscursos && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditDiscurso(discurso)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteDiscurso(discurso)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    </div>
  );
}
