import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchDramaNovaDetail, cleanSynopsis } from '@/lib/api';

interface DramaNovaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DramaNovaDetailPage({ params }: DramaNovaDetailPageProps) {
  const { id } = await params;

  let detail;
  try {
    const res = await fetchDramaNovaDetail(id);
    const info = res.data?.info || {};
    detail = {
      ...info,
      episode_count: info.total_episodes || res.data?.episode_count || 0,
      episode_list: res.data?.episodes || [],
    };
  } catch {
    notFound();
  }
  if (!detail || (!detail.drama_id && !detail.id)) {
    notFound();
  }
  const coverImage = detail.poster || detail.cover || detail.image || '';

  const title = detail.name || detail.title || 'Untitled';
  const epCount = detail.episode_count || detail.chapterCount || 0;
  const synopsis = cleanSynopsis(detail.description || '');

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      {coverImage && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {coverImage && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                DramaNova
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
              {epCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {epCount} Episodes
                </span>
              )}
            </div>

            {detail.tags && Array.isArray(detail.tags) && detail.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {detail.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {synopsis && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{synopsis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Episodes */}
        {epCount > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Episodes <span className="text-gray-500 text-lg font-normal">({epCount})</span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {Array.from({ length: epCount }, (_, i) => i + 1).map((ep) => (
                <Link
                  key={ep}
                  href={`/short/dramanova/watch/${detail.drama_id || detail.id}/${ep}`}
                  className="flex items-center justify-center py-3 px-3 rounded-lg text-sm font-medium bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10 transition-all"
                >
                  {ep}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
