const API_BASE = 'https://api.sonzaix.indevs.in';

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
