'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { generateToken } from '@/lib/token';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProfile } from '@/lib/auth';
import { sendWhatsappMessage, renderTemplate } from '@/lib/adapters/whatsapp';
import { logAudit } from '@/lib/audit';
import type { ArtisanStatus } from '@/lib/domain';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Assign (or reassign) a verifier to an artisan and create the field task. */
export async function assignVerifier(formData: FormData): Promise<ActionResult> {
  const artisanId = String(formData.get('artisan_id') ?? '');
  const verifierId = String(formData.get('verifier_id') ?? '');
  const dueDate = String(formData.get('due_date') ?? '') || null;
  const priority = (String(formData.get('priority') ?? 'normal') || 'normal') as
    | 'high'
    | 'normal'
    | 'revisit'
    | 'correction';
  if (!artisanId || !verifierId) return { ok: false, error: 'Artisan and verifier are required.' };

  const profile = await getProfile();
  if (!profile) return { ok: false, error: 'Not signed in.' };

  const supabase = createClient();

  // Retire any existing active assignment, then create the new one.
  await supabase
    .from('assignments')
    .update({ status: 'reassigned' })
    .eq('artisan_id', artisanId)
    .in('status', ['assigned', 'in_progress']);

  const { error: aErr } = await supabase.from('assignments').insert({
    artisan_id: artisanId,
    verifier_id: verifierId,
    assigned_by: profile.id,
    status: 'assigned',
    priority,
    due_date: dueDate,
  });
  if (aErr) return { ok: false, error: aErr.message };

  const { error: uErr } = await supabase
    .from('artisans')
    .update({ assigned_verifier: verifierId, status: 'assigned' })
    .eq('id', artisanId);
  if (uErr) return { ok: false, error: uErr.message };

  const admin = createAdminClient();
  await logAudit(admin, {
    entityType: 'artisan',
    entityId: artisanId,
    action: 'verifier_assigned',
    actorId: profile.id,
    actorRole: profile.role,
    source: 'admin',
    newValue: { verifier_id: verifierId, priority },
  });

  revalidatePath('/admin/queue');
  revalidatePath('/admin/assignments');
  revalidatePath(`/admin/registry/${artisanId}`);
  return { ok: true };
}

/** Change an artisan's lifecycle status (approve / request correction / reject). */
export async function updateArtisanStatus(formData: FormData): Promise<ActionResult> {
  const artisanId = String(formData.get('artisan_id') ?? '');
  const status = String(formData.get('status') ?? '') as ArtisanStatus;
  const reason = String(formData.get('reason') ?? '') || null;
  if (!artisanId || !status) return { ok: false, error: 'Missing fields.' };

  const profile = await getProfile();
  if (!profile) return { ok: false, error: 'Not signed in.' };

  const supabase = createClient();
  const { error } = await supabase.from('artisans').update({ status }).eq('id', artisanId);
  if (error) return { ok: false, error: error.message };

  const admin = createAdminClient();
  const action = status === 'verified' || status === 'market_ready' ? 'approved' : status === 'rejected' ? 'rejected' : 'status_changed';
  await logAudit(admin, {
    entityType: 'artisan',
    entityId: artisanId,
    action,
    actorId: profile.id,
    actorRole: profile.role,
    reason,
    source: 'admin',
    newValue: { status },
  });

  revalidatePath(`/admin/registry/${artisanId}`);
  revalidatePath('/admin/queue');
  return { ok: true };
}

/** Send a mocked WhatsApp message from an approved template. */
export async function sendWhatsApp(formData: FormData): Promise<ActionResult> {
  const artisanId = String(formData.get('artisan_id') ?? '') || null;
  const templateKey = String(formData.get('template_key') ?? '');
  if (!templateKey) return { ok: false, error: 'Choose a template.' };

  const profile = await getProfile();
  if (!profile) return { ok: false, error: 'Not signed in.' };

  const supabase = createClient();
  const { data: template } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .eq('template_key', templateKey)
    .single();
  if (!template) return { ok: false, error: 'Template not found.' };

  let toPhone: string | null = null;
  let vars: Record<string, string> = {};
  if (artisanId) {
    const { data: artisan } = await supabase
      .from('artisans')
      .select('full_name, phone, village, district, artisan_code, primary_craft')
      .eq('id', artisanId)
      .single();
    if (artisan) {
      toPhone = artisan.phone;
      vars = {
        name: artisan.full_name,
        village: artisan.village ?? '',
        district: artisan.district ?? '',
        artisan_id: artisan.artisan_code ?? '',
        craft: artisan.primary_craft ?? '',
        helpline: '1800-000-000',
        form_link: 'https://wa.me/registration',
        verifier_name: 'your field verifier',
        date: 'soon',
        detail: 'profile details',
        document: 'ID proof',
      };
    }
  }

  const { error } = await (async () => {
    try {
      await sendWhatsappMessage(supabase, {
        artisanId,
        templateKey,
        toPhone,
        language: template.language,
        body: renderTemplate(template.body, vars),
        variables: vars,
        sentBy: profile.id,
      });
      return { error: null as string | null };
    } catch (e) {
      return { error: (e as Error).message };
    }
  })();
  if (error) return { ok: false, error };

  const admin = createAdminClient();
  await logAudit(admin, {
    entityType: 'whatsapp',
    entityId: artisanId,
    action: 'whatsapp_sent',
    actorId: profile.id,
    actorRole: profile.role,
    source: 'admin',
    newValue: { template: templateKey },
  });

  revalidatePath('/admin/whatsapp');
  if (artisanId) revalidatePath(`/admin/registry/${artisanId}`);
  return { ok: true };
}

