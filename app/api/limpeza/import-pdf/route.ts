import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PUBLICADORES_PROMPT_LIST } from "@/lib/publicadores-data";
import { validateAndCleanLimpezaData } from "@/lib/limpeza-schema-validator";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const PROMPT = `
Você é um assistente especializado em extrair dados de escalas de limpeza de congregações das Testemunhas de Jeová.

Analise o PDF fornecido e extraia as informações da escala de limpeza em formato JSON.

ESTRUTURA ESPERADA DO JSON:
{
  "escalas": [
    {
      "grupo_id": "string", // Use "default" se não especificado
      "data_limpeza": "YYYY-MM-DD", // Data no formato ISO
      "publicadores": "string", // Nomes das pessoas/família responsável
      "observacoes": "string ou null" // Observações se houver
    }
  ]
}

LISTA DE PUBLICADORES DISPONÍVEIS:
${PUBLICADORES_PROMPT_LIST}

REGRAS PARA EXTRAÇÃO:

1. DATAS:
   - Converta datas em português para formato ISO (YYYY-MM-DD)
   - Exemplos: "sábado, 4 de outubro" → "2024-10-04"
   - "quarta-feira, 8 de outubro" → "2024-10-08"
   - Use o ano atual (2024) se não especificado
   - Ignore dias da semana, foque apenas no dia e mês

2. PUBLICADORES:
   - Extraia exatamente os nomes como aparecem no PDF
   - Mantenha nomes completos quando possível
   - Se houver múltiplas pessoas, separe por vírgula
   - Exemplos: "Juliane, Maria e Antônio", "Célio e Silvana"

3. GRUPO_ID:
   - Use "default" se não houver especificação de grupo
   - Se houver grupos específicos mencionados, use o nome do grupo

4. OBSERVAÇÕES:
   - Extraia qualquer observação adicional mencionada
   - Use null se não houver observações

5. FORMATO DE SAÍDA:
   - Retorne APENAS o JSON válido
   - Use aspas duplas para strings
   - Não inclua comentários ou texto adicional
   - Certifique-se de que todas as datas estão no formato correto

EXEMPLO DE ENTRADA:
"sábado, 4 de outubro - Juliane, Maria e Antônio"
"quarta-feira, 8 de outubro - Célio e Silvana"

EXEMPLO DE SAÍDA:
{
  "escalas": [
    {
      "grupo_id": "default",
      "data_limpeza": "2024-10-04",
      "publicadores": "Juliane, Maria e Antônio",
      "observacoes": null
    },
    {
      "grupo_id": "default", 
      "data_limpeza": "2024-10-08",
      "publicadores": "Célio e Silvana",
      "observacoes": null
    }
  ]
}

IMPORTANTE:
- Extraia TODAS as linhas das escalas de limpeza
- Mantenha a ordem cronológica
- Seja preciso com as datas
- Preserve os nomes exatamente como aparecem
- Retorne apenas JSON válido, sem texto adicional
`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      );
    }

    // Verificar se é PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são suportados" },
        { status: 400 }
      );
    }

    // Converter arquivo para base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Configurar o modelo Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Fazer a requisição para o Gemini
    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Tentar fazer parse do JSON
    let extractedData;
    try {
      // Remover possíveis caracteres extras antes e depois do JSON
      const cleanedText = text
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      console.error("Texto retornado:", text);
      return NextResponse.json(
        {
          error: "Erro ao processar resposta do AI",
          details: "Formato de resposta inválido",
          rawResponse: text,
        },
        { status: 500 }
      );
    }

    // Validar e limpar os dados
    const validation = validateAndCleanLimpezaData(extractedData);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Dados extraídos são inválidos",
          details: validation.errors,
          rawData: extractedData,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: validation.cleanedData,
      warnings: validation.warnings,
      message: `${validation.cleanedData?.escalas.length} escalas de limpeza extraídas com sucesso`,
    });
  } catch (error) {
    console.error("Erro na importação de PDF de limpeza:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
