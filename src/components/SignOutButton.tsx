'use client';

import { signOut } from '@/app/actions';
import { LogOut } from 'lucide-react';

export default function SignOutButton({ compact }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        data-testid="sign-out"
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        <LogOut className="h-4 w-4" />
        {compact ? null : 'Sign out'}
      </button>
    </form>
  );
}
