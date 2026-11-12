import { useTranslation } from 'react-i18next'
import { HomeworkBlock } from '@/widgets/homework-block'
import { TodayDayCardBanner, TodayForYouCard, TodayHubGreeting, TodayQuickTiles } from '@/widgets/today-hub'

export function TodayPage() {
  const { t } = useTranslation()

  return (
    <>
      <TodayHubGreeting />
      <TodayForYouCard />
      <TodayQuickTiles className="mb-4" />
      <TodayDayCardBanner />
      <div>
        <h2 className="mb-3 text-base font-medium">{t('today.weekTitle')}</h2>
        <HomeworkBlock />
      </div>
    </>
  )
}
