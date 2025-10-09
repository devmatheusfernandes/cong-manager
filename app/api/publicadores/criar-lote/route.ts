import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de publicadores para inserir
const publicadores = [
  { nome: 'Bernardo', genero: 'masculino', privilegio: 'servo ministerial' },
  { nome: 'Cleria', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Eliseu', genero: 'masculino', privilegio: 'servo ministerial' },
  { nome: 'Adna', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Vilson', genero: 'masculino', privilegio: 'servo ministerial' },
  { nome: 'Isolde', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Loni', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Paulo', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Andrea', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Celio', genero: 'masculino', privilegio: 'ancião' },
  { nome: 'Silvana', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Rose', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Sebastiana', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Marta', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Volmir', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Samara', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Matheus', genero: 'masculino', privilegio: 'ancião' },
  { nome: 'Deise', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'José', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Mikael', genero: 'masculino', privilegio: 'não batizado' },
  { nome: 'Samuel', genero: 'masculino', privilegio: 'servo ministerial' },
  { nome: 'Cleito', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Daniele', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Davi', genero: 'masculino', privilegio: 'não batizado' },
  { nome: 'Juliane', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Maria', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Antonio', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Helmut', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Leunice', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Oscar', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Marcos', genero: 'masculino', privilegio: 'servo ministerial' },
  { nome: 'Teresinha', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Juninho', genero: 'masculino', privilegio: 'não batizado' },
  { nome: 'Célia', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Valdoir', genero: 'masculino', privilegio: 'publicador' },
  { nome: 'Arthur', genero: 'masculino', privilegio: 'não batizado' },
  { nome: 'Milene', genero: 'feminino', privilegio: 'publicador' },
  { nome: 'Joel', genero: 'masculino', privilegio: 'não batizado' }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Buscando congregação padrão...');
    
    // Buscar a primeira congregação disponível
    const { data: congregacoes, error: congregacaoError } = await supabase
      .from('congregacoes')
      .select('id, nome')
      .limit(1);

    if (congregacaoError) {
      console.error('❌ Erro ao buscar congregação:', congregacaoError);
      return NextResponse.json(
        { error: 'Erro ao buscar congregação', details: congregacaoError },
        { status: 500 }
      );
    }

    if (!congregacoes || congregacoes.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma congregação encontrada. Crie uma congregação primeiro.' },
        { status: 400 }
      );
    }

    const congregacao = congregacoes[0];
    console.log(`✅ Usando congregação: ${congregacao.nome} (ID: ${congregacao.id})`);

    // Verificar quais publicadores já existem
    const { data: publicadoresExistentes } = await supabase
      .from('publicadores')
      .select('nome')
      .eq('congregacao_id', congregacao.id);

    const nomesExistentes = new Set(
      publicadoresExistentes?.map(p => p.nome.toLowerCase()) || []
    );

    // Filtrar apenas publicadores que não existem
    const publicadoresNovos = publicadores.filter(
      pub => !nomesExistentes.has(pub.nome.toLowerCase())
    );

    if (publicadoresNovos.length === 0) {
      return NextResponse.json({
        message: 'Todos os publicadores já existem no banco de dados',
        total: publicadores.length,
        novos: 0,
        existentes: publicadores.length
      });
    }

    console.log(`📝 Inserindo ${publicadoresNovos.length} novos publicadores...`);

    // Preparar dados para inserção
    const dadosParaInserir = publicadoresNovos.map(pub => ({
      congregacao_id: congregacao.id,
      nome: pub.nome,
      genero: pub.genero,
      privilegio: pub.privilegio,
      telefone: null,
      email: null
    }));

    // Inserir os novos publicadores
    const { data, error } = await supabase
      .from('publicadores')
      .insert(dadosParaInserir)
      .select('id, nome, privilegio');

    if (error) {
      console.error('❌ Erro ao inserir publicadores:', error);
      return NextResponse.json(
        { error: 'Erro ao inserir publicadores', details: error },
        { status: 500 }
      );
    }

    // Calcular resumo por privilégio
    const resumo = data.reduce((acc: Record<string, number>, pub) => {
      acc[pub.privilegio] = (acc[pub.privilegio] || 0) + 1;
      return acc;
    }, {});

    console.log(`✅ ${data.length} publicadores criados com sucesso!`);

    return NextResponse.json({
      message: 'Publicadores criados com sucesso!',
      total: publicadores.length,
      novos: data.length,
      existentes: publicadores.length - publicadoresNovos.length,
      congregacao: congregacao.nome,
      resumoPorPrivilegio: resumo,
      publicadoresCriados: data.map(p => ({ nome: p.nome, privilegio: p.privilegio }))
    });

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error },
      { status: 500 }
    );
  }
}