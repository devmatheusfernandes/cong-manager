import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todos os locais de testemunho público
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
      console.error('Erro ao buscar locais de testemunho público:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar locais de testemunho público' },
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

// POST - Criar novo local de testemunho público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, endereco, observacoes, congregacao_id } = body

    // Validação básica
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Usar congregacao_id do body ou valor padrão
    const congregacaoId = congregacao_id || '660e8400-e29b-41d4-a716-446655440001'

    const { data: local, error } = await supabase
      .from('locais_carrinho')
      .insert({
        nome,
        endereco,
        observacoes,
        congregacao_id: congregacaoId,
        ativo: true
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar local:', error)
      return NextResponse.json(
        { error: 'Erro ao criar local' },
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