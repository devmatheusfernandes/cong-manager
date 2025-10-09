// Tipos para validação do schema de Designações Mecânicas
import { findPublicadorByName } from './publicadores-data';

interface Pessoa {
  nome: string;
  id: string;
}

interface DesignacaoMecanica {
  id: string;
  data: string;
  tipo_reuniao: "meio_semana" | "fim_semana";
  presidente?: Pessoa | null;
  leitor?: Pessoa | null;
  indicador_entrada?: Pessoa | null;
  indicador_auditorio?: Pessoa | null;
  audio_video?: Pessoa | null;
  volante?: Pessoa | null;
  palco?: Pessoa | null;
}

interface MecanicasData {
  designacoes_mecanicas: DesignacaoMecanica[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface CleanedValidationResult extends ValidationResult {
  cleanedData?: MecanicasData;
  warnings: string[];
}

// Funções de validação
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePessoa(pessoa: unknown, fieldName: string): ValidationResult {
  const errors: string[] = [];

  if (!pessoa) {
    return { valid: true, errors: [] }; // Pessoa é opcional
  }

  if (!isObject(pessoa)) {
    errors.push(`${fieldName} deve ser um objeto`);
    return { valid: false, errors };
  }

  if (!isString(pessoa.nome)) {
    errors.push(`${fieldName}.nome deve ser uma string`);
  }

  if (!isString(pessoa.id)) {
    errors.push(`${fieldName}.id deve ser uma string`);
  }

  return { valid: errors.length === 0, errors };
}

function validateDesignacao(designacao: unknown, index: number): ValidationResult {
  const errors: string[] = [];

  if (!isObject(designacao)) {
    errors.push(`Designação ${index + 1} deve ser um objeto`);
    return { valid: false, errors };
  }

  // Validar campos obrigatórios
  if (!isString(designacao.data)) {
    errors.push(`Designação ${index + 1}: data deve ser uma string`);
  }

  if (!isString(designacao.tipo_reuniao) || 
      !["meio_semana", "fim_semana"].includes(designacao.tipo_reuniao as string)) {
    errors.push(`Designação ${index + 1}: tipo_reuniao deve ser "meio_semana" ou "fim_semana"`);
  }

  // Validar pessoas (todas opcionais)
  const pessoasFields = [
    'presidente', 'leitor', 'indicador_entrada', 
    'indicador_auditorio', 'audio_video', 'volante', 'palco'
  ];

  for (const field of pessoasFields) {
    if (designacao[field]) {
      const pessoaValidation = validatePessoa(designacao[field], `Designação ${index + 1}.${field}`);
      if (!pessoaValidation.valid) {
        errors.push(...pessoaValidation.errors);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateMecanicasSchema(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(data)) {
    errors.push("Dados devem ser um objeto");
    return { valid: false, errors };
  }

  if (!isArray(data.designacoes_mecanicas)) {
    errors.push("designacoes_mecanicas deve ser um array");
    return { valid: false, errors };
  }

  // Validar cada designação
  for (let i = 0; i < data.designacoes_mecanicas.length; i++) {
    const designacaoValidation = validateDesignacao(data.designacoes_mecanicas[i], i);
    if (!designacaoValidation.valid) {
      errors.push(...designacaoValidation.errors);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAndCleanMecanicasData(
  data: unknown
): CleanedValidationResult {
  const warnings: string[] = [];
  
  // Primeira validação do schema
  const schemaValidation = validateMecanicasSchema(data);
  if (!schemaValidation.valid) {
    return {
      valid: false,
      errors: schemaValidation.errors,
      warnings: []
    };
  }

  const rawData = data as { designacoes_mecanicas: any[] };
  const cleanedDesignacoes: DesignacaoMecanica[] = [];

  // Limpar e validar cada designação
  for (let i = 0; i < rawData.designacoes_mecanicas.length; i++) {
    const designacao = rawData.designacoes_mecanicas[i];
    
    // Função para limpar pessoa
    const cleanPessoa = (pessoa: any): Pessoa | null => {
      if (!pessoa) return null;
      
      const nome = pessoa.nome?.trim() || "";
      let id = pessoa.id?.trim() || "";
      
      if (!nome) {
        warnings.push(`Designação ${i + 1}: pessoa sem nome foi removida`);
        return null;
      }
      
      // Se o ID estiver vazio ou não foi mapeado, tentar mapear automaticamente
      if (!id) {
        const publicadorEncontrado = findPublicadorByName(nome);
        if (publicadorEncontrado) {
          id = publicadorEncontrado.id;
          warnings.push(`Designação ${i + 1}: ID mapeado automaticamente para "${nome}" → "${publicadorEncontrado.nome}"`);
        } else {
          warnings.push(`Designação ${i + 1}: pessoa "${nome}" não encontrada na lista de publicadores`);
        }
      }
      
      return { nome, id };
    };

    // Validar data
    const dataStr = designacao.data?.trim();
    if (!dataStr) {
      warnings.push(`Designação ${i + 1}: data inválida, designação ignorada`);
      continue;
    }

    // Validar tipo de reunião
    const tipoReuniao = designacao.tipo_reuniao?.trim();
    if (!["meio_semana", "fim_semana"].includes(tipoReuniao)) {
      warnings.push(`Designação ${i + 1}: tipo de reunião inválido, definido como "meio_semana"`);
    }

    const cleanedDesignacao: DesignacaoMecanica = {
      id: designacao.id?.trim() || "",
      data: dataStr,
      tipo_reuniao: ["meio_semana", "fim_semana"].includes(tipoReuniao) 
        ? tipoReuniao as "meio_semana" | "fim_semana" 
        : "meio_semana",
      presidente: cleanPessoa(designacao.presidente),
      leitor: cleanPessoa(designacao.leitor),
      indicador_entrada: cleanPessoa(designacao.indicador_entrada),
      indicador_auditorio: cleanPessoa(designacao.indicador_auditorio),
      audio_video: cleanPessoa(designacao.audio_video),
      volante: cleanPessoa(designacao.volante),
      palco: cleanPessoa(designacao.palco),
    };

    cleanedDesignacoes.push(cleanedDesignacao);
  }

  if (cleanedDesignacoes.length === 0) {
    return {
      valid: false,
      errors: ["Nenhuma designação válida foi encontrada"],
      warnings
    };
  }

  const cleanedData: MecanicasData = {
    designacoes_mecanicas: cleanedDesignacoes
  };

  return {
    valid: true,
    errors: [],
    warnings,
    cleanedData
  };
}