'use client';

import type { ReactNode } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { fieldLogin, type FieldLoginState } from './actions';
import { cn } from '@/lib/cn';

const fieldWrap =
  'flex items-center gap-2 rounded-xl border border-field-border bg-field-surface px-3 focus-within:border-field-accent focus-within:ring-2 focus-within:ring-field-accent/20';
const fieldInput =
  'w-full bg-transparent py-3 text-base text-field-ink placeholder:text-field-muted/70 focus:outline-none';

function SubmitButton({ stage }: Readonly<{ stage: 'request' | 'verify' }>) {
  const { pending } = useFormStatus();

  let label: ReactNode = 'Verify & sign in';
  if (pending) label = 'Please wait…';
  else if (stage === 'request') {
    label = (
      <>
        Send OTP
        <ArrowRight className="h-4 w-4" aria-hidden />
      </>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      data-testid={stage === 'request' ? 'otp-send' : 'otp-verify'}
      className={cn(
        'flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm',
        'bg-field-accent transition-[background-color,transform] duration-150 ease-out hover:bg-field-accentHover',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 motion-reduce:active:scale-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-field-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-field-bg',
      )}
    >
      {label}
    </button>
  );
}

export default function FieldLoginForm() {
  const [state, formAction] = useFormState<FieldLoginState, FormData>(fieldLogin, { stage: 'request' });

  return (
    <div className="rounded-2xl border border-field-border/80 bg-field-surface p-6 shadow-card">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-field-ink">Field Verifier</h1>
        <p className="mt-1 text-sm text-field-muted">Sign in with your email to receive a one-time code</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="intent" value={state.stage === 'verify' ? 'verify' : 'request'} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-field-muted">
            Email or Verifier ID
          </label>
          <div className={fieldWrap}>
            <Mail className="h-4 w-4 shrink-0 text-field-muted" aria-hidden />
            <input
              id="email"
              name="email"
              type="email"
              data-testid="otp-email"
              autoComplete="username"
              placeholder="verifier@shilpsaarthi.test"
              defaultValue={state.email ?? 'verifier@shilpsaarthi.test'}
              readOnly={state.stage === 'verify'}
              className={fieldInput}
            />
          </div>
        </div>

        {state.stage === 'verify' ? (
          <>
            {state.devCode ? (
              <p
                className="rounded-xl border border-field-border bg-field-bg px-3 py-2.5 text-sm text-field-ink"
                data-testid="otp-devcode"
              >
                Demo OTP sent. Use code <strong className="text-field-accent">{state.devCode}</strong>.
              </p>
            ) : null}
            <div>
              <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-field-muted">
                One-time code
              </label>
              <div className={fieldWrap}>
                <input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  maxLength={6}
                  data-testid="otp-code"
                  placeholder="6-digit code"
                  defaultValue="123456"
                  className={cn(fieldInput, 'pl-1')}
                />
              </div>
            </div>
          </>
        ) : null}

        {state.error ? (
          <p
            data-testid="otp-error"
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <SubmitButton stage={state.stage} />
      </form>
    </div>
  );
}
