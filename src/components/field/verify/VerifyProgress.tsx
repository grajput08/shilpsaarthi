'use client';

import { cn } from '@/lib/cn';

export const VERIFY_STEPS = [
  { key: 'identity', label: 'Identity', labelHi: 'पहचान' },
  { key: 'address', label: 'Address', labelHi: 'पता' },
  { key: 'craft', label: 'Craft', labelHi: 'शिल्प' },
  { key: 'products', label: 'Products', labelHi: 'उत्पाद' },
  { key: 'docs', label: 'Docs', labelHi: 'दस्तावेज़' },
  { key: 'submit', label: 'Submit', labelHi: 'जमा' },
] as const;

export type VerifyStepKey = (typeof VERIFY_STEPS)[number]['key'];

export default function VerifyProgress({ current }: { current: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1" role="list" aria-label="Verification progress">
        {VERIFY_STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.key} className="flex-1" role="listitem">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-colors duration-300 ease-out',
                  done ? 'bg-india-500' : active ? 'bg-field-accent' : 'bg-stone-200/80',
                )}
                aria-hidden
              />
              <p
                className={cn(
                  'mt-1.5 truncate text-[10px] font-medium',
                  active ? 'text-field-accent' : done ? 'text-india-700' : 'text-field-muted',
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-field-muted" data-testid="verify-step-indicator">
        Step {current + 1} / {VERIFY_STEPS.length}
      </p>
    </div>
  );
}
