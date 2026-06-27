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
      className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
    >
      <span className="flex items-center gap-2 font-medium text-slate-700">
        {online ? <Cloud className="h-4 w-4 text-emerald-500" /> : <CloudOff className="h-4 w-4 text-amber-500" />}
        {online ? 'Online' : 'Offline — drafts saved on device'}
      </span>
      <span className="flex items-center gap-1 text-slate-500">
        <RefreshCw className="h-3.5 w-3.5" />
        {pending} pending
      </span>
    </Link>
  );
}
