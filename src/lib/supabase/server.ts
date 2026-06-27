import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { AREA_COOKIE_NAME, type AuthArea } from '@/lib/auth/area';

/**
 * Server-side Supabase client bound to a portal-specific auth cookie.
 * Enforces RLS as the signed-in user for that portal.
 */
export function createClient(area: AuthArea) {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: AREA_COOKIE_NAME[area],
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookie writes are handled by middleware.
          }
        },
      },
    },
  );
}
