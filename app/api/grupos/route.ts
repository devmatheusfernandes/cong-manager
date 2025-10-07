import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todos os grupos
export async function GET() {
  try {
    // Buscar todos os grupos
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos')
      .select(`
        *,
        superintendente:publicadores!grupos_superintendente_id_fkey(id, nome, telefone, email, privilegio),
        servo:publicadores!grupos_servo_id_fkey(id, nome, telefone, email, privilegio),
        ajudante:publicadores!grupos_ajudante_id_fkey(id, nome, telefone, email, privilegio)
      `)
      .order('nome')

    if (gruposError) {
      console.error('Erro ao buscar grupos:', gruposError)
      return NextResponse.json(
        { error: 'Erro ao buscar grupos' },
        { status: 500 }
      )
    }

    // Para cada grupo, buscar os membros
    const gruposComMembros = await Promise.all(
      grupos.map(async (grupo) => {
        const { data: membros, error: membrosError } = await supabase
          .from('grupo_publicadores')
          .select(`
            publicador:publicadores(id, nome, telefone, email, privilegio)
          `)
          .eq('grupo_id', grupo.id)

        if (membrosError) {
          console.error('Erro ao buscar membros do grupo:', membrosError)
          return { ...grupo, membros: [] }
        }

        return {
          ...grupo,
          membros: membros.map(m => m.publicador)
        }
      })
    )

    return NextResponse.json(gruposComMembros)
  } catch (error) {
    console.error('Erro na API de grupos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, superintendente_id, servo_id, ajudante_id, membros } = body

    if (!nome) {
      return NextResponse.json(
        { error: 'nome é obrigatório' },
        { status: 400 }
      )
    }

    // Validações de negócio
    if (superintendente_id && servo_id) {
      return NextResponse.json(
        { error: 'Um grupo deve ter um superintendente OU um servo de grupo, nunca ambos' },
        { status: 400 }
      )
    }

    if (!superintendente_id && !servo_id) {
      return NextResponse.json(
        { error: 'Um grupo deve ter pelo menos um superintendente ou servo de grupo' },
        { status: 400 }
      )
    }

    // Validar privilégios se IDs foram fornecidos
    if (superintendente_id) {
      const { data: superintendente } = await supabase
        .from('publicadores')
        .select('privilegio')
        .eq('id', superintendente_id)
        .single()

      if (!superintendente || superintendente.privilegio !== 'anciao') {
        return NextResponse.json(
          { error: 'Apenas anciãos podem ser superintendentes de grupo' },
          { status: 400 }
        )
      }
    }

    if (servo_id) {
      const { data: servo } = await supabase
        .from('publicadores')
        .select('privilegio')
        .eq('id', servo_id)
        .single()

      if (!servo || servo.privilegio !== 'servo_ministerial') {
        return NextResponse.json(
          { error: 'Apenas servos ministeriais podem ser servos de grupo' },
          { status: 400 }
        )
      }
    }

    // ID da congregação padrão (pode ser obtido do contexto do usuário no futuro)
    const congregacao_id = '660e8400-e29b-41d4-a716-446655440001'

    // Criar o grupo
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos')
      .insert({
        nome,
        congregacao_id,
        superintendente_id: superintendente_id || null,
        servo_id: servo_id || null,
        ajudante_id: ajudante_id || null,
      })
      .select()
      .single()

    if (grupoError) {
      console.error('Erro ao criar grupo:', grupoError)
      return NextResponse.json(
        { error: 'Erro ao criar grupo' },
        { status: 500 }
      )
    }

    // Adicionar membros ao grupo se fornecidos
    if (membros && membros.length > 0) {
      const membrosData = membros.map((publicadorId: string) => ({
        grupo_id: grupo.id,
        publicador_id: publicadorId
      }))

      const { error: membrosError } = await supabase
        .from('grupo_publicadores')
        .insert(membrosData)

      if (membrosError) {
        console.error('Erro ao adicionar membros:', membrosError)
        // Não retorna erro aqui, pois o grupo já foi criado
      }
    }

    return NextResponse.json(grupo, { status: 201 })
  } catch (error) {
    console.error('Erro na API de grupos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}