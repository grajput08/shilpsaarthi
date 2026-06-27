'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, FormRow, Input, Select, Textarea, Chip } from '@/components/ui';
import { CRAFT_CATEGORY, GENDER, VERIFICATION_DECISION, enumOptions, type CraftCategory, type Gender } from '@/lib/domain';
import { saveDraft, loadDraft, deleteDraft } from '@/lib/field/drafts';
import { submitVerification } from './actions';
import { CheckCircle2, MapPin, Camera } from 'lucide-react';

interface Artisan {
  id: string;
  full_name: string;
  phone: string | null;
  gender: Gender | null;
  tribe_community: string | null;
  state: string | null;
  district: string | null;
  block: string | null;
  village: string | null;
  primary_craft: CraftCategory | null;
}

type ItemStatus = 'pending' | 'verified' | 'corrected' | 'rejected' | 'cancelled' | 'not_applicable';

const ITEMS: { key: string; label: string }[] = [
  { key: 'identity', label: 'Identity' },
  { key: 'contact', label: 'Contact / phone' },
  { key: 'address', label: 'Address & GPS' },
  { key: 'craft', label: 'Craft' },
  { key: 'products', label: 'Products' },
  { key: 'documents', label: 'Documents' },
  { key: 'consent', label: 'Consent' },
];

const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  corrected: 'Corrected',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  not_applicable: 'Not applicable',
};

interface FieldState {
  full_name: string;
  phone: string;
  gender: Gender | '';
  tribe_community: string;
  state: string;
  district: string;
  block: string;
  village: string;
  primary_craft: CraftCategory | '';
}

