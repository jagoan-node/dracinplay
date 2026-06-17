import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mangaId = searchParams.get('manga_id') || searchParams.get('id');
  try {
    const res = await fetch(`https://api.sonzaix.indevs.in/shinigami/chapter/list?manga_id=${mangaId}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
