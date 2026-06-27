import { Card, CardHeader, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  DASHBOARD_BODY,
  DASHBOARD_CARD,
  DASHBOARD_CHART_AREA,
  DASHBOARD_HEADER,
} from '@/components/admin/dashboard-layout';

export interface BarDatum {
  label: string;
  value: number;
}

const TONES = {
  brand: 'bg-brand-500',
  green: 'bg-india-500',
  slate: 'bg-slate-400',
} as const;

export default function BarList({
  title,
  subtitle,
  data,
  tone = 'brand',
  max: maxItems = 6,
  emptyLabel = 'No data yet',
}: {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  tone?: keyof typeof TONES;
  max?: number;
  emptyLabel?: string;
}) {
  const rows = data.slice(0, maxItems);
  const peak = Math.max(1, ...rows.map((d) => d.value));
  return (
    <Card className={DASHBOARD_CARD}>
      <CardHeader title={title} subtitle={subtitle} className={DASHBOARD_HEADER} />
      <CardBody className={DASHBOARD_BODY}>
        <div className={cn(DASHBOARD_CHART_AREA, 'overflow-y-auto')}>
          {rows.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-slate-400">{emptyLabel}</p>
          ) : (
            <div className="space-y-3">
              {rows.map((d) => (
                <div
                  key={d.label}
                  className="group grid cursor-default grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-lg px-1 py-0.5 text-sm transition-colors duration-200 hover:bg-slate-50/80 motion-reduce:transition-none"
                >
                  <span className="truncate text-slate-600 transition-colors duration-200 [text-wrap:pretty] group-hover:text-slate-900 motion-reduce:transition-none">
                    {d.label}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-800 transition-colors duration-200 group-hover:text-slate-950 motion-reduce:transition-none">
                    {d.value}
                  </span>
                  <div className="col-span-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full origin-left rounded-full transition-all duration-200 motion-reduce:transition-none',
                        TONES[tone],
                        'group-hover:scale-y-125 group-hover:brightness-110 group-hover:shadow-sm',
                      )}
                      style={{ width: `${Math.max(3, (d.value / peak) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
