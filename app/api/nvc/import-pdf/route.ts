import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateAndCleanNVCData } from '@/lib/nvc-schema-validator';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const PROMPT = `Analise o documento PDF fornecido, que é uma apostila de reunião religiosa. Extraia as informações de cada semana (período, leitura bíblica, cânticos, discursos, etc.) e formate-as em uma estrutura JSON.

O JSON principal deve ser um objeto com uma única chave nossa_vida_crista, que contém um array de objetos. Cada objeto nesse array deve representar uma semana de reunião e seguir esta estrutura específica:

id: String (deixar em branco)
congregacao_id: String (deixar em branco)
periodo: A data da semana (ex: "1-7 de setembro")
leituraBiblica: O capítulo do livro da Bíblia para a semana (ex: "Provérbios 29")
presidente: Objeto com nome e id (deixar em branco)
oracoes: Objeto com inicial e final, cada um contendo nome e id (deixar em branco)
canticos: Objeto com inicial, intermediario e final
comentarios: Objeto com iniciais e finais (duração)
tesourosPalavra: Objeto contendo:
  titulo e duracao do discurso principal
  responsavel: Objeto com nome e id (deixar em branco)
  joiasEspirituais: Objeto com texto, pergunta, referencia, duracao e responsavel (deixar nome e id em branco)
  leituraBiblica: Objeto com texto, duracao e responsavel (deixar nome e id em branco)
facaSeuMelhor: Um array de objetos, onde cada objeto representa uma parte e contém tipo, duracao, descricao, responsavel e ajudante (deixar nome e id em branco)
nossaVidaCrista: Um array de objetos, onde cada objeto representa uma parte e contém tipo, duracao, conteudo (se aplicável) e responsavel (deixar nome e id em branco)
eventoEspecial: String (usar null se não houver)
semanaVisitaSuperintendente: Booleano
diaTerca: Booleano

Preencha todos os campos com os dados extraídos do PDF. Campos como nomes e IDs devem ser deixados como strings vazias ("").

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional ou formatação markdown.`;

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
    const validation = validateAndCleanNVCData(jsonData);
    
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
      message: `${validation.cleanedData!.nossa_vida_crista.length} reuniões processadas com sucesso`
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