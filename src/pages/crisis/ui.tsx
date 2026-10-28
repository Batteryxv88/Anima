import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { techniqueCopy, useTechniqueStore } from '@/entities/technique'
import { useUserStore } from '@/entities/user'
import { helpLines } from '@/shared/content'
import type { Locale } from '@/shared/config'
import { Button, Card, Field, NoticeLayer, PageHeader, TextArea, useNotice } from '@/shared/ui'

export function CrisisPage() {
  const { t, i18n } = useTranslation()
  const here = useLocation()
  const locale = i18n.language as Locale
  const list = useTechniqueStore((state) => state.list)
  const techniques = list.filter((item) => item.situations.includes('crisis'))
  const country = useUserStore((state) => state.country)
  const saved = useCareStore((state) => state.crisisPlan)
  const setCrisisPlan = useCareStore((state) => state.setCrisisPlan)
  const [plan, setPlan] = useState(saved)
  const { notice, show, hide } = useNotice()
  const lines = helpLines[country]

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <PageHeader title={t('crisis.title')} text={t('crisis.lead')} />
      <div className="grid gap-4">
        <Card>
          <h2 className="text-base font-medium">{t('crisis.skills')}</h2>
          <div className="mt-3 grid gap-2">
            {techniques.length === 0 ? (
              <p className="text-sm text-muted">{t('skills.empty')}</p>
            ) : (
              techniques.map((technique) => (
                <Link
                  key={technique.id}
                  to={`/skills/${technique.id}`}
                  state={{ from: here.pathname }}
                  className="rounded-xl border border-line px-4 py-3 text-sm hover:border-sage/40"
                >
                  {techniqueCopy(technique, locale).title}
                </Link>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('crisis.lines')}</h2>
          <ul className="mt-3 grid gap-2">
            {lines.map((line) => (
              <li key={line.nameKey}>
                {line.phone ? (
                  <a className="text-sm text-sage-deep" href={`tel:${line.phone}`}>
                    {t(line.nameKey)} · {line.display ?? line.phone}
                  </a>
                ) : (
                  <a className="text-sm text-sage-deep" href={line.href} target="_blank" rel="noreferrer">
                    {t(line.nameKey)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('crisis.plan')}</h2>
          <div className="mt-4 grid gap-3">
            <Field label={t('crisis.first')}>
              <TextArea
                value={plan.firstMinutes}
                onChange={(event) => setPlan({ ...plan, firstMinutes: event.target.value })}
              />
            </Field>
            <Field label={t('crisis.call')}>
              <TextArea
                value={plan.whoToCall}
                onChange={(event) => setPlan({ ...plan, whoToCall: event.target.value })}
              />
            </Field>
            <Field label={t('crisis.avoid')}>
              <TextArea value={plan.avoid} onChange={(event) => setPlan({ ...plan, avoid: event.target.value })} />
            </Field>
            <Button
              onClick={() => {
                setCrisisPlan(plan)
                show(t('common.savedNotice'), t('crisis.saved'))
              }}
            >
              {t('crisis.save')}
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
