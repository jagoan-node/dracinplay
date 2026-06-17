'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HlsPlayer from '@/components/HlsPlayer';

export default function AnimeWatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const series = params.id as string;
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/anime/stream?slug=${slug}`)
      .then(r => r.json())
      .then(d => { setStream(d.data?.[0] || d.data); setLoading(false); })
      .catch(() => { setError('Gagal memuat stream'); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white border-t-[#e63946] rounded-full animate-spin" />
    </div>
  );

  if (error || !stream) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error || 'Stream not found'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[#e63946] text-white rounded-lg text-sm">Kembali</button>
      </div>
    </div>
  );

  const streams = stream.streams || {};
  const resos = Object.keys(streams);
  const videoUrl = resos.length > 0 ? streams[resos[0]]?.[0]?.link : '';

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-4 page-enter">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="mb-3">
          <HlsPlayer src={videoUrl} autoPlay={true} title={`Anime - ${slug}`} />
        </div>
        <Link href={`/anime/${series}`} className="text-sm text-gray-400 hover:text-white inline-flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali ke daftar episode
        </Link>
        {resos.length > 0 && (
          <div className="mt-2">
            <h3 className="text-white text-sm font-semibold mb-2">Resolusi</h3>
            <div className="flex flex-wrap gap-2">
              {resos.map(r => <span key={r} className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">{r}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}