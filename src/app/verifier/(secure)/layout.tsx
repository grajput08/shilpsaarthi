import { requireProfile } from '@/lib/auth';
import { ROLE_LABEL } from '@/lib/domain';
import { Chip } from '@/components/ui';
import FieldNav from '@/components/field/FieldNav';
import { AdiSetuLogo } from '@/components/brand/AdiSetuBrand';
import SignOutButton from '@/components/SignOutButton';

// Field PWA: always render fresh, never cache data reads.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function FieldLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(['verifier']);

  return (
    <div className="pwa mx-auto flex min-h-screen max-w-md flex-col bg-field-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-field-border/80 bg-field-surface/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <AdiSetuLogo className="h-7 w-7 shrink-0 text-brand-600" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-field-accent">ShilpSaarthi Field</p>
            <p className="text-sm font-semibold tracking-tight text-field-ink">{profile.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="amber">{ROLE_LABEL[profile.role]}</Chip>
          <SignOutButton portal="verifier" compact />
        </div>
      </header>
      <main className="flex-1 px-4 py-5 pb-[calc(80px+env(safe-area-inset-bottom))]">{children}</main>
      <FieldNav />
    </div>
  );
}
