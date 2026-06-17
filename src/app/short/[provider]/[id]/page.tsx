'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const providerColors: Record<string, string> = {
  reelshort: 'bg-[#e63946]',
  shortmax: 'bg-blue-500',
  meloshort: 'bg-purple-500',
  dramabox: 'bg-purple-500',
  dramanova: 'bg-emerald-500',
  dramawave: 'bg-amber-500',
  freereels: 'bg-cyan-500',
  goodshort: 'bg-blue-500',
  melolo: 'bg-[#e63946]',
  netshort: 'bg-orange-500',
  flickreels: 'bg-pink-500',
};

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const provider = params.provider as string;
  const id = params.id as string;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/short/${provider}/detail?id=${id}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        else setDetail(data.data || data);
      } catch {
        setError('Failed to load');
      }
      setLoading(false);
    }
    load();
  }, [provider, id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white border-t-[#e63946] rounded-full animate-spin"></div>
    </div>
  );

  if (error || !detail) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error || 'Not found'}</p>
        <Link href="/short-dramas" className="text-[#e63946] hover:underline">← Back</Link>
      </div>
    </div>
  );

  const title = detail.title || detail.book_title || detail.name || '';
  const cover = detail.cover || detail.image || detail.thumbnail || detail.video_pic || '';
  const desc = detail.description || detail.desc || detail.intro || '';
  const tags = detail.tags || detail.genres || [];
  const chapters = detail.chapters || detail.episodes || detail.videoList || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[300px]">
        {cover && (
          <Image src={cover} alt={title} fill className="object-cover" unoptimized />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-5xl mx-auto">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${providerColors[provider] || 'bg-gray-500'} mb-2 inline-block`}>
            {provider.toUpperCase()}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 5).map((tag: any, i: number) => (
                <span key={i} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                  {typeof tag === 'string' ? tag : tag.name || tag.tag_name || ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Description */}
        {desc && (
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{desc}</p>
        )}

        {/* Play first episode button */}
        {chapters.length > 0 && (
          <button
            onClick={() => {
              const ep = chapters[0];
              const epId = ep.chapter_id || ep.episode_id || ep.id || ep.chapter_number || ep.episode_number || '1';
              router.push(`/short/${provider}/${id}/watch/${epId}`);
            }}
            className="bg-[#e63946] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#c62d3a] transition mb-6 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Watch Episode 1
          </button>
        )}

        {/* Episode list */}
        {chapters.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-4">Episodes ({chapters.length})</h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {chapters.map((ep: any, i: number) => {
                const epNum = ep.chapter_number || ep.episode_number || ep.number || i + 1;
                const epId = ep.chapter_id || ep.episode_id || ep.id || String(epNum);
                return (
                  <button
                    key={i}
                    onClick={() => router.push(`/short/${provider}/${id}/watch/${epId}`)}
                    className="aspect-square rounded-lg text-xs font-bold bg-[#1a1a2e] text-gray-400 hover:bg-[#252540] hover:text-white transition-all"
                  >
                    {epNum}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {chapters.length === 0 && (
          <div className="text-gray-500 text-center py-8">No episodes available</div>
        )}
      </div>
    </div>
  );
}
