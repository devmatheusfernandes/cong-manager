"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollapsibleCard } from "@/components/collapsible-card";
import { Plus, User, Phone, Mail, Shield, Settings, Edit, Trash2 } from "lucide-react";
import { verificarAdmin } from "@/lib/permissions";
import { PermissionGuard } from "@/components/permission-guard";
import { toast } from "sonner";
import Link from "next/link";
import { 
  getAllPublicadores, 
  createPublicador, 
  updatePublicador, 
  deletePublicador,
  type Publicador,
  type CreatePublicadorData,
  type UpdatePublicadorData
} from "@/lib/auth";

// Função para obter o label do privilégio
function getPrivilegioLabel(privilegio: string) {
  const privilegios: Record<string, string> = {
    anciao: "Ancião",
    servo_ministerial: "Servo Ministerial",
    batizado: "Publicador Batizado",
    nao_batizado: "Publicador Não Batizado"
  };
  return privilegios[privilegio] || privilegio;
}

// Função para obter a cor do badge do privilégio
function getPrivilegioBadgeColor(privilegio: string) {
  const cores: Record<string, string> = {
    anciao: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    servo_ministerial: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    batizado: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    nao_batizado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  };
  return cores[privilegio] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
}

export default function NomesDataPage() {
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPublicador, setEditingPublicador] = useState<Publicador | null>(null);
  const [novoPublicador, setNovoPublicador] = useState({
    nome: "",
    genero: "",
    privilegio: ""
  });

  // IDs padrão para teste - em produção viriam do contexto de autenticação
  const usuarioId = "550e8400-e29b-41d4-a716-446655440001";
  const congregacaoId = "660e8400-e29b-41d4-a716-446655440001";
  
  const ehAdmin = verificarAdmin(usuarioId, congregacaoId);

  // Carregar publicadores
  useEffect(() => {
    const loadPublicadores = async () => {
      try {
        setLoading(true);
        const data = await getAllPublicadores();
        setPublicadores(data);
      } catch (error) {
        console.error('Erro ao carregar publicadores:', error);
        toast.error('Erro ao carregar publicadores');
      } finally {
        setLoading(false);
      }
    };

    loadPublicadores();
  }, []);

  const resetForm = () => {
    setNovoPublicador({
      nome: "",
      genero: "",
      privilegio: ""
    });
    setIsEditMode(false);
    setEditingPublicador(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoPublicador.nome || !novoPublicador.privilegio || !novoPublicador.genero) {
      toast.error("Nome, gênero e privilégio são obrigatórios");
      return;
    }

    try {
      if (isEditMode && editingPublicador) {
        const updateData: UpdatePublicadorData = {
          nome: novoPublicador.nome,
          genero: novoPublicador.genero as 'masculino' | 'feminino',
          privilegio: novoPublicador.privilegio as any
        };
        
        const result = await updatePublicador(editingPublicador.id, updateData);
        
        if (result.success && result.publicador) {
          // Atualizar lista local
          setPublicadores(prev => prev.map(p => 
            p.id === editingPublicador.id 
              ? result.publicador!
              : p
          ));
        } else {
          throw new Error(result.error || 'Erro ao atualizar publicador');
        }
        
        toast.success("Publicador atualizado com sucesso!");
      } else {
        const createData: CreatePublicadorData = {
          nome: novoPublicador.nome,
          genero: novoPublicador.genero as 'masculino' | 'feminino',
          privilegio: novoPublicador.privilegio as any
        };
        
        const result = await createPublicador(createData);
        
        if (result.success && result.publicador) {
          // Adicionar à lista local
          setPublicadores(prev => [...prev, result.publicador!]);
        } else {
          throw new Error(result.error || 'Erro ao criar publicador');
        }
        
        toast.success("Publicador criado com sucesso!");
      }
      
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar publicador:', error);
      toast.error('Erro ao salvar publicador');
    }
  };

  const handleEditPublicador = (publicador: Publicador) => {
    setEditingPublicador(publicador);
    setNovoPublicador({
      nome: publicador.nome,
      genero: publicador.genero,
      privilegio: publicador.privilegio
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeletePublicador = async (publicador: Publicador) => {
    if (!confirm(`Tem certeza que deseja excluir ${publicador.nome}?`)) {
      return;
    }

    try {
      const result = await deletePublicador(publicador.id);
      
      if (result.success) {
        // Remover da lista local
        setPublicadores(prev => prev.filter(p => p.id !== publicador.id));
        toast.success("Publicador excluído com sucesso!");
      } else {
        throw new Error(result.error || 'Erro ao excluir publicador');
      }
    } catch (error) {
      console.error('Erro ao excluir publicador:', error);
      toast.error('Erro ao excluir publicador');
    }
  };

  return (
    <PermissionGuard permissao="perm_publicadores">
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nomes e Datas</h2>
        {ehAdmin && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Publicador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Editar Publicador" : "Criar Novo Publicador"}
                </DialogTitle>
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
                  <Label htmlFor="genero">Gênero *</Label>
                  <Select 
                    value={novoPublicador.genero} 
                    onValueChange={(value) => setNovoPublicador(prev => ({ ...prev, genero: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="batizado">Publicador Batizado</SelectItem>
                      <SelectItem value="nao_batizado">Publicador Não Batizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {isEditMode ? "Atualizar Publicador" : "Criar Publicador"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
         <div className="text-center py-8">
           <p>Carregando publicadores...</p>
         </div>
       ) : publicadores.length === 0 ? (
         <div className="text-center py-8">
           <p className="text-muted-foreground">Nenhum publicador encontrado.</p>
           {ehAdmin && (
             <p className="text-sm text-muted-foreground mt-2">
               Clique em "Novo Publicador" para adicionar o primeiro.
             </p>
           )}
         </div>
       ) : (
         <div className="space-y-3">
           {publicadores.map((publicador) => (
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
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm capitalize">{publicador.genero}</span>
                  </div>
                </div>

                {ehAdmin && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditPublicador(publicador)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDeletePublicador(publicador)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                    <Link href={`/dashboard/publicadores/${publicador.id}/permissoes`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Permissões
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          ))}
        </div>
      )}
      </div>
    </PermissionGuard>
  );
}
