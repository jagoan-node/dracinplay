const API_BASE = 'https://api.sonzaix.indevs.in';

// ============================================================
// Regular Drama (existing)
// ============================================================

export interface Drama {
  id: number;
  link: string;
  title: string;
  image: string;
  category: string;
  hits: string;
  meta_time: string;
}

export interface DramaHomeResponse {
  status: number;
  count: number;
  data: Drama[];
}

export interface Episode {
  episode_id: number;
  episode_number: number;
  episode_label: string;
  episode_image: string;
  streaming: string;
  cdn_ready: boolean;
}

export interface DramaInfo {
  id: number;
  title: string;
  total_episode: number;
  hits: number;
  link: string;
  category: string;
  image: string;
  trailer: string;
  synopsis_clean: string;
  data_episode: Episode[];
}

export interface StreamData {
  '360p': string;
  '480p': string;
  '720p': string;
  '360p_size': string;
  '480p_size': string;
  '720p_size': string;
}

export interface StreamResponse {
  data_stream: StreamData[];
}

export async function fetchDramaHome(type: 'china' | 'korea'): Promise<DramaHomeResponse> {
  const res = await fetch(`${API_BASE}/drama/home/${type}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch ${type} dramas`);
  return res.json();
}

export async function searchDramas(query: string): Promise<DramaHomeResponse> {
  const res = await fetch(`${API_BASE}/drama/search?q=${encodeURIComponent(query)}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getDramaInfo(id: string): Promise<DramaInfo> {
  const res = await fetch(`${API_BASE}/drama/info?id=${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch drama info');
  return res.json();
}

export async function getStreamUrl(streamingId: string): Promise<StreamResponse> {
  const res = await fetch(`${API_BASE}/drama/stream?id=${streamingId}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch stream URL');
  return res.json();
}

// ============================================================
// Utility functions
// ============================================================

export function formatHits(hits: string | number): string {
  const num = typeof hits === 'string' ? parseInt(hits, 10) : hits;
  if (isNaN(num)) return '0 Views';
  return num.toLocaleString('id-ID') + ' Views';
}

export function parseCategories(category: string): string[] {
  return category
    .split(',')
    .map((c) => c.trim())
    .filter((c) => {
      // Skip year-only entries
      return !/^\d{4}$/.test(c);
    });
}

export function cleanSynopsis(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
// Melolo Short Drama
// ============================================================

export interface MeloloBook {
  drama_name: string;
  drama_id: string;
  description: string;
  episode_count: number;
  watch_value: number;
  thumb_url: string;
  tags: string[];
}

export interface MeloloHomeSection {
  books: MeloloBook[];
  [key: string]: unknown;
}

export interface MeloloHomeResponse {
  type: string;
  data: MeloloHomeSection[];
}

export interface MeloloVideoItem {
  episode: number;
  video_id: string;
  duration: string;
  cover: string;
}

export interface MeloloDetail {
  drama_id: string;
  drama_name: string;
  description: string;
  episode_count: number;
  video_list: MeloloVideoItem[];
  [key: string]: unknown;
}

export interface MeloloDetailResponse {
  data: MeloloDetail;
}

export interface MeloloStreamResponse {
  data: {
    video_url?: string;
    m3u8_url?: string;
    h264_m3u8?: string;
    url?: string;
    [key: string]: unknown;
  };
}

export async function fetchMeloloHome(): Promise<MeloloHomeResponse> {
  const res = await fetch(`${API_BASE}/melolo/home`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch Melolo home');
  return res.json();
}

export async function fetchMeloloDetail(id: string): Promise<MeloloDetailResponse> {
  const res = await fetch(`${API_BASE}/melolo/detail?id=${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch Melolo detail');
  return res.json();
}

export async function fetchMeloloStream(videoId: string): Promise<MeloloStreamResponse> {
  const res = await fetch(`${API_BASE}/melolo/stream?video_id=${videoId}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch Melolo stream');
  return res.json();
}

// ============================================================
// FreeReels Short Drama
// ============================================================

export interface FreeReelsBook {
  drama_name: string;
  drama_id: string;
  description: string;
  episode_count: number;
  watch_value: number;
  thumb_url: string;
  tags: string[];
  free: boolean;
}

export interface FreeReelsHomeSection {
  books: FreeReelsBook[];
  [key: string]: unknown;
}

export interface FreeReelsHomeResponse {
  data: FreeReelsHomeSection[];
}

export interface FreeReelsEpisodeItem {
  episode: number;
  episode_id: string;
  name: string;
  unlock: boolean;
}

export interface FreeReelsDetail {
  drama_id: string;
  drama_name: string;
  description: string;
  episode_count: number;
  watch_value: number;
  thumb_url: string;
  tags: string[];
  free: boolean;
  episode_list: FreeReelsEpisodeItem[];
  [key: string]: unknown;
}

export interface FreeReelsDetailResponse {
  data: FreeReelsDetail;
}

export interface FreeReelsStreamData {
  episode_id: string;
  name: string;
  cover: string;
  video_url: string;
  m3u8_url: string;
  h264_m3u8: string;
  h265_m3u8: string;
  subtitles: string;
  [key: string]: unknown;
}

export interface FreeReelsStreamResponse {
  data: FreeReelsStreamData;
}

export async function fetchFreeReelsHome(): Promise<FreeReelsHomeResponse> {
  const res = await fetch(`${API_BASE}/freereels/home`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch FreeReels home');
  return res.json();
}

export async function fetchFreeReelsDetail(id: string): Promise<FreeReelsDetailResponse> {
  const res = await fetch(`${API_BASE}/freereels/detail?id=${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch FreeReels detail');
  return res.json();
}

export async function fetchFreeReelsStream(id: string, episode: number): Promise<FreeReelsStreamResponse> {
  const res = await fetch(`${API_BASE}/freereels/stream?id=${id}&episode=${episode}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch FreeReels stream');
  return res.json();
}

// ============================================================
// DramaBox Short Drama
// ============================================================

export interface DramaBoxBook {
  bookId: string;
  bookName: string;
  coverWap: string;
  chapterCount: number;
  introduction: string;
  tags: string[];
  [key: string]: unknown;
}

export interface DramaBoxColumn {
  title: string;
  bookList: DramaBoxBook[];
  [key: string]: unknown;
}

export interface DramaBoxHomeData {
  columnVoList: DramaBoxColumn[];
  [key: string]: unknown;
}

export interface DramaBoxHomeResponse {
  data: DramaBoxHomeData;
}

export interface DramaBoxChapterItem {
  chapterId?: string;
  chapterName?: string;
  chapterNum?: number;
  playSource?: string;
  unlock?: boolean;
  [key: string]: unknown;
}

export interface DramaBoxDetailInfo {
  bookId: string;
  bookName: string;
  bookCover: string;
  introduction: string;
  chapterCount: number;
  playCount?: number;
  tags?: string[];
  chapterList?: DramaBoxChapterItem[];
  firstPlaySourceVo?: unknown;
  [key: string]: unknown;
}

export interface DramaBoxDetailResponse {
  data: DramaBoxDetailInfo;
}

export interface DramaBoxStreamResponse {
  data: {
  chapterList: DramaBoxChapterItem[];
  [key: string]: unknown;
  };
}

export async function fetchDramaBoxHome(): Promise<DramaBoxHomeResponse> {
  const res = await fetch(`${API_BASE}/dramabox/home`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaBox home');
  return res.json();
}

export async function fetchDramaBoxDetail(id: string): Promise<DramaBoxDetailResponse> {
  const res = await fetch(`${API_BASE}/dramabox/detail?bookId=${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaBox detail');
  return res.json();
}

export async function fetchDramaBoxStream(bookId: string, chapterIndex: number): Promise<DramaBoxStreamResponse> {
  const res = await fetch(`${API_BASE}/dramabox/stream?bookId=${bookId}&chapterIndex=${chapterIndex}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaBox stream');
  return res.json();
}

// ============================================================
// DramaWave Short Drama
// ============================================================

export interface DramaWaveItem {
  id: string;
  name?: string;
  title?: string;
  cover?: string;
  image?: string;
  description?: string;
  episode_count?: number;
  chapterCount?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface DramaWaveHomeData {
  items: DramaWaveItem[];
  page_info: unknown;
  module_name: string;
  [key: string]: unknown;
}

export interface DramaWaveHomeResponse {
  data: DramaWaveHomeData;
}

export interface DramaWaveInfo {
  id: string;
  name: string;
  title?: string;
  cover: string;
  image?: string;
  description: string;
  episode_count: number;
  episode_list: Array<{ id: string; index: number; [key: string]: unknown }>;
  tags?: string[];
  [key: string]: unknown;
}

export interface DramaWaveDetailResponse {
  code: number;
  data: {
    info: DramaWaveInfo;
    [key: string]: unknown;
  };
}

export interface DramaWaveStreamResponse {
  data: {
    video_url?: string;
    m3u8_url?: string;
    h264_m3u8?: string;
    url?: string;
    [key: string]: unknown;
  };
}

export async function fetchDramaWaveHome(): Promise<DramaWaveHomeResponse> {
  const res = await fetch(`${API_BASE}/dramawave/home`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaWave home');
  return res.json();
}

export async function fetchDramaWaveDetail(id: string): Promise<DramaWaveDetailResponse> {
  const res = await fetch(`${API_BASE}/dramawave/detail?id=${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaWave detail');
  return res.json();
}

export async function fetchDramaWaveStream(id: string, episode: number): Promise<DramaWaveStreamResponse> {
  const res = await fetch(`${API_BASE}/dramawave/stream?id=${id}&episode=${episode}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaWave stream');
  return res.json();
}

// ============================================================
// DramaNova Short Drama
// ============================================================

export interface DramaNovaModule {
  title?: string;
  items?: Array<{ id: string; name?: string; title?: string; cover?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface DramaNovaHomeData {
  heroModule?: DramaNovaModule;
  newDramas?: DramaNovaModule;
  hotDramas?: DramaNovaModule;
  recommendDramas?: DramaNovaModule;
  trailerModule?: DramaNovaModule;
  [key: string]: unknown;
}

export interface DramaNovaHomeResponse {
  data: DramaNovaHomeData;
}

export interface DramaNovaInfo {
  drama_id: string;
  title: string;
  description: string;
  poster: string;
  total_episodes: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface DramaNovaDetailResponse {
  code: number;
  data: {
    info: DramaNovaInfo;
    episodes: Array<{ episode_number: number; [key: string]: unknown }>;
    episode_count: number;
    [key: string]: unknown;
  };
}

export interface DramaNovaStreamResponse {
  data: {
    video_url?: string;
    m3u8_url?: string;
    h264_m3u8?: string;
    url?: string;
    [key: string]: unknown;
  };
}

export async function fetchDramaNovaHome(): Promise<DramaNovaHomeResponse> {
  const res = await fetch(`${API_BASE}/dramanova/home`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaNova home');
  return res.json();
}

export async function fetchDramaNovaDetail(id: string): Promise<DramaNovaDetailResponse> {
  const res = await fetch(`${API_BASE}/dramanova/detail?id=${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaNova detail');
  return res.json();
}

export async function fetchDramaNovaStream(id: string, episode: number): Promise<DramaNovaStreamResponse> {
  const res = await fetch(`${API_BASE}/dramanova/stream?id=${id}&episode=${episode}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch DramaNova stream');
  return res.json();
}

// ============================================================
// GoodShort
// ============================================================

export interface GoodShortItem {
  id: string;
  name?: string;
  title?: string;
  drama_name?: string;
  cover?: string;
  thumb_url?: string;
  image?: string;
  description?: string;
  episode_count?: number;
  chapterCount?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface GoodShortHomeData {
  recommentList: GoodShortItem[];
  [key: string]: unknown;
}

export interface GoodShortHomeResponse {
  data: GoodShortHomeData;
}

export interface GoodShortBook {
  bookId: string;
  bookName: string;
  cover: string;
  introduction: string;
  chapterCount: number;
  labels: string[];
  [key: string]: unknown;
}

export interface GoodShortDownloadItem {
  id: string;
  index: number;
  chapterName: string;
  multiVideos: Array<{ type: string; filePath: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface GoodShortDetailResponse {
  code: number;
  data: {
    book: GoodShortBook;
    downloadList: GoodShortDownloadItem[];
    [key: string]: unknown;
  };
}

export interface GoodShortStreamResponse {
  code: number;
  data: {
    bookId: string;
    bookName: string;
    downloadList: Array<{
      index: number;
      multiVideos: Array<{ type: string; filePath: string; [key: string]: unknown }>;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

export async function fetchGoodShortHome(): Promise<GoodShortHomeResponse> {
  const res = await fetch(`${API_BASE}/goodshort/home`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch GoodShort home');
  return res.json();
}

export async function fetchGoodShortDetail(bookId: string): Promise<GoodShortDetailResponse> {
  const res = await fetch(`${API_BASE}/goodshort/detail?bookId=${bookId}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch GoodShort detail');
  return res.json();
}

export async function fetchGoodShortStream(bookId: string, chapterIndex: number): Promise<GoodShortStreamResponse> {
  const res = await fetch(`${API_BASE}/goodshort/stream?bookId=${bookId}&chapterIndex=${chapterIndex}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch GoodShort stream');
  return res.json();
}

// ============================================================
// Normalized Short Drama type for homepage display
// ============================================================

export interface NormalizedShortDrama {
  id: string;
  title: string;
  cover: string;
  description: string;
  episodeCount: number;
  tags: string[];
  provider: string;
}

/** Normalize items from any short drama provider to a common shape */
export function normalizeShortDramas(
  books: Array<{
    drama_id?: string;
    bookId?: string;
    id?: string;
    drama_name?: string;
    bookName?: string;
    name?: string;
    title?: string;
    thumb_url?: string;
    cover?: string;
    coverWap?: string;
    image?: string;
    description?: string;
    introduction?: string;
    episode_count?: number;
    chapterCount?: number;
    tags?: string[];
    free?: boolean;
  }>,
  provider: string
): NormalizedShortDrama[] {
  return books.map((b) => ({
    id: b.drama_id || b.bookId || b.id || '',
    title: b.drama_name || b.bookName || b.name || b.title || 'Untitled',
    cover: b.thumb_url || b.coverWap || b.cover || b.image || '',
    description: b.description || b.introduction || '',
    episodeCount: b.episode_count || b.chapterCount || 0,
    tags: b.tags || [],
    provider,
  }));
}
