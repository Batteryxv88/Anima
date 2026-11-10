import { ChevronDown } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn, parseMarkup, SCALE_MAX, SCALE_MIN, scaleStepValues, wrapMarkup } from '@/shared/lib'

export function PageHeader({
  title,
  text,
  action,
  className,
}: {
  title: string
  text?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('mb-5 flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h1 className="text-[1.75rem] font-medium leading-tight tracking-tight text-ink">
          {title}
        </h1>
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
    <section
      className={cn(
        'min-w-0 rounded-2xl border border-line bg-card p-4 shadow-sm shadow-plum/5 sm:p-5',
        className,
      )}
    >
      {children}
    </section>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type ButtonSize = 'default' | 'sm'

export function Button({
  variant = 'primary',
  size = 'default',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150',
        size === 'sm' ? 'min-h-9 rounded-lg px-3 text-xs' : 'min-h-11 rounded-xl px-4 text-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-plum text-white hover:bg-plum-deep dark:text-ink dark:hover:bg-plum-deep',
        variant === 'secondary' &&
          'border border-peach/50 bg-peach/25 text-ink hover:bg-peach/40 dark:border-peach/30 dark:bg-peach/15',
        variant === 'ghost' && 'text-ink hover:bg-card',
        variant === 'outline' && 'border border-line bg-card text-ink hover:border-plum/35',
        variant === 'danger' &&
          'border border-terra/50 bg-transparent text-terra hover:bg-terra/10',
        className,
      )}
      {...props}
    />
  )
}

type IconButtonVariant = 'ghost' | 'danger'

export function IconButton({
  variant = 'ghost',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: IconButtonVariant }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'ghost' && 'text-muted hover:bg-card hover:text-ink',
        variant === 'danger' && 'text-terra hover:bg-terra/10',
        className,
      )}
      {...props}
    />
  )
}

const foldEase = 'cubic-bezier(0.4, 0, 0.2, 1)'

export function Fold({
  open,
  children,
  duration = 380,
}: {
  open: boolean
  children: ReactNode
  duration?: number
}) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = outer.current
    const content = inner.current
    if (!el || !content) return
    const from = el.getBoundingClientRect().height
    const target = open ? content.scrollHeight : 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || Math.abs(from - target) < 1) {
      el.style.height = open ? 'auto' : ''
      content.style.opacity = ''
      content.style.transform = ''
      return
    }
    el.style.height = `${from}px`
    const heightAnim = el.animate([{ height: `${from}px` }, { height: `${target}px` }], {
      duration,
      easing: foldEase,
    })
    const fadeAnim = content.animate(
      open
        ? [
            { opacity: 0, transform: 'translateY(-6px)', offset: 0 },
            { opacity: 0, offset: 0.22 },
            { opacity: 1, transform: 'translateY(0px)', offset: 1 },
          ]
        : [
            { opacity: 1, transform: 'translateY(0px)', offset: 0 },
            { opacity: 0, transform: 'translateY(-4px)', offset: 0.48 },
            { opacity: 0, transform: 'translateY(-4px)', offset: 1 },
          ],
      { duration, easing: foldEase, fill: 'forwards' },
    )
    heightAnim.onfinish = () => {
      el.style.height = open ? 'auto' : ''
      if (open) {
        content.style.opacity = ''
        content.style.transform = ''
        fadeAnim.cancel()
      }
    }
    return () => {
      const current = el.getBoundingClientRect().height
      heightAnim.cancel()
      fadeAnim.cancel()
      el.style.height = `${current}px`
    }
  }, [duration, open])

  return (
    <div ref={outer} className="anima-fold">
      <div ref={inner} inert={open ? undefined : true}>
        {children}
      </div>
    </div>
  )
}

