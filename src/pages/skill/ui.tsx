import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { TechniqueFields, techniqueCopy, useTechniqueStore, type FieldAnswers } from '@/entities/technique'
import { type Locale } from '@/shared/config'
import { isThisWeek, practiceFrom } from '@/shared/lib'
import { Button, Card, Field, NoticeLayer, PageHeader, RichText, TextArea, useNotice } from '@/shared/ui'

export function SkillPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const back = practiceFrom(location.state)
  const { t, i18n } = useTranslation()
  const technique = useTechniqueStore((state) => (id ? state.list.find((item) => item.id === id) : undefined))
  const addPractice = useCareStore((state) => state.addPractice)
  const addAssignment = useCareStore((state) => state.addAssignment)
  const assignments = useCareStore((state) => state.assignments)
  const inHomework = Boolean(
    technique &&
      assignments.some(
        (item) =>
          item.techniqueId === technique.id &&
          item.status !== 'done' &&
          isThisWeek(item.createdAt.slice(0, 10)),
      ),
  )
  const [note, setNote] = useState('')
  const [answers, setAnswers] = useState<FieldAnswers>({})
  const { notice, show, hide } = useNotice()

  if (!technique) return <Navigate to="/skills" replace />
  const copy = techniqueCopy(technique, i18n.language as Locale)

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <Link to={back} className="mb-3 inline-flex min-h-11 items-center text-sm text-sage-deep">
        {back === '/skills' ? t('skill.backToList') : t('nav.back')}
      </Link>
      <PageHeader title={copy.title} text={t('skills.duration', { count: technique.durationMin })} />
      <div className="grid gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-sand">{t(`school.${technique.school}`)}</p>
          {copy.when.trim() ? (
            <>
              <h2 className="mt-4 text-xs tracking-wide text-sand">{t('skill.when')}</h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">
                <RichText text={copy.when} />
              </p>
            </>
          ) : null}
          {copy.about.trim() ? (
            <>
              <h2 className="mt-4 text-xs tracking-wide text-sand">{t('skill.about')}</h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">
                <RichText text={copy.about} />
              </p>
            </>
          ) : null}
        </Card>
        {copy.steps.filter((item) => item.trim()).length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-sand">{t('skill.steps')}</h2>
            <ol className="mt-3 grid gap-2">
              {copy.steps
                .filter((item) => item.trim())
                .map((step, index) => (
                  <li key={`${index}-${step}`} className="text-sm leading-relaxed">
                    <span className="mr-2 text-sand">{index + 1}.</span>
                    <RichText text={step} />
                  </li>
                ))}
            </ol>
          </Card>
        ) : null}
        {technique.fields.length > 0 ? (
          <Card>
            <TechniqueFields
              fields={technique.fields}
              values={answers}
              onChange={(fieldId, value) => setAnswers((current) => ({ ...current, [fieldId]: value }))}
            />
          </Card>
        ) : null}
        <Button
          variant="outline"
          className="w-full"
          disabled={inHomework}
          onClick={() => {
            addAssignment(technique.id)
            show(t('skill.homeworkNotice'))
          }}
        >
          {inHomework ? t('skill.inHomework') : t('skill.toHomework')}
        </Button>
        <Field label={t('skill.note')}>
          <TextArea value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <Button
          onClick={() => {
            addPractice(technique.id, note.trim(), answers)
            navigate(back, { state: { practiceSaved: true } })
          }}
        >
          {t('skill.tried')}
        </Button>
      </div>
    </>
  )
}
