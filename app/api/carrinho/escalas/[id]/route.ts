import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar escala específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: escala, error } = await supabase
      .from('carrinho_escalas')
      .select(`
        *,
        horario:carrinho_horarios(
          *,
          local:locais_carrinho(nome, endereco)
        ),
        publicador:publicadores(nome)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar escala:', error)
      return NextResponse.json(
        { error: 'Escala não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(escala)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar escala
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { publicador_id, data, eh_fixa, observacoes } = body

    // Validação básica
    if (!publicador_id || !data) {
      return NextResponse.json(
        { error: 'Publicador e data são obrigatórios' },
        { status: 400 }
      )
    }

    const { data: escala, error } = await supabase
      .from('carrinho_escalas')
      .update({
        publicador_id,
        data,
        eh_fixa: eh_fixa || false,
        observacoes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        horario:carrinho_horarios(
          *,
          local:locais_carrinho(nome, endereco)
        ),
        publicador:publicadores(nome)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar escala:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar escala' },
        { status: 500 }
      )
    }

    return NextResponse.json(escala)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover escala
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('carrinho_escalas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao remover escala:', error)
      return NextResponse.json(
        { error: 'Erro ao remover escala' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Escala removida com sucesso' })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}