'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';

interface SubtitleItem {
  language: string;
  vtt: string;
  subtitle?: string;
  display_name: string;
}

interface StreamData {
  drama_id: string;
  drama_name: string;
  episode: number;
  h264_m3u8: string;
  h265_m3u8?: string;
  subtitle_list: SubtitleItem[];
  [key: string]: unknown;
}

export default function DramaWaveWatchPage() {
  const params = useParams();
  const { id, episode } = params as { id: string; episode: string };
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubtitle, setSelectedSubtitle] = useState('');

  const ep = parseInt(episode, 10);

  // Filter subtitles to only Indonesian and English
  const allowedLanguages = ['id-ID', 'en-US'];
  const filteredSubtitles =
    streamData?.subtitle_list?.filter(
      (sub) => allowedLanguages.includes(sub.language)
    ) ?? [];

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      setError('');
      setSelectedSubtitle('');
      try {
        const res = await fetch(
          `https://api.sonzaix.indevs.in/dramawave/stream?dramaId=${id}&episode=${episode}`
        );
        const data = await res.json();
        if (data.data?.h264_m3u8) {
          setStreamData(data.data);
        } else {
          setError('Stream not available');
        }
      } catch {
        setError('Failed to load stream');
      }
      setLoading(false);
    }
    loadStream();
  }, [id, episode]);

  // HLS playback
  useEffect(() => {
    if (!streamData || !videoRef.current) return;
    const video = videoRef.current;

    const streamUrl = streamData.h264_m3u8;

    if (!streamUrl) {
      setError('No stream URL available');
      return;
    }

    if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error', data);
          setError('Stream playback error');
        }
      });
      return () => {
        hlsRef.current = null;
        hls.destroy();
      };
    } else if (streamUrl.includes('.m3u8') && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
  }, [streamData]);

  // Subtitle handler – attach/remove subtitle track when user changes selection
  useEffect(() => {
    const hls = hlsRef.current;
    const video = videoRef.current;
    if (!hls && !video) return;

    // Remove any previously added text tracks
    if (video) {
      const existingTracks = Array.from(video.textTracks);
      for (let i = existingTracks.length - 1; i >= 0; i--) {
        video.removeRemoteTextTrack(video.textTracks[i] as unknown as HTMLTrackElement);
      }
    }

    if (!selectedSubtitle || !streamData) return;

    const sub = streamData.subtitle_list?.find((s) => s.language === selectedSubtitle);
    if (!sub) return;

    const vttUrl = sub.vtt;
    if (!vttUrl) return;

    if (hls && Hls.isSupported()) {
      hls.addSubtitleTrack({
        kind: 'subtitles',
        src: vttUrl,
        label: sub.display_name,
        language: sub.language,
        default: true,
      });
      // Enable the newly added track
      const tracks = hls.subtitleTracks;
      if (tracks.length > 0) {
        hls.subtitleTrack = tracks.length - 1;
        hls.subtitleDisplay = true;
      }
    } else {
      // Native HLS (Safari) – add track element manually
      const trackEl = document.createElement('track');
      trackEl.kind = 'subtitles';
      trackEl.src = vttUrl;
      trackEl.srclang = sub.language;
      trackEl.label = sub.display_name;
      trackEl.default = true;
      video!.appendChild(trackEl);
      // Enable last track
      const tracks = Array.from(video!.textTracks);
      for (const t of tracks) {
        t.mode = 'disabled';
      }
      if (tracks.length > 0) {
        tracks[tracks.length - 1].mode = 'showing';
      }
    }
  }, [selectedSubtitle, streamData]);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/short/dramawave/all" className="hover:text-white transition-colors">DramaWave</Link>
        <span>/</span>
        <Link href={`/short/dramawave/${id}`} className="hover:text-white transition-colors">Drama</Link>
        <span>/</span>
        <span className="text-white">Episode {episode}</span>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
        {streamData?.drama_name || 'DramaWave Short Drama'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">Episode {episode}</p>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading video...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="text-center px-4">
              <p className="text-[#e63946] font-semibold text-lg">Streaming not available</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <video ref={videoRef} key={`${id}-${episode}`} controls autoPlay className="w-full h-full" />
        )}
      </div>

      {/* Subtitle selector */}
      {filteredSubtitles.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <label htmlFor="subtitle-select" className="text-sm text-gray-400 font-medium">
            Subtitle:
          </label>
          <select
            id="subtitle-select"
            value={selectedSubtitle}
            onChange={(e) => setSelectedSubtitle(e.target.value)}
            className="bg-[#1a1a2e] text-white text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="">Off</option>
            {filteredSubtitles.map((sub) => (
              <option key={sub.language} value={sub.language}>
                {sub.display_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ep > 1 ? `/short/dramawave/watch/${id}/${ep - 1}` : '#'}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            ep > 1 ? 'bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10' : 'bg-[#1a1a2e]/50 text-gray-600 cursor-not-allowed border border-white/5 pointer-events-none'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Episode {ep > 1 ? ep - 1 : '-'}
        </Link>
        <Link href={`/short/dramawave/${id}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-all">
          All Episodes
        </Link>
        <Link
          href={`/short/dramawave/watch/${id}/${ep + 1}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10 transition-all"
        >
          Episode {ep + 1}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
