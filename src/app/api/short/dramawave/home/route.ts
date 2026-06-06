import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.sonzaix.indevs.in/dramawave/home');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: { items: [] } }, { status: 500 });
  }
}
