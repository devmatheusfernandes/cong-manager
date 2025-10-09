import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateAndCleanMecanicasData } from '@/lib/mecanicas-schema-validator';
import { PUBLICADORES_PROMPT_LIST } from '@/lib/publicadores-data';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const PROMPT = `Analise o documento PDF fornecido, que contém designações mecânicas para reuniões religiosas. Extraia as informações de cada data (data, tipo de reunião, designações de pessoas) e formate-as em uma estrutura JSON.

O JSON principal deve ser um objeto com uma única chave "designacoes_mecanicas", que contém um array de objetos. Cada objeto nesse array deve representar uma designação para uma data específica e seguir esta estrutura EXATA:

{
  "designacoes_mecanicas": [
    {
      "id": "",
      "data": "sábado, 4 de outubro",
      "tipo_reuniao": "fim_semana",
      "presidente": { "nome": "Nome da Pessoa", "id": "uuid-da-pessoa" },
      "leitor": { "nome": "Nome da Pessoa", "id": "uuid-da-pessoa" },
      "indicador_entrada": { "nome": "Nome da Pessoa", "id": "uuid-da-pessoa" },
      "indicador_auditorio": { "nome": "Nome da Pessoa", "id": "uuid-da-pessoa" },
      "audio_video": { "nome": "Nome da Pessoa", "id": "uuid-da-pessoa" },
      "volante": { "nome": "Nome da Pessoa", "id": "uuid-da-pessoa" },
      "palco": { "nome": "Nome da Pessoa", "id": "uuid-da-pessoa" }
    }
  ]
}

CAMPOS OBRIGATÓRIOS:
- id: SEMPRE string vazia ""
- data: A data completa da reunião (ex: "sábado, 4 de outubro", "quarta-feira, 8 de outubro")
- tipo_reuniao: DEVE ser EXATAMENTE "meio_semana" ou "fim_semana"

REGRAS CRÍTICAS PARA tipo_reuniao:
- Se a data contém "segunda", "terça", "quarta", "quinta" ou "sexta" → tipo_reuniao = "meio_semana"
- Se a data contém "sábado" ou "domingo" → tipo_reuniao = "fim_semana"
- NUNCA use outros valores além de "meio_semana" ou "fim_semana"

CAMPOS DE PESSOAS (todos opcionais):
- Se uma pessoa não estiver designada, use null (não um objeto vazio)
- Se uma pessoa estiver designada, use: { "nome": "Nome Exato", "id": "uuid-correspondente" }
- Para o campo "id", você DEVE buscar o nome na lista de publicadores abaixo e usar o UUID correspondente
- Se o nome não for encontrado na lista, use string vazia ""

LISTA DE PUBLICADORES DISPONÍVEIS (Nome → UUID):
{
  ${PUBLICADORES_PROMPT_LIST}
}

REGRAS PARA MAPEAMENTO DE NOMES:
1. Faça busca EXATA primeiro pelo nome completo
2. Se não encontrar, tente busca parcial (ex: "Matheus" pode corresponder a "Matheus Fernandes")
3. Seja flexível com acentos e maiúsculas/minúsculas
4. Se não encontrar correspondência, deixe o id como string vazia ""
5. SEMPRE mantenha o nome original extraído do PDF no campo "nome"

EXEMPLOS DE MAPEAMENTO DE DIAS:
- "segunda-feira, 7 de outubro" → "meio_semana"
- "terça-feira, 8 de outubro" → "meio_semana"
- "quarta-feira, 9 de outubro" → "meio_semana"
- "quinta-feira, 10 de outubro" → "meio_semana"
- "sexta-feira, 11 de outubro" → "meio_semana"
- "sábado, 12 de outubro" → "fim_semana"
- "domingo, 13 de outubro" → "fim_semana"

EXEMPLO DE MAPEAMENTO DE PESSOA:
- Se no PDF aparece "Matheus" e na lista temos "Matheus Fernandes": 
  { "nome": "Matheus", "id": "bc268a45-97dc-4c16-a719-e2bbe04bf4d2" }
- Se no PDF aparece "João" e não está na lista:
  { "nome": "João", "id": "" }

IMPORTANTE: 
1. Retorne APENAS o JSON válido, sem texto adicional ou formatação markdown
2. Use aspas duplas para todas as strings
3. Certifique-se de que tipo_reuniao seja EXATAMENTE "meio_semana" ou "fim_semana"
4. Se não houver designação para uma pessoa, use null, não um objeto vazio
5. SEMPRE tente mapear os nomes para os UUIDs da lista fornecida`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo PDF foi enviado' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'O arquivo deve ser um PDF' },
        { status: 400 }
      );
    }

    // Converter o arquivo para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Configurar o modelo Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Preparar o conteúdo para o Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64,
        },
      },
      PROMPT,
    ]);

    const response = await result.response;
    const text = response.text();

    // Tentar fazer parse do JSON retornado
    let jsonData;
    try {
      // Remover possíveis marcações de código se existirem
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json(
        { 
          error: 'Erro ao processar a resposta do Gemini',
          details: 'O JSON retornado não é válido',
          rawResponse: text
        },
        { status: 500 }
      );
    }

    // Validar e limpar os dados usando o schema validator
    const validation = validateAndCleanMecanicasData(jsonData);
    
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Dados JSON inválidos',
          details: 'O JSON não atende aos requisitos do schema',
          validationErrors: validation.errors
        },
        { status: 400 }
      );
    }

    const apiResponse = {
      success: true,
      data: validation.cleanedData,
      message: `${validation.cleanedData!.designacoes_mecanicas.length} designações processadas com sucesso`
    };

    // Adicionar warnings se existirem
    if (validation.warnings.length > 0) {
      (apiResponse as any).warnings = validation.warnings;
    }

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}