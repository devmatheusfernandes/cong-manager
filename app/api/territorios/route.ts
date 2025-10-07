import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todos os territórios
export async function GET() {
  try {
    const { data: territorios, error } = await supabase
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
      .order('nome')

    if (error) {
      console.error('Erro ao buscar territórios:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar territórios' },
        { status: 500 }
      )
    }

    return NextResponse.json(territorios)
  } catch (error) {
    console.error('Erro na API de territórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo território
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, coordenadas, imagem_url, cidade, congregacao_id } = body

    // Validação básica
    if (!nome || !congregacao_id) {
      return NextResponse.json(
        { error: 'Nome e congregação são obrigatórios' },
        { status: 400 }
      )
    }

    const { data: territorio, error } = await supabase
      .from('territorios')
      .insert({
        nome,
        coordenadas,
        imagem_url,
        cidade,
        congregacao_id
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar território:', error)
      return NextResponse.json(
        { error: 'Erro ao criar território' },
        { status: 500 }
      )
    }

    return NextResponse.json(territorio, { status: 201 })
  } catch (error) {
    console.error('Erro na API de territórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}