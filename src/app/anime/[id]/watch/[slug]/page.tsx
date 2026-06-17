'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AnimeWatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/anime/stream?slug=${slug}`)
      .then(r => r.json())
      .then(d => { setStream(d.data?.[0] || d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;
  if (!stream) return <div className="min-h-screen flex items-center justify-center text-white">Stream not found</div>;

  const streams = stream.streams || {};
  const resos = Object.keys(streams);
  const videoUrl = resos.length > 0 ? streams[resos[0]]?.[0]?.link : '';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link href={`/anime/${params.id}`} className="text-gray-400 hover:text-white mb-4 inline-block">← Back</Link>
        {videoUrl ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <video src={videoUrl} controls autoPlay className="w-full h-full" />
          </div>
        ) : (
          <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-gray-500">Video not available</div>
        )}
        {resos.length > 1 && (
          <div className="mt-4 flex gap-2">
            {resos.map(r => <span key={r} className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">{r}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
