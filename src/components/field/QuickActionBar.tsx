import { Phone, MessageCircle, Compass, Flag } from 'lucide-react';
import { cn } from '@/lib/cn';

const actionBase =
  'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100';

export default function QuickActionBar({
  phone,
  name,
  mapsQuery,
  showFlag,
}: {
  phone: string | null;
  name: string;
  mapsQuery: string;
  showFlag?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {phone ? (
        <a
          href={`tel:${phone}`}
          aria-label={`Call ${name}`}
          className={cn(actionBase, 'bg-stone-100/80 text-field-ink hover:bg-stone-200/80')}
        >
          <Phone className="h-[18px] w-[18px]" />
          Call
        </a>
      ) : (
        <span className={cn(actionBase, 'cursor-not-allowed bg-stone-50 text-stone-300')} aria-hidden>
          <Phone className="h-[18px] w-[18px]" />
          Call
        </span>
      )}
      {phone ? (
        <a
          href={`https://wa.me/91${phone}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Chat with ${name}`}
          className={cn(actionBase, 'bg-stone-100/80 text-field-ink hover:bg-stone-200/80')}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          Chat
        </a>
      ) : (
        <span className={cn(actionBase, 'cursor-not-allowed bg-stone-50 text-stone-300')} aria-hidden>
          <MessageCircle className="h-[18px] w-[18px]" />
          Chat
        </span>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Open in maps"
        className={cn(actionBase, 'bg-stone-100/80 text-field-ink hover:bg-stone-200/80')}
      >
        <Compass className="h-[18px] w-[18px]" />
        Map
      </a>
      {showFlag ? (
        <a
          href="#duplicate-alert"
          aria-label="View duplicate warning"
          className={cn(actionBase, 'bg-red-50 text-red-700 hover:bg-red-100')}
        >
          <Flag className="h-[18px] w-[18px]" />
          Flag
        </a>
      ) : (
        <span className={cn(actionBase, 'bg-stone-50 text-stone-300')} aria-hidden>
          <Flag className="h-[18px] w-[18px]" />
          Flag
        </span>
      )}
    </div>
  );
}
