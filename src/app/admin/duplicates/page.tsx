import { createClient } from '@/lib/supabase/server';
import { Card, CardBody, Chip, EmptyState } from '@/components/ui';
import { DASHBOARD_PAGE_TITLE } from '@/components/admin/dashboard-layout';
import DuplicateRow from '@/components/admin/DuplicateRow';

interface Mini {
  id: string;
  full_name: string;
  phone: string | null;
  village: string | null;
  district: string | null;
  artisan_code: string | null;
  status: string;
}

export default async function DuplicatesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('duplicate_candidates')
    .select(
      `id, signal, status, score,
       left:artisans!duplicate_candidates_artisan_id_fkey(id, full_name, phone, village, district, artisan_code, status),
       right:artisans!duplicate_candidates_match_artisan_id_fkey(id, full_name, phone, village, district, artisan_code, status)`,
    )
    .eq('status', 'open')
    .order('score', { ascending: false });

  const rows = (data ?? []) as unknown as {
    id: string;
    signal: string;
    score: number;
    left: Mini | null;
    right: Mini | null;
  }[];

  const openCount = rows.filter((r) => r.left && r.right).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={DASHBOARD_PAGE_TITLE}>Duplicate Management</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 [text-wrap:pretty]">
            Review potential duplicate registrations, choose which record to keep, or dismiss false positives.
          </p>
        </div>
        <Chip tone={openCount > 0 ? 'amber' : 'green'}>
          {openCount} open {openCount === 1 ? 'candidate' : 'candidates'}
        </Chip>
      </div>

      {openCount === 0 ? (
        <EmptyState
          title="No open duplicate candidates."
          description="Auto-detection runs on every new registration. Resolved pairs appear in registry history."
        />
      ) : (
        <div className="space-y-4" data-testid="duplicates-list">
          {rows.map((r) =>
            r.left && r.right ? (
              <DuplicateRow
                key={r.id}
                candidateId={r.id}
                signal={r.signal}
                score={r.score}
                left={r.left}
                right={r.right}
              />
            ) : null,
          )}
        </div>
      )}

      {openCount > 0 ? (
        <Card className="mt-4 border-dashed">
          <CardBody className="py-4">
            <p className="text-xs text-slate-500 [text-wrap:pretty]">
              Merging keeps the selected master record and marks the other as a duplicate. Dismissed pairs are not
              flagged again unless a new signal appears.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
