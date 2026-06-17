'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AnimePage() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/anime/home')
      .then(r => r.json())
      .then(d => { setAnimes(d.data || []); setLoading(false); })
      .catch(() => { setError('Gagal memuat data'); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 pt-6">
      <div className="skeleton h-8 w-32 rounded mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({length:10}).map((_,i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-[#1a1a2e] rounded-xl mb-2" /><div className="skeleton h-4 w-3/4 rounded" /></div>)}
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#e63946] text-white rounded-lg text-sm">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">🎌 Anime</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {animes.map((a: any, i: number) => (
            <Link key={a.id || a.url} href={`/anime/${a.url || a.id}`} className="group card-hover stagger-item" style={{animationDelay:`${Math.min(i*30,300)}ms`}}>
              <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden">
                  {a.cover && <Image src={a.cover} alt={a.judul || ''} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width:640px) 50vw, 20vw" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#e63946] transition-colors">{a.judul || a.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}