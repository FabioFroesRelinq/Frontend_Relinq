'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

interface FunilResumo {
  id: number;
  nome: string;
  slug: string;
  created_at?: string;
}

export default function AdminDashboardPage() {
  const [funis, setFunis] = useState<FunilResumo[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarFunis() {
    try {
      const response = await api.get('/funis');
      setFunis(response.data);
    } catch (err) {
      console.error('Erro ao carregar funis', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarFunis();
  }, []);

  // Função para deletar o funil
  const handleDeletar = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar o funil "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api.delete(`/funis/${id}`);
      // Atualiza a lista removendo o funil deletado
      setFunis(funis.filter((f) => f.id !== id));
    } catch (err: any) {
      alert('Erro ao deletar funil: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Topo do Admin */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Painel de Funis</h1>
            <p className="text-slate-400 text-sm mt-1">
              Gerencie seus Quizzes e monitore os resultados de conversão.
            </p>
          </div>
          <Link
            href="/admin/novo"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10 text-center"
          >
            + Criar Novo Funil
          </Link>
        </header>

        {/* Conteúdo Principal */}
        {loading ? (
          <p className="text-slate-500 animate-pulse">Carregando painel...</p>
        ) : funis.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <p className="text-slate-400">Nenhum funil cadastrado até o momento.</p>
            <Link
              href="/admin/novo"
              className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-sm font-medium"
            >
              Criar o primeiro funil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {funis.map((f) => (
              <div 
                key={f.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold text-white">{f.nome}</h2>
                    <button
                      onClick={() => handleDeletar(f.id, f.nome)}
                      className="text-slate-500 hover:text-red-400 text-xs font-semibold px-2 py-1 rounded bg-slate-950/50 transition-colors"
                      title="Deletar Funil"
                    >
                      Excluir 🗑️
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Slug: <span className="text-emerald-400">/f/{f.slug}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-sm">
                  <a
                    href={`/f/${f.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Ver Player ↗
                  </a>
                  <Link
                    href={`/admin/leads?funilId=${f.id}`}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Ver Leads ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}