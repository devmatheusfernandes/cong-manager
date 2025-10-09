import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const congregacao_id = params.id
    const body = await request.json()

    console.log('🔄 Atualizando horários da congregação:', congregacao_id, body)

    // Validar dados obrigatórios
    const {
      horario_reuniao_meio_semana,
      horario_reuniao_fim_semana,
      dia_reuniao_meio_semana,
      dia_reuniao_fim_semana
    } = body

    // Atualizar horários da congregação
    const { data: congregacao, error: updateError } = await supabase
      .from('congregacoes')
      .update({
        horario_reuniao_meio_semana: horario_reuniao_meio_semana || null,
        horario_reuniao_fim_semana: horario_reuniao_fim_semana || null,
        dia_reuniao_meio_semana: dia_reuniao_meio_semana || null,
        dia_reuniao_fim_semana: dia_reuniao_fim_semana || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', congregacao_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar horários:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar horários', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Horários atualizados com sucesso')
    return NextResponse.json(congregacao)

  } catch (error) {
    console.error('❌ Erro interno do servidor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}