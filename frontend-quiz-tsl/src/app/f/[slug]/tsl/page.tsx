'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { Funil } from '@/types/funil';

export default function TslPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [funil, setFunil] = useState<Funil | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <p className="animate-pulse text-emerald-400">Carregando apresentação...</p>
      </div>
    );
  }

  if (erro || !funil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400 font-sans">
        <p>{erro || 'Conteúdo indisponível.'}</p>
      </div>
    );
  }

  const pagina = funil.paginaVendas;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 font-sans">
      <article className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl space-y-8">
        
        {/* Bloco 1: Lead (Headline) */}
        {pagina?.blocoLead && (
          <header className="text-center space-y-3 border-b border-slate-800 pb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              {pagina.blocoLead.titulo}
            </h1>
            {pagina.blocoLead.subtitulo && (
              <p className="text-lg text-slate-400">{pagina.blocoLead.subtitulo}</p>
            )}
          </header>
        )}

        {/* Bloco 2: Corpo (Copy / História) */}
        {pagina?.blocoCorpo && (
          <section className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg space-y-4">
            <p className="whitespace-pre-line">{pagina.blocoCorpo.texto}</p>
          </section>
        )}

        {/* Bloco 3: Pitch (Oferta) - Corrigido para usar ofertaTexto */}
        {pagina?.blocoPitch && (
          <section className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6 text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Oferta Especial</span>
            {pagina.blocoPitch.preco !== undefined && (
              <div className="text-4xl font-extrabold text-white">
                R$ {Number(pagina.blocoPitch.preco).toFixed(2)}
              </div>
            )}
            {pagina.blocoPitch.ofertaTexto && (
              <p className="text-sm text-slate-400 whitespace-pre-line">{pagina.blocoPitch.ofertaTexto}</p>
            )}
          </section>
        )}

        {/* Bloco 4: CTA (Botão) */}
        {pagina?.blocoCta && (
          <footer className="text-center pt-2">
            <a
              href={pagina.blocoCta.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-5 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xl rounded-xl shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 transition-all text-center"
            >
              {pagina.blocoCta.textoBotao || 'GARANTIR AGORA'}
            </a>
          </footer>
        )}
      </article>
    </main>
  );
}