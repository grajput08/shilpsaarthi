'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type LoginState } from './actions';
import { User, Mail, Lock, Eye, EyeOff, Smartphone, ChevronDown } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      data-testid="login-submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#FF671F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e2540f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF671F] focus-visible:ring-offset-1 disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Login'}
    </button>
  );
}

const fieldWrap =
  'flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-[#FF671F] focus-within:ring-1 focus-within:ring-[#FF671F]';
const fieldInput = 'w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none';

export default function LoginForm() {
  const [state, formAction] = useFormState<LoginState, FormData>(signIn, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="mt-5 space-y-3">
      {/* Role selector (UX hint; actual role comes from the account) */}
      <div className={`${fieldWrap} relative`}>
        <User className="h-4 w-4 text-slate-400" />
        <select
          name="role"
          defaultValue=""
          aria-label="Select role"
          className="w-full appearance-none bg-transparent py-2.5 text-sm text-slate-700 focus:outline-none"
        >
          <option value="">Select Role</option>
          <option value="admin">Administrator</option>
          <option value="operator">Call-Center Operator</option>
          <option value="district_officer">District Officer</option>
          <option value="verifier">Field Verifier</option>
        </select>
        <ChevronDown className="pointer-events-none h-4 w-4 text-slate-400" />
      </div>

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

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" name="remember" defaultChecked className="h-4 w-4 accent-[#FF671F]" />
          Remember me
        </label>
        <a href="mailto:support@adisetu.gov.in" className="font-medium text-[#0F7A06] hover:underline">
          Forgot Password?
        </a>
      </div>

      {state.error ? (
        <p data-testid="login-error" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Link
        href="/verifier/login"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0F7A06] px-4 py-2.5 text-sm font-semibold text-[#0F7A06] transition-colors hover:bg-[#0F7A06]/5"
      >
        <Smartphone className="h-4 w-4" />
        Login with OTP (Mobile)
      </Link>

      <p className="pt-1 text-center text-xs text-slate-500">
        Need help? <span className="font-semibold text-[#FF671F]">Contact Support</span>
      </p>
    </form>
  );
}
