import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const congregacaoId = searchParams.get('congregacao_id');

    let query = supabase
      .from('reunioes_nvc')
      .select(`
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
      `)
      .order('periodo', { ascending: true });

    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId);
    }

    const { data: reunioes, error } = await query;

    if (error) {
      console.error('Erro ao buscar reuniões NVC:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar reuniões'
      }, { status: 500 });
    }

    // Transformar os dados para o formato esperado pelo frontend
    const reunioesFormatadas = reunioes?.map(reuniao => ({
      id: reuniao.id,
      congregacao_id: reuniao.congregacao_id,
      periodo: reuniao.periodo,
      leituraBiblica: reuniao.leitura_biblica,
      presidente: reuniao.presidente,
      oracoes: {
        inicial: reuniao.oracao_inicial,
        final: reuniao.oracao_final
      },
      canticos: {
        inicial: reuniao.cantico_inicial,
        intermediario: reuniao.cantico_intermediario,
        final: reuniao.cantico_final
      },
      comentarios: {
        iniciais: reuniao.comentarios_iniciais,
        finais: reuniao.comentarios_finais
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
          responsavel: reuniao.joias_responsavel
        },
        leituraBiblica: {
          texto: reuniao.leitura_biblica_texto,
          duracao: reuniao.leitura_biblica_duracao,
          responsavel: reuniao.leitura_biblica_responsavel
        }
      },
      facaSeuMelhor: reuniao.faca_seu_melhor_partes
        ?.sort((a: { ordem: number; }, b: { ordem: number; }) => a.ordem - b.ordem)
        .map((parte: { tipo: any; duracao: any; descricao: any; responsavel: any; ajudante: any; }) => ({
          tipo: parte.tipo,
          duracao: parte.duracao,
          descricao: parte.descricao,
          responsavel: parte.responsavel,
          ajudante: parte.ajudante
        })) || [],
      nossaVidaCrista: reuniao.nossa_vida_crista_partes
        ?.sort((a: { ordem: number; }, b: { ordem: number; }) => a.ordem - b.ordem)
        .map((parte: { tipo: any; duracao: any; conteudo: any; responsavel: any; }) => ({
          tipo: parte.tipo,
          duracao: parte.duracao,
          conteudo: parte.conteudo,
          responsavel: parte.responsavel
        })) || [],
      eventoEspecial: reuniao.evento_especial,
      semanaVisitaSuperintendente: reuniao.semana_visita_superintendente,
      diaTerca: reuniao.dia_terca,
      created_at: reuniao.created_at,
      updated_at: reuniao.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        nossa_vida_crista: reunioesFormatadas
      }
    });

  } catch (error) {
    console.error('Erro ao buscar reuniões NVC:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}