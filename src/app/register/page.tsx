import RegistrationForm from '@/app/a/form/RegistrationForm';

export const metadata = { title: 'Artisan Registration · ShilpSaarthi' };
export const dynamic = 'force-dynamic';

export default function RegisterPage({
  searchParams,
}: Readonly<{
  searchParams: { lang?: string };
}>) {
  return (
    <main className="pwa mx-auto min-h-screen max-w-md bg-slate-50 px-4 py-6">
      <RegistrationForm initialLanguage={searchParams.lang ?? 'en'} />
    </main>
  );
}
