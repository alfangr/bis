import { NextResponse } from 'next/server';
import { getCities, saveCities } from '@/lib/json-db';
import type { City } from '@/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params): Promise<NextResponse<City | { error: string }>> {
  const cities = await getCities();
  const city = cities.find((c) => c.id === params.id);

  if (!city) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }

  return NextResponse.json(city);
}

export async function PUT(req: Request, { params }: Params): Promise<NextResponse<City | { error: string }>> {
  try {
    const body = (await req.json()) as Partial<Omit<City, 'id'>>;
    const cities = await getCities();
    const index = cities.findIndex((c) => c.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    if (body.name?.trim() === '' || body.province?.trim() === '') {
      return NextResponse.json({ error: 'Name and province cannot be empty' }, { status: 400 });
    }

    cities[index] = {
      ...cities[index],
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.province ? { province: body.province.trim() } : {}),
    };

    await saveCities(cities);
    return NextResponse.json(cities[index]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params): Promise<NextResponse<{ message: string } | { error: string }>> {
  const cities = await getCities();
  const filtered = cities.filter((c) => c.id !== params.id);

  if (filtered.length === cities.length) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }

  await saveCities(filtered);
  return NextResponse.json({ message: 'City deleted successfully' });
}
