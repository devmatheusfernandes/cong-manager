import { findPublicadorByName } from './publicadores-data';

// Interface para escala de limpeza conforme Supabase
export interface EscalaLimpeza {
  id?: string;
  grupo_id: string;
  data_limpeza: string; // ISO date string (YYYY-MM-DD)
  publicadores: string[]; // Array de IDs dos publicadores
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para dados de limpeza vindos do PDF/JSON
export interface LimpezaData {
  escalas: EscalaLimpeza[];
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

// Validação de uma escala de limpeza individual
export function validateEscalaLimpeza(escala: any): escala is EscalaLimpeza {
  if (!isObject(escala)) return false;
  
  const obj = escala as Record<string, any>;
  
  // Verificar campos obrigatórios
  if (!isString(obj.grupo_id)) return false;
  if (!isString(obj.data_limpeza)) return false;
  if (!isArray(obj.publicadores)) return false;
  
  // Verificar se todos os publicadores são strings
  if (!obj.publicadores.every((pub: any) => isString(pub))) return false;
  
  // Verificar campos opcionais
  if (obj.observacoes !== undefined && !isString(obj.observacoes)) return false;
  
  return true;
}

// Validação do schema completo de limpeza
export function validateLimpezaSchema(data: any): data is LimpezaData {
  if (!isObject(data)) return false;
  
  const obj = data as Record<string, any>;
  if (!isArray(obj.escalas)) return false;
  
  return obj.escalas.every(validateEscalaLimpeza);
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

// Função para extrair nomes de uma string de família
export function extrairNomesDaFamilia(familiaStr: string): string[] {
  if (!familiaStr || typeof familiaStr !== 'string') return [];
  
  // Remove espaços extras e divide por vírgulas ou "e"
  const nomes = familiaStr
    .split(/[,&]|\se\s/)
    .map(nome => nome.trim())
    .filter(nome => nome.length > 0);
  
  return nomes;
}

// Função para mapear nomes para IDs de publicadores
export function mapearNomesParaIds(nomes: string[]): string[] {
  const ids: string[] = [];
  
  for (const nome of nomes) {
    const publicador = findPublicadorByName(nome);
    if (publicador) {
      ids.push(publicador.id);
    } else {
      // Adicionar o nome como ID temporário para ser processado na API
      // O sistema criará automaticamente o publicador se não existir
      ids.push(nome);
    }
  }
  
  return ids;
}

// Função principal para validar e limpar dados de limpeza
export function validateAndCleanLimpezaData(data: any): {
  cleanedData: any;
  isValid: boolean;
  data?: LimpezaData;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Verificar se é um objeto
    if (!isObject(data)) {
      errors.push('Dados devem ser um objeto');
      return { isValid: false, cleanedData: null, errors, warnings };
    }
    
    const dataObj = data as Record<string, any>;
    
    // Verificar se tem o campo escalas
    if (!isArray(dataObj.escalas)) {
      errors.push('Campo "escalas" deve ser um array');
      return { isValid: false, cleanedData: null, errors, warnings };
    }
    
    // Processar cada escala
    const escalasLimpas: EscalaLimpeza[] = [];
    
    for (let i = 0; i < dataObj.escalas.length; i++) {
      const escala = dataObj.escalas[i];
      
      try {
        // Validar estrutura básica
        if (!isObject(escala)) {
          errors.push(`Escala ${i + 1}: deve ser um objeto`);
          continue;
        }
        
        const obj = escala as Record<string, any>;
        
        // Processar data
        let dataLimpeza: string;
        if (isString(obj.data_limpeza)) {
          dataLimpeza = parseDataPortugues(obj.data_limpeza);
        } else {
          errors.push(`Escala ${i + 1}: data_limpeza deve ser uma string`);
          continue;
        }
        
        // Processar publicadores
        let publicadores: string[] = [];
        if (isArray(obj.publicadores)) {
          publicadores = obj.publicadores.filter(isString);
        } else if (isString(obj.publicadores)) {
          // Se for uma string, extrair nomes
          const nomes = extrairNomesDaFamilia(obj.publicadores);
          publicadores = mapearNomesParaIds(nomes);
        } else {
          errors.push(`Escala ${i + 1}: publicadores deve ser um array ou string`);
          continue;
        }
        
        if (publicadores.length === 0) {
          warnings.push(`Escala ${i + 1}: nenhum publicador válido encontrado`);
        }
        
        // Processar grupo_id
        const grupoId = isString(obj.grupo_id) ? obj.grupo_id : '';
        
        // Processar observações
        const observacoes = isString(obj.observacoes) ? obj.observacoes : undefined;
        
        // Criar escala limpa
        const escalaLimpa: EscalaLimpeza = {
          grupo_id: grupoId,
          data_limpeza: dataLimpeza,
          publicadores,
          observacoes
        };
        
        escalasLimpas.push(escalaLimpa);
        
      } catch (error) {
        errors.push(`Escala ${i + 1}: erro ao processar - ${error}`);
      }
    }
    
    if (errors.length > 0) {
      return { isValid: false, cleanedData: null, errors, warnings };
    }
    
    const limpezaData: LimpezaData = {
      escalas: escalasLimpas
    };
    
    return {
      isValid: true,
      cleanedData: limpezaData,
      data: limpezaData,
      errors,
      warnings
    };
    
  } catch (error) {
    errors.push(`Erro geral na validação: ${error}`);
    return { isValid: false, cleanedData: null, errors, warnings };
  }
}