import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchFreeReelsDetail } from '@/lib/api';

interface FreeReelsDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FreeReelsDetailPage({ params }: FreeReelsDetailPageProps) {
  const { id } = await params;

  let detail;
  try {
    const res = await fetchFreeReelsDetail(id);
    detail = res.data;
  } catch {
    notFound();
  }

  if (!detail || !detail.drama_id) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      {detail.thumb_url && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image
            src={detail.thumb_url}
            alt={detail.drama_name}
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
          {/* Poster */}
          {detail.thumb_url && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image
                  src={detail.thumb_url}
                  alt={detail.drama_name}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-cyan-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                FreeReels
              </span>
              {detail.free && (
                <span className="bg-green-500/20 text-green-300 text-xs px-3 py-1 rounded-full border border-green-500/30">
                  Free
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {detail.drama_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
              {detail.episode_count > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {detail.episode_count} Episodes
                </span>
              )}
            </div>

            {/* Tags */}
            {detail.tags && detail.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {detail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {detail.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{detail.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Episodes */}
        {detail.episode_list && detail.episode_list.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Episodes <span className="text-gray-500 text-lg font-normal">({detail.episode_list.length})</span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {detail.episode_list.map((ep) => (
                <Link
                  key={ep.episode_id}
                  href={`/short/freereels/watch/${detail.drama_id}/${ep.episode}`}
                  className={`flex items-center justify-center py-3 px-3 rounded-lg text-sm font-medium transition-all ${
                    ep.unlock !== false
                      ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10'
                      : 'bg-[#1a1a2e]/50 text-gray-600 border border-white/5'
                  }`}
                >
                  {ep.episode}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
