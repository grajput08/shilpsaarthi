'use client';

import { useId, useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDashboardCount } from '@/lib/format';
import { BRAND_PRIMARY } from '@/lib/theme';
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
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const gradientId = useId().replace(/:/g, '');

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

  const activePoint = points.find((p) => p.label === activeLabel);
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
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_PRIMARY} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={BRAND_PRIMARY} stopOpacity="0.03" />
                </linearGradient>
              </defs>

              <path
                d={areaPath}
                fill={`url(#${gradientId})`}
                className={cn(
                  'transition-opacity duration-200 motion-reduce:transition-none',
                  activeLabel && 'opacity-60',
                )}
              />
              <path
                d={linePath}
                fill="none"
                stroke={BRAND_PRIMARY}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                className={cn(
                  'transition-opacity duration-200 motion-reduce:transition-none',
                  activeLabel && 'opacity-70',
                )}
              />

              {activePoint ? (
                <line
                  x1={activePoint.x}
                  y1={padY}
                  x2={activePoint.x}
                  y2={padY + plotH}
                  stroke={BRAND_PRIMARY}
                  strokeOpacity={0.25}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
              ) : null}

              {points.map((p) => {
                const isActive = activeLabel === p.label;
                const isDimmed = activeLabel !== null && !isActive;

                return (
                  <g key={p.label}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="14"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveLabel(p.label)}
                      onMouseLeave={() => setActiveLabel(null)}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 6 : 3.5}
                      fill={BRAND_PRIMARY}
                      stroke="white"
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className={cn(
                        'pointer-events-none transition-all duration-200 motion-reduce:transition-none',
                        isDimmed && 'opacity-35',
                        isActive && 'drop-shadow-sm',
                      )}
                    />
                  </g>
                );
              })}

              {activePoint ? (
                <g className="pointer-events-none animate-pop-in">
                  <rect
                    x={activePoint.x - 44}
                    y={activePoint.y - 46}
                    width={88}
                    height={36}
                    rx={8}
                    fill="white"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    className="drop-shadow-sm"
                  />
                  <text
                    x={activePoint.x}
                    y={activePoint.y - 30}
                    textAnchor="middle"
                    className="fill-slate-900 text-[13px] font-bold tabular-nums"
                  >
                    {formatDashboardCount(activePoint.value)}
                  </text>
                  <text
                    x={activePoint.x}
                    y={activePoint.y - 16}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px]"
                  >
                    {activePoint.label}
                  </text>
                </g>
              ) : null}

              {points.map((p) => {
                const isActive = activeLabel === p.label;
                const isDimmed = activeLabel !== null && !isActive;

                return (
                  <text
                    key={`${p.label}-lbl`}
                    x={p.x}
                    y={height + 20}
                    textAnchor="middle"
                    className={cn(
                      'cursor-pointer text-[10px] transition-all duration-200 motion-reduce:transition-none',
                      isActive ? 'fill-brand-700 font-semibold' : 'fill-slate-500',
                      isDimmed && 'opacity-40',
                    )}
                    onMouseEnter={() => setActiveLabel(p.label)}
                    onMouseLeave={() => setActiveLabel(null)}
                  >
                    {p.label}
                  </text>
                );
              })}
            </svg>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
