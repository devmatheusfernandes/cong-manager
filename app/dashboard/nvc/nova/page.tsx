"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { BIBLE_BOOKS, formatPeriod, getNextMonday } from "@/lib/bible-books";
import {
  type Pessoa,
  type FacaSeuMelhorParte,
  type NossaVidaCristaParte,
  type NovaReuniaoData,
  EVENTOS_ESPECIAIS,
  TIPOS_FACA_SEU_MELHOR,
  TIPOS_NOSSA_VIDA_CRISTA,
} from "@/lib/types/reuniao";
import {
  Plus,
  Minus,
  Calendar as CalendarIcon,
  Music,
  MessageSquare,
  Lightbulb,
  Target,
  Heart,
  AlertTriangle,
  Users,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Settings,
  Clock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NovaReuniaoPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(getNextMonday());
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [startChapter, setStartChapter] = useState<string>("");
  const [endChapter, setEndChapter] = useState<string>("");
  const [isRange, setIsRange] = useState<boolean>(false);
  const [publicadores, setPublicadores] = useState<any[]>([]);
  const [loadingPublicadores, setLoadingPublicadores] = useState(true);
  
  const [formData, setFormData] = useState<NovaReuniaoData>({
    periodo: formatPeriod(getNextMonday()),
    leituraBiblica: "",
    comentarios: null,
    oracoes: {},
    canticos: {
      inicial: "",
      intermediario: "",
      final: "",
    },
    tesourosPalavra: {
      discurso: {
        titulo: "",
        duracao: "10 min",
      },
      joiasEspirituais: {
        duracao: "10 min",
      },
      leituraBiblica: {
        texto: "",
        duracao: "4 min",
      },
    },
    facaSeuMelhor: [{ tipo: "", duracao: "15 min", descricao: "" }],
    nossaVidaCrista: [{ tipo: "Necessidades locais", duracao: "15 min" }],
    semanaVisitaSuperintendente: false,
    diaTerca: false,
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Garantir que seja uma segunda-feira
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 1) {
        // Ajustar para a segunda-feira mais próxima
        const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        date.setDate(date.getDate() + daysToMonday);
      }
      
      setSelectedDate(date);
      setFormData({
        ...formData,
        periodo: formatPeriod(date),
      });
    }
  };

  const handleBookChange = (bookName: string) => {
    setSelectedBook(bookName);
    setStartChapter("");
    setEndChapter("");
    setFormData({
      ...formData,
      leituraBiblica: bookName,
    });
  };

  const handleStartChapterChange = (chapter: string) => {
    setStartChapter(chapter);
    updateBibleReading(chapter, endChapter);
  };

  const handleEndChapterChange = (chapter: string) => {
    setEndChapter(chapter);
    updateBibleReading(startChapter, chapter);
  };

  const updateBibleReading = (start: string, end: string) => {
    if (!selectedBook) return;
    
    let reading = selectedBook;
    if (start) {
      if (isRange && end && start !== end) {
        reading = `${selectedBook} ${start}-${end}`;
      } else {
        reading = `${selectedBook} ${start}`;
      }
    }
    
    setFormData({
      ...formData,
      leituraBiblica: reading,
    });
  };

  const handleRangeToggle = (checked: boolean) => {
    setIsRange(checked);
    if (!checked) {
      setEndChapter("");
      updateBibleReading(startChapter, "");
    } else {
      updateBibleReading(startChapter, endChapter);
    }
  };

  // Gerenciar automaticamente o estudo bíblico de congregação
  useEffect(() => {
    const hasEstudoBiblico = formData.nossaVidaCrista.some(
      parte => parte.tipo === "Estudo bíblico de congregação"
    );

    if (formData.semanaVisitaSuperintendente) {
      // Se for visita do superintendente, remover estudo bíblico
      if (hasEstudoBiblico) {
        setFormData(prev => ({
          ...prev,
          nossaVidaCrista: prev.nossaVidaCrista.filter(
            parte => parte.tipo !== "Estudo bíblico de congregação"
          )
        }));
      }
    } else {
      // Se não for visita, garantir que tem estudo bíblico
      if (!hasEstudoBiblico) {
        setFormData(prev => ({
          ...prev,
          nossaVidaCrista: [
            ...prev.nossaVidaCrista,
            {
              tipo: "Estudo bíblico de congregação",
              duracao: "30 min",
              responsavel: { id: "", nome: "" },
              leitor: { id: "", nome: "" },
              tema: ""
            }
          ]
        }));
      }
    }
  }, [formData.semanaVisitaSuperintendente]);

  // Buscar publicadores do Supabase
  useEffect(() => {
    const fetchPublicadores = async () => {
      try {
        const response = await fetch('/api/publicadores');
        if (response.ok) {
          const data = await response.json();
          setPublicadores(data);
        }
      } catch (error) {
        console.error('Erro ao buscar publicadores:', error);
        toast.error('Erro ao carregar publicadores');
      } finally {
        setLoadingPublicadores(false);
      }
    };

    fetchPublicadores();
  }, []);

  const handleSubmit = async () => {
    // Validações básicas
    if (!formData.periodo) {
      toast.error("Período é obrigatório");
      return;
    }

    if (!formData.leituraBiblica) {
      toast.error("Leitura bíblica é obrigatória");
      return;
    }

    try {
      // Preparar dados para envio
      const reuniaoData = {
        nossa_vida_crista: [{
          id: `nova-${Date.now()}`,
          congregacao_id: "660e8400-e29b-41d4-a716-446655440001", // ID padrão da congregação
          periodo: formData.periodo,
          leituraBiblica: formData.leituraBiblica,
          presidente: formData.presidente,
          oracoes: formData.oracoes,
          canticos: formData.canticos,
          comentarios: formData.comentarios,
          tesourosPalavra: formData.tesourosPalavra,
          facaSeuMelhor: formData.facaSeuMelhor,
          nossaVidaCrista: formData.nossaVidaCrista,
          eventoEspecial: formData.eventoEspecial || null,
          semanaVisitaSuperintendente: formData.semanaVisitaSuperintendente,
          diaTerca: formData.diaTerca
        }]
      };

      // Salvar no Supabase
      const response = await fetch('/api/nvc/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reuniaoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar reunião');
      }

      const result = await response.json();
      
      toast.success("Reunião criada e salva no Supabase com sucesso!");
      router.push("/dashboard/nvc");
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
      toast.error(`Erro ao salvar reunião: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const selectedBookData = BIBLE_BOOKS.find(book => book.name === selectedBook);

  // Função auxiliar para atualizar campos aninhados
  const updateFormField = (path: string, value: any) => {
    const keys = path.split('.');
    const newFormData = { ...formData } as any;
    let current = newFormData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setFormData(newFormData);
  };

  // Funções para gerenciar partes dinâmicas
  const addFacaSeuMelhorParte = () => {
    if (formData.facaSeuMelhor.length < 4) {
      setFormData({
        ...formData,
        facaSeuMelhor: [
          ...formData.facaSeuMelhor,
          {
            tipo: "",
            duracao: "15 min",
            responsavel: { id: "", nome: "" },
            ajudante: { id: "", nome: "" },
            descricao: ""
          }
        ]
      });
    }
  };

  const removeFacaSeuMelhorParte = (index: number) => {
    if (formData.facaSeuMelhor.length > 1) {
      const newParts = formData.facaSeuMelhor.filter((_, i) => i !== index);
      setFormData({ ...formData, facaSeuMelhor: newParts });
    }
  };

  const addNossaVidaCristaParte = () => {
    if (formData.nossaVidaCrista.length < 3) {
      setFormData({
        ...formData,
        nossaVidaCrista: [
          ...formData.nossaVidaCrista,
          {
            tipo: "",
            duracao: "15 min",
            responsavel: { id: "", nome: "" },
            conteudo: "",
            leitor: { id: "", nome: "" }
          }
        ]
      });
    }
  };

  const removeNossaVidaCristaParte = (index: number) => {
    if (formData.nossaVidaCrista.length > 1) {
      const newParts = formData.nossaVidaCrista.filter((_, i) => i !== index);
      setFormData({ ...formData, nossaVidaCrista: newParts });
    }
  };

  // Calcular tempo total do Faça Seu Melhor no Ministério
  const calcularTempoTotalFacaSeuMelhor = () => {
    const tempoPartes = formData.facaSeuMelhor.reduce((total, parte) => {
      const minutos = parseInt(parte.duracao.replace(" min", ""));
      return total + minutos;
    }, 0);
    
    // Adicionar 1 minuto de comentário presidencial por parte
    const tempoComentarios = formData.facaSeuMelhor.length * 1;
    
    return tempoPartes + tempoComentarios;
  };

  const tempoTotalFacaSeuMelhor = calcularTempoTotalFacaSeuMelhor();
  const tempoExcedido = tempoTotalFacaSeuMelhor > 15;

  // Filtrar publicadores por permissão
  const getPublicadoresPorPermissao = (permissao?: string) => {
    if (!permissao) return publicadores;
    return publicadores.filter(pub => 
      pub.ativo && pub.permissions && pub.permissions.includes(permissao)
    );
  };

  // Componente de select para publicadores
  const PublicadorSelect = ({ 
    value, 
    onChange, 
    placeholder, 
    permissao 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    placeholder: string; 
    permissao?: string;
  }) => {
    const publicadoresFiltrados = getPublicadoresPorPermissao(permissao);
    
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={loadingPublicadores ? "Carregando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loadingPublicadores ? (
            <SelectItem value="__loading__" disabled>Carregando publicadores...</SelectItem>
          ) : publicadoresFiltrados.length === 0 ? (
            <SelectItem value="__empty__" disabled>Nenhum publicador encontrado</SelectItem>
          ) : (
            publicadoresFiltrados.map((pub) => (
              <SelectItem key={pub.id} value={pub.id}>
                {pub.nome}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Reunião Nossa Vida Cristã</h1>
      </div>

      <div className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data da Segunda-feira</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Período</Label>
                <Input
                  value={formData.periodo}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            <div>
              <Label>Leitura Bíblica da Semana</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Select value={selectedBook} onValueChange={handleBookChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o livro" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_BOOKS.map((book) => (
                        <SelectItem key={book.name} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedBook && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="range"
                        checked={isRange}
                        onCheckedChange={handleRangeToggle}
                      />
                      <Label htmlFor="range">Intervalo de capítulos</Label>
                    </div>
                    
                    <div className={`grid gap-3 ${isRange ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <div>
                        <Label>{isRange ? "Capítulo inicial" : "Capítulo"}</Label>
                        <Select 
                          value={startChapter} 
                          onValueChange={handleStartChapterChange}
                          disabled={!selectedBook}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o capítulo" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedBookData && Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map((chapter) => (
                              <SelectItem key={chapter} value={chapter.toString()}>
                                Capítulo {chapter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {isRange && (
                        <div>
                          <Label>Capítulo final</Label>
                          <Select 
                            value={endChapter} 
                            onValueChange={handleEndChapterChange}
                            disabled={!selectedBook || !startChapter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o capítulo final" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedBookData && Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1)
                                .filter(chapter => chapter >= parseInt(startChapter || "1"))
                                .map((chapter) => (
                                <SelectItem key={chapter} value={chapter.toString()}>
                                  Capítulo {chapter}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {formData.leituraBiblica && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Leitura selecionada: {formData.leituraBiblica}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações Especiais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Configurações Especiais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="superintendente"
                checked={formData.semanaVisitaSuperintendente}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, semanaVisitaSuperintendente: checked })
                }
              />
              <Label htmlFor="superintendente">Semana da visita do superintendente</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="terca"
                checked={formData.diaTerca}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, diaTerca: checked })
                }
              />
              <Label htmlFor="terca">Reunião na terça-feira</Label>
            </div>

            <div>
              <Label>Evento Especial</Label>
              <Select
                value={formData.eventoEspecial || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, eventoEspecial: value === "none" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione se há evento especial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum evento especial</SelectItem>
                  {EVENTOS_ESPECIAIS.map((evento) => (
                    <SelectItem key={evento} value={evento}>
                      {evento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Informações Gerais da Reunião */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Presidente</Label>
                <PublicadorSelect
                  value={formData.presidente?.id || ""}
                  onChange={(value) => {
                    const publicador = publicadores.find(p => p.id === value);
                    updateFormField("presidente", { 
                      id: value, 
                      nome: publicador?.nome || "" 
                    });
                  }}
                  placeholder="Selecione o presidente"
                  permissao="perm_presidencia"
                />
              </div>
              <div>
                <Label>Oração Inicial</Label>
                <PublicadorSelect
                  value={formData.oracoes.inicial?.id || ""}
                  onChange={(value) => {
                    const publicador = publicadores.find(p => p.id === value);
                    updateFormField("oracoes.inicial", { 
                      id: value, 
                      nome: publicador?.nome || "" 
                    });
                  }}
                  placeholder="Selecione para oração inicial"
                  permissao="perm_oracao"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Cântico Inicial</Label>
                <Input
                  placeholder="Número do cântico"
                  value={formData.canticos.inicial}
                  onChange={(e) => updateFormField("canticos.inicial", e.target.value)}
                />
              </div>
              <div>
                <Label>Cântico Intermediário</Label>
                <Input
                  placeholder="Número do cântico"
                  value={formData.canticos.intermediario}
                  onChange={(e) => updateFormField("canticos.intermediario", e.target.value)}
                />
              </div>
              <div>
                <Label>Cântico Final</Label>
                <Input
                  placeholder="Número do cântico"
                  value={formData.canticos.final}
                  onChange={(e) => updateFormField("canticos.final", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Oração Final</Label>
              <PublicadorSelect
                value={formData.oracoes.final?.id || ""}
                onChange={(value) => {
                  const publicador = publicadores.find(p => p.id === value);
                  updateFormField("oracoes.final", { 
                    id: value, 
                    nome: publicador?.nome || "" 
                  });
                }}
                placeholder="Selecione para oração final"
                permissao="perm_oracao"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tesouros da Palavra de Deus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Tesouros da Palavra de Deus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Discurso</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  <Label>Título</Label>
                  <Input
                    placeholder="Título do discurso"
                    value={formData.tesourosPalavra.discurso.titulo}
                    onChange={(e) => updateFormField("tesourosPalavra.discurso.titulo", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Duração</Label>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md text-sm">
                    {formData.semanaVisitaSuperintendente ? "30 min (visita)" : "10 min (fixo)"}
                  </div>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <PublicadorSelect
                    value={formData.tesourosPalavra.discurso.responsavel?.id || ""}
                    onChange={(value) => {
                      const publicador = publicadores.find(p => p.id === value);
                      updateFormField("tesourosPalavra.discurso.responsavel", { 
                        id: value, 
                        nome: publicador?.nome || "" 
                      });
                    }}
                    placeholder="Selecione o responsável"
                    permissao="perm_discurso_tesouros"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-semibold">Joias Espirituais</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <Label>Duração</Label>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md text-sm">
                    10 min (fixo)
                  </div>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <PublicadorSelect
                    value={formData.tesourosPalavra.joiasEspirituais.responsavel?.id || ""}
                    onChange={(value) => {
                      const publicador = publicadores.find(p => p.id === value);
                      updateFormField("tesourosPalavra.joiasEspirituais.responsavel", { 
                        id: value, 
                        nome: publicador?.nome || "" 
                      });
                    }}
                    placeholder="Selecione o responsável"
                    permissao="perm_joias_espirituais"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-semibold">Leitura da Bíblia</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  <Label>Texto</Label>
                  <Input
                    placeholder="Texto da leitura"
                    value={formData.tesourosPalavra.leituraBiblica.texto}
                    onChange={(e) => updateFormField("tesourosPalavra.leituraBiblica.texto", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Duração</Label>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md text-sm">
                    4 min (fixo)
                  </div>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <PublicadorSelect
                    value={formData.tesourosPalavra.leituraBiblica.responsavel?.id || ""}
                    onChange={(value) => {
                      const publicador = publicadores.find(p => p.id === value);
                      updateFormField("tesourosPalavra.leituraBiblica.responsavel", { 
                        id: value, 
                        nome: publicador?.nome || "" 
                      });
                    }}
                    placeholder="Selecione o responsável"
                    permissao="perm_leitura_biblia"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faça Seu Melhor no Ministério */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Faça Seu Melhor no Ministério
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Badge variant={tempoExcedido ? "destructive" : "secondary"}>
                  {tempoTotalFacaSeuMelhor} min / 15 min
                </Badge>
                {tempoExcedido && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardTitle>
            {tempoExcedido && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Tempo total excede 15 minutos (incluindo comentários presidenciais)
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.facaSeuMelhor.map((parte, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Parte {index + 1}</Label>
                  <div className="flex gap-2">
                    {formData.facaSeuMelhor.length < 4 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addFacaSeuMelhorParte}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    {formData.facaSeuMelhor.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFacaSeuMelhorParte(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={parte.tipo}
                      onValueChange={(value) => {
                        const newParts = [...formData.facaSeuMelhor];
                        newParts[index].tipo = value;
                        setFormData({ ...formData, facaSeuMelhor: newParts });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_FACA_SEU_MELHOR.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duração (min)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        placeholder="Ex: 5"
                        value={parte.duracao.replace(' min', '')}
                        onChange={(e) => {
                          const newParts = [...formData.facaSeuMelhor];
                          const value = e.target.value;
                          newParts[index].duracao = value ? `${value} min` : '';
                          setFormData({ ...formData, facaSeuMelhor: newParts });
                        }}
                        className="flex-1"
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newParts = [...formData.facaSeuMelhor];
                            newParts[index].duracao = "5 min";
                            setFormData({ ...formData, facaSeuMelhor: newParts });
                          }}
                        >
                          5
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newParts = [...formData.facaSeuMelhor];
                            newParts[index].duracao = "10 min";
                            setFormData({ ...formData, facaSeuMelhor: newParts });
                          }}
                        >
                          10
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newParts = [...formData.facaSeuMelhor];
                            newParts[index].duracao = "15 min";
                            setFormData({ ...formData, facaSeuMelhor: newParts });
                          }}
                        >
                          15
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Responsável</Label>
                    <PublicadorSelect
                      value={parte.responsavel?.id || ""}
                      onChange={(value) => {
                        const publicador = publicadores.find(p => p.id === value);
                        const newParts = [...formData.facaSeuMelhor];
                        newParts[index].responsavel = { 
                          id: value, 
                          nome: publicador?.nome || "" 
                        };
                        setFormData({ ...formData, facaSeuMelhor: newParts });
                      }}
                      placeholder="Selecione o responsável"
                      permissao="perm_faca_seu_melhor_ministerio"
                    />
                  </div>
                  <div>
                    <Label>Ajudante</Label>
                    <PublicadorSelect
                      value={parte.ajudante?.id || ""}
                      onChange={(value) => {
                        const publicador = publicadores.find(p => p.id === value);
                        const newParts = [...formData.facaSeuMelhor];
                        newParts[index].ajudante = { 
                          id: value, 
                          nome: publicador?.nome || "" 
                        };
                        setFormData({ ...formData, facaSeuMelhor: newParts });
                      }}
                      placeholder="Selecione o ajudante"
                      permissao="perm_faca_seu_melhor_ministerio"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Descrição/Tema</Label>
                  <Input
                    placeholder="Descrição ou tema da parte"
                    value={parte.descricao}
                    onChange={(e) => {
                      const newParts = [...formData.facaSeuMelhor];
                      newParts[index].descricao = e.target.value;
                      setFormData({ ...formData, facaSeuMelhor: newParts });
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Nossa Vida Cristã */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5" />
              Nossa Vida Cristã
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.nossaVidaCrista.map((parte, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Parte {index + 1}</Label>
                  <div className="flex gap-2">
                    {formData.nossaVidaCrista.length < 3 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addNossaVidaCristaParte}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    {formData.nossaVidaCrista.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeNossaVidaCristaParte(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={parte.tipo}
                      onValueChange={(value) => {
                        const newParts = [...formData.nossaVidaCrista];
                        newParts[index].tipo = value;
                        setFormData({ ...formData, nossaVidaCrista: newParts });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_NOSSA_VIDA_CRISTA.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duração</Label>
                    {parte.tipo === "Estudo bíblico de congregação" ? (
                      <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md text-sm">
                        30 min (fixo)
                      </div>
                    ) : (
                      <Select
                        value={parte.duracao}
                        onValueChange={(value) => {
                          const newParts = [...formData.nossaVidaCrista];
                          newParts[index].duracao = value;
                          setFormData({ ...formData, nossaVidaCrista: newParts });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15 min">15 min</SelectItem>
                          <SelectItem value="10 min">10 min</SelectItem>
                          <SelectItem value="5 min">5 min</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label>Responsável</Label>
                    <PublicadorSelect
                      value={parte.responsavel?.id || ""}
                      onChange={(value) => {
                        const publicador = publicadores.find(p => p.id === value);
                        const newParts = [...formData.nossaVidaCrista];
                        newParts[index].responsavel = { 
                          id: value, 
                          nome: publicador?.nome || "" 
                        };
                        setFormData({ ...formData, nossaVidaCrista: newParts });
                      }}
                      placeholder="Selecione o responsável"
                      permissao="perm_nossa_vida_crista"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Conteúdo/Tema</Label>
                    <Input
                      placeholder="Conteúdo ou tema da parte"
                      value={parte.conteudo || ""}
                      onChange={(e) => {
                        const newParts = [...formData.nossaVidaCrista];
                        newParts[index].conteudo = e.target.value;
                        setFormData({ ...formData, nossaVidaCrista: newParts });
                      }}
                    />
                  </div>
                  {parte.tipo === "Estudo bíblico de congregação" && (
                    <div>
                      <Label>Leitor</Label>
                      <PublicadorSelect
                        value={parte.leitor?.id || ""}
                        onChange={(value) => {
                          const publicador = publicadores.find(p => p.id === value);
                          const newParts = [...formData.nossaVidaCrista];
                          newParts[index].leitor = { 
                            id: value, 
                            nome: publicador?.nome || "" 
                          };
                          setFormData({ ...formData, nossaVidaCrista: newParts });
                        }}
                        placeholder="Selecione o leitor"
                        permissao="perm_leitor"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Criar Reunião
          </Button>
        </div>
      </div>
    </div>
  );
}