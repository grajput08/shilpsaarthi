import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardBody, CardHeader, Chip } from '@/components/ui';
import { ArtisanStatusBadge, DecisionBadge } from '@/components/badges';
import { CRAFT_CATEGORY, CONSENT_STATUS, REGISTRATION_SOURCE } from '@/lib/domain';
import { formatDate, maskPhone, ageFromDob } from '@/lib/format';
import { ClipboardCheck } from 'lucide-react';

export default async function FieldArtisanPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: artisan } = await supabase
    .from('artisans')
    .select('*, craft_profiles(*), addresses(*), verifications(*), documents(*)')
    .eq('id', params.id)
    .maybeSingle();

  if (!artisan) notFound();

  const craft = (artisan.craft_profiles as { craft_category: string | null; experience_years: number | null; group_name: string | null }[] | null)?.[0];
  const verifications = (artisan.verifications as { id: string; visit_date: string; decision: string | null; notes: string | null }[] | null) ?? [];
  const documents = (artisan.documents as { id: string; doc_type: string; status: string }[] | null) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{artisan.full_name}</h1>
          <p className="text-sm text-slate-500">{artisan.artisan_code}</p>
        </div>
        <ArtisanStatusBadge status={artisan.status} />
      </div>

      {artisan.duplicate_risk === 'high' ? (
        <div className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800 [text-wrap:pretty]">
          ⚠ Possible duplicate flagged. Please confirm identity carefully.
        </div>
      ) : null}

      <Card>
        <CardHeader title="Identity & contact" />
        <CardBody className="space-y-1 text-sm">
          <Row label="Phone" value={maskPhone(artisan.phone)} />
          <Row label="Gender" value={artisan.gender ?? '—'} />
          <Row label="Age" value={ageFromDob(artisan.date_of_birth)?.toString() ?? '—'} />
          <Row label="Tribe / community" value={artisan.tribe_community ?? '—'} />
          <Row label="Source" value={REGISTRATION_SOURCE[artisan.registration_source]} />
          <Row label="Consent" value={CONSENT_STATUS[artisan.consent_status]} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Address" />
        <CardBody className="space-y-1 text-sm">
          <Row label="Village" value={artisan.village ?? '—'} />
          <Row label="Block" value={artisan.block ?? '—'} />
          <Row label="District" value={artisan.district ?? '—'} />
          <Row label="State" value={artisan.state ?? '—'} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Craft" />
        <CardBody className="space-y-1 text-sm">
          <Row label="Primary craft" value={artisan.primary_craft ? CRAFT_CATEGORY[artisan.primary_craft] : '—'} />
          <Row label="Experience" value={craft?.experience_years ? `${craft.experience_years} yrs` : '—'} />
          <Row label="Group / SHG" value={craft?.group_name ?? '—'} />
        </CardBody>
      </Card>

      {documents.length > 0 ? (
        <Card>
          <CardHeader title="Documents" />
          <CardBody className="flex flex-wrap gap-2">
            {documents.map((d) => (
              <Chip key={d.id} tone="gray">
                {d.doc_type}: {d.status}
              </Chip>
            ))}
          </CardBody>
        </Card>
      ) : null}

      {verifications.length > 0 ? (
        <Card>
          <CardHeader title="Past verification attempts" />
          <CardBody className="space-y-2 text-sm">
            {verifications.map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">{formatDate(v.visit_date)}</span>
                <DecisionBadge decision={(v.decision as never) ?? null} />
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      <Link
        href={`/verifier/artisans/${artisan.id}/verify`}
        data-testid="start-verification"
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-brand-700 active:scale-[0.99] motion-reduce:active:scale-100"
      >
        <ClipboardCheck className="h-5 w-5" />
        Start Verification
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
