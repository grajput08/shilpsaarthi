import { requireProfile } from '@/lib/auth';
import { ROLE_LABEL } from '@/lib/domain';
import { Chip } from '@/components/ui';
import AdminNav from '@/components/admin/AdminNav';
import SignOutButton from '@/components/SignOutButton';

// Authenticated dashboard: always render fresh, never cache data reads.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(['admin', 'operator', 'district_officer']);

  const brand = (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">अ</span>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-slate-900">Adi Setu</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Admin CRM</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[88rem]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 md:flex">
          <div className="px-2">{brand}</div>
          <div className="mt-6 flex-1">
            <AdminNav />
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold text-slate-800">{profile.full_name}</p>
            <div className="mt-1.5">
              <Chip tone="brand">{ROLE_LABEL[profile.role]}</Chip>
            </div>
            {profile.state ? (
              <p className="mt-1.5 text-xs text-slate-500 [text-wrap:pretty]">
                Scope: {profile.district ? `${profile.district}, ` : ''}
                {profile.state}
              </p>
            ) : null}
            <div className="mt-2">
              <SignOutButton portal="admin" />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur md:hidden">
            {brand}
            <SignOutButton portal="admin" compact />
          </header>
          <div className="border-b border-slate-200 bg-white px-2 py-2 md:hidden">
            <AdminNav />
          </div>
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
