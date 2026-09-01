'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { Funil } from '@/types/funil';
import { useRouter } from 'next/navigation';

export default function QuizPlayerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [funil, setFunil] = useState<Funil | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do fluxo do visitante
  const [etapaAtual, setEtapaAtual] = useState(0); 
  const [respostas, setRespostas] = useState<{ perguntaId: number; respostaTexto: string }[]>([]);
  
  // Estados do formulário de Lead e controle da TSL
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submetendo, setSubmetendo] = useState(false);
  const [quizFinalizado, setQuizFinalizado] = useState(false);

  useEffect(() => {
    async function carregarFunil() {
      try {
        const response = await api.get(`/funis/${slug}`);
        setFunil(response.data);
      } catch (err: any) {
        setErro('Funil não encontrado.');
      } finally {
        setLoading(false);
      }
    }
    if (slug) carregarFunil();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <p className="animate-pulse text-emerald-400">Carregando quiz...</p>
      </div>
    );
  }

  if (erro || !funil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400 font-sans">
        <p>{erro || 'Funil indisponível.'}</p>
      </div>
    );
  }

  const totalPerguntas = funil.perguntas.length;

  // Registrar a resposta e avançar a pergunta
  const handleResponderPergunta = (respostaTexto: string) => {
    const perguntaAtualObj = funil.perguntas[etapaAtual];
    
    setRespostas((prev) => [
      ...prev,
      { perguntaId: perguntaAtualObj.id, respostaTexto }
    ]);

    setEtapaAtual((prev) => prev + 1);
  };

  // Enviar Lead + Respostas para o Backend e liberar a TSL interna
const handleFinalizarQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmetendo(true);

    try {
      await api.post(`/funis/${slug}/responder`, {
        nome,
        email,
        whatsapp,
        respostas
      });

      // Redireciona usando a rota correta /f/ :
      router.push(`/f/${slug}/tsl`);

    } catch (err) {
      alert('Erro ao salvar suas respostas. Tente novamente.');
      setSubmetendo(false);
    }
  };
  // ----------------------------------------------------
  // ETAPA 3: PÁGINA DE VENDAS (TSL) - SE O QUIZ FOI FINALIZADO
  // ----------------------------------------------------
  if (quizFinalizado) {
    const pagina = funil.paginaVendas;

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 font-sans">
        <article className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl space-y-8">
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

          {pagina?.blocoCorpo && (
            <section className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg space-y-4">
              <p>{pagina.blocoCorpo.texto}</p>
            </section>
          )}

          {pagina?.blocoPitch && (
            <section className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6 text-center space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Oferta Especial</span>
              <div className="text-4xl font-extrabold text-white">
                R$ {pagina.blocoPitch.preco?.toFixed(2)}
              </div>
              {pagina.blocoPitch.ofertaTexto && (
                <p className="text-sm text-slate-400">{pagina.blocoPitch.ofertaTexto}</p>
              )}
            </section>
          )}

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

  // ----------------------------------------------------
  // ETAPA 2: FORMULÁRIO DE CAPTURA DO LEAD (SE ACABARAM AS PERGUNTAS)
  // ----------------------------------------------------
  if (etapaAtual >= totalPerguntas) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <form 
          onSubmit={handleFinalizarQuiz}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-emerald-400">
              Seu resultado está pronto!
            </h2>
            <p className="text-slate-400 text-sm">
              Informe seus dados para liberar o diagnóstico completo:
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nome</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={submetendo}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 font-bold rounded-xl text-slate-950 transition-colors shadow-lg shadow-emerald-500/10 mt-2"
          >
            {submetendo ? 'Processando...' : 'VER MEU RESULTADO ➔'}
          </button>
        </form>
      </main>
    );
  }

  // ----------------------------------------------------
  // ETAPA 1: ETAPA DE PERGUNTAS DO QUIZ
  // ----------------------------------------------------
  const pergunta = funil.perguntas[etapaAtual];
  const progresso = ((etapaAtual + 1) / (totalPerguntas + 1)) * 100;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl">
        {/* Pergunta - fora do container de resposta, acima */}
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-slate-100">
          {pergunta.enunciado}
        </h2>

        {/* Container de resposta */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          {/* Barra de Progresso */}
          <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300" 
              style={{ width: `${progresso}%` }}
            />
          </div>

          {pergunta.imagem_url && (
            <img 
              src={pergunta.imagem_url} 
              alt="Imagem explicativa" 
              className="w-full h-48 object-cover rounded-xl mb-6 border border-slate-800" 
            />
          )}

          <div className="space-y-3">
            {pergunta.opcoes && pergunta.opcoes.length > 0 ? (
              pergunta.opcoes.map((opcao: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleResponderPergunta(opcao.texto || opcao)}
                  className="w-full py-4 px-6 bg-slate-800 hover:bg-emerald-600 hover:text-white transition-all rounded-xl font-medium text-left flex justify-between items-center border border-slate-700/50"
                >
                  <span>{opcao.texto || opcao}</span>
                  <span className="text-slate-400">➔</span>
                </button>
              ))
            ) : (
              <p className="text-slate-400 text-center py-2">Nenhuma opção cadastrada para esta pergunta.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}