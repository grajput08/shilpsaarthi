import LoginLeftSection, { REGISTRATION_VALUE_PROPS } from '@/app/login/LoginLeftSection';

export default function RegistrationPageShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-white lg:flex">
      <div className="lg:w-[30%] lg:shrink-0">
        <LoginLeftSection
          valueProps={REGISTRATION_VALUE_PROPS}
          tagline="One Platform. Infinite Possibilities."
        />
      </div>

      <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-slate-50 lg:bg-white">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 sm:px-6 lg:max-w-2xl lg:justify-center lg:px-10 lg:py-10">
          <RegistrationWebHeader />

          <div className="flex-1 lg:flex-none">{children}</div>

          <p className="mt-8 hidden text-center text-xs text-slate-500 lg:block">
            Designed for Tribal Artisans ·{' '}
            <span className="font-medium text-india-600">By Bharat</span>
          </p>
        </div>
      </section>
    </main>
  );
}

function RegistrationWebHeader() {
  return (
    <div className="mb-6 hidden text-center lg:block">
      <h1 className="text-2xl font-bold text-slate-900">Artisan Registration</h1>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        Register your craft and join the verified tribal artisan registry.
      </p>
    </div>
  );
}
