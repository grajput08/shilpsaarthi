'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardBody, FormRow, Input, Select, Chip, EmptyState } from '@/components/ui';
import { CRAFT_CATEGORY, enumOptions } from '@/lib/domain';
import { createRegistrationToken, sendRegistrationLink } from '@/app/admin/actions';
import { formatDateTime } from '@/lib/format';
import { Copy, Check, Send } from 'lucide-react';

interface TokenRow {
  id: string;
  token: string;
  status: string;
  prefill: Record<string, string> | null;
  artisan_id: string | null;
  created_at: string;
  url: string;
}

export default function LinksManager({ tokens, origin }: { tokens: TokenRow[]; origin: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [generated, setGenerated] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPrefill, setShowPrefill] = useState(false);

  function copy(url: string) {
    navigator.clipboard?.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  function generate(form: HTMLFormElement) {
    setError(null);
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createRegistrationToken(fd);
      if (res.ok && res.token && res.url) {
        setGenerated({ token: res.token, url: res.url });
        form.reset();
        router.refresh();
      } else {
        setError(res.error ?? 'Could not generate link.');
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Generate a registration link" subtitle="No name or phone required — optional prefill only." />
        <CardBody>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              generate(e.currentTarget);
            }}
            className="space-y-3"
          >
            <button
              type="button"
              onClick={() => setShowPrefill((s) => !s)}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              {showPrefill ? 'Hide optional prefill' : 'Add optional prefill (state, district, craft…)'}
            </button>
            {showPrefill ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <FormRow label="Full name" htmlFor="pf-name"><Input id="pf-name" name="full_name" /></FormRow>
                <FormRow label="Phone" htmlFor="pf-phone"><Input id="pf-phone" name="phone" inputMode="numeric" maxLength={10} /></FormRow>
                <FormRow label="State" htmlFor="pf-state"><Input id="pf-state" name="state" /></FormRow>
                <FormRow label="District" htmlFor="pf-district"><Input id="pf-district" name="district" /></FormRow>
                <FormRow label="Village" htmlFor="pf-village"><Input id="pf-village" name="village" /></FormRow>
                <FormRow label="Craft" htmlFor="pf-craft">
                  <Select id="pf-craft" name="primary_craft" defaultValue="">
                    <option value="">—</option>
                    {enumOptions(CRAFT_CATEGORY).map((c) => (
                      <option key={c} value={c}>{CRAFT_CATEGORY[c]}</option>
                    ))}
                  </Select>
                </FormRow>
              </div>
            ) : null}
            <Button type="submit" disabled={pending} data-testid="generate-link">
              {pending ? 'Generating…' : 'Generate blank link'}
            </Button>
          </form>

          {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          {generated ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3" data-testid="generated-link">
              <p className="text-xs font-medium text-emerald-700">New public link (no login required):</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs text-slate-700">{generated.url}</code>
                <button onClick={() => copy(generated.url)} className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-white" aria-label="Copy">
                  {copied === generated.url ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent links" subtitle={`${tokens.length} link(s)`} />
        <CardBody>
          {tokens.length === 0 ? (
            <EmptyState title="No links yet." description="Generate one above." />
          ) : (
            <div className="space-y-3" data-testid="links-list">
              {tokens.map((t) => (
                <div key={t.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <code className="truncate rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">{`${origin}/a/form?id=${t.token}`}</code>
                    <Chip tone={t.status === 'active' ? 'green' : t.status === 'used' ? 'blue' : 'gray'}>{t.status}</Chip>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{formatDateTime(t.created_at)}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copy(`${origin}/a/form?id=${t.token}`)} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
                        {copied === `${origin}/a/form?id=${t.token}` ? 'Copied' : 'Copy'}
                      </button>
                      <SendForm token={t.token} prefillPhone={t.prefill?.phone ?? ''} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function SendForm({ token, prefillPhone }: { token: string; prefillPhone: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [phone, setPhone] = useState(prefillPhone);
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set('token', token);
        fd.set('phone', phone);
        startTransition(async () => {
          const res = await sendRegistrationLink(fd);
          if (res.ok) {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
            router.refresh();
          }
        });
      }}
      className="flex items-center gap-1"
    >
      <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="phone" inputMode="numeric" maxLength={10} className="h-8 w-28 py-1 text-xs" />
      <button type="submit" disabled={pending} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50" data-testid="send-link">
        {done ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
        {done ? 'Sent' : 'WhatsApp'}
      </button>
    </form>
  );
}
