import { notFound } from 'next/navigation';
import Image from 'next/image';
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
              {detail.playCount != null && detail.playCount > 0 && (
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

          </div>
        </div>

        {/* Streaming Notice */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-500 font-semibold">Streaming Belum Tersedia</span>
          </div>
          <p className="text-gray-400 text-sm">
            Provider DramaBox saat ini belum mendukung streaming video.{' '}
            Coba tonton drama lain dari provider FreeReels, DramaWave, DramaNova, atau GoodShort.
          </p>
        </div>

        {/* Episode Info */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Daftar Episode <span className="text-gray-500 text-lg font-normal">({detail.chapterCount} episode)</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: detail.chapterCount }, (_, i) => i + 1).map((ep) => (
              <div
                key={ep}
                className="flex items-center justify-center py-3 px-3 rounded-lg text-sm font-medium bg-[#1a1a2e]/50 text-gray-600 border border-white/5"
              >
                {ep}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
