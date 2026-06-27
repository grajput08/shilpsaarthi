'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ClipboardList,
  Download,
  FileText,
  Languages,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Chip, ProgressBar } from '@/components/ui';
import { ArtisanStatusBadge, DecisionBadge, DocStatusBadge, PriorityBadge } from '@/components/badges';
import ArtisanActions from '@/components/admin/ArtisanActions';
// import VerificationItems, { type VItem } from '@/components/admin/VerificationItems';
import { type VItem } from '@/components/admin/VerificationItems';
// import WhatsAppTimeline, { type TimelineMessage } from '@/components/admin/WhatsAppTimeline';
import { type TimelineMessage } from '@/components/admin/WhatsAppTimeline';
import { composeProfileStory } from '@/lib/artisan-profile';
import {
  CONSENT_STATUS,
  CRAFT_CATEGORY,
  DOCUMENT_TYPE,
  GENDER,
  LANGUAGE_LABEL,
  REGISTRATION_SOURCE,
  onboardingChannelLabel,
  type ConsentStatus,
  type CraftCategory,
  type DocStatus,
  type DocumentType,
  type RegistrationSource,
  type VerificationDecision,
} from '@/lib/domain';
import { ageFromDob, formatDate, formatDateTime, initials, maskPhone } from '@/lib/format';

type TabId = 'profile' | 'products' | 'workspace' | 'documents' | 'verification';

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: BookOpen },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'workspace', label: 'Workspace', icon: Wrench },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
];

export interface ArtisanDetailData {
  artisan: {
    id: string;
    artisan_code: string | null;
    full_name: string;
    phone: string | null;
    alternate_phone: string | null;
    gender: string | null;
    date_of_birth: string | null;
    tribe_community: string | null;
    primary_craft: string | null;
    status: string;
    registration_source: RegistrationSource;
    consent_status: ConsentStatus;
    preferred_language: string;
    state: string | null;
    district: string | null;
    block: string | null;
    village: string | null;
    priority: string;
    data_completeness: number;
    duplicate_risk: string;
    notes: string | null;
    created_at: string;
  };
  craft: {
    craft_category: string | null;
    sub_category: string | null;
    experience_years: number | null;
    monthly_capacity: number | null;
    group_name: string | null;
    training_needs: string | null;
  } | null;
  address: {
    latitude: number | null;
    longitude: number | null;
    gps_captured_at: string | null;
    address_line: string | null;
    landmark: string | null;
    pin_code: string | null;
  } | null;
  products: {
    id: string;
    name: string;
    description: string | null;
    materials: string | null;
    price_min: number | null;
    price_max: number | null;
    photoUrls: string[];
  }[];
  documents: {
    id: string;
    doc_type: string;
    status: string;
    reference_masked: string | null;
  }[];
  verifications: {
    id: string;
    visit_date: string;
    decision: string | null;
    admin_override: boolean | null;
    notes: string | null;
    reason: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    verifierName: string | null;
    photoUrls: string[];
  }[];
  messages: TimelineMessage[];
  avatarUrl: string | null;
  idVerified: boolean;
  latestVerification: {
    id: string;
    admin_override: boolean;
    decision: string | null;
    items: VItem[];
  } | null;
  verifiers: { id: string; full_name: string }[];
  templates: { template_key: string; name: string }[];
  canAssign: boolean;
  canOverride: boolean;
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function ArtisanDetailView({ data }: { data: ArtisanDetailData }) {
  const [tab, setTab] = useState<TabId>('profile');
  const { artisan, craft, address, products, documents, verifications } = data;

  const craftLabel = artisan.primary_craft
    ? CRAFT_CATEGORY[artisan.primary_craft as CraftCategory]
    : craft?.craft_category
      ? CRAFT_CATEGORY[craft.craft_category as CraftCategory]
      : null;
  const locationLine = [artisan.village, artisan.district, artisan.state].filter(Boolean).join(', ');
  const locationShort = [artisan.village ?? artisan.district, artisan.state].filter(Boolean).join(', ');
  const languageLabel = LANGUAGE_LABEL[artisan.preferred_language] ?? artisan.preferred_language;
  const channelLabel = onboardingChannelLabel(artisan.registration_source);
  const consentGranted = artisan.consent_status === 'granted';

  const story = composeProfileStory({
    fullName: artisan.full_name,
    craft: craftLabel,
    tribe: artisan.tribe_community,
    location: locationLine,
    experienceYears: craft?.experience_years ?? null,
    groupName: craft?.group_name ?? null,
    trainingNeeds: craft?.training_needs ?? null,
    notes: artisan.notes,
  });

  function exportProfile() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artisan.artisan_code ?? artisan.id}-profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/registry"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to registry
      </Link>

