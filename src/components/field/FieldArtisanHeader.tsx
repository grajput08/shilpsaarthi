import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ArtisanStatusBadge } from '@/components/badges';

export default function FieldArtisanHeader({
  name,
  code,
  location,
  status,
}: {
  name: string;
  code: string;
  location: string;
  status: Parameters<typeof ArtisanStatusBadge>[0]['status'];
}) {
  return (
    <div className="-mx-4 border-b border-field-border/60 bg-field-surface/80 px-4 pb-4 pt-1 backdrop-blur-sm">
      <Link
        href="/verifier"
        className="mb-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-field-muted transition-colors duration-150 hover:text-field-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-field-ink [text-wrap:balance]">{name}</h1>
          <p className="mt-0.5 text-sm text-field-muted">
            {code}
            {location ? ` · ${location}` : ''}
          </p>
        </div>
        <ArtisanStatusBadge status={status} />
      </div>
    </div>
  );
}
