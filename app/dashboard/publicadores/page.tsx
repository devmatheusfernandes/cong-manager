"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollapsibleCard } from "@/components/collapsible-card";
import mockData from "@/data/mock-data.json";
import { Plus, User, Phone, Mail, Shield, Settings } from "lucide-react";
import { verificarAdmin } from "@/lib/permissions";
import { toast } from "sonner";
import Link from "next/link";

// Função para obter o label do privilégio
function getPrivilegioLabel(privilegio: string) {
  const privilegios: Record<string, string> = {
    anciao: "Ancião",
    servo_ministerial: "Servo Ministerial",
    pioneiro_regular: "Pioneiro Regular",
    publicador_batizado: "Publicador Batizado",
    publicador_nao_batizado: "Publicador Não Batizado"
  };
  return privilegios[privilegio] || privilegio;
}

// Função para obter a cor do badge do privilégio
function getPrivilegioBadgeColor(privilegio: string) {
  const cores: Record<string, string> = {
    anciao: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    servo_ministerial: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    pioneiro_regular: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    publicador_batizado: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    publicador_nao_batizado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  };
  return cores[privilegio] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
}

export default function NomesDataPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoPublicador, setNovoPublicador] = useState({
    nome: "",
    telefone: "",
    email: "",
    privilegio: ""
  });

  // IDs padrão para teste - em produção viriam do contexto de autenticação
  const usuarioId = "550e8400-e29b-41d4-a716-446655440001";
  const congregacaoId = "660e8400-e29b-41d4-a716-446655440001";
  
  const ehAdmin = verificarAdmin(usuarioId, congregacaoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoPublicador.nome || !novoPublicador.privilegio) {
      toast.error("Nome e privilégio são obrigatórios");
      return;
    }

    // Aqui seria feita a chamada para a API para criar o publicador
    console.log("Criando publicador:", novoPublicador);
    toast.success("Publicador criado com sucesso!");
    
    // Reset do formulário
    setNovoPublicador({
      nome: "",
      telefone: "",
      email: "",
      privilegio: ""
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nomes e Datas</h2>
        {ehAdmin && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Publicador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Publicador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={novoPublicador.nome}
                    onChange={(e) => setNovoPublicador(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo do publicador"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={novoPublicador.telefone}
                    onChange={(e) => setNovoPublicador(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={novoPublicador.email}
                    onChange={(e) => setNovoPublicador(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privilegio">Privilégio *</Label>
                  <Select 
                    value={novoPublicador.privilegio} 
                    onValueChange={(value) => setNovoPublicador(prev => ({ ...prev, privilegio: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o privilégio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anciao">Ancião</SelectItem>
                      <SelectItem value="servo_ministerial">Servo Ministerial</SelectItem>
                      <SelectItem value="pioneiro_regular">Pioneiro Regular</SelectItem>
                      <SelectItem value="publicador_batizado">Publicador Batizado</SelectItem>
                      <SelectItem value="publicador_nao_batizado">Publicador Não Batizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Criar Publicador
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {mockData.publicadores.map((publicador) => (
          <CollapsibleCard
            key={publicador.id}
            title={publicador.nome}
            icon={User}
            defaultExpanded={false}
            badge={
              <Badge 
                variant="secondary" 
                className={getPrivilegioBadgeColor(publicador.privilegio)}
              >
                <Shield className="h-3 w-3 mr-1" />
                {getPrivilegioLabel(publicador.privilegio)}
              </Badge>
            }
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {publicador.telefone && (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{publicador.telefone}</span>
                  </div>
                )}
                {publicador.email && (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{publicador.email}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Editar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Designações
                </Button>
                <Link href={`/dashboard/publicadores/${publicador.id}/permissoes`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Verificar Permissões
                  </Button>
                </Link>
              </div>
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  );
}
