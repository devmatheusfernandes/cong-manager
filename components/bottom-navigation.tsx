"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Mic,
  Settings,
  Trash2,
  BookOpen,
  ShoppingCart,
  Users,
  MapPin,
  ChevronUp,
} from "lucide-react";
import { BottomSheet } from "./bottom-sheet";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  { id: "nomes-datas", label: "Nomes/Datas", icon: Calendar },
  { id: "discursos", label: "Discursos", icon: Mic },
  { id: "mecanicas", label: "Mecânicas", icon: Settings },
  { id: "limpeza", label: "Limpeza", icon: Trash2 },
  { id: "nvc", label: "NVC", icon: BookOpen },
  { id: "carrinho", label: "Carrinho", icon: ShoppingCart },
  { id: "grupos", label: "Grupos", icon: Users },
  { id: "pregacao", label: "Pregação", icon: MapPin },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function TabButton({ 
  tab, 
  isActive, 
  onClick, 
  className = "" 
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
        ${isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
        }
        ${className}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-primary/10 rounded-lg"
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

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Para mobile: primeiras 4 tabs visíveis + botão "mais" na última posição
  const mobileVisibleTabs = tabs.slice(0, 4);
  const activeTabInVisible = mobileVisibleTabs.find(tab => tab.id === activeTab);
  
  // Se a tab ativa não estiver nas 4 primeiras, substitui a 4ª pela tab ativa
  let displayTabs = [...mobileVisibleTabs];
  if (!activeTabInVisible) {
    const activeTabObj = tabs.find(tab => tab.id === activeTab);
    if (activeTabObj) {
      displayTabs[3] = activeTabObj; // Substitui a 4ª posição pela tab ativa
    }
  }

  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId);
    setIsSheetOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="max-w-screen-xl mx-auto">
          {/* Desktop: todas as tabs */}
          <div className="hidden md:grid md:grid-cols-8">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </div>

          {/* Mobile: 5 posições */}
          <div className="grid grid-cols-5 md:hidden">
            {/* Primeiras 4 posições: tabs dinâmicas */}
            {displayTabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}

            {/* 5ª posição: sempre o botão "mais" */}
            <button
              onClick={() => setIsSheetOpen(true)}
              className="relative flex flex-col items-center justify-center p-3 min-h-[60px] transition-colors text-muted-foreground hover:text-foreground"
            >
              <div className="flex flex-col items-center gap-1">
                <ChevronUp className="h-5 w-5" />
                <span className="text-xs font-medium leading-none">
                  Mais
                </span>
              </div>
            </button>
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
              onClick={() => handleTabSelect(tab.id)}
              className="border border-border hover:bg-muted/50"
            />
          ))}
        </div>
      </BottomSheet>
    </>
  );
}