import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Espaço esquerdo para balanceamento */}
          <div className="flex items-center gap-2 w-24">
            <ThemeToggle />
          </div>
          
          {/* Nome da congregação centralizado */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-center">Congregação Central</h1>
          </div>
          
          {/* Botões direita */}
          <div className="flex items-center gap-2 w-24 justify-end">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              {/* Badge de notificação */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-600 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </span>
              <span className="sr-only">Notificações</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}