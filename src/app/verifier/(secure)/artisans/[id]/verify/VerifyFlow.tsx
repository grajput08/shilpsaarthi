'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, FormRow, Input, Select, Textarea, Chip } from '@/components/ui';
import { CRAFT_CATEGORY, GENDER, VERIFICATION_DECISION, enumOptions, type CraftCategory, type Gender } from '@/lib/domain';
import { saveDraft, loadDraft, deleteDraft } from '@/lib/field/drafts';
import { submitVerification } from './actions';
import {
  validateAll,
  reasonRequired,
  type VerifyErrors,
  type VerifyFieldKey,
  type VerifyValues,
} from './validators';
import { ArrowLeft, CheckCircle2, MapPin, Camera } from 'lucide-react';

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

type FocusEl = HTMLInputElement | HTMLSelectElement;

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

  // Inline field validation state.
  const [errors, setErrors] = useState<VerifyErrors>({});
  const [touched, setTouched] = useState<Set<VerifyFieldKey>>(new Set());
  const [shaking, setShaking] = useState<Set<VerifyFieldKey>>(new Set());
  const fieldRefs = useRef<Partial<Record<VerifyFieldKey, FocusEl>>>({});
  const setRef = (field: VerifyFieldKey) => (el: FocusEl | null) => {
    if (el) fieldRefs.current[field] = el;
  };

  const values: VerifyValues = { full_name: fields.full_name, phone: fields.phone, decision, reason };

  // Keep inline errors for already-touched fields in sync as values change.
  useEffect(() => {
    if (touched.size === 0) {
      setErrors((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }
    const current: VerifyValues = { full_name: fields.full_name, phone: fields.phone, decision, reason };
    const { errors: all } = validateAll(current);
    setErrors(() => {
      const next: VerifyErrors = {};
      touched.forEach((f) => {
        if (all[f]) next[f] = all[f];
      });
      return next;
    });
  }, [fields.full_name, fields.phone, decision, reason, touched]);

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

  function markTouched(field: VerifyFieldKey) {
    setTouched((t) => (t.has(field) ? t : new Set(t).add(field)));
  }

  // setTimeout (not rAF) so the shake still fires when the tab is backgrounded.
  function triggerShake(keys: VerifyFieldKey[]) {
    setShaking(new Set());
    setTimeout(() => setShaking(new Set(keys)), 0);
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

    // 1) Field-level validation first — block, shake, and focus the first error.
    const { errors: fieldErrors, firstInvalid } = validateAll(values);
    if (firstInvalid) {
      setTouched((t) => {
        const n = new Set(t);
        (Object.keys(fieldErrors) as VerifyFieldKey[]).forEach((f) => n.add(f));
        return n;
      });
      setErrors(fieldErrors);
      triggerShake(Object.keys(fieldErrors) as VerifyFieldKey[]);
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    // 2) Cross-field business rule: Fully Verified needs a clean item list.
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

  const nameValid = touched.has('full_name') && !errors.full_name && fields.full_name.trim().length > 0;
  const phoneValid = touched.has('phone') && !errors.phone && fields.phone.trim().length > 0;
  const needsReason = reasonRequired(decision);

  if (done) {
    return (
      <div data-testid="verify-success" className="flex flex-col items-center pt-12 text-center">
        <span className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </span>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
          Verification submitted
        </h1>
        <p className="mt-2 text-slate-600 [text-wrap:pretty]">
          Final status:{' '}
          <strong className="font-semibold text-slate-800">
            {VERIFICATION_DECISION[decision as keyof typeof VERIFICATION_DECISION]?.label}
          </strong>
          .
        </p>
        <Button className="mt-6" onClick={() => router.push('/verifier')}>
          Back to Today&apos;s Work
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <Link
          href={`/verifier/artisans/${artisan.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
        <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Verify &amp; correct</h1>
        {savedAt ? (
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-600" data-testid="draft-saved">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Draft saved on device
          </p>
        ) : null}
      </header>

      {/* Editable fields */}
      <Card>
        <CardHeader title="Artisan details" subtitle="Edit any field to record a correction." />
        <CardBody className="grid grid-cols-2 gap-3">
          <FormRow
            label="Full name"
            htmlFor="f-name"
            className="col-span-2"
            error={errors.full_name}
            valid={nameValid}
            shake={shaking.has('full_name')}
            errorId="err-f-name"
          >
            <Input
              id="f-name"
              ref={setRef('full_name')}
              data-testid="edit-full_name"
              aria-describedby={errors.full_name ? 'err-f-name' : undefined}
              invalid={!!errors.full_name}
              valid={nameValid}
              value={fields.full_name}
              onChange={(e) => setFields((f) => ({ ...f, full_name: e.target.value }))}
              onBlur={() => markTouched('full_name')}
            />
          </FormRow>
          <FormRow
            label="Phone"
            htmlFor="f-phone"
            error={errors.phone}
            valid={phoneValid}
            shake={shaking.has('phone')}
            errorId="err-f-phone"
          >
            <Input
              id="f-phone"
              ref={setRef('phone')}
              data-testid="edit-phone"
              inputMode="numeric"
              maxLength={10}
              aria-describedby={errors.phone ? 'err-f-phone' : undefined}
              invalid={!!errors.phone}
              valid={phoneValid}
              value={fields.phone}
              onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
              onBlur={() => markTouched('phone')}
            />
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
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-50">
            <input type="checkbox" data-testid="verify-consent" className="mt-0.5 h-5 w-5 cursor-pointer rounded accent-brand-600" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
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
          {lat != null ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600" data-testid="gps-coords">
              <MapPin className="h-4 w-4 text-india-600" /> {lat}, {lng} <span className="text-slate-400">(±{acc}m)</span>
            </p>
          ) : (
            <p className="text-sm text-slate-400">No GPS captured.</p>
          )}
        </CardBody>
      </Card>

      {/* Per-item statuses */}
      <Card>
        <CardHeader title="Field / section verification" subtitle="Mark each as verified, corrected, rejected, cancelled or N/A." />
        <CardBody className="space-y-3">
          {ITEMS.map((it) => (
            <div
              key={it.key}
              className="rounded-xl border border-slate-200 p-3 transition-colors focus-within:border-brand-300"
            >
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
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-testid="verify-market-ready" className="h-5 w-5 cursor-pointer rounded accent-brand-600" checked={marketReady} onChange={(e) => setMarketReady(e.target.checked)} />
            Market readiness assessed
          </label>
          {hasBlocking ? (
            <p className="animate-step-enter rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800" data-testid="blocking-warning">
              Some items are rejected/cancelled — “Fully Verified” needs an admin override.
            </p>
          ) : null}
          <FormRow
            label="Decision"
            htmlFor="decision"
            required
            error={errors.decision}
            shake={shaking.has('decision')}
            errorId="err-decision"
          >
            <Select
              id="decision"
              ref={setRef('decision')}
              data-testid="verify-decision"
              aria-describedby={errors.decision ? 'err-decision' : undefined}
              invalid={!!errors.decision}
              value={decision}
              onChange={(e) => setDecision(e.target.value as typeof decision)}
              onBlur={() => markTouched('decision')}
            >
              <option value="">Select…</option>
              {enumOptions(VERIFICATION_DECISION).map((d) => (
                <option key={d} value={d}>{VERIFICATION_DECISION[d].label}</option>
              ))}
            </Select>
          </FormRow>
          {decision && decision !== 'verified' ? (
            <FormRow
              label="Reason"
              htmlFor="reason"
              required={needsReason}
              error={errors.reason}
              shake={shaking.has('reason')}
              errorId="err-reason"
            >
              <Input
                id="reason"
                ref={setRef('reason')}
                data-testid="verify-reason"
                aria-describedby={errors.reason ? 'err-reason' : undefined}
                invalid={!!errors.reason}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => markTouched('reason')}
              />
            </FormRow>
          ) : null}
          <FormRow label="Verifier notes" htmlFor="notes">
            <Textarea id="notes" data-testid="verify-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormRow>
          {error ? (
            <p data-testid="verify-error" role="alert" className="animate-step-enter rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          <Button block type="button" data-testid="verify-submit" loading={submitting} onClick={submit}>
            {submitting ? 'Submitting…' : 'Submit verification'}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
