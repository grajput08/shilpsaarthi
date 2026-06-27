import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import LinksManager from '@/components/admin/LinksManager';

export default async function LinksPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('registration_tokens')
    .select('id, token, status, prefill, artisan_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  const tokens = (data ?? []).map((t) => ({
    ...(t as {
      id: string;
      token: string;
      status: string;
      prefill: Record<string, string> | null;
      artisan_id: string | null;
      created_at: string;
    }),
    url: `${origin}/a/form?id=${t.token}`,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Registration Links</h1>
      <p className="mb-4 text-sm text-slate-500">
        Create a public link an artisan can open without logging in. They land on <code>/a/form?id=…</code>.
      </p>
      <LinksManager tokens={tokens} origin={origin} />
    </div>
  );
}
