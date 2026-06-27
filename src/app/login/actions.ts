'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface LoginState {
  error?: string;
}

const CRM_ROLES = ['admin', 'operator', 'district_officer'] as const;

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Email and password are required.' };

  const supabase = createClient('admin');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Invalid email or password.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  if (!profile || !CRM_ROLES.includes(profile.role as (typeof CRM_ROLES)[number])) {
    await supabase.auth.signOut();
    return { error: 'Use the field verifier login for verifier accounts.' };
  }

  redirect('/admin');
}
