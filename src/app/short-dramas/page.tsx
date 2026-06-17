'use client';

import { useState, useEffect } from 'react';
import ShortDramaCard from '@/components/ShortDramaCard';
import type { NormalizedShortDrama } from '@/lib/api';

type Provider = 'all' | 'reelshort' | 'shortmax' | 'meloshort' | 'melolo' | 'freereels' | 'dramabox' | 'dramawave' | 'dramanova' | 'goodshort' | 'netshort' | 'flickreels';

const providers: { key: Provider; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'bg-[#e63946]' },
  { key: 'reelshort', label: 'ReelShort', color: 'bg-red-500' },
  { key: 'shortmax', label: 'ShortMax', color: 'bg-orange-500' },
  { key: 'meloshort', label: 'MeloShort', color: 'bg-pink-500' },
  { key: 'melolo', label: 'Melolo', color: 'bg-[#e63946]' },
  { key: 'freereels', label: 'FreeReels', color: 'bg-cyan-500' },
  { key: 'dramabox', label: 'DramaBox', color: 'bg-purple-500' },
  { key: 'dramawave', label: 'DramaWave', color: 'bg-amber-500' },
  { key: 'dramanova', label: 'DramaNova', color: 'bg-emerald-500' },
  { key: 'goodshort', label: 'GoodShort', color: 'bg-blue-500' },
  { key: 'netshort', label: 'Netshort', color: 'bg-teal-500' },
  { key: 'flickreels', label: 'FlickReels', color: 'bg-indigo-500' },
];

function normalizeBooks(books: any[], provider: string): NormalizedShortDrama[] {
  return (books || []).map((b: any) => ({
    id: b.drama_id || b.bookId || b.id || '',
    title: b.drama_name || b.bookName || b.shortPlayName || b.name || b.title || 'Untitled',
    cover: b.thumb_url || b.coverWap || b.cover || b.image || b.drama_cover || '',
    description: b.description || b.introduction || b.drama_description || '',
    episodeCount: b.episode_count || b.chapterCount || b.chapters_total || 0,
    tags: b.tags || [],
    provider,
  }));
}

export default function ShortDramasPage() {
  const [activeProvider, setActiveProvider] = useState<Provider>('all');
  const [dramas, setDramas] = useState<NormalizedShortDrama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const allDramas: NormalizedShortDrama[] = [];
      const fetchers = [
        'reelshort', 'shortmax', 'meloshort', 'melolo', 'freereels',
        'dramabox', 'dramawave', 'dramanova', 'goodshort', 'netshort', 'flickreels',
      ];

      await Promise.all(fetchers.map(async (provider) => {
        try {
          const res = await fetch(`/api/short/${provider}/home`);
          const data = await res.json();
          const raw = data.data || data;
          let books: any[] = [];

          if (Array.isArray(raw)) {
            raw.forEach((section: any) => {
              if (section.books) books.push(...section.books);
            });
          } else if (raw.recommentList) {
            books = raw.recommentList;
          } else if (raw.columnVoList) {
            raw.columnVoList.forEach((col: any) => {
              if (col.bookList) books.push(...col.bookList);
            });
          } else if (raw.hotDramas?.items) {
            books = raw.hotDramas.items;
          } else if (raw.items) {
            books = raw.items;
          }

          allDramas.push(...normalizeBooks(books, provider));
        } catch { /* skip */ }
      }));

      setDramas(allDramas);
      setLoading(false);
    }
    loadAll();
  }, []);

  const filtered = activeProvider === 'all' ? dramas : dramas.filter(d => d.provider === activeProvider);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">🎬 Short Dramas</h1>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {providers.map(p => (
          <button
            key={p.key}
            onClick={() => setActiveProvider(p.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeProvider === p.key ? `${p.color} text-white` : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-800 rounded-xl" />
              <div className="h-4 bg-gray-800 rounded mt-2 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((drama) => (
            <ShortDramaCard key={`${drama.provider}-${drama.id}`} drama={drama} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-500 py-12">No dramas found</div>
      )}
    </div>
  );
}
