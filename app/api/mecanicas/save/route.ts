import { NextRequest, NextResponse } from "next/server";
import { validateAndCleanMecanicasData } from "@/lib/mecanicas-schema-validator";
import { createClient } from "@supabase/supabase-js";

// Função para converter datas em português para formato ISO
function convertPortugueseDateToISO(dateString: string): string {
  const months: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
    'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
    'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  };

  // Extrair dia e mês da string (ex: "sábado, 4 de outubro")
  const regex = /(\d+)\s+de\s+(\w+)/;
  const match = dateString.match(regex);
  
  if (!match) {
    throw new Error(`Formato de data inválido: ${dateString}`);
  }

  const day = parseInt(match[1]);
  const monthName = match[2].toLowerCase();
  const month = months[monthName];
  
  if (month === undefined) {
    throw new Error(`Mês não reconhecido: ${monthName}`);
  }

  // Assumir ano atual (pode ser ajustado conforme necessário)
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, month, day);
  
  return date.toISOString().split('T')[0]; // Retorna apenas a parte da data (YYYY-MM-DD)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar os dados recebidos
    const validation = validateAndCleanMecanicasData(body);

    if (!validation.valid) {
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

    const designacoes = validation.cleanedData!.designacoes_mecanicas;
    const resultados = [];
    const erros = [];

    // Função auxiliar para encontrar ou criar publicador
    async function findOrCreatePublicador(pessoa: {
      nome: string;
      id: string;
    }) {
      if (!pessoa.nome) return null;

      // Primeiro, tentar encontrar o publicador pelo nome
      const { data: existingPublicador, error: searchError } = await supabase
        .from("publicadores")
        .select("id")
        .eq("nome", pessoa.nome)
        .eq("congregacao_id", congregacaoId)
        .single();

      if (searchError && searchError.code !== "PGRST116") {
        console.error("Erro ao buscar publicador:", searchError);
        return null;
      }

      if (existingPublicador) {
        return existingPublicador.id;
      }

      // Se não encontrou, criar novo publicador
      const { data: newPublicador, error: createError } = await supabase
        .from("publicadores")
        .insert([
          {
            nome: pessoa.nome,
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

      return newPublicador.id;
    }

    // Processar cada designação
    for (const designacao of designacoes) {
      try {
        // Converter data portuguesa para formato ISO
        const dataISO = convertPortugueseDateToISO(designacao.data);
        
        // Verificar se já existe uma designação para esta data
        const { data: existingDesignacao, error: checkError } = await supabase
          .from("mecanicas")
          .select("id")
          .eq("data", dataISO)
          .eq("tipo_reuniao", designacao.tipo_reuniao)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Erro ao verificar designação existente:", checkError);
          erros.push(`Erro ao verificar designação para ${designacao.data}`);
          continue;
        }

        if (existingDesignacao) {
          erros.push(`Designação para ${designacao.data} já existe`);
          continue;
        }

        // Encontrar ou criar publicadores para cada função
        const presidenteId = designacao.presidente
          ? await findOrCreatePublicador(designacao.presidente)
          : null;
        const leitorId = designacao.leitor
          ? await findOrCreatePublicador(designacao.leitor)
          : null;
        const indicadorEntradaId = designacao.indicador_entrada
          ? await findOrCreatePublicador(designacao.indicador_entrada)
          : null;
        const indicadorAuditorioId = designacao.indicador_auditorio
          ? await findOrCreatePublicador(designacao.indicador_auditorio)
          : null;
        const audioVideoId = designacao.audio_video
          ? await findOrCreatePublicador(designacao.audio_video)
          : null;
        const volanteId = designacao.volante
          ? await findOrCreatePublicador(designacao.volante)
          : null;
        const palcoId = designacao.palco
          ? await findOrCreatePublicador(designacao.palco)
          : null;

        // Inserir a designação mecânica
        const { data: novaDesignacao, error: insertError } = await supabase
          .from("mecanicas")
          .insert([
            {
              data: dataISO,
              tipo_reuniao: designacao.tipo_reuniao,
              presidente_id: presidenteId,
              leitor_sentinela_id: leitorId,
              indicador_entrada_id: indicadorEntradaId,
              indicador_auditorio_id: indicadorAuditorioId,
              audio_video_id: audioVideoId,
              volante_id: volanteId,
              palco_id: palcoId,
            },
          ])
          .select("*")
          .single();

        if (insertError) {
          console.error("Erro ao inserir designação:", insertError);
          erros.push(
            `Erro ao salvar designação para ${designacao.data}: ${insertError.message}`
          );
          continue;
        }

        resultados.push({
          data: designacao.data,
          id: novaDesignacao.id,
          status: "sucesso",
        });
      } catch (error) {
        console.error("Erro ao processar designação:", error);
        erros.push(`Erro ao processar designação para ${designacao.data}`);
      }
    }

    const response = {
      success: true,
      message: `${resultados.length} designações salvas com sucesso`,
      resultados,
      total_processadas: designacoes.length,
      total_salvas: resultados.length,
    };

    if (erros.length > 0) {
      (response as any).erros = erros;
      (response as any).total_erros = erros.length;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao salvar designações mecânicas:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
