'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verificationSubmitSchema, type VerificationSubmitInput } from '@/lib/validation';
import { sendWhatsappMessage, renderTemplate } from '@/lib/adapters/whatsapp';
import { logAudit } from '@/lib/audit';
import type { ArtisanStatus } from '@/lib/domain';

export interface SubmitResult {
  ok: boolean;
  error?: string;
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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Your session expired. Please sign in again.' };

  // Upload captured photos (data URLs) to artisan-photos (RLS: assigned verifier).
  const photoPaths: string[] = [];
  const photos = input.photo_paths ?? [];
  for (let i = 0; i < photos.length; i++) {
    const decoded = decodeDataUrl(photos[i]);
    if (!decoded) continue;
    const path = `${input.artisan_id}/verify-${Date.now()}-${i}.${decoded.ext}`;
    const { error: upErr } = await supabase.storage
      .from('artisan-photos')
      .upload(path, decoded.buffer, { contentType: decoded.contentType, upsert: true });
    if (!upErr) photoPaths.push(path);
  }

  // Idempotent upsert keyed on the offline client-generated id.
  const { error: vErr } = await supabase
    .from('verifications')
    .upsert(
      {
        artisan_id: input.artisan_id,
        verifier_id: user.id,
        client_generated_id: input.client_generated_id,
        visit_date: input.visit_date || undefined,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        gps_accuracy_m: input.gps_accuracy_m ?? null,
        consent_captured: input.consent_captured,
        consent_mode: input.consent_mode ?? null,
        consent_timestamp: input.consent_captured ? new Date().toISOString() : null,
        identity_verified: input.identity_verified,
        location_verified: input.location_verified,
        craft_verified: input.craft_verified,
        products_captured: input.products_captured,
        documents_checked: input.documents_checked,
        duplicate_checked: input.duplicate_checked,
        market_ready: input.market_ready,
        decision: input.decision,
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        photo_paths: photoPaths,
        sync_status: 'synced',
      },
      { onConflict: 'client_generated_id' },
    );
  if (vErr) return { ok: false, error: vErr.message };

  // Transition artisan status from the decision.
  const newStatus: ArtisanStatus =
    input.decision === 'verified'
      ? input.market_ready
        ? 'market_ready'
        : 'verified'
      : (input.decision as ArtisanStatus);

  const artisanUpdate: Record<string, unknown> = { status: newStatus };
  if (input.consent_captured) artisanUpdate.consent_status = 'granted';
  await supabase.from('artisans').update(artisanUpdate).eq('id', input.artisan_id);

  // Complete the active assignment for terminal decisions.
  if (input.decision !== 'revisit_required') {
    await supabase
      .from('assignments')
      .update({ status: 'completed' })
      .eq('artisan_id', input.artisan_id)
      .in('status', ['assigned', 'in_progress']);
  }

  // Mock WhatsApp status update + business audit (service role).
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
    source: 'field_pwa',
    reason: input.reason ?? null,
    newValue: { decision: input.decision, status: newStatus },
  });

  return { ok: true };
}