/** Resolve a duplicate candidate: merge (mark match as duplicate) or dismiss. */
export async function resolveDuplicate(formData: FormData): Promise<ActionResult> {
  const candidateId = String(formData.get('candidate_id') ?? '');
  const decision = String(formData.get('decision') ?? '');
  const matchArtisanId = String(formData.get('match_artisan_id') ?? '');
  const masterArtisanId = String(formData.get('master_artisan_id') ?? '');
  if (!candidateId || !decision) return { ok: false, error: 'Missing fields.' };

  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') return { ok: false, error: 'Only admins can resolve duplicates.' };

  const supabase = createClient();

  if (decision === 'merge') {
    await supabase.from('artisans').update({ status: 'duplicate' }).eq('id', matchArtisanId);
    await supabase
      .from('duplicate_candidates')
      .update({
        status: 'merged',
        master_artisan_id: masterArtisanId || null,
        resolved_by: profile.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', candidateId);
  } else {
    await supabase
      .from('duplicate_candidates')
      .update({ status: 'dismissed', resolved_by: profile.id, resolved_at: new Date().toISOString() })
      .eq('id', candidateId);
  }

  const admin = createAdminClient();
  await logAudit(admin, {
    entityType: 'duplicate_candidate',
    entityId: candidateId,
    action: 'duplicate_merged',
    actorId: profile.id,
    actorRole: profile.role,
    source: 'admin',
    newValue: { decision },
  });

  revalidatePath('/admin/duplicates');
  return { ok: true };
}

/** Record a report/export download in the audit trail. */
export async function recordExport(kind: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: 'Not signed in.' };
  const admin = createAdminClient();
  await logAudit(admin, {
    entityType: 'report',
    entityId: null,
    action: 'export_downloaded',
    actorId: profile.id,
    actorRole: profile.role,
    source: 'admin',
    newValue: { kind },
  });
  revalidatePath('/admin/audit');
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Registration links (token-based public form)
// -----------------------------------------------------------------------------
function originFromHeaders(): string {
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export interface TokenResult extends ActionResult {
  token?: string;
  url?: string;
}

/** Generate a unique public registration link. No name/phone required; prefill optional. */
export async function createRegistrationToken(formData: FormData): Promise<TokenResult> {
  const profile = await getProfile();
  if (!profile || !['admin', 'operator', 'district_officer'].includes(profile.role)) {
    return { ok: false, error: 'Not authorised to create links.' };
  }

  const prefill: Record<string, string> = {};
  for (const key of ['full_name', 'phone', 'state', 'district', 'village', 'primary_craft']) {
    const v = String(formData.get(key) ?? '').trim();
    if (v) prefill[key] = v;
  }

  const supabase = createClient();
  const token = generateToken();
  const { error } = await supabase.from('registration_tokens').insert({
    token,
    prefill: prefill as never,
    created_by: profile.id,
    status: 'active',
  });
  if (error) return { ok: false, error: error.message };

  const admin = createAdminClient();
  await logAudit(admin, {
    entityType: 'registration_token',
    entityId: token,
    action: 'created',
    actorId: profile.id,
    actorRole: profile.role,
    source: 'admin',
    newValue: { prefill },
  });

  revalidatePath('/admin/links');
  return { ok: true, token, url: `${originFromHeaders()}/a/form?id=${token}` };
}

/** Admin override: allow a verification to be Fully Verified despite rejected/cancelled items. */
export async function overrideVerification(formData: FormData): Promise<ActionResult> {
  const verificationId = String(formData.get('verification_id') ?? '');
  const artisanId = String(formData.get('artisan_id') ?? '');
  if (!verificationId) return { ok: false, error: 'Missing verification id.' };

  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') return { ok: false, error: 'Only admins can override.' };

  const supabase = createClient();
  // admin_override must be set in the same row before/with the decision so the
  // enforcement trigger permits it.
  const { error } = await supabase
    .from('verifications')
    .update({ admin_override: true, decision: 'verified' })
    .eq('id', verificationId);
  if (error) return { ok: false, error: error.message };

  if (artisanId) {
    await supabase.from('artisans').update({ status: 'verified' }).eq('id', artisanId);
  }

  const admin = createAdminClient();
  await logAudit(admin, {
    entityType: 'verification',
    entityId: verificationId,
    action: 'approved',
    actorId: profile.id,
    actorRole: profile.role,
    reason: 'admin override — fully verified despite flagged items',
    source: 'admin',
    newValue: { admin_override: true, decision: 'verified' },
  });

  if (artisanId) revalidatePath(`/admin/registry/${artisanId}`);
  return { ok: true };
}

/** Mock-send a registration link via WhatsApp (persisted message). */
export async function sendRegistrationLink(formData: FormData): Promise<ActionResult> {
  const token = String(formData.get('token') ?? '');
  const phone = String(formData.get('phone') ?? '').trim();
  if (!token) return { ok: false, error: 'Missing token.' };
  if (!/^[6-9][0-9]{9}$/.test(phone)) return { ok: false, error: 'Enter a valid 10-digit phone to send to.' };

  const profile = await getProfile();
  if (!profile) return { ok: false, error: 'Not signed in.' };

  const supabase = createClient();
  const { data: tpl } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .eq('template_key', 'registration_invite')
    .single();

  const url = `${originFromHeaders()}/a/form?id=${token}`;
  const vars = { name: 'Artisan', form_link: url };
  const body = tpl
    ? renderTemplate(tpl.body, vars)
    : `Namaste, please register here: ${url}`;

  try {
    await sendWhatsappMessage(supabase, {
      templateKey: 'registration_invite',
      toPhone: phone,
      language: 'en',
      body,
      variables: vars,
      sentBy: profile.id,
    });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  revalidatePath('/admin/whatsapp');
  return { ok: true };
}
