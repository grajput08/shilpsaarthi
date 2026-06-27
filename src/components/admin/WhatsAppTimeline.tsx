import { Card, CardHeader, CardBody, EmptyState } from '@/components/ui';
import { WhatsappStatusBadge } from '@/components/badges';
import { formatDateTime } from '@/lib/format';
import { WHATSAPP_TEMPLATE_LABEL } from '@/lib/domain';
import type { WhatsappStatus } from '@/lib/domain';
import { MessageCircle } from 'lucide-react';

export interface TimelineMessage {
  id: string;
  body: string;
  status: WhatsappStatus;
  sent_at: string | null;
  template_key: string | null;
  direction?: string | null;
}

/** Vertical timeline of an artisan's (mock) WhatsApp communication history. */
export default function WhatsAppTimeline({ messages }: { messages: TimelineMessage[] }) {
  const items = [...messages].sort((a, b) => ((a.sent_at ?? '') < (b.sent_at ?? '') ? 1 : -1));

  return (
    <Card data-testid="whatsapp-timeline">
      <CardHeader
        title="WhatsApp timeline"
        subtitle={items.length ? `${items.length} message${items.length > 1 ? 's' : ''}` : undefined}
        action={<MessageCircle className="h-4 w-4 text-india-500" />}
      />
      <CardBody>
        {items.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Sent reminders and confirmations will appear here as a timeline."
          />
        ) : (
          <ol className="relative space-y-5 pl-6">
            {/* the connecting rail */}
            <span className="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200" aria-hidden />
            {items.map((m) => (
              <li key={m.id} className="relative">
                <span className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-india-500 shadow-sm ring-1 ring-india-100" />
                </span>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-slate-500">
                    {m.template_key ? WHATSAPP_TEMPLATE_LABEL[m.template_key] ?? m.template_key.replace(/_/g, ' ') : 'Custom message'}
                  </p>
                  <WhatsappStatusBadge status={m.status} />
                </div>
                <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 [text-wrap:pretty]">{m.body}</p>
                <p className="mt-1 text-xs text-slate-400 tabular-nums">{formatDateTime(m.sent_at)}</p>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
