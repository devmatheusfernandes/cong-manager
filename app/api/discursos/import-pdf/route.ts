import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DISCURSOS_GEMINI_PROMPT } from "@/lib/discursos-schema-validator";
import { validateAndCleanDiscursosData } from "@/lib/discursos-schema-validator";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

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
        { error: "Apenas arquivos PDF são aceitos" },
        { status: 400 }
      );
    }

    // Converter arquivo para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Configurar modelo Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    });

    // Preparar dados para o Gemini
    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: "application/pdf",
      },
    };

    console.log("Enviando PDF para análise do Gemini...");

    // Enviar para o Gemini
    const result = await model.generateContent([
      DISCURSOS_GEMINI_PROMPT,
      imagePart,
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("Resposta do Gemini:", text);

    // Tentar extrair JSON da resposta
    let jsonData;
    try {
      // Remover possíveis marcadores de código
      const cleanText = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      jsonData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      return NextResponse.json(
        {
          error: "Erro ao processar resposta do Gemini",
          details: "A resposta não é um JSON válido",
          geminiResponse: text,
        },
        { status: 500 }
      );
    }

    // Validar e limpar dados
    const validation = validateAndCleanDiscursosData(jsonData);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados extraídos são inválidos",
          details: validation.errors?.join(", ") || "Erro desconhecido",
          validationErrors: validation.errors || [],
          rawData: jsonData,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${
        validation.data!.discursos.length
      } discursos extraídos com sucesso`,
      data: validation.data,
    });
  } catch (error) {
    console.error("Erro no processamento:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Erro de configuração da API do Gemini" },
          { status: 500 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("limit")) {
        return NextResponse.json(
          { error: "Limite de uso da API do Gemini atingido" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
