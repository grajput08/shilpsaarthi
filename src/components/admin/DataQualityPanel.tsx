import { Card, CardHeader, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  DASHBOARD_BODY,
  DASHBOARD_CARD,
  DASHBOARD_CHART_AREA,
  DASHBOARD_HEADER,
} from '@/components/admin/dashboard-layout';

export interface QualityStat {
  value: React.ReactNode;
  label: string;
  tone: 'green' | 'brand' | 'red';
}

const toneClasses = {
  green: 'text-india-600',
  brand: 'text-brand-700',
  red: 'text-red-600',
} as const;

export default function DataQualityPanel({ title, stats }: { title: string; stats: QualityStat[] }) {
  return (
    <Card className={DASHBOARD_CARD}>
      <CardHeader title={title} className={DASHBOARD_HEADER} />
      <CardBody className={DASHBOARD_BODY}>
        <div className={cn(DASHBOARD_CHART_AREA, 'justify-between gap-3')}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-1 flex-col justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
            >
              <p className={`text-2xl font-bold tabular-nums leading-none ${toneClasses[s.tone]}`}>{s.value}</p>
              <p className="mt-1.5 text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
