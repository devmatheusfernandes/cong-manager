import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar horário específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: horario, error } = await supabase
      .from('carrinho_horarios')
      .select(`
        *,
        local:locais_carrinho(nome, endereco),
        escalas:carrinho_escalas(*)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single()

    if (error) {
      console.error('Erro ao buscar horário:', error)
      return NextResponse.json(
        { error: 'Horário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(horario)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar horário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { dia_semana, hora_inicio, hora_fim, observacoes } = body

    // Validação básica
    if (dia_semana === undefined || !hora_inicio || !hora_fim) {
      return NextResponse.json(
        { error: 'Dia da semana, hora de início e fim são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar dia da semana (0-6)
    if (dia_semana < 0 || dia_semana > 6) {
      return NextResponse.json(
        { error: 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)' },
        { status: 400 }
      )
    }

    const { data: horario, error } = await supabase
      .from('carrinho_horarios')
      .update({
        dia_semana,
        hora_inicio,
        hora_fim,
        observacoes
      })
      .eq('id', id)
      .select(`
        *,
        local:locais_carrinho(nome, endereco)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar horário:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar horário' },
        { status: 500 }
      )
    }

    return NextResponse.json(horario)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar horário (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: horario, error } = await supabase
      .from('carrinho_horarios')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao desativar horário:', error)
      return NextResponse.json(
        { error: 'Erro ao desativar horário' },
        { status: 500 }
      )
    }

    return NextResponse.json(horario)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}