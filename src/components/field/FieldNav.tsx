'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Home, ListChecks, RefreshCw } from 'lucide-react';

const items = [
  { href: '/verifier', label: 'Today', icon: Home, exact: true },
  { href: '/verifier/tasks', label: 'Tasks', icon: ListChecks, exact: false },
  { href: '/verifier/sync', label: 'Sync', icon: RefreshCw, exact: false },
];

export default function FieldNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md border-t border-field-border/80 bg-field-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-xs font-medium',
              'transition-colors duration-150 active:bg-stone-100/80 motion-reduce:transition-none',
              active ? 'text-field-accent' : 'text-field-muted hover:text-field-ink',
            )}
          >
            <span
              className={cn(
                'absolute top-0 h-0.5 w-8 rounded-full bg-field-accent transition-all duration-200 ease-out',
                active ? 'opacity-100' : 'opacity-0',
              )}
            />
            <Icon
              className={cn(
                'h-5 w-5 transition-transform duration-150 ease-out',
                active ? 'scale-105' : 'group-active:scale-95',
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
