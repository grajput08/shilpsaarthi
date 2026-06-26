import RegistrationForm from './RegistrationForm';

export const metadata = {
  title: 'Artisan Registration · ShilpSaarthi',
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { lang?: string; campaign?: string };
}) {
  return (
    <main className="pwa mx-auto min-h-screen max-w-md bg-slate-50 px-4 py-6">
      <RegistrationForm initialLanguage={searchParams.lang ?? 'en'} />
    </main>
  );
}
