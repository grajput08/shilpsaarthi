import { createClient } from '@/lib/supabase/server';
import DashboardHeader from '@/components/admin/DashboardHeader';
import DashboardMetric from '@/components/admin/DashboardMetric';
import BarList from '@/components/admin/BarList';
import DonutChart, { type DonutDatum } from '@/components/admin/DonutChart';
import AreaTrendChart from '@/components/admin/AreaTrendChart';
import ColumnChart from '@/components/admin/ColumnChart';
import DataQualityPanel from '@/components/admin/DataQualityPanel';
import RecentOnboardingsTable from '@/components/admin/RecentOnboardingsTable';
import {
  BHASHINI_LANGUAGES_LIVE,
  CRAFT_CATEGORY,
  LANGUAGE_LABEL,
  ONBOARDING_CHANNEL,
  OPEN_VERIFICATION_STATUSES,
  onboardingChannelLabel,
  type ArtisanStatus,
  type CraftCategory,
  type RegistrationSource,
} from '@/lib/domain';
import { FileCheck, Languages, ShieldCheck, Users } from 'lucide-react';

type ArtisanRow = {
  id: string;
  artisan_code: string | null;
  full_name: string;
  consent_status: string;
  registration_source: string;
  state: string | null;
  primary_craft: CraftCategory | null;
  preferred_language: string;
  data_completeness: number;
  status: ArtisanStatus;
  created_at: string;
  craft_profiles: { sub_category: string | null } | { sub_category: string | null }[] | null;
};

