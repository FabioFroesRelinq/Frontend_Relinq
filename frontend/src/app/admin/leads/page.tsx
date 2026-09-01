'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

interface RespostaQuiz {
  enunciado: string;
  resposta_texto: string;
}

interface Lead {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  criado_em: string;
  respostas: RespostaQuiz[];
}

function LeadsContent() {
  const searchParams = useSearchParams();
  const funilId = searchParams.get('funilId');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [nomeFunil, setNomeFunil] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!funilId) {
      setLoading(false);
      return;
    }

    async function carregarLeads() {
      try {
        const response = await api.get(`/funis/${funilId}/leads`);
        setNomeFunil(response.data.funil.nome);
        setLeads(response.data.leads);
      } catch (err) {
        console.error('Erro ao buscar leads:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarLeads();
  }, [funilId]);

  if (!funilId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <p className="text-red-400">Nenhum funil selecionado.</p>
        <Link href="/admin" className="text-emerald-400 underline mt-4 inline-block">
          Voltar para o Painel
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <Link href="/admin" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← Voltar aos Funis
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Leads do Funil: {nomeFunil || 'Carregando...'}</h1>
            <p className="text-slate-400 text-sm mt-1">Total de conversões: {leads.length}</p>
          </div>
        </header>

        {loading ? (
          <p className="text-slate-500 animate-pulse">Carregando leads...</p>
        ) : leads.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            Nenhum lead capturado neste funil ainda.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div 
                key={lead.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-slate-500 block text-xs">Nome</span>
                    <strong className="text-white">{lead.nome || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">E-mail</span>
                    <strong className="text-emerald-400">{lead.email || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">WhatsApp</span>
                    <strong className="text-white">{lead.whatsapp || 'Não informado'}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Cadastrado em: {new Date(lead.criado_em).toLocaleString()}</span>
                </div>

                {lead.respostas && lead.respostas.length > 0 && (
                  <div className="bg-slate-950/50 p-4 rounded-lg space-y-2 border border-slate-800/60">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Respostas do Quiz:</span>
                    <ul className="space-y-1 text-sm">
                      {lead.respostas.map((resp, idx) => (
                        <li key={idx} className="text-slate-300">
                          <span className="text-slate-500">{resp.enunciado}:</span>{' '}
                          <span className="font-medium text-emerald-300">{resp.resposta_texto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 p-8">Carregando...</div>}>
      <LeadsContent />
    </Suspense>
  );
}