import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  try {
    const res = await fetch(`https://api.sonzaix.indevs.in/drama/info?id=${id}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 0, data: null }, { status: 500 });
  }
}
