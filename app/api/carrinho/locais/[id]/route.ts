import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar local específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: local, error } = await supabase
      .from('locais_carrinho')
      .select(`
        *,
        horarios:carrinho_horarios(*)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single()

    if (error) {
      console.error('Erro ao buscar local:', error)
      return NextResponse.json(
        { error: 'Local não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(local)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar local
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, endereco } = body

    // Validação básica
    if (!nome || !endereco) {
      return NextResponse.json(
        { error: 'Nome e endereço são obrigatórios' },
        { status: 400 }
      )
    }

    const { data: local, error } = await supabase
      .from('locais_carrinho')
      .update({
        nome,
        endereco,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar local:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar local' },
        { status: 500 }
      )
    }

    return NextResponse.json(local)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar local (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('locais_carrinho')
      .update({
        ativo: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao desativar local:', error)
      return NextResponse.json(
        { error: 'Erro ao desativar local' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Local desativado com sucesso' })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}