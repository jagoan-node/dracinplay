'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AnimeDetailPage() {
  const params = useParams();
  const series = params.id as string;
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/anime/detail?series=${series}`)
      .then(r => r.json())
      .then(d => { setAnime(d.data?.[0] || d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [series]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;
  if (!anime) return <div className="min-h-screen flex items-center justify-center text-white">Not found</div>;

  const chapters = anime.chapter || [];

  return (
    <div className="min-h-screen">
      {anime.cover && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image src={anime.cover} alt={anime.judul || ''} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        </div>
      )}
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {anime.cover && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <Image src={anime.cover} alt={anime.judul || ''} fill className="object-cover" sizes="256px" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Anime</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">{anime.judul || anime.title}</h1>
            <div className="flex gap-4 text-sm text-gray-400 mb-4">
              {anime.status && <span>{anime.status}</span>}
              {anime.rating && <span>⭐ {anime.rating}</span>}
              {anime.type && <span>{anime.type}</span>}
            </div>
            {anime.genre && <div className="flex flex-wrap gap-2 mb-4">{anime.genre.map((g: string) => <span key={g} className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">{g}</span>)}</div>}
            {anime.sinopsis && <p className="text-gray-400 text-sm leading-relaxed">{anime.sinopsis}</p>}
          </div>
        </div>
        {chapters.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Episodes ({chapters.length})</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {chapters.map((ch: any) => (
                <Link key={ch.id || ch.url} href={`/anime/${series}/watch/${ch.url || ch.id}`} className="flex items-center justify-center py-3 px-3 rounded-lg text-sm font-medium bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10 transition-all">
                  {ch.ch || ch.episode || ch.url}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
