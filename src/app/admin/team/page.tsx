import { createClient } from '@/lib/supabase/server';
import { Card, CardBody, Chip, EmptyState } from '@/components/ui';
import { ROLE_LABEL } from '@/lib/domain';

export default async function TeamPage() {
  const supabase = createClient();
  const { data: verifiers } = await supabase
    .from('profiles')
    .select('id, full_name, phone, state, district, is_active, role')
    .in('role', ['verifier', 'district_officer'])
    .order('full_name');

  // Assignment counts per verifier (RLS-scoped).
  const { data: assignments } = await supabase.from('assignments').select('verifier_id, status');
  const counts = new Map<string, { active: number; completed: number }>();
  for (const a of assignments ?? []) {
    const c = counts.get(a.verifier_id) ?? { active: 0, completed: 0 };
    if (a.status === 'completed') c.completed += 1;
    else if (a.status === 'assigned' || a.status === 'in_progress') c.active += 1;
    counts.set(a.verifier_id, c);
  }

  const team = verifiers ?? [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Field Team</h1>
      {team.length === 0 ? (
        <EmptyState title="No field team members visible in your scope." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((v) => {
            const c = counts.get(v.id) ?? { active: 0, completed: 0 };
            return (
              <Card key={v.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{v.full_name}</p>
                    <Chip tone={v.is_active ? 'green' : 'gray'}>{v.is_active ? 'Active' : 'Inactive'}</Chip>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{ROLE_LABEL[v.role]}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {[v.district, v.state].filter(Boolean).join(', ') || 'All geographies'}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{c.active}</p>
                      <p className="text-xs text-slate-500">Active</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{c.completed}</p>
                      <p className="text-xs text-slate-500">Completed</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
