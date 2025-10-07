import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar horários de carrinho
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const localId = searchParams.get('local_id')

    let query = supabase
      .from('carrinho_horarios')
      .select(`
        *,
        local:locais_carrinho(nome, endereco)
      `)
      .eq('ativo', true)
      .order('dia_semana')
      .order('hora_inicio')

    if (localId) {
      query = query.eq('local_id', localId)
    }

    const { data: horarios, error } = await query

    if (error) {
      console.error('Erro ao buscar horários:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar horários' },
        { status: 500 }
      )
    }

    return NextResponse.json(horarios)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo horário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { local_id, dia_semana, hora_inicio, hora_fim } = body

    // Validação básica
    if (!local_id || dia_semana === undefined || !hora_inicio || !hora_fim) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
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

    // Verificar se já existe horário para este local no mesmo dia e horário
    const { data: existente } = await supabase
      .from('carrinho_horarios')
      .select('id')
      .eq('local_id', local_id)
      .eq('dia_semana', dia_semana)
      .eq('hora_inicio', hora_inicio)
      .eq('ativo', true)
      .single()

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um horário para este local neste dia e horário' },
        { status: 409 }
      )
    }

    const { data: horario, error } = await supabase
      .from('carrinho_horarios')
      .insert({
        local_id,
        dia_semana,
        hora_inicio,
        hora_fim
      })
      .select(`
        *,
        local:locais_carrinho(nome, endereco)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar horário:', error)
      return NextResponse.json(
        { error: 'Erro ao criar horário' },
        { status: 500 }
      )
    }

    return NextResponse.json(horario, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}