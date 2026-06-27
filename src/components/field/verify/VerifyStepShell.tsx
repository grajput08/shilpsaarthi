'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import VerifyProgress from './VerifyProgress';

export default function VerifyStepShell({
  artisanId,
  artisanName,
  title,
  titleHi,
  stepIndex,
  savedAt,
  onBack,
  onContinue,
  continueLabel = 'Save & Continue',
  continueDisabled,
  continueLoading,
  continueTestId = 'verify-continue',
  continueClassName,
  children,
}: {
  artisanId: string;
  artisanName: string;
  title: string;
  titleHi?: string;
  stepIndex: number;
  savedAt: string | null;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  continueTestId?: string;
  continueClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 -mt-5 flex min-h-[calc(100vh-8rem)] flex-col">
      <header className="border-b border-field-border/60 bg-field-surface/90 px-4 pb-4 pt-2 backdrop-blur-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-field-muted transition-colors duration-150 hover:text-field-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            {stepIndex === 0 ? 'Profile' : 'Back'}
          </button>
          {savedAt ? (
            <span
              className="rounded-full bg-india-50 px-2.5 py-1 text-xs font-medium text-india-700 ring-1 ring-inset ring-india-200"
              data-testid="draft-saved"
            >
              Draft saved
            </span>
          ) : null}
        </div>
        <h1 className="text-lg font-bold tracking-tight text-field-ink [text-wrap:balance]">{artisanName}</h1>
        <p className="mt-0.5 text-sm text-field-muted">
          {titleHi ? `${titleHi} · ` : ''}
          {title} · Step {stepIndex + 1} / 6
        </p>
        <div className="mt-4">
          <VerifyProgress current={stepIndex} />
        </div>
      </header>

      <div className="flex-1 space-y-4 px-4 py-4">{children}</div>

      <div className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-10 border-t border-field-border/60 bg-field-bg/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          data-testid={continueTestId}
          disabled={continueDisabled || continueLoading}
          onClick={onContinue}
          className={cn(
            'flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold text-white shadow-sm',
            'transition-[background-color,transform,opacity] duration-150 ease-out',
            'hover:bg-field-accentHover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:active:scale-100',
            continueClassName ?? 'bg-field-accent hover:bg-field-accentHover',
          )}
        >
          {continueLoading ? 'Saving…' : continueLabel}
          {!continueLoading ? <ArrowRight className="h-5 w-5" /> : null}
        </button>
        {stepIndex === 0 ? (
          <Link
            href={`/verifier/artisans/${artisanId}`}
            className="mt-2 block text-center text-xs text-field-muted hover:text-field-ink"
          >
            Back to profile
          </Link>
        ) : null}
      </div>
    </div>
  );
}
