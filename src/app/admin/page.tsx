import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Stat, Card, CardHeader, CardBody } from '@/components/ui';
import BarList from '@/components/admin/BarList';
import DonutChart, { type DonutDatum } from '@/components/admin/DonutChart';
import {
  ARTISAN_STATUS,
  ARTISAN_STATUS_ORDER,
  CRAFT_CATEGORY,
  REGISTRATION_SOURCE,
  type ArtisanStatus,
} from '@/lib/domain';
import { Users, Clock, BadgeCheck, TrendingUp, ChevronRight, ClipboardList, Copy } from 'lucide-react';

const TONE_HEX: Record<string, string> = {
  gray: '#94a3b8',
  blue: '#2563eb',
  amber: '#f59e0b',
  green: '#0F7A06',
  red: '#dc2626',
  purple: '#7c3aed',
  teal: '#0d9488',
};

export default async function OverviewPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('artisans')
    .select('status, primary_craft, registration_source, district');

  const artisans = data ?? [];
  const total = artisans.length;
  const byStatus = (s: ArtisanStatus) => artisans.filter((a) => a.status === s).length;

  const verified = byStatus('verified') + byStatus('market_ready');
  const pending = byStatus('pending_verification');
  const reachedPipeline = artisans.filter((a) =>
    ['pending_verification', 'assigned', 'verification_in_progress', 'verified', 'needs_correction', 'revisit_required', 'rejected', 'duplicate', 'market_ready'].includes(a.status),
  ).length;
  const completedVerification = verified + byStatus('rejected') + byStatus('duplicate') + byStatus('needs_correction');
  const verificationRate = reachedPipeline ? Math.round((completedVerification / reachedPipeline) * 100) : 0;

  const statusDonut: DonutDatum[] = ARTISAN_STATUS_ORDER.map((s) => ({
    label: ARTISAN_STATUS[s].label,
    value: byStatus(s),
    color: TONE_HEX[ARTISAN_STATUS[s].tone] ?? '#94a3b8',
  }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  function distribution(key: 'primary_craft' | 'registration_source' | 'district', labels?: Record<string, string>) {
    const counts: Record<string, number> = {};
    for (const a of artisans) {
      const v = (a[key] as string | null) ?? 'unknown';
      counts[v] = (counts[v] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([k, v]) => ({ label: labels?.[k] ?? k, value: v }))
      .sort((a, b) => b.value - a.value);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Programme Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Health of artisan registration and verification at a glance.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total Artisans" value={total} icon={<Users className="h-4 w-4" />} accent="slate" />
        <Stat label="Pending Verification" value={pending} icon={<Clock className="h-4 w-4" />} accent="amber" />
        <Stat label="Verified" value={verified} icon={<BadgeCheck className="h-4 w-4" />} accent="green" />
        <Stat label="Verification Rate" value={`${verificationRate}%`} icon={<TrendingUp className="h-4 w-4" />} accent="saffron" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DonutChart title="Lifecycle status" subtitle="Where artisans are in the pipeline" data={statusDonut} centerLabel="Artisans" />
        <BarList title="Top crafts" subtitle="By artisan count" data={distribution('primary_craft', CRAFT_CATEGORY)} />
        <BarList title="Registration source" data={distribution('registration_source', REGISTRATION_SOURCE)} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarList title="District clusters" subtitle="Artisans by district" data={distribution('district')} tone="slate" />
        </div>
        <Card>
          <CardHeader title="Next actions" />
          <CardBody className="space-y-2">
            <ActionRow href="/admin/queue" icon={<ClipboardList className="h-4 w-4" />} title="Assign pending cases" desc={`${pending} awaiting a verifier`} />
            <ActionRow href="/admin/duplicates" icon={<Copy className="h-4 w-4" />} title="Review duplicates" desc="Resolve flagged records" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ActionRow({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-[background-color,border-color] duration-150 hover:border-brand-300 hover:bg-brand-50"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500">{desc}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  );
}
