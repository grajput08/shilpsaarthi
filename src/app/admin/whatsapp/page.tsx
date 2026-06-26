import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardBody, EmptyState } from '@/components/ui';
import { WhatsappStatusBadge } from '@/components/badges';
import WhatsAppConsole from '@/components/admin/WhatsAppConsole';
import { formatDateTime } from '@/lib/format';
import type { WhatsappStatus } from '@/lib/domain';

export default async function WhatsAppPage() {
  const supabase = createClient();
  const { data: templates } = await supabase
    .from('whatsapp_templates')
    .select('template_key, name, body')
    .order('name');
  const { data: artisans } = await supabase
    .from('artisans')
    .select('id, full_name, village, district, artisan_code')
    .order('updated_at', { ascending: false })
    .limit(50);
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('id, body, status, sent_at, template_key, to_phone, artisan:artisans(id, full_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  const rows = (messages ?? []) as unknown as {
    id: string;
    body: string;
    status: WhatsappStatus;
    sent_at: string | null;
    template_key: string | null;
    to_phone: string | null;
    artisan: { id: string; full_name: string } | null;
  }[];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">WhatsApp Console</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WhatsAppConsole templates={templates ?? []} artisans={artisans ?? []} />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Message log" subtitle={`${rows.length} recent message(s)`} />
            <CardBody>
              {rows.length === 0 ? (
                <EmptyState title="No messages sent yet." />
              ) : (
                <div className="space-y-3" data-testid="wa-log">
                  {rows.map((m) => (
                    <div key={m.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">
                          {m.artisan ? (
                            <Link href={`/admin/registry/${m.artisan.id}`} className="hover:underline">
                              {m.artisan.full_name}
                            </Link>
                          ) : (
                            'Broadcast'
                          )}
                          <span className="ml-2 text-xs text-slate-400">{m.template_key ?? 'custom'}</span>
                        </span>
                        <WhatsappStatusBadge status={m.status} />
                      </div>
                      <p className="mt-1 text-slate-600">{m.body}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(m.sent_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
