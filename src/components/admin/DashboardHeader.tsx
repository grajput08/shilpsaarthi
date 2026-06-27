import { Chip } from '@/components/ui';

export default function DashboardHeader() {
  return (
    <header className="space-y-3">
      <p className="text-xs text-slate-400">Home / Dashboard</p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Ministry dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Demo data • updates live as artisans are onboarded in this session
          </p>
        </div>
        <Chip tone="brand" className="shrink-0 px-3 py-1 text-xs">
          Demo login: any officer
        </Chip>
      </div>
    </header>
  );
}
