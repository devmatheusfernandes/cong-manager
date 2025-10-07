import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar grupo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: grupo, error: grupoError } = await supabase
      .from('grupos')
      .select(`
        *,
        superintendente:publicadores!grupos_superintendente_id_fkey(id, nome, telefone, email, privilegio),
        servo:publicadores!grupos_servo_id_fkey(id, nome, telefone, email, privilegio)
      `)
      .eq('id', id)
      .single()

    if (grupoError) {
      console.error('Erro ao buscar grupo:', grupoError)
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Buscar membros do grupo
    const { data: membros, error: membrosError } = await supabase
      .from('grupo_publicadores')
      .select(`
        publicador:publicadores(id, nome, telefone, email, privilegio)
      `)
      .eq('grupo_id', id)

    if (membrosError) {
      console.error('Erro ao buscar membros:', membrosError)
      return NextResponse.json(
        { ...grupo, membros: [] }
      )
    }

    return NextResponse.json({
      ...grupo,
      membros: membros.map(m => m.publicador)
    })
  } catch (error) {
    console.error('Erro na API de grupos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar grupo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, superintendente_id, servo_id, membros } = body

    // Atualizar dados básicos do grupo
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos')
      .update({
        nome,
        superintendente_id: superintendente_id || null,
        servo_id: servo_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (grupoError) {
      console.error('Erro ao atualizar grupo:', grupoError)
      return NextResponse.json(
        { error: 'Erro ao atualizar grupo' },
        { status: 500 }
      )
    }

    // Atualizar membros se fornecidos
    if (membros !== undefined) {
      // Remover todos os membros atuais
      await supabase
        .from('grupo_publicadores')
        .delete()
        .eq('grupo_id', id)

      // Adicionar novos membros
      if (membros.length > 0) {
        const membrosData = membros.map((publicadorId: string) => ({
          grupo_id: id,
          publicador_id: publicadorId
        }))

        const { error: membrosError } = await supabase
          .from('grupo_publicadores')
          .insert(membrosData)

        if (membrosError) {
          console.error('Erro ao atualizar membros:', membrosError)
        }
      }
    }

    return NextResponse.json(grupo)
  } catch (error) {
    console.error('Erro na API de grupos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Primeiro, remover todos os membros do grupo
    await supabase
      .from('grupo_publicadores')
      .delete()
      .eq('grupo_id', id)

    // Depois, excluir o grupo
    const { error: grupoError } = await supabase
      .from('grupos')
      .delete()
      .eq('id', id)

    if (grupoError) {
      console.error('Erro ao excluir grupo:', grupoError)
      return NextResponse.json(
        { error: 'Erro ao excluir grupo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Grupo excluído com sucesso' })
  } catch (error) {
    console.error('Erro na API de grupos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}