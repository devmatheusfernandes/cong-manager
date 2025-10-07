// Tipos para validação do schema NVC
interface Pessoa {
  nome: string;
  id: string;
}

interface Oracoes {
  inicial: Pessoa;
  final: Pessoa;
}

interface Canticos {
  inicial: string;
  intermediario: string;
  final: string;
}

interface Comentarios {
  iniciais: string;
  finais: string;
}

interface JoiasEspirituais {
  texto: string;
  pergunta: string;
  referencia: string;
  duracao: string;
  responsavel: Pessoa;
}

interface LeituraBiblica {
  texto: string;
  duracao: string;
  responsavel: Pessoa;
}

interface TesourosPalavra {
  titulo: string;
  duracao: string;
  responsavel: Pessoa;
  joiasEspirituais: JoiasEspirituais;
  leituraBiblica: LeituraBiblica;
}

interface FacaSeuMelhorParte {
  tipo: string;
  duracao: string;
  descricao: string;
  responsavel: Pessoa;
  ajudante?: Pessoa;
}

interface NossaVidaCristaParte {
  tipo: string;
  duracao: string;
  conteudo?: string;
  responsavel: Pessoa;
}

interface ReuniaoNVC {
  id: string;
  congregacao_id: string;
  periodo: string;
  leituraBiblica: string | null;
  presidente: Pessoa | null;
  oracoes: Oracoes | null;
  canticos: Canticos | null;
  comentarios: Comentarios | null;
  tesourosPalavra: TesourosPalavra | null;
  facaSeuMelhor: FacaSeuMelhorParte[] | null;
  nossaVidaCrista: NossaVidaCristaParte[] | null;
  eventoEspecial: string | null;
  semanaVisitaSuperintendente: boolean;
  diaTerca: boolean;
}

interface NVCData {
  nossa_vida_crista: ReuniaoNVC[];
}

// Funções de validação
function isString(value: any): value is string {
  return typeof value === 'string';
}

function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validatePessoa(pessoa: any, fieldName: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isObject(pessoa)) {
    errors.push(`${fieldName} deve ser um objeto`);
    return { valid: false, errors };
  }
  
  if (!isString((pessoa as any).nome)) {
    errors.push(`${fieldName}.nome deve ser uma string`);
  }
  
  if (!isString((pessoa as any).id)) {
    errors.push(`${fieldName}.id deve ser uma string`);
  }
  
  return { valid: errors.length === 0, errors };
}

function validateCanticos(canticos: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isObject(canticos)) {
    errors.push('canticos deve ser um objeto');
    return { valid: false, errors };
  }
  
  if (!isString((canticos as any).inicial)) {
    errors.push('canticos.inicial deve ser uma string');
  }
  
  if (!isString((canticos as any).intermediario)) {
    errors.push('canticos.intermediario deve ser uma string');
  }
  
  if (!isString((canticos as any).final)) {
    errors.push('canticos.final deve ser uma string');
  }
  
  return { valid: errors.length === 0, errors };
}

function validateTesourosPalavra(tesouros: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isObject(tesouros)) {
    errors.push('tesourosPalavra deve ser um objeto');
    return { valid: false, errors };
  }
  
  if (!isString((tesouros as any).titulo)) {
    errors.push('tesourosPalavra.titulo deve ser uma string');
  }
  
  if (!isString((tesouros as any).duracao)) {
    errors.push('tesourosPalavra.duracao deve ser uma string');
  }
  
  const responsavelValidation = validatePessoa((tesouros as any).responsavel, 'tesourosPalavra.responsavel');
  errors.push(...responsavelValidation.errors);
  
  // Validar joiasEspirituais
  if (!isObject((tesouros as any).joiasEspirituais)) {
    errors.push('tesourosPalavra.joiasEspirituais deve ser um objeto');
  } else {
    const joias = (tesouros as any).joiasEspirituais;
    if (!isString((joias as any).texto)) errors.push('joiasEspirituais.texto deve ser uma string');
    if (!isString((joias as any).pergunta)) errors.push('joiasEspirituais.pergunta deve ser uma string');
    if (!isString((joias as any).referencia)) errors.push('joiasEspirituais.referencia deve ser uma string');
    if (!isString((joias as any).duracao)) errors.push('joiasEspirituais.duracao deve ser uma string');
    
    const joiasResponsavelValidation = validatePessoa((joias as any).responsavel, 'joiasEspirituais.responsavel');
    errors.push(...joiasResponsavelValidation.errors);
  }
  
  // Validar leituraBiblica
  if (!isObject((tesouros as any).leituraBiblica)) {
    errors.push('tesourosPalavra.leituraBiblica deve ser um objeto');
  } else {
    const leitura = (tesouros as any).leituraBiblica;
    if (!isString((leitura as any).texto)) errors.push('leituraBiblica.texto deve ser uma string');
    if (!isString((leitura as any).duracao)) errors.push('leituraBiblica.duracao deve ser uma string');
    
    const leituraResponsavelValidation = validatePessoa((leitura as any).responsavel, 'leituraBiblica.responsavel');
    errors.push(...leituraResponsavelValidation.errors);
  }
  
  return { valid: errors.length === 0, errors };
}

