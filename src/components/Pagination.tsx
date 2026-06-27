import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const linkClass =
  'inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 disabled:pointer-events-none';

export function Pagination({
  page,
  pageSize,
  total,
  hrefForPage,
  className,
  testId,
}: {
  page: number;
  pageSize: number;
  total: number;
  hrefForPage: (page: number) => string;
  className?: string;
  testId?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav
      className={cn('flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3', className)}
      aria-label="Pagination"
      data-testid={testId}
    >
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}</span>–
        <span className="font-medium text-slate-700">{end}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className={cn(linkClass, 'cursor-not-allowed text-slate-400 opacity-60')} aria-disabled="true">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </span>
        ) : (
          <Link href={hrefForPage(page - 1)} className={cn(linkClass, 'text-slate-700')} data-testid={testId ? `${testId}-prev` : undefined}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Link>
        )}
        <span className="px-2 text-sm text-slate-600">
          Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalPages}</span>
        </span>
        {nextDisabled ? (
          <span className={cn(linkClass, 'cursor-not-allowed text-slate-400 opacity-60')} aria-disabled="true">
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        ) : (
          <Link href={hrefForPage(page + 1)} className={cn(linkClass, 'text-slate-700')} data-testid={testId ? `${testId}-next` : undefined}>
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </nav>
  );
}
