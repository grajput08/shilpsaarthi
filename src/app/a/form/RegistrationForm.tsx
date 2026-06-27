'use client';

import { useCallback, useRef, useState } from 'react';
import { Button, Card, CardBody, FormRow, Input, Select, Textarea, Chip, ProgressBar } from '@/components/ui';
import { CRAFT_CATEGORY, GENDER, LANGUAGES, enumOptions, type CraftCategory, type Gender } from '@/lib/domain';
import { CheckCircle2 } from 'lucide-react';
import {
  validateField,
  validateStep,
  type FieldErrors,
  type ValidatableField,
} from './validators';

interface FormState {
  preferred_language: string;
  consent: boolean;
  full_name: string;
  phone: string;
  gender: Gender | '';
  tribe_community: string;
  state: string;
  district: string;
  block: string;
  village: string;
  primary_craft: CraftCategory | '';
  product_name: string;
  product_description: string;
  photo_paths: string[];
}

const STEPS = ['Language', 'Consent', 'Identity', 'Address', 'Craft', 'Products', 'Review'] as const;

const initial: FormState = {
  preferred_language: 'en',
  consent: false,
  full_name: '',
  phone: '',
  gender: '',
  tribe_community: '',
  state: '',
  district: '',
  block: '',
  village: '',
  primary_craft: '',
  product_name: '',
  product_description: '',
  photo_paths: [],
};

const VALIDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'consent',
  'full_name',
  'phone',
  'state',
  'district',
  'village',
  'primary_craft',
]);

export interface RegistrationPrefill {
  full_name?: string;
  phone?: string;
  state?: string;
  district?: string;
  village?: string;
  primary_craft?: string;
}

type FocusableField = Exclude<ValidatableField, 'consent'> | 'consent';
type FieldEl = HTMLInputElement | HTMLSelectElement;

