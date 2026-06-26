import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';

type AuditAction = Database['public']['Enums']['audit_action'];

export interface AuditEntry {
  entityType: string;
  entityId: string | null;
  action: AuditAction;
  actorId?: string | null;
  actorRole?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string | null;
  source: string;
}

/**
 * Write a business-event audit row. Must use a service-role client (RLS denies
 * direct inserts to audit_logs); data-change events are covered by DB triggers.
 */
export async function logAudit(
  admin: SupabaseClient<Database>,
  entry: AuditEntry,
): Promise<void> {
  await admin.from('audit_logs').insert({
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    action: entry.action,
    actor_id: entry.actorId ?? null,
    actor_role: entry.actorRole ?? null,
    old_value: (entry.oldValue as never) ?? null,
    new_value: (entry.newValue as never) ?? null,
    reason: entry.reason ?? null,
    source: entry.source,
  });
}
