import { createAdminClient } from '@/lib/supabase/admin';
import RegistrationForm from './RegistrationForm';

export const metadata = { title: 'Artisan Registration · ShilpSaarthi' };
export const dynamic = 'force-dynamic';

export default async function PublicFormPage({
  searchParams,
}: {
  searchParams: { id?: string; lang?: string };
}) {
  const token = searchParams.id ?? '';

  if (!token) {
    return <Invalid message="This registration link is missing its code. Please use the full link you were sent." />;
  }

  // Validate the token with the service role (no login, RLS-independent).
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('registration_tokens')
    .select('token, status, prefill, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!row) return <Invalid message="This registration link is invalid." />;
  if (row.status === 'used') return <Invalid message="This registration link has already been used." />;
  if (row.status !== 'active') return <Invalid message="This registration link is no longer active." />;
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return <Invalid message="This registration link has expired." />;
  }

  const prefill = (row.prefill as Record<string, string>) ?? {};

  return (
    <main className="pwa mx-auto min-h-screen max-w-md bg-slate-50 px-4 py-6">
      <RegistrationForm token={token} initialLanguage={searchParams.lang ?? 'en'} prefill={prefill} />
    </main>
  );
}

function Invalid({ message }: { message: string }) {
  return (
    <main className="pwa mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ShilpSaarthi</p>
        <h1 className="mt-2 text-lg font-bold text-slate-900">Registration link problem</h1>
        <p className="mt-2 text-sm text-slate-600" data-testid="form-invalid">{message}</p>
      </div>
    </main>
  );
}
