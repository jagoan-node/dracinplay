'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';

interface MeloloStreamData {
  video_url?: string;
  m3u8_url?: string;
  h264_m3u8?: string;
  url?: string;
  [key: string]: unknown;
}

export default function MeloloWatchPage() {
  const params = useParams();
  const { videoId } = params as { videoId: string };
  const videoRef = useRef<HTMLVideoElement>(null);

  const [streamData, setStreamData] = useState<MeloloStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://api.sonzaix.indevs.in/melolo/stream?video_id=${videoId}`);
        const data = await res.json();
        if (data.data) {
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
  }, [videoId]);

  useEffect(() => {
    if (!streamData || !videoRef.current) return;
    const video = videoRef.current;

    // Try h264 m3u8 first, then m3u8_url, then video_url
    const streamUrl = streamData.h264_m3u8 || streamData.m3u8_url || streamData.video_url || streamData.url || '';

    if (!streamUrl) {
      setError('No stream URL available');
      return;
    }

    if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error', data);
          setError('Stream playback error');
        }
      });
      return () => {
        hls.destroy();
      };
    } else if (streamUrl.includes('.m3u8') && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
  }, [streamData]);

  const streamUrl = streamData?.h264_m3u8 || streamData?.m3u8_url || streamData?.video_url || streamData?.url || '';

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/short/melolo/all" className="hover:text-white transition-colors">Melolo</Link>
        <span>/</span>
        <span className="text-white">Watch</span>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Melolo Short Drama</h1>
      <p className="text-gray-500 text-sm mb-6">Video ID: {videoId}</p>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
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
          <video
            ref={videoRef}
            key={videoId}
            controls
            autoPlay
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
