import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import TaskCard, { type TaskArtisan } from '@/components/field/TaskCard';
import SyncStatusBanner from '@/components/field/SyncStatusBanner';
import { EmptyState } from '@/components/ui';

interface AssignmentRow {
  id: string;
  status: string;
  priority: string;
  due_date: string | null;
  artisan: TaskArtisan | null;
}

export default async function FieldHomePage() {
  const profile = await getProfile('verifier');
  const supabase = createClient('verifier');

  const { data } = await supabase
    .from('assignments')
    .select(
      'id, status, priority, due_date, artisan:artisans(id, full_name, village, district, primary_craft, phone, status, priority)',
    )
    .eq('verifier_id', profile!.id)
    .order('due_date', { ascending: true });

  const rows = (data ?? []) as unknown as AssignmentRow[];
  const open = rows.filter((r) => r.status === 'assigned' || r.status === 'in_progress');
  const revisit = open.filter((r) => r.artisan?.status === 'revisit_required' || r.priority === 'revisit');
  const today = open.filter((r) => !revisit.includes(r));
  const completed = rows.filter((r) => r.status === 'completed');

  return (
    <div>
      <SyncStatusBanner />

      <Section title="Today's Work" count={today.length} testid="today-section">
        {today.length === 0 ? (
          <EmptyState title="No pending visits" description="You're all caught up for now." />
        ) : (
          today.map((r) => r.artisan && <TaskCard key={r.id} artisan={r.artisan} cta={r.status === 'in_progress' ? 'Continue' : 'Start Visit'} />)
        )}
      </Section>

      {revisit.length > 0 ? (
        <Section title="Revisit Required" count={revisit.length} testid="revisit-section">
          {revisit.map((r) => r.artisan && <TaskCard key={r.id} artisan={r.artisan} cta="Revisit" />)}
        </Section>
      ) : null}

      {completed.length > 0 ? (
        <Section title="Completed" count={completed.length} testid="completed-section">
          {completed.map((r) => r.artisan && <TaskCard key={r.id} artisan={r.artisan} cta="View" />)}
        </Section>
      ) : null}
    </div>
  );
}

function Section({
  title,
  count,
  testid,
  children,
}: {
  title: string;
  count: number;
  testid?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6" data-testid={testid}>
      <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-field-muted">
        {title}
        <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-xs tabular-nums normal-case tracking-normal text-field-ink">
          {count}
        </span>
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
