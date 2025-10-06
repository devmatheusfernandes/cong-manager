"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  Check,
  X,
  User,
  Mic,
  Car,
  Volume2,
  Monitor,
  UserCheck,
  Calendar,
  BookOpen,
  Heart,
  FileText,
  Users,
  Trash2,
  Settings,
  Megaphone,
  GraduationCap,
  Sparkles,
  Headphones,
  DoorOpen,
  Crown,
  Book,
  Gem,
  UserPlus,
  MessageSquare,
  Target,
  School,
  LifeBuoy,
  Star,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/permission-guard";
import { 
  getPublicadorById, 
  updatePublicadorPermissions,
  type Publicador 
} from "@/lib/auth";

// Função para obter o label do privilégio
function getPrivilegioLabel(privilegio: string) {
  const privilegios: Record<string, string> = {
    anciao: "Ancião",
    servo_ministerial: "Servo Ministerial",
    batizado: "Publicador Batizado",
    nao_batizado: "Publicador Não Batizado",
  };
  return privilegios[privilegio] || privilegio;
}

// Função para obter a cor do badge do privilégio
function getPrivilegioBadgeColor(privilegio: string) {
  const cores: Record<string, string> = {
    anciao:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    servo_ministerial:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    batizado:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    nao_batizado:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };
  return (
    cores[privilegio] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  );
}

// Configuração das permissões com ícones e labels
const permissoesConfig = {
  // Serviços Gerais
  perm_limpeza: { label: "Limpeza", icon: Trash2, categoria: "Serviços Gerais" },
  perm_carrinho: { label: "Carrinho", icon: Car, categoria: "Pregação" },
  
  // Mecânicas
  perm_presidencia: { label: "Presidência", icon: Crown, categoria: "Mecânicas" },
  perm_leitor: { label: "Leitor", icon: Book, categoria: "Mecânicas" },
  perm_volante: { label: "Volante", icon: Car, categoria: "Mecânicas" },
  perm_audio_video: { label: "Áudio e Vídeo", icon: Headphones, categoria: "Mecânicas" },
  perm_palco: { label: "Palco", icon: Sparkles, categoria: "Mecânicas" },
  perm_indicador_entrada: { label: "Indicador - Entrada", icon: DoorOpen, categoria: "Mecânicas" },
  perm_indicador_palco: { label: "Indicador - Palco", icon: UserCheck, categoria: "Mecânicas" },
  
  // NVC - Nossa Vida Cristã e Ministério
  perm_oracao_inicial_final: { label: "Oração Inicial ou Final", icon: Heart, categoria: "NVC" },
  perm_presidencia_nvc: { label: "Presidência NVC", icon: Crown, categoria: "NVC" },
  perm_discurso_tesouros: { label: "Discurso Tesouros", icon: Gem, categoria: "NVC" },
  perm_joias_espirituais: { label: "Joias Espirituais", icon: Sparkles, categoria: "NVC" },
  perm_leitura_biblia: { label: "Leitura da Bíblia", icon: Sparkles, categoria: "NVC" },
  perm_leitura_livro: { label: "Leitura do Livro", icon: Book, categoria: "NVC" },
  perm_dirigir_estudo_biblico: { label: "Dirigir Estudo Bíblico", icon: Users, categoria: "NVC" },
  perm_faca_seu_melhor_ministerio: { label: "Faça seu Melhor no Ministério", icon: Target, categoria: "NVC" },
  perm_discurso_estudante: { label: "Discurso de Estudante", icon: School, categoria: "NVC" },
  perm_nossa_vida_crista: { label: "Nossa Vida Cristã", icon: LifeBuoy, categoria: "NVC" },
  
  // Outros Privilégios
  pioneiro_regular: { label: "Pioneiro Regular", icon: Star, categoria: "Outros Privilégios" },
  pioneiro_auxiliar: { label: "Pioneiro Auxiliar", icon: Award, categoria: "Outros Privilégios" },
};

