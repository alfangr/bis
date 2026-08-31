import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE']);

// GET on these stays public — the landing page reads cities/schedules
// unauthenticated. Only writes (used exclusively by the admin dashboard)
// require an authenticated, allow-listed session.
export default auth((req) => {
  if (MUTATING_METHODS.has(req.method) && !req.auth) {
    return NextResponse.json(
      { error: 'Unauthorized — silakan login sebagai admin terlebih dahulu' },
      { status: 401 }
    );
  }
});

export const config = {
  matcher: ['/api/cities/:path*', '/api/buses/:path*', '/api/schedules/:path*', '/api/import/:path*'],
};
