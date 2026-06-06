import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.sonzaix.indevs.in/goodshort/home');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: { recommentList: [] } }, { status: 500 });
  }
}
