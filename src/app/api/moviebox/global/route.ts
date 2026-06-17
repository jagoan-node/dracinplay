import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  try {
    const res = await fetch('https://api.sonzaix.indevs.in/moviebox/global?page=' + page);
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ data: {} }, { status: 500 }); }
}
