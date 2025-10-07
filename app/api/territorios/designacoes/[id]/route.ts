import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar designação específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: designacao, error } = await supabase
      .from('designacoes_territorio')
      .select(`
        *,
        territorio:territorios(id, nome, cidade),
        publicador:publicadores(id, nome, telefone, email)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Erro ao buscar designação:', error)
      return NextResponse.json(
        { error: 'Designação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(designacao)
  } catch (error) {
    console.error('Erro na API de designação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar designação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { data_inicio, data_fim, observacoes, status } = body

    const { data: designacao, error } = await supabase
      .from('designacoes_territorio')
      .update({
        data_inicio,
        data_fim,
        observacoes,
        status
      })
      .eq('id', params.id)
      .select(`
        *,
        territorio:territorios(id, nome, cidade),
        publicador:publicadores(id, nome, telefone, email)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar designação:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar designação' },
        { status: 500 }
      )
    }

    return NextResponse.json(designacao)
  } catch (error) {
    console.error('Erro na API de designação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir designação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('designacoes_territorio')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir designação:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir designação' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Designação excluída com sucesso' })
  } catch (error) {
    console.error('Erro na API de designação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}