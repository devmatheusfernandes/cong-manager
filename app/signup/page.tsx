"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Church, User, Mail, Lock, MapPin, Phone, ArrowLeft, Users } from "lucide-react";

export default function SignUpPage() {
  const [activeTab, setActiveTab] = useState("congregacao");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Simular validação e envio
    setTimeout(() => {
      setIsLoading(false);
      // Aqui seria a lógica real de criação
    }, 2000);
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
            <Link href="/login">
              <Button variant="ghost">Já tenho conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-muted-foreground">
            Escolha como deseja começar a usar o Cong Manager
          </p>
        </div>

        <Card className="border-1 border-slate-200 dark:border-slate-800 rounded-2xl">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="congregacao" className="flex items-center gap-2">
                  <Church className="h-4 w-4" />
                  Nova Congregação
                </TabsTrigger>
                <TabsTrigger value="usuario" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Juntar-se à Congregação
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Criar Nova Congregação */}
              <TabsContent value="congregacao" className="space-y-6">
                <div className="text-center mb-6">
                  <Church className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                  <CardTitle className="text-xl">Criar Nova Congregação</CardTitle>
                  <CardDescription>
                    Você será o responsável administrativo da congregação
                  </CardDescription>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados da Congregação */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados da Congregação</h3>
                    
                    <Field>
                      <FieldLabel htmlFor="cong-nome">Nome da Congregação</FieldLabel>
                      <Input
                        id="cong-nome"
                        name="congregacao.nome"
                        placeholder="Ex: Congregação Central"
                        required
                      />
                      {errors["congregacao.nome"] && (
                        <FieldError>{errors["congregacao.nome"]}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="cong-cidade">Cidade</FieldLabel>
                      <Input
                        id="cong-cidade"
                        name="congregacao.cidade"
                        placeholder="Ex: São Paulo"
                        required
                      />
                      {errors["congregacao.cidade"] && (
                        <FieldError>{errors["congregacao.cidade"]}</FieldError>
                      )}
                    </Field>
                  </div>

                  {/* Dados do Responsável */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Seus Dados (Responsável)</h3>
                    
                    <Field>
                      <FieldLabel htmlFor="resp-nome">Nome Completo</FieldLabel>
                      <Input
                        id="resp-nome"
                        name="responsavel.nome"
                        placeholder="Seu nome completo"
                        required
                      />
                      {errors["responsavel.nome"] && (
                        <FieldError>{errors["responsavel.nome"]}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="resp-email">E-mail</FieldLabel>
                      <Input
                        id="resp-email"
                        name="responsavel.email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                      {errors["responsavel.email"] && (
                        <FieldError>{errors["responsavel.email"]}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="resp-telefone">Telefone</FieldLabel>
                      <Input
                        id="resp-telefone"
                        name="responsavel.telefone"
                        placeholder="(11) 99999-9999"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="resp-senha">Senha</FieldLabel>
                      <Input
                        id="resp-senha"
                        name="responsavel.senha"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        required
                      />
                      <FieldDescription>
                        Use pelo menos 8 caracteres com letras e números
                      </FieldDescription>
                      {errors["responsavel.senha"] && (
                        <FieldError>{errors["responsavel.senha"]}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="resp-confirmar-senha">Confirmar Senha</FieldLabel>
                      <Input
                        id="resp-confirmar-senha"
                        name="responsavel.confirmarSenha"
                        type="password"
                        placeholder="Digite a senha novamente"
                        required
                      />
                      {errors["responsavel.confirmarSenha"] && (
                        <FieldError>{errors["responsavel.confirmarSenha"]}</FieldError>
                      )}
                    </Field>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando..." : "Criar Congregação"}
                  </Button>
                </form>
              </TabsContent>

              {/* Juntar-se à Congregação */}
              <TabsContent value="usuario" className="space-y-6">
                <div className="text-center mb-6">
                  <Users className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                  <CardTitle className="text-xl">Juntar-se à Congregação</CardTitle>
                  <CardDescription>
                    Entre em uma congregação já existente no sistema
                  </CardDescription>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Field>
                    <FieldLabel htmlFor="user-nome">Nome Completo</FieldLabel>
                    <Input
                      id="user-nome"
                      name="usuario.nome"
                      placeholder="Seu nome completo"
                      required
                    />
                    {errors["usuario.nome"] && (
                      <FieldError>{errors["usuario.nome"]}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="user-email">E-mail</FieldLabel>
                    <Input
                      id="user-email"
                      name="usuario.email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                    {errors["usuario.email"] && (
                      <FieldError>{errors["usuario.email"]}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="user-telefone">Telefone</FieldLabel>
                    <Input
                      id="user-telefone"
                      name="usuario.telefone"
                      placeholder="(11) 99999-9999"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="user-congregacao">Código da Congregação</FieldLabel>
                    <Input
                      id="user-congregacao"
                      name="usuario.codigoCongregacao"
                      placeholder="Código fornecido pelo responsável"
                      required
                    />
                    <FieldDescription>
                      Solicite o código de acesso ao responsável da sua congregação
                    </FieldDescription>
                    {errors["usuario.codigoCongregacao"] && (
                      <FieldError>{errors["usuario.codigoCongregacao"]}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="user-senha">Senha</FieldLabel>
                    <Input
                      id="user-senha"
                      name="usuario.senha"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    <FieldDescription>
                      Use pelo menos 8 caracteres com letras e números
                    </FieldDescription>
                    {errors["usuario.senha"] && (
                      <FieldError>{errors["usuario.senha"]}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="user-confirmar-senha">Confirmar Senha</FieldLabel>
                    <Input
                      id="user-confirmar-senha"
                      name="usuario.confirmarSenha"
                      type="password"
                      placeholder="Digite a senha novamente"
                      required
                    />
                    {errors["usuario.confirmarSenha"] && (
                      <FieldError>{errors["usuario.confirmarSenha"]}</FieldError>
                    )}
                  </Field>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="/termos" className="text-indigo-600 hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="/privacidade" className="text-indigo-600 hover:underline">
                Política de Privacidade
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}