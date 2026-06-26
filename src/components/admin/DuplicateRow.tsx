'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody } from '@/components/ui';
import { resolveDuplicate } from '@/app/admin/actions';

interface Mini {
  id: string;
  full_name: string;
  phone: string | null;
  village: string | null;
  district: string | null;
  artisan_code: string | null;
  status: string;
}

export default function DuplicateRow({
  candidateId,
  signal,
  left,
  right,
}: {
  candidateId: string;
  signal: string;
  left: Mini;
  right: Mini;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function resolve(decision: 'merge' | 'dismiss', keep?: Mini, dup?: Mini) {
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
        setMsg(decision === 'merge' ? 'Merged.' : 'Marked not a duplicate.');
        router.refresh();
      } else {
        setMsg(res.error ?? 'Failed.');
      }
    });
  }

  return (
    <Card data-testid="duplicate-row">
      <CardBody>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-purple-600">
            Signal: {signal.replace(/_/g, ' ')}
          </span>
          {msg ? <span className="text-sm text-emerald-600">{msg}</span> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Side mini={left} highlightPhone={left.phone === right.phone} />
          <Side mini={right} highlightPhone={left.phone === right.phone} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" disabled={pending} data-testid="dup-keep-left" onClick={() => resolve('merge', left, right)}>
            Keep {left.full_name} · merge other
          </Button>
          <Button variant="secondary" disabled={pending} data-testid="dup-keep-right" onClick={() => resolve('merge', right, left)}>
            Keep {right.full_name} · merge other
          </Button>
          <Button variant="ghost" disabled={pending} data-testid="dup-dismiss" onClick={() => resolve('dismiss')}>
            Not a duplicate
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function Side({ mini, highlightPhone }: { mini: Mini; highlightPhone: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-sm">
      <p className="font-semibold text-slate-900">{mini.full_name}</p>
      <p className="font-mono text-xs text-slate-400">{mini.artisan_code}</p>
      <dl className="mt-2 space-y-1">
        <Item label="Phone" value={mini.phone ?? '—'} highlight={highlightPhone} />
        <Item label="Village" value={mini.village ?? '—'} />
        <Item label="District" value={mini.district ?? '—'} />
        <Item label="Status" value={mini.status.replace(/_/g, ' ')} />
      </dl>
    </div>
  );
}

function Item({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={highlight ? 'rounded bg-amber-100 px-1 font-medium text-amber-800' : 'font-medium text-slate-700'}>{value}</dd>
    </div>
  );
}
