import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardBody, Chip, EmptyState, Input, Select, Button, ProgressBar } from '@/components/ui';
import { ArtisanStatusBadge } from '@/components/badges';
import {
  ARTISAN_STATUS,
  ARTISAN_STATUS_ORDER,
  CRAFT_CATEGORY,
  REGISTRATION_SOURCE,
  enumOptions,
  type ArtisanStatus,
} from '@/lib/domain';
import { maskPhone, formatDate } from '@/lib/format';

interface SearchParams {
  q?: string;
  status?: string;
  craft?: string;
  source?: string;
  state?: string;
  district?: string;
}

export default async function RegistryPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  let query = supabase
    .from('artisans')
    .select('id, artisan_code, full_name, phone, state, district, village, primary_craft, registration_source, status, data_completeness, duplicate_risk, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (searchParams.q) query = query.ilike('full_name', `%${searchParams.q}%`);
  if (searchParams.status) query = query.eq('status', searchParams.status as ArtisanStatus);
  if (searchParams.craft) query = query.eq('primary_craft', searchParams.craft as never);
  if (searchParams.source) query = query.eq('registration_source', searchParams.source as never);
  if (searchParams.state) query = query.ilike('state', `%${searchParams.state}%`);
  if (searchParams.district) query = query.ilike('district', `%${searchParams.district}%`);

  const { data } = await query;
  const artisans = data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Artisan Registry</h1>
        <span className="text-sm text-slate-500">{artisans.length} record(s)</span>
      </div>

      <Card className="mb-4">
        <CardBody>
          <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="registry-filters">
            <Input name="q" placeholder="Search name…" defaultValue={searchParams.q ?? ''} data-testid="registry-search" />
            <Select name="status" defaultValue={searchParams.status ?? ''} data-testid="registry-status">
              <option value="">All statuses</option>
              {ARTISAN_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {ARTISAN_STATUS[s].label}
                </option>
              ))}
            </Select>
            <Select name="craft" defaultValue={searchParams.craft ?? ''}>
              <option value="">All crafts</option>
              {enumOptions(CRAFT_CATEGORY).map((c) => (
                <option key={c} value={c}>
                  {CRAFT_CATEGORY[c]}
                </option>
              ))}
            </Select>
            <Select name="source" defaultValue={searchParams.source ?? ''}>
              <option value="">All sources</option>
              {enumOptions(REGISTRATION_SOURCE).map((s) => (
                <option key={s} value={s}>
                  {REGISTRATION_SOURCE[s]}
                </option>
              ))}
            </Select>
            <Input name="state" placeholder="State" defaultValue={searchParams.state ?? ''} />
            <Input name="district" placeholder="District" defaultValue={searchParams.district ?? ''} />
            <div className="flex gap-2">
              <Button type="submit" data-testid="registry-apply">Apply</Button>
              <Link href="/admin/registry">
                <Button type="button" variant="secondary">Clear</Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>

      {artisans.length === 0 ? (
        <EmptyState title="No artisans match these filters." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm" data-testid="registry-table">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Artisan ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">District</th>
                  <th className="px-3 py-2">Craft</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 w-28">Completeness</th>
                  <th className="px-3 py-2">Dup</th>
                  <th className="px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {artisans.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">
                      <Link href={`/admin/registry/${a.id}`} className="text-brand-600 hover:underline">
                        {a.artisan_code}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      <Link href={`/admin/registry/${a.id}`} className="hover:underline">
                        {a.full_name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{maskPhone(a.phone)}</td>
                    <td className="px-3 py-2 text-slate-600">{a.district ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{a.primary_craft ? CRAFT_CATEGORY[a.primary_craft] : '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{REGISTRATION_SOURCE[a.registration_source]}</td>
                    <td className="px-3 py-2"><ArtisanStatusBadge status={a.status} /></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={a.data_completeness} className="w-16" meter />
                        <span className="text-xs text-slate-500">{a.data_completeness}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {a.duplicate_risk === 'high' ? <Chip tone="purple">High</Chip> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">{formatDate(a.updated_at)}</td>
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
