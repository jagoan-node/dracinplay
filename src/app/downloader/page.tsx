'use client';

import { useState } from 'react';

type Platform = 'tiktok' | 'instagram' | 'youtube';

const platforms: { key: Platform; label: string; icon: string; color: string; activeColor: string; placeholder: string }[] = [
  { key: 'youtube', label: 'YouTube', icon: '▶️', color: 'bg-white/5', activeColor: 'bg-red-500', placeholder: 'https://youtube.com/watch?v=...' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-white/5', activeColor: 'bg-black border border-white/20', placeholder: 'https://tiktok.com/@user/video/...' },
  { key: 'instagram', label: 'Instagram', icon: '📸', color: 'bg-white/5', activeColor: 'bg-gradient-to-r from-purple-500 to-pink-500', placeholder: 'https://instagram.com/reel/...' },
];

export default function DownloaderPage() {
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const activePlatform = platforms.find(p => p.key === platform)!;

  const download = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let apiUrl = '';
      if (platform === 'youtube') apiUrl = '/api/youtube/download?url=' + encodeURIComponent(url);
      else if (platform === 'tiktok') apiUrl = '/api/sosmed/tiktok?url=' + encodeURIComponent(url);
      else apiUrl = '/api/sosmed/instagram?url=' + encodeURIComponent(url);
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch { setError('Gagal mengambil data'); }
    setLoading(false);
  };

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="min-h-screen pb-4">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">⬇️ Downloader</h1>
        <p className="text-gray-500 text-sm mb-6">Download video dari YouTube, TikTok, dan Instagram</p>

        {/* Platform tabs */}
        <div className="flex gap-2 mb-4">
          {platforms.map(p => (
            <button key={p.key} onClick={() => { setPlatform(p.key); setResult(null); setError(''); }}
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${platform === p.key ? `${p.activeColor} text-white shadow-lg` : `${p.color} text-gray-400 hover:text-white`}`}>
              <span className="block text-base mb-0.5">{p.icon}</span>
              <span className="text-xs">{p.label}</span>
            </button>
          ))}
        </div>

        {/* URL input */}
        <div className="flex gap-2 mb-6">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && download()}
            placeholder={activePlatform.placeholder}
            className="flex-1 bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-[#e63946]/50 outline-none text-sm transition-colors" />
          <button onClick={download} disabled={loading || !url.trim()}
            className="bg-[#e63946] text-white px-5 sm:px-6 py-3 rounded-xl font-semibold hover:bg-[#ff4757] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shrink-0">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
              </span>
            ) : 'Download'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl mb-4 text-sm flex items-center justify-between">
            <span>❌ {error}</span>
            <button onClick={() => setError('')} className="text-xs text-red-400 hover:text-red-300 underline ml-2">Dismiss</button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden animate-slide-up">
            {/* YouTube */}
            {result.status === 'success' && result.download_link && (
              <div className="p-4 sm:p-6">
                {result.thumbnail && <img src={result.thumbnail} alt="" className="w-full rounded-lg mb-4" />}
                <h2 className="text-white font-bold text-lg mb-1 line-clamp-2">{result.title}</h2>
                <p className="text-gray-400 text-sm mb-4">{result.channel} • {result.quality}p</p>
                <div className="flex gap-2">
                  <a href={result.download_link} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition text-sm">
                    ⬇️ Download {result.format?.toUpperCase()} ({result.quality}p)
                  </a>
                  <button onClick={() => copyLink(result.download_link, 'yt')}
                    className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition text-sm">
                    {copied === 'yt' ? '✅' : '📋'}
                  </button>
                </div>
              </div>
            )}
            {/* TikTok */}
            {result.data?.hdplay && (
              <div className="p-4 sm:p-6">
                {result.data.cover && <img src={result.data.cover} alt="" className="w-full rounded-lg mb-4" />}
                <h2 className="text-white font-bold text-lg mb-1 line-clamp-2">{result.data.title}</h2>
                <p className="text-gray-400 text-sm mb-4">@{result.data.author?.unique_id} • {result.data.duration}s</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a href={result.data.hdplay} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition text-sm">
                    ⬇️ HD No Watermark
                  </a>
                  <a href={result.data.play} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition text-sm">
                    ⬇️ Normal Quality
                  </a>
                </div>
              </div>
            )}
            {/* Instagram */}
            {result.video_url && (
              <div className="p-4 sm:p-6">
                {result.thumbnail && <img src={result.thumbnail} alt="" className="w-full rounded-lg mb-4" />}
                <h2 className="text-white font-bold text-lg mb-1">@{result.username}</h2>
                {result.description && <p className="text-gray-400 text-sm mb-4 line-clamp-3">{result.description}</p>}
                <div className="flex gap-2">
                  <a href={result.video_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition text-sm">
                    ⬇️ Download Video
                  </a>
                  <button onClick={() => copyLink(result.video_url, 'ig')}
                    className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition text-sm">
                    {copied === 'ig' ? '✅' : '📋'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}