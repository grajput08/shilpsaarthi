import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export function VerifyCheckRow({
  checked,
  label,
  onChange,
  testId,
  disabled,
}: {
  checked: boolean;
  label: string;
  onChange?: (v: boolean) => void;
  testId?: string;
  disabled?: boolean;
}) {
  const Tag = onChange ? 'button' : 'div';
  return (
    <Tag
      type={onChange ? 'button' : undefined}
      data-testid={testId}
      disabled={disabled}
      onClick={onChange ? () => onChange(!checked) : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150',
        checked ? 'bg-india-50/80 text-india-900' : 'bg-stone-50/80 text-field-muted',
        onChange && !disabled && 'cursor-pointer hover:bg-stone-100/80',
        disabled && 'cursor-default opacity-70',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
          checked ? 'border-india-600 bg-india-600 text-white' : 'border-stone-300 bg-white',
        )}
        aria-hidden
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <span className="font-medium">{label}</span>
    </Tag>
  );
}

export function ConsentMethodCard({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-[border-color,background-color] duration-150',
        selected
          ? 'border-field-accent bg-field-accent/5 text-field-ink'
          : 'border-field-border bg-field-surface text-field-muted hover:border-stone-300',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-field-accent bg-field-accent' : 'border-stone-300 bg-white',
        )}
        aria-hidden
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      {label}
    </button>
  );
}

export function FieldFormCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-field-border/80 bg-field-surface p-4 shadow-card', className)}>
      {children}
    </div>
  );
}
