import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAndCleanDiscursosData } from '@/lib/discursos-schema-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Dados recebidos no endpoint save:', JSON.stringify(body, null, 2));
    
    // Validar e limpar dados
    const validation = validateAndCleanDiscursosData(body);
    console.log('✅ Resultado da validação:', validation);
    
    if (!validation.success || !validation.data) {
      console.log('❌ Validação falhou:', validation.errors);
      return NextResponse.json({
        success: false,
        errors: validation.errors
      }, { status: 400 });
    }

    // Processar discursos diretamente

    const savedDiscursos = [];
    const errors = [];

    console.log(`🔄 Processando ${validation.data.discursos.length} discursos...`);

    // Processar cada discurso
    for (let i = 0; i < validation.data.discursos.length; i++) {
      const discurso = validation.data.discursos[i];
      console.log(`📝 Processando discurso ${i + 1}:`, discurso);
      
      try {
        // Primeiro, criar ou encontrar o orador
        console.log(`🔍 Procurando orador: ${discurso.orador}`);
        let { data: orador, error: oradorError } = await supabase
          .from('oradores')
          .select('id')
          .eq('nome', discurso.orador)
          .single();

        if (oradorError && oradorError.code !== 'PGRST116') {
          console.log('❌ Erro ao buscar orador:', oradorError);
          errors.push(`Erro ao buscar orador ${discurso.orador}: ${oradorError.message}`);
          continue;
        }

        if (!orador) {
          // Criar novo orador
          console.log(`➕ Criando novo orador: ${discurso.orador}`);
          const { data: novoOrador, error: createOradorError } = await supabase
            .from('oradores')
            .insert([{
              nome: discurso.orador,
              congregacao_origem: 'Externa' // Valor padrão
            }])
            .select('id')
            .single();

          if (createOradorError || !novoOrador) {
            console.log('❌ Erro ao criar orador:', createOradorError);
            errors.push(`Erro ao criar orador ${discurso.orador}: ${createOradorError?.message}`);
            continue;
          }

          orador = novoOrador;
          console.log(`✅ Orador criado com ID: ${orador.id}`);
        } else {
          console.log(`✅ Orador encontrado com ID: ${orador.id}`);
        }

        // Verificar se discurso já existe na mesma data com o mesmo orador
        console.log(`🔍 Verificando se discurso na data ${discurso.data} com orador ${orador.id} já existe...`);
        const { data: existingDiscurso, error: checkError } = await supabase
          .from('discursos')
          .select('id')
          .eq('data', discurso.data)
          .eq('orador_id', orador.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.log('❌ Erro ao verificar discurso existente:', checkError);
          errors.push(`Erro ao verificar discurso na data ${discurso.data}: ${checkError.message}`);
          continue;
        }

        if (existingDiscurso) {
          console.log(`⚠️ Discurso na data ${discurso.data} com orador ${discurso.orador} já existe`);
          errors.push(`Discurso na data ${discurso.data} com orador ${discurso.orador} já existe`);
          continue;
        }

        // Inserir discurso com a estrutura correta
        const discursoData = {
          orador_id: orador.id,
          tema: discurso.tema,
          data: discurso.data,
          cantico: discurso.cantico,
          hospitalidade: discurso.hospitalidade,
          tem_imagem: false
        };
        
        console.log(`💾 Inserindo discurso:`, discursoData);
        
        const { data: novoDiscurso, error: discursoError } = await supabase
          .from('discursos')
          .insert([discursoData])
          .select()
          .single();

        if (discursoError) {
          console.log(`❌ Erro ao salvar discurso na data ${discurso.data}:`, discursoError);
          errors.push(`Erro ao salvar discurso na data ${discurso.data}: ${discursoError.message}`);
          continue;
        }

        console.log(`✅ Discurso salvo com sucesso:`, novoDiscurso);
        savedDiscursos.push(novoDiscurso);

      } catch (error) {
        console.log(`❌ Erro ao processar discurso na data ${discurso.data}:`, error);
        errors.push(`Erro ao processar discurso na data ${discurso.data}: ${error}`);
      }
    }

    console.log(`📊 Resultado final: ${savedDiscursos.length} salvos, ${errors.length} erros`);
    console.log('✅ Discursos salvos:', savedDiscursos.map(d => ({ 
      id: d.id, 
      data: d.data, 
      orador_id: d.orador_id,
      tema: d.tema,
      hospitalidade: d.hospitalidade 
    })));
    console.log('❌ Erros encontrados:', errors);

    const response = {
      success: true,
      message: `${savedDiscursos.length} discursos salvos com sucesso`,
      total_salvos: savedDiscursos.length,
      total_erros: errors.length,
      erros: errors.length > 0 ? errors : undefined,
      discursos: savedDiscursos
    };

    console.log('📤 Resposta enviada:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro no endpoint de save:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}