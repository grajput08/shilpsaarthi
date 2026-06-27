import Image from 'next/image';
import { Flag, GitBranch, LayoutGrid, Users } from 'lucide-react';

const VALUE_PROPS = [
  { icon: Users, title: 'One Identity', sub: 'Unified Artisan Registry' },
  { icon: GitBranch, title: 'One Bridge', sub: 'Connects Communities' },
  { icon: LayoutGrid, title: 'One Platform', sub: 'End-to-End Support' },
  { icon: Flag, title: 'One Vision', sub: 'Atmanirbhar Bharat' },
] as const;

/** Concentric circle motif inspired by Theyyam headdress patterns. */
function CirclePattern() {
  return (
    <svg
      className="pointer-events-none absolute -right-16 top-8 h-72 w-72 opacity-[0.07] lg:-right-8 lg:top-16 lg:h-96 lg:w-96"
      viewBox="0 0 200 200"
      aria-hidden
    >
      {[90, 72, 54, 36, 18].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="white" strokeWidth="2" />
      ))}
      {[90, 72, 54, 36, 18].map((r) => (
        <circle key={`dot-${r}`} cx="100" cy={100 - r} r="3" fill="white" />
      ))}
    </svg>
  );
}

export default function LoginLeftSection() {
  return (
    <section className="relative isolate flex min-h-[200px] flex-col justify-end overflow-hidden lg:min-h-screen">
      <Image
        src="/images/theyyam-hero.png"
        alt="Theyyam performer in traditional Kerala ritual costume"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover object-[center_20%]"
      />

      {/* Layered overlays — terracotta warmth + readable text zone */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3d1510]/95 via-[#5c2218]/70 to-[#8b2e1f]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

      <CirclePattern />

      <div className="relative z-10 flex flex-1 flex-col justify-end p-6 sm:p-8 lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/90 lg:text-sm">
          Ministry of Tribal Affairs
        </p>

        <h1 className="mt-2 max-w-lg text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl xl:text-5xl">
          Empowering
          <br />
          Tribal Artisans.
        </h1>

        <p className="mt-3 text-lg font-bold sm:text-xl lg:text-2xl">
          <span className="text-amber-300">Preserve.</span>{' '}
          <span className="text-white">Promote.</span>{' '}
          <span className="text-india-300">Prosper.</span>
        </p>

        <p className="mt-2 max-w-md text-sm text-white/80 lg:mt-3">
          One Platform. One Identity. Infinite Possibilities.
        </p>

        <div className="mt-6 hidden grid-cols-2 gap-3 sm:grid-cols-4 lg:mt-8 lg:grid lg:gap-4">
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
              >
                <Icon className="h-5 w-5 text-amber-300" />
                <p className="mt-1.5 text-sm font-semibold text-white">{v.title}</p>
                <p className="text-xs text-white/65">{v.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indian tricolour strip */}
      <div className="relative z-10 grid grid-cols-3">
        <div className="h-1.5 bg-saffron-500" />
        <div className="h-1.5 bg-white" />
        <div className="h-1.5 bg-india-600" />
      </div>
    </section>
  );
}
