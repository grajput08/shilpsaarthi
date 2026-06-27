import * as React from 'react';
import { cn } from '@/lib/cn';

type Tone = 'gray' | 'blue' | 'brand' | 'amber' | 'saffron' | 'green' | 'red' | 'purple' | 'teal';

const toneClasses: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-india-50 text-india-700 ring-india-200',
  saffron: 'bg-saffron-50 text-saffron-700 ring-saffron-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
};

export function Chip({
  tone = 'gray',
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A small, accessible loading indicator. Inherits text color via currentColor. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

export function Card({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/70 bg-white shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4', className)}>
      <div>
        <h3 className="text-sm font-bold tracking-tight text-brand-900">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('px-5 py-5', className)}>{children}</div>;
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500/50',
  secondary:
    'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:ring-slate-400 active:bg-slate-100 focus-visible:ring-brand-500/50',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400/50',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500/50',
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    block?: boolean;
    loading?: boolean;
  }
>(function Button({ variant = 'primary', block, loading, disabled, className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
        'transition-[transform,background-color,box-shadow,color,opacity] duration-150 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 motion-reduce:active:scale-100',
        buttonVariants[variant],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

const statAccents = {
  saffron: 'bg-saffron-50 text-saffron-600',
  green: 'bg-india-50 text-india-600',
  slate: 'bg-slate-100 text-slate-500',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
} as const;

export function Stat({
  label,
  value,
  hint,
  tone,
  icon,
  accent = 'slate',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: Tone;
  icon?: React.ReactNode;
  accent?: keyof typeof statAccents;
}) {
  return (
    <Card className="p-4 transition-shadow duration-150 hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 [text-wrap:balance]">{label}</p>
        {icon ? (
          <span className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', statAccents[accent])}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[1.75rem] font-bold leading-none tabular-nums tracking-tight text-slate-900">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs text-slate-500">{tone ? <Chip tone={tone}>{hint}</Chip> : hint}</p>
      ) : null}
    </Card>
  );
}

export function ProgressBar({
  value,
  className,
  meter,
}: {
  value: number;
  className?: string;
  /** Color by value thresholds (red/amber/green) — for completeness meters. */
  meter?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fill = meter
    ? pct >= 80
      ? 'bg-emerald-500'
      : pct >= 50
        ? 'bg-amber-500'
        : 'bg-red-500'
    : 'bg-brand-600';
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Label({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required ? (
        <span className="ml-0.5 text-brand-600" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

/** Validation state shared by all field controls. */
type FieldStatus = { invalid?: boolean; valid?: boolean };

function fieldClass({ invalid, valid }: FieldStatus): string {
  return cn(
    'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400',
    'transition-[border-color,box-shadow,background-color] duration-150 ease-out',
    'focus:outline-none focus:ring-2',
    'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/25'
      : valid
        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/25'
        : 'border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-500/30',
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & FieldStatus
>(function Input({ className, invalid, valid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldClass({ invalid, valid }), valid && 'pr-10', className)}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldStatus
>(function Textarea({ className, invalid, valid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldClass({ invalid, valid }), 'min-h-[88px] resize-y', className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & FieldStatus
>(function Select({ className, children, invalid, valid, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldClass({ invalid, valid }), 'cursor-pointer pr-8', className)}
      {...props}
    >
      {children}
    </select>
  );
});

/**
 * A labelled field wrapper with accessible inline validation.
 * - `error` renders below the control with role="alert" and is announced.
 * - `valid` shows a subtle success check (for text inputs).
 * - `shake` triggers a one-shot shake animation (use with a changing `key` or
 *   toggle to re-fire on repeated invalid submits).
 */
export function FormRow({
  label,
  htmlFor,
  required,
  error,
  hint,
  valid,
  shake,
  errorId,
  errorTestId,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  valid?: boolean;
  shake?: boolean;
  errorId?: string;
  errorTestId?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(shake && 'animate-shake', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      <div className="relative">
        {children}
        {valid && !error ? (
          <svg
            className="animate-pop-in pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.29 6.8-6.8a1 1 0 0 1 1.4 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
      </div>
      {error ? (
        <p
          id={errorId}
          data-testid={errorTestId}
          role="alert"
          className="animate-step-enter mt-1.5 flex items-start gap-1 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500 [text-wrap:pretty]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
