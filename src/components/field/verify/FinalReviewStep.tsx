import { FormRow, Input, Select, Textarea } from '@/components/ui';
import { VERIFICATION_DECISION, enumOptions, type VerificationDecision } from '@/lib/domain';
import { FieldFormCard } from '@/components/field/verify/VerifyFormBits';
import VerificationChecklist from '@/components/field/verify/VerificationChecklist';
import { cn } from '@/lib/cn';
import type { VerifyErrors } from '@/app/verifier/(secure)/artisans/[id]/verify/validators';

export default function FinalReviewStep({
  checklist,
  decision,
  onDecisionChange,
  reason,
  onReasonChange,
  notes,
  onNotesChange,
  marketReady,
  onMarketReadyChange,
  hasBlocking,
  errors,
  needsReason,
  setRef,
  markTouched,
  shaking,
}: {
  checklist: { label: string; done: boolean; partial?: boolean }[];
  decision: '' | VerificationDecision;
  onDecisionChange: (d: '' | VerificationDecision) => void;
  reason: string;
  onReasonChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  marketReady: boolean;
  onMarketReadyChange: (v: boolean) => void;
  hasBlocking: boolean;
  errors: VerifyErrors;
  needsReason: boolean;
  setRef: (field: 'decision' | 'reason') => (el: HTMLInputElement | HTMLSelectElement | null) => void;
  markTouched: (field: 'decision' | 'reason') => void;
  shaking: Set<string>;
}) {
  const eligibleMarketReady = decision === 'verified' && !hasBlocking;

  return (
    <div className="space-y-4">
      <VerificationChecklist items={checklist} />

      <FieldFormCard className="space-y-3">
        <FormRow
          label="Final decision"
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
            invalid={!!errors.decision}
            value={decision}
            onChange={(e) => {
              onDecisionChange(e.target.value as '' | VerificationDecision);
              markTouched('decision');
            }}
            onBlur={() => markTouched('decision')}
          >
            <option value="">Select final status…</option>
            {enumOptions(VERIFICATION_DECISION).map((d) => (
              <option key={d} value={d}>
                {VERIFICATION_DECISION[d].label}
              </option>
            ))}
          </Select>
        </FormRow>

        {hasBlocking ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800" data-testid="blocking-warning">
            Some items are rejected/cancelled — “Fully Verified” needs an admin override.
          </p>
        ) : null}

        {decision && decision !== 'verified' ? (
          <div className={cn(shaking.has('reason') && 'animate-shake')}>
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
                ref={setRef('reason') as never}
                data-testid="verify-reason"
                invalid={!!errors.reason}
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                onBlur={() => markTouched('reason')}
                placeholder="Brief reason for this decision"
              />
            </FormRow>
          </div>
        ) : null}

        <FormRow label="Verifier notes" htmlFor="notes">
          <Textarea
            id="notes"
            data-testid="verify-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Artisan present, craft confirmed with live demo…"
            rows={3}
          />
        </FormRow>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-field-ink">
          <input
            type="checkbox"
            data-testid="verify-market-ready"
            className="h-5 w-5 rounded accent-india-600"
            checked={marketReady}
            onChange={(e) => onMarketReadyChange(e.target.checked)}
          />
          Market readiness assessed
        </label>
      </FieldFormCard>

      {eligibleMarketReady ? (
        <div className="flex items-center gap-2 rounded-xl bg-india-50 px-3.5 py-2.5 text-sm font-medium text-india-800 ring-1 ring-inset ring-india-200">
          <span aria-hidden>🏅</span>
          Eligible for Market-Ready on sync.
        </div>
      ) : null}
    </div>
  );
}
