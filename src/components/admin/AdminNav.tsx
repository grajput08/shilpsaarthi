'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { LayoutDashboard, Users, ClipboardList, UserCog, Copy } from 'lucide-react';

const items = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/registry', label: 'Artisan Registry', icon: Users },
  { href: '/admin/queue', label: 'Verification Queue', icon: ClipboardList },
  { href: '/admin/team', label: 'Field Team', icon: UserCog },
  { href: '/admin/duplicates', label: 'Duplicates', icon: Copy },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-0.5">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color] duration-150',
              active
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            <Icon className={cn('h-[18px] w-[18px]', active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500')} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
