import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Database } from './supabase/database.types';
import type { AppRole } from './domain';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/** Current signed-in profile, or null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data ?? null;
}

/**
 * Require a signed-in profile with one of the allowed roles, else redirect.
 * Verifiers are sent to the field login; everyone else to the admin login.
 */
export async function requireProfile(roles: AppRole[]): Promise<Profile> {
  const profile = await getProfile();
  const loginPath = roles.includes('verifier') && roles.length === 1 ? '/field/login' : '/login';
  if (!profile) redirect(loginPath);
  if (!roles.includes(profile.role)) {
    redirect(profile.role === 'verifier' ? '/field' : '/admin');
  }
  return profile;
}
