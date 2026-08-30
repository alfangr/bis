import { NextResponse } from 'next/server';
import { getSchedules, createSchedule, type ScheduleInput } from '@/lib/db';
import type { Bus, BusStop } from '@/types';

export const dynamic = 'force-dynamic';

const parseStops = (value: unknown): BusStop[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const stops = value
    .filter(
      (s): s is { city: unknown; price: unknown } =>
        typeof s === 'object' && s !== null
    )
    .map((s) => ({
      city: typeof s.city === 'string' ? s.city.trim() : '',
      price: typeof s.price === 'number' ? s.price : 0,
    }))
    .filter((s) => s.city !== '');
  return stops.length > 0 ? stops : undefined;
};

export async function GET(): Promise<NextResponse<Bus[] | { error: string }>> {
  try {
    const schedules = await getSchedules();
    return NextResponse.json(schedules);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memuat data jadwal' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request): Promise<NextResponse<Bus | { error: string }>> {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { busId, from, to, departure, arrival, price, stops } = body;

    if (
      typeof busId !== 'string' ||
      !busId ||
      typeof from !== 'string' ||
      !from.trim() ||
      typeof to !== 'string' ||
      !to.trim() ||
      typeof departure !== 'string' ||
      !departure.trim() ||
      typeof arrival !== 'string' ||
      !arrival.trim() ||
      typeof price !== 'number'
    ) {
      return NextResponse.json({ error: 'Semua field wajib harus diisi dengan benar' }, { status: 400 });
    }

    const input: ScheduleInput = {
      busId,
      from: from.trim(),
      to: to.trim(),
      departure: departure.trim(),
      arrival: arrival.trim(),
      price,
      stops: parseStops(stops),
    };

    const created = await createSchedule(input);
    if (!created) {
      return NextResponse.json({ error: 'Bus tidak ditemukan' }, { status: 400 });
    }
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }
}
