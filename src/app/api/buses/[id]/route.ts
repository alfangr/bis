import { NextResponse } from 'next/server';
import { getBuses, saveBuses } from '@/lib/json-db';
import type { Bus } from '@/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params): Promise<NextResponse<Bus | { error: string }>> {
  const buses = await getBuses();
  const bus = buses.find((b) => b.id === params.id);

  if (!bus) {
    return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
  }

  return NextResponse.json(bus);
}

export async function PUT(req: Request, { params }: Params): Promise<NextResponse<Bus | { error: string }>> {
  try {
    const rawBody = (await req.json()) as Record<string, unknown>;
    const buses = await getBuses();
    const index = buses.findIndex((b) => b.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    const current = buses[index];
    const { busClass, ...rest } = rawBody;
    const busClassStr = typeof busClass === 'string' ? busClass : undefined;

    buses[index] = {
      ...current,
      ...(typeof rest.poName === 'string' ? { poName: rest.poName.trim() } : {}),
      ...(busClassStr ? { class: busClassStr.trim() } : {}),
      ...(typeof rest.from === 'string' ? { from: rest.from.trim() } : {}),
      ...(typeof rest.to === 'string' ? { to: rest.to.trim() } : {}),
      ...(typeof rest.departure === 'string' ? { departure: rest.departure.trim() } : {}),
      ...(typeof rest.arrival === 'string' ? { arrival: rest.arrival.trim() } : {}),
      ...(typeof rest.price === 'number' ? { price: rest.price } : {}),
    };

    await saveBuses(buses);
    return NextResponse.json(buses[index]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params): Promise<NextResponse<{ message: string } | { error: string }>> {
  const buses = await getBuses();
  const filtered = buses.filter((b) => b.id !== params.id);

  if (filtered.length === buses.length) {
    return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
  }

  await saveBuses(filtered);
  return NextResponse.json({ message: 'Bus deleted successfully' });
}
