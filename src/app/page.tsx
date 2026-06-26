import Link from 'next/link';
import { Card } from '@/components/ui';
import { ClipboardCheck, LayoutDashboard, Smartphone } from 'lucide-react';

const entries = [
  {
    href: '/register',
    title: 'Public Registration',
    desc: 'WhatsApp-link self-registration form for artisans. No login required.',
    icon: Smartphone,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    href: '/field',
    title: 'Field Verifier PWA',
    desc: 'Mobile-first verification app for field teams. Works offline, syncs later.',
    icon: ClipboardCheck,
    tone: 'bg-blue-50 text-blue-700',
  },
  {
    href: '/admin',
    title: 'Admin CRM Dashboard',
    desc: 'Operations control room: registry, queue, assignments, WhatsApp, reports, audit.',
    icon: LayoutDashboard,
    tone: 'bg-brand-100 text-brand-700',
  },
];

const credentials = [
  ['Admin', 'admin@shilpsaarthi.test', '/admin'],
  ['Operator', 'operator@shilpsaarthi.test', '/admin'],
  ['District Officer', 'officer@shilpsaarthi.test', '/admin'],
  ['Field Verifier', 'verifier@shilpsaarthi.test', '/field/login'],
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
          Tribal Artisan CRM · POC
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">ShilpSaarthi</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Identify, onboard, verify and manage tribal artisans — a verified registry with photos,
          craft details, location, documents, products and verification status.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {entries.map((e) => {
          const Icon = e.icon;
          return (
            <Link key={e.href} href={e.href}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${e.tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{e.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{e.desc}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-10 p-6">
        <h2 className="text-sm font-semibold text-slate-900">Demo credentials</h2>
        <p className="mt-1 text-xs text-slate-500">
          All demo users share the password <code className="rounded bg-slate-100 px-1">Password123!</code>.
          Field verifiers sign in with a mock OTP (use code <code className="rounded bg-slate-100 px-1">123456</code>).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2">Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {credentials.map(([role, email, href]) => (
                <tr key={email}>
                  <td className="py-2 pr-4 font-medium text-slate-700">{role}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-600">{email}</td>
                  <td className="py-2">
                    <Link href={href} className="text-brand-600 hover:underline">
                      {href}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
