import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';

export interface OnboardingRow {
  id: string;
  artisanCode: string | null;
  name: string;
  craft: string;
  state: string | null;
  channel: string;
  date: string;
}

export default function RecentOnboardingsTable({
  title,
  rows,
  emptyLabel = 'No onboardings yet',
}: {
  title: string;
  rows: OnboardingRow[];
  emptyLabel?: string;
}) {
  return (
    <Card>
      <CardHeader title={title} className="border-b-0 pb-0" />
      <CardBody className="overflow-x-auto pt-3">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">{emptyLabel}</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Adi Setu ID</th>
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Craft</th>
                <th className="pb-3 pr-4 font-medium">State</th>
                <th className="pb-3 pr-4 font-medium">Channel</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="text-slate-700">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/registry/${r.id}`} className="font-medium text-[#1a3b70] hover:underline">
                      {r.artisanCode ?? '—'}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{r.name}</td>
                  <td className="py-3 pr-4">{r.craft}</td>
                  <td className="py-3 pr-4">{r.state ?? '—'}</td>
                  <td className="py-3 pr-4">{r.channel}</td>
                  <td className="py-3 tabular-nums text-slate-600">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
}
