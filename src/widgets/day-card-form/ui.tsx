import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  DayScale,
  fieldExample,
  fieldLabel,
  fieldOptions,
  innerSkillKey,
  innerSkillValueKey,
  linkedIdsForField,
  type DayCard,
  type DayCardField,
} from '@/entities/day-card'
import {
  TechniqueFields,
  findInnerSkill,
  innerSkills,
  skillAsField,
  skillHint,
  skillTitle,
  techniqueCopy,
  useTechniqueStore,
  type Technique,
  type TechniqueSkill,
} from '@/entities/technique'
import { type Locale } from '@/shared/config'
import { Chip, HelpFold, TextArea, TextField } from '@/shared/ui'

function FieldCaption({ field, locale }: { field: DayCardField; locale: Locale }) {
  return <HelpFold title={fieldLabel(field, locale)} help={fieldExample(field, locale)} />
}

export function SkillChoiceChips({
  ids,
  value,
  onChange,
  from,
}: {
  ids: string[]
  value: string
  onChange: (id: string) => void
  from?: string
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const list = useTechniqueStore((state) => state.list)
  const options = ids
    .map((id) => list.find((item) => item.id === id))
    .filter((item): item is Technique => Boolean(item))
  if (ids.length === 0) {
    return <p className="text-sm text-muted">{t('cards.noSkills')}</p>
  }
  if (options.length === 0) {
    return <p className="text-sm text-muted">{t('cards.missingSkill')}</p>
  }
  const selected = options.find((item) => item.id === value)
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {options.map((item) => {
          const title = techniqueCopy(item, locale).title
          return (
            <Chip key={item.id} size="compact" active={value === item.id} onClick={() => onChange(value === item.id ? '' : item.id)}>
              {title}
            </Chip>
          )
        })}
      </div>
      {selected && from ? (
        <Link to={`/skills/${selected.id}`} state={{ from }} className="w-fit text-sm font-medium text-plum">
          {t('cards.howTo')}
        </Link>
      ) : null}
    </div>
  )
}

export function SkillStepChips({
  techniqueId,
  value,
  onChange,
}: {
  techniqueId: string
  value: string
  onChange: (next: string) => void
}) {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale
  const technique = useTechniqueStore((state) => state.list.find((item) => item.id === techniqueId))
  const items = technique ? innerSkills(technique) : []
  if (items.length === 0) return null
  const selectedId = technique ? findInnerSkill(technique, value)?.id : undefined
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const active = selectedId === item.id
        return (
          <Chip
            key={item.id}
            size="compact"
            active={active}
            onClick={() => onChange(active ? '' : item.id)}
          >
            {skillTitle(item, locale)}
          </Chip>
        )
      })}
    </div>
  )
}

function InnerSkillFill({
  skill,
  value,
  onChange,
}: {
  skill: TechniqueSkill
  value: string
  onChange: (next: string) => void
}) {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale
  const hint = skillHint(skill, locale)
  return (
    <div className="mt-2">
      <HelpFold title={hint ? skillTitle(skill, locale) : undefined} help={hint}>
        <TechniqueFields
          hideLabel
          fields={[skillAsField(skill)]}
          values={{ [skill.id]: value }}
          onChange={(_, next) => onChange(next)}
        />
      </HelpFold>
    </div>
  )
}

export function SkillStepsPreview({ techniqueId }: { techniqueId: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const technique = useTechniqueStore((state) => state.list.find((item) => item.id === techniqueId))
  const [open, setOpen] = useState(false)
  if (!technique) return null
  const steps = techniqueCopy(technique, locale).steps.filter((item) => item.trim())
  if (steps.length === 0) return null
  return (
    <div>
      <button type="button" className="text-sm font-medium text-plum" onClick={() => setOpen((current) => !current)}>
        {open ? t('cards.hideMore') : t('cards.steps')}
      </button>
      {open ? (
        <ol className="mt-2 grid gap-1.5">
          {steps.map((step, index) => (
            <li key={`${index}-${step}`} className="text-sm leading-relaxed text-ink">
              <span className="mr-2 text-gold">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

export function DayCardFieldControl({
  card,
  field,
  value,
  values,
  locale,
  onChange,
  from,
}: {
  card: DayCard
  field: DayCardField
  value: string
  values: Record<string, string>
  locale: Locale
  onChange: (fieldId: string, next: string) => void
  from?: string
}) {
  const { t } = useTranslation()
  const techniques = useTechniqueStore((state) => state.list)
  const setValue = (next: string) => onChange(field.id, next)
  const caption = <FieldCaption field={field} locale={locale} />
  if (field.kind === 'scale') {
    return (
      <DayScale
        label={fieldLabel(field, locale)}
        caption={caption}
        field={field}
        value={value}
        onChange={setValue}
      />
    )
  }
  if (field.kind === 'skill') {
    const nestedKey = innerSkillKey(field.id)
    const valueKey = innerSkillValueKey(field.id)
    const nestedValue = values[nestedKey] ?? ''
    const technique = techniques.find((item) => item.id === value)
    const nested = technique ? innerSkills(technique) : []
    const selectedSkill = technique ? findInnerSkill(technique, nestedValue) : undefined
    return (
      <div>
        {caption}
        <SkillChoiceChips
          ids={linkedIdsForField(card, field)}
          value={value}
          onChange={(id) => {
            onChange(field.id, id)
            if (id !== value) {
              onChange(nestedKey, '')
              onChange(valueKey, '')
            }
          }}
          from={from}
        />
        {nested.length > 0 ? (
          <div className="mt-2">
            <p className="mb-1.5 text-sm text-muted">{t('cards.pickSkill')}</p>
            <SkillStepChips
              techniqueId={value}
              value={nestedValue}
              onChange={(next) => {
                const prevId = selectedSkill?.id ?? nestedValue
                onChange(nestedKey, next)
                if (next !== prevId) onChange(valueKey, '')
              }}
            />
            {selectedSkill ? (
              <InnerSkillFill
                skill={selectedSkill}
                value={values[valueKey] ?? ''}
                onChange={(next) => onChange(valueKey, next)}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }
  if (field.kind === 'skillStep') {
    const sourceId = field.sourceFieldId
    const techniqueId = sourceId ? values[sourceId] ?? '' : card.techniqueIds[0] ?? ''
    return (
      <div>
        {caption}
        {techniqueId ? (
          <SkillStepChips techniqueId={techniqueId} value={value} onChange={setValue} />
        ) : (
          <p className="text-sm text-muted">{t('cards.noSkills')}</p>
        )}
      </div>
    )
  }
  if (field.kind === 'choice') {
    const options = fieldOptions(field, locale)
    return (
      <div>
        {caption}
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <Chip key={option} size="compact" active={value === option} onClick={() => setValue(value === option ? '' : option)}>
              {option}
            </Chip>
          ))}
        </div>
      </div>
    )
  }
  if (field.kind === 'text') {
    return (
      <div>
        {caption}
        <TextField value={value} onChange={(event) => setValue(event.target.value)} />
      </div>
    )
  }
  return (
    <div>
      {caption}
      <TextArea rows={3} value={value} onChange={(event) => setValue(event.target.value)} />
    </div>
  )
}
