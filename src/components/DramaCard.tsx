import Link from 'next/link';
import Image from 'next/image';
import { formatHits, parseCategories } from '@/lib/api';
import type { Drama } from '@/lib/api';

const tagColors = [
  'bg-blue-500/20 text-blue-300',
  'bg-purple-500/20 text-purple-300',
  'bg-pink-500/20 text-pink-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-cyan-500/20 text-cyan-300',
  'bg-rose-500/20 text-rose-300',
];

export default function DramaCard({ drama }: { drama: Drama }) {
  const genres = parseCategories(drama.category);

  return (
    <Link href={`/drama/${drama.id}`} className="group block">
      <div className="bg-[#1a1a2e] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={drama.image}
            alt={drama.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs text-gray-300 mb-1">{formatHits(drama.hits)}</p>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-[#e63946] transition-colors">
            {drama.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre, i) => (
              <span
                key={genre}
                className={`text-[10px] px-2 py-0.5 rounded-full ${tagColors[i % tagColors.length]}`}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
