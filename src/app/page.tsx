import Link from 'next/link';
import Image from 'next/image';
import { fetchDramaHome, formatHits, parseCategories } from '@/lib/api';
import DramaCard from '@/components/DramaCard';

const tagColors = [
  'bg-blue-500/20 text-blue-300',
  'bg-purple-500/20 text-purple-300',
  'bg-pink-500/20 text-pink-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
];

export default async function HomePage() {
  let chinaData, koreaData;

  try {
    chinaData = await fetchDramaHome('china');
  } catch {
    chinaData = { status: 0, count: 0, data: [] };
  }

  try {
    koreaData = await fetchDramaHome('korea');
  } catch {
    koreaData = { status: 0, count: 0, data: [] };
  }

  const featured = chinaData.data[0];
  const chinaDramas = chinaData.data.slice(1);
  const koreaDramas = koreaData.data;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featured && (
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <Image
            src={featured.image}
            alt={featured.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#e63946] text-white text-xs px-3 py-1 rounded-full font-semibold">
                Featured
              </span>
              <span className="text-gray-400 text-sm">{formatHits(featured.hits)}</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-3xl leading-tight">
              {featured.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {parseCategories(featured.category).slice(0, 4).map((genre, i) => (
                <span
                  key={genre}
                  className={`text-xs px-3 py-1 rounded-full ${tagColors[i % tagColors.length]}`}
                >
                  {genre}
                </span>
              ))}
            </div>
            <Link
              href={`/drama/${featured.id}`}
              className="inline-flex items-center gap-2 bg-[#e63946] hover:bg-[#ff4757] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
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
        </section>
      )}

      {/* China Drama Section */}
      {chinaDramas.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Drama China <span className="text-[#e63946]">Terbaru</span>
            </h2>
            <Link
              href="/browse?filter=china"
              className="text-sm text-gray-400 hover:text-[#e63946] transition-colors flex items-center gap-1"
            >
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
            <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
              {chinaDramas.map((drama) => (
                <div key={drama.id} className="w-[160px] sm:w-[180px] shrink-0">
                  <DramaCard drama={drama} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Korea Drama Section */}
      {koreaDramas.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Drama Korea <span className="text-[#e63946]">Terbaru</span>
            </h2>
            <Link
              href="/browse?filter=korea"
              className="text-sm text-gray-400 hover:text-[#e63946] transition-colors flex items-center gap-1"
            >
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
            <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
              {koreaDramas.map((drama) => (
                <div key={drama.id} className="w-[160px] sm:w-[180px] shrink-0">
                  <DramaCard drama={drama} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {chinaData.data.length === 0 && koreaData.data.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-[#1a1a2e] rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Tidak ada drama</h2>
          <p className="text-gray-500">Coba refresh halaman atau cek kembali nanti.</p>
        </div>
      )}
    </div>
  );
}