export default async function OverviewPage() {
  const supabase = createClient();

  const [{ data: artisans }, { data: idDocs }, { data: products }, { data: craftProfiles }, { data: duplicates }] =
    await Promise.all([
      supabase
        .from('artisans')
        .select(
          'id, artisan_code, full_name, consent_status, registration_source, state, primary_craft, preferred_language, data_completeness, status, created_at, craft_profiles(sub_category)',
        )
        .order('created_at', { ascending: false }),
      supabase.from('documents').select('artisan_id').eq('doc_type', 'id_proof').eq('status', 'available'),
      supabase.from('products').select('name'),
      supabase.from('craft_profiles').select('sub_category'),
      supabase.from('duplicate_candidates').select('status'),
    ]);

  const rows = (artisans ?? []) as ArtisanRow[];
  const total = rows.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = rows.filter((a) => new Date(a.created_at) >= thirtyDaysAgo).length;

  const aadhaarVerified = new Set((idDocs ?? []).map((d) => d.artisan_id)).size;
  const aadhaarPct = total ? Math.round((aadhaarVerified / total) * 100) : 0;

  const consentRecorded = rows.filter((a) => a.consent_status === 'granted').length;
  const consentPct = total ? Math.round((consentRecorded / total) * 100) : 0;

  const stateData = countBy(rows, (a) => a.state);

  const channelCounts: Record<keyof typeof ONBOARDING_CHANNEL, number> = {
    assisted: 0,
    ivr: 0,
    whatsapp: 0,
  };
  for (const a of rows) {
    const source = a.registration_source as RegistrationSource;
    for (const [key, channel] of Object.entries(ONBOARDING_CHANNEL) as [
      keyof typeof ONBOARDING_CHANNEL,
      (typeof ONBOARDING_CHANNEL)[keyof typeof ONBOARDING_CHANNEL],
    ][]) {
      if (channel.sources.includes(source)) {
        channelCounts[key] += 1;
        break;
      }
    }
  }

  const onboardingDonut: DonutDatum[] = (
    Object.entries(ONBOARDING_CHANNEL) as [
      keyof typeof ONBOARDING_CHANNEL,
      (typeof ONBOARDING_CHANNEL)[keyof typeof ONBOARDING_CHANNEL],
    ][]
  ).map(([key, channel]) => ({
    label: channel.label,
    value: channelCounts[key],
    color: channel.color,
  }));

  const craftCounts: Record<string, number> = {};
  for (const p of products ?? []) {
    const name = p.name?.trim();
    if (name) craftCounts[name] = (craftCounts[name] ?? 0) + 1;
  }
  for (const cp of craftProfiles ?? []) {
    const name = cp.sub_category?.trim();
    if (name) craftCounts[name] = (craftCounts[name] ?? 0) + 1;
  }
  for (const a of rows) {
    if (!a.primary_craft) continue;
    const label = CRAFT_CATEGORY[a.primary_craft];
    craftCounts[label] = (craftCounts[label] ?? 0) + 1;
  }
  const craftData = Object.entries(craftCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const monthlyData = monthlyOnboardings(rows.map((a) => a.created_at));

  const languageData = countBy(rows, (a) => LANGUAGE_LABEL[a.preferred_language] ?? a.preferred_language.toUpperCase());

  const avgCompleteness = total
    ? Math.round(rows.reduce((sum, a) => sum + (a.data_completeness ?? 0), 0) / total)
    : 0;

  const duplicatesResolved = (duplicates ?? []).filter((d) => d.status !== 'open').length;
  const pendingVerification = rows.filter((a) => OPEN_VERIFICATION_STATUSES.includes(a.status)).length;

  const recentRows = rows.slice(0, 8).map((a) => ({
    id: a.id,
    artisanCode: a.artisan_code,
    name: a.full_name,
    craft: craftLabel(a),
    state: a.state,
    channel: onboardingChannelLabel(a.registration_source as RegistrationSource),
    date: formatShortDate(a.created_at),
  }));

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          icon={<Users className="h-4 w-4" />}
          value={total}
          label="Total artisans profiled"
          hint={recentCount > 0 ? `↑ ${recentCount} last 30 days` : '↑ last 30 days'}
        />
        <DashboardMetric
          icon={<ShieldCheck className="h-4 w-4" />}
          value={`${aadhaarPct}%`}
          label="Aadhaar verified"
          hint="Target ≥ 90%"
        />
        <DashboardMetric
          icon={<FileCheck className="h-4 w-4" />}
          value={`${consentPct}%`}
          label="Consent recorded"
          hint="DPDP aligned"
        />
        <DashboardMetric
          icon={<Languages className="h-4 w-4" />}
          value={BHASHINI_LANGUAGES_LIVE}
          label="Languages live"
          hint="via Bhashini"
        />
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <div className="h-full lg:col-span-2">
          <BarList
            title="Artisans by state"
            subtitle="Ranked view (map fallback)"
            data={stateData}
            tone="navy"
            max={14}
          />
        </div>
        <div className="h-full">
          <DonutChart title="Onboarding channel" data={onboardingDonut} legend="bottom" showCenter={false} />
        </div>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <div className="h-full">
          <BarList title="Top crafts" data={craftData} tone="navy" max={10} />
        </div>
        <div className="h-full lg:col-span-2">
          <AreaTrendChart title="Onboardings per month" data={monthlyData} />
        </div>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <div className="h-full lg:col-span-2">
          <ColumnChart title="Top languages used" data={languageData} tone="green" max={8} />
        </div>
        <div className="h-full">
          <DataQualityPanel
            title="Data quality"
            stats={[
              { value: `${avgCompleteness}%`, label: 'Profile completeness', tone: 'green' },
              { value: duplicatesResolved, label: 'Duplicates resolved', tone: 'blue' },
              { value: pendingVerification, label: 'Pending verification', tone: 'red' },
            ]}
          />
        </div>
      </div>

      <RecentOnboardingsTable title="Recent onboardings" rows={recentRows} />
    </div>
  );
}

function craftLabel(a: ArtisanRow) {
  const profile = Array.isArray(a.craft_profiles) ? a.craft_profiles[0] : a.craft_profiles;
  if (profile?.sub_category?.trim()) return profile.sub_category.trim();
  if (a.primary_craft) return CRAFT_CATEGORY[a.primary_craft];
  return '—';
}

function countBy<T>(items: T[], key: (item: T) => string | null | undefined) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const k = key(item)?.trim();
    if (!k) continue;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function monthlyOnboardings(dates: string[]) {
  const buckets: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({ label, value: 0 });
  }
  for (const created of dates) {
    const d = new Date(created);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.find((b) => b.label === label);
    if (bucket) bucket.value += 1;
  }
  return buckets;
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
