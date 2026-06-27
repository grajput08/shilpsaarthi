import { requireProfile } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import AdminSidebar from '@/components/admin/AdminSidebar';
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
        <AdminSidebar profile={profile} />

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