export default function RegistrationForm({
  initialLanguage,
  token,
  prefill = {},
}: {
  initialLanguage: string;
  token?: string;
  prefill?: RegistrationPrefill;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    ...initial,
    preferred_language: initialLanguage,
    full_name: prefill.full_name ?? '',
    phone: prefill.phone ?? '',
    state: prefill.state ?? '',
    district: prefill.district ?? '',
    village: prefill.village ?? '',
    primary_craft: (prefill.primary_craft as CraftCategory) ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<ValidatableField>>(new Set());
  const [shaking, setShaking] = useState<Set<ValidatableField>>(new Set());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ artisanCode: string | null } | null>(null);

  const fieldRefs = useRef<Partial<Record<FocusableField, FieldEl>>>({});
  const setRef = (field: FocusableField) => (el: FieldEl | null) => {
    if (el) fieldRefs.current[field] = el;
  };

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Live feedback: once a field has been touched (or already errored), keep its
    // validity in sync as the user types instead of waiting for the next blur.
    if (VALIDATABLE_FIELDS.has(key as string)) {
      const field = key as ValidatableField;
      setErrors((prev) => {
        if (!touched.has(field) && !prev[field]) return prev;
        const message = validateField(field, value);
        const next = { ...prev };
        if (message) next[field] = message;
        else delete next[field];
        return next;
      });
    }
  }, [touched]);

  function onBlurField(field: ValidatableField, value: unknown) {
    setTouched((t) => (t.has(field) ? t : new Set(t).add(field)));
    const message = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  // Re-fires the shake animation even when the same fields fail twice in a row.
  // setTimeout (not rAF) so it still runs when the tab is backgrounded.
  function triggerShake(fields: ValidatableField[]) {
    setShaking(new Set());
    setTimeout(() => setShaking(new Set(fields)), 0);
  }

  function next() {
    const { errors: stepErrors, firstInvalid } = validateStep(step, form as unknown as Record<string, unknown>);
    if (firstInvalid) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      setTouched((t) => {
        const n = new Set(t);
        Object.keys(stepErrors).forEach((f) => n.add(f as ValidatableField));
        return n;
      });
      triggerShake(Object.keys(stepErrors) as ValidatableField[]);
      // The offending field is already mounted on this step, so focus it directly
      // — no need to wait for a paint frame, which keeps focus reliable.
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onPhotos(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 3);
    const dataUrls = await Promise.all(
      list.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }),
      ),
    );
    update('photo_paths', dataUrls);
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          token,
          gender: form.gender || undefined,
          primary_craft: form.primary_craft,
          consent: form.consent,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSubmitError(body.error ?? 'Registration failed. Please try again.');
        setSubmitting(false);
        return;
      }
      setDone({ artisanCode: body.artisanCode ?? null });
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  // A field shows a success check once it is touched, non-empty and error-free.
  const isValid = (field: ValidatableField, value: string) =>
    touched.has(field) && !errors[field] && value.trim().length > 0;

  if (done) {
    return (
      <div data-testid="registration-success" className="flex flex-col items-center pt-16 text-center">
        <span className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
          Registration received
        </h1>
        <p className="mt-2 text-slate-600 [text-wrap:pretty]">
          Thank you, {form.full_name}. Your artisan registration is submitted and now{' '}
          <strong className="font-semibold text-slate-800">Pending Verification</strong>.
        </p>
        {done.artisanCode ? (
          <p className="mt-3 text-sm text-slate-500">
            Your reference ID: <span className="font-mono font-semibold text-slate-700">{done.artisanCode}</span>
          </p>
        ) : null}
        <p className="mt-4 max-w-xs text-sm text-slate-500 [text-wrap:pretty]">
          A field verifier may visit {form.village} for confirmation. Please keep your craft samples
          and documents ready. You will receive a WhatsApp confirmation shortly.
        </p>
      </div>
    );
  }

  const onLastStep = step === STEPS.length - 1;

  return (
    <div>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">ShilpSaarthi</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">Artisan Registration</h1>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={((step + 1) / STEPS.length) * 100} />
          <span className="whitespace-nowrap text-xs font-medium tabular-nums text-slate-500">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-500">{STEPS[step]}</p>
      </header>

      <Card>
        <CardBody>
          <div key={step} className="animate-step-enter">
            {step === 0 && (
              <FormRow label="Choose your language" htmlFor="lang">
                <Select
                  id="lang"
                  data-testid="reg-language"
                  value={form.preferred_language}
                  onChange={(e) => update('preferred_language', e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} ({l.label})
                    </option>
                  ))}
                </Select>
              </FormRow>
            )}

            {step === 1 && (
              <div className={shaking.has('consent') ? 'animate-shake' : undefined}>
                <h2 className="text-sm font-semibold text-slate-900">Consent &amp; Information Notice</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 [text-wrap:pretty]">
                  <li>We collect your name, craft, location and basic details to build a verified artisan registry.</li>
                  <li>A government field officer may visit you to confirm the details.</li>
                  <li>Your information is used only for artisan welfare, schemes and market linkage.</li>
                  <li>You can request correction of your details at any time.</li>
                </ul>
                <label
                  className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50"
                >
                  <input
                    ref={setRef('consent')}
                    type="checkbox"
                    data-testid="reg-consent"
                    className="mt-0.5 h-5 w-5 cursor-pointer rounded accent-brand-600"
                    checked={form.consent}
                    onChange={(e) => {
                      update('consent', e.target.checked);
                      if (e.target.checked) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.consent;
                          return n;
                        });
                      }
                    }}
                  />
                  <span>I understand and give my consent to register and be contacted.</span>
                </label>
                {errors.consent ? (
                  <p
                    data-testid="reg-error"
                    role="alert"
                    className="animate-step-enter mt-2 text-xs font-medium text-red-600"
                  >
                    {errors.consent}
                  </p>
                ) : null}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormRow
                  label="Full name"
                  htmlFor="name"
                  required
                  error={errors.full_name}
                  valid={isValid('full_name', form.full_name)}
                  shake={shaking.has('full_name')}
                  errorId="err-name"
                >
                  <Input
                    id="name"
                    ref={setRef('full_name')}
                    data-testid="reg-name"
                    aria-describedby={errors.full_name ? 'err-name' : undefined}
                    invalid={!!errors.full_name}
                    valid={isValid('full_name', form.full_name)}
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    onBlur={(e) => onBlurField('full_name', e.target.value)}
                    placeholder="e.g. Sukhram Maravi"
                  />
                </FormRow>
                <FormRow
                  label="Mobile number"
                  htmlFor="phone"
                  required
                  error={errors.phone}
                  hint="10-digit number, starting 6–9"
                  valid={isValid('phone', form.phone)}
                  shake={shaking.has('phone')}
                  errorId="err-phone"
                >
                  <Input
                    id="phone"
                    ref={setRef('phone')}
                    data-testid="reg-phone"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                    invalid={!!errors.phone}
                    valid={isValid('phone', form.phone)}
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                    onBlur={(e) => onBlurField('phone', e.target.value)}
                    placeholder="10-digit mobile"
                  />
                </FormRow>
                <FormRow label="Gender" htmlFor="gender">
                  <Select id="gender" value={form.gender} onChange={(e) => update('gender', e.target.value as Gender)}>
                    <option value="">Prefer not to say</option>
                    {enumOptions(GENDER).map((g) => (
                      <option key={g} value={g}>
                        {GENDER[g]}
                      </option>
                    ))}
                  </Select>
                </FormRow>
                <FormRow label="Tribe / community" htmlFor="tribe">
                  <Input
                    id="tribe"
                    value={form.tribe_community}
                    onChange={(e) => update('tribe_community', e.target.value)}
                    placeholder="e.g. Gond, Baiga"
                  />
                </FormRow>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <FormRow
                  label="State"
                  htmlFor="state"
                  required
                  error={errors.state}
                  valid={isValid('state', form.state)}
                  shake={shaking.has('state')}
                  errorId="err-state"
                >
                  <Input
                    id="state"
                    ref={setRef('state')}
                    data-testid="reg-state"
                    aria-describedby={errors.state ? 'err-state' : undefined}
                    invalid={!!errors.state}
                    valid={isValid('state', form.state)}
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    onBlur={(e) => onBlurField('state', e.target.value)}
                    placeholder="e.g. Madhya Pradesh"
                  />
                </FormRow>
                <FormRow
                  label="District"
                  htmlFor="district"
                  required
                  error={errors.district}
                  valid={isValid('district', form.district)}
                  shake={shaking.has('district')}
                  errorId="err-district"
                >
                  <Input
                    id="district"
                    ref={setRef('district')}
                    data-testid="reg-district"
                    aria-describedby={errors.district ? 'err-district' : undefined}
                    invalid={!!errors.district}
                    valid={isValid('district', form.district)}
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                    onBlur={(e) => onBlurField('district', e.target.value)}
                    placeholder="e.g. Dindori"
                  />
                </FormRow>
                <FormRow label="Block / Taluka" htmlFor="block">
                  <Input id="block" value={form.block} onChange={(e) => update('block', e.target.value)} />
                </FormRow>
                <FormRow
                  label="Village"
                  htmlFor="village"
                  required
                  error={errors.village}
                  valid={isValid('village', form.village)}
                  shake={shaking.has('village')}
                  errorId="err-village"
                >
                  <Input
                    id="village"
                    ref={setRef('village')}
                    data-testid="reg-village"
                    aria-describedby={errors.village ? 'err-village' : undefined}
                    invalid={!!errors.village}
                    valid={isValid('village', form.village)}
                    value={form.village}
                    onChange={(e) => update('village', e.target.value)}
                    onBlur={(e) => onBlurField('village', e.target.value)}
                    placeholder="e.g. Karanjia"
                  />
                </FormRow>
              </div>
            )}

            {step === 4 && (
              <FormRow
                label="Primary craft"
                htmlFor="craft"
                required
                error={errors.primary_craft}
                shake={shaking.has('primary_craft')}
                errorId="err-craft"
              >
                <Select
                  id="craft"
                  ref={setRef('primary_craft')}
                  data-testid="reg-craft"
                  aria-describedby={errors.primary_craft ? 'err-craft' : undefined}
                  invalid={!!errors.primary_craft}
                  value={form.primary_craft}
                  onChange={(e) => update('primary_craft', e.target.value as CraftCategory)}
                  onBlur={(e) => onBlurField('primary_craft', e.target.value)}
                >
                  <option value="">Select a craft…</option>
                  {enumOptions(CRAFT_CATEGORY).map((c) => (
                    <option key={c} value={c}>
                      {CRAFT_CATEGORY[c]}
                    </option>
                  ))}
                </Select>
              </FormRow>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 [text-wrap:pretty]">
                  Optional — share a product you make. You can skip this.
                </p>
                <FormRow label="Product name" htmlFor="pname">
                  <Input id="pname" value={form.product_name} onChange={(e) => update('product_name', e.target.value)} placeholder="e.g. Handwoven cotton stole" />
                </FormRow>
                <FormRow label="Description" htmlFor="pdesc">
                  <Textarea id="pdesc" value={form.product_description} onChange={(e) => update('product_description', e.target.value)} />
                </FormRow>
                <FormRow label="Product photos (up to 3)" htmlFor="photos">
                  <input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    data-testid="reg-photos"
                    onChange={(e) => onPhotos(e.target.files)}
                    className="block w-full cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                  />
                  {form.photo_paths.length > 0 ? (
                    <p className="animate-step-enter mt-2 text-xs font-medium text-emerald-600">
                      {form.photo_paths.length} photo(s) attached
                    </p>
                  ) : null}
                </FormRow>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-1 text-sm">
                <h2 className="mb-2 font-semibold text-slate-900">Review your details</h2>
                <Row label="Name" value={form.full_name} />
                <Row label="Mobile" value={form.phone} />
                <Row label="Craft" value={form.primary_craft ? CRAFT_CATEGORY[form.primary_craft] : '—'} />
                <Row label="Location" value={[form.village, form.district, form.state].filter(Boolean).join(', ')} />
                {form.product_name ? <Row label="Product" value={form.product_name} /> : null}
                <div className="pt-3">
                  <Chip tone="green">Will be submitted as Pending Verification</Chip>
                </div>
              </div>
            )}

            {submitError ? (
              <p
                data-testid="reg-error"
                role="alert"
                className="animate-step-enter mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
              >
                {submitError}
              </p>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <div className="mt-5 flex gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={back} type="button" disabled={submitting}>
            Back
          </Button>
        ) : null}
        {!onLastStep ? (
          <Button block onClick={next} type="button" data-testid="reg-next">
            Continue
          </Button>
        ) : (
          <Button block onClick={submit} loading={submitting} type="button" data-testid="reg-submit">
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 [text-wrap:balance]">{value || '—'}</span>
    </div>
  );
}
