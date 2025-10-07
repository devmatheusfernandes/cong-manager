import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todas as designações
export async function GET() {
  try {
    const { data: designacoes, error } = await supabase
      .from('designacoes_territorio')
      .select(`
        *,
        territorio:territorios(id, nome, cidade),
        publicador:publicadores(id, nome, telefone, email)
      `)
      .order('data_inicio', { ascending: false })

    if (error) {
      console.error('Erro ao buscar designações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar designações' },
        { status: 500 }
      )
    }

    return NextResponse.json(designacoes)
  } catch (error) {
    console.error('Erro na API de designações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova designação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { territorio_id, publicador_id, data_inicio, data_fim, observacoes } = body

    // Validação básica
    if (!territorio_id || !publicador_id || !data_inicio) {
      return NextResponse.json(
        { error: 'Território, publicador e data de início são obrigatórios' },
        { status: 400 }
      )
    }

    // Determinar o status baseado na presença da data_fim
    const status = data_fim ? 'finalizado' : 'ativo'

    // Verificar se o território já está designado (ativo) - apenas se a nova designação for ativa
    if (status === 'ativo') {
      const { data: designacaoAtiva, error: checkError } = await supabase
        .from('designacoes_territorio')
        .select('id')
        .eq('territorio_id', territorio_id)
        .eq('status', 'ativo')
        .maybeSingle()

      if (checkError) {
        console.error('Erro ao verificar designação ativa:', checkError)
        return NextResponse.json(
          { error: 'Erro ao verificar designação' },
          { status: 500 }
        )
      }

      if (designacaoAtiva) {
        return NextResponse.json(
          { error: 'Este território já está designado para outro publicador' },
          { status: 400 }
        )
      }
    }

    const { data: designacao, error } = await supabase
      .from('designacoes_territorio')
      .insert({
        territorio_id,
        publicador_id,
        data_inicio,
        data_fim,
        observacoes,
        status
      })
      .select(`
        *,
        territorio:territorios(id, nome, cidade),
        publicador:publicadores(id, nome, telefone, email)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar designação:', error)
      return NextResponse.json(
        { error: 'Erro ao criar designação' },
        { status: 500 }
      )
    }

    return NextResponse.json(designacao, { status: 201 })
  } catch (error) {
    console.error('Erro na API de designações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}