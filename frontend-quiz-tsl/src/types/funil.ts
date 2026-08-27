export interface Opcao {
  id?: number;
  texto: string;
}

export interface Pergunta {
  id: number;
  ordem: number;
  enunciado: string;
  imagem_url?: string | null;
  opcoes?: Opcao[]; // <-- Adicionado aqui
}

export interface PaginaVendas {
  blocoLead: { titulo?: string; subtitulo?: string };
  blocoCorpo: { texto?: string; videoUrl?: string };
  blocoPitch: { preco?: number; ofertaTexto?: string };
  blocoCta: { textoBotao?: string; link?: string };
}

export interface Funil {
  id: number;
  nome: string;
  slug: string;
  perguntas: Pergunta[];
  paginaVendas: PaginaVendas | null;
}