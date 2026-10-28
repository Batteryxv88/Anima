import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn, parseMarkup, wrapMarkup } from '@/shared/lib'

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

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-sage"
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
        className="w-full resize-y rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-sage"
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
        <div className="flex gap-1">
          <button
            type="button"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-sm font-medium text-muted hover:bg-card hover:text-ink"
            onClick={() => wrap('**')}
          >
            {boldLabel}
          </button>
          <button
            type="button"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-sm italic text-muted hover:bg-card hover:text-ink"
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
        <span className="text-right font-medium text-sage-deep">{valueLabel}</span>
      </span>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        aria-valuetext={valueLabel}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-sage"
      />
      <span className="mt-1.5 flex justify-between text-xs text-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </span>
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
  label: string
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
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
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
                    'flex min-h-11 w-full flex-col items-start justify-center px-3 py-2 text-left text-sm',
                    item.id === value ? 'bg-sage/10 text-sage-deep' : 'text-ink hover:bg-canvas',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(item.id)
                    setQuery(item.label)
                    setOpen(false)
                  }}
                >
                  <span>{item.label}</span>
                  {item.hint ? <span className="text-xs text-muted">{item.hint}</span> : null}
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
          'w-full max-w-[20rem] rounded-[1.6rem] border border-line bg-card px-6 pb-6 pt-8 text-center shadow-[0_24px_60px_-32px_rgba(43,41,38,0.58)]',
          leaving ? 'anima-panel-out' : 'anima-panel-in',
        )}
        onClick={(event) => event.stopPropagation()}
      >
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

