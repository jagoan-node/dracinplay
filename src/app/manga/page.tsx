'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MangaPage() {
  const [mangas, setMangas] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/manga/home')
      .then(r => r.json())
      .then(d => { setMangas(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const doSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/manga/search?q=${encodeURIComponent(search)}`);
    const d = await res.json();
    setMangas(d.data || []);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">📖 Manga</h1>
      <div className="flex gap-2 mb-8">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Search manga..." className="flex-1 bg-[#1a1a2e] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-green-500 outline-none" />
        <button onClick={doSearch} className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition">Search</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mangas.map((m: any) => (
          <Link key={m.manga_id} href={`/manga/${m.manga_id}`} className="group">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900">
              {m.cover_image_url && <Image src={m.cover_image_url} alt={m.title || ''} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 20vw" />}
            </div>
            <p className="text-white text-sm mt-2 line-clamp-2">{m.title}</p>
            {m.latest_chapter_number && <p className="text-gray-500 text-xs">Ch. {m.latest_chapter_number}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
