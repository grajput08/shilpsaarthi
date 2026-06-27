import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';
import { DASHBOARD_CARD } from '@/components/admin/dashboard-layout';

export default function DashboardMetric({
  icon,
  value,
  label,
  hint,
  className,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(DASHBOARD_CARD, 'p-5', className)}>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
        {icon}
      </span>
      <p className="mt-4 text-[2rem] font-bold leading-none tabular-nums tracking-tight text-brand-900">{value}</p>
      <p className="mt-1.5 text-sm text-slate-500">{label}</p>
      {hint ? (
        <p className="mt-auto pt-3 text-xs font-medium text-india-600">{hint}</p>
      ) : (
        <span className="mt-auto block pt-3" aria-hidden="true" />
      )}
    </Card>
  );
}
