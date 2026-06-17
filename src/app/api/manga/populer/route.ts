import { NextResponse } from 'next/server';
export async function GET() {
  try {
    const res = await fetch('https://api.sonzaix.indevs.in/shinigami/populer');
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ data: [] }, { status: 500 }); }
}
