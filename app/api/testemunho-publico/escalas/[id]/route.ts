import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar escala específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: escala, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar escala:', error)
      return NextResponse.json(
        { error: 'Escala não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(escala)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar escala
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { data, eh_fixa, observacoes, publicadores } = body

    // Validação básica
    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    // Validar publicadores (2-3 publicadores)
    if (publicadores && (!Array.isArray(publicadores) || publicadores.length < 2 || publicadores.length > 3)) {
      return NextResponse.json(
        { error: 'É necessário selecionar entre 2 e 3 publicadores' },
        { status: 400 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {
      data,
      eh_fixa: eh_fixa || false,
      observacoes
    }

    // Se publicadores foram fornecidos, atualizar as colunas específicas
    if (publicadores) {
      // Limpar todos os publicadores primeiro
      updateData.publicador1_id = null
      updateData.publicador2_id = null
      updateData.publicador3_id = null
      
      // Atribuir novos publicadores
      if (publicadores.length >= 1) updateData.publicador1_id = publicadores[0]
      if (publicadores.length >= 2) updateData.publicador2_id = publicadores[1]
      if (publicadores.length >= 3) updateData.publicador3_id = publicadores[2]
    }

    // Atualizar a escala
    const { data: escala, error: escalaError } = await supabase
      .from('carrinho_escalas_nova')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (escalaError) {
      console.error('Erro ao atualizar escala:', escalaError)
      return NextResponse.json(
        { error: 'Erro ao atualizar escala' },
        { status: 500 }
      )
    }

    // Buscar a escala atualizada com os dados completos
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
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar escala atualizada:', fetchError)
      return NextResponse.json(escala)
    }

    return NextResponse.json(escalaCompleta)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover escala
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Remover a escala (não precisa mais remover de escalas_publicadores)
    const { data: escala, error } = await supabase
      .from('carrinho_escalas_nova')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao remover escala:', error)
      return NextResponse.json(
        { error: 'Erro ao remover escala' },
        { status: 500 }
      )
    }

    return NextResponse.json(escala)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}