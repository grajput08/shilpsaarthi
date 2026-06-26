'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type LoginState } from './actions';
import { Button, Card, CardBody, FormRow, Input } from '@/components/ui';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" block disabled={pending} data-testid="login-submit">
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState<LoginState, FormData>(signIn, {});
  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-4">
          <FormRow label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" autoComplete="username" data-testid="login-email" defaultValue="admin@shilpsaarthi.test" />
          </FormRow>
          <FormRow label="Password" htmlFor="password" required>
            <Input id="password" name="password" type="password" autoComplete="current-password" data-testid="login-password" defaultValue="Password123!" />
          </FormRow>
          {state.error ? (
            <p data-testid="login-error" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <SubmitButton />
        </form>
      </CardBody>
    </Card>
  );
}
