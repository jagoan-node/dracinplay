'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [manga, setManga] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/manga/detail?id=${id}`)
      .then(r => r.json())
      .then(d => { setManga(d.data); setLoading(false); })
      .catch(() => { setError('Gagal memuat'); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingSkeleton type="detail" />;
  if (error || !manga) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error || 'Not found'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[#e63946] text-white rounded-lg text-sm">Kembali</button>
      </div>
    </div>
  );

  const chapters = manga.chapters || [];

  return (
    <div className="min-h-screen pb-4 page-enter">
      {manga.cover_image_url && (
        <div className="relative h-[40vh] sm:h-[50vh] min-h-[250px] overflow-hidden">
          <Image src={manga.cover_image_url} alt={manga.title || ''} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        </div>
      )}
      <div className="relative -mt-24 sm:-mt-32 max-w-5xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {manga.cover_image_url && (
            <div className="shrink-0 w-40 sm:w-48 md:w-56 mx-auto md:mx-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image src={manga.cover_image_url} alt={manga.title || ''} fill className="object-cover" sizes="224px" />
              </div>
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Manga</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-3 mb-2">{manga.title}</h1>
            {manga.alternative_title && <p className="text-gray-500 text-sm mb-2">{manga.alternative_title}</p>}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-400 mb-3">
              {manga.status && <span className="bg-white/5 px-2 py-0.5 rounded">{manga.status}</span>}
              {manga.release_year && <span>{manga.release_year}</span>}
              {manga.latest_chapter_number && <span>Ch. {manga.latest_chapter_number}</span>}
              {manga.view_count && <span>{manga.view_count} views</span>}
            </div>
            {manga.taxonomy && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {(Array.isArray(manga.taxonomy) ? manga.taxonomy : []).map((t: any) => <span key={t.name || t} className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300">{t.name || t}</span>)}
              </div>
            )}
            {manga.description && <p className="text-gray-400 text-sm leading-relaxed">{manga.description}</p>}
          </div>
        </div>
        {chapters.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Chapters ({chapters.length})</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {chapters.map((ch: any) => (
                <Link key={ch.chapter_id || ch.id} href={`/manga/read/${ch.chapter_id || ch.id}`}
                  className="touch-target rounded-lg text-sm font-medium bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/5 transition-all card-hover">
                  {ch.chapter_number || ch.number || ch.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}