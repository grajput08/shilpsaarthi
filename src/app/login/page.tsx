import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import LoginForm from './LoginForm';
import LoginLeftSection from './LoginLeftSection';
import { AdiSetuLogo, IllustrativeEmblem } from '@/components/brand/AdiSetuBrand';

export const metadata = { title: 'Adi Setu — CRM Login' };

export default async function LoginPage() {
  const profile = await getProfile('admin');
  if (profile) redirect('/admin');

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      <LoginLeftSection />

      {/* Right — sign-in card */}
      <section className="flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Government identity */}
          <div className="text-center">
            <IllustrativeEmblem className="mx-auto h-14 w-14" />
            <p className="mt-1 text-sm font-bold tracking-wide text-brand-600">BHARAT</p>
            <p className="text-xs text-slate-600">Government of India (illustrative)</p>
            <p className="text-sm font-semibold text-india-600">Ministry of Tribal Affairs</p>
          </div>

          {/* Adi Setu brand */}
          <div className="mt-5 flex flex-col items-center">
            <AdiSetuLogo className="h-16 w-16" />
            <p className="mt-1 text-3xl font-extrabold">
              <span className="text-brand-600">Adi</span> <span className="text-brand-400">Setu</span>
            </p>
            <p className="text-sm font-medium text-slate-500">One identity. One bridge.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">Welcome Back!</h2>
              <p className="text-sm text-slate-500">Sign in to access your CRM dashboard</p>
            </div>
            <LoginForm />
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            © 2026 <span className="font-semibold text-slate-700">Adi Setu</span>. All rights reserved.
            <br />
            Designed for Tribal Artisans · <span className="font-medium text-india-600">By Bharat</span>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            Field verifier?{' '}
            <Link href="/verifier/login" className="font-medium text-india-600 hover:underline">
              Use the verifier app login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
