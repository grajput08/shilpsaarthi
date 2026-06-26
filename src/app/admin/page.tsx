import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Stat, Card, CardHeader, CardBody } from '@/components/ui';
import BarList from '@/components/admin/BarList';
import {
  ARTISAN_STATUS,
  ARTISAN_STATUS_ORDER,
  CRAFT_CATEGORY,
  REGISTRATION_SOURCE,
  GENDER,
  type ArtisanStatus,
} from '@/lib/domain';

export default async function OverviewPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('artisans')
    .select('status, primary_craft, gender, registration_source, district');
  const { count: waCount } = await supabase
    .from('whatsapp_messages')
    .select('*', { count: 'exact', head: true });

  const artisans = data ?? [];
  const total = artisans.length;
  const byStatus = (s: ArtisanStatus) => artisans.filter((a) => a.status === s).length;

  const registered = total - byStatus('lead_created') - byStatus('contacted');
  const verified = byStatus('verified') + byStatus('market_ready');
  const reachedPipeline = artisans.filter((a) =>
    ['pending_verification', 'assigned', 'verification_in_progress', 'verified', 'needs_correction', 'revisit_required', 'rejected', 'duplicate', 'market_ready'].includes(a.status),
  ).length;
  const completedVerification = verified + byStatus('rejected') + byStatus('duplicate') + byStatus('needs_correction');

  const statusData = ARTISAN_STATUS_ORDER.map((s) => ({ label: ARTISAN_STATUS[s].label, value: byStatus(s) })).filter((d) => d.value > 0);

  function distribution<T extends string>(key: 'primary_craft' | 'gender' | 'registration_source' | 'district', labels?: Record<T, string>) {
    const counts: Record<string, number> = {};
    for (const a of artisans) {
      const v = (a[key] as string | null) ?? 'unknown';
      counts[v] = (counts[v] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([k, v]) => ({ label: labels ? (labels[k as T] ?? k) : k, value: v }))
      .sort((a, b) => b.value - a.value);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programme Overview</h1>
          <p className="text-sm text-slate-500">Health of artisan registration and verification.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Total Leads" value={total} />
        <Stat label="Registered" value={registered} />
        <Stat label="Pending Verification" value={byStatus('pending_verification')} />
        <Stat label="Assigned" value={byStatus('assigned')} />
        <Stat label="Verified" value={verified} />
        <Stat label="Rejected" value={byStatus('rejected')} />
        <Stat label="Duplicates" value={byStatus('duplicate')} />
        <Stat label="Market Ready" value={byStatus('market_ready')} />
        <Stat label="WhatsApp Sent" value={waCount ?? 0} />
        <Stat
          label="Form Completion"
          value={`${total ? Math.round((registered / total) * 100) : 0}%`}
        />
        <Stat
          label="Verification Rate"
          value={`${reachedPipeline ? Math.round((completedVerification / reachedPipeline) * 100) : 0}%`}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Action centre" subtitle="Every item has a next action." />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <ActionCard href="/admin/queue" title="Assign pending cases" desc={`${byStatus('pending_verification')} awaiting a verifier`} />
            <ActionCard href="/admin/duplicates" title="Review flagged records" desc="Resolve duplicate candidates" />
            <ActionCard href="/admin/whatsapp" title="Send WhatsApp reminders" desc="Visit & correction reminders" />
            <ActionCard href="/admin/reports" title="Export report" desc="Download CSV for the ministry" />
          </CardBody>
        </Card>
        <BarList title="Pipeline by status" data={statusData} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BarList title="Craft distribution" data={distribution('primary_craft', CRAFT_CATEGORY)} />
        <BarList title="Source-wise registration" data={distribution('registration_source', REGISTRATION_SOURCE)} />
        <BarList title="Gender distribution" data={distribution('gender', GENDER)} />
        <BarList title="District clusters" data={distribution('district')} />
      </div>
    </div>
  );
}

function ActionCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
    </Link>
  );
}
