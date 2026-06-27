import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import FieldLoginForm from './FieldLoginForm';
import { getProfile } from '@/lib/auth';
import { IllustrativeEmblem } from '@/components/brand/AdiSetuBrand';

export const metadata = { title: 'Field Verifier · Adi Setu' };

function VerifierLoginBackground() {
  const rings = [88, 124, 160, 196, 232, 268, 304];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#F4F7FA]" aria-hidden>
      <svg
        className="absolute left-1/2 top-[26%] h-[min(155vw,680px)] w-[min(155vw,680px)] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 400 400"
        fill="none"
      >
        <defs>
          <filter id="verifier-ring-soften" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g filter="url(#verifier-ring-soften)" stroke="#B4C8DC" strokeWidth="20" opacity="0.42">
          {rings.map((r) => (
            <circle key={r} cx="200" cy="200" r={r} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default async function FieldLoginPage() {
  const profile = await getProfile('verifier');
  if (profile) redirect('/verifier');

  return (
    <main className="pwa relative mx-auto flex min-h-screen max-w-md flex-col">
      <VerifierLoginBackground />

      <div className="relative flex flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        {/* Brand header */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 text-field-accent">
            <Shield className="h-5 w-5" strokeWidth={2.25} />
            <span className="text-lg font-bold tracking-tight text-field-ink">Adi Setu</span>
          </div>

          <div className="mt-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-field-border bg-field-surface shadow-card">
              <IllustrativeEmblem className="h-10 w-10" />
            </div>
            <p className="mt-2 text-sm font-bold tracking-wide text-field-accent">BHARAT</p>
            <p className="text-xs text-field-muted">Government of India (illustrative)</p>
            <p className="text-sm font-semibold text-field-ink">Ministry of Tribal Affairs</p>
          </div>

          {/* <div className="mt-5 flex flex-col items-center">
            <AdiSetuLogo className="h-12 w-14 text-field-accent" />
            <p className="mt-1 text-sm font-semibold text-field-accent">Field verifier app</p>
          </div> */}
        </header>

        <div className="mt-8 flex flex-1 flex-col justify-center">
          <FieldLoginForm />
        </div>

        <footer className="mt-8 space-y-3 text-center">
          <p className="text-xs text-field-muted">
            © 2026 <span className="font-semibold text-field-ink">Adi Setu</span>. Institutional Security.
            <br />
            Designed for Tribal Artisans · <span className="font-medium text-field-accent">By Bharat</span>
          </p>

          {/* <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <a href="mailto:support@shilpsaarthi.test" className="font-medium text-field-accent underline-offset-2 hover:underline">
              Support
            </a>
            <span className="text-field-border" aria-hidden>
              ·
            </span>
            <span className="text-field-muted">Privacy Policy</span>
            <span className="text-field-border" aria-hidden>
              ·
            </span>
            <Link href="/login" className="font-medium text-field-accent underline-offset-2 hover:underline">
              Alternative Login
            </Link>
          </nav> */}

          <p className="text-xs text-field-muted">
            Admin / operator?{' '}
            <Link href="/login" className="font-semibold text-field-accent underline-offset-2 hover:underline">
              Use the CRM login
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
