import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, EmptyState, Chip } from '@/components/ui';
import { ArtisanStatusBadge } from '@/components/badges';
import { CRAFT_CATEGORY, type ArtisanStatus } from '@/lib/domain';
import { cn } from '@/lib/cn';
import { DASHBOARD_PAGE_TITLE } from '@/components/admin/dashboard-layout';

const TABS: { key: string; label: string; statuses: ArtisanStatus[] }[] = [
  { key: 'unassigned', label: 'Unassigned', statuses: ['pending_verification'] },
  { key: 'assigned', label: 'Assigned', statuses: ['assigned'] },
  { key: 'in_progress', label: 'In progress', statuses: ['verification_in_progress'] },
  { key: 'revisit', label: 'Revisit', statuses: ['revisit_required'] },
  { key: 'correction', label: 'Needs correction', statuses: ['needs_correction'] },
  { key: 'completed', label: 'Completed', statuses: ['verified', 'market_ready'] },
  { key: 'flagged', label: 'Flagged', statuses: ['duplicate', 'rejected'] },
];

export default async function QueuePage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = TABS.find((t) => t.key === searchParams.tab) ?? TABS[0];
  const supabase = createClient();
  const { data } = await supabase
    .from('artisans')
    .select('id, artisan_code, full_name, village, district, primary_craft, status, priority, assigned_verifier, profiles:profiles!artisans_assigned_verifier_fkey(full_name)')
    .in('status', tab.statuses)
    .order('updated_at', { ascending: false });

  const rows = (data ?? []) as unknown as {
    id: string;
    artisan_code: string;
    full_name: string;
    village: string | null;
    district: string | null;
    primary_craft: keyof typeof CRAFT_CATEGORY | null;
    status: ArtisanStatus;
    priority: string;
    profiles: { full_name: string } | null;
  }[];

  return (
    <div>
      <h1 className={`mb-4 ${DASHBOARD_PAGE_TITLE}`}>Verification Queue</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/queue?tab=${t.key}`}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              t.key === tab.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title={`No cases in "${tab.label}".`} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm" data-testid="queue-table">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Artisan</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Craft</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Assigned verifier</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Link href={`/admin/registry/${r.id}`} className="font-medium text-slate-800 hover:underline">
                        {r.full_name}
                      </Link>
                      <p className="font-mono text-xs text-slate-400">{r.artisan_code}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{[r.village, r.district].filter(Boolean).join(', ')}</td>
                    <td className="px-3 py-2 text-slate-600">{r.primary_craft ? CRAFT_CATEGORY[r.primary_craft] : '—'}</td>
                    <td className="px-3 py-2"><ArtisanStatusBadge status={r.status} /></td>
                    <td className="px-3 py-2 text-slate-600">
                      {r.profiles?.full_name ?? <Chip tone="amber">Unassigned</Chip>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/admin/registry/${r.id}`} className="text-sm font-medium text-brand-600 hover:underline" data-testid="queue-manage">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
