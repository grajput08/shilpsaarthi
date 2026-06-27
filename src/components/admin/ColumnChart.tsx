import { Card, CardHeader, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { BarDatum } from '@/components/admin/BarList';
import {
  DASHBOARD_BODY,
  DASHBOARD_CARD,
  DASHBOARD_CHART_AREA,
  DASHBOARD_HEADER,
} from '@/components/admin/dashboard-layout';

export default function ColumnChart({
  title,
  subtitle,
  data,
  tone = 'green',
  max: maxItems = 8,
  emptyLabel = 'No data yet',
}: {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  tone?: 'green' | 'navy';
  max?: number;
  emptyLabel?: string;
}) {
  const rows = data.slice(0, maxItems);
  const peak = Math.max(1, ...rows.map((d) => d.value));
  const fill = tone === 'green' ? '#0f7a06' : '#1a3b70';

  return (
    <Card className={DASHBOARD_CARD}>
      <CardHeader title={title} subtitle={subtitle} className={DASHBOARD_HEADER} />
      <CardBody className={DASHBOARD_BODY}>
        <div className={DASHBOARD_CHART_AREA}>
          {rows.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-slate-400">{emptyLabel}</p>
          ) : (
            <div className="flex h-full items-end justify-between gap-2 px-1 pb-1">
              {rows.map((d) => (
                <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="mx-auto w-full max-w-[2.5rem] rounded-t-md"
                      style={{
                        height: `${Math.max(8, (d.value / peak) * 100)}%`,
                        backgroundColor: fill,
                      }}
                      title={`${d.label}: ${d.value}`}
                    />
                  </div>
                  <span className="max-w-full truncate text-center text-[10px] leading-tight text-slate-500">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
