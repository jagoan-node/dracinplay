import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('id') || searchParams.get('bookId');
  const episode = searchParams.get('episode') || '0';
  try {
    const res = await fetch(`https://api.sonzaix.indevs.in/goodshort/stream?bookId=${bookId}&chapterIndex=${episode}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
