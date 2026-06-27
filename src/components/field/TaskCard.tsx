import Link from 'next/link';
import { Card } from '@/components/ui';
import { ArtisanStatusBadge, PriorityBadge } from '@/components/badges';
import { CRAFT_CATEGORY, type ArtisanStatus, type CraftCategory, type PriorityLevel } from '@/lib/domain';
import { Phone, MessageCircle, Navigation, MapPin } from 'lucide-react';

export interface TaskArtisan {
  id: string;
  full_name: string;
  village: string | null;
  district: string | null;
  primary_craft: CraftCategory | null;
  phone: string | null;
  status: ArtisanStatus;
  priority: PriorityLevel;
}

const iconBtn =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100';

export default function TaskCard({ artisan, cta = 'Start Visit' }: { artisan: TaskArtisan; cta?: string }) {
  const mapsQuery = [artisan.village, artisan.district].filter(Boolean).join(' ');
  return (
    <Card className="p-4 transition-shadow duration-150 hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-slate-900">{artisan.full_name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{[artisan.village, artisan.district].filter(Boolean).join(', ') || '—'}</span>
          </p>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {artisan.primary_craft ? CRAFT_CATEGORY[artisan.primary_craft] : 'Craft not set'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ArtisanStatusBadge status={artisan.status} />
          <PriorityBadge priority={artisan.priority} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/verifier/artisans/${artisan.id}`}
          data-testid="task-start"
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-brand-600 px-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-brand-700 active:scale-[0.98] motion-reduce:active:scale-100"
        >
          {cta}
        </Link>
        {artisan.phone ? (
          <a href={`tel:${artisan.phone}`} aria-label={`Call ${artisan.full_name}`} className={iconBtn}>
            <Phone className="h-[18px] w-[18px]" />
          </a>
        ) : null}
        {artisan.phone ? (
          <a href={`https://wa.me/91${artisan.phone}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${artisan.full_name}`} className={iconBtn}>
            <MessageCircle className="h-[18px] w-[18px]" />
          </a>
        ) : null}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Open in maps"
          className={iconBtn}
        >
          <Navigation className="h-[18px] w-[18px]" />
        </a>
      </div>
    </Card>
  );
}
