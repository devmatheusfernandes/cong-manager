import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar histórico de designações de um território
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: historico, error } = await supabase
      .from('designacoes_territorio')
      .select(`
        *,
        publicador:publicadores(id, nome, telefone, email)
      `)
      .eq('territorio_id', params.id)
      .order('data_inicio', { ascending: false })

    if (error) {
      console.error('Erro ao buscar histórico:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar histórico' },
        { status: 500 }
      )
    }

    return NextResponse.json(historico)
  } catch (error) {
    console.error('Erro na API de histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}