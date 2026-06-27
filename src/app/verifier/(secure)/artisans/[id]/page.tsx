import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DecisionBadge } from '@/components/badges';
import FieldArtisanHeader from '@/components/field/FieldArtisanHeader';
import QuickActionBar from '@/components/field/QuickActionBar';
import { FieldInfoCard, FieldRow } from '@/components/field/FieldInfoCard';
import DocumentStatusPills from '@/components/field/DocumentStatusPills';
import {
  CRAFT_CATEGORY,
  CONSENT_STATUS,
  GENDER,
  REGISTRATION_SOURCE,
  type ArtisanStatus,
} from '@/lib/domain';
import { formatDate, formatFieldPhone, ageFromDob } from '@/lib/format';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default async function FieldArtisanPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: artisan } = await supabase
    .from('artisans')
    .select('*, craft_profiles(*), addresses(*), verifications(*), documents(*)')
    .eq('id', params.id)
    .maybeSingle();

  if (!artisan) notFound();

  const craft = (
    artisan.craft_profiles as
      | { craft_category: string | null; experience_years: number | null; group_name: string | null }[]
      | null
  )?.[0];
  const verifications =
    (artisan.verifications as { id: string; visit_date: string; decision: string | null; notes: string | null }[] | null) ??
    [];
  const documents = (artisan.documents as { id: string; doc_type: string; status: string }[] | null) ?? [];

  const location = [artisan.village, artisan.district, artisan.state].filter(Boolean).join(', ');
  const mapsQuery = [artisan.village, artisan.district].filter(Boolean).join(' ');
  const genderAge = [
    artisan.gender ? GENDER[artisan.gender as keyof typeof GENDER] : null,
    ageFromDob(artisan.date_of_birth)?.toString(),
  ]
    .filter(Boolean)
    .join(' · ');

  let duplicateMatchCode: string | null = null;
  if (artisan.duplicate_risk === 'high') {
    const { data: dupe } = await supabase
      .from('duplicate_candidates')
      .select('match:artisans!duplicate_candidates_match_artisan_id_fkey(artisan_code)')
      .eq('artisan_id', params.id)
      .eq('status', 'open')
      .limit(1)
      .maybeSingle();
    duplicateMatchCode = (dupe?.match as { artisan_code: string } | null)?.artisan_code ?? null;
  }

  const sortedVerifications = [...verifications].sort(
    (a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime(),
  );
  const latestVerification = sortedVerifications[0];

  return (
    <div className="-mt-5 space-y-4">
      <FieldArtisanHeader
        name={artisan.full_name}
        code={artisan.artisan_code ?? '—'}
        location={location}
        status={artisan.status as ArtisanStatus}
      />

      <QuickActionBar
        phone={artisan.phone}
        name={artisan.full_name}
        mapsQuery={mapsQuery}
        showFlag={artisan.duplicate_risk === 'high'}
      />

      {artisan.duplicate_risk === 'high' ? (
        <div
          id="duplicate-alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm [text-wrap:pretty]"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <p className="text-red-900">
            Possible duplicate
            {duplicateMatchCode ? (
              <>
                : <strong className="font-semibold text-red-700">{duplicateMatchCode}</strong> shares this phone
                number.
              </>
            ) : (
              ' flagged on this record.'
            )}{' '}
            Confirm before verifying.
          </p>
        </div>
      ) : null}

      <FieldInfoCard title="Basic identity">
        <FieldRow label="Gender · Age" value={genderAge || '—'} />
        <FieldRow label="Tribe" value={artisan.tribe_community ?? '—'} />
        <FieldRow label="Mobile" value={formatFieldPhone(artisan.phone)} />
        <FieldRow
          label="Source"
          value={REGISTRATION_SOURCE[artisan.registration_source].replace('WhatsApp Self-Registration', 'WhatsApp self-reg')}
        />
        <FieldRow label="Consent" value={CONSENT_STATUS[artisan.consent_status]} />
      </FieldInfoCard>

      <FieldInfoCard title="Address">
        <FieldRow label="Village" value={artisan.village ?? '—'} />
        <FieldRow label="Block" value={artisan.block ?? '—'} />
        <FieldRow label="District" value={artisan.district ?? '—'} />
        <FieldRow label="State" value={artisan.state ?? '—'} />
      </FieldInfoCard>

      <FieldInfoCard title="Craft summary">
        <FieldRow
          label="Primary craft"
          value={artisan.primary_craft ? CRAFT_CATEGORY[artisan.primary_craft] : '—'}
        />
        <FieldRow
          label="Experience"
          value={craft?.experience_years ? `${craft.experience_years}+ years` : '—'}
        />
        <FieldRow label="Group" value={craft?.group_name ?? '—'} />
      </FieldInfoCard>

      {artisan.notes ? (
        <FieldInfoCard title="Previous call note">
          <blockquote className="text-sm italic leading-relaxed text-field-ink [text-wrap:pretty]">
            &ldquo;{artisan.notes}&rdquo;
          </blockquote>
          <p className="mt-2 text-xs text-field-muted">— Operator</p>
        </FieldInfoCard>
      ) : latestVerification?.notes ? (
        <FieldInfoCard title="Previous visit note">
          <blockquote className="text-sm italic leading-relaxed text-field-ink [text-wrap:pretty]">
            &ldquo;{latestVerification.notes}&rdquo;
          </blockquote>
          <p className="mt-2 text-xs text-field-muted">— Verifier, {formatDate(latestVerification.visit_date)}</p>
        </FieldInfoCard>
      ) : null}

      <DocumentStatusPills documents={documents} />

      {verifications.length > 1 ? (
        <FieldInfoCard title="Past verification attempts">
          <div className="space-y-2">
            {verifications.map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-field-border/60 pb-2 last:border-0 last:pb-0">
                <span className="text-sm text-field-muted">{formatDate(v.visit_date)}</span>
                <DecisionBadge decision={(v.decision as never) ?? null} />
              </div>
            ))}
          </div>
        </FieldInfoCard>
      ) : null}

      <div className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-10 -mx-4 border-t border-field-border/60 bg-field-bg/95 px-4 py-3 backdrop-blur-md">
        <Link
          href={`/verifier/artisans/${artisan.id}/verify`}
          data-testid="start-verification"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-field-accent px-4 text-base font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-field-accentHover active:scale-[0.99] motion-reduce:active:scale-100"
        >
          Start Verification
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
