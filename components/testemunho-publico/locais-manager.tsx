"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"

interface Local {
  id: string
  nome: string
  endereco: string
  observacoes?: string
  ativo: boolean
  created_at: string
}

interface LocalFormData {
  nome: string
  endereco: string
  observacoes: string
}

export function LocaisManager() {
  const [locais, setLocais] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocal, setEditingLocal] = useState<Local | null>(null)
  const [formData, setFormData] = useState<LocalFormData>({
    nome: "",
    endereco: "",
    observacoes: ""
  })

  // ID padrão da congregação (em uma implementação real, isso viria de um contexto)
  const congregacaoId = '660e8400-e29b-41d4-a716-446655440001'

  useEffect(() => {
    fetchLocais()
  }, [])

  const fetchLocais = async () => {
    try {
      const response = await fetch("/api/testemunho-publico/locais")
      if (response.ok) {
        const data = await response.json()
        setLocais(data)
      } else {
        toast.error("Erro ao carregar locais")
      }
    } catch (error) {
      toast.error("Erro ao carregar locais")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.endereco.trim()) {
      toast.error("Nome e endereço são obrigatórios")
      return
    }

    try {
      const url = editingLocal 
        ? `/api/testemunho-publico/locais/${editingLocal.id}`
        : "/api/testemunho-publico/locais"
      
      const method = editingLocal ? "PUT" : "POST"
      
      const body = {
        ...formData,
        ...(editingLocal ? {} : { congregacao_id: congregacaoId })
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast.success(editingLocal ? "Local atualizado com sucesso!" : "Local criado com sucesso!")
        setDialogOpen(false)
        resetForm()
        fetchLocais()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao salvar local")
      }
    } catch (error) {
      toast.error("Erro ao salvar local")
    }
  }

  const handleEdit = (local: Local) => {
    setEditingLocal(local)
    setFormData({
      nome: local.nome,
      endereco: local.endereco,
      observacoes: local.observacoes || ""
    })
    setDialogOpen(true)
  }

  const handleDelete = async (local: Local) => {
    if (!confirm(`Tem certeza que deseja excluir o local "${local.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/testemunho-publico/locais/${local.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Local excluído com sucesso!")
        fetchLocais()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao excluir local")
      }
    } catch (error) {
      toast.error("Erro ao excluir local")
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      endereco: "",
      observacoes: ""
    })
    setEditingLocal(null)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locais de Testemunho Público
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Local
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLocal ? "Editar Local" : "Novo Local"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Local *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Praça Central"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Ex: Rua das Flores, 123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre o local..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingLocal ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {locais.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum local cadastrado ainda.</p>
            <p className="text-sm">Clique em "Novo Local" para começar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locais.map((local) => (
                <TableRow key={local.id}>
                  <TableCell className="font-medium">{local.nome}</TableCell>
                  <TableCell>{local.endereco}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {local.observacoes || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(local)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(local)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}