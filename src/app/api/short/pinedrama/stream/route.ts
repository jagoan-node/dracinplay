import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const episode = searchParams.get('episode') || '1';
  try {
    const res = await fetch('https://api.sonzaix.indevs.in/pinedrama/stream?id=' + id + '&episode=' + episode);
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ data: null }, { status: 500 }); }
}
