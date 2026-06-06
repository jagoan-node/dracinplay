import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getDramaInfo, formatHits, parseCategories, cleanSynopsis } from '@/lib/api';

const genreColors: Record<string, string> = {
  'Drama China': 'bg-red-500/20 text-red-300 border border-red-500/30',
  'Drama Korea': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Romance: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  Fantasy: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  Historical: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Action: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  Comedy: 'bg-green-500/20 text-green-300 border border-green-500/30',
  Thriller: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  Mystery: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  'Sci-Fi': 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  Horror: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
};

const defaultGenreColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';

interface DramaDetailProps {
  params: Promise<{ id: string }>;
}

export default async function DramaDetailPage({ params }: DramaDetailProps) {
  const { id } = await params;

  let drama;
  try {
    drama = await getDramaInfo(id);
  } catch {
    notFound();
  }

  if (!drama || !drama.id) {
    notFound();
  }

  const genres = parseCategories(drama.category);
  const synopsis = cleanSynopsis(drama.synopsis_clean || '');

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={drama.image}
          alt={drama.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              <Image
                src={drama.image}
                alt={drama.title}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {drama.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {formatHits(drama.hits)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {drama.total_episode} Episodes
              </span>
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className={`text-xs px-3 py-1 rounded-full ${genreColors[genre] || defaultGenreColor}`}
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            {synopsis && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">Synopsis</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{synopsis}</p>
              </div>
            )}

            {/* Trailer */}
            {drama.trailer && (
              <a
                href={drama.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#e63946] hover:text-[#ff4757] text-sm font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Tonton Trailer
              </a>
            )}
          </div>
        </div>

        {/* Episodes */}
        {drama.data_episode && drama.data_episode.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Episodes <span className="text-gray-500 text-lg font-normal">({drama.data_episode.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {drama.data_episode.map((ep) => (
                <Link
                  key={ep.episode_id}
                  href={`/watch/${drama.id}/${ep.streaming}/${ep.episode_number}`}
                  className="group block"
                >
                  <div className="bg-[#1a1a2e] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={ep.episode_image || drama.image}
                        alt={ep.episode_label}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 bg-[#e63946]/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      {ep.cdn_ready && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                            HD
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#e63946] transition-colors">
                        {ep.episode_label}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
