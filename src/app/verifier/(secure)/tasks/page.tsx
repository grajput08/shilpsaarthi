import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import TasksList from './TasksList';
import type { TaskArtisan } from '@/components/field/TaskCard';

export default async function FieldTasksPage() {
  const profile = await getProfile();
  const supabase = createClient();
  const { data } = await supabase
    .from('assignments')
    .select(
      'id, status, priority, due_date, artisan:artisans(id, full_name, village, district, primary_craft, phone, status, priority)',
    )
    .eq('verifier_id', profile!.id)
    .order('due_date', { ascending: true });

  const rows = ((data ?? []) as unknown as {
    id: string;
    status: string;
    artisan: TaskArtisan | null;
  }[])
    .filter((r) => r.artisan)
    .map((r) => ({ assignmentId: r.id, assignmentStatus: r.status, artisan: r.artisan! }));

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-field-ink [text-wrap:balance]">Assigned Cases</h1>
      <p className="mb-4 text-sm text-field-muted">Search and filter your verification queue.</p>
      <TasksList rows={rows} />
    </div>
  );
}
