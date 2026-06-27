import { Input } from '@/components/ui';
import { ConsentMethodCard, FieldFormCard } from '@/components/field/verify/VerifyFormBits';
import { Clock, MapPin, User } from 'lucide-react';
import { formatDateTime } from '@/lib/format';

type ItemStatus = 'pending' | 'verified' | 'corrected' | 'rejected' | 'cancelled' | 'not_applicable';

export default function DocumentsConsentStep({
  documentsStatus,
  onDocumentsStatusChange,
  documentsNote,
  onDocumentsNoteChange,
  consentItemStatus,
  onConsentItemStatusChange,
  consent,
  onConsentChange,
  consentMode,
  onConsentModeChange,
  verifierName,
  lat,
  lng,
  acc,
}: {
  documentsStatus: ItemStatus;
  onDocumentsStatusChange: (s: ItemStatus) => void;
  documentsNote: string;
  onDocumentsNoteChange: (note: string) => void;
  consentItemStatus: ItemStatus;
  onConsentItemStatusChange: (s: ItemStatus) => void;
  consent: boolean;
  onConsentChange: (v: boolean) => void;
  consentMode: string;
  onConsentModeChange: (mode: string) => void;
  verifierName: string;
  lat: number | null;
  lng: number | null;
  acc: number | null;
}) {
  return (
    <div className="space-y-4">
      <FieldFormCard className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-field-ink">Documents checked</span>
          <select
            data-testid="item-documents"
            value={documentsStatus}
            onChange={(e) => onDocumentsStatusChange(e.target.value as ItemStatus)}
            className="rounded-lg border border-field-border bg-white px-2 py-1.5 text-sm"
          >
            {['pending', 'verified', 'corrected', 'rejected', 'cancelled', 'not_applicable'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Document note (optional)"
          data-testid="note-documents"
          value={documentsNote}
          onChange={(e) => onDocumentsNoteChange(e.target.value)}
          className="text-sm"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-field-ink">Consent item status</span>
          <select
            data-testid="item-consent"
            value={consentItemStatus}
            onChange={(e) => onConsentItemStatusChange(e.target.value as ItemStatus)}
            className="rounded-lg border border-field-border bg-white px-2 py-1.5 text-sm"
          >
            {['pending', 'verified', 'corrected', 'rejected', 'cancelled', 'not_applicable'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </FieldFormCard>

      <FieldFormCard className="space-y-3 text-sm [text-wrap:pretty] text-field-ink">
        <p className="font-semibold">Consent &amp; notice / सहमति · डेटा संग्रह सूचना</p>
        <p>
          We are collecting details to build a verified registry of tribal artisans. This helps connect you to{' '}
          <strong>schemes, training, exhibitions and markets.</strong>
        </p>
        <ul className="space-y-2 text-field-muted">
          {[
            'What we collect: name, craft, photos, location, documents.',
            'A field officer may verify your details in person.',
            'You can ask to correct or remove your details anytime.',
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-india-600">✓</span>
              {line}
            </li>
          ))}
        </ul>
      </FieldFormCard>

      <div className="space-y-2">
        <p className="text-xs font-medium text-field-muted">How was consent given?</p>
        <ConsentMethodCard
          selected={consentMode === 'Verifier read aloud in local language'}
          label="Verifier read aloud in local language"
          onSelect={() => onConsentModeChange('Verifier read aloud in local language')}
        />
        <ConsentMethodCard
          selected={consentMode === 'Artisan read it themselves'}
          label="Artisan read it themselves"
          onSelect={() => onConsentModeChange('Artisan read it themselves')}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-india-200 bg-india-50/80 px-4 py-3.5">
        <input
          type="checkbox"
          data-testid="verify-consent"
          className="h-5 w-5 rounded accent-india-600"
          checked={consent}
          onChange={(e) => {
            onConsentChange(e.target.checked);
            if (e.target.checked) onConsentItemStatusChange('verified');
          }}
        />
        <span className="text-sm font-semibold text-india-900">Artisan consents to data collection</span>
      </label>

      <FieldFormCard className="space-y-2.5 text-sm">
        <div className="flex items-center gap-2 text-field-muted">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{formatDateTime(new Date().toISOString())}</span>
        </div>
        {lat != null ? (
          <div className="flex items-center gap-2 text-field-muted">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="tabular-nums">
              {lat}, {lng} ±{acc}m
            </span>
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-field-muted">
          <User className="h-4 w-4 shrink-0" />
          <span>{verifierName}</span>
        </div>
      </FieldFormCard>
    </div>
  );
}
