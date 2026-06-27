import { createAdminClient } from '@/lib/supabase/admin';
import RegistrationForm from './RegistrationForm';
import RegistrationInvalidCard from './RegistrationInvalidCard';
import RegistrationPageShell from './RegistrationPageShell';

export const metadata = { title: 'Adi Setu — Artisan Registration' };
export const dynamic = 'force-dynamic';

export default async function PublicFormPage({
  searchParams,
}: Readonly<{
  searchParams: { id?: string; lang?: string };
}>) {
  const token = searchParams.id ?? '';

  if (!token) {
    return (
      <RegistrationPageShell>
        <RegistrationInvalidCard message="This registration link is missing its code. Please use the full link you were sent." />
      </RegistrationPageShell>
    );
  }

  // Validate the token with the service role (no login, RLS-independent).
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('registration_tokens')
    .select('token, status, prefill, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!row) {
    return (
      <RegistrationPageShell>
        <RegistrationInvalidCard message="This registration link is invalid." />
      </RegistrationPageShell>
    );
  }
  if (row.status === 'used') {
    return (
      <RegistrationPageShell>
        <RegistrationInvalidCard message="This registration link has already been used." />
      </RegistrationPageShell>
    );
  }
  if (row.status !== 'active') {
    return (
      <RegistrationPageShell>
        <RegistrationInvalidCard message="This registration link is no longer active." />
      </RegistrationPageShell>
    );
  }
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return (
      <RegistrationPageShell>
        <RegistrationInvalidCard message="This registration link has expired." />
      </RegistrationPageShell>
    );
  }

  const prefill = (row.prefill as Record<string, string>) ?? {};

  return (
    <RegistrationPageShell>
      <RegistrationForm token={token} initialLanguage={searchParams.lang ?? 'en'} prefill={prefill} />
    </RegistrationPageShell>
  );
}
