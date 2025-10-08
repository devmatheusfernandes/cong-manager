"use client";

import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/login-dialog";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [congregacaoNome, setCongregacaoNome] = useState("Congregação Central");

  useEffect(() => {
    const fetchCongregacao = async () => {
      try {
        const { data, error } = await supabase
          .from("congregacoes")
          .select("nome")
          .limit(1)
          .single();

        if (error) {
          console.error("Erro ao buscar congregação:", error);
          return;
        }

        if (data?.nome) {
          setCongregacaoNome(data.nome);
        }
      } catch (error) {
        console.error("Erro ao buscar congregação:", error);
      }
    };

    fetchCongregacao();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 max-w-none w-full">
          {/* Espaço esquerdo para balanceamento */}
          <div className="flex items-center gap-2 w-24">
            <ThemeToggle />
          </div>

          {/* Nome da congregação centralizado */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-center text-violet-600">
              {congregacaoNome}
            </h1>
          </div>

          {/* Botões direita */}
          <div className="flex items-center gap-2 justify-end">
            <LoginDialog />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
