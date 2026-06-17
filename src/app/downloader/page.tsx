'use client';

import { useState } from 'react';

type Platform = 'tiktok' | 'instagram' | 'youtube' | 'terabox';

const platforms: { key: Platform; label: string; icon: string; color: string }[] = [
  { key: 'youtube', label: 'YouTube', icon: '▶️', color: 'bg-red-500' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-black' },
  { key: 'instagram', label: 'Instagram', icon: '📸', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { key: 'terabox', label: 'TeraBox', icon: '📦', color: 'bg-blue-500' },
];

export default function DownloaderPage() {
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/sosmed/${platform}?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError('Failed to fetch');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">⬇️ Downloader</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {platforms.map(p => (
          <button key={p.key} onClick={() => { setPlatform(p.key); setResult(null); setError(''); }}
            className={`${platform === p.key ? p.color + ' text-white' : 'bg-[#1a1a2e] text-gray-400'} px-4 py-2 rounded-xl text-sm font-semibold transition`}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && download()}
          placeholder={`Paste ${platforms.find(p => p.key === platform)?.label} URL...`}
          className="flex-1 bg-[#1a1a2e] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-red-500 outline-none" />
        <button onClick={download} disabled={loading} className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50">
          {loading ? '...' : 'Download'}
        </button>
      </div>
      {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-4">{error}</div>}
      {result && (
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-white/10">
          {result.title && <h2 className="text-white font-bold text-lg mb-2">{result.title}</h2>}
          {result.thumbnail && <img src={result.thumbnail} alt="" className="w-full max-w-md rounded-lg mb-4" />}
          {result.download_url && (
            <a href={result.download_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition">
              ⬇️ Download
            </a>
          )}
          {result.video_url && (
            <div className="mt-4">
              <video src={result.video_url} controls className="w-full max-w-md rounded-lg" />
            </div>
          )}
          <pre className="text-gray-400 text-xs mt-4 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
