import { NextResponse } from 'next/server';
import { getCities, saveCities, generateId } from '@/lib/json-db';
import type { City } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<City[]>> {
  const cities = await getCities();
  return NextResponse.json(cities);
}

export async function POST(req: Request): Promise<NextResponse<City | { error: string }>> {
  try {
    const body = (await req.json()) as Omit<City, 'id'>;
    const { name, province } = body;

    if (!name?.trim() || !province?.trim()) {
      return NextResponse.json({ error: 'Name and province are required' }, { status: 400 });
    }

    const cities = await getCities();
    const newCity: City = {
      id: generateId('CITY', cities),
      name: name.trim(),
      province: province.trim(),
    };

    cities.push(newCity);
    await saveCities(cities);

    return NextResponse.json(newCity, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
