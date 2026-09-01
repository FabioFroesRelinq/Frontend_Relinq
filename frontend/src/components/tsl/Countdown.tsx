'use client';

import { useEffect, useState } from 'react';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function Countdown({ hours = 2, minutes = 41 }: { hours?: number; minutes?: number }) {
  const [target] = useState(() => Date.now() + (hours * 60 + minutes) * 60 * 1000);
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(target - Date.now(), 0));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="flex items-center gap-1 font-mono font-bold">
      <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-center min-w-[36px]">
        <span className="text-emerald-600 block text-xs">{pad(h)}</span>
        <span className="text-[8px] text-slate-500 block uppercase font-sans">Horas</span>
      </div>
      <span className="text-slate-400">:</span>
      <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-center min-w-[36px]">
        <span className="text-slate-900 block text-xs">{pad(m)}</span>
        <span className="text-[8px] text-slate-500 block uppercase font-sans">Min</span>
      </div>
      <span className="text-slate-400">:</span>
      <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-center min-w-[36px]">
        <span className="text-emerald-600 block text-xs">{pad(s)}</span>
        <span className="text-[8px] text-slate-500 block uppercase font-sans">Seg</span>
      </div>
    </div>
  );
}