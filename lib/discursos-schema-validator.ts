import { findPublicadorByName, PUBLICADORES_PROMPT_LIST } from './publicadores-data';

// Interface para discurso conforme Supabase
export interface Discurso {
  id?: string;
  orador: string; // Nome do orador
  tema: string; // Tema do discurso
  data: string; // Data no formato ISO (YYYY-MM-DD)
  cantico?: string | null; // Número do cântico
  hospitalidade?: string | null; // Nome da família que oferece hospitalidade
  tem_imagem?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface para dados de discursos vindos do PDF/JSON
export interface DiscursosData {
  discursos: Discurso[];
}

// Funções de validação básica
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Validação de um discurso individual
export function validateDiscurso(discurso: any): discurso is Discurso {
  if (!isObject(discurso)) return false;
  
  const obj = discurso as Record<string, any>;
  
  // Verificar campos obrigatórios
  if (!isString(obj.orador)) return false;
  if (!isString(obj.tema)) return false;
  if (!isString(obj.data)) return false;
  
  // Verificar campos opcionais
  if (obj.cantico !== undefined && obj.cantico !== null && !isString(obj.cantico)) return false;
  if (obj.hospitalidade !== undefined && obj.hospitalidade !== null && !isString(obj.hospitalidade)) return false;
  
  return true;
}

// Validação do schema completo de discursos
export function validateDiscursosSchema(data: any): data is DiscursosData {
  if (!isObject(data)) return false;
  
  const obj = data as Record<string, any>;
  if (!isArray(obj.discursos)) return false;
  
  return obj.discursos.every((discurso: any) => validateDiscurso(discurso));
}

// Função para converter datas em português para formato ISO
export function parseDataPortugues(dataStr: string): string {
  // Remove espaços extras
  const dataLimpa = dataStr.trim();
  
  // Verificar se já está no formato ISO (YYYY-MM-DD)
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(dataLimpa)) {
    // Validar se é uma data válida
    const date = new Date(dataLimpa);
    if (!isNaN(date.getTime())) {
      return dataLimpa;
    }
  }
  
  // Converter para lowercase para processamento
  const dataLimpaLower = dataLimpa.toLowerCase();
  
  // Mapeamento de meses em português
  const meses: { [key: string]: string } = {
    'janeiro': '01', 'jan': '01',
    'fevereiro': '02', 'fev': '02',
    'março': '03', 'mar': '03',
    'abril': '04', 'abr': '04',
    'maio': '05', 'mai': '05',
    'junho': '06', 'jun': '06',
    'julho': '07', 'jul': '07',
    'agosto': '08', 'ago': '08',
    'setembro': '09', 'set': '09',
    'outubro': '10', 'out': '10',
    'novembro': '11', 'nov': '11',
    'dezembro': '12', 'dez': '12'
  };
  
  // Regex para capturar diferentes formatos de data
  const patterns = [
    // "4 de outubro", "15 de novembro"
    /(\d{1,2})\s+de\s+(\w+)/,
    // "sábado, 4 de outubro", "quarta-feira, 8 de outubro"
    /\w+,?\s*(\d{1,2})\s+de\s+(\w+)/,
    // "4/10", "15/11"
    /(\d{1,2})\/(\d{1,2})/,
    // "04/10/2024", "15/11/2024"
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/
  ];
  
  const currentYear = new Date().getFullYear();
  
  for (const pattern of patterns) {
    const match = dataLimpaLower.match(pattern);
    if (match) {
      if (pattern.source.includes('de')) {
        // Formato com mês por extenso
        const dia = match[1].padStart(2, '0');
        const mesNome = match[2];
        const mes = meses[mesNome];
        
        if (mes) {
          return `${currentYear}-${mes}-${dia}`;
        }
      } else if (match[3]) {
        // Formato DD/MM/YYYY
        const dia = match[1].padStart(2, '0');
        const mes = match[2].padStart(2, '0');
        const ano = match[3];
        return `${ano}-${mes}-${dia}`;
      } else {
        // Formato DD/MM (assumir ano atual)
        const dia = match[1].padStart(2, '0');
        const mes = match[2].padStart(2, '0');
        return `${currentYear}-${mes}-${dia}`;
      }
    }
  }
  
  // Se não conseguir fazer parse, retornar data atual
  console.warn(`Não foi possível fazer parse da data: ${dataStr}`);
  return new Date().toISOString().split('T')[0];
}

// Função para limpar texto (remover espaços extras, etc.)
function limparTexto(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ');
}

