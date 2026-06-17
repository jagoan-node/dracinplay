'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function MangaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [manga, setManga] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/manga/detail?id=${id}`)
      .then(r => r.json())
      .then(d => { setManga(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;
  if (!manga) return <div className="min-h-screen flex items-center justify-center text-white">Not found</div>;

  return (
    <div className="min-h-screen">
      {manga.cover_image_url && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image src={manga.cover_image_url} alt={manga.title || ''} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        </div>
      )}
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {manga.cover_image_url && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <Image src={manga.cover_image_url} alt={manga.title || ''} fill className="object-cover" sizes="256px" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Manga</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">{manga.title}</h1>
            {manga.alternative_title && <p className="text-gray-500 text-sm mb-2">{manga.alternative_title}</p>}
            <div className="flex gap-4 text-sm text-gray-400 mb-4">
              {manga.status && <span>{manga.status}</span>}
              {manga.release_year && <span>{manga.release_year}</span>}
              {manga.latest_chapter_number && <span>Ch. {manga.latest_chapter_number}</span>}
              {manga.view_count && <span>{manga.view_count} views</span>}
            </div>
            {manga.taxonomy && <div className="flex flex-wrap gap-2 mb-4">{(Array.isArray(manga.taxonomy) ? manga.taxonomy : []).map((t: any) => <span key={t.name || t} className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300">{t.name || t}</span>)}</div>}
            {manga.description && <p className="text-gray-400 text-sm leading-relaxed">{manga.description}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
