import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { getTechnique, techniqueCopy } from '@/entities/technique'
import type { Locale } from '@/shared/config'
import { isThisWeek } from '@/shared/lib'
import { Button, Card, EmptyState } from '@/shared/ui'

export function HomeworkBlock({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const assignments = useCareStore((state) => state.assignments)
  const weekAssignments = assignments.filter((item) => isThisWeek(item.createdAt.slice(0, 10)))
  const setAssignmentStatus = useCareStore((state) => state.setAssignmentStatus)
  const removeAssignment = useCareStore((state) => state.removeAssignment)

  if (weekAssignments.length === 0) {
    return <EmptyState>{t('homework.empty')}</EmptyState>
  }

  return (
    <div className="grid gap-3">
      {weekAssignments.map((item) => {
        const technique = getTechnique(item.techniqueId)
        if (!technique) return null
        const copy = techniqueCopy(technique, locale)
        return (
          <Card key={item.id}>
            <Link to={`/skills/${technique.id}`} className="block">
              <p className="text-xs text-sand">{t(`homework.${item.status}`)}</p>
              <h3 className="mt-1 text-base font-medium text-ink">{copy.title}</h3>
              {item.therapistNote ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.therapistNote}</p>
              ) : null}
            </Link>
            {compact ? null : (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => setAssignmentStatus(item.id, 'done')}>{t('homework.markDone')}</Button>
                <Button variant="outline" onClick={() => setAssignmentStatus(item.id, 'discuss')}>
                  {t('homework.discuss')}
                </Button>
                <Button variant="ghost" onClick={() => removeAssignment(item.id)}>
                  {t('homework.remove')}
                </Button>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
