import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardBody } from '@/components/ui';
import BarList from '@/components/admin/BarList';
import ExportButton from '@/components/admin/ExportButton';
import { CRAFT_CATEGORY, GENDER, ARTISAN_STATUS, type ArtisanStatus } from '@/lib/domain';
import { maskPhone } from '@/lib/format';

export default async function ReportsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('artisans')
    .select('artisan_code, full_name, phone, gender, tribe_community, state, district, village, primary_craft, status, registration_source, data_completeness');

  const artisans = data ?? [];

  function group(key: keyof (typeof artisans)[number], labels?: Record<string, string>) {
    const counts: Record<string, number> = {};
    for (const a of artisans) {
      const v = (a[key] as string | null) ?? 'unknown';
      counts[v] = (counts[v] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([k, v]) => ({ label: labels?.[k] ?? k, value: v }))
      .sort((a, b) => b.value - a.value);
  }

  // CSV-friendly rows
  const exportRows = artisans.map((a) => ({
    artisan_id: a.artisan_code,
    name: a.full_name,
    phone_masked: maskPhone(a.phone),
    gender: a.gender ?? '',
    tribe: a.tribe_community ?? '',
    state: a.state ?? '',
    district: a.district ?? '',
    village: a.village ?? '',
    craft: a.primary_craft ?? '',
    status: a.status,
    source: a.registration_source,
    completeness: a.data_completeness,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports &amp; Export</h1>
          <p className="text-sm text-slate-500">Aggregate views for ministry / state reporting.</p>
        </div>
        <ExportButton rows={exportRows} filename="artisan_registry.csv" kind="artisan_registry" label="Export registry CSV" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BarList title="State-wise registrations" data={group('state')} />
        <BarList title="District-wise" data={group('district')} />
        <BarList title="Craft-wise artisan count" data={group('primary_craft', CRAFT_CATEGORY)} />
        <BarList title="Gender-wise distribution" data={group('gender', GENDER)} />
        <BarList title="Tribe / community" data={group('tribe_community')} />
        <BarList
          title="Status distribution"
          data={group('status', Object.fromEntries(Object.entries(ARTISAN_STATUS).map(([k, v]) => [k, v.label])))}
        />
      </div>

      <Card className="mt-4">
        <CardHeader title="Market-ready artisans" />
        <CardBody>
          <p className="text-3xl font-bold text-emerald-600">
            {artisans.filter((a) => a.status === ('market_ready' as ArtisanStatus)).length}
          </p>
          <p className="text-sm text-slate-500">Verified with catalogue ready for downstream use.</p>
        </CardBody>
      </Card>
    </div>
  );
}
