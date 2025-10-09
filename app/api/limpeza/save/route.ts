import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { findPublicadorByName } from "@/lib/publicadores-data";
import { validateAndCleanLimpezaData } from "@/lib/limpeza-schema-validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar os dados recebidos
    const validation = validateAndCleanLimpezaData(body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar dados da congregação
    const { data: congregacao, error: congregacaoError } = await supabase
      .from("congregacoes")
      .select("*")
      .single();

    let congregacaoId: string;
    
    if (congregacaoError || !congregacao) {
      // Criar congregação padrão se não existir
      const { data: novaCongregacao, error: createCongError } = await supabase
        .from("congregacoes")
        .insert([{ nome: "Congregação Padrão" }])
        .select("id")
        .single();

      if (createCongError || !novaCongregacao) {
        console.error("Erro ao criar congregação:", createCongError);
        return NextResponse.json(
          { error: "Erro ao criar congregação padrão" },
          { status: 500 }
        );
      }
      congregacaoId = novaCongregacao.id;
    } else {
      congregacaoId = congregacao.id;
    }

    const escalas = validation.cleanedData!.escalas;
    const resultados = [];
    const erros = [];

    // Função auxiliar para encontrar ou criar publicador
    async function findOrCreatePublicador(nome: string) {
      if (!nome) return null;

      // Primeiro, tentar encontrar o publicador pelo nome exato
      const { data: existingPublicador, error: searchError } = await supabase
        .from("publicadores")
        .select("id")
        .eq("nome", nome)
        .eq("congregacao_id", congregacaoId)
        .single();

      if (searchError && searchError.code !== "PGRST116") {
        console.error("Erro ao buscar publicador:", searchError);
        return null;
      }

      if (existingPublicador) {
        return existingPublicador.id;
      }

      // Tentar encontrar usando a função de busca por nome similar
      const publicadorEncontrado = findPublicadorByName(nome);
      if (publicadorEncontrado) {
        // Verificar se este publicador já existe no banco
        const { data: existingById, error: searchByIdError } = await supabase
          .from("publicadores")
          .select("id")
          .eq("id", publicadorEncontrado.id)
          .eq("congregacao_id", congregacaoId)
          .single();

        if (!searchByIdError && existingById) {
          return existingById.id;
        }
      }

      // Se não encontrou, criar novo publicador
      console.log(`Criando novo publicador: ${nome}`);
      const { data: newPublicador, error: createError } = await supabase
        .from("publicadores")
        .insert([
          {
            nome: nome,
            congregacao_id: congregacaoId,
            genero: "masculino", // Valor padrão - pode ser ajustado manualmente depois
            privilegio: "batizado", // Valor padrão
            ativo: true,
          },
        ])
        .select("id")
        .single();

      if (createError) {
        console.error("Erro ao criar publicador:", createError);
        return null;
      }

      console.log(`Publicador criado com sucesso: ${nome} (ID: ${newPublicador.id})`);
      return newPublicador.id;
    }

    // Processar cada escala de limpeza
    for (const escala of escalas) {
      try {
        // Verificar se já existe uma escala para esta data e grupo
        const { data: existingEscala, error: checkError } = await supabase
          .from("escala_limpeza")
          .select("id")
          .eq("data_limpeza", escala.data_limpeza)
          .eq("grupo_id", escala.grupo_id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Erro ao verificar escala existente:", checkError);
          erros.push(`Erro ao verificar escala para ${escala.data_limpeza}`);
          continue;
        }

        if (existingEscala) {
          erros.push(`Escala para ${escala.data_limpeza} (grupo: ${escala.grupo_id}) já existe`);
          continue;
        }

        // Processar publicadores - converter IDs para nomes se necessário
        const publicadoresProcessados = [];
        
        for (const publicadorId of escala.publicadores) {
          // Se já é um UUID válido, usar diretamente
          if (publicadorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            publicadoresProcessados.push(publicadorId);
          } else {
            // Se é um nome, tentar encontrar ou criar o publicador
            const publicadorIdEncontrado = await findOrCreatePublicador(publicadorId);
            if (publicadorIdEncontrado) {
              publicadoresProcessados.push(publicadorIdEncontrado);
            }
          }
        }

        if (publicadoresProcessados.length === 0) {
          erros.push(`Nenhum publicador válido encontrado para escala de ${escala.data_limpeza}`);
          continue;
        }

        // Inserir a escala de limpeza
        const { data: novaEscala, error: insertError } = await supabase
          .from("escala_limpeza")
          .insert([
            {
              grupo_id: escala.grupo_id,
              data_limpeza: escala.data_limpeza,
              publicadores: publicadoresProcessados,
              observacoes: escala.observacoes,
            },
          ])
          .select("*")
          .single();

        if (insertError) {
          console.error("Erro ao inserir escala:", insertError);
          erros.push(
            `Erro ao salvar escala para ${escala.data_limpeza}: ${insertError.message}`
          );
          continue;
        }

        resultados.push({
          data: escala.data_limpeza,
          grupo_id: escala.grupo_id,
          id: novaEscala.id,
          publicadores_count: publicadoresProcessados.length,
          status: "sucesso",
        });
      } catch (error) {
        console.error("Erro ao processar escala:", error);
        erros.push(`Erro ao processar escala para ${escala.data_limpeza}`);
      }
    }

    const response = {
      success: true,
      message: `${resultados.length} escalas de limpeza salvas com sucesso`,
      resultados,
      total_processadas: escalas.length,
      total_salvas: resultados.length,
    };

    if (erros.length > 0) {
      (response as any).erros = erros;
      (response as any).total_erros = erros.length;
    }

    if (validation.warnings.length > 0) {
      (response as any).warnings = validation.warnings;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao salvar escalas de limpeza:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}