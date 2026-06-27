import RegistrationForm from '@/app/a/form/RegistrationForm';
import RegistrationPageShell from '@/app/a/form/RegistrationPageShell';

export const metadata = { title: 'Adi Setu — Artisan Registration' };
export const dynamic = 'force-dynamic';

export default function RegisterPage({
  searchParams,
}: Readonly<{
  searchParams: { lang?: string };
}>) {
  return (
    <RegistrationPageShell>
      <RegistrationForm initialLanguage={searchParams.lang ?? 'en'} />
    </RegistrationPageShell>
  );
}
