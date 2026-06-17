'use client';

import { useState, useEffect } from 'react';
import ShortDramaCard from '@/components/ShortDramaCard';
import type { NormalizedShortDrama } from '@/lib/api';

type Provider = 'all' | 'reelshort' | 'shortmax' | 'meloshort' | 'melolo' | 'freereels' | 'dramabox' | 'dramawave' | 'dramanova' | 'goodshort' | 'netshort' | 'flickreels';

const providers: { key: Provider; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'bg-[#e63946]' },
  { key: 'reelshort', label: 'ReelShort', color: 'bg-pink-500' },
  { key: 'shortmax', label: 'ShortMax', color: 'bg-orange-500' },
  { key: 'meloshort', label: 'MeloShort', color: 'bg-rose-500' },
  { key: 'melolo', label: 'Melolo', color: 'bg-[#e63946]' },
  { key: 'freereels', label: 'FreeReels', color: 'bg-cyan-500' },
  { key: 'dramabox', label: 'DramaBox', color: 'bg-purple-500' },
  { key: 'dramawave', label: 'DramaWave', color: 'bg-amber-500' },
  { key: 'dramanova', label: 'DramaNova', color: 'bg-emerald-500' },
  { key: 'goodshort', label: 'GoodShort', color: 'bg-blue-500' },
  { key: 'netshort', label: 'Netshort', color: 'bg-teal-500' },
  { key: 'flickreels', label: 'FlickReels', color: 'bg-indigo-500' },
];

function normalizeBooks(books: Record<string, unknown>[], provider: string): NormalizedShortDrama[] {
  return (books || []).map(b => ({
    id: (b.drama_id as string) || (b.bookId as string) || (b.id as string) || '',
    title: (b.drama_name as string) || (b.bookName as string) || (b.shortPlayName as string) || (b.name as string) || (b.title as string) || 'Untitled',
    cover: (b.thumb_url as string) || (b.coverWap as string) || (b.cover as string) || (b.image as string) || (b.drama_cover as string) || '',
    description: (b.description as string) || (b.introduction as string) || '',
    episodeCount: (b.episode_count as number) || (b.chapterCount as number) || 0,
    tags: (b.tags as string[]) || [],
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
      const fetchers = ['reelshort', 'shortmax', 'meloshort', 'melolo', 'freereels', 'dramabox', 'dramawave', 'dramanova', 'goodshort', 'netshort', 'flickreels'];

      await Promise.all(fetchers.map(async (provider) => {
        try {
          const res = await fetch(`/api/short/${provider}/home`);
          const data = await res.json();
          const raw = data.data || data;
          let books: Record<string, unknown>[] = [];

          if (Array.isArray(raw)) {
            raw.forEach((section: Record<string, unknown>) => { if (section.books) books.push(...(section.books as Record<string, unknown>[])); });
          } else if (raw.recommentList) {
            books = raw.recommentList;
          } else if (raw.columnVoList) {
            raw.columnVoList.forEach((col: Record<string, unknown>) => { if (col.bookList) books.push(...(col.bookList as Record<string, unknown>[])); });
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
    <div className="min-h-screen pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">🎬 Short Dramas</h1>

        {/* Provider filter - horizontal scroll */}
        <div className="scroll-x mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:gap-2">
          {providers.map(p => (
            <button
              key={p.key}
              onClick={() => setActiveProvider(p.key)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeProvider === p.key ? `${p.color} text-white shadow-lg` : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-gray-500 mb-3">{filtered.length} drama ditemukan</p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-[3/4] bg-[#1a1a2e] rounded-xl mb-2" />
                <div className="h-4 bg-[#1a1a2e] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((drama, i) => (
              <div key={`${drama.provider}-${drama.id}`} className="stagger-item" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <ShortDramaCard drama={drama} />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
            <p>Tidak ada drama ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
