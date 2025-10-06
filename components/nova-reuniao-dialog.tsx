"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Calendar,
  Music,
  MessageSquare,
  Lightbulb,
  Target,
  Heart,
  AlertTriangle,
  Users,
} from "lucide-react";

interface FacaSeuMelhorParte {
  tipo: string;
  duracao: string;
  formato: string;
  descricao: string;
  referencia: string;
}

interface NossaVidaCristaParte {
  tipo: string;
  duracao: string;
  conteudo?: string;
}

interface NovaReuniaoData {
  periodo: string;
  leituraBiblica: string;
  canticos: {
    inicial: string;
    intermediario: string;
    final: string;
  };
  comentarios: {
    iniciais: string;
    finais: string;
  };
  tesourosPalavra: {
    titulo: string;
    duracao: string;
    pontos: string[];
    joiasEspirituais: {
      texto: string;
      pergunta: string;
      referencia: string;
      duracao: string;
    }[];
    leituraBiblica: {
      texto: string;
      referencia: string;
      duracao: string;
    };
  };
  facaSeuMelhor: FacaSeuMelhorParte[];
  nossaVidaCrista: NossaVidaCristaParte[];
  eventoEspecial?: string;
  semanaVisitaSuperintendente: boolean;
  diaTerca: boolean;
}

const EVENTOS_ESPECIAIS = [
  "Assembleia com Superintendente",
  "Assembleia com Representante de Betel",
  "Congresso Regional",
  "Celebração",
];

const TIPOS_FACA_SEU_MELHOR = [
  "Iniciando conversas",
  "Fazendo discípulos",
  "Explicando suas crenças",
  "Vivendo como cristão",
];

const FORMATOS_MINISTERIO = [
  "DE CASA EM CASA",
  "TESTEMUNHO INFORMAL",
  "ESTUDO BÍBLICO",
  "REVISITA",
  "DISCURSO",
];

const TIPOS_NOSSA_VIDA_CRISTA = [
  "Necessidades locais",
  "Estudo bíblico de congregação",
  "Cântico e oração",
  "Discurso",
  "Entrevista",
  "Demonstração",
];