export default function PermissoesPage() {
  const params = useParams();
  const router = useRouter();
  const publicadorId = params.id as string;

  const [publicador, setPublicador] = useState<Publicador | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissoes, setPermissoes] = useState<Record<string, boolean>>({});
  const [privilegiosServico, setPrivilegiosServico] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPublicador = async () => {
      try {
        const data = await getPublicadorById(publicadorId);
        if (data) {
          setPublicador(data);
          // Converter array de permissões para objeto
          const permissoesObj: Record<string, boolean> = {};
          data.permissions?.forEach(permission => {
            permissoesObj[permission] = true;
          });
          setPermissoes(permissoesObj);
          
          // Configurar privilégios de serviço
          setPrivilegiosServico({
            pioneiro_regular: data.pioneiro_regular || false,
            pioneiro_auxiliar: data.pioneiro_auxiliar || false,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar publicador:', error);
        toast.error('Erro ao carregar dados do publicador');
      } finally {
        setLoading(false);
      }
    };

    loadPublicador();
  }, [publicadorId]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!publicador) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Publicador não encontrado.</p>
        </div>
      </div>
    );
  }

  const handlePermissaoChange = (permissao: string, valor: boolean) => {
    setPermissoes((prev) => ({
      ...prev,
      [permissao]: valor,
    }));
  };

  const handlePrivilegioServicoChange = (privilegio: string, valor: boolean) => {
    setPrivilegiosServico((prev) => ({
      ...prev,
      [privilegio]: valor,
    }));
  };

  const handleSalvar = async () => {
    if (!publicador) return;
    
    setSaving(true);
    try {
      // Converter objeto de permissões para array
      const permissoesArray = Object.entries(permissoes)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      
      // Incluir privilégios de serviço na atualização
      const updateData = {
        permissions: permissoesArray,
        pioneiro_regular: privilegiosServico.pioneiro_regular,
        pioneiro_auxiliar: privilegiosServico.pioneiro_auxiliar,
      };
      
      await updatePublicadorPermissions(publicador.id, permissoesArray, updateData);
      toast.success("Permissões atualizadas com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast.error('Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  // Agrupar permissões por categoria
  const permissoesPorCategoria = Object.entries(permissoesConfig).reduce(
    (acc, [key, config]) => {
      if (!acc[config.categoria]) {
        acc[config.categoria] = [];
      }
      acc[config.categoria].push({ key, ...config });
      return acc;
    },
    {} as Record<
      string,
      Array<{ key: string; label: string; icon: React.ComponentType<{ className?: string }>; categoria: string }>
    >
  );

  return (
    <PermissionGuard permissao="perm_publicadores">
      <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Permissões do Publicador</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as permissões específicas para atividades
          </p>
        </div>
      </div>

      {/* Informações do Publicador */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            {publicador.nome}
            <Badge
              variant="secondary"
              className={getPrivilegioBadgeColor(publicador.privilegio)}
            >
              <Shield className="h-3 w-3 mr-1" />
              {getPrivilegioLabel(publicador.privilegio)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {publicador.telefone && (
              <div>
                <span className="text-muted-foreground">Telefone:</span>
                <span className="ml-2">{publicador.telefone}</span>
              </div>
            )}
            {publicador.email && (
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2">{publicador.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissões por Categoria */}
      <div className="space-y-6">
        {Object.entries(permissoesPorCategoria).map(
          ([categoria, permissoesCategoria]) => (
            <Card key={categoria} className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-lg">{categoria}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissoesCategoria.map(({ key, label, icon: Icon }) => {
                    // Verificar se é um privilégio de serviço
                    const isPrivilegioServico = key === 'pioneiro_regular' || key === 'pioneiro_auxiliar';
                    const temPermissao = isPrivilegioServico 
                      ? privilegiosServico[key as keyof typeof privilegiosServico]
                      : permissoes[key as keyof typeof permissoes];
                    
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          temPermissao
                            ? "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30"
                            : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30"
                        }`}
                        onClick={() =>
                          isPrivilegioServico 
                            ? handlePrivilegioServicoChange(key, !temPermissao)
                            : handlePermissaoChange(key, !temPermissao)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`h-5 w-5 ${
                                temPermissao
                                  ? "text-teal-600 dark:text-teal-400"
                                  : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`font-medium ${
                                temPermissao
                                  ? "text-teal-900 dark:text-teal-100"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                          <div
                            className={`p-1 rounded-full ${
                              temPermissao
                                ? "bg-teal-600 text-white"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          >
                            {temPermissao ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 pt-4">
        <Button 
          onClick={handleSalvar} 
          className="flex-1"
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={saving}
        >
          Cancelar
        </Button>
      </div>
      </div>
    </PermissionGuard>
  );
}
