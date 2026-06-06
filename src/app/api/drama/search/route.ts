import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  try {
    const res = await fetch(`https://api.sonzaix.indevs.in/drama/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 0, count: 0, data: [] }, { status: 500 });
  }
}
