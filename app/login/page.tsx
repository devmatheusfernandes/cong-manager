"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Church, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simular autenticação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui seria a lógica real de autenticação
      console.log("Login attempt:", formData);
      
      // Redirecionar para dashboard após login bem-sucedido
      // router.push("/dashboard");
      
    } catch (error) {
      setErrors({ general: "Erro ao fazer login. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Lógica para recuperação de senha
    console.log("Forgot password for:", formData.email);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <Church className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold">Cong Manager</h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/signup">
              <Button variant="ghost">Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Church className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">
            Entre na sua conta para acessar o sistema
          </p>
        </div>

        <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar sua congregação
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Erro geral */}
              {errors.general && (
                <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                  <p className="text-sm text-rose-600 dark:text-rose-400">{errors.general}</p>
                </div>
              )}

              {/* E-mail */}
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              {/* Senha */}
              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>

              {/* Lembrar-me e Esqueci a senha */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-muted-foreground">Lembrar-me</span>
                </label>
                
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Esqueci a senha
                </button>
              </div>

              {/* Botão de Login */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Separador */}
            <div className="my-6">
              <Separator />
            </div>

            {/* Link para criar conta */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 hover:underline font-medium">
                  Criar conta
                </Link>
              </p>
            </div>

            {/* Informações adicionais */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Precisa de ajuda?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Entre em contato com o responsável da sua congregação</li>
                <li>• Verifique se você tem permissão para acessar o sistema</li>
                <li>• Certifique-se de estar usando o e-mail correto</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Informações de segurança */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Suas informações estão protegidas com criptografia de ponta a ponta
          </p>
        </div>
      </main>
    </div>
  );
}