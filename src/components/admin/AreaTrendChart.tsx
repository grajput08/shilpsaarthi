import { Card, CardHeader, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { BarDatum } from '@/components/admin/BarList';
import {
  DASHBOARD_BODY,
  DASHBOARD_CARD,
  DASHBOARD_CHART_AREA,
  DASHBOARD_HEADER,
} from '@/components/admin/dashboard-layout';

export default function AreaTrendChart({
  title,
  subtitle,
  data,
  emptyLabel = 'No data yet',
}: {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  emptyLabel?: string;
}) {
  const width = 520;
  const height = 200;
  const padX = 8;
  const padY = 16;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const peak = Math.max(1, ...data.map((d) => d.value));

  const points =
    data.length === 0
      ? []
      : data.map((d, i) => {
          const x = padX + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
          const y = padY + plotH - (d.value / peak) * plotH;
          return { x, y, label: d.label, value: d.value };
        });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points.at(-1)!.x} ${padY + plotH} L ${points[0].x} ${padY + plotH} Z`
      : '';

  return (
    <Card className={DASHBOARD_CARD}>
      <CardHeader title={title} subtitle={subtitle} className={DASHBOARD_HEADER} />
      <CardBody className={DASHBOARD_BODY}>
        <div className={cn(DASHBOARD_CHART_AREA, 'justify-center')}>
          {data.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-slate-400">{emptyLabel}</p>
          ) : (
            <svg viewBox={`0 0 ${width} ${height + 28}`} className="h-full w-full" role="img" aria-label={title}>
              <defs>
                <linearGradient id="onboard-area-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff671f" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ff671f" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#onboard-area-fill)" />
              <path
                d={linePath}
                fill="none"
                stroke="#ff671f"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((p) => (
                <circle key={p.label} cx={p.x} cy={p.y} r="3.5" fill="#ff671f" />
              ))}
              {points.map((p) => (
                <text
                  key={`${p.label}-lbl`}
                  x={p.x}
                  y={height + 20}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {p.label}
                </text>
              ))}
            </svg>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
