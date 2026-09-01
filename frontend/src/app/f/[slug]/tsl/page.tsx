'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { Funil } from '@/types/funil';
import { Reveal } from '@/components/tsl/Reveal';
import { Countdown } from '@/components/tsl/Countdown';

// Usado apenas como fallback, caso o funil ainda não tenha essas listas preenchidas
const DORES_PADRAO = [
  {
    titulo: 'Tempo perdido tentando decidir sozinho',
    texto: 'Sem um direcionamento claro, é fácil girar em círculos e adiar a decisão por semanas.',
  },
  {
    titulo: 'Informação solta demais',
    texto: 'Muita gente pesquisa em vários lugares diferentes e termina mais confusa do que quando começou.',
  },
  {
    titulo: 'Medo de escolher errado',
    texto: 'Sem um caminho testado, a insegurança faz a pessoa travar antes mesmo de começar.',
  },
];

const DEPOIMENTOS_PADRAO = [
  {
    texto: 'Segui exatamente o que foi passado aqui e finalmente vi resultado em poucas semanas.',
    nome: 'Ana Paula',
    cargo: 'Cliente',
  },
  {
    texto: 'O que mais me ajudou foi ter um passo a passo simples, sem enrolação.',
    nome: 'Carlos Eduardo',
    cargo: 'Cliente',
  },
  {
    texto: 'Recomendo pra quem já tentou de tudo e não conseguiu sozinho.',
    nome: 'Fernanda Lima',
    cargo: 'Cliente',
  },
];

const FAQ_PADRAO = [
  {
    pergunta: 'Funciona pra quem está começando do zero?',
    resposta: 'Sim, o conteúdo foi pensado para ser simples de seguir mesmo sem experiência prévia.',
  },
  {
    pergunta: 'Em quanto tempo eu vejo resultado?',
    resposta: 'Varia de pessoa pra pessoa, mas a maioria já percebe diferença nas primeiras semanas aplicando o que é ensinado.',
  },
  {
    pergunta: 'E se eu tiver dúvidas no meio do caminho?',
    resposta: 'É só entrar em contato pelos canais oficiais informados após a compra.',
  },
];

