"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { LogIn, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export function LoginDialog() {
  const { user, login, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const success = await login(password);
      if (success) {
        toast.success("Login realizado com sucesso!");
        setIsOpen(false);
        setPassword("");
      } else {
        toast.error("Senha incorreta!");
      }
    } catch (_) {
      toast.error("Erro ao fazer login!");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.username}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Entrar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fazer Login</DialogTitle>
          <DialogDescription>
            Digite a senha correspondente à sua função para acessar as funcionalidades de edição.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha da sua função"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Senhas disponíveis:</p>
          <div className="text-xs space-y-1">
            <div><strong>admin</strong> - Acesso total</div>
            <div><strong>carrinho</strong> - Gestão de carrinho</div>
            <div><strong>nvc</strong> - Nossa Vida Cristã</div>
            <div><strong>pregacao</strong> - Pregação e grupos</div>
            <div><strong>mecanicas</strong> - Mecânicas</div>
            <div><strong>oradores</strong> - Discursos</div>
            <div><strong>limpeza</strong> - Limpeza</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}