'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ShortDramaCard from '@/components/ShortDramaCard';
import type { NormalizedShortDrama } from '@/lib/api';

interface Section {
  title: string;
  provider: string;
  color: string;
  data: NormalizedShortDrama[];
}

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      const sectionConfigs = [
        { title: '🔥 Melolo Short Drama', provider: 'melolo', color: '#e63946' },
        { title: '🌊 FreeReels Short Drama', provider: 'freereels', color: '#06b6d4' },
        { title: '📦 DramaBox', provider: 'dramabox', color: '#a855f7' },
        { title: '🎬 DramaWave', provider: 'dramawave', color: '#f59e0b' },
        { title: '✨ DramaNova', provider: 'dramanova', color: '#10b981' },
        { title: '⭐ GoodShort', provider: 'goodshort', color: '#3b82f6' },
      ];

      const results: Section[] = [];

      for (const config of sectionConfigs) {
        try {
          const res = await fetch(`/api/home?provider=${config.provider}`);
          const data = await res.json();
          if (data.dramas && data.dramas.length > 0) {
            results.push({
              title: config.title,
              provider: config.provider,
              color: config.color,
              data: data.dramas.slice(0, 10),
            });
          }
        } catch {
          // Provider not available
        }
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
          Streaming drama China, Korea, dan Short Drama favorit kamu secara gratis.
          Kualitas HD, subtitle Indonesia, update setiap hari.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/short-dramas"
            className="px-6 py-3 bg-[#e63946] text-white rounded-xl font-medium hover:bg-[#ff4757] transition-all"
          >
            🎬 Short Drama
          </Link>
          <Link
            href="/browse"
            className="px-6 py-3 bg-[#1a1a2e] text-white rounded-xl font-medium border border-white/10 hover:bg-[#252540] transition-all"
          >
            📖 Browse Semua
          </Link>
        </div>
      </div>

      {/* Drama Sections */}
      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-[#1a1a2e] rounded w-48 mb-4"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="aspect-[3/4] bg-[#1a1a2e] rounded-xl"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Tidak ada drama tersedia saat ini.</p>
          <Link href="/short-dramas" className="text-[#e63946] hover:underline mt-4 inline-block">
            Lihat Short Drama →
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.provider}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">{section.title}</h2>
                <Link
                  href={`/short/${section.provider}/all`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Lihat Semua →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {section.data.map((drama) => (
                  <ShortDramaCard
                    key={drama.id}
                    drama={drama}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
