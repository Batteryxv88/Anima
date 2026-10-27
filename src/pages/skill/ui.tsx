import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { getTechnique, techniqueCopy } from '@/entities/technique'
import { type Locale } from '@/shared/config'
import { isThisWeek } from '@/shared/lib'
import { Button, Card, Field, PageHeader, TextArea } from '@/shared/ui'

export function SkillPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const technique = id ? getTechnique(id) : undefined
  const addPractice = useCareStore((state) => state.addPractice)
  const addAssignment = useCareStore((state) => state.addAssignment)
  const inHomework = useCareStore((state) =>
    Boolean(
      technique &&
        state.assignments.some(
          (item) =>
            item.techniqueId === technique.id &&
            item.status !== 'done' &&
            isThisWeek(item.createdAt.slice(0, 10)),
        ),
    ),
  )
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  if (!technique) return <Navigate to="/skills" replace />
  const copy = techniqueCopy(technique, i18n.language as Locale)

  return (
    <>
      <PageHeader title={copy.title} text={t('skills.duration', { count: technique.durationMin })} />
      <div className="grid gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-sand">{t(`school.${technique.school}`)}</p>
          <h2 className="mt-3 text-sm font-medium">{t('skill.when')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{copy.when}</p>
          <h2 className="mt-4 text-sm font-medium">{t('skill.caution')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{copy.caution}</p>
        </Card>
        <Card>
          <h2 className="text-sm font-medium">{t('skill.steps')}</h2>
          <ol className="mt-3 grid gap-2">
            {copy.steps.map((step, index) => (
              <li key={step} className="text-sm leading-relaxed">
                <span className="mr-2 text-sand">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
        <Button
          variant="outline"
          className="w-full"
          disabled={inHomework}
          onClick={() => addAssignment(technique.id)}
        >
          {inHomework ? t('skill.inHomework') : t('skill.toHomework')}
        </Button>
        <Field label={t('skill.note')}>
          <TextArea value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <Button
          onClick={() => {
            addPractice(technique.id, note.trim())
            setNote('')
            setSaved(true)
          }}
        >
          {saved ? t('skill.saved') : t('skill.tried')}
        </Button>
      </div>
    </>
  )
}
