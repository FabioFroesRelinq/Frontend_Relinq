export interface Opcao {
  id?: number;
  texto: string;
}

export interface Pergunta {
  id: number;
  ordem: number;
  enunciado: string;
  imagem_url?: string | null;
  opcoes?: Opcao[];
}

export interface TslDor {
  titulo: string;
  texto?: string;
}

export interface TslDepoimento {
  nome: string;
  cargo?: string;
  texto?: string;
}

export interface TslFaqItem {
  pergunta: string;
  resposta?: string;
}

export interface PaginaVendas {
  blocoLead: { titulo?: string; subtitulo?: string };
  blocoCorpo: { texto?: string; videoUrl?: string };
  blocoPitch: { preco?: number; ofertaTexto?: string; nomeProduto?: string };
  blocoCta: { textoBotao?: string; link?: string; corBotao?: string };
  urgenciaTexto?: string;
  countdownAtivo?: boolean;
  countdownHoras?: number;
  countdownMinutos?: number;
  dores?: TslDor[];
  depoimentos?: TslDepoimento[];
  faq?: TslFaqItem[];
}

export interface Funil {
  id: number;
  nome: string;
  slug: string;
  perguntas: Pergunta[];
  paginaVendas: PaginaVendas | null;
}