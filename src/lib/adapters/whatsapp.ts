import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types';
import { renderTemplate } from '../template';

export { renderTemplate };

type MessageRow = Database['public']['Tables']['whatsapp_messages']['Row'];

export interface SendWhatsappParams {
  artisanId?: string | null;
  templateKey?: string | null;
  toPhone?: string | null;
  language?: string;
  body: string;
  variables?: Record<string, string>;
  sentBy?: string | null;
  campaignId?: string | null;
}

/**
 * MOCK WhatsApp provider. No real network call is made — the message is stamped
 * with a fake provider id, marked `sent`, and persisted to `whatsapp_messages`
 * so the admin console + artisan timeline can display it. Swap this adapter for
 * a real BSP (e.g. Meta Cloud API) later without touching call sites.
 */
export async function sendWhatsappMessage(
  client: SupabaseClient<Database>,
  params: SendWhatsappParams,
): Promise<MessageRow> {
  const providerMessageId = `mock-wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const { data, error } = await client
    .from('whatsapp_messages')
    .insert({
      artisan_id: params.artisanId ?? null,
      template_key: params.templateKey ?? null,
      direction: 'outbound',
      language: params.language ?? 'en',
      to_phone: params.toPhone ?? null,
      body: params.body,
      variables: (params.variables ?? {}) as never,
      status: 'sent',
      sent_by: params.sentBy ?? null,
      sent_at: now,
      provider_message_id: providerMessageId,
      campaign_id: params.campaignId ?? null,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Mock WhatsApp send failed: ${error.message}`);
  return data;
}
