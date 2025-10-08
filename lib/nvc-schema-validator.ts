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

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface CleanedValidationResult extends ValidationResult {
  cleanedData?: NVCData;
  warnings: string[];
}

// Funções de validação
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePessoa(pessoa: unknown, fieldName: string): ValidationResult {
  const errors: string[] = [];

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

function validateCanticos(canticos: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(canticos)) {
    errors.push("canticos deve ser um objeto");
    return { valid: false, errors };
  }

  if (!isString(canticos.inicial)) {
    errors.push("canticos.inicial deve ser uma string");
  }

  if (!isString(canticos.intermediario)) {
    errors.push("canticos.intermediario deve ser uma string");
  }

  if (!isString(canticos.final)) {
    errors.push("canticos.final deve ser uma string");
  }

  return { valid: errors.length === 0, errors };
}

function validateTesourosPalavra(tesouros: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(tesouros)) {
    errors.push("tesourosPalavra deve ser um objeto");
    return { valid: false, errors };
  }

  if (!isString(tesouros.titulo)) {
    errors.push("tesourosPalavra.titulo deve ser uma string");
  }

  if (!isString(tesouros.duracao)) {
    errors.push("tesourosPalavra.duracao deve ser uma string");
  }

  const responsavelValidation = validatePessoa(
    tesouros.responsavel,
    "tesourosPalavra.responsavel"
  );
  errors.push(...responsavelValidation.errors);

  // Validar joiasEspirituais
  if (!isObject(tesouros.joiasEspirituais)) {
    errors.push("tesourosPalavra.joiasEspirituais deve ser um objeto");
  } else {
    const joias = tesouros.joiasEspirituais;
    if (!isString(joias.texto))
      errors.push("joiasEspirituais.texto deve ser uma string");
    if (!isString(joias.pergunta))
      errors.push("joiasEspirituais.pergunta deve ser uma string");
    if (!isString(joias.referencia))
      errors.push("joiasEspirituais.referencia deve ser uma string");
    if (!isString(joias.duracao))
      errors.push("joiasEspirituais.duracao deve ser uma string");

    const joiasResponsavelValidation = validatePessoa(
      joias.responsavel,
      "joiasEspirituais.responsavel"
    );
    errors.push(...joiasResponsavelValidation.errors);
  }

  // Validar leituraBiblica
  if (!isObject(tesouros.leituraBiblica)) {
    errors.push("tesourosPalavra.leituraBiblica deve ser um objeto");
  } else {
    const leitura = tesouros.leituraBiblica;
    if (!isString(leitura.texto))
      errors.push("leituraBiblica.texto deve ser uma string");
    if (!isString(leitura.duracao))
      errors.push("leituraBiblica.duracao deve ser uma string");

    const leituraResponsavelValidation = validatePessoa(
      leitura.responsavel,
      "leituraBiblica.responsavel"
    );
    errors.push(...leituraResponsavelValidation.errors);
  }

  return { valid: errors.length === 0, errors };
}

function validateFacaSeuMelhor(facaSeuMelhor: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isArray(facaSeuMelhor)) {
    errors.push("facaSeuMelhor deve ser um array");
    return { valid: false, errors };
  }

  facaSeuMelhor.forEach((parte: unknown, index: number) => {
    if (!isObject(parte)) {
      errors.push(`facaSeuMelhor[${index}] deve ser um objeto`);
      return;
    }

    if (!isString(parte.tipo)) {
      errors.push(`facaSeuMelhor[${index}].tipo deve ser uma string`);
    }

    if (!isString(parte.duracao)) {
      errors.push(`facaSeuMelhor[${index}].duracao deve ser uma string`);
    }

    if (!isString(parte.descricao)) {
      errors.push(`facaSeuMelhor[${index}].descricao deve ser uma string`);
    }

    const responsavelValidation = validatePessoa(
      parte.responsavel,
      `facaSeuMelhor[${index}].responsavel`
    );
    errors.push(...responsavelValidation.errors);

    if (parte.ajudante) {
      const ajudanteValidation = validatePessoa(
        parte.ajudante,
        `facaSeuMelhor[${index}].ajudante`
      );
      errors.push(...ajudanteValidation.errors);
    }
  });

  return { valid: errors.length === 0, errors };
}

