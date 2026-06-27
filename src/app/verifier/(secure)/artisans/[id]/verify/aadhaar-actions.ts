'use server';

import { createClient } from '@/lib/supabase/server';
import { sendAadhaarOtp, checkAadhaarOtp } from '@/lib/adapters/aadhaar-otp';

export async function requestAadhaarOtp(
  artisanId: string,
  aadhaar: string,
): Promise<
  | { ok: true; devCode: string; masked: string; message: string }
  | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Your session expired. Please sign in again.' };

  const result = sendAadhaarOtp(artisanId, aadhaar);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, devCode: result.devCode, masked: result.masked, message: result.message };
}

export async function confirmAadhaarOtp(
  artisanId: string,
  aadhaar: string,
  code: string,
): Promise<{ ok: true; masked: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Your session expired. Please sign in again.' };

  const result = checkAadhaarOtp(artisanId, aadhaar, code);
  if (!result.ok) return { ok: false, error: result.error };

  const { error: docErr } = await supabase.from('documents').upsert(
    {
      artisan_id: artisanId,
      doc_type: 'id_proof',
      status: 'available',
      reference_masked: result.masked,
      checked_by: user.id,
    },
    { onConflict: 'artisan_id,doc_type' },
  );
  if (docErr) return { ok: false, error: `Could not save ID proof: ${docErr.message}` };

  return { ok: true, masked: result.masked };
}
