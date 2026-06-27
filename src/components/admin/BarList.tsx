import { Card, CardHeader, CardBody } from '@/components/ui';

export interface BarDatum {
  label: string;
  value: number;
}

const TONES = {
  saffron: 'bg-brand-500',
  green: 'bg-india-500',
  slate: 'bg-slate-400',
} as const;

export default function BarList({
  title,
  subtitle,
  data,
  tone = 'saffron',
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
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody className="space-y-2.5">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>
        ) : (
          rows.map((d) => (
            <div key={d.label} className="text-sm">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-slate-600 [text-wrap:pretty]">{d.label}</span>
                <span className="font-semibold tabular-nums text-slate-800">{d.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${TONES[tone]}`}
                  style={{ width: `${Math.max(3, (d.value / peak) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
