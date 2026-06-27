'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDashboardCount } from '@/lib/format';
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
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const slices = data.filter((d) => d.value > 0);
  const total = slices.reduce((s, d) => s + d.value, 0);
  const activeSlice = slices.find((d) => d.label === activeLabel);
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
      {slices.map((d) => {
        const isActive = activeLabel === d.label;
        const isDimmed = activeLabel !== null && !isActive;

        return (
          <li
            key={d.label}
            className={cn(
              'cursor-pointer rounded-md px-1.5 py-0.5 transition-all duration-200 motion-reduce:transition-none',
              legend === 'bottom'
                ? 'flex items-center gap-2 text-sm'
                : 'flex items-center justify-between gap-3 text-sm',
              isActive && 'bg-slate-50',
              isDimmed && 'opacity-40',
            )}
            onMouseEnter={() => setActiveLabel(d.label)}
            onMouseLeave={() => setActiveLabel(null)}
          >
            <span
              className={cn('flex items-center gap-2', legend === 'bottom' ? 'font-medium' : 'text-slate-600')}
              style={legend === 'bottom' ? { color: d.color } : undefined}
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 motion-reduce:transition-none',
                  isActive && 'scale-125',
                )}
                style={{ backgroundColor: d.color }}
              />
              {d.label}
            </span>
            {legend === 'side' ? (
              <span className={cn('font-semibold tabular-nums text-slate-800', isActive && 'text-slate-900')}>
                {formatDashboardCount(d.value)}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  const donutSvg = (
    <div className="relative shrink-0">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90" role="img" aria-label={title}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {slices.map((d) => {
          const len = (d.value / total) * circ;
          const isActive = activeLabel === d.label;
          const isDimmed = activeLabel !== null && !isActive;
          const el = (
            <circle
              key={d.label}
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={isActive ? 22 : 18}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-acc}
              className={cn(
                'cursor-pointer transition-all duration-200 motion-reduce:transition-none',
                isDimmed && 'opacity-35',
              )}
              onMouseEnter={() => setActiveLabel(d.label)}
              onMouseLeave={() => setActiveLabel(null)}
            />
          );
          acc += len;
          return el;
        })}
        {showCenter && !activeSlice ? (
          <g className="rotate-90" style={{ transformOrigin: '80px 80px' }}>
            <text x="80" y="74" textAnchor="middle" className="fill-slate-900 text-[26px] font-bold tabular-nums">
              {formatDashboardCount(total)}
            </text>
            <text x="80" y="94" textAnchor="middle" className="fill-slate-400 text-[11px] uppercase tracking-wide">
              {centerLabel}
            </text>
          </g>
        ) : null}
      </svg>

      {activeSlice ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-pop-in rounded-xl bg-white px-3 py-2 text-center shadow-pop ring-1 ring-slate-200/80">
            <p className="text-xs font-semibold" style={{ color: activeSlice.color }}>
              {activeSlice.label}
            </p>
            <p className="text-xl font-bold tabular-nums text-slate-900">{formatDashboardCount(activeSlice.value)}</p>
            <p className="text-[11px] tabular-nums text-slate-500">
              {Math.round((activeSlice.value / total) * 100)}% of total
            </p>
          </div>
        </div>
      ) : null}
    </div>
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
