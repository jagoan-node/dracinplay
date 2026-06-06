'use client';

import { useState, useEffect } from 'react';
import ShortDramaCard from '@/components/ShortDramaCard';
import type { NormalizedShortDrama } from '@/lib/api';

type Provider = 'all' | 'melolo' | 'freereels' | 'dramabox' | 'dramawave' | 'dramanova' | 'goodshort';

const providers: { key: Provider; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'bg-[#e63946]' },
  { key: 'melolo', label: 'Melolo', color: 'bg-[#e63946]' },
  { key: 'freereels', label: 'FreeReels', color: 'bg-cyan-500' },
  { key: 'dramabox', label: 'DramaBox', color: 'bg-purple-500' },
  { key: 'dramawave', label: 'DramaWave', color: 'bg-amber-500' },
  { key: 'dramanova', label: 'DramaNova', color: 'bg-emerald-500' },
  { key: 'goodshort', label: 'GoodShort', color: 'bg-blue-500' },
];

export default function ShortDramasPage() {
  const [activeProvider, setActiveProvider] = useState<Provider>('all');
  const [dramas, setDramas] = useState<NormalizedShortDrama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const allDramas: NormalizedShortDrama[] = [];

      try {
        // Melolo
        const meloloRes = await fetch('/api/short/melolo/home');
        const meloloData = await meloloRes.json();
        const meloloBooks = (meloloData.data || []).flatMap((s: { books?: unknown[] }) => s.books || []);
        const meloloItems = meloloBooks.map((b: Record<string, unknown>) => ({
          id: b.drama_id || '',
          title: (b.drama_name as string) || 'Untitled',
          cover: (b.thumb_url as string) || '',
          description: (b.description as string) || '',
          episodeCount: (b.episode_count as number) || 0,
          tags: (b.tags as string[]) || [],
          provider: 'melolo',
        }));
        allDramas.push(...meloloItems);
      } catch { /* skip */ }

      try {
        // FreeReels
        const frRes = await fetch('/api/short/freereels/home');
        const frData = await frRes.json();
        const frBooks = (frData.data || []).flatMap((s: { books?: unknown[] }) => s.books || []);
        const frItems = frBooks.map((b: Record<string, unknown>) => ({
          id: b.drama_id || '',
          title: (b.drama_name as string) || 'Untitled',
          cover: (b.thumb_url as string) || '',
          description: (b.description as string) || '',
          episodeCount: (b.episode_count as number) || 0,
          tags: (b.tags as string[]) || [],
          provider: 'freereels',
        }));
        allDramas.push(...frItems);
      } catch { /* skip */ }

      try {
        // DramaBox
        const dbRes = await fetch('/api/short/dramabox/home');
        const dbData = await dbRes.json();
        const dbBooks = (dbData.data?.columnVoList || []).flatMap((col: { bookList?: unknown[] }) => col.bookList || []);
        const dbItems = dbBooks.map((b: Record<string, unknown>) => ({
          id: b.bookId || '',
          title: (b.bookName as string) || 'Untitled',
          cover: (b.coverWap as string) || '',
          description: (b.introduction as string) || '',
          episodeCount: (b.chapterCount as number) || 0,
          tags: (b.tags as string[]) || [],
          provider: 'dramabox',
        }));
        allDramas.push(...dbItems);
      } catch { /* skip */ }

      try {
        // DramaWave
        const dwRes = await fetch('/api/short/dramawave/home');
        const dwData = await dwRes.json();
        const dwItems = (dwData.data?.items || []).map((b: Record<string, unknown>) => ({
          id: b.id || '',
          title: (b.name as string) || (b.title as string) || 'Untitled',
          cover: (b.cover as string) || (b.image as string) || '',
          description: (b.description as string) || '',
          episodeCount: (b.episode_count as number) || (b.chapterCount as number) || 0,
          tags: (b.tags as string[]) || [],
          provider: 'dramawave',
        }));
        allDramas.push(...dwItems);
      } catch { /* skip */ }

      try {
        // DramaNova
        const dnRes = await fetch('/api/short/dramanova/home');
        const dnData = await dnRes.json();
        const dnModules = ['newDramas', 'hotDramas', 'recommendDramas'];
        for (const mod of dnModules) {
          const items = dnData.data?.[mod]?.items || [];
          for (const b of items) {
            allDramas.push({
              id: b.id || '',
              title: b.name || b.title || 'Untitled',
              cover: b.cover || '',
              description: b.description || '',
              episodeCount: b.episode_count || 0,
              tags: b.tags || [],
              provider: 'dramanova',
            });
          }
        }
      } catch { /* skip */ }

      try {
        // GoodShort
        const gsRes = await fetch('/api/short/goodshort/home');
        const gsData = await gsRes.json();
        const gsItems = (gsData.data?.recommentList || []).map((b: Record<string, unknown>) => ({
          id: b.id || '',
          title: (b.name as string) || (b.title as string) || (b.drama_name as string) || 'Untitled',
          cover: (b.cover as string) || (b.thumb_url as string) || (b.image as string) || '',
          description: (b.description as string) || '',
          episodeCount: (b.episode_count as number) || (b.chapterCount as number) || 0,
          tags: (b.tags as string[]) || [],
          provider: 'goodshort',
        }));
        allDramas.push(...gsItems);
      } catch { /* skip */ }

      setDramas(allDramas);
      setLoading(false);
    }
    loadAll();
  }, []);

  const filtered = activeProvider === 'all'
    ? dramas
    : dramas.filter((d) => d.provider === activeProvider);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">
        Short Drama <span className="text-[#e63946]">Hub</span>
      </h1>
      <p className="text-gray-500 text-sm mb-6">Browse short dramas from multiple providers</p>

      {/* Provider Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {providers.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveProvider(p.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeProvider === p.key
                ? `${p.color} text-white`
                : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} dramas found
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#1a1a2e] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No short dramas available from this provider</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((drama) => (
            <ShortDramaCard key={`${drama.provider}-${drama.id}`} drama={drama} />
          ))}
        </div>
      )}
    </div>
  );
}
