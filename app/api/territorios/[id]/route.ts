import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar território específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: territorio, error } = await supabase
      .from('territorios')
      .select(`
        *,
        congregacao:congregacoes(id, nome),
        designacoes:designacoes_territorio(
          id,
          data_inicio,
          data_fim,
          observacoes,
          status,
          publicador:publicadores(id, nome, telefone, email)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Erro ao buscar território:', error)
      return NextResponse.json(
        { error: 'Território não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(territorio)
  } catch (error) {
    console.error('Erro na API de território:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar território
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nome, coordenadas, imagem_url, cidade } = body

    const { data: territorio, error } = await supabase
      .from('territorios')
      .update({
        nome,
        coordenadas,
        imagem_url,
        cidade
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar território:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar território' },
        { status: 500 }
      )
    }

    return NextResponse.json(territorio)
  } catch (error) {
    console.error('Erro na API de território:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir território
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('territorios')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir território:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir território' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Território excluído com sucesso' })
  } catch (error) {
    console.error('Erro na API de território:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}