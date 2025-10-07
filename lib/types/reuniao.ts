export interface Pessoa {
  id: string;
  nome: string;
}

export interface FacaSeuMelhorParte {
  tipo: string;
  duracao: string;
  descricao: string;
  responsavel?: Pessoa;
  ajudante?: Pessoa;
}

export interface NossaVidaCristaParte {
  tipo: string;
  duracao: string;
  conteudo?: string;
  responsavel?: Pessoa;
  leitor?: Pessoa;
}

export interface NovaReuniaoData {
  periodo: string;
  leituraBiblica: string;
  presidente?: Pessoa;
  oracoes: {
    inicial?: Pessoa;
    final?: Pessoa;
  };
  canticos: {
    inicial: string;
    intermediario: string;
    final: string;
  };
  tesourosPalavra: {
    discurso: {
      titulo: string;
      duracao: string;
      responsavel?: Pessoa;
    };
    joiasEspirituais: {
      duracao: string;
      responsavel?: Pessoa;
    };
    leituraBiblica: {
      texto: string;
      duracao: string;
      responsavel?: Pessoa;
    };
  };
  facaSeuMelhor: FacaSeuMelhorParte[];
  nossaVidaCrista: NossaVidaCristaParte[];
  estudoBiblico?: {
    titulo: string;
    duracao: string;
    responsavel?: Pessoa;
    leitor?: Pessoa;
  };
  eventoEspecial?: string;
  semanaVisitaSuperintendente: boolean;
  diaTerca: boolean;
}

export const EVENTOS_ESPECIAIS = [
  "Assembleia com Superintendente",
  "Assembleia com Representante de Betel",
  "Congresso Regional",
  "Celebração",
];

export const TIPOS_FACA_SEU_MELHOR = [
  "Iniciando conversas",
  "Fazendo discípulos",
  "Explicando suas crenças",
  "Vivendo como cristão",
];

export const TIPOS_NOSSA_VIDA_CRISTA = [
  "Necessidades locais",
  "Estudo bíblico de congregação",
  "Cântico e oração",
  "Discurso",
  "Entrevista",
  "Demonstração",
];