export default function TslPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [funil, setFunil] = useState<Funil | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [depoimentoAtual, setDepoimentoAtual] = useState(0);

  useEffect(() => {
    async function carregarFunil() {
      try {
        const response = await api.get(`/funis/${slug}`);
        setFunil(response.data);
      } catch (err: any) {
        setErro('Página não encontrada.');
      } finally {
        setLoading(false);
      }
    }
    if (slug) carregarFunil();
  }, [slug]);

  const pagina = funil?.paginaVendas;

  const dores = pagina?.dores && pagina.dores.length > 0 ? pagina.dores : DORES_PADRAO;
  const depoimentos =
    pagina?.depoimentos && pagina.depoimentos.length > 0 ? pagina.depoimentos : DEPOIMENTOS_PADRAO;
  const faq = pagina?.faq && pagina.faq.length > 0 ? pagina.faq : FAQ_PADRAO;

  useEffect(() => {
    const id = setInterval(() => {
      setDepoimentoAtual((prev) => (prev + 1) % depoimentos.length);
    }, 6000);
    return () => clearInterval(id);
  }, [depoimentos.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-500 font-sans">
        <p className="animate-pulse">Carregando apresentação...</p>
      </div>
    );
  }

  if (erro || !funil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-500 font-sans">
        <p>{erro || 'Conteúdo indisponível.'}</p>
      </div>
    );
  }

  const preco = pagina?.blocoPitch?.preco;
  const precoValido = typeof preco === 'number' && !Number.isNaN(preco);
  const corBotao = pagina?.blocoCta?.corBotao || '#10b981';
  const countdownAtivo = pagina?.countdownAtivo !== false;
  const urgenciaTexto = pagina?.urgenciaTexto || 'Oferta por tempo limitado';

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans antialiased pb-24 md:pb-0">
      {/* TOPBAR */}
      {countdownAtivo && (
        <div className="w-full bg-white border-b border-slate-200 py-2.5 px-4">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-slate-700 uppercase text-[11px] tracking-wide">{urgenciaTexto}</span>
            </div>
            <Countdown
              hours={pagina?.countdownHoras ?? 2}
              minutes={pagina?.countdownMinutos ?? 41}
            />
          </div>
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {/* Bloco 1: Lead (Headline) */}
        {pagina?.blocoLead && (
          <Reveal className="text-center mb-14">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              {pagina.blocoLead.titulo}
            </h1>
            {pagina.blocoLead.subtitulo && (
              <p className="text-base sm:text-xl text-slate-600">{pagina.blocoLead.subtitulo}</p>
            )}
          </Reveal>
        )}

        {/* Bloco 2: Corpo (Copy) */}
        {pagina?.blocoCorpo && (
          <Reveal delay={100} className="mb-16">
            <div className="prose max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {pagina.blocoCorpo.texto}
            </div>
          </Reveal>
        )}

        {/* AGITAÇÃO DA DOR */}
        <Reveal className="mb-16">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6 border-l-4 border-emerald-500 pl-4">
            Por que isso é mais difícil do que devia ser
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dores.map((dor, i) => (
              <div key={i} className="p-5 rounded-2xl border border-red-200 bg-red-50 text-left">
                <h3 className="text-sm font-bold text-red-600 mb-2">❌ {dor.titulo}</h3>
                {dor.texto && <p className="text-xs text-slate-600 leading-relaxed">{dor.texto}</p>}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Bloco 3: Pitch (Oferta) */}
        {pagina?.blocoPitch && (
          <Reveal delay={100} className="mb-14">
            <div className="bg-slate-50 border border-emerald-300 rounded-2xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                Oferta Especial
              </span>
              {precoValido && (
                <div className="text-4xl sm:text-5xl font-black text-slate-900 pt-2">
                  R$ {preco!.toFixed(2)}
                </div>
              )}
              {pagina.blocoPitch.ofertaTexto && (
                <p className="text-sm text-slate-600 whitespace-pre-line pt-1">
                  {pagina.blocoPitch.ofertaTexto}
                </p>
              )}
            </div>
          </Reveal>
        )}

        {/* DEPOIMENTOS */}
        <Reveal className="mb-16">
          <div className="relative bg-white border border-slate-200 rounded-2xl p-8 text-center min-h-[220px] flex flex-col justify-center">
            <p className="text-sm sm:text-base text-slate-700 italic mb-4 leading-relaxed">
              "{depoimentos[depoimentoAtual]?.texto}"
            </p>
            <div className="font-bold text-slate-900">{depoimentos[depoimentoAtual]?.nome}</div>
            {depoimentos[depoimentoAtual]?.cargo && (
              <div className="text-emerald-600 text-xs font-semibold">{depoimentos[depoimentoAtual].cargo}</div>
            )}
            <div className="flex items-center justify-center gap-2 mt-5">
              {depoimentos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDepoimentoAtual(i)}
                  aria-label={`Depoimento ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === depoimentoAtual ? 'bg-emerald-500 scale-125' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal className="mb-16 text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6 text-center">
            Perguntas Frequentes
          </h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details key={i} className="border border-slate-200 rounded-xl p-4 group">
                <summary className="font-bold text-slate-900 text-sm sm:text-base flex justify-between items-center list-none cursor-pointer">
                  <span>{item.pergunta}</span>
                  <span className="text-emerald-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                {item.resposta && (
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">{item.resposta}</p>
                )}
              </details>
            ))}
          </div>
        </Reveal>

        {/* Bloco 4: CTA */}
        {pagina?.blocoCta && (
          <Reveal className="text-center pb-4">
            <a
              href={pagina.blocoCta.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: corBotao }}
              className="cta-pulse inline-block w-full py-5 px-8 hover:opacity-90 text-white font-black text-lg sm:text-xl rounded-2xl shadow-lg transform hover:-translate-y-0.5 transition-all text-center uppercase"
            >
              {pagina.blocoCta.textoBotao || 'GARANTIR AGORA'}
            </a>
            <p className="text-xs text-slate-500 mt-3">Vagas por tempo limitado</p>
          </Reveal>
        )}
      </article>

      {/* BARRA FIXA MOBILE */}
      {pagina?.blocoCta && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 border-t border-slate-200 backdrop-blur-lg flex items-center justify-between gap-3">
          <div className="text-left pl-1">
            <span className="block text-xs font-bold text-slate-900">{funil.nome}</span>
            <span className="block text-[10px] text-emerald-600 font-semibold">{urgenciaTexto}</span>
          </div>
          <a
            href={pagina.blocoCta.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: corBotao }}
            className="cta-pulse flex items-center gap-2 py-2.5 px-5 hover:opacity-90 text-white font-black text-xs rounded-xl uppercase tracking-wider"
          >
            {pagina.blocoCta.textoBotao || 'Garantir agora'}
          </a>
        </div>
      )}
    </main>
  );
}