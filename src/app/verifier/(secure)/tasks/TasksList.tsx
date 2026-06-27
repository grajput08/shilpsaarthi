'use client';

import { useMemo, useState } from 'react';
import TaskCard, { type TaskArtisan } from '@/components/field/TaskCard';
import { EmptyState, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

interface Row {
  assignmentId: string;
  assignmentStatus: string;
  artisan: TaskArtisan;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'completed', label: 'Completed' },
] as const;

export default function TasksList({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === 'open' && !['assigned', 'in_progress'].includes(r.assignmentStatus)) return false;
      if (filter === 'completed' && r.assignmentStatus !== 'completed') return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${r.artisan.full_name} ${r.artisan.village ?? ''} ${r.artisan.district ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filter, query]);

  return (
    <div>
      <Input
        placeholder="Search name or village…"
        value={query}
        data-testid="task-search"
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium',
              'transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
              filter === f.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No assigned artisans for this filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <TaskCard
              key={r.assignmentId}
              artisan={r.artisan}
              cta={r.assignmentStatus === 'completed' ? 'View' : r.assignmentStatus === 'in_progress' ? 'Continue' : 'Start Visit'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
