"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Church, Users, Calendar, ClipboardList, MapPin, BookOpen, Shield, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Church className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold">Cong Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button>Começar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <Church className="h-16 w-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Gestão Congregacional
            <span className="text-indigo-600"> Simplificada</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Um webapp PWA completo para organizar programações, designações e atividades semanais da sua congregação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Ver Dashboard
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto" variant="outline">
                Criar Congregação
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Acessar Sistema
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Principais</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua congregação em um só lugar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardHeader>
                <Users className="h-8 w-8 text-teal-500 mb-2" />
                <CardTitle>Gestão de Pessoas</CardTitle>
                <CardDescription>
                  Cadastro de publicadores e oradores visitantes com permissões específicas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardHeader>
                <Calendar className="h-8 w-8 text-amber-600 mb-2" />
                <CardTitle>Discursos</CardTitle>
                <CardDescription>
                  Agenda completa com temas, oradores, hospitalidade e cânticos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-rose-600 mb-2" />
                <CardTitle>Mecânicas</CardTitle>
                <CardDescription>
                  Escala de indicador, leitor, som e palco para as reuniões
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardHeader>
                <Shield className="h-8 w-8 text-teal-500 mb-2" />
                <CardTitle>Limpeza</CardTitle>
                <CardDescription>
                  Grupos de limpeza com superintendentes e servos substitutos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardHeader>
                <MapPin className="h-8 w-8 text-amber-600 mb-2" />
                <CardTitle>Pregação & Carrinho</CardTitle>
                <CardDescription>
                  Gestão de territórios e locais de carrinho com coordenadas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-rose-600 mb-2" />
                <CardTitle>Nossa Vida Cristã</CardTitle>
                <CardDescription>
                  Programação semanal e bimestral com partes e designações
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* PWA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Acesse de Qualquer Lugar
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Nosso webapp PWA funciona perfeitamente em qualquer dispositivo - 
                celular, tablet ou desktop. Instale como um app nativo e tenha 
                acesso offline às informações da sua congregação.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm">Responsivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm">Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm">Multi-usuário</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-sm">
                <CardContent className="text-center">
                  <Smartphone className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                  <CardTitle className="mb-2">PWA Ready</CardTitle>
                  <CardDescription>
                    Instale em qualquer dispositivo e use como um app nativo
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Crie sua congregação hoje e simplifique a gestão das atividades
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Criar Congregação Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/40">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Church className="h-6 w-6 text-indigo-600" />
            <span className="font-semibold">Cong Manager</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Cong Manager. Gestão congregacional simplificada.
          </p>
        </div>
      </footer>
    </div>
  );
}
