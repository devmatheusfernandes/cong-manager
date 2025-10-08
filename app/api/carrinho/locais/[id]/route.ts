import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar local específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: local, error } = await supabase
      .from('locais_carrinho')
      .select(`
        *,
        horarios:carrinho_horarios(*)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single()

    if (error) {
      console.error('Erro ao buscar local:', error)
      return NextResponse.json(
        { error: 'Local não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(local)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar local
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, endereco } = body

    // Validação básica
    if (!nome || !endereco) {
      return NextResponse.json(
        { error: 'Nome e endereço são obrigatórios' },
        { status: 400 }
      )
    }

    const { data: local, error } = await supabase
      .from('locais_carrinho')
      .update({
        nome,
        endereco,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar local:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar local' },
        { status: 500 }
      )
    }

    return NextResponse.json(local)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Primeiro, exclua todas as escalas associadas a este local
    // Isso requer buscar todos os horários associados ao local
    const { data: horarios, error: horariosError } = await supabase
      .from("carrinho_horarios")
      .select("id")
      .eq("local_id", id);

    if (horariosError) {
      console.error("Erro ao buscar horários associados:", horariosError);
      return NextResponse.json(
        { error: "Erro ao excluir escalas associadas" },
        { status: 500 }
      );
    }

    if (horarios && horarios.length > 0) {
      const horarioIds = horarios.map((horario) => horario.id);
      const { error: escalasError } = await supabase
        .from("carrinho_escalas")
        .delete()
        .in("horario_id", horarioIds);

      if (escalasError) {
        console.error("Erro ao excluir escalas associadas:", escalasError);
        return NextResponse.json(
          { error: "Erro ao excluir escalas associadas" },
          { status: 500 }
        );
      }
    }

    // Em seguida, exclua todos os horários associados a este local
    const { error: deleteHorariosError } = await supabase
      .from("carrinho_horarios")
      .delete()
      .eq("local_id", id);

    if (deleteHorariosError) {
      console.error("Erro ao excluir horários associados:", deleteHorariosError);
      return NextResponse.json(
        { error: "Erro ao excluir horários associados" },
        { status: 500 }
      );
    }

    // Finalmente, exclua o local
    const { error } = await supabase
      .from("locais_carrinho")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir local:", error);
      return NextResponse.json(
        { error: "Erro ao excluir local" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Local excluído com sucesso" });
  } catch (error) {
    console.error("Erro inesperado ao excluir local:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}