'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { fieldLogin, type FieldLoginState } from './actions';
import { Button, Card, CardBody, FormRow, Input } from '@/components/ui';

function SubmitButton({ stage }: { stage: 'request' | 'verify' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" block disabled={pending} data-testid={stage === 'request' ? 'otp-send' : 'otp-verify'}>
      {pending ? 'Please wait…' : stage === 'request' ? 'Send code' : 'Verify & sign in'}
    </Button>
  );
}

export default function FieldLoginForm() {
  const [state, formAction] = useFormState<FieldLoginState, FormData>(fieldLogin, { stage: 'request' });

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="intent" value={state.stage === 'verify' ? 'verify' : 'request'} />
          <FormRow label="Email / Employee ID" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              data-testid="otp-email"
              autoComplete="username"
              defaultValue={state.email ?? 'verifier@shilpsaarthi.test'}
              readOnly={state.stage === 'verify'}
            />
          </FormRow>

          {state.stage === 'verify' ? (
            <>
              {state.devCode ? (
                <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700" data-testid="otp-devcode">
                  Demo OTP sent. Use code <strong>{state.devCode}</strong>.
                </p>
              ) : null}
              <FormRow label="One-time code" htmlFor="code" required>
                <Input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  maxLength={6}
                  data-testid="otp-code"
                  placeholder="6-digit code"
                  defaultValue="123456"
                />
              </FormRow>
            </>
          ) : null}

          {state.error ? (
            <p data-testid="otp-error" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <SubmitButton stage={state.stage} />
        </form>
      </CardBody>
    </Card>
  );
}
