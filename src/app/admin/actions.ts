'use server';

import { revalidatePath } from 'next/cache';
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

  const profile = await getProfile('admin');
  if (!profile) return { ok: false, error: 'Not signed in.' };

  const supabase = createClient('admin');

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
  revalidatePath(`/admin/registry/${artisanId}`);
  return { ok: true };
}

/** Change an artisan's lifecycle status (approve / request correction / reject). */
export async function updateArtisanStatus(formData: FormData): Promise<ActionResult> {
  const artisanId = String(formData.get('artisan_id') ?? '');
  const status = String(formData.get('status') ?? '') as ArtisanStatus;
  const reason = String(formData.get('reason') ?? '') || null;
  if (!artisanId || !status) return { ok: false, error: 'Missing fields.' };

  const profile = await getProfile('admin');
  if (!profile) return { ok: false, error: 'Not signed in.' };

  const supabase = createClient('admin');
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

  const profile = await getProfile('admin');
  if (!profile) return { ok: false, error: 'Not signed in.' };

  const supabase = createClient('admin');
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

  const profile = await getProfile('admin');
  if (!profile || profile.role !== 'admin') return { ok: false, error: 'Only admins can resolve duplicates.' };

  const supabase = createClient('admin');

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

/** Admin override: allow a verification to be Fully Verified despite rejected/cancelled items. */
export async function overrideVerification(formData: FormData): Promise<ActionResult> {
  const verificationId = String(formData.get('verification_id') ?? '');
  const artisanId = String(formData.get('artisan_id') ?? '');
  if (!verificationId) return { ok: false, error: 'Missing verification id.' };

  const profile = await getProfile('admin');
  if (!profile || profile.role !== 'admin') return { ok: false, error: 'Only admins can override.' };

  const supabase = createClient('admin');
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
