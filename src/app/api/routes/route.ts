import { NextResponse } from 'next/server';
import { getRoutes, saveRoutes, generateId } from '@/lib/json-db';
import type { Route } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<Route[]>> {
  const routes = await getRoutes();
  return NextResponse.json(routes);
}

export async function POST(req: Request): Promise<NextResponse<Route | { error: string }>> {
  try {
    const body = (await req.json()) as Omit<Route, 'id'>;
    const { from, to, minPrice, maxPrice, busCount, description } = body;

    if (
      !from?.trim() ||
      !to?.trim() ||
      typeof minPrice !== 'number' ||
      typeof maxPrice !== 'number' ||
      typeof busCount !== 'number' ||
      !description?.trim()
    ) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    const routes = await getRoutes();
    const newRoute: Route = {
      id: generateId('ROUTE', routes),
      from: from.trim(),
      to: to.trim(),
      minPrice,
      maxPrice,
      busCount,
      description: description.trim(),
    };

    routes.push(newRoute);
    await saveRoutes(routes);

    return NextResponse.json(newRoute, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
