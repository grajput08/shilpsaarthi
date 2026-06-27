'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listDrafts } from '@/lib/field/drafts';
import { CloudOff, Cloud, RefreshCw } from 'lucide-react';

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
      className="mb-5 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-colors duration-150 hover:border-slate-300 active:bg-slate-50"
    >
      <span className="flex items-center gap-2 font-medium text-slate-700">
        {online ? <Cloud className="h-4 w-4 text-emerald-500" /> : <CloudOff className="h-4 w-4 text-amber-500" />}
        {online ? 'Online' : 'Offline — drafts saved on device'}
      </span>
      <span className="flex items-center gap-1.5 text-slate-500">
        {pending > 0 ? <RefreshCw className="h-3.5 w-3.5" /> : null}
        <span className="tabular-nums">{pending}</span> pending
      </span>
    </Link>
  );
}
