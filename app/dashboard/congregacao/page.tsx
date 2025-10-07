"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import mockData from "@/data/mock-data.json";
import { PermissionButton } from "@/components/permission-guard";

export default function CongregacaoPage() {
  // Assumindo que estamos visualizando a primeira congregação do mock data
  const congregacao = mockData.congregacoes[0];

  // Contando estatísticas
  const totalPublicadores = mockData.publicadores.length;

  const totalUsuarios = mockData.usuarios_congregacoes.length;

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
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
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
                  Rua das Flores, 123 - Centro
                  <br />
                  São Paulo - SP, 01234-567
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Telefone</p>
                <p className="text-sm text-muted-foreground">(11) 9999-9999</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">E-mail</p>
                <p className="text-sm text-muted-foreground">
                  central@congregacao.org
                </p>
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
                {totalPublicadores}
              </p>
              <p className="text-xs text-teal-700 dark:text-teal-300">
                Publicadores
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalUsuarios}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Usuários
              </p>
            </div>

            <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                52
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Reuniões/Ano
              </p>
            </div>

            <div className="text-center p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
              <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                100%
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Participação
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
