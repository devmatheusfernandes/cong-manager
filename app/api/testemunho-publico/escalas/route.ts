import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar escalas de testemunho público
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const horarioId = searchParams.get('horario_id')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')
    const ehFixa = searchParams.get('eh_fixa')

    let query = supabase
      .from('carrinho_escalas_nova')
      .select(`
        *,
        horario:carrinho_horarios(
          *,
          locais_carrinho(nome, endereco)
        ),
        publicador1:publicadores!publicador1_id(id, nome),
        publicador2:publicadores!publicador2_id(id, nome),
        publicador3:publicadores!publicador3_id(id, nome)
      `)
      .order('data', { ascending: false })

    if (horarioId) {
      query = query.eq('horario_id', horarioId)
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

// POST - Criar nova escala de testemunho público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { horario_id, data, eh_fixa, observacoes, publicadores } = body

    // Validação básica
    if (!horario_id || !data) {
      return NextResponse.json(
        { error: 'Horário e data são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar publicadores (2-3 publicadores)
    if (!publicadores || !Array.isArray(publicadores) || publicadores.length < 2 || publicadores.length > 3) {
      return NextResponse.json(
        { error: 'É necessário selecionar entre 2 e 3 publicadores' },
        { status: 400 }
      )
    }

    // Verificar se o horário existe e obter o dia da semana
    const { data: horario, error: horarioError } = await supabase
      .from('carrinho_horarios')
      .select('id, dia_semana')
      .eq('id', horario_id)
      .eq('ativo', true)
      .single()

    if (horarioError || !horario) {
      return NextResponse.json(
        { error: 'Horário não encontrado' },
        { status: 404 }
      )
    }

    // Validar se a data corresponde ao dia da semana do horário
    // Usar uma abordagem mais confiável para evitar problemas de fuso horário
    const dateParts = data.split('-')
    const selectedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))
    const selectedDayOfWeek = selectedDate.getDay() // 0 = Domingo, 1 = Segunda, etc.
    
    if (selectedDayOfWeek !== horario.dia_semana) {
      const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
      return NextResponse.json(
        { error: `A data selecionada (${diasSemana[selectedDayOfWeek]}) não corresponde ao dia do horário (${diasSemana[horario.dia_semana]})` },
        { status: 400 }
      )
    }

    // Verificar se já existe escala para esta data e horário
    const { data: escalaExistente, error: checkError } = await supabase
      .from('carrinho_escalas_nova')
      .select('id')
      .eq('horario_id', horario_id)
      .eq('data', data)
      .maybeSingle()

    if (checkError) {
      console.error('Erro ao verificar escala existente:', checkError)
      return NextResponse.json(
        { error: 'Erro ao verificar escala' },
        { status: 500 }
      )
    }

    if (escalaExistente) {
      return NextResponse.json(
        { error: 'Já existe uma escala para esta data e horário' },
        { status: 400 }
      )
    }

    // Criar a escala com publicadores diretamente
    const escalaData: any = {
      horario_id,
      data,
      eh_fixa: eh_fixa || false,
      observacoes
    }

    // Atribuir publicadores às colunas específicas
    if (publicadores.length >= 1) escalaData.publicador1_id = publicadores[0]
    if (publicadores.length >= 2) escalaData.publicador2_id = publicadores[1]
    if (publicadores.length >= 3) escalaData.publicador3_id = publicadores[2]

    const { data: escala, error: escalaError } = await supabase
      .from('carrinho_escalas_nova')
      .insert(escalaData)
      .select()
      .single()

    if (escalaError) {
      console.error('Erro ao criar escala:', escalaError)
      return NextResponse.json(
        { error: 'Erro ao criar escala' },
        { status: 500 }
      )
    }

    // Buscar a escala criada com os dados completos
    const { data: escalaCompleta, error: fetchError } = await supabase
      .from('carrinho_escalas_nova')
      .select(`
        *,
        horario:carrinho_horarios(
          *,
          locais_carrinho(nome, endereco)
        ),
        publicador1:publicadores!publicador1_id(id, nome),
        publicador2:publicadores!publicador2_id(id, nome),
        publicador3:publicadores!publicador3_id(id, nome)
      `)
      .eq('id', escala.id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar escala criada:', fetchError)
      return NextResponse.json(escala, { status: 201 })
    }

    return NextResponse.json(escalaCompleta, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}