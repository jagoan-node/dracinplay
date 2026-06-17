import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  try {
    const res = await fetch('https://api.sonzaix.indevs.in/pinedrama/detail?id=' + id);
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ data: null }, { status: 500 }); }
}