export function NovaReuniaoDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NovaReuniaoData>({
    periodo: "",
    leituraBiblica: "",
    canticos: {
      inicial: "",
      intermediario: "",
      final: "",
    },
    comentarios: {
      iniciais: "1 min",
      finais: "3 min",
    },
    tesourosPalavra: {
      titulo: "",
      duracao: "10 min",
      pontos: [""],
      joiasEspirituais: [
        {
          texto: "",
          pergunta: "",
          referencia: "",
          duracao: "10 min",
        },
      ],
      leituraBiblica: {
        texto: "",
        referencia: "",
        duracao: "4 min",
      },
    },
    facaSeuMelhor: [
      {
        tipo: "",
        duracao: "3 min",
        formato: "",
        descricao: "",
        referencia: "",
      },
    ],
    nossaVidaCrista: [
      {
        tipo: "Necessidades locais",
        duracao: "15 min",
      },
      {
        tipo: "Estudo bíblico de congregação",
        duracao: "30 min",
        conteudo: "",
      },
    ],
    semanaVisitaSuperintendente: false,
    diaTerca: false,
  });

  const handleSubmit = () => {
    // Validação básica
    if (!formData.periodo || !formData.leituraBiblica) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    // Aqui você implementaria a lógica para salvar a reunião
    console.log("Nova reunião:", formData);
    toast.success("Reunião criada com sucesso!");
    setOpen(false);
    
    // Reset form
    setFormData({
      periodo: "",
      leituraBiblica: "",
      canticos: { inicial: "", intermediario: "", final: "" },
      comentarios: { iniciais: "1 min", finais: "3 min" },
      tesourosPalavra: {
        titulo: "",
        duracao: "10 min",
        pontos: [""],
        joiasEspirituais: [{ texto: "", pergunta: "", referencia: "", duracao: "10 min" }],
        leituraBiblica: { texto: "", referencia: "", duracao: "4 min" },
      },
      facaSeuMelhor: [{ tipo: "", duracao: "3 min", formato: "", descricao: "", referencia: "" }],
      nossaVidaCrista: [
        { tipo: "Necessidades locais", duracao: "15 min" },
        { tipo: "Estudo bíblico de congregação", duracao: "30 min", conteudo: "" },
      ],
      semanaVisitaSuperintendente: false,
      diaTerca: false,
    });
  };

  const addFacaSeuMelhorParte = () => {
    if (formData.facaSeuMelhor.length < 4) {
      setFormData({
        ...formData,
        facaSeuMelhor: [
          ...formData.facaSeuMelhor,
          { tipo: "", duracao: "3 min", formato: "", descricao: "", referencia: "" },
        ],
      });
    }
  };

  const removeFacaSeuMelhorParte = (index: number) => {
    if (formData.facaSeuMelhor.length > 1) {
      setFormData({
        ...formData,
        facaSeuMelhor: formData.facaSeuMelhor.filter((_, i) => i !== index),
      });
    }
  };

  const addNossaVidaCristaParte = () => {
    if (formData.nossaVidaCrista.length < 3) {
      setFormData({
        ...formData,
        nossaVidaCrista: [
          ...formData.nossaVidaCrista,
          { tipo: "", duracao: "15 min" },
        ],
      });
    }
  };

  const removeNossaVidaCristaParte = (index: number) => {
    if (formData.nossaVidaCrista.length > 1) {
      setFormData({
        ...formData,
        nossaVidaCrista: formData.nossaVidaCrista.filter((_, i) => i !== index),
      });
    }
  };

  const addPonto = () => {
    setFormData({
      ...formData,
      tesourosPalavra: {
        ...formData.tesourosPalavra,
        pontos: [...formData.tesourosPalavra.pontos, ""],
      },
    });
  };

  const removePonto = (index: number) => {
    if (formData.tesourosPalavra.pontos.length > 1) {
      setFormData({
        ...formData,
        tesourosPalavra: {
          ...formData.tesourosPalavra,
          pontos: formData.tesourosPalavra.pontos.filter((_, i) => i !== index),
        },
      });
    }
  };

  // Atualizar automaticamente quando marcar semana de visita do superintendente
  const handleVisitaSuperintendente = (checked: boolean) => {
    const updatedNossaVidaCrista = [...formData.nossaVidaCrista];
    
    if (checked) {
      // Substituir "Estudo bíblico de congregação" por "Discurso"
      const estudoIndex = updatedNossaVidaCrista.findIndex(
        (parte) => parte.tipo === "Estudo bíblico de congregação"
      );
      if (estudoIndex !== -1) {
        updatedNossaVidaCrista[estudoIndex] = {
          tipo: "Discurso",
          duracao: "30 min",
          conteudo: "Discurso do superintendente de circuito",
        };
      }
    } else {
      // Voltar para "Estudo bíblico de congregação"
      const discursoIndex = updatedNossaVidaCrista.findIndex(
        (parte) => parte.tipo === "Discurso"
      );
      if (discursoIndex !== -1) {
        updatedNossaVidaCrista[discursoIndex] = {
          tipo: "Estudo bíblico de congregação",
          duracao: "30 min",
          conteudo: "",
        };
      }
    }

    setFormData({
      ...formData,
      semanaVisitaSuperintendente: checked,
      diaTerca: checked, // Automaticamente marca terça-feira
      nossaVidaCrista: updatedNossaVidaCrista,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Reunião
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nova Reunião - Nossa Vida Cristã
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodo">Período *</Label>
                  <Input
                    id="periodo"
                    placeholder="Ex: 1-7 de setembro"
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="leitura">Leitura Bíblica *</Label>
                  <Input
                    id="leitura"
                    placeholder="Ex: Provérbios 29"
                    value={formData.leituraBiblica}
                    onChange={(e) => setFormData({ ...formData, leituraBiblica: e.target.value })}
                  />
                </div>
              </div>

              {/* Configurações Especiais */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium">Semana de Visita do Superintendente de Circuito</span>
                  </div>
                  <Switch
                    checked={formData.semanaVisitaSuperintendente}
                    onCheckedChange={handleVisitaSuperintendente}
                  />
                </div>

                {formData.semanaVisitaSuperintendente && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Configurações Automáticas
                      </span>
                    </div>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Reunião será na terça-feira</li>
                      <li>• Estudo bíblico substituído por discurso do superintendente</li>
                    </ul>
                  </div>
                )}

                <div>
                  <Label htmlFor="evento">Evento Especial (Opcional)</Label>
                  <Select
                    value={formData.eventoEspecial || ""}
                    onValueChange={(value) => setFormData({ ...formData, eventoEspecial: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento especial" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENTOS_ESPECIAIS.map((evento) => (
                        <SelectItem key={evento} value={evento}>
                          {evento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.eventoEspecial && (
                    <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-800">
                      <p className="text-xs text-rose-700 dark:text-rose-300">
                        ⚠️ Durante este evento, não haverá reunião no meio da semana
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cânticos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Music className="h-5 w-5" />
                Cânticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="inicial">Inicial</Label>
                  <Input
                    id="inicial"
                    placeholder="Ex: 28"
                    value={formData.canticos.inicial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        canticos: { ...formData.canticos, inicial: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="intermediario">Intermediário</Label>
                  <Input
                    id="intermediario"
                    placeholder="Ex: 159"
                    value={formData.canticos.intermediario}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        canticos: { ...formData.canticos, intermediario: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="final">Final</Label>
                  <Input
                    id="final"
                    placeholder="Ex: 31"
                    value={formData.canticos.final}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        canticos: { ...formData.canticos, final: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comentários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Comentários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="iniciais">Comentários Iniciais</Label>
                  <Input
                    id="iniciais"
                    value={formData.comentarios.iniciais}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        comentarios: { ...formData.comentarios, iniciais: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="finais">Comentários Finais</Label>
                  <Input
                    id="finais"
                    value={formData.comentarios.finais}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        comentarios: { ...formData.comentarios, finais: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tesouros da Palavra de Deus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5" />
                Tesouros da Palavra de Deus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    placeholder="Título da parte"
                    value={formData.tesourosPalavra.titulo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tesourosPalavra: { ...formData.tesourosPalavra, titulo: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="duracao-tesouros">Duração</Label>
                  <Input
                    id="duracao-tesouros"
                    value={formData.tesourosPalavra.duracao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tesourosPalavra: { ...formData.tesourosPalavra, duracao: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Pontos Principais</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addPonto}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.tesourosPalavra.pontos.map((ponto, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Ponto principal"
                        value={ponto}
                        onChange={(e) => {
                          const newPontos = [...formData.tesourosPalavra.pontos];
                          newPontos[index] = e.target.value;
                          setFormData({
                            ...formData,
                            tesourosPalavra: { ...formData.tesourosPalavra, pontos: newPontos },
                          });
                        }}
                      />
                      {formData.tesourosPalavra.pontos.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removePonto(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Joias Espirituais */}
              <div>
                <Label className="text-base font-semibold">Joias Espirituais</Label>
                <div className="mt-2 space-y-3">
                  {formData.tesourosPalavra.joiasEspirituais.map((joia, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Texto</Label>
                          <Input
                            placeholder="Ex: Pro. 29:5"
                            value={joia.texto}
                            onChange={(e) => {
                              const newJoias = [...formData.tesourosPalavra.joiasEspirituais];
                              newJoias[index].texto = e.target.value;
                              setFormData({
                                ...formData,
                                tesourosPalavra: { ...formData.tesourosPalavra, joiasEspirituais: newJoias },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Duração</Label>
                          <Input
                            value={joia.duracao}
                            onChange={(e) => {
                              const newJoias = [...formData.tesourosPalavra.joiasEspirituais];
                              newJoias[index].duracao = e.target.value;
                              setFormData({
                                ...formData,
                                tesourosPalavra: { ...formData.tesourosPalavra, joiasEspirituais: newJoias },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Pergunta</Label>
                        <Input
                          placeholder="Pergunta da joia espiritual"
                          value={joia.pergunta}
                          onChange={(e) => {
                            const newJoias = [...formData.tesourosPalavra.joiasEspirituais];
                            newJoias[index].pergunta = e.target.value;
                            setFormData({
                              ...formData,
                              tesourosPalavra: { ...formData.tesourosPalavra, joiasEspirituais: newJoias },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Referência</Label>
                        <Input
                          placeholder="Ex: it 'Lisonja' § 1"
                          value={joia.referencia}
                          onChange={(e) => {
                            const newJoias = [...formData.tesourosPalavra.joiasEspirituais];
                            newJoias[index].referencia = e.target.value;
                            setFormData({
                              ...formData,
                              tesourosPalavra: { ...formData.tesourosPalavra, joiasEspirituais: newJoias },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Leitura Bíblica */}
              <div>
                <Label className="text-base font-semibold">Leitura Bíblica</Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div>
                    <Label>Texto</Label>
                    <Input
                      placeholder="Ex: Pro. 29:1-18"
                      value={formData.tesourosPalavra.leituraBiblica.texto}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tesourosPalavra: {
                            ...formData.tesourosPalavra,
                            leituraBiblica: { ...formData.tesourosPalavra.leituraBiblica, texto: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Referência</Label>
                    <Input
                      placeholder="Ex: th lição 5"
                      value={formData.tesourosPalavra.leituraBiblica.referencia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tesourosPalavra: {
                            ...formData.tesourosPalavra,
                            leituraBiblica: { ...formData.tesourosPalavra.leituraBiblica, referencia: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Duração</Label>
                    <Input
                      value={formData.tesourosPalavra.leituraBiblica.duracao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tesourosPalavra: {
                            ...formData.tesourosPalavra,
                            leituraBiblica: { ...formData.tesourosPalavra.leituraBiblica, duracao: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faça Seu Melhor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Faça Seu Melhor
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{formData.facaSeuMelhor.length} partes</Badge>
                  {formData.facaSeuMelhor.length < 4 && (
                    <Button type="button" size="sm" variant="outline" onClick={addFacaSeuMelhorParte}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.facaSeuMelhor.map((parte, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Parte {index + 1}</span>
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
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={parte.tipo}
                          onValueChange={(value) => {
                            const newPartes = [...formData.facaSeuMelhor];
                            newPartes[index].tipo = value;
                            setFormData({ ...formData, facaSeuMelhor: newPartes });
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
                        <Label>Formato</Label>
                        <Select
                          value={parte.formato}
                          onValueChange={(value) => {
                            const newPartes = [...formData.facaSeuMelhor];
                            newPartes[index].formato = value;
                            setFormData({ ...formData, facaSeuMelhor: newPartes });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato" />
                          </SelectTrigger>
                          <SelectContent>
                            {FORMATOS_MINISTERIO.map((formato) => (
                              <SelectItem key={formato} value={formato}>
                                {formato}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Duração</Label>
                        <Input
                          value={parte.duracao}
                          onChange={(e) => {
                            const newPartes = [...formData.facaSeuMelhor];
                            newPartes[index].duracao = e.target.value;
                            setFormData({ ...formData, facaSeuMelhor: newPartes });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Descrição da parte"
                        value={parte.descricao}
                        onChange={(e) => {
                          const newPartes = [...formData.facaSeuMelhor];
                          newPartes[index].descricao = e.target.value;
                          setFormData({ ...formData, facaSeuMelhor: newPartes });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Referência</Label>
                      <Input
                        placeholder="Ex: lmd lição 2 ponto 3"
                        value={parte.referencia}
                        onChange={(e) => {
                          const newPartes = [...formData.facaSeuMelhor];
                          newPartes[index].referencia = e.target.value;
                          setFormData({ ...formData, facaSeuMelhor: newPartes });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nossa Vida Cristã */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Nossa Vida Cristã
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{formData.nossaVidaCrista.length} partes</Badge>
                  {formData.nossaVidaCrista.length < 3 && !formData.semanaVisitaSuperintendente && (
                    <Button type="button" size="sm" variant="outline" onClick={addNossaVidaCristaParte}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.nossaVidaCrista.map((parte, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Parte {index + 1}</span>
                      {formData.nossaVidaCrista.length > 1 && !formData.semanaVisitaSuperintendente && (
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={parte.tipo}
                          onValueChange={(value) => {
                            const newPartes = [...formData.nossaVidaCrista];
                            newPartes[index].tipo = value;
                            setFormData({ ...formData, nossaVidaCrista: newPartes });
                          }}
                          disabled={formData.semanaVisitaSuperintendente && parte.tipo === "Discurso"}
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
                        <Input
                          value={parte.duracao}
                          onChange={(e) => {
                            const newPartes = [...formData.nossaVidaCrista];
                            newPartes[index].duracao = e.target.value;
                            setFormData({ ...formData, nossaVidaCrista: newPartes });
                          }}
                        />
                      </div>
                    </div>
                    {(parte.tipo === "Estudo bíblico de congregação" || parte.tipo === "Discurso") && (
                      <div>
                        <Label>Conteúdo</Label>
                        <Input
                          placeholder={
                            parte.tipo === "Discurso"
                              ? "Discurso do superintendente de circuito"
                              : "Ex: lfb introdução da seção 4 e histórias 14-15"
                          }
                          value={parte.conteudo || ""}
                          onChange={(e) => {
                            const newPartes = [...formData.nossaVidaCrista];
                            newPartes[index].conteudo = e.target.value;
                            setFormData({ ...formData, nossaVidaCrista: newPartes });
                          }}
                          disabled={formData.semanaVisitaSuperintendente && parte.tipo === "Discurso"}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Criar Reunião
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}