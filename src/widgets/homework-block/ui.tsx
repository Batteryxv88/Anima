import { useTranslation } from 'react-i18next'
import { useCareStore } from '@/entities/care'
import { TechniqueCard, getTechnique, useTechniqueStore } from '@/entities/technique'
import { isThisWeek } from '@/shared/lib'
import { EmptyState } from '@/shared/ui'

export function HomeworkBlock() {
  const { t } = useTranslation()
  useTechniqueStore((state) => state.list)
  const assignments = useCareStore((state) => state.assignments)
  const weekAssignments = assignments.filter((item) => isThisWeek(item.createdAt.slice(0, 10)))
  const cards = weekAssignments.flatMap((item) => {
    const technique = getTechnique(item.techniqueId)
    return technique ? [{ item, technique }] : []
  })

  if (cards.length === 0) {
    return <EmptyState>{t('homework.empty')}</EmptyState>
  }

  return (
    <div className="grid gap-3">
      {cards.map(({ item, technique }) => (
        <TechniqueCard key={item.id} technique={technique} note={item.therapistNote || undefined} />
      ))}
    </div>
  )
}
