'use client';

import { signOutAdmin, signOutVerifier } from '@/app/actions';
import { LogOut } from 'lucide-react';
import type { AuthArea } from '@/lib/auth/area';

export default function SignOutButton({ portal, compact }: { portal: AuthArea; compact?: boolean }) {
  const action = portal === 'admin' ? signOutAdmin : signOutVerifier;

  return (
    <form action={action}>
      <button
        type="submit"
        data-testid={`sign-out-${portal}`}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        <LogOut className="h-4 w-4" />
        {compact ? null : 'Sign out'}
      </button>
    </form>
  );
}
