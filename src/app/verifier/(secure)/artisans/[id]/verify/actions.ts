'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verificationSubmitSchema, type VerificationSubmitInput } from '@/lib/validation';
import { sendWhatsappMessage, renderTemplate } from '@/lib/adapters/whatsapp';
import { logAudit } from '@/lib/audit';
import type { ArtisanStatus } from '@/lib/domain';

export interface SubmitResult {
  ok: boolean;
  error?: string;
  needsOverride?: boolean;
}

function decodeDataUrl(dataUrl: string) {
  const match = /^data:(.+?);base64,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1];
  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  return { buffer: Buffer.from(match[2], 'base64'), contentType, ext };
}

const DECISION_TEMPLATE: Record<string, string | null> = {
  verified: 'verified_confirmation',
  needs_correction: 'correction_request',
  revisit_required: 'visit_reminder',
  rejected: null,
  duplicate: null,
};

export async function submitVerification(payload: VerificationSubmitInput): Promise<SubmitResult> {
  const parsed = verificationSubmitSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed: ' + parsed.error.issues[0]?.message };
  }
  const input = parsed.data;
  const supabase = createClient('verifier');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Your session expired. Please sign in again.' };

  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('artisan_id', input.artisan_id)
    .eq('verifier_id', user.id)
    .in('status', ['assigned', 'in_progress'])
    .maybeSingle();

  // 1. Apply field corrections to the artisan (only provided, non-empty values).
  const edits: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input.fields ?? {})) {
    if (v !== undefined && v !== '') edits[k] = v;
  }
  if (Object.keys(edits).length > 0) {
    const { error } = await supabase.from('artisans').update(edits).eq('id', input.artisan_id);
    if (error) return { ok: false, error: `Could not save field edits: ${error.message}` };
  }

  // 1b. Upsert craft profile when provided.
  if (input.craft_profile && Object.values(input.craft_profile).some((v) => v != null && v !== '')) {
    const cp = input.craft_profile;
    const { error: cpErr } = await supabase.from('craft_profiles').upsert(
      {
        artisan_id: input.artisan_id,
        craft_category: input.fields?.primary_craft ?? null,
        sub_category: cp.sub_category ?? null,
        experience_years: cp.experience_years ?? null,
        learned_from: cp.learned_from ?? null,
        works_in_group: cp.works_in_group ?? null,
        group_name: cp.group_name ?? null,
        monthly_capacity: cp.monthly_capacity ?? null,
      },
      { onConflict: 'artisan_id' },
    );
    if (cpErr) return { ok: false, error: `Could not save craft profile: ${cpErr.message}` };
  }

  // 1c. Sync product catalogue rows when provided.
  if (input.products && input.products.length > 0) {
    for (let pi = 0; pi < input.products.length; pi++) {
      const prod = input.products[pi];
      const prodPhotoPaths: string[] = [];
      for (let i = 0; i < (prod.photo_paths ?? []).length; i++) {
        const raw = prod.photo_paths![i];
        if (!raw.startsWith('data:')) {
          prodPhotoPaths.push(raw);
          continue;
        }
        const decoded = decodeDataUrl(raw);
        if (!decoded) continue;
        const path = `${input.artisan_id}/product-${Date.now()}-${pi}-${i}.${decoded.ext}`;
        const { error: upErr } = await supabase.storage
          .from('artisan-photos')
          .upload(path, decoded.buffer, { contentType: decoded.contentType, upsert: true });
        if (!upErr) prodPhotoPaths.push(path);
      }
      const row = {
        artisan_id: input.artisan_id,
        name: prod.name,
        category: prod.category ?? null,
        description: prod.description ?? null,
        materials: prod.materials ?? null,
        dimensions: prod.dimensions ?? null,
        price_min: prod.price_min ?? null,
        price_max: prod.price_max ?? null,
        monthly_capacity: prod.monthly_capacity ?? null,
        buyers: prod.buyers ?? [],
        packaging_available: prod.packaging_available ?? null,
        can_ship: prod.can_ship ?? false,
        photo_paths: prodPhotoPaths,
      };
      if (prod.id) {
        const { error: pErr } = await supabase.from('products').update(row).eq('id', prod.id);
        if (pErr) return { ok: false, error: `Could not update product: ${pErr.message}` };
      } else {
        const { error: pErr } = await supabase.from('products').insert(row);
        if (pErr) return { ok: false, error: `Could not save product: ${pErr.message}` };
      }
    }
  }

  // 2. Upload any captured evidence photos.
  const photoPaths: string[] = [];
  for (let i = 0; i < (input.photo_paths ?? []).length; i++) {
    const raw = input.photo_paths![i];
    if (!raw.startsWith('data:')) {
      photoPaths.push(raw);
      continue;
    }
    const decoded = decodeDataUrl(raw);
    if (!decoded) continue;
    const path = `${input.artisan_id}/verify-${Date.now()}-${i}.${decoded.ext}`;
    const { error: upErr } = await supabase.storage
      .from('artisan-photos')
      .upload(path, decoded.buffer, { contentType: decoded.contentType, upsert: true });
    if (!upErr) photoPaths.push(path);
  }

  const statusOf = (key: string) => input.items.find((it) => it.item_key === key)?.status;
  const isClear = (key: string) => statusOf(key) === 'verified' || statusOf(key) === 'corrected';

  // 3. Upsert the verification WITHOUT a final decision first (so the
  //    verification_items exist before the decision rule is evaluated).
  const { data: verification, error: vErr } = await supabase
    .from('verifications')
    .upsert(
      {
        artisan_id: input.artisan_id,
        assignment_id: assignment?.id ?? null,
        verifier_id: user.id,
        client_generated_id: input.client_generated_id,
        visit_date: input.visit_date || undefined,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        gps_accuracy_m: input.gps_accuracy_m ?? null,
        consent_captured: input.consent_captured,
        consent_mode: input.consent_mode ?? null,
        consent_timestamp: input.consent_captured ? new Date().toISOString() : null,
        identity_verified: isClear('identity'),
        location_verified: isClear('address'),
        craft_verified: isClear('craft'),
        products_captured: isClear('products'),
        documents_checked: statusOf('documents') !== undefined && statusOf('documents') !== 'pending',
        duplicate_checked: statusOf('identity') !== undefined,
        market_ready: input.market_ready,
        decision: null,
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        photo_paths: photoPaths,
        sync_status: 'synced',
      },
      { onConflict: 'client_generated_id' },
    )
    .select('id, admin_override')
    .single();
  if (vErr || !verification) return { ok: false, error: vErr?.message ?? 'Could not save verification.' };

  // 4. Replace the per-item statuses.
  await supabase.from('verification_items').delete().eq('verification_id', verification.id);
  if (input.items.length > 0) {
    const { error: iErr } = await supabase.from('verification_items').insert(
      input.items.map((it) => ({
        verification_id: verification.id,
        artisan_id: input.artisan_id,
        item_key: it.item_key,
        item_label: it.item_label,
        status: it.status,
        note: it.note ?? null,
        evidence_path: it.evidence_path ?? null,
        verified_by: user.id,
      })),
    );
    if (iErr) return { ok: false, error: `Could not save verification items: ${iErr.message}` };
  }

  // 5. Apply the final decision. The DB trigger blocks 'verified' while items are
  //    rejected/cancelled unless admin_override is set on this verification.
  const { error: dErr } = await supabase
    .from('verifications')
    .update({ decision: input.decision })
    .eq('id', verification.id);
  if (dErr) {
    const blocked = /override|row-level|check_violation|Fully Verified/i.test(dErr.message);
    return {
      ok: false,
      needsOverride: blocked,
      error: blocked
        ? 'Some items are rejected/cancelled — this case cannot be marked Fully Verified without an admin override.'
        : dErr.message,
    };
  }

  // 6. Move the artisan to the matching lifecycle status.
  const newStatus: ArtisanStatus =
    input.decision === 'verified'
      ? input.market_ready
        ? 'market_ready'
        : 'verified'
      : (input.decision as ArtisanStatus);
  const artisanUpdate: Record<string, unknown> = { status: newStatus };
  if (input.consent_captured) artisanUpdate.consent_status = 'granted';
  await supabase.from('artisans').update(artisanUpdate).eq('id', input.artisan_id);

  if (assignment?.id) {
    await supabase
      .from('assignments')
      .update({ status: 'completed' })
      .eq('id', assignment.id)
      .eq('verifier_id', user.id);
  }

  revalidatePath('/verifier');
  revalidatePath('/verifier/tasks');
  revalidatePath('/admin/registry');
  revalidatePath(`/admin/registry/${input.artisan_id}`);

  // 7. Mock WhatsApp status update + business audit (service role).
  const admin = createAdminClient();
  const { data: artisan } = await admin
    .from('artisans')
    .select('full_name, phone, village, artisan_code, preferred_language')
    .eq('id', input.artisan_id)
    .single();
  const templateKey = DECISION_TEMPLATE[input.decision];
  if (artisan && templateKey) {
    const { data: template } = await admin
      .from('whatsapp_templates')
      .select('*')
      .eq('template_key', templateKey)
      .single();
    if (template) {
      const vars: Record<string, string> = {
        name: artisan.full_name,
        village: artisan.village ?? '',
        artisan_id: artisan.artisan_code ?? '',
        detail: input.reason ?? 'profile details',
        verifier_name: 'your field verifier',
        date: 'soon',
      };
      await sendWhatsappMessage(admin, {
        artisanId: input.artisan_id,
        templateKey,
        toPhone: artisan.phone,
        language: artisan.preferred_language ?? 'en',
        body: renderTemplate(template.body, vars),
        variables: vars,
        sentBy: user.id,
      });
    }
  }

  await logAudit(admin, {
    entityType: 'artisan',
    entityId: input.artisan_id,
    action: 'verification_submitted',
    actorId: user.id,
    actorRole: 'verifier',
    source: 'verifier_pwa',
    reason: input.reason ?? null,
    newValue: { decision: input.decision, status: newStatus, items: input.items.length },
  });

  return { ok: true };
}
