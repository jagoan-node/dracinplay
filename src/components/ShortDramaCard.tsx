import Link from 'next/link';
import Image from 'next/image';
import type { NormalizedShortDrama } from '@/lib/api';

const providerBadgeColors: Record<string, string> = {
  melolo: 'bg-[#e63946] text-white',
  freereels: 'bg-cyan-500 text-white',
  dramabox: 'bg-purple-500 text-white',
  dramawave: 'bg-amber-500 text-white',
  dramanova: 'bg-emerald-500 text-white',
  goodshort: 'bg-blue-500 text-white',
};

const tagColors = [
  'bg-blue-500/20 text-blue-300',
  'bg-purple-500/20 text-purple-300',
  'bg-pink-500/20 text-pink-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
];

interface ShortDramaCardProps {
  drama: NormalizedShortDrama;
}

export default function ShortDramaCard({ drama }: ShortDramaCardProps) {
  const provider = drama.provider.toLowerCase();
  const detailPath = `/short/${provider}/${drama.id}`;

  return (
    <Link href={detailPath} className="group block">
      <div className="bg-[#1a1a2e] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40">
        <div className="relative aspect-[2/3] overflow-hidden">
          {drama.cover ? (
            <Image
              src={drama.cover}
              alt={drama.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[#252540] flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {drama.episodeCount > 0 && (
              <span className="text-[10px] bg-black/60 text-gray-300 px-2 py-0.5 rounded-full">
                {drama.episodeCount} Eps
              </span>
            )}
          </div>
          {/* Provider badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${providerBadgeColors[provider] || 'bg-gray-500 text-white'}`}>
              {drama.provider}
            </span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-[#e63946] transition-colors">
            {drama.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {drama.tags.slice(0, 2).map((tag, i) => (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded-full ${tagColors[i % tagColors.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
