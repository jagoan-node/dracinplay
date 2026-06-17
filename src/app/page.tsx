'use client';
// @ts-nocheck
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
  { title: '🎬 Short Drama', desc: '11 providers, ribuan drama pendek', href: '/short-dramas', color: 'from-[#e63946] to-[#ff6b6b]' },
  { title: '📺 Anime', desc: 'Nonton anime subtitle Indonesia', href: '/anime', color: 'from-red-600 to-red-400' },
  { title: '🎥 MovieBox', desc: 'Film dan series terbaru', href: '/moviebox', color: 'from-yellow-600 to-yellow-400' },
  { title: '📖 Manga', desc: 'Baca manga terupdate', href: '/manga', color: 'from-green-600 to-green-400' },
  { title: '⬇️ Downloader', desc: 'Download video sosmed', href: '/downloader', color: 'from-purple-600 to-purple-400' },
];

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      const sectionConfigs = [
        { title: '🔥 Melolo Short Drama', provider: 'melolo', color: '#e63946', link: '/short/melolo/all' },
        { title: '🌊 FreeReels Short Drama', provider: 'freereels', color: '#06b6d4', link: '/short/freereels/all' },
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

      for (const config of sectionConfigs) {
        try {
          const res = await fetch(`/api/short/${config.provider}/home`);
          const data = await res.json();
          let dramas: NormalizedShortDrama[] = [];

          // Normalize based on provider
          if (config.provider === 'melolo' || config.provider === 'freereels') {
            const books = (data.data || []).flatMap((s: Record<string, unknown>) => s.books || []);
            dramas = (books as Record<string, unknown>[]).map((b) => ({
              id: (b.drama_id as string) || '',
              title: (b.drama_name as string) || 'Untitled',
              cover: (b.thumb_url as string) || '',
              description: (b.description as string) || '',
              episodeCount: (b.episode_count as number) || 0,
              tags: (b.tags as string[]) || [],
              provider: config.provider,
            }));
          } else if (config.provider === 'dramabox') {
            const cols = data.data?.columnVoList || [];
            const books = cols.flatMap((c: Record<string, unknown>) => c.bookList || []);
            dramas = (books as Record<string, unknown>[]).map((b) => ({
              id: (b.bookId as string) || '',
              title: (b.bookName as string) || 'Untitled',
              cover: (b.coverWap as string) || '',
              description: (b.introduction as string) || '',
              episodeCount: (b.chapterCount as number) || 0,
              tags: (b.tags as string[]) || [],
              provider: config.provider,
            }));
          } else if (config.provider === 'dramawave') {
            dramas = (data.data?.items || []).map((b: Record<string, unknown>) => ({
              id: (b.id as string) || '',
              title: (b.name as string) || (b.title as string) || 'Untitled',
              cover: (b.cover as string) || '',
              description: (b.description as string) || '',
              episodeCount: (b.episode_count as number) || 0,
              tags: (b.tags as string[]) || [],
              provider: config.provider,
            }));
          } else if (config.provider === 'dramanova') {
            for (const mod of ['newDramas', 'hotDramas', 'recommendDramas']) {
              const items = data.data?.[mod]?.items || [];
              dramas.push(...(items as Record<string, unknown>[]).map((b) => ({
                id: (b.id as string) || '',
                title: (b.name as string) || 'Untitled',
                cover: (b.cover as string) || '',
                description: (b.description as string) || '',
                episodeCount: (b.episode_count as number) || 0,
                tags: (b.tags as string[]) || [],
                provider: config.provider,
              })));
            }
          } else if (config.provider === 'goodshort') {
            dramas = (data.data?.recommentList || []).map((b: Record<string, unknown>) => ({
              id: (b.id as string) || '',
              title: (b.name as string) || (b.title as string) || 'Untitled',
              cover: (b.cover as string) || (b.thumb_url as string) || '',
              description: (b.description as string) || '',
              episodeCount: (b.chapterCount as number) || 0,
              tags: (b.tags as string[]) || [],
              provider: config.provider,
            }));
          } else {
            // Generic for new providers
            const d = data.data || data;
            let allBooks: any[] = [];
            if (Array.isArray(d)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              allBooks = (d as any[]).flatMap((s: any) => s.books || s.items || [s]);
            } else if (typeof d === 'object') {
              const sections = (d as any).sections || (d as any).modules || (d as any).columnVoList || [];
              if (Array.isArray(sections)) {
                allBooks = (sections as any[]).flatMap((s: any) => s.books || s.items || s.bookList || []);
              }
              if (allBooks.length === 0) {
                allBooks = (d as any).items || (d as any).recommentList || (d as any).dramas || [];
              }
              if (allBooks.length === 0) {
                for (const key of Object.keys(d as Record<string, unknown>)) {
                  const val = (d as any)[key];
                  if (val && typeof val === 'object' && 'items' in val) {
                    allBooks.push(...(val.items || []));
                  }
                }
              }
            }
            dramas = allBooks.map((b) => ({
              id: (b.drama_id as string) || (b.bookId as string) || (b.id as string) || '',
              title: (b.drama_name as string) || (b.bookName as string) || (b.name as string) || (b.title as string) || 'Untitled',
              cover: (b.thumb_url as string) || (b.cover as string) || (b.coverWap as string) || (b.image as string) || '',
              description: (b.description as string) || '',
              episodeCount: (b.episode_count as number) || (b.chapterCount as number) || 0,
              tags: (b.tags as string[]) || [],
              provider: config.provider,
            }));
          }

          if (dramas.length > 0) {
            results.push({
              title: config.title,
              provider: config.provider,
              color: config.color,
              link: config.link,
              data: dramas.slice(0, 10),
            });
          }
        } catch { /* skip */ }
      }

      setSections(results);
      setLoading(false);
    }
    loadSections();
  }, []);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Nonton <span className="text-[#e63946]">Drama</span> Gratis
        </h1>
        <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
          Streaming drama China, Korea, Short Drama, Anime, Movie, dan Manga favorit kamu secara gratis.
          Kualitas HD, subtitle Indonesia, update setiap hari.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/short-dramas" className="px-6 py-3 bg-[#e63946] text-white rounded-xl font-medium hover:bg-[#ff4757] transition-all">
            🎬 Short Drama
          </Link>
          <Link href="/anime" className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 transition-all">
            📺 Anime
          </Link>
          <Link href="/moviebox" className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-500 transition-all">
            🎥 MovieBox
          </Link>
          <Link href="/manga" className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-500 transition-all">
            📖 Manga
          </Link>
          <Link href="/browse" className="px-6 py-3 bg-[#1a1a2e] text-white rounded-xl font-medium border border-white/10 hover:bg-[#252540] transition-all">
            📖 Browse Drama
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-12">
        {featureCards.map((card) => (
          <Link key={card.href} href={card.href} className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-center hover:scale-[1.03] transition-transform`}>
            <h3 className="text-white font-bold text-sm mb-1">{card.title}</h3>
            <p className="text-white/80 text-xs">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Drama Sections */}
      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-[#1a1a2e] rounded w-48 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => <div key={j} className="aspect-[3/4] bg-[#1a1a2e] rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Tidak ada drama tersedia saat ini.</p>
          <Link href="/short-dramas" className="text-[#e63946] hover:underline mt-4 inline-block">Lihat Short Drama →</Link>
        </div>
      ) : (
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.provider}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">{section.title}</h2>
                <Link href={section.link} className="text-sm text-gray-400 hover:text-white transition-colors">Lihat Semua →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {section.data.map((drama) => <ShortDramaCard key={drama.id} drama={drama} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
