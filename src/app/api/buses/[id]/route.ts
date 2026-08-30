import { NextResponse } from 'next/server';
import { updateBusOperator, deleteBusOperator } from '@/lib/db';
import type { BusOperator } from '@/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params): Promise<NextResponse<BusOperator | { error: string }>> {
  try {
    const body = (await req.json()) as Partial<{ poName: unknown; poPhone: unknown }>;
    const poName = typeof body.poName === 'string' ? body.poName.trim() : undefined;
    const poPhone = typeof body.poPhone === 'string' ? body.poPhone.trim() : undefined;

    if (poName === '') {
      return NextResponse.json({ error: 'Nama PO Bis tidak boleh kosong' }, { status: 400 });
    }

    const updated = await updateBusOperator(params.id, { poName, poPhone });
    if (!updated) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
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
    const deleted = await deleteBusOperator(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Bus deleted successfully' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal menghapus bis' },
      { status: 500 }
    );
  }
}
