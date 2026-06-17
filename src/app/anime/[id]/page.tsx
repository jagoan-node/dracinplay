'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const series = params.id as string;
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/anime/detail?series=${series}`)
      .then(r => r.json())
      .then(d => { setAnime(d.data?.[0] || d.data); setLoading(false); })
      .catch(() => { setError('Gagal memuat'); setLoading(false); });
  }, [series]);

  if (loading) return <LoadingSkeleton type="detail" />;
  if (error || !anime) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error || 'Not found'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[#e63946] text-white rounded-lg text-sm">Kembali</button>
      </div>
    </div>
  );

  const chapters = anime.chapter || [];

  return (
    <div className="min-h-screen pb-4 page-enter">
      {anime.cover && (
        <div className="relative h-[40vh] sm:h-[50vh] min-h-[250px] overflow-hidden">
          <Image src={anime.cover} alt={anime.judul || ''} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        </div>
      )}
      <div className="relative -mt-24 sm:-mt-32 max-w-5xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {anime.cover && (
            <div className="shrink-0 w-40 sm:w-48 md:w-56 mx-auto md:mx-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image src={anime.cover} alt={anime.judul || ''} fill className="object-cover" sizes="224px" />
              </div>
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Anime</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-3 mb-3">{anime.judul || anime.title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-400 mb-3">
              {anime.status && <span className="bg-white/5 px-2 py-0.5 rounded">{anime.status}</span>}
              {anime.rating && <span>⭐ {anime.rating}</span>}
              {anime.type && <span className="bg-white/5 px-2 py-0.5 rounded">{anime.type}</span>}
            </div>
            {anime.genre && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {anime.genre.map((g: string) => <span key={g} className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">{g}</span>)}
              </div>
            )}
            {anime.sinopsis && <p className="text-gray-400 text-sm leading-relaxed">{anime.sinopsis}</p>}
          </div>
        </div>
        {chapters.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Episodes ({chapters.length})</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {chapters.map((ch: any) => (
                <Link key={ch.id || ch.url} href={`/anime/${series}/watch/${ch.url || ch.id}`}
                  className="touch-target rounded-lg text-sm font-medium bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/5 transition-all card-hover">
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