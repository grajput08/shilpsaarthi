import { createClient } from '@/lib/supabase/server';
import { Card, Chip, EmptyState } from '@/components/ui';
import { formatDateTime } from '@/lib/format';

const ACTION_TONE: Record<string, 'gray' | 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'teal'> = {
  created: 'blue',
  updated: 'gray',
  status_changed: 'amber',
  consent_captured: 'teal',
  verifier_assigned: 'blue',
  whatsapp_sent: 'green',
  verification_submitted: 'purple',
  approved: 'green',
  rejected: 'red',
  duplicate_merged: 'purple',
  export_downloaded: 'gray',
  form_submitted: 'blue',
  deleted: 'red',
};

export default async function AuditPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('audit_logs')
    .select('id, entity_type, entity_id, action, actor_role, source, reason, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = data ?? [];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Audit Log &amp; Compliance</h1>
      <p className="mb-4 text-sm text-slate-500">{rows.length} most recent events. Read-only and immutable.</p>

      {rows.length === 0 ? (
        <EmptyState title="No audit entries visible in your scope." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm" data-testid="audit-table">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Entity</th>
                  <th className="px-3 py-2">Actor role</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-xs text-slate-500">{formatDateTime(r.created_at)}</td>
                    <td className="px-3 py-2">
                      <Chip tone={ACTION_TONE[r.action] ?? 'gray'}>{r.action.replace(/_/g, ' ')}</Chip>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {r.entity_type}
                      {r.entity_id ? <span className="ml-1 font-mono text-xs text-slate-400">{r.entity_id.slice(0, 8)}</span> : null}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.actor_role ?? 'system'}</td>
                    <td className="px-3 py-2 text-slate-600">{r.source}</td>
                    <td className="px-3 py-2 text-slate-500">{r.reason ?? '—'}</td>
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
