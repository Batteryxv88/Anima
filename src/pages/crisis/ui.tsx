import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { crisisSkillIds, getTechnique, techniqueCopy } from '@/entities/technique'
import { useUserStore } from '@/entities/user'
import { helpLines } from '@/shared/content'
import type { Locale } from '@/shared/config'
import { Button, Card, Field, PageHeader, TextArea } from '@/shared/ui'

export function CrisisPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const country = useUserStore((state) => state.country)
  const saved = useCareStore((state) => state.crisisPlan)
  const setCrisisPlan = useCareStore((state) => state.setCrisisPlan)
  const [plan, setPlan] = useState(saved)
  const [ok, setOk] = useState(false)
  const lines = helpLines[country]

  return (
    <>
      <PageHeader title={t('crisis.title')} text={t('crisis.lead')} />
      <div className="grid gap-4">
        <Card>
          <h2 className="text-base font-medium">{t('crisis.skills')}</h2>
          <div className="mt-3 grid gap-2">
            {crisisSkillIds.map((id) => {
              const technique = getTechnique(id)
              if (!technique) return null
              return (
                <Link
                  key={id}
                  to={`/skills/${id}`}
                  className="rounded-xl border border-line px-4 py-3 text-sm hover:border-sage/40"
                >
                  {techniqueCopy(technique, locale).title}
                </Link>
              )
            })}
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
                setOk(true)
              }}
            >
              {ok ? t('crisis.saved') : t('crisis.save')}
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
