import { cn } from '@/lib/cn';
import { MapPin } from 'lucide-react';

export default function GpsMapCard({
  lat,
  lng,
  acc,
  onRecapture,
}: {
  lat: number | null;
  lng: number | null;
  acc: number | null;
  onRecapture: () => void;
}) {
  const locked = lat != null && lng != null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-field-border/80 bg-[linear-gradient(135deg,#f5f1ea_25%,#ebe4d8_25%,#ebe4d8_50%,#f5f1ea_50%,#f5f1ea_75%,#ebe4d8_75%)] bg-[length:16px_16px] shadow-card">
      <div className="relative flex min-h-[140px] flex-col justify-between p-4">
        {locked ? (
          <span className="inline-flex w-fit items-center rounded-full bg-india-50 px-2.5 py-1 text-xs font-semibold text-india-700 ring-1 ring-inset ring-india-200">
            GPS locked ±{acc ?? '?'}m
          </span>
        ) : (
          <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            GPS not captured
          </span>
        )}
        <div className="flex flex-1 items-center justify-center py-2">
          <MapPin className={cn('h-10 w-10', locked ? 'text-red-500' : 'text-stone-300')} aria-hidden />
        </div>
        <div className="flex items-end justify-between gap-2">
          {locked ? (
            <p className="text-xs font-medium tabular-nums text-field-ink" data-testid="gps-coords">
              {lat}, {lng}
            </p>
          ) : (
            <p className="text-xs text-field-muted">Tap recapture at visit location</p>
          )}
          <button
            type="button"
            data-testid="capture-gps"
            onClick={onRecapture}
            className="rounded-lg border border-field-accent bg-field-surface px-3 py-1.5 text-xs font-semibold text-field-accent transition-colors duration-150 hover:bg-field-accent/5"
          >
            Recapture
          </button>
        </div>
      </div>
    </div>
  );
}
