import { requireProfile } from '@/lib/auth';
import { ROLE_LABEL } from '@/lib/domain';

// Authenticated dashboard: always render fresh, never cache data reads.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { Chip } from '@/components/ui';
import AdminNav from '@/components/admin/AdminNav';
import SignOutButton from '@/components/SignOutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(['admin', 'operator', 'district_officer']);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 md:flex">
          <div className="px-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ShilpSaarthi</p>
            <p className="text-sm font-bold text-slate-900">Admin CRM</p>
          </div>
          <div className="mt-5 flex-1">
            <AdminNav />
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="px-2 text-sm font-semibold text-slate-800">{profile.full_name}</p>
            <div className="mt-1 px-2">
              <Chip tone="blue">{ROLE_LABEL[profile.role]}</Chip>
            </div>
            {profile.state ? (
              <p className="mt-1 px-2 text-xs text-slate-500">
                Scope: {profile.district ? `${profile.district}, ` : ''}
                {profile.state}
              </p>
            ) : null}
            <div className="mt-2">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 md:hidden">
            <p className="text-sm font-bold text-slate-900">ShilpSaarthi Admin</p>
            <SignOutButton compact />
          </header>
          <div className="md:hidden">
            <div className="border-b border-slate-200 bg-white px-2 py-2">
              <AdminNav />
            </div>
          </div>
          <main className="px-5 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
