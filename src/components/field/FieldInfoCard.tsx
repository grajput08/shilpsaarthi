import { cn } from '@/lib/cn';

export function FieldInfoCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-field-border/80 bg-field-surface p-4 shadow-card', className)}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-field-muted">{title}</p>
      {children}
    </div>
  );
}

export function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm [text-wrap:pretty]">
      <span className="shrink-0 text-field-muted">{label}</span>
      <span className="text-right font-semibold text-field-ink">{value}</span>
    </div>
  );
}
