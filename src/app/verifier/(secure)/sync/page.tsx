'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardBody, Chip, EmptyState } from '@/components/ui';
import { listDrafts, deleteDraft, saveDraft, type VerificationDraft } from '@/lib/field/drafts';
import { submitVerification } from '../artisans/[id]/verify/actions';
import { relativeTime } from '@/lib/format';

export default function SyncPage() {
  const [drafts, setDrafts] = useState<VerificationDraft[]>([]);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  function refresh() {
    setDrafts(listDrafts());
    setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    return () => {
      clearInterval(t);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
    };
  }, []);

  async function retry(draft: VerificationDraft) {
    setBusy(draft.artisanId);
    // Pending/failed drafts store the full submit payload — retry it as-is.
    const payload = draft.data as Parameters<typeof submitVerification>[0];
    const result = await submitVerification(payload);
    if (result.ok) {
      deleteDraft(draft.artisanId);
      setLastSync(new Date().toISOString());
    } else {
      saveDraft({ ...draft, status: 'failed', updatedAt: new Date().toISOString() });
    }
    setBusy(null);
    refresh();
  }

  const pending = drafts.filter((d) => d.status !== 'draft');

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-field-ink">Sync Queue</h1>
      <p className="mb-4 text-sm text-field-muted">
        {online ? 'Online' : 'Offline'} · Last sync {lastSync ? relativeTime(lastSync) : '—'}
      </p>

      {drafts.length === 0 ? (
        <EmptyState title="Nothing to sync" description="All field records are saved to the server." />
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <Card key={d.artisanId}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/verifier/artisans/${d.artisanId}/verify`} className="font-semibold text-slate-900 hover:underline">
                      {d.artisanName}
                    </Link>
                    <p className="text-xs text-slate-500">Updated {relativeTime(d.updatedAt)}</p>
                  </div>
                  <Chip tone={d.status === 'failed' ? 'red' : d.status === 'pending' ? 'amber' : 'gray'}>
                    {d.status === 'draft' ? 'On device' : d.status === 'pending' ? 'Pending sync' : 'Failed'}
                  </Chip>
                </div>
                {d.status !== 'draft' ? (
                  <Button
                    className="mt-3"
                    variant="secondary"
                    loading={busy === d.artisanId}
                    onClick={() => retry(d)}
                    data-testid="sync-retry"
                  >
                    {busy === d.artisanId ? 'Syncing…' : 'Retry sync'}
                  </Button>
                ) : (
                  <Link href={`/verifier/artisans/${d.artisanId}/verify`} className="mt-3 inline-block text-sm text-brand-600 hover:underline">
                    Continue draft →
                  </Link>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {pending.length === 0 && drafts.length > 0 ? (
        <p className="mt-4 text-center text-sm text-emerald-600">All records synced ✓</p>
      ) : null}
    </div>
  );
}
