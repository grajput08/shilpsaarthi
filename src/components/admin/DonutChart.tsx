import { Card, CardHeader, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  DASHBOARD_BODY,
  DASHBOARD_CARD,
  DASHBOARD_CHART_AREA,
  DASHBOARD_HEADER,
} from '@/components/admin/dashboard-layout';

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

/**
 * Minimal, dependency-free donut chart (pure SVG). Renders proportional arcs
 * with a centred total and a compact legend.
 */
export default function DonutChart({
  title,
  subtitle,
  data,
  centerLabel = 'Total',
  legend = 'side',
  showCenter = true,
}: {
  title: string;
  subtitle?: string;
  data: DonutDatum[];
  centerLabel?: string;
  legend?: 'side' | 'bottom';
  showCenter?: boolean;
}) {
  const slices = data.filter((d) => d.value > 0);
  const total = slices.reduce((s, d) => s + d.value, 0);
  const r = 56;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  const legendList = (
    <ul
      className={
        legend === 'bottom'
          ? 'flex flex-wrap items-center justify-center gap-x-5 gap-y-2'
          : 'min-w-[8rem] flex-1 space-y-1.5'
      }
    >
      {slices.map((d) => (
        <li
          key={d.label}
          className={
            legend === 'bottom'
              ? 'flex items-center gap-2 text-sm text-slate-600'
              : 'flex items-center justify-between gap-3 text-sm'
          }
        >
          <span className="flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </span>
          {legend === 'side' ? <span className="font-semibold tabular-nums text-slate-800">{d.value}</span> : null}
        </li>
      ))}
    </ul>
  );

  const donutSvg = (
    <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label={title}>
      <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
      {slices.map((d) => {
        const len = (d.value / total) * circ;
        const el = (
          <circle
            key={d.label}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth="18"
            strokeLinecap="butt"
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-acc}
          />
        );
        acc += len;
        return el;
      })}
      {showCenter ? (
        <g className="rotate-90" style={{ transformOrigin: '80px 80px' }}>
          <text x="80" y="74" textAnchor="middle" className="fill-slate-900 text-[26px] font-bold tabular-nums">
            {total}
          </text>
          <text x="80" y="94" textAnchor="middle" className="fill-slate-400 text-[11px] uppercase tracking-wide">
            {centerLabel}
          </text>
        </g>
      ) : null}
    </svg>
  );

  return (
    <Card className={DASHBOARD_CARD}>
      <CardHeader title={title} subtitle={subtitle} className={DASHBOARD_HEADER} />
      <CardBody className={DASHBOARD_BODY}>
        {total === 0 ? (
          <div className={cn(DASHBOARD_CHART_AREA, 'items-center justify-center')}>
            <p className="text-sm text-slate-400">No data yet</p>
          </div>
        ) : (
          <div
            className={cn(
              DASHBOARD_CHART_AREA,
              legend === 'bottom' ? 'items-center justify-center gap-5' : 'flex-row flex-wrap items-center justify-center gap-6',
            )}
          >
            {donutSvg}
            {legendList}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
