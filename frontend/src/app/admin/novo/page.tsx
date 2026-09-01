'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

interface OpcaoForm {
  texto: string;
}

interface PerguntaForm {
  texto: string;
  opcoes: OpcaoForm[];
}

interface DorForm {
  titulo: string;
  texto: string;
}

interface DepoimentoForm {
  nome: string;
  cargo: string;
  texto: string;
}

interface FaqForm {
  pergunta: string;
  resposta: string;
}

export default function NovoFunilPage() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  const [perguntas, setPerguntas] = useState<PerguntaForm[]>([
    {
      texto: '',
      opcoes: [{ texto: '' }, { texto: '' }],
    },
  ]);

  // Blocos da TSL (Página de Vendas)
  const [blocoLead, setBlocoLead] = useState({ titulo: '', subtitulo: '' });
  const [blocoCorpo, setBlocoCorpo] = useState({ texto: '' });
  const [blocoPitch, setBlocoPitch] = useState({ ofertaTexto: '', preco: '' });
  const [blocoCta, setBlocoCta] = useState({
    link: '',
    textoBotao: 'GARANTIR AGORA',
    corBotao: '#10b981',
  });

  // Urgência / Contador
  const [urgenciaTexto, setUrgenciaTexto] = useState('Oferta por tempo limitado');
  const [countdownAtivo, setCountdownAtivo] = useState(true);
  const [countdownHoras, setCountdownHoras] = useState(2);
  const [countdownMinutos, setCountdownMinutos] = useState(41);

  // Listas dinâmicas da TSL
  const [dores, setDores] = useState<DorForm[]>([]);
  const [depoimentos, setDepoimentos] = useState<DepoimentoForm[]>([]);
  const [faq, setFaq] = useState<FaqForm[]>([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Gerenciamento de Perguntas
  const handlePerguntaChange = (index: number, valor: string) => {
    const novas = [...perguntas];
    novas[index].texto = valor;
    setPerguntas(novas);
  };

  const adicionarPergunta = () => {
    setPerguntas([
      ...perguntas,
      { texto: '', opcoes: [{ texto: '' }, { texto: '' }] },
    ]);
  };

  const removerPergunta = (index: number) => {
    if (perguntas.length <= 1) return;
    setPerguntas(perguntas.filter((_, i) => i !== index));
  };

  // Gerenciamento de Opções
  const handleOpcaoChange = (
    pIndex: number,
    oIndex: number,
    valor: string
  ) => {
    const novas = [...perguntas];
    novas[pIndex].opcoes[oIndex].texto = valor;
    setPerguntas(novas);
  };

  const adicionarOpcao = (pIndex: number) => {
    const novas = [...perguntas];
    novas[pIndex].opcoes.push({ texto: '' });
    setPerguntas(novas);
  };

  const removerOpcao = (pIndex: number, oIndex: number) => {
    const novas = [...perguntas];
    if (novas[pIndex].opcoes.length <= 2) return;
    novas[pIndex].opcoes = novas[pIndex].opcoes.filter((_, i) => i !== oIndex);
    setPerguntas(novas);
  };

  // Gerenciamento de Dores
  const adicionarDor = () => {
    setDores([...dores, { titulo: '', texto: '' }]);
  };

  const handleDorChange = (index: number, campo: keyof DorForm, valor: string) => {
    const novas = [...dores];
    novas[index][campo] = valor;
    setDores(novas);
  };

  const removerDor = (index: number) => {
    setDores(dores.filter((_, i) => i !== index));
  };

  // Gerenciamento de Depoimentos
  const adicionarDepoimento = () => {
    setDepoimentos([...depoimentos, { nome: '', cargo: '', texto: '' }]);
  };

  const handleDepoimentoChange = (
    index: number,
    campo: keyof DepoimentoForm,
    valor: string
  ) => {
    const novos = [...depoimentos];
    novos[index][campo] = valor;
    setDepoimentos(novos);
  };

  const removerDepoimento = (index: number) => {
    setDepoimentos(depoimentos.filter((_, i) => i !== index));
  };

  // Gerenciamento de FAQ
  const adicionarFaq = () => {
    setFaq([...faq, { pergunta: '', resposta: '' }]);
  };

  const handleFaqChange = (index: number, campo: keyof FaqForm, valor: string) => {
    const novas = [...faq];
    novas[index][campo] = valor;
    setFaq(novas);
  };

  const removerFaq = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  // Envio do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !slug.trim()) {
      setErro('Por favor, preencha o nome e o slug do funil.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        redirect_url: redirectUrl,
        perguntas: perguntas.map((p, pIdx) => ({
          enunciado: p.texto,
          ordem: pIdx + 1,
          opcoes: p.opcoes.map((o, oIdx) => ({
            texto: o.texto,
            ordem: oIdx + 1,
          })),
        })),
        paginaVendas: {
          blocoLead,
          blocoCorpo,
          blocoPitch,
          blocoCta,
          urgenciaTexto,
          countdownAtivo,
          countdownHoras,
          countdownMinutos,
          dores,
          depoimentos,
          faq,
        },
      };

      console.log('🚨 PAYLOAD ENVIADO PELO FRONTEND:');
      console.log(JSON.stringify(payload, null, 2));

      await api.post('/funis', payload);
      router.push('/admin');
    } catch (err: any) {
      console.error('Erro ao criar funil:', err);
      setErro(
        err.response?.data?.message || 'Erro ao cadastrar o funil. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Cabeçalho e Navegação */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/admin"
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            ← Voltar ao Painel
          </Link>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-mono">
            Novo Funil
          </span>
        </div>

        <header>
          <h1 className="text-3xl font-extrabold text-white">Criar Novo Funil</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure o quiz, adicione perguntas e defina os blocos da página de vendas (TSL).
          </p>
        </header>

        {erro && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Seção 1: Dados do Funil */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">
              1. Dados Gerais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Nome do Funil
                </label>
                <input
                  type="text"
                  placeholder="Ex: Quiz Perda de Peso"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Slug (URL Amigável)
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                  <span className="text-slate-600 text-sm mr-1 font-mono">/f/</span>
                  <input
                    type="text"
                    placeholder="perda-de-peso"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                URL de Redirecionamento Geral (Opcional)
              </label>
              <input
                type="url"
                placeholder="https://seu-produto.com/vsl"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </section>

          {/* Seção 2: Perguntas Dinâmicas */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-200">
                2. Perguntas do Quiz
              </h2>
              <button
                type="button"
                onClick={adicionarPergunta}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg transition-colors"
              >
                + Adicionar Pergunta
              </button>
            </div>

            {perguntas.map((p, pIndex) => (
              <div
                key={pIndex}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Pergunta #{pIndex + 1}
                  </span>
                  {perguntas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerPergunta(pIndex)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remover Pergunta
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Qual seu principal objetivo hoje?"
                  value={p.texto}
                  onChange={(e) => handlePerguntaChange(pIndex, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />

                {/* Lista de Opções */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Opções de Resposta
                    </label>
                    <button
                      type="button"
                      onClick={() => adicionarOpcao(pIndex)}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      + Nova Opção
                    </button>
                  </div>

                  {p.opcoes.map((o, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs font-mono w-5">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Opção ${String.fromCharCode(65 + oIndex)}`}
                        value={o.texto}
                        onChange={(e) =>
                          handleOpcaoChange(pIndex, oIndex, e.target.value)
                        }
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                      {p.opcoes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removerOpcao(pIndex, oIndex)}
                          className="text-xs text-slate-500 hover:text-red-400 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Seção 3: Configuração da TSL (Página de Vendas) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">
              3. Configuração dos Blocos da TSL (Página de Vendas)
            </h2>

            {/* Bloco 1: Lead */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bloco 1: Lead (Headline)</span>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Título Principal</label>
                <input
                  type="text"
                  placeholder="Ex: Descubra o método único..."
                  value={blocoLead.titulo}
                  onChange={(e) => setBlocoLead({ ...blocoLead, titulo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subtítulo</label>
                <input
                  type="text"
                  placeholder="Ex: Funciona mesmo se você já tentou de tudo..."
                  value={blocoLead.subtitulo}
                  onChange={(e) => setBlocoLead({ ...blocoLead, subtitulo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Bloco 2: Corpo */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bloco 2: Corpo (A História / Copy)</span>
              <textarea
                rows={4}
                placeholder="Escreva a história ou os argumentos de vendas da TSL aqui..."
                value={blocoCorpo.texto}
                onChange={(e) => setBlocoCorpo({ ...blocoCorpo, texto: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Bloco 3: Pitch */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bloco 3: Pitch (A Oferta)</span>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Descrição da Oferta</label>
                <textarea
                  rows={3}
                  placeholder="Descreva o que está incluso, bônus e garantias..."
                  value={blocoPitch.ofertaTexto}
                  onChange={(e) => setBlocoPitch({ ...blocoPitch, ofertaTexto: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Preço do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: 197,00"
                  value={blocoPitch.preco}
                  onChange={(e) => setBlocoPitch({ ...blocoPitch, preco: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Use apenas números, com vírgula ou ponto (ex: 197,00). Textos como "12x de R$19,90" não são convertidos corretamente.
                </p>
              </div>
            </div>

            {/* Bloco 4: CTA */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bloco 4: CTA (Botão de Vendas)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    placeholder="Ex: QUERO ACESSAR AGORA"
                    value={blocoCta.textoBotao}
                    onChange={(e) => setBlocoCta({ ...blocoCta, textoBotao: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Link de Checkout / Vendas</label>
                  <input
                    type="url"
                    placeholder="Ex: https://pay.hotmart.com/..."
                    value={blocoCta.link}
                    onChange={(e) => setBlocoCta({ ...blocoCta, link: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cor do Botão</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={blocoCta.corBotao}
                    onChange={(e) => setBlocoCta({ ...blocoCta, corBotao: e.target.value })}
                    className="w-12 h-10 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={blocoCta.corBotao}
                    onChange={(e) => setBlocoCta({ ...blocoCta, corBotao: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Seção 4: Urgência e Contador */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">
              4. Urgência e Contador Regressivo
            </h2>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Texto de Urgência (topo da página)</label>
              <input
                type="text"
                placeholder="Ex: Oferta por tempo limitado"
                value={urgenciaTexto}
                onChange={(e) => setUrgenciaTexto(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={countdownAtivo}
                onChange={(e) => setCountdownAtivo(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              Ativar contador regressivo
            </label>

            {countdownAtivo && (
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Horas</label>
                  <input
                    type="number"
                    min={0}
                    value={countdownHoras}
                    onChange={(e) => setCountdownHoras(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Minutos</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={countdownMinutos}
                    onChange={(e) => setCountdownMinutos(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Seção 5: Dores */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-200">5. Agitação da Dor</h2>
              <button
                type="button"
                onClick={adicionarDor}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg transition-colors"
              >
                + Adicionar Dor
              </button>
            </div>

            {dores.length === 0 && (
              <p className="text-xs text-slate-500">
                Nenhuma dor adicionada — a TSL vai usar um conteúdo padrão até você preencher.
              </p>
            )}

            {dores.map((dor, index) => (
              <div key={index} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Dor #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removerDor(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Título (ex: Tempo perdido tentando decidir sozinho)"
                  value={dor.titulo}
                  onChange={(e) => handleDorChange(index, 'titulo', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <textarea
                  rows={2}
                  placeholder="Descrição curta da dor"
                  value={dor.texto}
                  onChange={(e) => handleDorChange(index, 'texto', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </section>

          {/* Seção 6: Depoimentos */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-200">6. Depoimentos</h2>
              <button
                type="button"
                onClick={adicionarDepoimento}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg transition-colors"
              >
                + Adicionar Depoimento
              </button>
            </div>

            {depoimentos.length === 0 && (
              <p className="text-xs text-slate-500">
                Nenhum depoimento adicionado — a TSL vai usar um conteúdo padrão até você preencher.
              </p>
            )}

            {depoimentos.map((dep, index) => (
              <div key={index} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Depoimento #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removerDepoimento(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={dep.nome}
                    onChange={(e) => handleDepoimentoChange(index, 'nome', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Cargo / Legenda (ex: Cliente)"
                    value={dep.cargo}
                    onChange={(e) => handleDepoimentoChange(index, 'cargo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Texto do depoimento"
                  value={dep.texto}
                  onChange={(e) => handleDepoimentoChange(index, 'texto', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </section>

          {/* Seção 7: FAQ */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-200">7. Perguntas Frequentes (FAQ)</h2>
              <button
                type="button"
                onClick={adicionarFaq}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg transition-colors"
              >
                + Adicionar Pergunta
              </button>
            </div>

            {faq.length === 0 && (
              <p className="text-xs text-slate-500">
                Nenhuma pergunta adicionada — a TSL vai usar um conteúdo padrão até você preencher.
              </p>
            )}

            {faq.map((item, index) => (
              <div key={index} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pergunta #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removerFaq(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Pergunta"
                  value={item.pergunta}
                  onChange={(e) => handleFaqChange(index, 'pergunta', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <textarea
                  rows={2}
                  placeholder="Resposta"
                  value={item.resposta}
                  onChange={(e) => handleFaqChange(index, 'resposta', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </section>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/admin"
              className="px-5 py-3 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar e Publicar Funil 🚀'}
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}