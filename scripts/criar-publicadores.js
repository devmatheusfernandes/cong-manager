// Script para criar publicadores no banco de dados
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço para operações admin

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

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

async function criarPublicadores() {
  try {
    console.log('🔍 Buscando congregação padrão...');
    
    // Buscar a primeira congregação disponível
    const { data: congregacoes, error: congregacaoError } = await supabase
      .from('congregacoes')
      .select('id, nome')
      .limit(1);

    if (congregacaoError) {
      console.error('❌ Erro ao buscar congregação:', congregacaoError);
      return;
    }

    if (!congregacoes || congregacoes.length === 0) {
      console.error('❌ Nenhuma congregação encontrada. Crie uma congregação primeiro.');
      return;
    }

    const congregacao = congregacoes[0];
    console.log(`✅ Usando congregação: ${congregacao.nome} (ID: ${congregacao.id})`);

    console.log(`📝 Inserindo ${publicadores.length} publicadores...`);

    // Preparar dados para inserção
    const dadosParaInserir = publicadores.map(pub => ({
      congregacao_id: congregacao.id,
      nome: pub.nome,
      genero: pub.genero,
      privilegio: pub.privilegio,
      telefone: null,
      email: null
    }));

    // Inserir todos os publicadores de uma vez
    const { data, error } = await supabase
      .from('publicadores')
      .insert(dadosParaInserir)
      .select('id, nome, privilegio');

    if (error) {
      console.error('❌ Erro ao inserir publicadores:', error);
      return;
    }

    console.log(`✅ ${data.length} publicadores criados com sucesso!`);
    
    // Mostrar resumo por privilégio
    const resumo = data.reduce((acc, pub) => {
      acc[pub.privilegio] = (acc[pub.privilegio] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Resumo por privilégio:');
    Object.entries(resumo).forEach(([privilegio, quantidade]) => {
      console.log(`   ${privilegio}: ${quantidade}`);
    });

    console.log('\n🎉 Script executado com sucesso!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
criarPublicadores();