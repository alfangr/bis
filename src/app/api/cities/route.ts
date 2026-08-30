import { NextResponse } from 'next/server';
import { getCities, createCity } from '@/lib/db';
import type { City } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<City[] | { error: string }>> {
  try {
    const cities = await getCities();
    return NextResponse.json(cities);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memuat data kota' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request): Promise<NextResponse<City | { error: string }>> {
  try {
    const body = (await req.json()) as { name?: unknown; province?: unknown };
    const { name, province } = body;

    if (typeof name !== 'string' || !name.trim() || typeof province !== 'string' || !province.trim()) {
      return NextResponse.json({ error: 'Nama kota dan provinsi wajib diisi' }, { status: 400 });
    }

    const created = await createCity({ name: name.trim(), province: province.trim() });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }
}
