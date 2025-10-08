import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const congregacaoId = searchParams.get("congregacao_id");
    const mes = searchParams.get("mes");

    let query = supabase.from("reunioes_nvc").select(`
        *,
        presidente:presidente_id(id, nome),
        oracao_inicial:oracao_inicial_id(id, nome),
        oracao_final:oracao_final_id(id, nome),
        tesouros_responsavel:tesouros_responsavel_id(id, nome),
        joias_responsavel:joias_responsavel_id(id, nome),
        leitura_biblica_responsavel:leitura_biblica_responsavel_id(id, nome),
        faca_seu_melhor_partes(
          *,
          responsavel:responsavel_id(id, nome),
          ajudante:ajudante_id(id, nome)
        ),
        nossa_vida_crista_partes(
          *,
          responsavel:responsavel_id(id, nome)
        )
      `);
    if (congregacaoId) {
      query = query.eq("congregacao_id", congregacaoId);
    }

    // Filtros de mês
    // Como o campo periodo é texto (ex: "1-7 DE SETEMBRO"), vamos filtrar por padrão de texto
    if (mes && mes !== "all") {
      // Filtrar por mês específico
      const meses = [
        "",
        "JANEIRO",
        "FEVEREIRO",
        "MARÇO",
        "ABRIL",
        "MAIO",
        "JUNHO",
        "JULHO",
        "AGOSTO",
        "SETEMBRO",
        "OUTUBRO",
        "NOVEMBRO",
        "DEZEMBRO",
      ];
      const nomeDoMes = meses[parseInt(mes)];
      if (nomeDoMes) {
        query = query.ilike("periodo", `%${nomeDoMes}%`);
      }
    }

    // Nota: O filtro de ano foi removido pois os dados atuais não contêm ano explícito no campo periodo

    const { data: reunioes, error } = await query;

    if (error) {
      console.error("Erro ao buscar reuniões NVC:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar reuniões",
        },
        { status: 500 }
      );
    }

    // Função para converter período textual em valor ordenável
    const parseDataPeriodo = (periodo: string): number => {
      const meses: { [key: string]: number } = {
        JANEIRO: 1,
        FEVEREIRO: 2,
        MARÇO: 3,
        ABRIL: 4,
        MAIO: 5,
        JUNHO: 6,
        JULHO: 7,
        AGOSTO: 8,
        SETEMBRO: 9,
        OUTUBRO: 10,
        NOVEMBRO: 11,
        DEZEMBRO: 12,
      };

      // Extrair o primeiro dia e o mês do período
      // Ex: "6-12 DE OUTUBRO" -> dia: 6, mês: 10
      const match = periodo.match(/(\d+)(?:-\d+)?\s+DE\s+(\w+)/);
      if (match) {
        const dia = parseInt(match[1]);
        const mesNome = match[2];
        const mesNumero = meses[mesNome] || 0;

        // Criar um valor ordenável: mês * 100 + dia
        // Ex: Outubro (10) dia 6 = 1006, Outubro dia 13 = 1013
        return mesNumero * 100 + dia;
      }

      return 0; // Fallback para períodos não reconhecidos
    };

    // Ordenar reuniões por data (mais recente primeiro)
    const reunioesOrdenadas =
      reunioes?.sort((a, b) => {
        const dataA = parseDataPeriodo(a.periodo);
        const dataB = parseDataPeriodo(b.periodo);
        return dataB - dataA; // Ordem decrescente (mais recente primeiro)
      }) || [];

    // Transformar os dados para o formato esperado pelo frontend
    const reunioesFormatadas =
      reunioesOrdenadas?.map((reuniao) => ({
        id: reuniao.id,
        congregacao_id: reuniao.congregacao_id,
        periodo: reuniao.periodo,
        leituraBiblica: reuniao.leitura_biblica,
        presidente: reuniao.presidente,
        oracoes: {
          inicial: reuniao.oracao_inicial,
          final: reuniao.oracao_final,
        },
        canticos: {
          inicial: reuniao.cantico_inicial,
          intermediario: reuniao.cantico_intermediario,
          final: reuniao.cantico_final,
        },
        comentarios: {
          iniciais: reuniao.comentarios_iniciais,
          finais: reuniao.comentarios_finais,
        },
        tesourosPalavra: {
          titulo: reuniao.tesouros_titulo,
          duracao: reuniao.tesouros_duracao,
          responsavel: reuniao.tesouros_responsavel,
          joiasEspirituais: {
            texto: reuniao.joias_texto,
            pergunta: reuniao.joias_pergunta,
            referencia: reuniao.joias_referencia,
            duracao: reuniao.joias_duracao,
            responsavel: reuniao.joias_responsavel,
          },
          leituraBiblica: {
            texto: reuniao.leitura_biblica_texto,
            duracao: reuniao.leitura_biblica_duracao,
            responsavel: reuniao.leitura_biblica_responsavel,
          },
        },
        facaSeuMelhor:
          reuniao.faca_seu_melhor_partes
            ?.sort(
              (a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem
            )
            .map(
              (parte: {
                tipo: any;
                duracao: any;
                descricao: any;
                responsavel: any;
                ajudante: any;
              }) => ({
                tipo: parte.tipo,
                duracao: parte.duracao,
                descricao: parte.descricao,
                responsavel: parte.responsavel,
                ajudante: parte.ajudante,
              })
            ) || [],
        nossaVidaCrista:
          reuniao.nossa_vida_crista_partes
            ?.sort(
              (a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem
            )
            .map(
              (parte: {
                tipo: any;
                duracao: any;
                conteudo: any;
                responsavel: any;
              }) => ({
                tipo: parte.tipo,
                duracao: parte.duracao,
                conteudo: parte.conteudo,
                responsavel: parte.responsavel,
              })
            ) || [],
        eventoEspecial: reuniao.evento_especial,
        semanaVisitaSuperintendente: reuniao.semana_visita_superintendente,
        diaTerca: reuniao.dia_terca,
        created_at: reuniao.created_at,
        updated_at: reuniao.updated_at,
      })) || [];

    return NextResponse.json({
      success: true,
      data: {
        nossa_vida_crista: reunioesFormatadas,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar reuniões NVC:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
