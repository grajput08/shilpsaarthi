import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicRegistrationSchema } from '@/lib/validation';
import { sendWhatsappMessage, renderTemplate } from '@/lib/adapters/whatsapp';
import { logAudit } from '@/lib/audit';
import { computeCompleteness } from '@/lib/format';

export const runtime = 'nodejs';

function decodeDataUrl(dataUrl: string): { buffer: Buffer; contentType: string; ext: string } | null {
  const match = /^data:(.+?);base64,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1];
  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  return { buffer: Buffer.from(match[2], 'base64'), contentType, ext };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = publicRegistrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const input = parsed.data;
  const admin = createAdminClient();

  // A valid, active registration token is required for public submissions.
  if (!input.token) {
    return NextResponse.json({ error: 'A registration link token is required.' }, { status: 400 });
  }
  const { data: tokenRow } = await admin
    .from('registration_tokens')
    .select('token, status, expires_at')
    .eq('token', input.token)
    .maybeSingle();
  if (!tokenRow || tokenRow.status !== 'active') {
    return NextResponse.json({ error: 'This registration link is invalid or already used.' }, { status: 409 });
  }
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This registration link has expired.' }, { status: 409 });
  }

  const completeness = computeCompleteness({
    basicComplete: true,
    addressComplete: Boolean(input.state && input.district && input.village),
    gpsCaptured: false,
    consentCaptured: true,
    craftComplete: Boolean(input.primary_craft),
    productPhotos: Boolean(input.photo_paths?.length),
    documentsChecked: false,
    decisionPresent: false,
  });

  // 1. create the artisan as "Registration Submitted"
  const { data: artisan, error: artisanError } = await admin
    .from('artisans')
    .insert({
      full_name: input.full_name,
      phone: input.phone,
      gender: input.gender ?? null,
      tribe_community: input.tribe_community || null,
      primary_craft: input.primary_craft,
      status: 'registration_submitted',
      registration_source: 'public_link',
      consent_status: 'granted',
      preferred_language: input.preferred_language,
      state: input.state,
      district: input.district,
      block: input.block || null,
      village: input.village,
      data_completeness: completeness,
    })
    .select('*')
    .single();

  if (artisanError || !artisan) {
    return NextResponse.json(
      { error: `Could not save registration: ${artisanError?.message}` },
      { status: 500 },
    );
  }

  // 2. craft profile + address
  await admin.from('craft_profiles').insert({
    artisan_id: artisan.id,
    craft_category: input.primary_craft,
  });
  await admin.from('addresses').insert({
    artisan_id: artisan.id,
    state: input.state,
    district: input.district,
    block: input.block || null,
    village: input.village,
  });

  // 3. optional product + photos
  if (input.product_name || (input.photo_paths && input.photo_paths.length)) {
    const photoPaths: string[] = [];
    for (let i = 0; i < (input.photo_paths?.length ?? 0); i++) {
      const decoded = decodeDataUrl(input.photo_paths![i]);
      if (!decoded) continue;
      const path = `${artisan.id}/${Date.now()}-${i}.${decoded.ext}`;
      const { error: upErr } = await admin.storage
        .from('product-photos')
        .upload(path, decoded.buffer, { contentType: decoded.contentType, upsert: true });
      if (!upErr) photoPaths.push(path);
    }
    await admin.from('products').insert({
      artisan_id: artisan.id,
      name: input.product_name || 'Sample product',
      category: input.primary_craft,
      description: input.product_description || null,
      photo_paths: photoPaths,
    });
  }

  // 4. transition to Pending Verification (records a status_changed audit via trigger)
  await admin.from('artisans').update({ status: 'pending_verification' }).eq('id', artisan.id);

  // mark the registration token as used and link it to the new artisan
  await admin
    .from('registration_tokens')
    .update({ status: 'used', used_at: new Date().toISOString(), artisan_id: artisan.id })
    .eq('token', input.token);

  // 5. mock WhatsApp confirmation
  const { data: template } = await admin
    .from('whatsapp_templates')
    .select('*')
    .eq('template_key', 'registration_confirmation')
    .single();
  if (template) {
    const body = renderTemplate(template.body, {
      name: input.full_name,
      village: input.village,
    });
    await sendWhatsappMessage(admin, {
      artisanId: artisan.id,
      templateKey: 'registration_confirmation',
      toPhone: input.phone,
      language: input.preferred_language,
      body,
      variables: { name: input.full_name, village: input.village },
    });
  }

  // 6. business audit
  await logAudit(admin, {
    entityType: 'artisan',
    entityId: artisan.id,
    action: 'form_submitted',
    actorRole: 'public',
    source: 'public_registration',
    newValue: { source: 'public_link', status: 'pending_verification' },
  });

  return NextResponse.json({
    ok: true,
    artisanId: artisan.id,
    artisanCode: artisan.artisan_code,
  });
}
