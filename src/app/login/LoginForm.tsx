'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type LoginState } from './actions';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      data-testid="login-submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Login'}
    </button>
  );
}

const fieldWrap =
  'flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-brand-600 focus-within:ring-1 focus-within:ring-brand-600';
const fieldInput = 'w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none';

export default function LoginForm() {
  const [state, formAction] = useFormState<LoginState, FormData>(signIn, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <div className={fieldWrap}>
        <Mail className="h-4 w-4 text-slate-400" />
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="Username / Email"
          data-testid="login-email"
          defaultValue="admin@shilpsaarthi.test"
          className={fieldInput}
        />
      </div>

      <div className={fieldWrap}>
        <Lock className="h-4 w-4 text-slate-400" />
        <input
          id="password"
          name="password"
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Password"
          data-testid="login-password"
          defaultValue="Password123!"
          className={fieldInput}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" name="remember" defaultChecked className="h-4 w-4 accent-brand-600" />
        Remember me
      </label>

      {state.error ? (
        <p data-testid="login-error" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
