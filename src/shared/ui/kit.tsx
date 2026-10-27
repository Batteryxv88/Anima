import type { ButtonHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib'

export function PageHeader({
  title,
  text,
  action,
}: {
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[1.65rem] font-medium leading-tight tracking-tight text-ink">{title}</h1>
        {text ? <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{text}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-line bg-card p-5', className)}>
      {children}
    </section>
  )
}

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger'

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-sage text-white hover:bg-sage-deep',
        variant === 'ghost' && 'text-ink hover:bg-card',
        variant === 'outline' && 'border border-line bg-card text-ink hover:border-sage/40',
        variant === 'danger' && 'bg-terra text-white hover:bg-terra/90',
        className,
      )}
      {...props}
    />
  )
}

export function Chip({
  active,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        'min-h-10 shrink-0 rounded-full border px-3.5 text-sm transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/60',
        active
          ? 'border-sage bg-sage text-white'
          : 'border-line bg-card text-ink hover:border-sage/40',
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Card>
      <p className="text-sm leading-relaxed text-muted">{children}</p>
    </Card>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
    </label>
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      className="w-full resize-y rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-sage"
      {...props}
    />
  )
}

export function Scale({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
        <span className="tabular-nums text-muted">{value}</span>
      </span>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-sage"
      />
    </label>
  )
}

export function ChoiceGroup({
  children,
}: {
  children: ReactNode
}) {
  return <div className="grid gap-2">{children}</div>
}

export function ChoiceButton({
  active,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-12 rounded-xl border px-4 text-left text-sm transition-colors duration-150',
        active ? 'border-sage bg-sage/10 text-ink' : 'border-line bg-card text-ink hover:border-sage/40',
      )}
      {...props}
    >
      {children}
    </button>
  )
}

