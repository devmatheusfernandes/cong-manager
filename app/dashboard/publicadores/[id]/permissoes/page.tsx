"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import mockData from "@/data/mock-data.json";
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
  Users
} from "lucide-react";
import { toast } from "sonner";

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

// Configuração das permissões com ícones e labels
const permissoesConfig = {
  limpeza: { label: "Limpeza", icon: Shield, categoria: "Serviços Gerais" },
  discurso_publico: { label: "Discurso Público", icon: Mic, categoria: "Ensino" },
  carrinho: { label: "Carrinho", icon: Car, categoria: "Pregação" },
  volante: { label: "Volante", icon: Car, categoria: "Pregação" },
  palco: { label: "Palco", icon: Monitor, categoria: "Mecânicas" },
  som: { label: "Som", icon: Volume2, categoria: "Mecânicas" },
  indicador_entrada: { label: "Indicador Entrada", icon: UserCheck, categoria: "Mecânicas" },
  indicador_palco: { label: "Indicador Palco", icon: UserCheck, categoria: "Mecânicas" },
  presidencia_fim_semana: { label: "Presidência Fim de Semana", icon: Calendar, categoria: "Presidência" },
  presidencia_meio_semana: { label: "Presidência Meio de Semana", icon: Calendar, categoria: "Presidência" },
  participar_escola: { label: "Participar da Escola", icon: BookOpen, categoria: "Ensino" },
  joias_espirituais: { label: "Joias Espirituais", icon: Heart, categoria: "Ensino" },
  leitura_livro: { label: "Leitura do Livro", icon: FileText, categoria: "Ensino" },
  leitura_sentinela: { label: "Leitura da Sentinela", icon: FileText, categoria: "Ensino" },
  dirigir_estudo_livro: { label: "Dirigir Estudo do Livro", icon: Users, categoria: "Ensino" },
  nossa_vida_crista: { label: "Nossa Vida Cristã", icon: BookOpen, categoria: "Ensino" },
  fazer_oracao: { label: "Fazer Oração", icon: Heart, categoria: "Ensino" }
};

export default function PermissoesPage() {
  const params = useParams();
  const router = useRouter();
  const publicadorId = params.id as string;
  
  // Encontrar o publicador
  const publicador = mockData.publicadores.find(p => p.id === publicadorId);
  
  if (!publicador) {
    return (
      <div className="p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Publicador não encontrado</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const [permissoes, setPermissoes] = useState(publicador.permissoes);

  const handlePermissaoChange = (permissao: string, valor: boolean) => {
    setPermissoes(prev => ({
      ...prev,
      [permissao]: valor
    }));
  };

  const handleSalvar = () => {
    // Aqui você implementaria a lógica para salvar as permissões
    toast.success("Permissões atualizadas com sucesso!");
  };

  // Agrupar permissões por categoria
  const permissoesPorCategoria = Object.entries(permissoesConfig).reduce((acc, [key, config]) => {
    if (!acc[config.categoria]) {
      acc[config.categoria] = [];
    }
    acc[config.categoria].push({ key, ...config });
    return acc;
  }, {} as Record<string, Array<{ key: string; label: string; icon: any; categoria: string }>>);

  return (
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
        {Object.entries(permissoesPorCategoria).map(([categoria, permissoesCategoria]) => (
          <Card key={categoria} className="rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-lg">{categoria}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissoesCategoria.map(({ key, label, icon: Icon }) => {
                  const temPermissao = permissoes[key as keyof typeof permissoes];
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        temPermissao
                          ? "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30"
                          : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30"
                      }`}
                      onClick={() => handlePermissaoChange(key, !temPermissao)}
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
                          <span className={`font-medium ${
                            temPermissao 
                              ? "text-teal-900 dark:text-teal-100" 
                              : "text-gray-600 dark:text-gray-400"
                          }`}>
                            {label}
                          </span>
                        </div>
                        <div className={`p-1 rounded-full ${
                          temPermissao 
                            ? "bg-teal-600 text-white" 
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}>
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
        ))}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 pt-4">
        <Button onClick={handleSalvar} className="flex-1">
          Salvar Alterações
        </Button>
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          Cancelar
        </Button>
      </div>
    </div>
  );
}