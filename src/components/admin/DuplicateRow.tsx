'use client';

import Link from 'next/link';
import { useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, MapPin, Phone } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Chip } from '@/components/ui';
import { ArtisanStatusBadge } from '@/components/badges';
import { resolveDuplicate } from '@/app/admin/actions';
import { type ArtisanStatus } from '@/lib/domain';
import { maskPhone } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Mini {
  id: string;
  full_name: string;
  phone: string | null;
  village: string | null;
  district: string | null;
  artisan_code: string | null;
  status: string;
}

const SIGNAL_META: Record<string, { label: string; tone: 'amber' | 'brand' | 'purple' | 'teal' | 'saffron' }> = {
  same_phone: { label: 'Same phone', tone: 'amber' },
  same_name_village: { label: 'Same name & village', tone: 'brand' },
  same_id_ref: { label: 'Same ID reference', tone: 'purple' },
  same_gps_name: { label: 'Same GPS & name', tone: 'teal' },
  same_group: { label: 'Same group', tone: 'saffron' },
};

function signalMeta(signal: string) {
  return SIGNAL_META[signal] ?? { label: signal.replace(/_/g, ' '), tone: 'brand' as const };
}

function normalize(value: string | null) {
  return (value ?? '').trim().toLowerCase();
}

export default function DuplicateRow({
  candidateId,
  signal,
  score,
  left,
  right,
}: {
  candidateId: string;
  signal: string;
  score: number;
  left: Mini;
  right: Mini;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const meta = signalMeta(signal);

  const matches = {
    phone: normalize(left.phone) !== '' && normalize(left.phone) === normalize(right.phone),
    village: normalize(left.village) !== '' && normalize(left.village) === normalize(right.village),
    district: normalize(left.district) !== '' && normalize(left.district) === normalize(right.district),
    name: normalize(left.full_name) === normalize(right.full_name),
  };

  function resolve(decision: 'merge' | 'dismiss', keep?: Mini, dup?: Mini) {
    setMsg(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('candidate_id', candidateId);
      fd.set('decision', decision);
      if (decision === 'merge' && keep && dup) {
        fd.set('master_artisan_id', keep.id);
        fd.set('match_artisan_id', dup.id);
      }
      const res = await resolveDuplicate(fd);
      if (res.ok) {
        setMsg({
          text: decision === 'merge' ? 'Records merged successfully.' : 'Marked as not a duplicate.',
          ok: true,
        });
        router.refresh();
      } else {
        setMsg({ text: res.error ?? 'Action failed. Try again.', ok: false });
      }
    });
  }

  return (
    <Card data-testid="duplicate-row" className="overflow-hidden">
      <CardHeader
        title="Potential duplicate"
        subtitle={`Match confidence ${Math.round(score)}%`}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Chip tone={meta.tone}>{meta.label}</Chip>
            {msg ? (
              <Chip tone={msg.ok ? 'green' : 'red'} className="max-w-[14rem] truncate">
                {msg.text}
              </Chip>
            ) : null}
          </div>
        }
      />
      <CardBody className="pt-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <RecordSide label="Record A" mini={left} matches={matches} />
          <div className="flex items-center justify-center lg:flex-col lg:px-1">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="sr-only">Compare records</span>
          </div>
          <RecordSide label="Record B" mini={right} matches={matches} />
        </div>

        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <Button
            variant="primary"
            disabled={pending}
            loading={pending}
            data-testid="dup-keep-left"
            onClick={() => resolve('merge', left, right)}
            className="w-full px-3 py-2 text-xs sm:text-sm"
          >
            Keep {left.full_name}
          </Button>
          <Button
            variant="primary"
            disabled={pending}
            loading={pending}
            data-testid="dup-keep-right"
            onClick={() => resolve('merge', right, left)}
            className="w-full px-3 py-2 text-xs sm:text-sm sm:col-start-2 lg:col-start-3"
          >
            Keep {right.full_name}
          </Button>
          <div className="flex justify-center sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <Button
              variant="secondary"
              disabled={pending}
              data-testid="dup-dismiss"
              onClick={() => resolve('dismiss')}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-saffron-50 text-saffron-700 ring-1 ring-inset ring-saffron-200 hover:bg-saffron-100 hover:text-saffron-800"
            >
              Not a duplicate
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function RecordSide({
  label,
  mini,
  matches,
}: {
  label: string;
  mini: Mini;
  matches: { phone: boolean; village: boolean; district: boolean; name: boolean };
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <Link
            href={`/admin/registry/${mini.id}`}
            className="mt-0.5 block truncate text-base font-semibold text-brand-700 hover:underline"
          >
            {mini.full_name}
          </Link>
          {mini.artisan_code ? (
            <p className="mt-0.5 font-mono text-xs text-slate-400">{mini.artisan_code}</p>
          ) : null}
        </div>
        <ArtisanStatusBadge status={mini.status as ArtisanStatus} />
      </div>

      <dl className="mt-auto space-y-2 text-sm">
        <Field
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Phone"
          value={maskPhone(mini.phone)}
          highlight={matches.phone}
        />
        <Field
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Village"
          value={mini.village ?? '—'}
          highlight={matches.village}
        />
        <Field label="District" value={mini.district ?? '—'} highlight={matches.district} />
        {matches.name ? <Field label="Name" value={mini.full_name} highlight /> : null}
      </dl>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  highlight,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-slate-500">
        {icon}
        <span>{label}</span>
      </dt>
      <dd
        className={cn(
          'text-right font-medium',
          highlight
            ? 'rounded-md bg-amber-50 px-2 py-0.5 text-amber-900 ring-1 ring-amber-200'
            : 'text-slate-700',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
