import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todos os publicadores
export async function GET(request: NextRequest) {
  try {
    const { data: publicadores, error } = await supabase
      .from('publicadores')
      .select('id, nome, telefone, email, privilegio')
      .order('nome')

    if (error) {
      console.error('Erro ao buscar publicadores:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar publicadores' },
        { status: 500 }
      )
    }

    return NextResponse.json(publicadores)
  } catch (error) {
    console.error('Erro na API de publicadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}