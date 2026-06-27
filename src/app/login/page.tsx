import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import LoginForm from './LoginForm';
import { AdiSetuLogo, IllustrativeEmblem } from '@/components/brand/AdiSetuBrand';
import { Users, GitBranch, LayoutGrid, Flag } from 'lucide-react';

export const metadata = { title: 'Adi Setu — CRM Login' };

const VALUE_PROPS = [
  { icon: Users, title: 'One Identity', sub: 'Unified Artisan Registry' },
  { icon: GitBranch, title: 'One Bridge', sub: 'Connects Communities' },
  { icon: LayoutGrid, title: 'One Platform', sub: 'End-to-End Support' },
  { icon: Flag, title: 'One Vision', sub: 'Atmanirbhar Bharat' },
];

export default async function LoginPage() {
  const profile = await getProfile('admin');
  if (profile) redirect('/admin');

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left — tribal festival imagery + value proposition */}
      <section
        className="relative isolate flex min-h-[180px] flex-col justify-end overflow-hidden lg:min-h-screen"
        style={{
          backgroundImage: "url('/images/adi-setu-bg.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
        <div className="relative z-10 p-8 lg:p-12">
          <h1 className="hidden text-4xl font-extrabold leading-tight text-white drop-shadow lg:block xl:text-5xl">
            Empowering
            <br />
            Tribal Artisans.
          </h1>
          <p className="mt-3 hidden text-2xl font-bold lg:block">
            <span className="text-brand-400">Preserve.</span>{' '}
            <span className="text-white">Promote.</span>{' '}
            <span className="text-india-400">Prosper.</span>
          </p>
          <p className="mt-3 hidden max-w-md text-sm text-white/80 lg:block">
            One Platform. One Identity. Infinite Possibilities.
          </p>

          <div className="mt-8 hidden grid-cols-2 gap-4 sm:grid-cols-4 lg:grid">
            {VALUE_PROPS.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="text-white/90">
                  <Icon className="h-5 w-5 text-brand-300" />
                  <p className="mt-1.5 text-sm font-semibold">{v.title}</p>
                  <p className="text-xs text-white/70">{v.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
        {/* tricolour strip */}
        <div className="relative z-10 grid grid-cols-3">
          <div className="h-1.5 bg-saffron-500" />
          <div className="h-1.5 bg-white" />
          <div className="h-1.5 bg-india-600" />
        </div>
      </section>

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
            <AdiSetuLogo className="h-16 w-20" />
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
