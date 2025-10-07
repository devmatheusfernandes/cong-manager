import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAndCleanNVCData } from '@/lib/nvc-schema-validator';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando salvamento no Supabase...');
    const body = await request.json();
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2));
    
    // Validar os dados
    const validation = validateAndCleanNVCData(body);
    console.log('✅ Validação:', validation.valid ? 'SUCESSO' : 'FALHOU');
    
    if (!validation.valid) {
      console.log('❌ Erros de validação:', validation.errors);
      return NextResponse.json({
        success: false,
        errors: validation.errors
      }, { status: 400 });
    }

    // Buscar ou criar congregação padrão
    console.log('🏛️ Buscando congregação padrão...');
    let { data: congregacao, error: congregacaoError } = await supabase
      .from('congregacoes')
      .select('id')
      .limit(1)
      .single();

    if (congregacaoError || !congregacao) {
      console.log('📝 Criando congregação padrão...');
      const { data: novaCongregacao, error: criarError } = await supabase
        .from('congregacoes')
        .insert({ nome: 'Congregação Padrão', endereco: 'Endereço da Congregação' })
        .select('id')
        .single();
      
      if (criarError) {
        console.log('❌ Erro ao criar congregação:', criarError);
        return NextResponse.json({ error: 'Erro ao criar congregação padrão' }, { status: 500 });
      }
      
      congregacao = novaCongregacao;
    }

    console.log('✅ Congregação encontrada/criada:', congregacao.id);

    const savedReunioes = [];
    const errors = [];

    // Salvar cada reunião no banco de dados
    console.log(`📝 Processando ${validation.cleanedData!.nossa_vida_crista.length} reuniões...`);
    for (const reuniao of validation.cleanedData!.nossa_vida_crista) {
      try {
        console.log(`🔄 Processando reunião: ${reuniao.periodo}`);
        
        // Buscar IDs dos publicadores por nome
        const nomes = [
          reuniao.presidente?.nome,
          reuniao.oracoes?.inicial?.nome,
          reuniao.oracoes?.final?.nome,
          reuniao.tesourosPalavra?.responsavel?.nome,
          reuniao.tesourosPalavra?.joiasEspirituais?.responsavel?.nome,
          reuniao.tesourosPalavra?.leituraBiblica?.responsavel?.nome,
          ...(reuniao.facaSeuMelhor?.map(p => p.responsavel?.nome) || []),
          ...(reuniao.facaSeuMelhor?.map(p => p.ajudante?.nome) || []),
          ...(reuniao.nossaVidaCrista?.map(p => p.responsavel?.nome) || [])
        ].filter(Boolean);
        
        console.log('👥 Nomes para buscar IDs:', nomes);
        const publicadorIds = await buscarPublicadorIds(nomes);

        // Verificar se a reunião já existe para este período e congregação
        console.log('🔍 Verificando se reunião já existe...');
        const { data: reuniaoExistente, error: buscarError } = await supabase
          .from('reunioes_nvc')
          .select('id')
          .eq('congregacao_id', congregacao.id)
          .eq('periodo', reuniao.periodo)
          .single();

        if (buscarError && buscarError.code !== 'PGRST116') {
          console.log('❌ Erro ao buscar reunião existente:', buscarError);
          errors.push(`Erro ao verificar reunião ${reuniao.periodo}: ${buscarError.message}`);
          continue;
        }

        const reuniaoData = {
          congregacao_id: congregacao.id,
          periodo: reuniao.periodo,
          leitura_biblica: reuniao.leituraBiblica,
          presidente_id: publicadorIds[reuniao.presidente?.nome || ''],
          oracao_inicial_id: publicadorIds[reuniao.oracoes?.inicial?.nome || ''],
          oracao_final_id: publicadorIds[reuniao.oracoes?.final?.nome || ''],
          cantico_inicial: reuniao.canticos?.inicial,
          cantico_intermediario: reuniao.canticos?.intermediario,
          cantico_final: reuniao.canticos?.final,
          comentarios_iniciais: reuniao.comentarios?.iniciais,
          comentarios_finais: reuniao.comentarios?.finais,
          tesouros_titulo: reuniao.tesourosPalavra?.titulo,
          tesouros_duracao: reuniao.tesourosPalavra?.duracao,
          tesouros_responsavel_id: publicadorIds[reuniao.tesourosPalavra?.responsavel?.nome || ''],
          joias_texto: reuniao.tesourosPalavra?.joiasEspirituais?.texto,
          joias_pergunta: reuniao.tesourosPalavra?.joiasEspirituais?.pergunta,
          joias_referencia: reuniao.tesourosPalavra?.joiasEspirituais?.referencia,
          joias_duracao: reuniao.tesourosPalavra?.joiasEspirituais?.duracao,
          joias_responsavel_id: publicadorIds[reuniao.tesourosPalavra?.joiasEspirituais?.responsavel?.nome || ''],
          leitura_biblica_texto: reuniao.tesourosPalavra?.leituraBiblica?.texto,
          leitura_biblica_duracao: reuniao.tesourosPalavra?.leituraBiblica?.duracao,
          leitura_biblica_responsavel_id: publicadorIds[reuniao.tesourosPalavra?.leituraBiblica?.responsavel?.nome || ''],
          evento_especial: reuniao.eventoEspecial,
          semana_visita_superintendente: reuniao.semanaVisitaSuperintendente,
          dia_terca: reuniao.diaTerca
        };

        let reuniaoResult;

        if (reuniaoExistente) {
          // Atualizar reunião existente
          console.log('🔄 Atualizando reunião existente...');
          const { data: updatedReuniao, error: updateError } = await supabase
            .from('reunioes_nvc')
            .update(reuniaoData)
            .eq('id', reuniaoExistente.id)
            .select()
            .single();

          if (updateError) {
            console.log('❌ Erro ao atualizar reunião:', updateError);
            errors.push(`Erro ao atualizar reunião ${reuniao.periodo}: ${updateError.message}`);
            continue;
          }

          reuniaoResult = updatedReuniao;
          console.log('✅ Reunião atualizada com sucesso:', reuniaoResult.id);

          // Remover partes antigas antes de inserir as novas
          await supabase.from('faca_seu_melhor_partes').delete().eq('reuniao_nvc_id', reuniaoResult.id);
          await supabase.from('nossa_vida_crista_partes').delete().eq('reuniao_nvc_id', reuniaoResult.id);

        } else {
          // Inserir nova reunião
          console.log('💾 Inserindo nova reunião...');
          const { data: newReuniao, error: insertError } = await supabase
            .from('reunioes_nvc')
            .insert(reuniaoData)
            .select()
            .single();

          if (insertError) {
            console.log('❌ Erro ao inserir reunião:', insertError);
            errors.push(`Erro ao salvar reunião ${reuniao.periodo}: ${insertError.message}`);
            continue;
          }

          reuniaoResult = newReuniao;
          console.log('✅ Reunião inserida com sucesso:', reuniaoResult.id);
        }
        
        console.log('✅ Reunião inserida com sucesso:', reuniaoResult.id);

        // Inserir partes "Faça seu Melhor"
        if (reuniao.facaSeuMelhor && reuniao.facaSeuMelhor.length > 0) {
          const facaSeuMelhorPartes = reuniao.facaSeuMelhor.map((parte, index) => ({
            reuniao_nvc_id: reuniaoResult.id,
            ordem: index + 1,
            tipo: parte.tipo,
            duracao: parte.duracao,
            descricao: parte.descricao,
            responsavel_id: publicadorIds[parte.responsavel?.nome || ''],
            ajudante_id: publicadorIds[parte.ajudante?.nome || '']
          }));

          const { error: facaSeuMelhorError } = await supabase
            .from('faca_seu_melhor_partes')
            .insert(facaSeuMelhorPartes);

          if (facaSeuMelhorError) {
            errors.push(`Erro ao salvar partes "Faça seu Melhor" da reunião ${reuniao.periodo}: ${facaSeuMelhorError.message}`);
          }
        }

        // Inserir partes "Nossa Vida Cristã"
        if (reuniao.nossaVidaCrista && reuniao.nossaVidaCrista.length > 0) {
          const nossaVidaCristaPartes = reuniao.nossaVidaCrista.map((parte, index) => ({
            reuniao_nvc_id: reuniaoResult.id,
            ordem: index + 1,
            tipo: parte.tipo,
            duracao: parte.duracao,
            conteudo: parte.conteudo,
            responsavel_id: publicadorIds[parte.responsavel?.nome || '']
          }));

          const { error: nossaVidaCristaError } = await supabase
            .from('nossa_vida_crista_partes')
            .insert(nossaVidaCristaPartes);

          if (nossaVidaCristaError) {
            errors.push(`Erro ao salvar partes "Nossa Vida Cristã" da reunião ${reuniao.periodo}: ${nossaVidaCristaError.message}`);
          }
        }

        savedReunioes.push({
          id: reuniaoResult.id,
          periodo: reuniao.periodo
        });

      } catch (error) {
        errors.push(`Erro ao processar reunião ${reuniao.periodo}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedReunioes.length} reuniões salvas com sucesso`,
      savedReunioes,
      errors: errors.length > 0 ? errors : undefined,
      warnings: validation.warnings
    });

  } catch (error) {
    console.error('Erro ao salvar reuniões NVC:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Função auxiliar para buscar IDs dos publicadores
async function buscarPublicadorIds(nomes: (string | undefined)[]): Promise<Record<string, string>> {
  const nomesUnicos = [...new Set(nomes.filter(Boolean))];
  
  if (nomesUnicos.length === 0) {
    return {};
  }

  const { data: publicadores, error } = await supabase
    .from('publicadores')
    .select('id, nome')
    .in('nome', nomesUnicos);

  if (error) {
    console.error('Erro ao buscar publicadores:', error);
    return {};
  }

  const publicadorMap: Record<string, string> = {};
  publicadores?.forEach(pub => {
    publicadorMap[pub.nome] = pub.id;
  });

  return publicadorMap;
}