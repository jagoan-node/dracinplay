'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MovieBoxPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
      .catch(() => setLoading(false));
  }, []);

  const doSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/moviebox/search?q=${encodeURIComponent(search)}`);
    const d = await res.json();
    const results: any[] = [];
    (d.data?.results || []).forEach((r: any) => { if (r.subjects) results.push(...r.subjects); });
    setItems(results);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">🎥 MovieBox</h1>
      <div className="flex gap-2 mb-8">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Search movies..." className="flex-1 bg-[#1a1a2e] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-red-500 outline-none" />
        <button onClick={doSearch} className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition">Search</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((m: any) => (
          <Link key={m.subjectId} href={`/moviebox/${m.subjectId}`} className="group">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900">
              {m.cover && <Image src={m.cover} alt={m.title || ''} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 20vw" />}
            </div>
            <p className="text-white text-sm mt-2 line-clamp-2">{m.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
