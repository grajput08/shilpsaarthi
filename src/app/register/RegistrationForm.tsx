'use client';

import { useState } from 'react';
import { Button, Card, CardBody, FormRow, Input, Select, Textarea, Chip, ProgressBar } from '@/components/ui';
import { CRAFT_CATEGORY, GENDER, LANGUAGES, enumOptions, type CraftCategory, type Gender } from '@/lib/domain';
import { PHONE_REGEX } from '@/lib/validation';
import { CheckCircle2 } from 'lucide-react';

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

export default function RegistrationForm({ initialLanguage }: { initialLanguage: string }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ ...initial, preferred_language: initialLanguage });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ artisanCode: string | null } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): string | null {
    switch (step) {
      case 1:
        return form.consent ? null : 'Please accept the consent to continue.';
      case 2:
        if (form.full_name.trim().length < 2) return 'Please enter your full name.';
        if (!PHONE_REGEX.test(form.phone)) return 'Enter a valid 10-digit mobile number.';
        return null;
      case 3:
        if (form.state.trim().length < 2) return 'State is required.';
        if (form.district.trim().length < 2) return 'District is required.';
        if (form.village.trim().length < 1) return 'Village is required.';
        return null;
      case 4:
        return form.primary_craft ? null : 'Please choose a craft category.';
      default:
        return null;
    }
  }

  function next() {
    const v = validateStep();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
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
    setError(null);
    try {
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          gender: form.gender || undefined,
          primary_craft: form.primary_craft,
          consent: form.consent,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'Registration failed. Please try again.');
        setSubmitting(false);
        return;
      }
      setDone({ artisanCode: body.artisanCode ?? null });
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div data-testid="registration-success" className="flex flex-col items-center pt-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Registration received</h1>
        <p className="mt-2 text-slate-600">
          Thank you, {form.full_name}. Your artisan registration is submitted and now{' '}
          <strong>Pending Verification</strong>.
        </p>
        {done.artisanCode ? (
          <p className="mt-3 text-sm text-slate-500">
            Your reference ID: <span className="font-mono font-semibold">{done.artisanCode}</span>
          </p>
        ) : null}
        <p className="mt-4 max-w-xs text-sm text-slate-500">
          A field verifier may visit {form.village} for confirmation. Please keep your craft samples
          and documents ready. You will receive a WhatsApp confirmation shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ShilpSaarthi</p>
        <h1 className="text-xl font-bold text-slate-900">Artisan Registration</h1>
        <div className="mt-3 flex items-center gap-2">
          <ProgressBar value={((step + 1) / STEPS.length) * 100} />
          <span className="whitespace-nowrap text-xs text-slate-500">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600">{STEPS[step]}</p>
      </header>

      <Card>
        <CardBody>
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
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Consent &amp; Information Notice</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                <li>We collect your name, craft, location and basic details to build a verified artisan registry.</li>
                <li>A government field officer may visit you to confirm the details.</li>
                <li>Your information is used only for artisan welfare, schemes and market linkage.</li>
                <li>You can request correction of your details at any time.</li>
              </ul>
              <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  data-testid="reg-consent"
                  className="mt-0.5 h-5 w-5"
                  checked={form.consent}
                  onChange={(e) => update('consent', e.target.checked)}
                />
                <span>I understand and give my consent to register and be contacted.</span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FormRow label="Full name" htmlFor="name" required>
                <Input
                  id="name"
                  data-testid="reg-name"
                  value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  placeholder="e.g. Sukhram Maravi"
                />
              </FormRow>
              <FormRow label="Mobile number" htmlFor="phone" required>
                <Input
                  id="phone"
                  data-testid="reg-phone"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
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
              <FormRow label="State" htmlFor="state" required>
                <Input id="state" data-testid="reg-state" value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="e.g. Madhya Pradesh" />
              </FormRow>
              <FormRow label="District" htmlFor="district" required>
                <Input id="district" data-testid="reg-district" value={form.district} onChange={(e) => update('district', e.target.value)} placeholder="e.g. Dindori" />
              </FormRow>
              <FormRow label="Block / Taluka" htmlFor="block">
                <Input id="block" value={form.block} onChange={(e) => update('block', e.target.value)} />
              </FormRow>
              <FormRow label="Village" htmlFor="village" required>
                <Input id="village" data-testid="reg-village" value={form.village} onChange={(e) => update('village', e.target.value)} placeholder="e.g. Karanjia" />
              </FormRow>
            </div>
          )}

          {step === 4 && (
            <FormRow label="Primary craft" htmlFor="craft" required>
              <Select
                id="craft"
                data-testid="reg-craft"
                value={form.primary_craft}
                onChange={(e) => update('primary_craft', e.target.value as CraftCategory)}
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
              <p className="text-sm text-slate-600">Optional — share a product you make (you can skip this).</p>
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
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
                />
                {form.photo_paths.length > 0 ? (
                  <p className="mt-2 text-xs text-emerald-600">{form.photo_paths.length} photo(s) attached</p>
                ) : null}
              </FormRow>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-2 text-sm">
              <h2 className="font-semibold text-slate-900">Review your details</h2>
              <Row label="Name" value={form.full_name} />
              <Row label="Mobile" value={form.phone} />
              <Row label="Craft" value={form.primary_craft ? CRAFT_CATEGORY[form.primary_craft] : '—'} />
              <Row label="Location" value={[form.village, form.district, form.state].filter(Boolean).join(', ')} />
              {form.product_name ? <Row label="Product" value={form.product_name} /> : null}
              <div className="pt-2">
                <Chip tone="green">Will be submitted as Pending Verification</Chip>
              </div>
            </div>
          )}

          {error ? (
            <p data-testid="reg-error" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <div className="mt-4 flex gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={back} type="button">
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button block onClick={next} type="button" data-testid="reg-next">
            Continue
          </Button>
        ) : (
          <Button block onClick={submit} disabled={submitting} type="button" data-testid="reg-submit">
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || '—'}</span>
    </div>
  );
}
