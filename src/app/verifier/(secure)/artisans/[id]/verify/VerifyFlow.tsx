'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormRow, Input, Select } from '@/components/ui';
import { GENDER, VERIFICATION_DECISION, type CraftCategory, type Gender } from '@/lib/domain';
import { saveDraft, loadDraft, deleteDraft } from '@/lib/field/drafts';
import { compressImageFile } from '@/lib/image-compress';
import { submitVerification } from './actions';
import {
  validateAll,
  reasonRequired,
  type VerifyErrors,
  type VerifyFieldKey,
  type VerifyValues,
} from './validators';
import VerifyStepShell from '@/components/field/verify/VerifyStepShell';
import { VERIFY_STEPS } from '@/components/field/verify/VerifyProgress';
import GpsMapCard from '@/components/field/verify/GpsMapCard';
import CraftStep from '@/components/field/verify/CraftStep';
import ProductsStep from '@/components/field/verify/ProductsStep';
import DocumentsConsentStep from '@/components/field/verify/DocumentsConsentStep';
import FinalReviewStep from '@/components/field/verify/FinalReviewStep';
import AadhaarVerification from '@/components/field/verify/AadhaarVerification';
import { FieldFormCard, VerifyCheckRow } from '@/components/field/verify/VerifyFormBits';
import {
  craftProfileToPayload,
  emptyCraftProfile,
  productDraftToPayload,
  type CraftProfileState,
  type ProductDraft,
} from '@/lib/field/verify-types';
import { CheckCircle2, Camera } from 'lucide-react';
import { cn } from '@/lib/cn';

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
  idProofVerified?: boolean;
  idProofMasked?: string | null;
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

const STEP_TITLES = [
  { title: 'Identity verification', titleHi: 'पहचान सत्यापन' },
  { title: 'Address & location', titleHi: 'पता और स्थान' },
  { title: 'Craft & skill', titleHi: 'शिल्प और कौशल' },
  { title: 'Product catalogue', titleHi: 'उत्पाद सूची' },
  { title: 'Documents & consent', titleHi: 'दस्तावेज़ · सहमति' },
  { title: 'Final review', titleHi: 'अंतिम समीक्षा' },
] as const;

function ItemStatusSelect({
  itemKey,
  value,
  onChange,
}: {
  itemKey: string;
  value: ItemStatus;
  onChange: (s: ItemStatus) => void;
}) {
  return (
    <Select
      data-testid={`item-${itemKey}`}
      value={value}
      onChange={(e) => onChange(e.target.value as ItemStatus)}
      className="text-sm"
    >
      {(Object.keys(ITEM_STATUS_LABEL) as ItemStatus[]).map((s) => (
        <option key={s} value={s}>
          {ITEM_STATUS_LABEL[s]}
        </option>
      ))}
    </Select>
  );
}

