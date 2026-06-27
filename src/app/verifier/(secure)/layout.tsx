import { requireProfile } from '@/lib/auth';
import { ROLE_LABEL } from '@/lib/domain';
import { Chip } from '@/components/ui';
import FieldNav from '@/components/field/FieldNav';
import SignOutButton from '@/components/SignOutButton';

// Field PWA: always render fresh, never cache data reads.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function FieldLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(['verifier']);

  return (
    <div className="pwa mx-auto flex min-h-screen max-w-md flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ShilpSaarthi Field</p>
          <p className="text-sm font-semibold text-slate-900">{profile.full_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="blue">{ROLE_LABEL[profile.role]}</Chip>
          <SignOutButton compact />
        </div>
      </header>
      <main className="flex-1 px-4 py-4 pb-20">{children}</main>
      <FieldNav />
    </div>
  );
}
