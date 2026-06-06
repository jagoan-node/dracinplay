import { notFound } from 'next/navigation';
import Image from 'next/image';
import { fetchMeloloDetail } from '@/lib/api';

interface MeloloDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeloloDetailPage({ params }: MeloloDetailPageProps) {
  const { id } = await params;

  let detail;
  try {
    const res = await fetchMeloloDetail(id);
    detail = res.data;
  } catch {
    notFound();
  }

  if (!detail || !detail.drama_id) {
    notFound();
  }

  const coverImage = detail.video_list?.[0]?.cover || '';

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      {coverImage && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image
            src={coverImage}
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
          {coverImage && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image
                  src={coverImage}
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
              <span className="bg-[#e63946] text-white text-xs px-3 py-1 rounded-full font-semibold">
                Melolo
              </span>
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

            {detail.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{detail.description}</p>
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
            Provider Melolo saat ini belum mendukung streaming video.{' '}
            Coba tonton drama lain dari provider FreeReels, DramaWave, DramaNova, atau GoodShort.
          </p>
        </div>

        {/* Episodes Info */}
        {detail.video_list && detail.video_list.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Daftar Episode <span className="text-gray-500 text-lg font-normal">({detail.video_list.length} episode)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {detail.video_list.map((ep) => (
                <div
                  key={ep.video_id}
                  className="bg-[#1a1a2e] rounded-xl overflow-hidden opacity-60"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {ep.cover ? (
                      <Image
                        src={ep.cover}
                        alt={`Episode ${ep.episode}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#252540] flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-300">
                      Episode {ep.episode}
                    </h3>
                    {ep.duration && (
                      <p className="text-[10px] text-gray-500 mt-1">{ep.duration}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
