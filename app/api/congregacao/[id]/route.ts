import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const congregacao_id = params.id;
    const body = await request.json();

    console.log("🔄 Atualizando congregação:", congregacao_id, body);

    // Validar dados obrigatórios
    if (!body.nome || !body.endereco) {
      return NextResponse.json(
        { error: "Nome e endereço são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar dados da congregação
    const { data: congregacao, error: updateError } = await supabase
      .from("congregacoes")
      .update({
        nome: body.nome,
        endereco: body.endereco,
        telefone: body.telefone || null,
        email: body.email || null,
        observacoes: body.observacoes || null,
        horario_reuniao_meio_semana: body.horario_reuniao_meio_semana || null,
        horario_reuniao_fim_semana: body.horario_reuniao_fim_semana || null,
        dia_reuniao_meio_semana: body.dia_reuniao_meio_semana || null,
        dia_reuniao_fim_semana: body.dia_reuniao_fim_semana || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", congregacao_id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Erro ao atualizar congregação:", updateError);
      return NextResponse.json(
        {
          error: "Erro ao atualizar congregação",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Congregação atualizada com sucesso");
    return NextResponse.json(congregacao);
  } catch (error) {
    console.error("❌ Erro interno do servidor:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const congregacao_id = params.id;

    console.log("🔍 Buscando congregação específica:", congregacao_id);

    // Buscar dados da congregação
    const { data: congregacao, error: congregacaoError } = await supabase
      .from("congregacoes")
      .select("*")
      .eq("id", congregacao_id)
      .single();

    if (congregacaoError) {
      console.error("❌ Erro ao buscar congregação:", congregacaoError);
      return NextResponse.json(
        {
          error: "Congregação não encontrada",
          details: congregacaoError.message,
        },
        { status: 404 }
      );
    }

    console.log("✅ Congregação encontrada com sucesso");
    return NextResponse.json(congregacao);
  } catch (error) {
    console.error("❌ Erro interno do servidor:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
