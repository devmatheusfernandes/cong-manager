"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Calendar,
  Mic,
  Settings,
  Trash2,
  BookOpen,
  ShoppingCart,
  Users,
  MapPin,
  Plus,
  Bell,
} from "lucide-react";

// Componentes temporários para cada tab
function NomesDataContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nomes e Datas</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Gerencie publicadores e oradores visitantes
        </p>
      </Card>
    </div>
  );
}

function DiscursosContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Discursos</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Discurso
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Agenda de discursos, oradores e hospitalidade
        </p>
      </Card>
    </div>
  );
}

function MecanicasContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mecânicas</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Escala
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Escala de indicador, leitor, som e palco
        </p>
      </Card>
    </div>
  );
}

function LimpezaContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Limpeza</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Grupos de limpeza e superintendentes
        </p>
      </Card>
    </div>
  );
}

function NVCContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nossa Vida Cristã</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Parte
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Programação semanal e bimestral do NVC
        </p>
      </Card>
    </div>
  );
}

function CarrinhoContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Carrinho</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Local
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Locais de carrinho com horários definidos
        </p>
      </Card>
    </div>
  );
}

function GruposContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Grupos</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Organização de grupos de campo
        </p>
      </Card>
    </div>
  );
}

function PregacaoContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pregação</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Território
        </Button>
      </div>
      <Card className="p-4 rounded-2xl border">
        <p className="text-sm text-muted-foreground">
          Territórios com status e coordenadas
        </p>
      </Card>
    </div>
  );
}

const tabContent = {
  "nomes-datas": NomesDataContent,
  "discursos": DiscursosContent,
  "mecanicas": MecanicasContent,
  "limpeza": LimpezaContent,
  "nvc": NVCContent,
  "carrinho": CarrinhoContent,
  "grupos": GruposContent,
  "pregacao": PregacaoContent,
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("nomes-datas");

  const ContentComponent = tabContent[activeTab as keyof typeof tabContent];

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Congregação Central</h1>
              <p className="text-sm text-muted-foreground">São Paulo, SP</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="pb-20 px-4 pt-4 max-w-screen-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ContentComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
}