function validateFacaSeuMelhor(facaSeuMelhor: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isArray(facaSeuMelhor)) {
    errors.push('facaSeuMelhor deve ser um array');
    return { valid: false, errors };
  }
  
  facaSeuMelhor.forEach((parte: any, index: number) => {
    if (!isObject(parte)) {
      errors.push(`facaSeuMelhor[${index}] deve ser um objeto`);
      return;
    }
    
    if (!isString((parte as any).tipo)) {
      errors.push(`facaSeuMelhor[${index}].tipo deve ser uma string`);
    }
    
    if (!isString((parte as any).duracao)) {
      errors.push(`facaSeuMelhor[${index}].duracao deve ser uma string`);
    }
    
    if (!isString((parte as any).descricao)) {
      errors.push(`facaSeuMelhor[${index}].descricao deve ser uma string`);
    }
    
    const responsavelValidation = validatePessoa((parte as any).responsavel, `facaSeuMelhor[${index}].responsavel`);
    errors.push(...responsavelValidation.errors);
    
    if ((parte as any).ajudante) {
      const ajudanteValidation = validatePessoa((parte as any).ajudante, `facaSeuMelhor[${index}].ajudante`);
      errors.push(...ajudanteValidation.errors);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

function validateNossaVidaCrista(nossaVidaCrista: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isArray(nossaVidaCrista)) {
    errors.push('nossaVidaCrista deve ser um array');
    return { valid: false, errors };
  }
  
  nossaVidaCrista.forEach((parte: any, index: number) => {
    if (!isObject(parte)) {
      errors.push(`nossaVidaCrista[${index}] deve ser um objeto`);
      return;
    }
    
    if (!isString((parte as any).tipo)) {
      errors.push(`nossaVidaCrista[${index}].tipo deve ser uma string`);
    }
    
    if (!isString((parte as any).duracao)) {
      errors.push(`nossaVidaCrista[${index}].duracao deve ser uma string`);
    }
    
    const responsavelValidation = validatePessoa((parte as any).responsavel, `nossaVidaCrista[${index}].responsavel`);
    errors.push(...responsavelValidation.errors);
  });
  
  return { valid: errors.length === 0, errors };
}

function validateReuniao(reuniao: any, index: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isObject(reuniao)) {
    errors.push(`Reunião ${index} deve ser um objeto`);
    return { valid: false, errors };
  }
  
  // Campos obrigatórios
  if (!isString((reuniao as any).periodo)) {
    errors.push(`Reunião ${index}: periodo deve ser uma string`);
  }
  
  if (!isBoolean((reuniao as any).semanaVisitaSuperintendente)) {
    errors.push(`Reunião ${index}: semanaVisitaSuperintendente deve ser um booleano`);
  }
  
  if (!isBoolean((reuniao as any).diaTerca)) {
    errors.push(`Reunião ${index}: diaTerca deve ser um booleano`);
  }
  
  // Verificar se é evento especial
  if ((reuniao as any).eventoEspecial) {
    if (!isString((reuniao as any).eventoEspecial)) {
      errors.push(`Reunião ${index}: eventoEspecial deve ser uma string ou null`);
    }
    // Para eventos especiais, outros campos podem ser null
    return { valid: errors.length === 0, errors };
  }
  
  // Para reuniões normais, validar campos obrigatórios
  if ((reuniao as any).leituraBiblica !== null && !isString((reuniao as any).leituraBiblica)) {
    errors.push(`Reunião ${index}: leituraBiblica deve ser uma string ou null`);
  }
  
  if ((reuniao as any).presidente) {
    const presidenteValidation = validatePessoa((reuniao as any).presidente, `Reunião ${index}: presidente`);
    errors.push(...presidenteValidation.errors);
  }
  
  if ((reuniao as any).oracoes) {
    if (!isObject((reuniao as any).oracoes)) {
      errors.push(`Reunião ${index}: oracoes deve ser um objeto`);
    } else {
      const inicialValidation = validatePessoa((reuniao as any).oracoes.inicial, `Reunião ${index}: oracoes.inicial`);
      errors.push(...inicialValidation.errors);
      
      const finalValidation = validatePessoa((reuniao as any).oracoes.final, `Reunião ${index}: oracoes.final`);
      errors.push(...finalValidation.errors);
    }
  }
  
  if ((reuniao as any).canticos) {
    const canticosValidation = validateCanticos((reuniao as any).canticos);
    errors.push(...canticosValidation.errors.map(err => `Reunião ${index}: ${err}`));
  }
  
  if ((reuniao as any).tesourosPalavra) {
    const tesouroValidation = validateTesourosPalavra((reuniao as any).tesourosPalavra);
    errors.push(...tesouroValidation.errors.map(err => `Reunião ${index}: ${err}`));
  }
  
  if ((reuniao as any).facaSeuMelhor) {
    const facaValidation = validateFacaSeuMelhor((reuniao as any).facaSeuMelhor);
    errors.push(...facaValidation.errors.map(err => `Reunião ${index}: ${err}`));
  }
  
  if ((reuniao as any).nossaVidaCrista) {
    const nvcValidation = validateNossaVidaCrista((reuniao as any).nossaVidaCrista);
    errors.push(...nvcValidation.errors.map(err => `Reunião ${index}: ${err}`));
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateNVCSchema(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isObject(data)) {
    errors.push('Dados devem ser um objeto');
    return { valid: false, errors };
  }
  
  if (!(data as any).nossa_vida_crista) {
    errors.push('Propriedade "nossa_vida_crista" é obrigatória');
    return { valid: false, errors };
  }
  
  if (!isArray((data as any).nossa_vida_crista)) {
    errors.push('"nossa_vida_crista" deve ser um array');
    return { valid: false, errors };
  }
  
  if ((data as any).nossa_vida_crista.length === 0) {
    errors.push('"nossa_vida_crista" não pode estar vazio');
    return { valid: false, errors };
  }
  
  (data as any).nossa_vida_crista.forEach((reuniao: any, index: number) => {
    const reuniaoValidation = validateReuniao(reuniao, index + 1);
    errors.push(...reuniaoValidation.errors);
  });
  
  return { valid: errors.length === 0, errors };
}

export function validateAndCleanNVCData(data: any): { 
  valid: boolean; 
  errors: string[]; 
  cleanedData?: NVCData;
  warnings: string[];
} {
  const warnings: string[] = [];
  const validation = validateNVCSchema(data);
  
  if (!validation.valid) {
    return { valid: false, errors: validation.errors, warnings };
  }
  
  // Limpar e normalizar dados
  const cleanedData: NVCData = {
    nossa_vida_crista: (data as any).nossa_vida_crista.map((reuniao: any, index: number) => {
      const cleaned: ReuniaoNVC = {
        id: (reuniao as any).id || `temp-${Date.now()}-${index}`,
        congregacao_id: (reuniao as any).congregacao_id || "",
        periodo: (reuniao as any).periodo,
        leituraBiblica: (reuniao as any).leituraBiblica,
        presidente: (reuniao as any).presidente,
        oracoes: (reuniao as any).oracoes,
        canticos: (reuniao as any).canticos,
        comentarios: (reuniao as any).comentarios,
        tesourosPalavra: (reuniao as any).tesourosPalavra,
        facaSeuMelhor: (reuniao as any).facaSeuMelhor,
        nossaVidaCrista: (reuniao as any).nossaVidaCrista,
        eventoEspecial: (reuniao as any).eventoEspecial,
        semanaVisitaSuperintendente: (reuniao as any).semanaVisitaSuperintendente,
        diaTerca: (reuniao as any).diaTerca
      };
      
      // Adicionar warnings para campos vazios
      if (!cleaned.id || cleaned.id.startsWith('temp-')) {
        warnings.push(`Reunião ${index + 1}: ID foi gerado automaticamente`);
      }
      
      if (!cleaned.congregacao_id) {
        warnings.push(`Reunião ${index + 1}: congregacao_id está vazio`);
      }
      
      return cleaned;
    })
  };
  
  return { 
    valid: true, 
    errors: [], 
    cleanedData,
    warnings 
  };
}