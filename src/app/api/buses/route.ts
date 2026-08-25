import { NextResponse } from 'next/server';
import { getBuses, saveBuses, generateId } from '@/lib/json-db';
import type { Bus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<Bus[]>> {
  const buses = await getBuses();
  return NextResponse.json(buses);
}

type BusCreatePayload = {
  poName: unknown;
  busClass: unknown;
  from: unknown;
  to: unknown;
  departure: unknown;
  arrival: unknown;
  price: unknown;
};

export async function POST(req: Request): Promise<NextResponse<Bus | { error: string }>> {
  try {
    const raw = (await req.json()) as BusCreatePayload;
    const { poName, busClass, from, to, departure, arrival, price } = raw;

    if (
      typeof poName !== 'string' ||
      poName.trim() === '' ||
      typeof busClass !== 'string' ||
      busClass.trim() === '' ||
      typeof from !== 'string' ||
      from.trim() === '' ||
      typeof to !== 'string' ||
      to.trim() === '' ||
      typeof departure !== 'string' ||
      departure.trim() === '' ||
      typeof arrival !== 'string' ||
      arrival.trim() === '' ||
      typeof price !== 'number'
    ) {
      return NextResponse.json({ error: 'Semua field wajib harus diisi dengan benar' }, { status: 400 });
    }

    const buses = await getBuses();
    const newBus: Bus = {
      id: generateId('BIS', buses),
      poName: poName.trim(),
      poPhone: '',
      class: busClass.trim(),
      from: from.trim(),
      to: to.trim(),
      departure: departure.trim(),
      arrival: arrival.trim(),
      duration: '',
      price,
      seats: { available: 0, total: 0 },
      amenities: [],
    };

    buses.push(newBus);
    await saveBuses(buses);

    return NextResponse.json(newBus, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
