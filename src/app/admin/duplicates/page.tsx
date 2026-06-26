import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui';
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
    left: Mini | null;
    right: Mini | null;
  }[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Duplicate Management</h1>
      <p className="mb-4 text-sm text-slate-500">Resolve potential duplicates: choose a master record or dismiss.</p>
      {rows.length === 0 ? (
        <EmptyState title="No open duplicate candidates." description="Auto-detection runs on every new registration." />
      ) : (
        <div className="space-y-3" data-testid="duplicates-list">
          {rows.map((r) =>
            r.left && r.right ? (
              <DuplicateRow key={r.id} candidateId={r.id} signal={r.signal} left={r.left} right={r.right} />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
