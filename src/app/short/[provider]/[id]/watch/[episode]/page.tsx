'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HlsPlayer from '@/components/HlsPlayer';

const providerColors: Record<string, string> = {
  reelshort: 'bg-pink-500', shortmax: 'bg-orange-500', meloshort: 'bg-rose-500',
  dramabox: 'bg-purple-500', dramanova: 'bg-emerald-500', dramawave: 'bg-amber-500',
  freereels: 'bg-cyan-500', goodshort: 'bg-blue-500', melolo: 'bg-[#e63946]',
  netshort: 'bg-teal-500', flickreels: 'bg-indigo-500',
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
      } catch { setError('Gagal memuat stream'); }
      setLoading(false);
    }
    load();
  }, [provider, id, episode]);

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

  // Extract video URL and quality list
  const qualities = stream.videoList || stream.streams || [];
  let videoSrc = stream.video_url || stream.play_url || stream.m3u8_url || stream.url || '';
  if (qualities.length > 0 && !videoSrc) {
    videoSrc = qualities[0].playUrl || qualities[0].url || '';
  }

  // Episode list
  const epList = detail?.chapters || detail?.episodes || detail?.videoList || [];
  const currentIdx = epList.findIndex((e: any) => {
    const epId = e.chapter_id || e.episode_id || e.id;
    const epNum = String(e.chapter_number || e.episode_number || e.number || '');
    return epNum === episode || String(epId) === episode;
  });

  const prevEp = currentIdx > 0 ? epList[currentIdx - 1] : null;
  const nextEp = currentIdx >= 0 && currentIdx < epList.length - 1 ? epList[currentIdx + 1] : null;

  const getEpId = (ep: any) => ep.chapter_number || ep.episode_number || ep.number || ep.chapter_id || ep.episode_id || ep.id;
  const navigateTo = (ep: any) => router.push(`/short/${provider}/${id}/watch/${getEpId(ep)}`);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-4 page-enter">
      {/* Video Player */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-3">
        <HlsPlayer
          src={videoSrc}
          qualities={qualities.filter((q: any) => q.playUrl)}
          poster={stream.video_pic || stream.thumbnail}
          autoPlay={true}
          title={stream.chapter_name || `Episode ${episode}`}
          onPrev={prevEp ? () => navigateTo(prevEp) : undefined}
          onNext={nextEp ? () => navigateTo(nextEp) : undefined}
          onEnded={nextEp ? () => navigateTo(nextEp) : undefined}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-3">
        {/* Episode info */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${providerColors[provider] || 'bg-gray-500'}`}>
            {provider.toUpperCase()}
          </span>
          <h1 className="text-white font-semibold text-sm sm:text-base">
            {stream.chapter_name || `Episode ${episode}`}
          </h1>
        </div>

        {/* Episode navigation buttons */}
        <div className="flex gap-2 mb-4">
          {prevEp && (
            <button onClick={() => navigateTo(prevEp)}
              className="flex-1 sm:flex-none bg-[#1a1a2e] text-white px-4 py-2.5 rounded-xl hover:bg-[#252540] transition text-sm font-medium flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Prev
            </button>
          )}
          <button onClick={() => router.push(`/short/${provider}/${id}`)}
            className="flex-1 sm:flex-none bg-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/20 transition text-sm font-medium">
            Daftar Episode
          </button>
          {nextEp && (
            <button onClick={() => navigateTo(nextEp)}
              className="flex-1 sm:flex-none bg-[#e63946] text-white px-4 py-2.5 rounded-xl hover:bg-[#c62d3a] transition text-sm font-medium flex items-center justify-center gap-1">
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>

        {/* Episode grid */}
        {epList.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Episodes ({epList.length})</h3>
            <div className="scroll-x -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 sm:gap-2">
              {epList.map((ep: any, i: number) => {
                const epNum = ep.chapter_number || ep.episode_number || ep.number || i + 1;
                const epId = ep.chapter_id || ep.episode_id || ep.id || String(epNum);
                const isActive = String(epNum) === episode || String(epId) === episode;
                return (
                  <button key={i} onClick={() => navigateTo(ep)}
                    className={`touch-target rounded-lg text-xs font-bold transition-all shrink-0 w-12 sm:w-auto ${isActive ? 'bg-[#e63946] text-white ring-2 ring-[#e63946]/50 animate-pulse-glow' : 'bg-[#1a1a2e] text-gray-400 hover:bg-[#252540] hover:text-white border border-white/5'}`}>
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