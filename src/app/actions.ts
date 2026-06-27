'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signOutAdmin() {
  const supabase = createClient('admin');
  await supabase.auth.signOut();
  redirect('/login');
}

export async function signOutVerifier() {
  const supabase = createClient('verifier');
  await supabase.auth.signOut();
  redirect('/verifier/login');
}
