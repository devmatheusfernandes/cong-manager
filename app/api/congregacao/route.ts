import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const congregacao_id = searchParams.get('id') || '660e8400-e29b-41d4-a716-446655440001'

    console.log('🔍 Buscando dados da congregação:', congregacao_id)

    // Buscar dados da congregação
    const { data: congregacao, error: congregacaoError } = await supabase
      .from('congregacoes')
      .select('*')
      .eq('id', congregacao_id)
      .single()

    if (congregacaoError) {
      console.error('❌ Erro ao buscar congregação:', congregacaoError)
      return NextResponse.json(
        { error: 'Congregação não encontrada', details: congregacaoError.message },
        { status: 404 }
      )
    }

    // Buscar estatísticas da congregação
    const [
      { data: publicadores, error: publicadoresError },
      { data: grupos, error: gruposError },
      { data: reunioes, error: reunioesError }
    ] = await Promise.all([
      supabase
        .from('publicadores')
        .select('id, nome, privilegio')
        .eq('congregacao_id', congregacao_id),
      
      supabase
        .from('grupos')
        .select('id, nome')
        .eq('congregacao_id', congregacao_id),
      
      supabase
        .from('reunioes_nvc')
        .select('id, periodo')
        .eq('congregacao_id', congregacao_id)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    if (publicadoresError) {
      console.error('❌ Erro ao buscar publicadores:', publicadoresError)
    }

    if (gruposError) {
      console.error('❌ Erro ao buscar grupos:', gruposError)
    }

    if (reunioesError) {
      console.error('❌ Erro ao buscar reuniões:', reunioesError)
    }

    // Calcular estatísticas
    const totalPublicadores = publicadores?.length || 0
    const totalGrupos = grupos?.length || 0
    const totalReunioes = reunioes?.length || 0

    // Contar publicadores por privilégio
    const publicadoresPorPrivilegio = publicadores?.reduce((acc, pub) => {
      const privilegio = pub.privilegio || 'Publicador'
      acc[privilegio] = (acc[privilegio] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const response = {
      congregacao,
      estatisticas: {
        totalPublicadores,
        totalGrupos,
        totalReunioes,
        publicadoresPorPrivilegio
      },
      publicadores: publicadores || [],
      grupos: grupos || [],
      reunioesRecentes: reunioes || []
    }

    console.log('✅ Dados da congregação carregados com sucesso')
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Erro interno do servidor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}