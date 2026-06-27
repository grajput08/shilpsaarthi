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

export default function TaskCard({ artisan, cta = 'Start Visit' }: { artisan: TaskArtisan; cta?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-slate-900">{artisan.full_name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {[artisan.village, artisan.district].filter(Boolean).join(', ') || '—'}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {artisan.primary_craft ? CRAFT_CATEGORY[artisan.primary_craft] : 'Craft not set'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ArtisanStatusBadge status={artisan.status} />
          <PriorityBadge priority={artisan.priority} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/verifier/artisans/${artisan.id}`}
          data-testid="task-start"
          className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          {cta}
        </Link>
        {artisan.phone ? (
          <a href={`tel:${artisan.phone}`} aria-label="Call artisan" className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
            <Phone className="h-4 w-4" />
          </a>
        ) : null}
        {artisan.phone ? (
          <a href={`https://wa.me/91${artisan.phone}`} target="_blank" rel="noreferrer" aria-label="WhatsApp artisan" className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
            <MessageCircle className="h-4 w-4" />
          </a>
        ) : null}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [artisan.village, artisan.district].filter(Boolean).join(' '),
          )}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Navigate"
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
        >
          <Navigation className="h-4 w-4" />
        </a>
      </div>
    </Card>
  );
}
