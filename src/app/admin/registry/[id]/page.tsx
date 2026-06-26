import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { signPaths } from '@/lib/storage';
import { Card, CardHeader, CardBody, Chip, ProgressBar } from '@/components/ui';
import { ArtisanStatusBadge, DecisionBadge, DocStatusBadge, WhatsappStatusBadge } from '@/components/badges';
import ArtisanActions from '@/components/admin/ArtisanActions';
import {
  CRAFT_CATEGORY,
  CONSENT_STATUS,
  REGISTRATION_SOURCE,
  DOCUMENT_TYPE,
  type DocStatus,
  type VerificationDecision,
  type WhatsappStatus,
} from '@/lib/domain';
import { formatDate, formatDateTime, maskPhone, ageFromDob } from '@/lib/format';

export default async function AdminArtisanDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const profile = await getProfile();

  const { data: artisan } = await supabase
    .from('artisans')
    .select(
      `*,
       craft_profiles(*),
       addresses(*),
       products(*),
       documents(*),
       verifications(*, verifier:profiles(full_name)),
       whatsapp_messages(*)`,
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!artisan) notFound();

  const { data: verifiers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'verifier')
    .eq('is_active', true);
  const { data: templates } = await supabase
    .from('whatsapp_templates')
    .select('template_key, name')
    .order('name');

  const craft = (artisan.craft_profiles as { craft_category: string | null; sub_category: string | null; experience_years: number | null; monthly_capacity: number | null; group_name: string | null; training_needs: string | null }[] | null)?.[0];
  const address = (artisan.addresses as { latitude: number | null; longitude: number | null; gps_captured_at: string | null; address_line: string | null; landmark: string | null; pin_code: string | null }[] | null)?.[0];
  const products = (artisan.products as { id: string; name: string; price_min: number | null; price_max: number | null; photo_paths: string[] }[] | null) ?? [];
  const documents = (artisan.documents as { id: string; doc_type: string; status: string; reference_masked: string | null }[] | null) ?? [];
  const verifications = (artisan.verifications as { id: string; visit_date: string; decision: string | null; notes: string | null; reason: string | null; latitude: number | null; longitude: number | null; verifier: { full_name: string } | null }[] | null) ?? [];
  const messages = (artisan.whatsapp_messages as { id: string; body: string; status: string; sent_at: string | null; template_key: string | null }[] | null) ?? [];

  const allProductPhotos = products.flatMap((p) => p.photo_paths ?? []);
  const signedProductPhotos = await signPaths('product-photos', allProductPhotos);
  const photoMap = new Map(allProductPhotos.map((p, i) => [p, signedProductPhotos[i]]));

  const canAssign = profile?.role === 'admin' || profile?.role === 'district_officer';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{artisan.full_name}</h1>
            <ArtisanStatusBadge status={artisan.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {artisan.artisan_code} · {artisan.primary_craft ? CRAFT_CATEGORY[artisan.primary_craft] : '—'} ·{' '}
            {[artisan.village, artisan.district, artisan.state].filter(Boolean).join(', ')}
          </p>
        </div>
        <div className="w-48">
          <p className="text-xs text-slate-500">Data completeness</p>
          <div className="mt-1 flex items-center gap-2">
            <ProgressBar value={artisan.data_completeness} />
            <span className="text-sm font-medium text-slate-700">{artisan.data_completeness}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Basic details" />
            <CardBody className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Phone" value={maskPhone(artisan.phone)} />
              <Row label="Alternate" value={maskPhone(artisan.alternate_phone)} />
              <Row label="Gender" value={artisan.gender ?? '—'} />
              <Row label="Age" value={ageFromDob(artisan.date_of_birth)?.toString() ?? '—'} />
              <Row label="Tribe / community" value={artisan.tribe_community ?? '—'} />
              <Row label="Source" value={REGISTRATION_SOURCE[artisan.registration_source]} />
              <Row label="Consent" value={CONSENT_STATUS[artisan.consent_status]} />
              <Row label="Language" value={artisan.preferred_language} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Address & GPS" />
            <CardBody className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Village" value={artisan.village ?? '—'} />
              <Row label="Block" value={artisan.block ?? '—'} />
              <Row label="District" value={artisan.district ?? '—'} />
              <Row label="State" value={artisan.state ?? '—'} />
              <Row label="Pin code" value={address?.pin_code ?? '—'} />
              <Row label="Landmark" value={address?.landmark ?? '—'} />
              <Row
                label="GPS"
                value={address?.latitude != null ? `${address.latitude}, ${address.longitude}` : 'Not captured'}
              />
              <Row label="GPS captured" value={formatDateTime(address?.gps_captured_at)} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Craft profile" />
            <CardBody className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Category" value={craft?.craft_category ? CRAFT_CATEGORY[craft.craft_category as keyof typeof CRAFT_CATEGORY] : '—'} />
              <Row label="Sub-category" value={craft?.sub_category ?? '—'} />
              <Row label="Experience" value={craft?.experience_years ? `${craft.experience_years} yrs` : '—'} />
              <Row label="Capacity / month" value={craft?.monthly_capacity?.toString() ?? '—'} />
              <Row label="Group / SHG" value={craft?.group_name ?? '—'} />
              <Row label="Training needs" value={craft?.training_needs ?? '—'} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={`Product catalogue (${products.length})`} />
            <CardBody>
              {products.length === 0 ? (
                <p className="text-sm text-slate-400">No products captured.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((p) => (
                    <div key={p.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.price_min != null ? `₹${p.price_min}${p.price_max ? `–₹${p.price_max}` : ''}` : 'Price n/a'}
                      </p>
                      {(p.photo_paths ?? []).length > 0 ? (
                        <div className="mt-2 flex gap-2">
                          {(p.photo_paths ?? []).map((path) =>
                            photoMap.get(path) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={path} src={photoMap.get(path)} alt={p.name} className="h-16 w-16 rounded object-cover" />
                            ) : null,
                          )}
                        </div>
                      ) : (
                        <Chip tone="gray" className="mt-2">No photo</Chip>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Documents" />
            <CardBody>
              {documents.length === 0 ? (
                <p className="text-sm text-slate-400">No documents checked.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((d) => (
                      <tr key={d.id}>
                        <td className="py-2 text-slate-700">{DOCUMENT_TYPE[d.doc_type as keyof typeof DOCUMENT_TYPE]}</td>
                        <td className="py-2 text-xs text-slate-500">{d.reference_masked ?? ''}</td>
                        <td className="py-2 text-right"><DocStatusBadge status={d.status as DocStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>

          <Card data-testid="verification-history">
            <CardHeader title="Verification history" />
            <CardBody className="space-y-3">
              {verifications.length === 0 ? (
                <p className="text-sm text-slate-400">No verification attempts yet.</p>
              ) : (
                verifications.map((v) => (
                  <div key={v.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">{v.verifier?.full_name ?? 'Unknown verifier'}</span>
                      <DecisionBadge decision={(v.decision as VerificationDecision) ?? null} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(v.visit_date)}
                      {v.latitude != null ? ` · 📍 ${v.latitude}, ${v.longitude}` : ''}
                      {v.reason ? ` · ${v.reason}` : ''}
                    </p>
                    {v.notes ? <p className="mt-1 text-slate-600">{v.notes}</p> : null}
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <ArtisanActions
            artisanId={artisan.id}
            verifiers={verifiers ?? []}
            templates={templates ?? []}
            canAssign={canAssign}
          />

          <Card data-testid="whatsapp-timeline">
            <CardHeader title="WhatsApp timeline" />
            <CardBody className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-400">No messages yet.</p>
              ) : (
                messages
                  .slice()
                  .sort((a, b) => (a.sent_at ?? '') < (b.sent_at ?? '') ? 1 : -1)
                  .map((m) => (
                    <div key={m.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">{m.template_key ?? 'custom'}</span>
                        <WhatsappStatusBadge status={m.status as WhatsappStatus} />
                      </div>
                      <p className="mt-1 text-slate-700">{m.body}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(m.sent_at)}</p>
                    </div>
                  ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
