"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Clock,
  Edit,
  Settings,
  UserCheck,
  BookOpen,
  Heart,
} from "lucide-react";
import { PermissionButton } from "@/components/permission-guard";
import { CongregacaoEditDialog } from "@/components/congregacao-edit-dialog";
import { HorariosReuniaoDialog } from "@/components/horarios-reuniao-dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Congregacao {
  id: string;
  nome: string;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  horario_reuniao_meio_semana: string | null;
  horario_reuniao_fim_semana: string | null;
  dia_reuniao_meio_semana: string | null;
  dia_reuniao_fim_semana: string | null;
  created_at: string;
  updated_at: string;
}

interface Publicador {
  id: string;
  nome: string;
  privilegio: string | null;
}

interface Grupo {
  id: string;
  nome: string;
}

interface ReuniaoRecente {
  id: string;
  periodo: string;
}

interface CongregacaoData {
  congregacao: Congregacao;
  estatisticas: {
    totalPublicadores: number;
    totalGrupos: number;
    totalReunioes: number;
    publicadoresPorPrivilegio: Record<string, number>;
  };
  publicadores: Publicador[];
  grupos: Grupo[];
  reunioesRecentes: ReuniaoRecente[];
}

export default function CongregacaoPage() {
  const [data, setData] = useState<CongregacaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const congregacaoId = '660e8400-e29b-41d4-a716-446655440001';

  const handleCongregacaoUpdate = (updatedCongregacao: Congregacao) => {
    if (data) {
      setData({
        ...data,
        congregacao: updatedCongregacao
      });
    }
  };

  useEffect(() => {
    async function fetchCongregacaoData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/congregacao?id=${congregacaoId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao carregar dados da congregação');
        }

        const congregacaoData = await response.json();
        setData(congregacaoData);
      } catch (error) {
        console.error('Erro ao carregar dados da congregação:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao carregar dados: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCongregacaoData();
  }, [congregacaoId]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">Carregando dados da congregação...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <Building2 className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-lg font-semibold">Erro ao carregar dados</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { congregacao, estatisticas } = data;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Informações da Congregação
          </h1>
          <p className="text-sm text-muted-foreground">
            Dados gerais e estatísticas
          </p>
        </div>
        <CongregacaoEditDialog 
          congregacao={{
            id: congregacao.id,
            nome: congregacao.nome,
            endereco: congregacao.endereco,
            telefone: congregacao.telefone,
            email: congregacao.email,
            observacoes: congregacao.observacoes,
            horario_reuniao_meio_semana: congregacao.horario_reuniao_meio_semana,
            horario_reuniao_fim_semana: congregacao.horario_reuniao_fim_semana,
            dia_reuniao_meio_semana: congregacao.dia_reuniao_meio_semana,
            dia_reuniao_fim_semana: congregacao.dia_reuniao_fim_semana,
            created_at: congregacao.created_at,
            updated_at: congregacao.updated_at
          }}
          onUpdate={handleCongregacaoUpdate}
        />
      </div>

      {/* Informações Básicas */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Dados Básicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nome
                </label>
                <p className="text-base font-semibold text-foreground">
                  {congregacao.nome}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID da Congregação
                </label>
                <p className="text-sm text-muted-foreground font-mono">
                  {congregacao.id}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço e Contato */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Localização e Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Endereço do Salão do Reino
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 mt-1">
                  {congregacao.endereco || 'Endereço não informado'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Telefone</p>
                <p className="text-sm text-muted-foreground">
                  {congregacao.telefone || 'Não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">E-mail</p>
                <p className="text-sm text-muted-foreground">
                  {congregacao.email || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          {congregacao.observacoes && (
            <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Observações
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {congregacao.observacoes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horários das Reuniões */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Horários das Reuniões
            </CardTitle>
            <HorariosReuniaoDialog 
              congregacao={{
                id: congregacao.id,
                horario_reuniao_meio_semana: congregacao.horario_reuniao_meio_semana || "",
                horario_reuniao_fim_semana: congregacao.horario_reuniao_fim_semana || "",
                dia_reuniao_meio_semana: congregacao.dia_reuniao_meio_semana || "",
                dia_reuniao_fim_semana: congregacao.dia_reuniao_fim_semana || ""
              }}
              onUpdate={(updatedData) => {
                setData(prev => prev ? {
                  ...prev,
                  congregacao: {
                    ...prev.congregacao,
                    ...updatedData
                  }
                } : null);
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reunião de Meio de Semana */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Reunião de Meio de Semana
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-blue-900 dark:text-blue-100">
                    {congregacao.dia_reuniao_meio_semana ? 
                      congregacao.dia_reuniao_meio_semana.charAt(0).toUpperCase() + 
                      congregacao.dia_reuniao_meio_semana.slice(1) + '-feira' 
                      : 'Dia não configurado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-blue-900 dark:text-blue-100">
                    {congregacao.horario_reuniao_meio_semana || 'Horário não configurado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reunião de Fim de Semana */}
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Reunião de Fim de Semana
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-green-500" />
                  <span className="text-sm text-green-900 dark:text-green-100">
                    {congregacao.dia_reuniao_fim_semana ? 
                      congregacao.dia_reuniao_fim_semana.charAt(0).toUpperCase() + 
                      congregacao.dia_reuniao_fim_semana.slice(1) + 
                      (congregacao.dia_reuniao_fim_semana === 'domingo' ? '' : '-feira')
                      : 'Dia não configurado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-green-500" />
                  <span className="text-sm text-green-900 dark:text-green-100">
                    {congregacao.horario_reuniao_fim_semana || 'Horário não configurado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800">
              <UserCheck className="h-6 w-6 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {estatisticas.totalPublicadores}
              </p>
              <p className="text-xs text-teal-700 dark:text-teal-300">
                Publicadores
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {estatisticas.totalGrupos}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Grupos
              </p>
            </div>

            <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {estatisticas.totalReunioes}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Reuniões NVC
              </p>
            </div>

            <div className="text-center p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
              <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {Object.keys(estatisticas.publicadoresPorPrivilegio).length}
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Privilégios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horários das Reuniões */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Horários das Reuniões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Reunião de Meio de Semana
                </p>
                <p className="text-xs text-muted-foreground">
                  Nossa Vida Cristã e Ministério
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                Quinta-feira
              </p>
              <p className="text-xs text-muted-foreground">19:30 - 21:00</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Reunião de Fim de Semana
                </p>
                <p className="text-xs text-muted-foreground">
                  Discurso Público e A Sentinela
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">Domingo</p>
              <p className="text-xs text-muted-foreground">09:30 - 11:00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Editar Informações
            </Button>

            <PermissionButton 
              permissao="perm_publicadores"
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Publicadores
            </PermissionButton>

            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Configurar Horários
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
