import Link from 'next/link';
import LoginForm from './LoginForm';
import { getProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Admin Login · ShilpSaarthi' };

export default async function LoginPage() {
  const profile = await getProfile();
  if (profile) redirect(profile.role === 'verifier' ? '/verifier' : '/admin');

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ShilpSaarthi</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Admin CRM Login</h1>
          <p className="mt-1 text-sm text-slate-500">Admin, operator and district officer access.</p>
        </div>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-slate-500">
          Field verifier?{' '}
          <Link href="/verifier/login" className="font-medium text-brand-600 hover:underline">
            Use the field app login
          </Link>
        </p>
      </div>
    </main>
  );
}
