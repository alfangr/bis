import { NextResponse } from 'next/server';
import { updateSchedule, deleteSchedule, type ScheduleInput } from '@/lib/db';
import type { Bus, BusClass, BusStop } from '@/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

const BUS_CLASSES: BusClass[] = ['Ekonomi', 'Patas'];
const isBusClass = (value: unknown): value is BusClass =>
  typeof value === 'string' && (BUS_CLASSES as string[]).includes(value);

const parseStops = (value: unknown): BusStop[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const stops = value
    .filter(
      (s): s is { city: unknown; time?: unknown; price: unknown } =>
        typeof s === 'object' && s !== null
    )
    .map((s) => ({
      city: typeof s.city === 'string' ? s.city.trim() : '',
      time: typeof s.time === 'string' && s.time.trim() ? s.time.trim() : undefined,
      price: typeof s.price === 'number' ? s.price : 0,
    }))
    .filter((s) => s.city !== '');
  return stops.length > 0 ? stops : undefined;
};

export async function PUT(req: Request, { params }: Params): Promise<NextResponse<Bus | { error: string }>> {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { busId, busClass, from, to, departure, arrival, price, stops } = body;

    const patch: Partial<ScheduleInput> = {};
    if (typeof busId === 'string' && busId) patch.busId = busId;
    if (isBusClass(busClass)) patch.busClass = busClass;
    if (typeof from === 'string' && from.trim()) patch.from = from.trim();
    if (typeof to === 'string' && to.trim()) patch.to = to.trim();
    if (typeof departure === 'string' && departure.trim()) patch.departure = departure.trim();
    if (typeof arrival === 'string' && arrival.trim()) patch.arrival = arrival.trim();
    if (typeof price === 'number') patch.price = price;
    if (stops !== undefined) patch.stops = parseStops(stops) ?? [];

    const updated = await updateSchedule(params.id, patch);
    if (!updated) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
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
    const deleted = await deleteSchedule(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal menghapus jadwal' },
      { status: 500 }
    );
  }
}
