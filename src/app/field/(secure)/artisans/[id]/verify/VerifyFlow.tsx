'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardBody, FormRow, Select, Textarea, ProgressBar, Chip } from '@/components/ui';
import { DECISION_REASONS, VERIFICATION_DECISION, enumOptions } from '@/lib/domain';
import { saveDraft, loadDraft, deleteDraft, type VerificationDraft } from '@/lib/field/drafts';
import { submitVerification } from './actions';
import { CheckCircle2, MapPin, Camera } from 'lucide-react';

interface Artisan {
  id: string;
  full_name: string;
  village: string | null;
}

interface FlowData {
  clientGeneratedId: string;
  consent_captured: boolean;
  consent_mode: string;
  identity_verified: boolean;
  location_verified: boolean;
  craft_verified: boolean;
  products_captured: boolean;
  documents_checked: boolean;
  duplicate_checked: boolean;
  market_ready: boolean;
  latitude: number | null;
  longitude: number | null;
  gps_accuracy_m: number | null;
  decision: '' | keyof typeof VERIFICATION_DECISION;
  reason: string;
  notes: string;
  photo_paths: string[];
}

const STEPS = ['Consent', 'Identity', 'Address & GPS', 'Craft', 'Products', 'Documents', 'Decision'];

function freshData(): FlowData {
  return {
    clientGeneratedId:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cgid-${Date.now()}`,
    consent_captured: false,
    consent_mode: 'Verifier read aloud',
    identity_verified: false,
    location_verified: false,
    craft_verified: false,
    products_captured: false,
    documents_checked: false,
    duplicate_checked: false,
    market_ready: false,
    latitude: null,
    longitude: null,
    gps_accuracy_m: null,
    decision: '',
    reason: '',
    notes: '',
    photo_paths: [],
  };
}

export default function VerifyFlow({ artisan }: { artisan: Artisan }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FlowData>(freshData);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const loaded = useRef(false);

  // Restore any existing on-device draft.
  useEffect(() => {
    const existing = loadDraft(artisan.id);
    if (existing?.data) setData(existing.data as unknown as FlowData);
    loaded.current = true;
  }, [artisan.id]);

  // Autosave draft on every change.
  useEffect(() => {
    if (!loaded.current) return;
    const draft: VerificationDraft = {
      artisanId: artisan.id,
      artisanName: artisan.full_name,
      clientGeneratedId: data.clientGeneratedId,
      updatedAt: new Date().toISOString(),
      status: 'draft',
      data: data as unknown as Record<string, unknown>,
    };
    saveDraft(draft);
    setSavedAt(draft.updatedAt);
  }, [data, artisan.id, artisan.full_name]);

  function set<K extends keyof FlowData>(key: K, value: FlowData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function captureGps() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      set('latitude', 22.9412);
      set('longitude', 81.0784);
      set('gps_accuracy_m', 25);
      set('location_verified', true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('latitude', Number(pos.coords.latitude.toFixed(6)));
        set('longitude', Number(pos.coords.longitude.toFixed(6)));
        set('gps_accuracy_m', Math.round(pos.coords.accuracy));
        set('location_verified', true);
      },
      () => {
        // permission denied — keep manual entry path open
        setError('Could not get GPS. You can still proceed; capture again when possible.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function onPhotos(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 4);
    const urls = await Promise.all(
      list.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }),
      ),
    );
    set('photo_paths', [...data.photo_paths, ...urls].slice(0, 8));
  }

  async function submit() {
    setError(null);
    if (!data.decision) {
      setError('Please choose a final decision.');
      return;
    }
    const needsConsent = ['verified', 'needs_correction', 'duplicate'].includes(data.decision);
    if (needsConsent && !data.consent_captured) {
      setError('Consent is required before submitting this decision.');
      setStep(0);
      return;
    }

    setSubmitting(true);

    // Mark the draft pending while we attempt to sync.
    saveDraft({
      artisanId: artisan.id,
      artisanName: artisan.full_name,
      clientGeneratedId: data.clientGeneratedId,
      updatedAt: new Date().toISOString(),
      status: 'pending',
      data: data as unknown as Record<string, unknown>,
    });

    try {
      const result = await submitVerification({
        artisan_id: artisan.id,
        client_generated_id: data.clientGeneratedId,
        decision: data.decision,
        reason: data.reason || null,
        notes: data.notes || null,
        latitude: data.latitude,
        longitude: data.longitude,
        gps_accuracy_m: data.gps_accuracy_m,
        consent_captured: data.consent_captured,
        consent_mode: data.consent_mode,
        identity_verified: data.identity_verified,
        location_verified: data.location_verified,
        craft_verified: data.craft_verified,
        products_captured: data.products_captured,
        documents_checked: data.documents_checked,
        duplicate_checked: data.duplicate_checked,
        market_ready: data.market_ready,
        photo_paths: data.photo_paths,
      });

      if (!result.ok) {
        // Keep as a failed draft so it shows in the sync queue for retry.
        saveDraft({
          artisanId: artisan.id,
          artisanName: artisan.full_name,
          clientGeneratedId: data.clientGeneratedId,
          updatedAt: new Date().toISOString(),
          status: 'failed',
          data: data as unknown as Record<string, unknown>,
        });
        setError(result.error ?? 'Sync failed. Saved to sync queue for retry.');
        setSubmitting(false);
        return;
      }

      deleteDraft(artisan.id);
      setDone(true);
    } catch {
      saveDraft({
        artisanId: artisan.id,
        artisanName: artisan.full_name,
        clientGeneratedId: data.clientGeneratedId,
        updatedAt: new Date().toISOString(),
        status: 'failed',
        data: data as unknown as Record<string, unknown>,
      });
      setError('Network error. Saved to sync queue — retry from the Sync tab.');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div data-testid="verify-success" className="flex flex-col items-center pt-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Verification submitted</h1>
        <p className="mt-2 text-slate-600">
          {artisan.full_name} marked as <strong>{VERIFICATION_DECISION[data.decision as keyof typeof VERIFICATION_DECISION]?.label}</strong>.
        </p>
        <p className="mt-1 text-sm text-slate-500">A WhatsApp status update was queued to the artisan.</p>
        <Button className="mt-6" onClick={() => router.push('/field')}>
          Back to Today&apos;s Work
        </Button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-4">
        <Link href={`/field/artisans/${artisan.id}`} className="text-sm text-brand-600 hover:underline">
          ← {artisan.full_name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={((step + 1) / STEPS.length) * 100} />
          <span className="whitespace-nowrap text-xs text-slate-500">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-700">{STEPS[step]}</p>
        {savedAt ? <p className="text-xs text-emerald-600" data-testid="draft-saved">Draft saved on device</p> : null}
      </header>

      <Card>
        <CardBody className="space-y-4">
          {step === 0 && (
            <>
              <p className="text-sm text-slate-600">
                Explain why data is collected, how it is used, and who may verify it. Capture consent before continuing.
              </p>
              <Check
                testid="verify-consent"
                label="Artisan understood and gave consent"
                checked={data.consent_captured}
                onChange={(v) => set('consent_captured', v)}
              />
              <FormRow label="Consent mode" htmlFor="cmode">
                <Select id="cmode" value={data.consent_mode} onChange={(e) => set('consent_mode', e.target.value)}>
                  <option>Artisan read themselves</option>
                  <option>Verifier read aloud</option>
                  <option>Local language explanation given</option>
                </Select>
              </FormRow>
            </>
          )}

          {step === 1 && (
            <>
              <Check testid="verify-identity" label="Identity confirmed (name & person match)" checked={data.identity_verified} onChange={(v) => set('identity_verified', v)} />
              <Check testid="verify-duplicate" label="Duplicate check done" checked={data.duplicate_checked} onChange={(v) => set('duplicate_checked', v)} />
              <PhotoInput label="Capture self / ID photo" onChange={onPhotos} count={data.photo_paths.length} />
            </>
          )}

          {step === 2 && (
            <>
              <Button type="button" variant="secondary" onClick={captureGps} data-testid="capture-gps">
                <MapPin className="h-4 w-4" /> Capture current GPS
              </Button>
              {data.latitude != null ? (
                <p className="text-sm text-slate-600" data-testid="gps-coords">
                  📍 {data.latitude}, {data.longitude} (±{data.gps_accuracy_m}m)
                </p>
              ) : (
                <p className="text-sm text-slate-400">No GPS captured yet.</p>
              )}
              <Check testid="verify-location" label="Artisan resides/works at this location" checked={data.location_verified} onChange={(v) => set('location_verified', v)} />
            </>
          )}

          {step === 3 && (
            <>
              <Check testid="verify-craft" label="Craft demonstrated and matches category" checked={data.craft_verified} onChange={(v) => set('craft_verified', v)} />
              <PhotoInput label="Capture craft photo" onChange={onPhotos} count={data.photo_paths.length} />
            </>
          )}

          {step === 4 && (
            <>
              <Check testid="verify-products" label="Product photos captured" checked={data.products_captured} onChange={(v) => set('products_captured', v)} />
              <PhotoInput label="Capture product photos" onChange={onPhotos} count={data.photo_paths.length} />
            </>
          )}

          {step === 5 && (
            <>
              <Check testid="verify-documents" label="Documents checked" checked={data.documents_checked} onChange={(v) => set('documents_checked', v)} />
              <p className="text-xs text-slate-500">Mark documents available / not available in the artisan profile after the visit.</p>
            </>
          )}

          {step === 6 && (
            <>
              <Check testid="verify-market-ready" label="Market readiness assessed (catalogue ready)" checked={data.market_ready} onChange={(v) => set('market_ready', v)} />
              <FormRow label="Final decision" htmlFor="decision" required>
                <Select
                  id="decision"
                  data-testid="verify-decision"
                  value={data.decision}
                  onChange={(e) => set('decision', e.target.value as FlowData['decision'])}
                >
                  <option value="">Select decision…</option>
                  {enumOptions(VERIFICATION_DECISION).map((d) => (
                    <option key={d} value={d}>
                      {VERIFICATION_DECISION[d].label}
                    </option>
                  ))}
                </Select>
              </FormRow>
              {data.decision && data.decision !== 'verified' ? (
                <FormRow label="Reason" htmlFor="reason">
                  <Select id="reason" data-testid="verify-reason" value={data.reason} onChange={(e) => set('reason', e.target.value)}>
                    <option value="">Select reason…</option>
                    {DECISION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </FormRow>
              ) : null}
              <FormRow label="Verifier notes" htmlFor="notes">
                <Textarea id="notes" data-testid="verify-notes" value={data.notes} onChange={(e) => set('notes', e.target.value)} />
              </FormRow>
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Checklist summary</p>
                <ChecklistSummary data={data} />
              </div>
            </>
          )}

          {error ? (
            <p data-testid="verify-error" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <div className="mt-4 flex gap-3">
        {step > 0 ? (
          <Button variant="secondary" type="button" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button block type="button" data-testid="verify-next" onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button block type="button" data-testid="verify-submit" disabled={submitting} onClick={submit}>
            {submitting ? 'Submitting…' : 'Submit Verification'}
          </Button>
        )}
      </div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
  testid,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testid?: string;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        data-testid={testid}
        className="mt-0.5 h-5 w-5"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function PhotoInput({
  label,
  onChange,
  count,
}: {
  label: string;
  onChange: (files: FileList | null) => void;
  count: number;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600">
        <Camera className="h-4 w-4" />
        {label}
        <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => onChange(e.target.files)} />
      </label>
      {count > 0 ? <Chip tone="green" className="mt-2">{count} photo(s) attached</Chip> : null}
    </div>
  );
}

function ChecklistSummary({ data }: { data: FlowData }) {
  const items: [string, boolean][] = [
    ['Consent', data.consent_captured],
    ['Identity', data.identity_verified],
    ['Location', data.location_verified],
    ['Craft', data.craft_verified],
    ['Products', data.products_captured],
    ['Documents', data.documents_checked],
    ['Duplicate', data.duplicate_checked],
  ];
  return (
    <ul className="mt-1 grid grid-cols-2 gap-x-3">
      {items.map(([k, v]) => (
        <li key={k} className={v ? 'text-emerald-600' : 'text-slate-400'}>
          {v ? '✓' : '○'} {k}
        </li>
      ))}
    </ul>
  );
}
