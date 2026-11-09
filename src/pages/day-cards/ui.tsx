import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { DayCardTile, activeDayCards, entryHasContent, useDayCardStore } from '@/entities/day-card'
import { isStaffRole, useUserStore } from '@/entities/user'
import { todayId } from '@/shared/lib'
import { EmptyState, PageHeader } from '@/shared/ui'

export function DayCardsListPage() {
  const { t } = useTranslation()
  const role = useUserStore((state) => state.role)
  const list = useDayCardStore((state) => state.list)
  const entries = useCareStore((state) => state.dayCardEntries)
  const cards = isStaffRole(role) ? list : activeDayCards(list)
  const today = todayId()

  return (
    <>
      <Link to="/today" className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader title={t('cards.title')} text={t('cards.text')} />
      {cards.length === 0 ? (
        <EmptyState>
          {isStaffRole(role) ? (
            <Link to="/staff/day-cards" className="text-plum">
              {t('cards.staffEmpty')}
            </Link>
          ) : (
            t('empty.generic')
          )}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cards.map((card) => {
            const entry = entries.find((item) => item.dayCardId === card.id && item.date === today)
            const hint = entryHasContent(card, entry) ? t('cards.todayHas') : t('cards.todayEmpty')
            return (
              <DayCardTile
                key={card.id}
                card={card}
                hint={`${t(`school.${card.school}`)} · ${hint}`}
                to={`/cards/${card.id}?from=list`}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
