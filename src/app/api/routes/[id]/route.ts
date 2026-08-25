import { NextResponse } from 'next/server';
import { getRoutes, saveRoutes } from '@/lib/json-db';
import type { Route } from '@/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params): Promise<NextResponse<Route | { error: string }>> {
  const routes = await getRoutes();
  const route = routes.find((r) => r.id === params.id);

  if (!route) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  return NextResponse.json(route);
}

export async function PUT(req: Request, { params }: Params): Promise<NextResponse<Route | { error: string }>> {
  try {
    const body = (await req.json()) as Partial<Omit<Route, 'id'>>;
    const routes = await getRoutes();
    const index = routes.findIndex((r) => r.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const current = routes[index];

    routes[index] = {
      ...current,
      ...(body.from ? { from: body.from.trim() } : {}),
      ...(body.to ? { to: body.to.trim() } : {}),
      ...(typeof body.minPrice === 'number' ? { minPrice: body.minPrice } : {}),
      ...(typeof body.maxPrice === 'number' ? { maxPrice: body.maxPrice } : {}),
      ...(typeof body.busCount === 'number' ? { busCount: body.busCount } : {}),
      ...(body.description ? { description: body.description.trim() } : {}),
    };

    await saveRoutes(routes);
    return NextResponse.json(routes[index]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params): Promise<NextResponse<{ message: string } | { error: string }>> {
  const routes = await getRoutes();
  const filtered = routes.filter((r) => r.id !== params.id);

  if (filtered.length === routes.length) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  await saveRoutes(filtered);
  return NextResponse.json({ message: 'Route deleted successfully' });
}
