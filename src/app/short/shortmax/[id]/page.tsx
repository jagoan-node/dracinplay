'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ShortmaxDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/short/shortmax/detail?id=${id}`);
        const data = await res.json();
        setDetail(data.data || data);
      } catch {}
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;
  if (!detail) return <div className="min-h-screen flex items-center justify-center text-white">Not found</div>;

  const title = detail.drama_name || detail.bookName || detail.name || detail.title || 'Untitled';
  const cover = detail.thumb_url || detail.cover || detail.coverWap || detail.drama_cover || '';
  const desc = detail.description || detail.introduction || detail.drama_description || '';
  const epCount = detail.episode_count || detail.chapterCount || detail.chapters_total || detail.episodes?.length || 0;
  const episodes = detail.episodes || detail.episode_list || detail.video_list || [];

  return (
    <div className="min-h-screen">
      {cover && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image src={cover} alt={title} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        </div>
      )}
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {cover && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image src={cover} alt={title} fill className="object-cover" sizes="256px" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">ShortMax</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">{title}</h1>
            {epCount > 0 && <p className="text-gray-400 text-sm mb-4">{epCount} Episodes</p>}
            {desc && <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>}
          </div>
        </div>
        {epCount > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Episodes ({epCount})</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {Array.from({ length: epCount }, (_, i) => i + 1).map((ep) => (
                <Link key={ep} href={`/short/shortmax/watch/${id}/${ep}`} className="flex items-center justify-center py-3 px-3 rounded-lg text-sm font-medium bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10 transition-all">
                  {ep}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
