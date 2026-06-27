import { Check, Circle } from 'lucide-react';
import { FieldFormCard } from '@/components/field/verify/VerifyFormBits';
import { cn } from '@/lib/cn';

export default function VerificationChecklist({
  items,
}: {
  items: { label: string; done: boolean; partial?: boolean }[];
}) {
  return (
    <FieldFormCard>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-india-600 text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            ) : item.partial ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-amber-500">
                <Circle className="h-4 w-4 fill-amber-400 stroke-amber-500" />
              </span>
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white" />
            )}
            <span className={cn('font-medium', item.done ? 'text-field-ink' : item.partial ? 'text-amber-800' : 'text-field-muted')}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </FieldFormCard>
  );
}
