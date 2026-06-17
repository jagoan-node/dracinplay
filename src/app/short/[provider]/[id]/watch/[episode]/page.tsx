'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HlsPlayer from '@/components/HlsPlayer';

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

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const provider = params.provider as string;
  const id = params.id as string;
  const episode = params.episode as string;

  const [stream, setStream] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [streamRes, detailRes] = await Promise.all([
          fetch(`/api/short/${provider}/stream?id=${id}&episode=${episode}`),
          fetch(`/api/short/${provider}/detail?id=${id}`),
        ]);
        const streamData = await streamRes.json();
        const detailData = await detailRes.json();
        setStream(streamData.data || streamData);
        setDetail(detailData.data || detailData);
      } catch {
        setError('Failed to load stream');
      }
      setLoading(false);
    }
    load();
  }, [provider, id, episode]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white border-t-[#e63946] rounded-full animate-spin"></div>
    </div>
  );

  if (error || !stream) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error || 'Stream not found'}</p>
        <Link href={`/short/${provider}/${id}`} className="text-[#e63946] hover:underline">← Back</Link>
      </div>
    </div>
  );

  // Extract video URL and quality list
  const qualities = stream.videoList || stream.streams || [];
  let videoSrc = stream.video_url || stream.play_url || stream.m3u8_url || stream.url || '';

  if (qualities.length > 0 && !videoSrc) {
    videoSrc = qualities[0].playUrl || qualities[0].url || '';
  }

  // Get episode list from detail
  const epList = detail?.chapters || detail?.episodes || detail?.videoList || [];

  // Find current index
  const currentIdx = epList.findIndex((e: any) => {
    const epId = e.chapter_id || e.episode_id || e.id;
    const epNum = String(e.chapter_number || e.episode_number || e.number || '');
    return epNum === episode || String(epId) === episode;
  });

  const prevEp = currentIdx > 0 ? epList[currentIdx - 1] : null;
  const nextEp = currentIdx >= 0 && currentIdx < epList.length - 1 ? epList[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link href={`/short/${provider}/${id}`} className="text-gray-400 hover:text-white text-sm mb-3 inline-flex items-center gap-1">
          ← {detail?.title || detail?.book_title || 'Back'}
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${providerColors[provider] || 'bg-gray-500'}`}>
            {provider.toUpperCase()}
          </span>
          <span className="text-white font-semibold">
            {stream.chapter_name || `Episode ${episode}`}
          </span>
        </div>

        {videoSrc ? (
          <HlsPlayer
            src={videoSrc}
            qualities={qualities.filter((q: any) => q.playUrl)}
            poster={stream.video_pic || stream.thumbnail}
            autoPlay={true}
          />
        ) : (
          <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-gray-500">
            Video not available
          </div>
        )}

        {/* Episode navigation */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {prevEp && (
            <button onClick={() => {
              const ep = prevEp.chapter_number || prevEp.episode_number || prevEp.number;
              const epId = prevEp.chapter_id || prevEp.episode_id || prevEp.id;
              router.push(`/short/${provider}/${id}/watch/${ep || epId}`);
            }} className="bg-[#1a1a2e] text-white px-4 py-2 rounded-lg hover:bg-[#252540] transition text-sm">
              ← Prev
            </button>
          )}
          {nextEp && (
            <button onClick={() => {
              const ep = nextEp.chapter_number || nextEp.episode_number || nextEp.number;
              const epId = nextEp.chapter_id || nextEp.episode_id || nextEp.id;
              router.push(`/short/${provider}/${id}/watch/${ep || epId}`);
            }} className="bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#c62d3a] transition text-sm">
              Next →
            </button>
          )}
        </div>

        {/* Episode grid */}
        {epList.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3">Episodes ({epList.length})</h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {epList.map((ep: any, i: number) => {
                const epNum = ep.chapter_number || ep.episode_number || ep.number || i + 1;
                const epId = ep.chapter_id || ep.episode_id || ep.id || String(epNum);
                const isActive = String(epNum) === episode || String(epId) === episode;
                return (
                  <button
                    key={i}
                    onClick={() => router.push(`/short/${provider}/${id}/watch/${epId}`)}
                    className={`aspect-square rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-[#e63946] text-white ring-2 ring-[#e63946]' : 'bg-[#1a1a2e] text-gray-400 hover:bg-[#252540] hover:text-white'}`}
                  >
                    {epNum}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
