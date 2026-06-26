'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { recordExport } from '@/app/admin/actions';
import { Download } from 'lucide-react';

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(','));
  return lines.join('\n');
}

export default function ExportButton({
  rows,
  filename,
  kind,
  label = 'Export CSV',
}: {
  rows: Record<string, unknown>[];
  filename: string;
  kind: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    await recordExport(kind);
    setBusy(false);
  }

  return (
    <Button onClick={onClick} disabled={busy || rows.length === 0} data-testid="export-csv">
      <Download className="h-4 w-4" />
      {busy ? 'Exporting…' : label}
    </Button>
  );
}