export default function VerifyFlow({ artisan }: { artisan: Artisan }) {
  const router = useRouter();
  const loaded = useRef(false);
  const cgid = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cgid-${Date.now()}`,
  );

  const [fields, setFields] = useState<FieldState>({
    full_name: artisan.full_name ?? '',
    phone: artisan.phone ?? '',
    gender: artisan.gender ?? '',
    tribe_community: artisan.tribe_community ?? '',
    state: artisan.state ?? '',
    district: artisan.district ?? '',
    block: artisan.block ?? '',
    village: artisan.village ?? '',
    primary_craft: artisan.primary_craft ?? '',
  });
  const [items, setItems] = useState<Record<string, { status: ItemStatus; note: string }>>(
    Object.fromEntries(ITEMS.map((i) => [i.key, { status: 'pending' as ItemStatus, note: '' }])),
  );
  const [consent, setConsent] = useState(false);
  const [consentMode, setConsentMode] = useState('Verifier read aloud');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [acc, setAcc] = useState<number | null>(null);
  const [marketReady, setMarketReady] = useState(false);
  const [decision, setDecision] = useState<'' | keyof typeof VERIFICATION_DECISION>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // restore draft
  useEffect(() => {
    const d = loadDraft(artisan.id);
    if (d?.data) {
      const data = d.data as Record<string, unknown>;
      if (data.fields) setFields(data.fields as FieldState);
      if (data.items) setItems(data.items as Record<string, { status: ItemStatus; note: string }>);
      if (typeof data.consent === 'boolean') setConsent(data.consent);
      if (typeof data.decision === 'string') setDecision(data.decision as keyof typeof VERIFICATION_DECISION);
      if (typeof data.notes === 'string') setNotes(data.notes);
      if (data.clientGeneratedId) cgid.current = data.clientGeneratedId as string;
    }
    loaded.current = true;
  }, [artisan.id]);

  // autosave draft
  useEffect(() => {
    if (!loaded.current) return;
    const now = new Date().toISOString();
    saveDraft({
      artisanId: artisan.id,
      artisanName: fields.full_name,
      clientGeneratedId: cgid.current,
      updatedAt: now,
      status: 'draft',
      data: { fields, items, consent, decision, notes, clientGeneratedId: cgid.current },
    });
    setSavedAt(now);
  }, [fields, items, consent, decision, notes, artisan.id]);

  function setItem(key: string, patch: Partial<{ status: ItemStatus; note: string }>) {
    setItems((m) => ({ ...m, [key]: { ...m[key], ...patch } }));
  }

  function captureGps() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLat(22.9412); setLng(81.0784); setAcc(25); setItem('address', { status: 'verified' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setAcc(Math.round(pos.coords.accuracy));
      },
      () => setError('Could not get GPS. You can proceed and capture again later.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function onPhotos(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 4);
    const urls = await Promise.all(
      list.map(
        (f) =>
          new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.readAsDataURL(f);
          }),
      ),
    );
    setPhotos((p) => [...p, ...urls].slice(0, 8));
  }

  const hasBlocking = Object.values(items).some((i) => i.status === 'rejected' || i.status === 'cancelled');

  function buildPayload() {
    return {
      artisan_id: artisan.id,
      client_generated_id: cgid.current,
      decision: decision as keyof typeof VERIFICATION_DECISION,
      reason: reason || null,
      notes: notes || null,
      latitude: lat,
      longitude: lng,
      gps_accuracy_m: acc,
      consent_captured: consent,
      consent_mode: consentMode,
      market_ready: marketReady,
      fields: {
        full_name: fields.full_name || undefined,
        phone: fields.phone || undefined,
        gender: (fields.gender || undefined) as Gender | undefined,
        tribe_community: fields.tribe_community || undefined,
        state: fields.state || undefined,
        district: fields.district || undefined,
        block: fields.block || undefined,
        village: fields.village || undefined,
        primary_craft: (fields.primary_craft || undefined) as CraftCategory | undefined,
      },
      items: ITEMS.map((it) => ({
        item_key: it.key,
        item_label: it.label,
        status: items[it.key].status,
        note: items[it.key].note || null,
      })),
      photo_paths: photos,
    };
  }

  async function submit() {
    setError(null);
    if (!decision) {
      setError('Please choose a final status.');
      return;
    }
    if (decision === 'verified' && hasBlocking) {
      setError('Some items are rejected/cancelled — Fully Verified requires an admin override. Choose Needs Correction, or ask an admin to override.');
      return;
    }
    setSubmitting(true);
    const payload = buildPayload();
    // mark draft pending while syncing
    saveDraft({
      artisanId: artisan.id,
      artisanName: fields.full_name,
      clientGeneratedId: cgid.current,
      updatedAt: new Date().toISOString(),
      status: 'pending',
      data: payload as unknown as Record<string, unknown>,
    });
    try {
      const res = await submitVerification(payload);
      if (!res.ok) {
        saveDraft({
          artisanId: artisan.id,
          artisanName: fields.full_name,
          clientGeneratedId: cgid.current,
          updatedAt: new Date().toISOString(),
          status: 'failed',
          data: payload as unknown as Record<string, unknown>,
        });
        setError(res.error ?? 'Submit failed. Saved to sync queue.');
        setSubmitting(false);
        return;
      }
      deleteDraft(artisan.id);
      setDone(true);
    } catch {
      setError('Network error. Saved to the sync queue — retry from the Sync tab.');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div data-testid="verify-success" className="flex flex-col items-center pt-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Verification submitted</h1>
        <p className="mt-2 text-slate-600">
          Final status: <strong>{VERIFICATION_DECISION[decision as keyof typeof VERIFICATION_DECISION]?.label}</strong>.
        </p>
        <Button className="mt-6" onClick={() => router.push('/verifier')}>Back to Today&apos;s Work</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <Link href={`/verifier/artisans/${artisan.id}`} className="text-sm text-brand-600 hover:underline">
          ← Back to profile
        </Link>
        <h1 className="mt-1 text-lg font-bold text-slate-900">Verify &amp; correct</h1>
        {savedAt ? <p className="text-xs text-emerald-600" data-testid="draft-saved">Draft saved on device</p> : null}
      </header>

      {/* Editable fields */}
      <Card>
        <CardHeader title="Artisan details (edit to correct)" />
        <CardBody className="grid grid-cols-2 gap-3">
          <FormRow label="Full name" htmlFor="f-name" className="col-span-2">
            <Input id="f-name" data-testid="edit-full_name" value={fields.full_name} onChange={(e) => setFields((f) => ({ ...f, full_name: e.target.value }))} />
          </FormRow>
          <FormRow label="Phone" htmlFor="f-phone">
            <Input id="f-phone" data-testid="edit-phone" inputMode="numeric" maxLength={10} value={fields.phone} onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} />
          </FormRow>
          <FormRow label="Gender" htmlFor="f-gender">
            <Select id="f-gender" value={fields.gender} onChange={(e) => setFields((f) => ({ ...f, gender: e.target.value as Gender }))}>
              <option value="">—</option>
              {enumOptions(GENDER).map((g) => <option key={g} value={g}>{GENDER[g]}</option>)}
            </Select>
          </FormRow>
          <FormRow label="Tribe / community" htmlFor="f-tribe" className="col-span-2">
            <Input id="f-tribe" value={fields.tribe_community} onChange={(e) => setFields((f) => ({ ...f, tribe_community: e.target.value }))} />
          </FormRow>
          <FormRow label="State" htmlFor="f-state"><Input id="f-state" value={fields.state} onChange={(e) => setFields((f) => ({ ...f, state: e.target.value }))} /></FormRow>
          <FormRow label="District" htmlFor="f-district"><Input id="f-district" value={fields.district} onChange={(e) => setFields((f) => ({ ...f, district: e.target.value }))} /></FormRow>
          <FormRow label="Block" htmlFor="f-block"><Input id="f-block" value={fields.block} onChange={(e) => setFields((f) => ({ ...f, block: e.target.value }))} /></FormRow>
          <FormRow label="Village" htmlFor="f-village"><Input id="f-village" value={fields.village} onChange={(e) => setFields((f) => ({ ...f, village: e.target.value }))} /></FormRow>
          <FormRow label="Craft" htmlFor="f-craft" className="col-span-2">
            <Select id="f-craft" value={fields.primary_craft} onChange={(e) => setFields((f) => ({ ...f, primary_craft: e.target.value as CraftCategory }))}>
              <option value="">—</option>
              {enumOptions(CRAFT_CATEGORY).map((c) => <option key={c} value={c}>{CRAFT_CATEGORY[c]}</option>)}
            </Select>
          </FormRow>
        </CardBody>
      </Card>

      {/* GPS + consent */}
      <Card>
        <CardHeader title="Consent & location" />
        <CardBody className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" data-testid="verify-consent" className="mt-0.5 h-5 w-5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>Artisan understood and gave consent</span>
          </label>
          <FormRow label="Consent mode" htmlFor="cmode">
            <Select id="cmode" value={consentMode} onChange={(e) => setConsentMode(e.target.value)}>
              <option>Artisan read themselves</option>
              <option>Verifier read aloud</option>
              <option>Local language explanation given</option>
            </Select>
          </FormRow>
          <Button type="button" variant="secondary" onClick={captureGps} data-testid="capture-gps">
            <MapPin className="h-4 w-4" /> Capture GPS
          </Button>
          {lat != null ? <p className="text-sm text-slate-600" data-testid="gps-coords">📍 {lat}, {lng} (±{acc}m)</p> : <p className="text-sm text-slate-400">No GPS captured.</p>}
        </CardBody>
      </Card>

      {/* Per-item statuses */}
      <Card>
        <CardHeader title="Field / section verification" subtitle="Mark each as verified, corrected, rejected, cancelled or N/A." />
        <CardBody className="space-y-3">
          {ITEMS.map((it) => (
            <div key={it.key} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">{it.label}</span>
                <Select
                  data-testid={`item-${it.key}`}
                  value={items[it.key].status}
                  onChange={(e) => setItem(it.key, { status: e.target.value as ItemStatus })}
                  className="w-40"
                >
                  {(Object.keys(ITEM_STATUS_LABEL) as ItemStatus[]).map((s) => (
                    <option key={s} value={s}>{ITEM_STATUS_LABEL[s]}</option>
                  ))}
                </Select>
              </div>
              <Input
                placeholder="Note / evidence (optional)"
                data-testid={`note-${it.key}`}
                value={items[it.key].note}
                onChange={(e) => setItem(it.key, { note: e.target.value })}
                className="mt-2 text-sm"
              />
            </div>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600">
            <Camera className="h-4 w-4" /> Attach evidence photos
            <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => onPhotos(e.target.files)} />
          </label>
          {photos.length > 0 ? <Chip tone="green">{photos.length} photo(s) attached</Chip> : null}
        </CardBody>
      </Card>

      {/* Final decision */}
      <Card>
        <CardHeader title="Final status" />
        <CardBody className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-testid="verify-market-ready" className="h-5 w-5" checked={marketReady} onChange={(e) => setMarketReady(e.target.checked)} />
            Market readiness assessed
          </label>
          {hasBlocking ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800" data-testid="blocking-warning">
              Some items are rejected/cancelled — “Fully Verified” needs an admin override.
            </p>
          ) : null}
          <FormRow label="Decision" htmlFor="decision" required>
            <Select id="decision" data-testid="verify-decision" value={decision} onChange={(e) => setDecision(e.target.value as typeof decision)}>
              <option value="">Select…</option>
              {enumOptions(VERIFICATION_DECISION).map((d) => (
                <option key={d} value={d}>{VERIFICATION_DECISION[d].label}</option>
              ))}
            </Select>
          </FormRow>
          {decision && decision !== 'verified' ? (
            <FormRow label="Reason" htmlFor="reason">
              <Input id="reason" data-testid="verify-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </FormRow>
          ) : null}
          <FormRow label="Verifier notes" htmlFor="notes">
            <Textarea id="notes" data-testid="verify-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormRow>
          {error ? <p data-testid="verify-error" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <Button block type="button" data-testid="verify-submit" disabled={submitting} onClick={submit}>
            {submitting ? 'Submitting…' : 'Submit verification'}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
