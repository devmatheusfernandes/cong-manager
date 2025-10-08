"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { ChevronUp, Shield } from "lucide-react";
import { CarrinhoIcon } from "./icons/carrinho-icon";
import { CongregacaoIcon } from "./icons/congregacao-icon";
import { DiscursoIcon } from "./icons/discurso-icon";
import { GruposIcon } from "./icons/grupos-icon";
import { LimpezaIcon } from "./icons/limpeza-icon";
import { MecanicasIcon } from "./icons/mecanicas-icon";
import { NvcIcon } from "./icons/nvc-icon";
import { PregacaoIcon } from "./icons/pregacao-icon";
import { PublicadoresIcon } from "./icons/publicadores-icon";
import { BottomSheet } from "./bottom-sheet";
import { useAuth } from "./auth-provider";
import { getAvailableTabs } from "@/lib/auth";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const allTabs: TabItem[] = [
  {
    id: "discursos",
    label: "Discursos",
    icon: DiscursoIcon,
    path: "/dashboard/discursos",
  },
  {
    id: "mecanicas",
    label: "Mecânicas",
    icon: MecanicasIcon,
    path: "/dashboard/mecanicas",
  },
  {
    id: "limpeza",
    label: "Limpeza",
    icon: LimpezaIcon,
    path: "/dashboard/limpeza",
  },
  { id: "nvc", label: "Nossa Vida", icon: NvcIcon, path: "/dashboard/nvc" },
  {
    id: "carrinho",
    label: "Carrinho",
    icon: CarrinhoIcon,
    path: "/dashboard/carrinho",
  },
  {
    id: "grupos",
    label: "Grupos",
    icon: GruposIcon,
    path: "/dashboard/grupos",
  },
  {
    id: "pregacao",
    label: "Pregação",
    icon: PregacaoIcon,
    path: "/dashboard/pregacao",
  },
  {
    id: "publicadores",
    label: "Publicadores",
    icon: PublicadoresIcon,
    path: "/dashboard/publicadores",
  },
  {
    id: "admin",
    label: "Admin",
    icon: Shield,
    path: "/dashboard/admin",
  },
  {
    id: "congregacao",
    label: "Congregação",
    icon: CongregacaoIcon,
    path: "/dashboard/congregacao",
  },
];

interface BottomNavigationProps {
  className?: string;
}

function TabButton({
  tab,
  isActive,
  onClick,
  className = "",
}: {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-3 min-h-[60px] transition-colors rounded-lg
        ${
          isActive
            ? "text-violet-600"
            : "text-muted-foreground hover:text-violet-600"
        }
        ${className}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-violet-600/10 rounded-lg"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-1">
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium leading-none text-center">
          {tab.label}
        </span>
      </div>
    </button>
  );
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Obter tabs disponíveis baseado nas permissões do usuário
  const availableTabIds = getAvailableTabs(user);
  const tabs = allTabs.filter((tab) => availableTabIds.includes(tab.id));

  // Determina qual tab está ativa baseada na URL atual
  const activeTab = tabs.find((tab) => pathname === tab.path)?.id || "";

  // Para mobile: primeiras 4 tabs visíveis + botão "mais" na última posição
  const mobileVisibleTabs = tabs.slice(0, 4);
  const activeTabInVisible = mobileVisibleTabs.find(
    (tab) => tab.id === activeTab
  );

  // Se a tab ativa não estiver nas 4 primeiras, substitui a 4ª pela tab ativa
  const displayTabs = [...mobileVisibleTabs];
  if (!activeTabInVisible && tabs.length > 4) {
    const activeTabObj = tabs.find((tab) => tab.id === activeTab);
    if (activeTabObj) {
      displayTabs[3] = activeTabObj; // Substitui a 4ª posição pela tab ativa
    }
  }

  const handleTabSelect = (tab: TabItem) => {
    router.push(tab.path);
    setIsSheetOpen(false);
  };

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 ${
          className || ""
        }`}
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Desktop: todas as tabs */}
          <div
            className={`hidden md:grid gap-1 ${
              tabs.length <= 5
                ? "md:grid-cols-5"
                : tabs.length <= 7
                ? "md:grid-cols-7"
                : "md:grid-cols-9"
            }`}
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => handleTabSelect(tab)}
              />
            ))}
          </div>

          {/* Mobile: máximo 5 posições */}
          <div
            className={`grid md:hidden ${
              tabs.length <= 4 ? `grid-cols-${tabs.length}` : "grid-cols-5"
            }`}
          >
            {/* Tabs dinâmicas */}
            {tabs.length <= 4 ? (
              // Se tem 4 ou menos tabs, mostra todas
              tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => handleTabSelect(tab)}
                />
              ))
            ) : (
              // Se tem mais de 4 tabs, mostra as primeiras 4 + botão "mais"
              <>
                {displayTabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => handleTabSelect(tab)}
                  />
                ))}
                {/* 5ª posição: botão "mais" */}
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="relative flex flex-col items-center justify-center p-3 min-h-[60px] transition-colors text-muted-foreground hover:text-violet-600"
                >
                  <div className="flex flex-col items-center gap-1">
                    <ChevronUp className="h-5 w-5" />
                    <span className="text-xs font-medium leading-none">
                      Mais
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sheet com todas as opções */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Menu de Navegação"
      >
        <div className="grid grid-cols-2 gap-2 p-4">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => handleTabSelect(tab)}
              className="border border-border hover:bg-muted/50"
            />
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
