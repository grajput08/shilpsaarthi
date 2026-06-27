'use client';

import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ROLE_LABEL } from '@/lib/domain';
import type { Profile } from '@/lib/auth';
import { Chip } from '@/components/ui';
import AdminNav from '@/components/admin/AdminNav';
import { AdiSetuLogo } from '@/components/brand/AdiSetuBrand';
import SignOutButton from '@/components/SignOutButton';

export default function AdminSidebar({ profile }: { profile: Profile }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white py-4 transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-[4.5rem] px-2' : 'w-64 px-3',
      )}
    >
      <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'justify-between px-2')}>
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <AdiSetuLogo className="h-8 w-8 shrink-0 text-brand-600" />
          {!collapsed ? (
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-slate-900">Adi Setu</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Admin CRM</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
        </button>
      </div>

      <div className="mt-6 flex-1">
        <AdminNav collapsed={collapsed} />
      </div>

      <div className={cn('rounded-xl bg-slate-50', collapsed ? 'p-2' : 'p-3')}>
        {!collapsed ? (
          <>
            <p className="truncate text-sm font-semibold text-slate-800">{profile.full_name}</p>
            <div className="mt-1.5">
              <Chip tone="brand">{ROLE_LABEL[profile.role]}</Chip>
            </div>
            {profile.state ? (
              <p className="mt-1.5 text-xs text-slate-500 [text-wrap:pretty]">
                Scope: {profile.district ? `${profile.district}, ` : ''}
                {profile.state}
              </p>
            ) : null}
            <div className="mt-2">
              <SignOutButton portal="admin" />
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <SignOutButton portal="admin" compact />
          </div>
        )}
      </div>
    </aside>
  );
}
