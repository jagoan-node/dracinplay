import Link from 'next/link';
import Image from 'next/image';
import type { NormalizedShortDrama } from '@/lib/api';

const providerBadgeColors: Record<string, string> = {
  melolo: 'bg-[#e63946]',
  freereels: 'bg-cyan-500',
  dramabox: 'bg-purple-500',
  dramawave: 'bg-amber-500',
  dramanova: 'bg-emerald-500',
  goodshort: 'bg-blue-500',
  reelshort: 'bg-pink-500',
  shortmax: 'bg-orange-500',
  meloshort: 'bg-rose-500',
  netshort: 'bg-teal-500',
  flickreels: 'bg-indigo-500',
};

export default function ShortDramaCard({ drama }: { drama: NormalizedShortDrama }) {
  const provider = drama.provider.toLowerCase();
  return (
    <Link href={`/short/${provider}/${drama.id}`} className="group block card-hover">
      <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
        <div className="relative aspect-[2/3] overflow-hidden">
          {drama.cover ? (
            <Image src={drama.cover} alt={drama.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" />
          ) : (
            <div className="absolute inset-0 bg-[#252540] flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {/* Provider badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${providerBadgeColors[provider] || 'bg-gray-500'}`}>
              {drama.provider}
            </span>
          </div>
          {/* Episode count */}
          {drama.episodeCount > 0 && (
            <div className="absolute bottom-2 right-2">
              <span className="text-[10px] bg-black/70 backdrop-blur-sm text-gray-300 px-2 py-0.5 rounded-full">
                {drama.episodeCount} Eps
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-[#e63946] transition-colors">
            {drama.title}
          </h3>
          {drama.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {drama.tags.slice(0, 2).map((tag, i) => (
                <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${i % 2 === 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