function validateNossaVidaCrista(nossaVidaCrista: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isArray(nossaVidaCrista)) {
    errors.push("nossaVidaCrista deve ser um array");
    return { valid: false, errors };
  }

  nossaVidaCrista.forEach((parte: unknown, index: number) => {
    if (!isObject(parte)) {
      errors.push(`nossaVidaCrista[${index}] deve ser um objeto`);
      return;
    }

    if (!isString(parte.tipo)) {
      errors.push(`nossaVidaCrista[${index}].tipo deve ser uma string`);
    }

    if (!isString(parte.duracao)) {
      errors.push(`nossaVidaCrista[${index}].duracao deve ser uma string`);
    }

    const responsavelValidation = validatePessoa(
      parte.responsavel,
      `nossaVidaCrista[${index}].responsavel`
    );
    errors.push(...responsavelValidation.errors);
  });

  return { valid: errors.length === 0, errors };
}

function validateReuniao(reuniao: unknown, index: number): ValidationResult {
  const errors: string[] = [];

  if (!isObject(reuniao)) {
    errors.push(`Reunião ${index} deve ser um objeto`);
    return { valid: false, errors };
  }

  // Campos obrigatórios
  if (!isString(reuniao.periodo)) {
    errors.push(`Reunião ${index}: periodo deve ser uma string`);
  }

  if (!isBoolean(reuniao.semanaVisitaSuperintendente)) {
    errors.push(
      `Reunião ${index}: semanaVisitaSuperintendente deve ser um booleano`
    );
  }

  if (!isBoolean(reuniao.diaTerca)) {
    errors.push(`Reunião ${index}: diaTerca deve ser um booleano`);
  }

  // Verificar se é evento especial
  if (reuniao.eventoEspecial) {
    if (!isString(reuniao.eventoEspecial)) {
      errors.push(
        `Reunião ${index}: eventoEspecial deve ser uma string ou null`
      );
    }
    // Para eventos especiais, outros campos podem ser null
    return { valid: errors.length === 0, errors };
  }

  // Para reuniões normais, validar campos obrigatórios
  if (reuniao.leituraBiblica !== null && !isString(reuniao.leituraBiblica)) {
    errors.push(`Reunião ${index}: leituraBiblica deve ser uma string ou null`);
  }

  if (reuniao.presidente) {
    const presidenteValidation = validatePessoa(
      reuniao.presidente,
      `Reunião ${index}: presidente`
    );
    errors.push(...presidenteValidation.errors);
  }

  if (reuniao.oracoes) {
    if (!isObject(reuniao.oracoes)) {
      errors.push(`Reunião ${index}: oracoes deve ser um objeto`);
    } else {
      const inicialValidation = validatePessoa(
        reuniao.oracoes.inicial,
        `Reunião ${index}: oracoes.inicial`
      );
      errors.push(...inicialValidation.errors);

      const finalValidation = validatePessoa(
        reuniao.oracoes.final,
        `Reunião ${index}: oracoes.final`
      );
      errors.push(...finalValidation.errors);
    }
  }

  if (reuniao.canticos) {
    const canticosValidation = validateCanticos(reuniao.canticos);
    errors.push(
      ...canticosValidation.errors.map((err) => `Reunião ${index}: ${err}`)
    );
  }

  if (reuniao.tesourosPalavra) {
    const tesouroValidation = validateTesourosPalavra(reuniao.tesourosPalavra);
    errors.push(
      ...tesouroValidation.errors.map((err) => `Reunião ${index}: ${err}`)
    );
  }

  if (reuniao.facaSeuMelhor) {
    const facaValidation = validateFacaSeuMelhor(reuniao.facaSeuMelhor);
    errors.push(
      ...facaValidation.errors.map((err) => `Reunião ${index}: ${err}`)
    );
  }

  if (reuniao.nossaVidaCrista) {
    const nvcValidation = validateNossaVidaCrista(reuniao.nossaVidaCrista);
    errors.push(
      ...nvcValidation.errors.map((err) => `Reunião ${index}: ${err}`)
    );
  }

  return { valid: errors.length === 0, errors };
}

