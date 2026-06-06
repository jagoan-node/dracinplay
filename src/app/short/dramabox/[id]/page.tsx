import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchDramaBoxDetail, cleanSynopsis } from '@/lib/api';

interface DramaBoxDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DramaBoxDetailPage({ params }: DramaBoxDetailPageProps) {
  const { id } = await params;

  let detail;
  try {
    const res = await fetchDramaBoxDetail(id);
    detail = res.data;
  } catch {
    notFound();
  }

  if (!detail || !detail.bookId) {
    notFound();
  }

  const synopsis = cleanSynopsis(detail.introduction || '');

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      {detail.bookCover && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image
            src={detail.bookCover}
            alt={detail.bookName}
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
          {detail.bookCover && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image
                  src={detail.bookCover}
                  alt={detail.bookName}
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
              <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                DramaBox
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {detail.bookName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
              {detail.chapterCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {detail.chapterCount} Episodes
                </span>
              )}
              {detail.playCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  {detail.playCount.toLocaleString()} Views
                </span>
              )}
            </div>

            {/* Tags */}
            {detail.tags && detail.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {detail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {synopsis && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">Synopsis</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{synopsis}</p>
              </div>
            )}

            {/* Watch First Episode Button */}
            <Link
              href={`/short/dramabox/watch/${detail.bookId}/1`}
              className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Watch Now
            </Link>
          </div>
        </div>

        {/* Episode List */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Episodes <span className="text-gray-500 text-lg font-normal">({detail.chapterCount})</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: detail.chapterCount }, (_, i) => i + 1).map((ep) => (
              <Link
                key={ep}
                href={`/short/dramabox/watch/${detail.bookId}/${ep}`}
                className="flex items-center justify-center py-3 px-3 rounded-lg text-sm font-medium bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10 transition-all"
              >
                {ep}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
