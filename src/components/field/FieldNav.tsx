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
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md border-t border-slate-200 bg-white">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium',
              active ? 'text-brand-600' : 'text-slate-500',
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