export function validateNVCSchema(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(data)) {
    errors.push("Dados devem ser um objeto");
    return { valid: false, errors };
  }

  if (!data.nossa_vida_crista) {
    errors.push('Propriedade "nossa_vida_crista" é obrigatória');
    return { valid: false, errors };
  }

  if (!isArray(data.nossa_vida_crista)) {
    errors.push('"nossa_vida_crista" deve ser um array');
    return { valid: false, errors };
  }

  if (data.nossa_vida_crista.length === 0) {
    errors.push('"nossa_vida_crista" não pode estar vazio');
    return { valid: false, errors };
  }

  data.nossa_vida_crista.forEach((reuniao: unknown, index: number) => {
    const reuniaoValidation = validateReuniao(reuniao, index + 1);
    errors.push(...reuniaoValidation.errors);
  });

  return { valid: errors.length === 0, errors };
}

export function validateAndCleanNVCData(
  data: unknown
): CleanedValidationResult {
  const warnings: string[] = [];
  const validation = validateNVCSchema(data);

  if (!validation.valid) {
    return { valid: false, errors: validation.errors, warnings };
  }

  if (!isObject(data) || !isArray(data.nossa_vida_crista)) {
    return { valid: false, errors: ["Dados inválidos"], warnings };
  }

  // Limpar e normalizar dados
  const cleanedData: NVCData = {
    nossa_vida_crista: data.nossa_vida_crista.map(
      (reuniao: unknown, index: number) => {
        if (!isObject(reuniao)) {
          throw new Error(`Reunião ${index} não é um objeto`);
        }

        const cleaned: ReuniaoNVC = {
          id: isString(reuniao.id) ? reuniao.id : `temp-${Date.now()}-${index}`,
          congregacao_id: isString(reuniao.congregacao_id)
            ? reuniao.congregacao_id
            : "",
          periodo: isString(reuniao.periodo) ? reuniao.periodo : "",
          leituraBiblica: isString(reuniao.leituraBiblica)
            ? reuniao.leituraBiblica
            : null,
          presidente: isObject(reuniao.presidente)
            ? (reuniao.presidente as unknown as Pessoa)
            : null,
          oracoes: isObject(reuniao.oracoes)
            ? (reuniao.oracoes as unknown as Oracoes)
            : null,
          canticos: isObject(reuniao.canticos)
            ? (reuniao.canticos as unknown as Canticos)
            : null,
          comentarios: isObject(reuniao.comentarios)
            ? (reuniao.comentarios as unknown as Comentarios)
            : null,
          tesourosPalavra: isObject(reuniao.tesourosPalavra)
            ? (reuniao.tesourosPalavra as unknown as TesourosPalavra)
            : null,
          facaSeuMelhor: isArray(reuniao.facaSeuMelhor)
            ? (reuniao.facaSeuMelhor as FacaSeuMelhorParte[])
            : null,
          nossaVidaCrista: isArray(reuniao.nossaVidaCrista)
            ? (reuniao.nossaVidaCrista as NossaVidaCristaParte[])
            : null,
          eventoEspecial: isString(reuniao.eventoEspecial)
            ? reuniao.eventoEspecial
            : null,
          semanaVisitaSuperintendente: isBoolean(
            reuniao.semanaVisitaSuperintendente
          )
            ? reuniao.semanaVisitaSuperintendente
            : false,
          diaTerca: isBoolean(reuniao.diaTerca) ? reuniao.diaTerca : false,
        };

        // Adicionar warnings para campos vazios
        if (!cleaned.id || cleaned.id.startsWith("temp-")) {
          warnings.push(`Reunião ${index + 1}: ID foi gerado automaticamente`);
        }

        if (!cleaned.congregacao_id) {
          warnings.push(`Reunião ${index + 1}: congregacao_id está vazio`);
        }

        return cleaned;
      }
    ),
  };

  return {
    valid: true,
    errors: [],
    cleanedData,
    warnings,
  };
}
