import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useShareStore } from '@/entities/care'
import { HomeworkBlock } from '@/widgets/homework-block'
import { TodayDayCardBanner, TodayForYouCard, TodayHubGreeting, TodayQuickTiles } from '@/widgets/today-hub'

export function TodayPage() {
  const { t } = useTranslation()
  const isSpecialist = useShareStore((state) => state.therapistLinks.length > 0)

  return (
    <>
      <TodayHubGreeting />
      <TodayForYouCard />
      <TodayQuickTiles className="mb-4" />
      <TodayDayCardBanner />
      <div className="grid gap-4">
        {isSpecialist ? (
          <Link to="/cabinet" className="rounded-2xl border border-plum/35 bg-plum/10 px-5 py-4">
            <p className="text-sm font-medium text-plum">{t('invite.asSpecialist')}</p>
            <p className="mt-1 text-sm text-muted">{t('cabinet.open')}</p>
          </Link>
        ) : null}
        <div>
          <h2 className="mb-3 text-base font-medium">{t('today.weekTitle')}</h2>
          <HomeworkBlock />
        </div>
      </div>
    </>
  )
}