      {artisan.duplicate_risk === 'high' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Possible duplicate flagged — review identity carefully before verification decisions.
        </div>
      ) : null}

      {/* Hero header */}
      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              {data.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.avatarUrl}
                  alt={artisan.full_name}
                  className="h-20 w-20 shrink-0 rounded-full border-2 border-white object-cover shadow-md ring-2 ring-slate-100"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-400 text-2xl font-bold text-white shadow-md">
                  {initials(artisan.full_name)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
                    {artisan.full_name}
                  </h1>
                  <ArtisanStatusBadge status={artisan.status as never} />
                </div>
                {artisan.artisan_code ? (
                  <p className="mt-1.5 inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
                    Adi Setu ID {artisan.artisan_code}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-slate-600">
                  {[craftLabel, artisan.tribe_community, locationLine].filter(Boolean).join(' · ')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.idVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      ID verified
                    </span>
                  ) : null}
                  {consentGranted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Consent recorded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                      Consent: {CONSENT_STATUS[artisan.consent_status]}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
                    Channel: {channelLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
                    Onboarded: {formatDate(artisan.created_at)}
                  </span>
                  <PriorityBadge priority={artisan.priority as never} />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
              <button
                type="button"
                onClick={exportProfile}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-600 bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <div className="w-full min-w-[10rem] sm:w-44">
                <p className="text-xs font-medium text-slate-500">Data completeness</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <ProgressBar value={artisan.data_completeness} meter className="flex-1" />
                  <span className="text-sm font-bold text-slate-700">{artisan.data_completeness}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick info grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoTile icon={MapPin} label="Location" value={locationShort || '—'} />
        <InfoTile icon={Phone} label="Phone" value={maskPhone(artisan.phone)} />
        <InfoTile icon={Languages} label="Language" value={languageLabel} />
        <InfoTile icon={ClipboardList} label="Source" value={REGISTRATION_SOURCE[artisan.registration_source]} />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Artisan sections">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {id === 'products' && products.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {products.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {tab === 'profile' ? (
            <>
              <Card>
                <CardBody>
                  <div className="flex items-start gap-3">
                    {data.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.avatarUrl}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                        {initials(artisan.full_name)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-brand-900">The story of {artisan.full_name.split(' ')[0]}</h2>
                      <Chip tone="brand" className="mt-1">
                        Compiled from profile data
                      </Chip>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700 [text-wrap:pretty]">{story}</p>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    {artisan.artisan_code ? `Adi Setu ID: ${artisan.artisan_code}` : 'Adi Setu registry'}
                    {craftLabel ? ` · ${craftLabel}` : ''}
                    {artisan.tribe_community ? ` · ${artisan.tribe_community} community` : ''}
                    {locationLine ? ` · ${locationLine}` : ''}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Identity & contact" />
                <CardBody className="grid gap-2 sm:grid-cols-2">
                  <DetailRow label="Phone" value={maskPhone(artisan.phone)} />
                  <DetailRow label="Alternate phone" value={maskPhone(artisan.alternate_phone)} />
                  <DetailRow label="Gender" value={artisan.gender ? GENDER[artisan.gender as keyof typeof GENDER] : '—'} />
                  <DetailRow label="Age" value={ageFromDob(artisan.date_of_birth)?.toString() ?? '—'} />
                  <DetailRow label="Tribe / community" value={artisan.tribe_community ?? '—'} />
                  <DetailRow label="Consent" value={CONSENT_STATUS[artisan.consent_status]} />
                  <DetailRow label="Registration source" value={REGISTRATION_SOURCE[artisan.registration_source]} />
                  <DetailRow label="Preferred language" value={languageLabel} />
                </CardBody>
              </Card>
            </>
          ) : null}

          {tab === 'products' ? (
            <Card>
              <CardHeader title={`Product catalogue (${products.length})`} />
              <CardBody>
                {products.length === 0 ? (
                  <p className="text-sm text-slate-400">No products captured yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
                        {p.photoUrls[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photoUrls[0]} alt={p.name} className="h-36 w-full object-cover" />
                        ) : (
                          <div className="flex h-36 items-center justify-center bg-slate-100 text-slate-400">
                            <Package className="h-10 w-10" />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          {p.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.description}</p>
                          ) : null}
                          <p className="mt-2 text-sm font-medium text-brand-600">
                            {p.price_min != null
                              ? `₹${p.price_min}${p.price_max ? ` – ₹${p.price_max}` : ''}`
                              : 'Price not set'}
                          </p>
                          {p.materials ? (
                            <p className="mt-1 text-xs text-slate-500">Materials: {p.materials}</p>
                          ) : null}
                          {p.photoUrls.length > 1 ? (
                            <div className="mt-3 flex gap-1.5">
                              {p.photoUrls.slice(1, 4).map((url) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={url} src={url} alt="" className="h-10 w-10 rounded object-cover ring-1 ring-slate-200" />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ) : null}

          {tab === 'workspace' ? (
            <>
              <Card>
                <CardHeader title="Craft profile" subtitle="Skills, capacity and group affiliation" />
                <CardBody className="grid gap-2 sm:grid-cols-2">
                  <DetailRow
                    label="Category"
                    value={
                      craft?.craft_category
                        ? CRAFT_CATEGORY[craft.craft_category as CraftCategory]
                        : craftLabel ?? '—'
                    }
                  />
                  <DetailRow label="Sub-category" value={craft?.sub_category ?? '—'} />
                  <DetailRow
                    label="Experience"
                    value={craft?.experience_years != null ? `${craft.experience_years} years` : '—'}
                  />
                  <DetailRow label="Capacity / month" value={craft?.monthly_capacity?.toString() ?? '—'} />
                  <DetailRow label="Group / SHG" value={craft?.group_name ?? '—'} />
                  <DetailRow label="Training needs" value={craft?.training_needs ?? '—'} />
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Address & GPS" subtitle="Registered and verified location" />
                <CardBody className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <DetailRow label="Village" value={artisan.village ?? '—'} />
                    <DetailRow label="Block" value={artisan.block ?? '—'} />
                    <DetailRow label="District" value={artisan.district ?? '—'} />
                    <DetailRow label="State" value={artisan.state ?? '—'} />
                    <DetailRow label="Pin code" value={address?.pin_code ?? '—'} />
                    <DetailRow label="Landmark" value={address?.landmark ?? '—'} />
                    {address?.address_line ? <DetailRow label="Address line" value={address.address_line} /> : null}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">GPS coordinates</p>
                    {address?.latitude != null ? (
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-mono text-sm font-medium text-slate-800">
                          {address.latitude}, {address.longitude}
                        </p>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${address.latitude}&mlon=${address.longitude}#map=15/${address.latitude}/${address.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          View on map →
                        </a>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">Not captured</p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      Captured: {formatDateTime(address?.gps_captured_at)}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </>
          ) : null}

          {tab === 'documents' ? (
            <Card>
              <CardHeader title="Document checklist" />
              <CardBody className="p-0">
                {documents.length === 0 ? (
                  <p className="px-5 py-5 text-sm text-slate-400">No documents checked yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {documents.map((d) => (
                      <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {DOCUMENT_TYPE[d.doc_type as DocumentType]}
                          </p>
                          {d.reference_masked ? (
                            <p className="mt-0.5 font-mono text-xs text-slate-500">{d.reference_masked}</p>
                          ) : null}
                        </div>
                        <DocStatusBadge status={d.status as DocStatus} />
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ) : null}

          {tab === 'verification' ? (
            <Card data-testid="verification-history">
              <CardHeader title="Verification history" />
              <CardBody className="space-y-4">
                {verifications.length === 0 ? (
                  <p className="text-sm text-slate-400">No verification attempts yet.</p>
                ) : (
                  verifications.map((v) => (
                    <div key={v.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800">{v.verifierName ?? 'Unknown verifier'}</p>
                        <div className="flex items-center gap-2">
                          {v.admin_override ? <Chip tone="purple">Admin override</Chip> : null}
                          <DecisionBadge decision={(v.decision as VerificationDecision) ?? null} />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(v.visit_date)}
                        {v.latitude != null ? ` · ${v.latitude}, ${v.longitude}` : ''}
                        {v.reason ? ` · ${v.reason}` : ''}
                      </p>
                      {v.notes ? <p className="mt-2 text-sm text-slate-600 [text-wrap:pretty]">{v.notes}</p> : null}
                      {v.photoUrls.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {v.photoUrls.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={url} src={url} alt="Visit photo" className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <ArtisanActions
            artisanId={artisan.id}
            verifiers={data.verifiers}
            templates={data.templates}
            canAssign={data.canAssign}
          />

          {/* {data.latestVerification ? (
            <VerificationItems
              artisanId={artisan.id}
              verificationId={data.latestVerification.id}
              adminOverride={data.latestVerification.admin_override}
              decision={data.latestVerification.decision}
              items={data.latestVerification.items}
              canOverride={data.canOverride}
            />
          ) : null}

          <WhatsAppTimeline messages={messages} /> */}
        </div>
      </div>
    </div>
  );
}
