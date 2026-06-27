import Link from 'next/link';
import { redirect } from 'next/navigation';
import FieldLoginForm from './FieldLoginForm';
import { getProfile } from '@/lib/auth';

export const metadata = { title: 'Field Login · ShilpSaarthi' };

export default async function FieldLoginPage() {
  const profile = await getProfile();
  if (profile?.role === 'verifier') redirect('/verifier');
  if (profile) redirect('/admin'); // CRM users belong in the CRM

  return (
    <main className="pwa flex min-h-screen flex-col justify-center bg-slate-100 px-4">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ShilpSaarthi</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Field Verifier</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in with a one-time code (OTP).</p>
        </div>
        <FieldLoginForm />
        <p className="mt-4 text-center text-sm text-slate-500">
          Admin / operator?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Use the CRM login
          </Link>
        </p>
      </div>
    </main>
  );
}
