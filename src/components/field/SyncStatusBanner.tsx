'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listDrafts } from '@/lib/field/drafts';
import { CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function SyncStatusBanner() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    function refresh() {
      setOnline(navigator.onLine);
      setPending(listDrafts().filter((d) => d.status !== 'draft').length);
    }
    refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    const t = setInterval(refresh, 4000);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      clearInterval(t);
    };
  }, []);

  return (
    <Link
      href="/verifier/sync"
      data-testid="sync-banner"
      className={cn(
        'mb-5 flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm shadow-sm',
        'transition-[background-color,border-color] duration-150',
        online
          ? 'border-field-border/80 bg-field-surface hover:border-stone-300'
          : 'border-amber-200 bg-amber-50 hover:border-amber-300',
      )}
    >
      <span className="flex items-center gap-2 font-medium text-field-ink">
        {online ? <Cloud className="h-4 w-4 text-india-600" /> : <CloudOff className="h-4 w-4 text-amber-600" />}
        {online ? 'Online' : 'Offline — drafts saved on device'}
      </span>
      <span className="flex items-center gap-1.5 text-field-muted">
        {pending > 0 ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
        <span className="tabular-nums">{pending}</span> pending
      </span>
    </Link>
  );
}
