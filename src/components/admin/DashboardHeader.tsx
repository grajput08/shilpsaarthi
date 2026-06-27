export default function DashboardHeader() {
  return (
    <header className="space-y-3">
      <p className="text-xs text-slate-400">Home / Dashboard</p>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Ministry dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Demo data • updates live as artisans are onboarded in this session
        </p>
      </div>
    </header>
  );
}
