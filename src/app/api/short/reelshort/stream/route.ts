import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const url = new URL('https://api.sonzaix.indevs.in/reelshort/stream');
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    const res = await fetch(url.toString());
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
