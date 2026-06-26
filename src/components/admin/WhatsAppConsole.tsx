'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardBody, FormRow, Select } from '@/components/ui';
import { sendWhatsApp } from '@/app/admin/actions';

interface Template {
  template_key: string;
  name: string;
  body: string;
}
interface Artisan {
  id: string;
  full_name: string;
  village: string | null;
  district: string | null;
  artisan_code: string | null;
}

function render(body: string, vars: Record<string, string>) {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k: string) => vars[k] ?? `{{${k}}}`);
}

export default function WhatsAppConsole({ templates, artisans }: { templates: Template[]; artisans: Artisan[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [templateKey, setTemplateKey] = useState(templates[0]?.template_key ?? '');
  const [artisanId, setArtisanId] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const template = templates.find((t) => t.template_key === templateKey);
  const artisan = artisans.find((a) => a.id === artisanId);

  const preview = useMemo(() => {
    if (!template) return '';
    return render(template.body, {
      name: artisan?.full_name ?? 'Artisan',
      village: artisan?.village ?? 'your village',
      district: artisan?.district ?? 'your district',
      artisan_id: artisan?.artisan_code ?? 'ART-XXXX',
      verifier_name: 'your field verifier',
      date: 'soon',
      helpline: '1800-000-000',
      form_link: 'https://wa.me/registration',
      detail: 'profile details',
      document: 'ID proof',
      craft: 'your craft',
    });
  }, [template, artisan]);

  function send() {
    setMsg(null);
    startTransition(async () => {
      const fd = new FormData();
      if (artisanId) fd.set('artisan_id', artisanId);
      fd.set('template_key', templateKey);
      const res = await sendWhatsApp(fd);
      if (res.ok) {
        setMsg({ ok: true, text: 'Message sent (mock) and logged.' });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error ?? 'Send failed.' });
      }
    });
  }

  return (
    <Card>
      <CardHeader title="Compose message" subtitle="Mock provider — messages are persisted and shown in the timeline." />
      <CardBody className="space-y-3">
        <FormRow label="Audience (artisan)" htmlFor="wa-audience">
          <Select id="wa-audience" data-testid="wa-audience" value={artisanId} onChange={(e) => setArtisanId(e.target.value)}>
            <option value="">— Broadcast / no specific artisan —</option>
            {artisans.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name} {a.village ? `(${a.village})` : ''}
              </option>
            ))}
          </Select>
        </FormRow>
        <FormRow label="Template" htmlFor="wa-tpl">
          <Select id="wa-tpl" data-testid="wa-console-template" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)}>
            {templates.map((t) => (
              <option key={t.template_key} value={t.template_key}>
                {t.name}
              </option>
            ))}
          </Select>
        </FormRow>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Preview</p>
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-slate-800" data-testid="wa-preview">
            {preview || 'Select a template…'}
          </div>
        </div>
        {msg ? (
          <p data-testid="wa-result" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </p>
        ) : null}
        <Button onClick={send} disabled={pending || !templateKey} data-testid="wa-console-send">
          {pending ? 'Sending…' : 'Send now'}
        </Button>
      </CardBody>
    </Card>
  );
}
