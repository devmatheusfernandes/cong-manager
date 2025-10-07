import { NextResponse } from 'next/server'
import { getAllPublicadores } from '@/lib/auth'

// GET - Listar todos os publicadores com permissões
export async function GET() {
  try {
    const publicadores = await getAllPublicadores()
    return NextResponse.json(publicadores)
  } catch (error) {
    console.error('Erro na API de publicadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}