import { NextResponse } from 'next/server';
import { getBusOperators, createBusOperator } from '@/lib/db';
import type { BusOperator } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<BusOperator[] | { error: string }>> {
  try {
    const buses = await getBusOperators();
    return NextResponse.json(buses);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memuat data bis' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request): Promise<NextResponse<BusOperator | { error: string }>> {
  try {
    const body = (await req.json()) as { poName?: unknown };
    const { poName } = body;

    if (typeof poName !== 'string' || !poName.trim()) {
      return NextResponse.json({ error: 'Nama PO Bis wajib diisi' }, { status: 400 });
    }

    const created = await createBusOperator({
      poName: poName.trim(),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }
}
