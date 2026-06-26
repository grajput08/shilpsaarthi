'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardBody, FormRow, Select, Input } from '@/components/ui';
import { assignVerifier, updateArtisanStatus, sendWhatsApp, type ActionResult } from '@/app/admin/actions';

interface Props {
  artisanId: string;
  verifiers: { id: string; full_name: string }[];
  templates: { template_key: string; name: string }[];
  canAssign: boolean;
}

export default function ArtisanActions({ artisanId, verifiers, templates, canAssign }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function run(fn: () => Promise<ActionResult>, successText: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setMsg({ ok: true, text: successText });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error ?? 'Action failed.' });
      }
    });
  }

  function statusForm(status: string, label: string) {
    return (
      <Button
        variant={status === 'rejected' ? 'danger' : 'secondary'}
        disabled={pending}
        data-testid={`status-${status}`}
        onClick={() => {
          const fd = new FormData();
          fd.set('artisan_id', artisanId);
          fd.set('status', status);
          run(() => updateArtisanStatus(fd), `Marked as ${label}.`);
        }}
      >
        {label}
      </Button>
    );
  }

  return (
    <Card data-testid="admin-actions">
      <CardHeader title="Admin actions" />
      <CardBody className="space-y-4">
        {msg ? (
          <p
            data-testid="action-msg"
            className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
          >
            {msg.text}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {statusForm('verified', 'Approve')}
          {statusForm('needs_correction', 'Request correction')}
          {statusForm('market_ready', 'Mark market ready')}
          {statusForm('rejected', 'Reject')}
        </div>

        {canAssign ? (
          <AssignBlock
            artisanId={artisanId}
            verifiers={verifiers}
            pending={pending}
            onRun={(fd) => run(() => assignVerifier(fd), 'Verifier assigned.')}
          />
        ) : null}

        <WhatsAppBlock
          artisanId={artisanId}
          templates={templates}
          pending={pending}
          onRun={(fd) => run(() => sendWhatsApp(fd), 'WhatsApp message sent (mock).')}
        />
      </CardBody>
    </Card>
  );
}

function AssignBlock({
  artisanId,
  verifiers,
  pending,
  onRun,
}: {
  artisanId: string;
  verifiers: { id: string; full_name: string }[];
  pending: boolean;
  onRun: (fd: FormData) => void;
}) {
  const [verifier, setVerifier] = useState(verifiers[0]?.id ?? '');
  const [due, setDue] = useState('');
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-700">Assign / reassign verifier</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <FormRow label="Verifier" htmlFor="assign-verifier">
          <Select id="assign-verifier" data-testid="assign-verifier" value={verifier} onChange={(e) => setVerifier(e.target.value)}>
            {verifiers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.full_name}
              </option>
            ))}
          </Select>
        </FormRow>
        <FormRow label="Due date" htmlFor="assign-due">
          <Input id="assign-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </FormRow>
        <div className="flex items-end">
          <Button
            block
            disabled={pending || !verifier}
            data-testid="assign-submit"
            onClick={() => {
              const fd = new FormData();
              fd.set('artisan_id', artisanId);
              fd.set('verifier_id', verifier);
              if (due) fd.set('due_date', due);
              onRun(fd);
            }}
          >
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}

function WhatsAppBlock({
  artisanId,
  templates,
  pending,
  onRun,
}: {
  artisanId: string;
  templates: { template_key: string; name: string }[];
  pending: boolean;
  onRun: (fd: FormData) => void;
}) {
  const [tpl, setTpl] = useState(templates[0]?.template_key ?? '');
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-700">Send WhatsApp (mock)</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <FormRow label="Template" htmlFor="wa-template">
            <Select id="wa-template" data-testid="wa-template" value={tpl} onChange={(e) => setTpl(e.target.value)}>
              {templates.map((t) => (
                <option key={t.template_key} value={t.template_key}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FormRow>
        </div>
        <div className="flex items-end">
          <Button
            block
            disabled={pending || !tpl}
            data-testid="wa-send"
            onClick={() => {
              const fd = new FormData();
              fd.set('artisan_id', artisanId);
              fd.set('template_key', tpl);
              onRun(fd);
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
