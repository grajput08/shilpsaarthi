'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { issueOtp, verifyOtp } from '@/lib/adapters/otp';

export interface FieldLoginState {
  stage: 'request' | 'verify';
  email?: string;
  devCode?: string;
  error?: string;
}

export async function fieldLogin(
  _prev: FieldLoginState,
  formData: FormData,
): Promise<FieldLoginState> {
  const intent = String(formData.get('intent') ?? 'request');
  const email = String(formData.get('email') ?? '').trim();

  if (intent === 'request') {
    if (!email) return { stage: 'request', error: 'Enter your registered email or employee ID.' };
    const { devCode } = issueOtp(email);
    return { stage: 'verify', email, devCode };
  }

  // verify stage
  const code = String(formData.get('code') ?? '').trim();
  if (!verifyOtp(email, code)) {
    return { stage: 'verify', email, error: 'Invalid or expired code. Try again.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: process.env.DEMO_USER_PASSWORD ?? 'Password123!',
  });
  if (error) {
    return { stage: 'verify', email, error: 'Sign-in failed. Make sure this is a registered verifier email.' };
  }
  redirect('/field');
}
