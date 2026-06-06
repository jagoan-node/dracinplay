import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  try {
    const res = await fetch(`https://api.sonzaix.indevs.in/drama/home/${type}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 0, count: 0, data: [] }, { status: 500 });
  }
}
