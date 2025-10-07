import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todos os locais de carrinho
export async function GET() {
  try {
    const { data: locais, error } = await supabase
      .from('locais_carrinho')
      .select(`
        *,
        horarios:carrinho_horarios(*)
      `)
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao buscar locais de carrinho:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar locais de carrinho' },
        { status: 500 }
      )
    }

    return NextResponse.json(locais)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo local de carrinho
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, endereco, congregacao_id } = body

    // Validação básica
    if (!nome || !endereco || !congregacao_id) {
      return NextResponse.json(
        { error: 'Nome, endereço e congregação são obrigatórios' },
        { status: 400 }
      )
    }

    // Inserir novo local
    const { data: local, error } = await supabase
      .from('locais_carrinho')
      .insert({
        nome,
        endereco,
        congregacao_id
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar local de carrinho:', error)
      return NextResponse.json(
        { error: 'Erro ao criar local de carrinho' },
        { status: 500 }
      )
    }

    return NextResponse.json(local, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}