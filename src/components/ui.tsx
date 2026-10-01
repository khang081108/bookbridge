import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '../lib/router';

/* ------------------------------ Icon ------------------------------ */

const PATHS = {
  book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z M5 17a3 3 0 0 1 3-3h11',
  shelf: 'M5 4v16 M10 4v16 M15 6l4 14',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  lines: 'M4 6h16 M4 12h16 M4 18h10',
  play: 'M7 4l13 8-13 8V4z',
  pencil: 'M4 20l1-4L16 5l3 3L8 19l-4 1z M14 7l3 3',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 3l10 18H2L12 3z M12 10v5 M12 18h.01',
  truck: 'M2 7h11v9H2z M13 10h5l3 3v3h-8 M6 19.5a1.5 1.5 0 1 0 0-.01 M17 19.5a1.5 1.5 0 1 0 0-.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  school: 'M3 10l9-6 9 6 M5 10v10h14V10 M10 20v-5h4v5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z M9 12l2 2 4-4',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  x: 'M6 6l12 12 M18 6L6 18',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  tablet: 'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M11 18h2',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  refresh: 'M20 11a8 8 0 0 0-14-4L4 9 M4 5v4h4 M4 13a8 8 0 0 0 14 4l2-2 M20 19v-4h-4',
  plus: 'M12 5v14 M5 12h14',
  lock: 'M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3',
  box: 'M3 8l9-5 9 5v9l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9',
  chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3',
  swap: 'M7 7h12l-3-3 M17 17H5l3 3',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2 20a7 7 0 0 1 14 0 M16 4.5a3.5 3.5 0 0 1 0 6.5 M18 20a7 7 0 0 0-3-5.7',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  // Nếu không truyền kích thước (h-*), dùng cỡ mặc định 20px.
  const cls = /(^|\s)h-\S+/.test(className) ? className : `h-5 w-5 ${className}`.trim();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ------------------------------ Button ------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sun';
type Size = 'sm' | 'md';

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-ink disabled:bg-line disabled:text-muted',
  secondary: 'border border-brand/40 bg-card text-brand-ink hover:bg-brand-soft disabled:border-line disabled:text-muted disabled:hover:bg-card',
  ghost: 'text-brand-ink hover:bg-brand-soft disabled:text-muted disabled:hover:bg-transparent',
  danger: 'bg-danger text-white hover:bg-danger-ink disabled:bg-line disabled:text-muted',
  sun: 'bg-sun text-ink hover:brightness-95 disabled:bg-line disabled:text-muted',
};

const sizeClass: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
};

export function btnClass(variant: Variant = 'primary', size: Size = 'md', extra = ''): string {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ${variantClass[variant]} ${sizeClass[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={btnClass(variant, size, className)} {...rest} />;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={btnClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/* ------------------------------ Badge ------------------------------ */

export type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-ink/5 text-ink/80',
  brand: 'bg-brand-soft text-brand-ink',
  ok: 'bg-ok-soft text-ok-ink',
  warn: 'bg-sun-soft text-sun-ink',
  danger: 'bg-danger-soft text-danger-ink',
};

export function Badge({ tone = 'neutral', icon, children }: { tone?: Tone; icon?: IconName; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass[tone]}`}>
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

/* ------------------------------ Card ------------------------------ */

export function Card({ className = '', children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={`rounded-2xl border border-line bg-card ${className}`}>
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = 'neutral',
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  icon?: IconName;
}) {
  const accent: Record<Tone, string> = {
    neutral: 'text-ink',
    brand: 'text-brand',
    ok: 'text-ok',
    warn: 'text-sun-ink',
    danger: 'text-danger',
  };
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        {icon && <Icon name={icon} className="h-4 w-4" />}
        {label}
      </div>
      <div className={`mt-1 font-display text-4xl font-semibold tabular-nums ${accent[tone]}`}>{value}</div>
      {hint && <div className="mt-1 text-sm text-muted">{hint}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'brand', label }: { value: number; tone?: 'brand' | 'ok' | 'warn' | 'danger'; label: string }) {
  const bar = { brand: 'bg-brand', ok: 'bg-ok', warn: 'bg-sun', danger: 'bg-danger' }[tone];
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10"
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${bar}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  desc,
  actions,
}: {
  eyebrow?: string;
  title: string;
  desc?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
        {desc && <p className="mt-2 text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
        active ? 'border-brand bg-brand text-white' : 'border-line bg-card text-ink hover:border-brand/50'
      }`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
    </div>
  );
}

export function SectionTitle({ icon, children, aside }: { icon?: IconName; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
            <Icon name={icon} className="h-4.5 w-4.5" />
          </span>
        )}
        {children}
      </h2>
      {aside}
    </div>
  );
}