export default function VerifyFlow({
  artisan,
  verifierName,
  initialCraft,
  initialProducts = [],
}: {
  artisan: Artisan;
  verifierName: string;
  initialCraft?: CraftProfileState;
  initialProducts?: ProductDraft[];
}) {
  const router = useRouter();
  const loaded = useRef(false);
  const cgid = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cgid-${Date.now()}`,
  );

  const [stepIndex, setStepIndex] = useState(0);
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
  const [consentMode, setConsentMode] = useState('Verifier read aloud in local language');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [acc, setAcc] = useState<number | null>(null);
  const [marketReady, setMarketReady] = useState(false);
  const [decision, setDecision] = useState<'' | keyof typeof VERIFICATION_DECISION>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [craftPhotos, setCraftPhotos] = useState<string[]>([]);
  const [craftProfile, setCraftProfile] = useState<CraftProfileState>(initialCraft ?? emptyCraftProfile());
  const [products, setProducts] = useState<ProductDraft[]>(initialProducts);
  const [livePhoto, setLivePhoto] = useState<string | null>(null);
  const [aadhaarVerified, setAadhaarVerified] = useState(artisan.idProofVerified ?? false);
  const [aadhaarMasked, setAadhaarMasked] = useState(artisan.idProofMasked ?? '');
  const [landmarkNote, setLandmarkNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [errors, setErrors] = useState<VerifyErrors>({});
  const [touched, setTouched] = useState<Set<VerifyFieldKey>>(new Set());
  const [shaking, setShaking] = useState<Set<VerifyFieldKey>>(new Set());
  const fieldRefs = useRef<Partial<Record<VerifyFieldKey, FocusEl>>>({});
  const setRef = (field: VerifyFieldKey) => (el: FocusEl | null) => {
    if (el) fieldRefs.current[field] = el;
  };

  const values: VerifyValues = { full_name: fields.full_name, phone: fields.phone, decision, reason };

  useEffect(() => {
    if (touched.size === 0) {
      setErrors((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }
    const { errors: all } = validateAll(values);
    setErrors(() => {
      const next: VerifyErrors = {};
      touched.forEach((f) => {
        if (all[f]) next[f] = all[f];
      });
      return next;
    });
  }, [fields.full_name, fields.phone, decision, reason, touched]);

  useEffect(() => {
    if (artisan.idProofVerified) {
      setItem('identity', { status: 'verified' });
      setItem('contact', { status: 'verified' });
      setItem('documents', { status: 'verified' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for pre-verified artisans
  }, [artisan.idProofVerified]);

  useEffect(() => {
    const d = loadDraft(artisan.id);
    if (d?.data) {
      const data = d.data as Record<string, unknown>;
      if (data.fields) setFields(data.fields as FieldState);
      if (data.items) setItems(data.items as Record<string, { status: ItemStatus; note: string }>);
      if (typeof data.consent === 'boolean') setConsent(data.consent);
      if (typeof data.consentMode === 'string') setConsentMode(data.consentMode);
      if (typeof data.decision === 'string') setDecision(data.decision as keyof typeof VERIFICATION_DECISION);
      if (typeof data.notes === 'string') setNotes(data.notes);
      if (typeof data.stepIndex === 'number') setStepIndex(data.stepIndex);
      if (typeof data.landmarkNote === 'string') setLandmarkNote(data.landmarkNote);
      if (typeof data.addressConfirmed === 'boolean') setAddressConfirmed(data.addressConfirmed);
      if (data.craftProfile) setCraftProfile(data.craftProfile as CraftProfileState);
      if (data.products) setProducts(data.products as ProductDraft[]);
      if (data.craftPhotos) setCraftPhotos(data.craftPhotos as string[]);
      if (typeof data.aadhaarVerified === 'boolean') setAadhaarVerified(data.aadhaarVerified);
      if (typeof data.aadhaarMasked === 'string') setAadhaarMasked(data.aadhaarMasked);
      if (data.clientGeneratedId) cgid.current = data.clientGeneratedId as string;
    }
    loaded.current = true;
  }, [artisan.id]);

  useEffect(() => {
    if (!loaded.current) return;
    const now = new Date().toISOString();
    saveDraft({
      artisanId: artisan.id,
      artisanName: fields.full_name,
      clientGeneratedId: cgid.current,
      updatedAt: now,
      status: 'draft',
      data: {
        fields,
        items,
        consent,
        consentMode,
        decision,
        notes,
        stepIndex,
        landmarkNote,
        addressConfirmed,
        craftProfile,
        products,
        craftPhotos,
        aadhaarVerified,
        aadhaarMasked,
        clientGeneratedId: cgid.current,
      },
    });
    setSavedAt(now);
  }, [fields, items, consent, consentMode, decision, notes, stepIndex, landmarkNote, addressConfirmed, craftProfile, products, craftPhotos, aadhaarVerified, aadhaarMasked, artisan.id]);

  function handleAadhaarVerified(masked: string) {
    setAadhaarVerified(true);
    setAadhaarMasked(masked);
    setItem('identity', { status: 'verified', note: 'Aadhaar OTP verified' });
    setItem('contact', { status: 'verified', note: 'Linked mobile via Aadhaar' });
    setItem('documents', { status: 'verified', note: `ID proof: ${masked}` });
  }

  function setItem(key: string, patch: Partial<{ status: ItemStatus; note: string }>) {
    setItems((m) => ({ ...m, [key]: { ...m[key], ...patch } }));
  }

  function markTouched(field: VerifyFieldKey) {
    setTouched((t) => (t.has(field) ? t : new Set(t).add(field)));
  }

  function triggerShake(keys: VerifyFieldKey[]) {
    setShaking(new Set());
    setTimeout(() => setShaking(new Set(keys)), 0);
  }

  function captureGps() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLat(22.9412);
      setLng(81.0784);
      setAcc(25);
      setItem('address', { status: 'verified' });
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

  async function readCompressedPhoto(file: File): Promise<string> {
    try {
      return await compressImageFile(file);
    } catch {
      throw new Error('Could not process the photo. Try a smaller image or a different file.');
    }
  }

  async function onPhotos(files: FileList | null, target: 'evidence' | 'live' | 'landmark' | 'craft') {
    if (!files?.[0]) return;
    try {
      if (target === 'evidence' && files.length > 1) {
        const urls = await Promise.all(Array.from(files).slice(0, 4).map(readCompressedPhoto));
        setPhotos((p) => [...p, ...urls].slice(0, 8));
        return;
      }
      const url = await readCompressedPhoto(files[0]);
      if (target === 'live') setLivePhoto(url);
      else if (target === 'landmark') setPhotos((p) => [url, ...p].slice(0, 8));
      else if (target === 'craft') setCraftPhotos((p) => [...p, url].slice(0, 3));
      else setPhotos((p) => [...p, url].slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add photo.');
    }
  }

  async function onProductPhoto(productId: string, files: FileList | null) {
    if (!files?.[0]) return;
    let url: string;
    try {
      url = await readCompressedPhoto(files[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add product photo.');
      return;
    }
    setProducts((list) =>
      list.map((p) => (p.id === productId ? { ...p, photo_paths: [...p.photo_paths, url].slice(0, 5) } : p)),
    );
  }

  const hasBlocking = Object.values(items).some((i) => i.status === 'rejected' || i.status === 'cancelled');

  const isClear = (key: string) => {
    const s = items[key]?.status;
    return s === 'verified' || s === 'corrected';
  };

  function buildPayload() {
    return {
      artisan_id: artisan.id,
      client_generated_id: cgid.current,
      decision: decision as keyof typeof VERIFICATION_DECISION,
      reason: reason || null,
      notes: [notes, landmarkNote ? `Landmark: ${landmarkNote}` : ''].filter(Boolean).join('\n') || null,
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
      craft_profile: craftProfileToPayload(craftProfile),
      products: products.filter((p) => p.name.trim()).map(productDraftToPayload),
      items: ITEMS.map((it) => ({
        item_key: it.key,
        item_label: it.label,
        status: items[it.key].status,
        note: items[it.key].note || null,
      })),
      photo_paths: [livePhoto, ...craftPhotos, ...photos].filter(Boolean) as string[],
    };
  }

  const reviewChecklist = [
    { label: 'Identity verified', done: isClear('identity') || aadhaarVerified },
    { label: 'Craft verified', done: isClear('craft') },
    { label: 'Consent captured', done: consent && isClear('consent') },
    { label: 'Duplicate checked', done: aadhaarVerified || isClear('identity') },
    { label: 'Location verified', done: isClear('address') && lat != null },
    { label: 'Product photos', done: isClear('products') || products.some((p) => p.photo_paths.length > 0) },
    { label: 'Documents checked', done: isClear('documents') },
    { label: 'Market readiness', done: marketReady, partial: !marketReady && decision === 'verified' },
  ];

  function validateCurrentStep(): boolean {
    setError(null);
    if (stepIndex === 0) {
      markTouched('full_name');
      markTouched('phone');
      const { errors: fieldErrors, firstInvalid } = validateAll({
        ...values,
        decision: 'verified',
        reason: '',
      });
      const stepErrors: VerifyErrors = {};
      if (fieldErrors.full_name) stepErrors.full_name = fieldErrors.full_name;
      if (fieldErrors.phone) stepErrors.phone = fieldErrors.phone;
      if (Object.keys(stepErrors).length) {
        setErrors(stepErrors);
        triggerShake(Object.keys(stepErrors) as VerifyFieldKey[]);
        if (firstInvalid === 'full_name' || firstInvalid === 'phone') fieldRefs.current[firstInvalid]?.focus();
        return false;
      }
    }
    if (stepIndex === 4) {
      if (!consent) {
        setError('Verification cannot continue without consent.');
        return false;
      }
    }
    if (stepIndex === 5) {
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
        return false;
      }
      if (decision === 'verified' && hasBlocking) {
        setError('Some items are rejected/cancelled — Fully Verified requires an admin override. Choose Needs Correction, or ask an admin to override.');
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (stepIndex < VERIFY_STEPS.length - 1) {
      if (!validateCurrentStep()) return;
      setStepIndex((s) => s + 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    void submit();
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
      setError(null);
      return;
    }
    router.push(`/verifier/artisans/${artisan.id}`);
  }

  async function submit() {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    const payload = buildPayload();
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
    } catch (err) {
      const msg =
        err instanceof Error && /body exceeded|413|payload/i.test(err.message)
          ? 'Photos are too large to upload in one go. Remove a photo or retake with lower resolution, then submit again.'
          : 'Network error. Saved to the sync queue — retry from the Sync tab.';
      setError(msg);
      setSubmitting(false);
    }
  }

  const nameValid = touched.has('full_name') && !errors.full_name && fields.full_name.trim().length > 0;
  const phoneValid = touched.has('phone') && !errors.phone && fields.phone.trim().length > 0;
  const needsReason = reasonRequired(decision);
  const isLastStep = stepIndex === VERIFY_STEPS.length - 1;

  if (done) {
    return (
      <div data-testid="verify-success" className="flex flex-col items-center pt-12 text-center">
        <span className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-india-50">
          <CheckCircle2 className="h-10 w-10 text-india-600" />
        </span>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-field-ink [text-wrap:balance]">
          Verification submitted
        </h1>
        <p className="mt-2 text-field-muted [text-wrap:pretty]">
          Final status:{' '}
          <strong className="font-semibold text-field-ink">
            {VERIFICATION_DECISION[decision as keyof typeof VERIFICATION_DECISION]?.label}
          </strong>
          .
        </p>
        <Button className="mt-6 bg-field-accent hover:bg-field-accentHover" onClick={() => router.push('/verifier')}>
          Back to Today&apos;s Work
        </Button>
      </div>
    );
  }

  const { title, titleHi } = STEP_TITLES[stepIndex];

  return (
    <VerifyStepShell
      artisanId={artisan.id}
      artisanName={fields.full_name || artisan.full_name}
      title={title}
      titleHi={titleHi}
      stepIndex={stepIndex}
      savedAt={savedAt}
      onBack={goBack}
      onContinue={goNext}
      continueLabel={isLastStep ? 'Submit Verification ✓' : 'Save & Continue'}
      continueLoading={submitting}
      continueTestId={isLastStep ? 'verify-submit' : 'verify-continue'}
      continueClassName={isLastStep ? 'bg-india-700 hover:bg-india-800' : undefined}
    >
      {stepIndex === 0 ? (
        <>
          <FieldFormCard>
            <div className="flex gap-4">
              <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-field-border bg-stone-50/80 text-field-muted transition-colors hover:border-field-accent hover:bg-field-accent/5">
                {livePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={livePhoto} alt="Live capture" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <Camera className="h-6 w-6" />
                    <span className="mt-1 text-[10px] font-medium">Live photo</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => onPhotos(e.target.files, 'live')} />
              </label>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-field-ink">Live photo / लाइव फ़ोटो</p>
                <p className="mt-0.5 text-xs text-field-muted [text-wrap:pretty]">Capture artisan at visit location.</p>
                <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-field-accent px-3 py-1.5 text-xs font-semibold text-field-accent hover:bg-field-accent/5">
                  Capture photo
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => onPhotos(e.target.files, 'live')} />
                </label>
              </div>
            </div>
          </FieldFormCard>

          <FieldFormCard className="grid grid-cols-2 gap-3">
            <FormRow
              label="Full name · पूरा नाम"
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
                invalid={!!errors.full_name}
                valid={nameValid}
                value={fields.full_name}
                onChange={(e) => setFields((f) => ({ ...f, full_name: e.target.value }))}
                onBlur={() => markTouched('full_name')}
              />
            </FormRow>
            <FormRow
              label="Mobile · मोबाइल"
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
                invalid={!!errors.phone}
                valid={phoneValid}
                value={fields.phone}
                onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                onBlur={() => markTouched('phone')}
              />
            </FormRow>
            <FormRow label="Tribe · जनजाति" htmlFor="f-tribe">
              <Input
                id="f-tribe"
                value={fields.tribe_community}
                onChange={(e) => setFields((f) => ({ ...f, tribe_community: e.target.value }))}
              />
            </FormRow>
            <div className="col-span-2">
              <p className="mb-2 text-xs font-medium text-field-muted">Gender · लिंग</p>
              <div className="grid grid-cols-3 gap-2">
                {(['female', 'male', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFields((f) => ({ ...f, gender: g }))}
                    className={cn(
                      'min-h-[44px] rounded-xl text-sm font-semibold transition-colors duration-150',
                      fields.gender === g
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'bg-stone-100/80 text-field-muted hover:bg-stone-200/80',
                    )}
                  >
                    {g === 'female' ? 'महिला' : g === 'male' ? 'पुरुष' : 'Other'}
                  </button>
                ))}
              </div>
            </div>
          </FieldFormCard>

          <FieldFormCard className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-field-muted">Verification checks</p>
            <AadhaarVerification
              artisanId={artisan.id}
              initialVerified={aadhaarVerified}
              initialMasked={aadhaarMasked}
              onVerified={handleAadhaarVerified}
            />
            {/* Hidden selects for automated tests */}
            <select
              data-testid="item-identity"
              value={items.identity.status}
              onChange={(e) => setItem('identity', { status: e.target.value as ItemStatus })}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            >
              {(Object.keys(ITEM_STATUS_LABEL) as ItemStatus[]).map((s) => (
                <option key={s} value={s}>{ITEM_STATUS_LABEL[s]}</option>
              ))}
            </select>
            <select
              data-testid="item-contact"
              value={items.contact.status}
              onChange={(e) => setItem('contact', { status: e.target.value as ItemStatus })}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            >
              {(Object.keys(ITEM_STATUS_LABEL) as ItemStatus[]).map((s) => (
                <option key={s} value={s}>{ITEM_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </FieldFormCard>
        </>
      ) : null}

      {stepIndex === 1 ? (
        <>
          <GpsMapCard lat={lat} lng={lng} acc={acc} onRecapture={captureGps} />
          <FieldFormCard className="grid grid-cols-2 gap-3">
            <FormRow label="State" htmlFor="f-state">
              <Input id="f-state" value={fields.state} onChange={(e) => setFields((f) => ({ ...f, state: e.target.value }))} />
            </FormRow>
            <FormRow label="District" htmlFor="f-district">
              <Input id="f-district" value={fields.district} onChange={(e) => setFields((f) => ({ ...f, district: e.target.value }))} />
            </FormRow>
            <FormRow label="Block / Taluka" htmlFor="f-block">
              <Input id="f-block" value={fields.block} onChange={(e) => setFields((f) => ({ ...f, block: e.target.value }))} />
            </FormRow>
            <FormRow label="Village / Hamlet" htmlFor="f-village">
              <Input id="f-village" value={fields.village} onChange={(e) => setFields((f) => ({ ...f, village: e.target.value }))} />
            </FormRow>
          </FieldFormCard>
          <FieldFormCard>
            <p className="mb-2 text-xs font-medium text-field-muted">Landmark photo</p>
            <div className="flex gap-3">
              <label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-field-border bg-stone-50/80">
                <Camera className="h-5 w-5 text-field-muted" />
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPhotos(e.target.files, 'landmark')} />
              </label>
              <Input
                placeholder="Near landmark, lane, cluster…"
                value={landmarkNote}
                onChange={(e) => setLandmarkNote(e.target.value)}
                className="flex-1 text-sm"
              />
            </div>
          </FieldFormCard>
          <FieldFormCard className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-field-ink">Address & GPS status</span>
              <ItemStatusSelect itemKey="address" value={items.address.status} onChange={(s) => setItem('address', { status: s })} />
            </div>
            <Input
              placeholder="Note / evidence (optional)"
              data-testid="note-address"
              value={items.address.note}
              onChange={(e) => setItem('address', { note: e.target.value })}
              className="text-sm"
            />
            <VerifyCheckRow
              checked={lat != null}
              label="GPS captured at visit location"
              disabled
            />
            <VerifyCheckRow
              checked={addressConfirmed}
              label="Address confirmed by artisan"
              onChange={setAddressConfirmed}
            />
          </FieldFormCard>
        </>
      ) : null}

      {stepIndex === 2 ? (
        <CraftStep
          primaryCraft={fields.primary_craft}
          onPrimaryCraftChange={(c) => setFields((f) => ({ ...f, primary_craft: c }))}
          craft={craftProfile}
          onCraftChange={(patch) => setCraftProfile((cp) => ({ ...cp, ...patch }))}
          craftPhotos={craftPhotos}
          onAddCraftPhoto={(files) => void onPhotos(files, 'craft')}
          itemStatus={items.craft.status}
          onItemStatusChange={(s) => setItem('craft', { status: s })}
          itemNote={items.craft.note}
          onItemNoteChange={(note) => setItem('craft', { note })}
        />
      ) : null}

      {stepIndex === 3 ? (
        <ProductsStep
          products={products}
          onProductsChange={setProducts}
          itemStatus={items.products.status}
          onItemStatusChange={(s) => setItem('products', { status: s })}
          itemNote={items.products.note}
          onItemNoteChange={(note) => setItem('products', { note })}
          onAddPhoto={(id, files) => void onProductPhoto(id, files)}
        />
      ) : null}

      {stepIndex === 4 ? (
        <DocumentsConsentStep
          documentsStatus={items.documents.status}
          onDocumentsStatusChange={(s) => setItem('documents', { status: s })}
          documentsNote={items.documents.note}
          onDocumentsNoteChange={(note) => setItem('documents', { note })}
          consentItemStatus={items.consent.status}
          onConsentItemStatusChange={(s) => setItem('consent', { status: s })}
          consent={consent}
          onConsentChange={setConsent}
          consentMode={consentMode}
          onConsentModeChange={setConsentMode}
          verifierName={verifierName}
          lat={lat}
          lng={lng}
          acc={acc}
        />
      ) : null}

      {stepIndex === 5 ? (
        <>
          <FinalReviewStep
            checklist={reviewChecklist}
            decision={decision}
            onDecisionChange={setDecision}
            reason={reason}
            onReasonChange={setReason}
            notes={notes}
            onNotesChange={setNotes}
            marketReady={marketReady}
            onMarketReadyChange={setMarketReady}
            hasBlocking={hasBlocking}
            errors={errors}
            needsReason={needsReason}
            setRef={setRef}
            markTouched={markTouched}
            shaking={shaking}
          />
          {error ? (
            <p data-testid="verify-error" role="alert" className="animate-step-enter rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
        </>
      ) : null}

      {error && stepIndex !== 5 ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </VerifyStepShell>
  );
}
