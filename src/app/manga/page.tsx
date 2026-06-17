'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function MangaPage() {
  const [mangas, setMangas] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/manga/home')
      .then(r => r.json())
      .then(d => { setMangas(d.data || []); setLoading(false); })
      .catch(() => { setError('Gagal memuat data'); setLoading(false); });
  }, []);

  const doSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/manga/search?q=${encodeURIComponent(search)}`);
      const d = await res.json();
      setMangas(d.data || []);
    } catch { setError('Search failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">📖 Manga</h1>
        <div className="flex gap-2 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search manga..." className="flex-1 bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-green-500/50 outline-none text-sm transition-colors" />
          <button onClick={doSearch} className="bg-green-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-600 transition text-sm">Search</button>
        </div>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-4 text-sm flex items-center justify-between">{error}<button onClick={() => setError('')} className="text-xs underline">Dismiss</button></div>}
        {loading ? <LoadingSkeleton count={15} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {mangas.map((m: any, i: number) => (
              <Link key={m.manga_id} href={`/manga/${m.manga_id}`} className="group card-hover stagger-item" style={{animationDelay:`${Math.min(i*30,300)}ms`}}>
                <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {m.cover_image_url && <Image src={m.cover_image_url} alt={m.title || ''} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width:640px) 50vw, 20vw" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {m.latest_chapter_number && (
                      <div className="absolute bottom-2 right-2">
                        <span className="text-[10px] bg-black/70 backdrop-blur-sm text-gray-300 px-2 py-0.5 rounded-full">Ch. {m.latest_chapter_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-green-400 transition-colors">{m.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && mangas.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p>Tidak ada manga ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}