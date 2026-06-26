import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, EmptyState, Chip } from '@/components/ui';
import { PriorityBadge } from '@/components/badges';
import { formatDate } from '@/lib/format';
import type { PriorityLevel } from '@/lib/domain';

const STATUS_TONE: Record<string, 'gray' | 'blue' | 'amber' | 'green' | 'red'> = {
  assigned: 'amber',
  in_progress: 'blue',
  completed: 'green',
  reassigned: 'gray',
  cancelled: 'red',
};

export default async function AssignmentsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('assignments')
    .select(
      'id, status, priority, due_date, created_at, artisan:artisans(id, full_name, village, district), verifier:profiles!assignments_verifier_id_fkey(full_name)',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as {
    id: string;
    status: string;
    priority: PriorityLevel;
    due_date: string | null;
    artisan: { id: string; full_name: string; village: string | null; district: string | null } | null;
    verifier: { full_name: string } | null;
  }[];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Assignments</h1>
      {rows.length === 0 ? (
        <EmptyState title="No assignments yet." description="Assign verifiers from the verification queue or an artisan profile." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm" data-testid="assignments-table">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Artisan</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Verifier</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {r.artisan ? (
                        <Link href={`/admin/registry/${r.artisan.id}`} className="hover:underline">
                          {r.artisan.full_name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{[r.artisan?.village, r.artisan?.district].filter(Boolean).join(', ')}</td>
                    <td className="px-3 py-2 text-slate-600">{r.verifier?.full_name ?? '—'}</td>
                    <td className="px-3 py-2"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-3 py-2 text-slate-600">{formatDate(r.due_date)}</td>
                    <td className="px-3 py-2"><Chip tone={STATUS_TONE[r.status] ?? 'gray'}>{r.status.replace('_', ' ')}</Chip></td>
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