export function HelpFold({
  title,
  help,
  children,
}: {
  title?: string
  help?: string
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const helpText = help?.trim() ?? ''
  const heading = title?.trim() ?? ''
  if (!heading && !helpText && !children) return null
  return (
    <div>
      {heading || helpText ? (
        <div className={children ? 'mb-2' : undefined}>
          <div className="flex items-start gap-1">
            {heading ? (
              <p className={`min-w-0 flex-1 text-sm text-ink ${helpText ? 'pt-2' : ''}`}>{heading}</p>
            ) : (
              <span className="min-w-0 flex-1" />
            )}
            {helpText ? (
              <IconButton
                className="pointer-events-auto size-11"
                aria-label={open ? t('cards.hideMore') : t('cards.more')}
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
              >
                <ChevronDown
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden
                  className={cn(
                    'transition-transform duration-[560ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                    open && 'rotate-180',
                  )}
                />
              </IconButton>
            ) : null}
          </div>
          {helpText ? (
            <Fold open={open} duration={560}>
              <div className="mt-1 text-sm leading-relaxed text-muted">
                <RichText text={helpText} />
              </div>
            </Fold>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function Chip({
  active,
  size = 'default',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  size?: 'default' | 'compact'
}) {
  return (
    <button
      type="button"
      className={cn(
        'shrink-0 rounded-full border transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/50',
        size === 'compact'
          ? 'min-h-8 px-2.5 py-1 text-xs leading-snug'
          : 'min-h-10 px-3.5 text-sm',
        active
          ? 'border-plum bg-plum text-white dark:text-ink'
          : 'border-line bg-card text-ink hover:border-plum/35',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function FilterMenu({
  label,
  active,
  value,
  onChange,
  options,
}: {
  label: string
  active?: boolean
  value: string
  onChange: (id: string) => void
  options: { id: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((item) => item.id === value)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const buttonText = active && selected ? selected.label : label

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'inline-flex max-w-[10.5rem] min-h-8 items-center gap-1 rounded-full border px-2.5 py-1 text-xs leading-snug transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/50',
          active
            ? 'border-plum bg-plum text-white dark:text-ink'
            : 'border-line bg-card text-ink hover:border-plum/35',
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{buttonText}</span>
        <span aria-hidden className="shrink-0 text-[10px] opacity-80">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-56 min-w-[12rem] max-w-[min(18rem,calc(100vw-2rem))] overflow-auto rounded-xl border border-line bg-card py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {options.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === value}
                className={cn(
                  'flex min-h-9 w-full items-center px-3 py-2 text-left text-sm',
                  item.id === value ? 'bg-plum/10 text-plum' : 'text-ink hover:bg-canvas',
                )}
                onClick={() => {
                  onChange(item.id)
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
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

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full min-w-0 max-w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-plum"
      {...props}
    />
  )
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea(props, ref) {
    return (
      <textarea
        ref={ref}
        rows={4}
        className="w-full min-w-0 max-w-full resize-y rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-plum"
        {...props}
      />
    )
  },
)

export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {parseMarkup(text).map((part, index) => {
        if (part.kind === 'bold') {
          return (
            <strong key={index} className="font-semibold">
              {part.text}
            </strong>
          )
        }
        if (part.kind === 'italic') {
          return <em key={index}>{part.text}</em>
        }
        return <span key={index}>{part.text}</span>
      })}
    </span>
  )
}

export function FormatArea({
  label,
  value,
  onChange,
  rows,
  boldLabel,
  italicLabel,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  boldLabel: string
  italicLabel: string
}) {
  const area = useRef<HTMLTextAreaElement>(null)

  const wrap = (marker: '**' | '*') => {
    const el = area.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const next = wrapMarkup(value, start, end, marker)
    onChange(next.next)
    window.requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(next.start, next.end)
    })
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm text-muted">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm font-medium leading-none text-muted hover:text-ink"
            onClick={() => wrap('**')}
          >
            {boldLabel}
          </button>
          <button
            type="button"
            className="text-sm italic leading-none text-muted hover:text-ink"
            onClick={() => wrap('*')}
          >
            {italicLabel}
          </button>
        </div>
      </div>
      <TextArea ref={area} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

export function Scale({
  label,
  minLabel,
  maxLabel,
  valueLabel,
  value,
  onChange,
}: {
  label: string
  minLabel: string
  maxLabel: string
  valueLabel: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-ink">{label}</span>
        <span className="text-right font-medium text-plum">{valueLabel}</span>
      </span>
      <input
        type="range"
        min={SCALE_MIN}
        max={SCALE_MAX}
        value={value}
        aria-valuetext={valueLabel}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-plum"
      />
      <span className="mt-1.5 flex justify-between text-xs text-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </span>
    </label>
  )
}

type ScaleAccent = 'plum' | 'coral' | 'lavender'

const scaleAccentActive: Record<ScaleAccent, string> = {
  plum: 'border-plum bg-plum text-white dark:text-ink',
  coral: 'border-coral bg-coral text-white dark:text-ink',
  lavender: 'border-lavender bg-lavender/90 text-ink',
}

const scaleAccentRing: Record<ScaleAccent, string> = {
  plum: 'focus-visible:ring-plum/50',
  coral: 'focus-visible:ring-coral/50',
  lavender: 'focus-visible:ring-lavender/50',
}

const scaleAccentText: Record<ScaleAccent, string> = {
  plum: 'text-plum',
  coral: 'text-coral',
  lavender: 'text-lavender',
}

export function ScaleTap({
  label,
  icon,
  valueLabel,
  value,
  onChange,
  accent = 'plum',
}: {
  label: string
  icon?: ReactNode
  valueLabel: string
  value: number
  onChange: (value: number) => void
  accent?: ScaleAccent
}) {
  return (
    <div role="group" aria-label={label}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink">
          {icon ? (
            <span className={cn('flex size-4 shrink-0 items-center justify-center', scaleAccentText[accent])}>
              {icon}
            </span>
          ) : null}
          <span className="truncate">{label}</span>
        </span>
        <span className={cn('shrink-0 text-xs font-medium sm:text-sm', scaleAccentText[accent])}>{valueLabel}</span>
      </div>
      <div className="flex items-center gap-1">
        {scaleStepValues.map((step) => {
          const active = value === step
          return (
            <button
              key={step}
              type="button"
              aria-pressed={active}
              aria-label={active ? `${step}, ${valueLabel}` : String(step)}
              onClick={() => onChange(step)}
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                scaleAccentRing[accent],
                active
                  ? scaleAccentActive[accent]
                  : 'border-line bg-card text-ink hover:border-plum/35',
              )}
            >
              {step}
            </button>
          )
        })}
      </div>
    </div>
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
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-12 rounded-xl border px-4 text-left text-sm transition-colors duration-150',
        active ? 'border-plum bg-plum/10 text-ink' : 'border-line bg-card text-ink hover:border-plum/35',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function BinaryChoice({
  label,
  value,
  onChange,
  offLabel,
  onLabel,
  stateOff,
  stateOn,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  offLabel: string
  onLabel: string
  stateOff: string
  stateOn: string
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted">{value ? stateOn : stateOff}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <ChoiceButton active={!value} onClick={() => onChange(false)}>
          {offLabel}
        </ChoiceButton>
        <ChoiceButton active={value} onClick={() => onChange(true)}>
          {onLabel}
        </ChoiceButton>
      </div>
    </div>
  )
}

export function SearchSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  empty,
}: {
  label?: string
  value: string
  onChange: (id: string) => void
  options: { id: string; label: string; hint?: string }[]
  placeholder?: string
  empty?: string
}) {
  const selected = options.find((item) => item.id === value)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const list = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((item) => {
      const hay = `${item.label} ${item.hint ?? ''}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [options, query])

  return (
    <div>
      {label ? <span className="mb-1.5 block text-sm text-muted">{label}</span> : null}
      <TextField
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={open ? query : (selected?.label ?? query)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setOpen(true)
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 180)
        }}
      />
      {open ? (
        <ul className="mt-2 max-h-56 overflow-auto rounded-xl border border-line bg-card" role="listbox">
          {list.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-muted">{empty}</li>
          ) : (
            list.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.id === value}
                  className={cn(
                    'flex min-h-11 w-full min-w-0 flex-col items-start justify-center px-3 py-2 text-left text-sm',
                    item.id === value ? 'bg-plum/10 text-plum' : 'text-ink hover:bg-canvas',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(item.id)
                    setQuery(item.label)
                    setOpen(false)
                  }}
                >
                  <span className="break-words">{item.label}</span>
                  {item.hint ? <span className="break-words text-xs text-muted">{item.hint}</span> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}

export function NoticeDialog({
  open,
  title,
  text,
  action,
  onClose,
}: {
  open: boolean
  title: string
  text?: string
  action: string
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'closed' | 'enter' | 'leave'>(open ? 'enter' : 'closed')
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (open) {
      setPhase('enter')
      return
    }
    setPhase((current) => (current === 'closed' ? current : 'leave'))
  }, [open])

  useEffect(() => {
    if (phase !== 'enter') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhase('leave')
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => setPhase('leave'), 2800)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'leave') return
    const timer = window.setTimeout(() => {
      setPhase('closed')
      onCloseRef.current()
    }, 280)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (typeof document === 'undefined') return null
  if (phase === 'closed' && !open) return null

  const leaving = phase === 'leave'

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5 backdrop-blur-[3px]',
        leaving ? 'anima-overlay-out' : 'anima-overlay-in',
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="anima-notice-title"
      onClick={() => setPhase('leave')}
    >
      <div
        className={cn(
          'relative w-full max-w-[20rem] overflow-hidden rounded-[1.6rem] border border-line bg-card px-6 pb-6 pt-8 text-center shadow-[0_24px_48px_-28px_rgba(48,43,53,0.35)]',
          leaving ? 'anima-panel-out' : 'anima-panel-in',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="anima-sunset-gradient absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
        <div className="anima-check mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage/12">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-sage" fill="none" aria-hidden>
            <path
              className="anima-check-mark"
              d="M6 12.5 10.2 16.8 18 7.8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        <p id="anima-notice-title" className="text-lg font-medium tracking-tight text-ink">
          {title}
        </p>
        {text ? <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p> : null}
        <Button className="mt-6 w-full" onClick={() => setPhase('leave')}>
          {action}
        </Button>
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean
  title: string
  text?: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (typeof document === 'undefined' || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5 backdrop-blur-[3px] anima-overlay-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anima-confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[20rem] rounded-[1.6rem] border border-line bg-card px-6 pb-6 pt-7 text-center shadow-[0_24px_48px_-28px_rgba(48,43,53,0.35)] anima-panel-in"
        onClick={(event) => event.stopPropagation()}
      >
        <p id="anima-confirm-title" className="text-lg font-medium tracking-tight text-ink">
          {title}
        </p>
        {text ? <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p> : null}
        <div className="mt-6 grid gap-2">
          <Button variant={danger ? 'danger' : 'primary'} className="w-full" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="outline" className="w-full" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export type NoticeCopy = { title: string; text?: string }

export function useNotice() {
  const [notice, setNotice] = useState<NoticeCopy | null>(null)
  const show = useCallback((title: string, text?: string) => setNotice({ title, text }), [])
  const hide = useCallback(() => setNotice(null), [])
  return { notice, show, hide }
}

export function useReturnNotice(title: string, text?: string) {
  const location = useLocation()
  const navigate = useNavigate()
  const api = useNotice()

  useEffect(() => {
    if (!(location.state as { practiceSaved?: boolean } | null)?.practiceSaved) return
    api.show(title, text)
    navigate(location.pathname, { replace: true, state: {} })
  }, [api.show, location.pathname, location.state, navigate, text, title])

  return api
}

export function NoticeLayer({ notice, onClose }: { notice: NoticeCopy | null; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <NoticeDialog
      open={Boolean(notice)}
      title={notice?.title ?? ''}
      text={notice?.text}
      action={t('common.close')}
      onClose={onClose}
    />
  )
}

