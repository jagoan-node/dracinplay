import Link from 'next/link';
import Image from 'next/image';
import { formatHits, parseCategories } from '@/lib/api';
import type { Drama } from '@/lib/api';

export default function DramaCard({ drama }: { drama: Drama }) {
  const genres = parseCategories(drama.category);
  return (
    <Link href={`/drama/${drama.id}`} className="group block card-hover">
      <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image src={drama.image} alt={drama.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] bg-black/70 backdrop-blur-sm text-gray-300 px-2 py-0.5 rounded-full">{formatHits(drama.hits)}</span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-[#e63946] transition-colors">{drama.title}</h3>
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre, i) => (
              <span key={genre} className={`text-[10px] px-1.5 py-0.5 rounded-full ${i % 2 === 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>{genre}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
