'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function MeloshortWatchPage() {
  const params = useParams();
  const id = params.id as string;
  const episode = params.episode as string;
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/short/meloshort/stream?id=${id}&episode=${episode}`);
        const data = await res.json();
        setStream(data.data || data);
      } catch {}
      setLoading(false);
    }
    load();
  }, [id, episode]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;
  if (!stream) return <div className="min-h-screen flex items-center justify-center text-white">Stream not found</div>;

  // Find video URL from various response formats
  const videoUrl = stream.video_url || stream.m3u8_url || stream.h264_m3u8 || stream.url || 
    (stream.videoList?.[0]?.playUrl) || (stream.videos?.[0]?.url) || '';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link href={`/short/meloshort/${id}`} className="text-gray-400 hover:text-white mb-4 inline-block">
          ← Back to Detail
        </Link>
        <h1 className="text-white text-xl font-bold mb-4">Episode {episode}</h1>
        {videoUrl ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <video src={videoUrl} controls autoPlay className="w-full h-full" />
          </div>
        ) : (
          <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-gray-500">
            Video not available
          </div>
        )}
      </div>
    </div>
  );
}
