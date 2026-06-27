'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Chip, Button } from '@/components/ui';
import { overrideVerification } from '@/app/admin/actions';

type ItemStatus = 'pending' | 'verified' | 'corrected' | 'rejected' | 'cancelled' | 'not_applicable';

const TONE: Record<ItemStatus, 'gray' | 'blue' | 'green' | 'red'> = {
  pending: 'gray',
  verified: 'green',
  corrected: 'blue',
  rejected: 'red',
  cancelled: 'red',
  not_applicable: 'gray',
};

export interface VItem {
  id: string;
  item_label: string;
  status: ItemStatus;
  note: string | null;
}

export default function VerificationItems({
  artisanId,
  verificationId,
  adminOverride,
  decision,
  items,
  canOverride,
}: {
  artisanId: string;
  verificationId: string | null;
  adminOverride: boolean;
  decision: string | null;
  items: VItem[];
  canOverride: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const hasBlocking = items.some((i) => i.status === 'rejected' || i.status === 'cancelled');
  const showOverride = canOverride && verificationId && hasBlocking && decision !== 'verified' && !adminOverride;

  function doOverride() {
    if (!verificationId) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set('verification_id', verificationId);
      fd.set('artisan_id', artisanId);
      const res = await overrideVerification(fd);
      setMsg(res.ok ? 'Override applied — marked Fully Verified.' : res.error ?? 'Failed.');
      if (res.ok) router.refresh();
    });
  }

  return (
    <Card data-testid="verification-items">
      <CardHeader
        title="Verification items"
        subtitle={items.length ? `${items.length} field/section checks` : undefined}
        action={adminOverride ? <Chip tone="purple">Admin override</Chip> : undefined}
      />
      <CardBody className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No per-field verification recorded yet.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 text-sm">
              <div>
                <p className="font-medium text-slate-700">{it.item_label}</p>
                {it.note ? <p className="text-xs text-slate-500">{it.note}</p> : null}
              </div>
              <Chip tone={TONE[it.status]}>{it.status.replace(/_/g, ' ')}</Chip>
            </div>
          ))
        )}

        {msg ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700" data-testid="override-msg">{msg}</p> : null}

        {showOverride ? (
          <Button variant="secondary" disabled={pending} onClick={doOverride} data-testid="admin-override">
            {pending ? 'Applying…' : 'Admin override → mark Fully Verified'}
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}
