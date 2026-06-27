import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Database } from './supabase/database.types';
import type { AppRole } from './domain';
import { areaFromRoles, type AuthArea } from './auth/area';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/** Current signed-in profile for a portal, or null. */
export async function getProfile(area: AuthArea): Promise<Profile | null> {
  const supabase = createClient(area);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data ?? null;
}

/**
 * Require a signed-in profile with one of the allowed roles, else redirect.
 * Uses the portal-specific session cookie inferred from the allowed roles.
 */
export async function requireProfile(roles: AppRole[]): Promise<Profile> {
  const area = areaFromRoles(roles);
  const profile = await getProfile(area);
  const loginPath = area === 'verifier' ? '/verifier/login' : '/login';
  if (!profile) redirect(loginPath);
  if (!roles.includes(profile.role)) {
    redirect(profile.role === 'verifier' ? '/verifier' : '/admin');
  }
  return profile;
}
