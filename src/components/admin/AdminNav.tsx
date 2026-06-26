'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCheck,
  MessageSquare,
  Copy,
  BarChart3,
  ScrollText,
} from 'lucide-react';

const items = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/registry', label: 'Artisan Registry', icon: Users },
  { href: '/admin/queue', label: 'Verification Queue', icon: ClipboardList },
  { href: '/admin/assignments', label: 'Assignments', icon: UserCheck },
  { href: '/admin/team', label: 'Field Team', icon: Users },
  { href: '/admin/whatsapp', label: 'WhatsApp Console', icon: MessageSquare },
  { href: '/admin/duplicates', label: 'Duplicates', icon: Copy },
  { href: '/admin/reports', label: 'Reports & Export', icon: BarChart3 },
  { href: '/admin/audit', label: 'Audit Log', icon: ScrollText },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
