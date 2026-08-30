import { NextResponse } from 'next/server';
import { updateCity, deleteCity } from '@/lib/db';
import type { City } from '@/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params): Promise<NextResponse<City | { error: string }>> {
  try {
    const body = (await req.json()) as Partial<{ name: unknown; province: unknown }>;
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const province = typeof body.province === 'string' ? body.province.trim() : undefined;

    if (name === '' || province === '') {
      return NextResponse.json({ error: 'Nama kota dan provinsi tidak boleh kosong' }, { status: 400 });
    }

    const updated = await updateCity(params.id, { name, province });
    if (!updated) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: Params
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const deleted = await deleteCity(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'City deleted successfully' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal menghapus kota' },
      { status: 500 }
    );
  }
}
