'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function MovieBoxPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/moviebox/home')
      .then(r => r.json())
      .then(d => {
        const allItems: any[] = [];
        (d.data?.items || []).forEach((item: any) => {
          if (item.subjects) allItems.push(...item.subjects);
          if (item.groups) item.groups.forEach((g: any) => { if (g.subjects) allItems.push(...g.subjects); });
        });
        setItems(allItems);
        setLoading(false);
      })
      .catch(() => { setError('Gagal memuat data'); setLoading(false); });
  }, []);

  const doSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/moviebox/search?q=${encodeURIComponent(search)}`);
      const d = await res.json();
      const results: any[] = [];
      (d.data?.results || []).forEach((r: any) => { if (r.subjects) results.push(...r.subjects); });
      setItems(results);
    } catch { setError('Search failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">🎥 MovieBox</h1>
        <div className="flex gap-2 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search movies..." className="flex-1 bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-[#e63946]/50 outline-none text-sm transition-colors" />
          <button onClick={doSearch} className="bg-[#e63946] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#ff4757] transition text-sm">Search</button>
        </div>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-4 text-sm flex items-center justify-between">{error}<button onClick={() => setError('')} className="text-xs underline">Dismiss</button></div>}
        {loading ? <LoadingSkeleton count={15} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {items.map((m: any, i: number) => (
              <Link key={m.subjectId} href={`/moviebox/${m.subjectId}`} className="group card-hover stagger-item" style={{animationDelay:`${Math.min(i*30,300)}ms`}}>
                <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {m.cover && <Image src={m.cover} alt={m.title || ''} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width:640px) 50vw, 20vw" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#e63946] transition-colors">{m.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
            <p>Tidak ada film ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}