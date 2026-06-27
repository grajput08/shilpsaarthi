import { Card, CardHeader, CardBody } from '@/components/ui';
import { formatDashboardCount } from '@/lib/format';
import { BRAND_PRIMARY, INDIA_GREEN } from '@/lib/theme';
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
  tone?: 'green' | 'brand';
  max?: number;
  emptyLabel?: string;
}) {
  const rows = data.slice(0, maxItems);
  const peak = Math.max(1, ...rows.map((d) => d.value));
  const fill = tone === 'green' ? INDIA_GREEN : BRAND_PRIMARY;

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
                <div
                  key={d.label}
                  className="group flex h-full min-w-0 flex-1 cursor-default flex-col items-center gap-2"
                >
                  <div className="relative flex w-full flex-1 items-end">
                    <span className="pointer-events-none absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white opacity-0 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transition-none">
                      {formatDashboardCount(d.value)}
                    </span>
                    <div
                      className="mx-auto w-full max-w-[2.5rem] rounded-t-md transition-all duration-200 group-hover:-translate-y-1 group-hover:brightness-110 group-hover:shadow-md motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                      style={{
                        height: `${Math.max(8, (d.value / peak) * 100)}%`,
                        backgroundColor: fill,
                      }}
                    />
                  </div>
                  <span className="max-w-full truncate text-center text-[10px] leading-tight text-slate-500 transition-colors duration-200 group-hover:font-medium group-hover:text-slate-800 motion-reduce:transition-none">
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
