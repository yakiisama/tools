import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word')!;
  const n = searchParams.get('n');
  const res = await fetch(
    `https://api.lolimi.cn/API/qqdg/?word=${encodeURIComponent(word)}&n=${n}`
  );
  const data = await res.json();

  return NextResponse.json({ ...data });
}

