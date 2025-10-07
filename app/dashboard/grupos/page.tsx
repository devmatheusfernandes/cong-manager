"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { GrupoDialog } from "@/components/grupo-dialog";
import { PermissionWrapper } from "@/components/permission-wrapper";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, User, Crown, UserCheck, Phone, Mail, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Publicador {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  privilegio?: string;
}

interface Grupo {
  id: string;
  nome: string;
  superintendente_id?: string | null;
  servo_id?: string | null;
  superintendente?: Publicador;
  servo?: Publicador;
  membros: Publicador[];
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grupos');
      if (response.ok) {
        const data = await response.json();
        setGrupos(data);
      } else {
        toast.error('Erro ao carregar grupos');
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrupo = async (grupoId: string) => {
    try {
      setDeletingId(grupoId);
      const response = await fetch(`/api/grupos/${grupoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Grupo excluído com sucesso!');
        fetchGrupos();
      } else {
        toast.error('Erro ao excluir grupo');
      }
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      toast.error('Erro ao excluir grupo');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PermissionWrapper section="grupos" action="edit">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Grupos</h2>
          <GrupoDialog 
            onSuccess={fetchGrupos}
          />
        </div>
        
        <div className="space-y-3">
          {grupos.map((grupo) => {
            return (
              <CollapsibleCard
                key={grupo.id}
                title={grupo.nome}
                icon={Users}
                badge={`${grupo.membros.length} membros`}
                defaultExpanded={false}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {grupo.superintendente && (
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Superintendente</span>
                        </div>
                        <p className="text-sm font-semibold">{grupo.superintendente.nome}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {grupo.superintendente.telefone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{grupo.superintendente.telefone}</span>
                            </div>
                          )}
                          {grupo.superintendente.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{grupo.superintendente.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {grupo.servo && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-600">Servo Ministerial</span>
                        </div>
                        <p className="text-sm font-semibold">{grupo.servo.nome}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {grupo.servo.telefone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{grupo.servo.telefone}</span>
                            </div>
                          )}
                          {grupo.servo.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{grupo.servo.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Membros do Grupo:</span>
                    <div className="grid grid-cols-1 gap-2">
                      {grupo.membros.map((publicador) => (
                        <div key={publicador.id} className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">{publicador.nome}</span>
                            {publicador.privilegio && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {publicador.privilegio}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {publicador.telefone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{publicador.telefone}</span>
                              </div>
                            )}
                            {publicador.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{publicador.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {grupo.membros.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum membro adicionado ao grupo
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <GrupoDialog
                      grupo={grupo}
                      onSuccess={fetchGrupos}
                      trigger={
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          disabled={deletingId === grupo.id}
                        >
                          {deletingId === grupo.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o grupo &quot;{grupo.nome}&quot;? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGrupo(grupo.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CollapsibleCard>
            );
          })}
          {grupos.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum grupo encontrado</p>
              <p className="text-sm text-muted-foreground">Clique em &quot;Novo Grupo&quot; para começar</p>
            </div>
          )}
        </div>
      </div>
    </PermissionWrapper>
  );
}