'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ShortDramaCard from '@/components/ShortDramaCard';
import type { NormalizedShortDrama } from '@/lib/api';

interface Section {
  title: string;
  provider: string;
  color: string;
  link: string;
  data: NormalizedShortDrama[];
}

const featureCards = [
  { title: '🎬 Short Drama', desc: '11 providers, ribuan drama', href: '/short-dramas', color: 'from-[#e63946] to-[#ff6b6b]' },
  { title: '📺 Anime', desc: 'Anime subtitle Indonesia', href: '/anime', color: 'from-red-600 to-red-400' },
  { title: '🎥 MovieBox', desc: 'Film & series terbaru', href: '/moviebox', color: 'from-yellow-600 to-yellow-400' },
  { title: '📖 Manga', desc: 'Baca manga terupdate', href: '/manga', color: 'from-green-600 to-green-400' },
  { title: '⬇️ Downloader', desc: 'Download video sosmed', href: '/downloader', color: 'from-purple-600 to-purple-400' },
];

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      const configs = [
        { title: '🔥 Melolo', provider: 'melolo', color: '#e63946', link: '/short/melolo/all' },
        { title: '🌊 FreeReels', provider: 'freereels', color: '#06b6d4', link: '/short/freereels/all' },
        { title: '📦 DramaBox', provider: 'dramabox', color: '#a855f7', link: '/short/dramabox/all' },
        { title: '🎬 DramaWave', provider: 'dramawave', color: '#f59e0b', link: '/short/dramawave/all' },
        { title: '✨ DramaNova', provider: 'dramanova', color: '#10b981', link: '/short/dramanova/all' },
        { title: '⭐ GoodShort', provider: 'goodshort', color: '#3b82f6', link: '/short/goodshort/all' },
        { title: '💎 ReelShort', provider: 'reelshort', color: '#ec4899', link: '/short/reelshort/all' },
        { title: '🚀 ShortMax', provider: 'shortmax', color: '#14b8a6', link: '/short/shortmax/all' },
        { title: '🌸 MeloShort', provider: 'meloshort', color: '#f43f5e', link: '/short/meloshort/all' },
        { title: '🔴 NetShort', provider: 'netshort', color: '#f97316', link: '/short/netshort/all' },
        { title: '🎞️ FlickReels', provider: 'flickreels', color: '#6366f1', link: '/short/flickreels/all' },
      ];

      const results: Section[] = [];
      await Promise.all(configs.map(async (config) => {
        try {
          const res = await fetch(`/api/short/${config.provider}/home`);
          const data = await res.json();
          let dramas: NormalizedShortDrama[] = [];
          const raw = data.data || data;

          if (Array.isArray(raw)) {
            const books = raw.flatMap((s: Record<string, unknown>) => (s.books as Record<string, unknown>[]) || []);
            dramas = (books as Record<string, unknown>[]).map(b => ({
              id: (b.drama_id as string) || '', title: (b.drama_name as string) || 'Untitled',
              cover: (b.thumb_url as string) || '', description: (b.description as string) || '',
              episodeCount: (b.episode_count as number) || 0, tags: (b.tags as string[]) || [], provider: config.provider,
            }));
          } else if (raw.recommentList) {
            dramas = raw.recommentList.map((b: Record<string, unknown>) => ({
              id: (b.id as string) || '', title: (b.name as string) || (b.title as string) || 'Untitled',
              cover: (b.cover as string) || (b.thumb_url as string) || '', description: (b.description as string) || '',
              episodeCount: (b.chapterCount as number) || 0, tags: (b.tags as string[]) || [], provider: config.provider,
            }));
          } else if (raw.columnVoList) {
            const books = raw.columnVoList.flatMap((c: Record<string, unknown>) => (c.bookList as Record<string, unknown>[]) || []);
            dramas = books.map((b: Record<string, unknown>) => ({
              id: (b.bookId as string) || '', title: (b.bookName as string) || 'Untitled',
              cover: (b.coverWap as string) || '', description: (b.introduction as string) || '',
              episodeCount: (b.chapterCount as number) || 0, tags: (b.tags as string[]) || [], provider: config.provider,
            }));
          } else if (raw.items) {
            dramas = raw.items.map((b: Record<string, unknown>) => ({
              id: (b.id as string) || '', title: (b.name as string) || (b.title as string) || 'Untitled',
              cover: (b.cover as string) || '', description: (b.description as string) || '',
              episodeCount: (b.episode_count as number) || 0, tags: (b.tags as string[]) || [], provider: config.provider,
            }));
          } else {
            for (const mod of ['newDramas', 'hotDramas', 'recommendDramas']) {
              const items = raw[mod]?.items || [];
              dramas.push(...items.map((b: Record<string, unknown>) => ({
                id: (b.id as string) || '', title: (b.name as string) || 'Untitled',
                cover: (b.cover as string) || '', description: (b.description as string) || '',
                episodeCount: (b.episode_count as number) || 0, tags: (b.tags as string[]) || [], provider: config.provider,
              })));
            }
          }

          if (dramas.length > 0) {
            results.push({ title: config.title, provider: config.provider, color: config.color, link: config.link, data: dramas.slice(0, 10) });
          }
        } catch { /* skip */ }
      }));

      // Sort to match config order
      const order = configs.map(c => c.provider);
      results.sort((a, b) => order.indexOf(a.provider) - order.indexOf(b.provider));
      setSections(results);
      setLoading(false);
    }
    loadSections();
  }, []);

  return (
    <div className="min-h-screen pb-4">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e63946]/10 via-transparent to-transparent" />
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 animate-slide-up">
            Nonton <span className="text-[#e63946]">Drama</span> Gratis
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            Streaming drama China, Korea, Short Drama, Anime, Movie, dan Manga favorit kamu. HD, subtitle Indonesia, update tiap hari.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link href="/short-dramas" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#e63946] text-white rounded-xl font-medium hover:bg-[#ff4757] transition-all text-sm sm:text-base">
              🎬 Short Drama
            </Link>
            <Link href="/anime" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 transition-all text-sm sm:text-base">
              📺 Anime
            </Link>
            <Link href="/moviebox" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-500 transition-all text-sm sm:text-base">
              🎥 MovieBox
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {featureCards.map((card, i) => (
            <Link key={card.href} href={card.href} className={`bg-gradient-to-br ${card.color} rounded-xl p-3 sm:p-4 text-center card-hover stagger-item`} style={{ animationDelay: `${i * 60}ms` }}>
              <h3 className="text-white font-bold text-sm sm:text-base mb-0.5">{card.title}</h3>
              <p className="text-white/80 text-xs">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Drama Sections */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-[#1a1a2e] rounded w-40 mb-4" />
                <div className="flex gap-3 overflow-hidden">
                  {[1, 2, 3, 4, 5].map(j => <div key={j} className="w-36 sm:w-44 aspect-[2/3] bg-[#1a1a2e] rounded-xl shrink-0" />)}
                </div>
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">Tidak ada drama tersedia</p>
            <Link href="/short-dramas" className="text-[#e63946] hover:underline">Lihat Short Drama →</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.provider} className="stagger-item">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{section.title}</h2>
                  <Link href={section.link} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    Semua <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {section.data.map(drama => (
                    <div key={drama.id} className="w-36 sm:w-44 shrink-0">
                      <ShortDramaCard drama={drama} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
