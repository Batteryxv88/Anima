import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'
import type { Practice } from '@/entities/care'
import { AnswerList, filledAnswers, getTechnique, techniqueCopy, useTechniqueStore } from '@/entities/technique'
import { localeTags, type Locale } from '@/shared/config'
import { cn, formatStamp } from '@/shared/lib'

function Fold({ open, children }: { open: boolean; children: ReactNode }) {
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
      return
    }
    el.style.height = `${from}px`
    const anim = el.animate([{ height: `${from}px` }, { height: `${target}px` }], {
      duration: 380,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    })
    anim.onfinish = () => {
      el.style.height = open ? 'auto' : ''
    }
    return () => {
      const current = el.getBoundingClientRect().height
      anim.cancel()
      el.style.height = `${current}px`
    }
  }, [open])

  return (
    <div ref={outer} className="anima-fold">
      <div ref={inner} inert={open ? undefined : true}>
        {children}
      </div>
    </div>
  )
}

function Mark({ done }: { done: boolean }) {
  if (done) {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
        <Check size={14} strokeWidth={2.25} />
      </span>
    )
  }
  return <span className="size-6 shrink-0 rounded-full border-2 border-sand/80" />
}

function PracticeBody({ practice, showDate = true }: { practice: Practice; showDate?: boolean }) {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale
  const technique = getTechnique(practice.techniqueId)
  return (
    <div className="min-w-0 pt-1">
      {showDate ? <p className="text-xs text-muted">{formatStamp(practice.at, localeTags[locale])}</p> : null}
      {practice.note ? (
        <p className={cn('mt-1 break-words text-sm leading-relaxed', showDate ? 'text-muted' : undefined)}>
          {practice.note}
        </p>
      ) : null}
      {technique ? <AnswerList technique={technique} answers={practice.answers} /> : null}
    </div>
  )
}

function practiceBrief(practice: Practice, locale: Locale) {
  const note = practice.note.trim()
  if (note) return note
  const technique = getTechnique(practice.techniqueId)
  const line = technique ? filledAnswers(technique, practice.answers, locale)[0] : undefined
  return line ? `${line.label}: ${line.value}` : ''
}

export function WeekWork({
  assignments,
  practices,
}: {
  assignments: { techniqueId: string }[]
  practices: Practice[]
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  useTechniqueStore((state) => state.list)
  const [openSkill, setOpenSkill] = useState<string | null>(null)
  const [openPractice, setOpenPractice] = useState<string | null>(null)
  const groups = new Map<string, Practice[]>()
  for (const item of assignments) {
    if (!groups.has(item.techniqueId)) groups.set(item.techniqueId, [])
  }
  const ordered = [...practices].sort((a, b) => a.at.localeCompare(b.at))
  for (const item of ordered) {
    const list = groups.get(item.techniqueId) ?? []
    list.push(item)
    groups.set(item.techniqueId, list)
  }
  if (groups.size === 0) return null

  return (
    <ul className="mt-3 min-w-0">
      {[...groups.entries()].map(([techniqueId, items]) => {
        const technique = getTechnique(techniqueId)
        const title = technique ? techniqueCopy(technique, locale).title : techniqueId
        const open = openSkill === techniqueId
        const count = items.length
        return (
          <li key={techniqueId} className="min-w-0 border-b border-line/80 last:border-b-0">
            <button
              type="button"
              className="flex min-h-11 w-full min-w-0 items-center gap-3 py-2 text-left"
              aria-expanded={open}
              onClick={() => {
                setOpenSkill(open ? null : techniqueId)
                setOpenPractice(null)
              }}
            >
              <Mark done={count > 0} />
              <span className="min-w-0 flex-1 break-words text-sm font-medium">{title}</span>
              {count > 0 ? <span className="shrink-0 text-sm text-muted">{count}</span> : null}
              <ChevronDown
                size={16}
                strokeWidth={1.75}
                className={cn('shrink-0 text-muted transition-transform duration-300', open && 'rotate-180')}
              />
            </button>
            <Fold open={open}>
              <div className="min-w-0 pb-3 pl-4 sm:pl-9">
                {count === 0 ? <p className="text-sm leading-relaxed text-muted">{t('session.notYet')}</p> : null}
                {count === 1 ? <PracticeBody practice={items[0]} /> : null}
                {count > 1 ? (
                  <ul className="grid min-w-0">
                    {items.map((item) => {
                      const lineOpen = openPractice === item.id
                      const brief = practiceBrief(item, locale)
                      return (
                        <li key={item.id} className="min-w-0 border-b border-line/80 last:border-b-0">
                          <button
                            type="button"
                            className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 py-2.5 text-left sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                            aria-expanded={lineOpen}
                            onClick={() => setOpenPractice(lineOpen ? null : item.id)}
                          >
                            <span className="col-start-1 row-start-1 text-xs text-muted">
                              {formatStamp(item.at, localeTags[locale])}
                            </span>
                            {brief && !lineOpen ? (
                              <span className="col-span-2 col-start-1 row-start-2 min-w-0 truncate text-sm sm:col-span-1 sm:col-start-2 sm:row-start-1">
                                {brief}
                              </span>
                            ) : null}
                            <ChevronDown
                              size={14}
                              strokeWidth={1.75}
                              className={cn(
                                'col-start-2 row-start-1 text-muted transition-transform duration-300 sm:col-start-3',
                                lineOpen && 'rotate-180',
                              )}
                            />
                          </button>
                          <Fold open={lineOpen}>
                            <div className="min-w-0 pb-3">
                              <PracticeBody practice={item} showDate={false} />
                            </div>
                          </Fold>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            </Fold>
          </li>
        )
      })}
    </ul>
  )
}