// Função principal para validar e limpar dados de discursos
export function validateAndCleanDiscursosData(data: any): { 
  success: boolean; 
  data?: DiscursosData; 
  errors?: string[] 
} {
  const errors: string[] = [];
  
  // Validar estrutura geral
  if (!validateDiscursosSchema(data)) {
    errors.push("Dados não passaram na validação do schema");
    return { success: false, errors };
  }

  const typedData = data as Record<string, any>;
  const discursos: Discurso[] = [];

  // Processar cada discurso
  for (let i = 0; i < typedData.discursos.length; i++) {
    const discurso = typedData.discursos[i] as Record<string, any>;
    
    try {
      // Validar e processar data
      const dataProcessada = parseDataPortugues(discurso.data);
      if (!dataProcessada) {
        errors.push(`Discurso ${i + 1}: Data inválida "${discurso.data}"`);
        continue;
      }

      // Limpar campos de texto
      const orador = limparTexto(discurso.orador || '');
      const hospitalidade = discurso.hospitalidade ? limparTexto(discurso.hospitalidade) : '';

      // Criar discurso limpo
      const discursoLimpo: Discurso = {
        data: dataProcessada,
        orador: orador,
        tema: limparTexto(discurso.tema || ''),
        cantico: discurso.cantico?.toString().trim() || null,
        hospitalidade: hospitalidade || null
      };

      discursos.push(discursoLimpo);
    } catch (error) {
      errors.push(`Discurso ${i + 1}: Erro ao processar - ${error}`);
    }
  }

  if (discursos.length === 0) {
    errors.push('Nenhum discurso válido encontrado');
    return { success: false, errors };
  }

  return {
    success: true,
    data: { discursos }
  };
}

export const DISCURSOS_GEMINI_PROMPT = `
Você é um assistente especializado em extrair informações de arranjos de oradores de congregações das Testemunhas de Jeová.

Analise o PDF fornecido e extraia as informações dos discursos em formato JSON seguindo EXATAMENTE esta estrutura:

{
  "discursos": [
    {
      "data": "YYYY-MM-DD",
      "orador": "Nome do Orador",
      "tema": "Título do Discurso",
      "cantico": "Número do Cântico",
      "hospitalidade": "Nome da Família/Pessoa que oferece hospitalidade"
    }
  ]
}

REGRAS IMPORTANTES:

1. **DATAS**: 
   - Converta SEMPRE para formato ISO (YYYY-MM-DD)
   - Exemplos: "4 de outubro" → "2024-10-04", "sábado, 11 de outubro" → "2024-10-11"
   - Se o ano não estiver explícito, use 2024

2. **ORADOR**: 
   - Extraia o nome EXATO do orador como aparece no PDF
   - Mantenha a formatação original (maiúsculas/minúsculas)
   - Exemplos: "Alex", "Célio Horn", "Cleiton Pereira"

3. **TEMA**: 
   - Extraia o título completo do discurso
   - Mantenha pontuação e acentos
   - Exemplos: "O amor identifica os verdadeiros cristãos", "Obedecer a Deus é mesmo a melhor coisa a fazer?"

4. **CÂNTICO**: 
   - Extraia apenas o número
   - Se não houver cântico, use null
   - Exemplos: "154", "87", null

5. **HOSPITALIDADE**:
   - Extraia o nome EXATO da família/pessoa como aparece no PDF
   - Pode incluir múltiplos nomes separados por vírgula
   - Se não houver hospitalidade, use null
   - Exemplos: "Família Fernandes", "Vilson, Loni e Isolde", "Família Schmidt", "Vai ser videoconferência"

6. **CONGREGAÇÃO**:
   - Ignore informações sobre congregação de origem do orador
   - Foque apenas nos dados do discurso

EXEMPLO DE SAÍDA:
{
  "discursos": [
    {
      "data": "2024-10-04",
      "orador": "Alex",
      "tema": "O amor identifica os verdadeiros cristãos",
      "cantico": "154",
      "hospitalidade": "Vai ser videoconferência"
    },
    {
      "data": "2024-10-11",
      "orador": "Célio Horn",
      "tema": "Obedecer a Deus é mesmo a melhor coisa a fazer?",
      "cantico": null,
      "hospitalidade": "Família Fernandes"
    }
  ]
}

IMPORTANTE: 
- Retorne APENAS o JSON válido, sem texto adicional
- Mantenha a estrutura EXATA mostrada acima
- Se algum campo não estiver disponível, use null
- Não invente informações que não estão no PDF
- Extraia o texto EXATAMENTE como aparece no PDF, sem tentar relacionar com nenhuma base de dados
`;