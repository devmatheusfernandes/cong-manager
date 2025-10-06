import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { numero } = await request.json()

    if (!numero) {
      return NextResponse.json(
        { error: 'Número da congregação é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o número já existe
    const { data, error } = await supabase
      .from('congregacoes')
      .select('id')
      .eq('numero_unico', numero)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (que é o que queremos)
      console.error('Erro ao verificar número da congregação:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Se encontrou dados, significa que o número já existe
    const existe = !!data

    return NextResponse.json({ existe })
  } catch (error) {
    console.error('Erro ao verificar número da congregação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}