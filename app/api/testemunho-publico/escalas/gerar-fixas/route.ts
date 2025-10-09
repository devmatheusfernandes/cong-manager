import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Gerar escalas fixas para as próximas semanas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { semanas = 4 } = body // Por padrão, gera para 4 semanas

    // Buscar todas as escalas fixas existentes
    const { data: escalasFixas, error: escalasError } = await supabase
      .from('carrinho_escalas_nova')
      .select(`
        *,
        horario:carrinho_horarios(
          *,
          locais_carrinho(nome, endereco)
        )
      `)
      .eq('eh_fixa', true)

    if (escalasError) {
      console.error('Erro ao buscar escalas fixas:', escalasError)
      return NextResponse.json(
        { error: 'Erro ao buscar escalas fixas' },
        { status: 500 }
      )
    }

    if (!escalasFixas || escalasFixas.length === 0) {
      return NextResponse.json(
        { message: 'Nenhuma escala fixa encontrada' },
        { status: 200 }
      )
    }

    const novasEscalas = []
    const hoje = new Date()
    
    // Para cada escala fixa, gerar para as próximas semanas
    for (const escalaFixa of escalasFixas) {
      const dataOriginal = new Date(escalaFixa.data)
      
      for (let i = 1; i <= semanas; i++) {
        const novaData = new Date(dataOriginal)
        novaData.setDate(dataOriginal.getDate() + (i * 7))
        
        // Só gerar se a data for futura
        if (novaData > hoje) {
          const dataString = novaData.toISOString().split('T')[0]
          
          // Verificar se já existe escala para esta data e horário
          const { data: escalaExistente } = await supabase
            .from('carrinho_escalas_nova')
            .select('id')
            .eq('horario_id', escalaFixa.horario_id)
            .eq('data', dataString)
            .maybeSingle()
          
          if (!escalaExistente) {
            // Criar nova escala
            const novaEscala = {
              horario_id: escalaFixa.horario_id,
              data: dataString,
              eh_fixa: true,
              publicador1_id: escalaFixa.publicador1_id,
              publicador2_id: escalaFixa.publicador2_id,
              publicador3_id: escalaFixa.publicador3_id,
              observacoes: escalaFixa.observacoes
            }
            
            const { data: escalaCriada, error: criarError } = await supabase
              .from('carrinho_escalas_nova')
              .insert(novaEscala)
              .select()
              .single()
            
            if (!criarError && escalaCriada) {
              novasEscalas.push(escalaCriada)
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: `${novasEscalas.length} escalas fixas geradas com sucesso`,
      escalas: novasEscalas
    }, { status: 201 })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}