import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar escalas de carrinho
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const horarioId = searchParams.get('horario_id')
    const publicadorId = searchParams.get('publicador_id')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')
    const ehFixa = searchParams.get('eh_fixa')

    let query = supabase
      .from('carrinho_escalas')
      .select(`
        *,
        horario:carrinho_horarios(
          *,
          local:locais_carrinho(nome, endereco)
        ),
        publicador:publicadores(nome)
      `)
      .order('data', { ascending: false })

    if (horarioId) {
      query = query.eq('horario_id', horarioId)
    }

    if (publicadorId) {
      query = query.eq('publicador_id', publicadorId)
    }

    if (dataInicio) {
      query = query.gte('data', dataInicio)
    }

    if (dataFim) {
      query = query.lte('data', dataFim)
    }

    if (ehFixa !== null) {
      query = query.eq('eh_fixa', ehFixa === 'true')
    }

    const { data: escalas, error } = await query

    if (error) {
      console.error('Erro ao buscar escalas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar escalas' },
        { status: 500 }
      )
    }

    return NextResponse.json(escalas)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova escala
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { horario_id, publicador_id, data, eh_fixa = false, observacoes } = body

    // Validação básica
    if (!horario_id || !publicador_id || !data) {
      return NextResponse.json(
        { error: 'Horário, publicador e data são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe escala para este horário nesta data
    const { data: existente } = await supabase
      .from('carrinho_escalas')
      .select('id')
      .eq('horario_id', horario_id)
      .eq('data', data)
      .single()

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma escala para este horário nesta data' },
        { status: 409 }
      )
    }

    const { data: escala, error } = await supabase
      .from('carrinho_escalas')
      .insert({
        horario_id,
        publicador_id,
        data,
        eh_fixa,
        observacoes
      })
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
      console.error('Erro ao criar escala:', error)
      return NextResponse.json(
        { error: 'Erro ao criar escala' },
        { status: 500 }
      )
    }

    return NextResponse.json(escala, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}