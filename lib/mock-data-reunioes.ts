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

export interface Reuniao {
  id: string;
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

export const mockReunioes: Reuniao[] = [
  // Reunião normal
  {
    id: "1",
    periodo: "2-8 de dezembro de 2024",
    leituraBiblica: "Provérbios 29-31",
    presidente: { id: "p1", nome: "João Silva" },
    oracoes: {
      inicial: { id: "o1", nome: "Pedro Santos" },
      final: { id: "o2", nome: "Carlos Oliveira" }
    },
    canticos: {
      inicial: "123",
      intermediario: "45",
      final: "67"
    },
    tesourosPalavra: {
      discurso: {
        titulo: "Seja Sábio ao Escolher Seus Amigos",
        duracao: "10 min",
        responsavel: { id: "t1", nome: "Marcos Ferreira" }
      },
      joiasEspirituais: {
        duracao: "10 min",
        responsavel: { id: "t2", nome: "Ana Costa" }
      },
      leituraBiblica: {
        texto: "Pro. 29:1-18",
        duracao: "4 min",
        responsavel: { id: "t3", nome: "Lucas Almeida" }
      }
    },
    facaSeuMelhor: [
      {
        tipo: "Iniciando conversas",
        duracao: "3 min",
        descricao: "Como iniciar uma conversa sobre a Bíblia",
        responsavel: { id: "f1", nome: "Maria José" },
        ajudante: { id: "f1a", nome: "Fernanda Lima" }
      },
      {
        tipo: "Fazendo discípulos",
        duracao: "4 min",
        descricao: "Primeira revisita - Estabelecendo confiança",
        responsavel: { id: "f2", nome: "Roberto Dias" },
        ajudante: { id: "f2a", nome: "Juliana Rocha" }
      },
      {
        tipo: "Explicando suas crenças",
        duracao: "5 min",
        descricao: "Por que Deus permite o sofrimento?",
        responsavel: { id: "f3", nome: "André Souza" }
      }
    ],
    nossaVidaCrista: [
      {
        tipo: "Necessidades locais",
        duracao: "15 min",
        responsavel: { id: "n1", nome: "Elder Marcos" }
      }
    ],
    estudoBiblico: {
      titulo: "lfb introdução da seção 4 e histórias 14-15",
      duracao: "30 min",
      responsavel: { id: "e1", nome: "Elder Paulo" },
      leitor: { id: "l1", nome: "Marcos Silva" }
    },
    semanaVisitaSuperintendente: false,
    diaTerca: false
  },

  // Semana de visita do superintendente
  {
    id: "2",
    periodo: "9-15 de dezembro de 2024",
    leituraBiblica: "Eclesiastes 1-3",
    presidente: { id: "p2", nome: "Elder Paulo" },
    oracoes: {
      inicial: { id: "o3", nome: "Antônio Ribeiro" },
      final: { id: "o4", nome: "José Carlos" }
    },
    canticos: {
      inicial: "89",
      intermediario: "112",
      final: "134"
    },
    tesourosPalavra: {
      discurso: {
        titulo: "Há Tempo para Tudo",
        duracao: "10 min",
        responsavel: { id: "t4", nome: "Elder Marcos" }
      },
      joiasEspirituais: {
        duracao: "10 min",
        responsavel: { id: "t5", nome: "Beatriz Silva" }
      },
      leituraBiblica: {
        texto: "Ecl. 1:1-18",
        duracao: "4 min",
        responsavel: { id: "t6", nome: "Gabriel Santos" }
      }
    },
    facaSeuMelhor: [
      {
        tipo: "Vivendo como cristão",
        duracao: "4 min",
        descricao: "Como manter o equilíbrio na vida",
        responsavel: { id: "f4", nome: "Patrícia Gomes" }
      },
      {
        tipo: "Iniciando conversas",
        duracao: "3 min",
        descricao: "Testemunho informal no trabalho",
        responsavel: { id: "f5", nome: "Ricardo Nunes" },
        ajudante: { id: "f5a", nome: "Camila Torres" }
      }
    ],
    nossaVidaCrista: [
      {
        tipo: "Discurso",
        duracao: "15 min",
        conteudo: "A Importância da Organização Teocrática",
        responsavel: { id: "n2", nome: "Superintendente de Circuito" }
      }
    ],
    estudoBiblico: {
      titulo: "Discurso do Superintendente de Circuito",
      duracao: "30 min",
      responsavel: { id: "e2", nome: "Superintendente de Circuito" }
    },
    semanaVisitaSuperintendente: true,
    diaTerca: true
  },

  // Semana com evento especial (Assembleia)
  {
    id: "3",
    periodo: "16-22 de dezembro de 2024",
    leituraBiblica: "Eclesiastes 4-6",
    presidente: { id: "p3", nome: "Elder João" },
    oracoes: {
      inicial: { id: "o5", nome: "Miguel Pereira" },
      final: { id: "o6", nome: "Fernando Costa" }
    },
    canticos: {
      inicial: "156",
      intermediario: "78",
      final: "91"
    },
    tesourosPalavra: {
      discurso: {
        titulo: "",
        duracao: "",
        responsavel: undefined
      },
      joiasEspirituais: {
        duracao: "",
        responsavel: undefined
      },
      leituraBiblica: {
        texto: "",
        duracao: "",
        responsavel: undefined
      }
    },
    facaSeuMelhor: [],
    nossaVidaCrista: [],
    estudoBiblico: undefined,
    eventoEspecial: "Assembleia com Superintendente",
    semanaVisitaSuperintendente: false,
    diaTerca: false
  },

  // Reunião com múltiplas partes
  {
    id: "4",
    periodo: "23-29 de dezembro de 2024",
    leituraBiblica: "Eclesiastes 7-9",
    presidente: { id: "p4", nome: "Elder Carlos" },
    oracoes: {
      inicial: { id: "o7", nome: "Daniel Martins" },
      final: { id: "o8", nome: "Rafael Cunha" }
    },
    canticos: {
      inicial: "23",
      intermediario: "145",
      final: "88"
    },
    tesourosPalavra: {
      discurso: {
        titulo: "A Sabedoria Verdadeira Vem de Deus",
        duracao: "10 min",
        responsavel: { id: "t7", nome: "Elder João" }
      },
      joiasEspirituais: {
        duracao: "10 min",
        responsavel: { id: "t8", nome: "Carla Mendes" }
      },
      leituraBiblica: {
        texto: "Ecl. 7:1-14",
        duracao: "4 min",
        responsavel: { id: "t9", nome: "Thiago Barbosa" }
      }
    },
    facaSeuMelhor: [
      {
        tipo: "Iniciando conversas",
        duracao: "2 min",
        descricao: "Apresentando-se aos vizinhos",
        responsavel: { id: "f6", nome: "Silvia Rodrigues" },
        ajudante: { id: "f6a", nome: "Amanda Silva" }
      },
      {
        tipo: "Fazendo discípulos",
        duracao: "4 min",
        descricao: "Estudo bíblico - Primeira lição",
        responsavel: { id: "f7", nome: "Eduardo Lima" },
        ajudante: { id: "f7a", nome: "Priscila Santos" }
      },
      {
        tipo: "Explicando suas crenças",
        duracao: "4 min",
        descricao: "O que acontece quando morremos?",
        responsavel: { id: "f8", nome: "Renato Oliveira" }
      },
      {
        tipo: "Vivendo como cristão",
        duracao: "3 min",
        descricao: "Mantendo a alegria em tempos difíceis",
        responsavel: { id: "f9", nome: "Luciana Freitas" }
      }
    ],
    nossaVidaCrista: [
      {
        tipo: "Cântico e oração",
        duracao: "5 min",
        responsavel: { id: "n3", nome: "Elder Paulo" }
      },
      {
        tipo: "Entrevista",
        duracao: "10 min",
        conteudo: "Como a Bíblia mudou minha vida",
        responsavel: { id: "n4", nome: "Márcia Teixeira" }
      },
      {
        tipo: "Necessidades locais",
        duracao: "15 min",
        responsavel: { id: "n5", nome: "Elder Marcos" }
      }
    ],
    estudoBiblico: {
      titulo: "lfb histórias 16-17",
      duracao: "30 min",
      responsavel: { id: "e3", nome: "Elder Carlos" },
      leitor: { id: "l3", nome: "Pedro Almeida" }
    },
    semanaVisitaSuperintendente: false,
    diaTerca: false
  },

  // Semana com Congresso Regional
  {
    id: "5",
    periodo: "30 de dezembro - 5 de janeiro de 2025",
    leituraBiblica: "Eclesiastes 10-12",
    presidente: undefined,
    oracoes: {
      inicial: undefined,
      final: undefined
    },
    canticos: {
      inicial: "",
      intermediario: "",
      final: ""
    },
    tesourosPalavra: {
      discurso: {
        titulo: "",
        duracao: "",
        responsavel: undefined
      },
      joiasEspirituais: {
        duracao: "",
        responsavel: undefined
      },
      leituraBiblica: {
        texto: "",
        duracao: "",
        responsavel: undefined
      }
    },
    facaSeuMelhor: [],
    nossaVidaCrista: [],
    estudoBiblico: undefined,
    eventoEspecial: "Congresso Regional",
    semanaVisitaSuperintendente: false,
    diaTerca: false
  }
];

// Função para obter reunião por ID
export function getReuniaoById(id: string): Reuniao | undefined {
  return mockReunioes.find(reuniao => reuniao.id === id);
}

// Função para obter reuniões por período
export function getReunioesByPeriodo(periodo: string): Reuniao[] {
  return mockReunioes.filter(reuniao => 
    reuniao.periodo.toLowerCase().includes(periodo.toLowerCase())
  );
}

// Função para verificar se há evento especial na semana
export function hasEventoEspecial(reuniao: Reuniao): boolean {
  return !!reuniao.eventoEspecial;
}

// Função para verificar se é semana de visita do superintendente
export function isVisitaSuperintendente(reuniao: Reuniao): boolean {
  return reuniao.semanaVisitaSuperintendente;
}

// Função para obter próximas reuniões
export function getProximasReunioes(limit: number = 5): Reuniao[] {
  return mockReunioes.slice(0, limit);
}