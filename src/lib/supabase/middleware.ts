import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';
import { AREA_COOKIE_NAME, resolveAuthArea, type AuthArea } from '@/lib/auth/area';

/** Refresh the auth session cookie for a single portal area. */
async function refreshAreaSession(request: NextRequest, response: NextResponse, area: AuthArea) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: AREA_COOKIE_NAME[area],
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();
}

/** Refreshes the portal-specific auth session cookie on each request. */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const area = resolveAuthArea(request.nextUrl.pathname);

  if (area) {
    await refreshAreaSession(request, response, area);
  }

  return response;
}
