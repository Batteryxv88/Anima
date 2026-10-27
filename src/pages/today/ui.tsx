import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { formatDay, todayId } from '@/shared/lib'
import { Button, Card, PageHeader, Scale } from '@/shared/ui'
import { HomeworkBlock } from '@/widgets/homework-block'

export function TodayPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const saved = useCareStore((state) => state.checkIns.find((item) => item.date === todayId()))
  const saveCheckIn = useCareStore((state) => state.saveCheckIn)
  const [mood, setMood] = useState(saved?.mood ?? 5)
  const [anxiety, setAnxiety] = useState(saved?.anxiety ?? 5)
  const [sleep, setSleep] = useState(saved?.sleep ?? 5)

  return (
    <>
      <PageHeader title={t('today.title')} text={formatDay(todayId(), localeTags[locale])} />
      <div className="grid gap-4">
        <Card>
          <h2 className="text-base font-medium text-ink">{t('today.checkIn')}</h2>
          <div className="mt-4 grid gap-4">
            <Scale label={t('today.mood')} value={mood} onChange={setMood} />
            <Scale label={t('today.anxiety')} value={anxiety} onChange={setAnxiety} />
            <Scale label={t('today.sleep')} value={sleep} onChange={setSleep} />
          </div>
          <Button className="mt-5 w-full" onClick={() => saveCheckIn({ mood, anxiety, sleep })}>
            {saved ? t('today.saved') : t('today.save')}
          </Button>
        </Card>
        <div>
          <h2 className="mb-3 text-base font-medium">{t('today.weekTitle')}</h2>
          <HomeworkBlock compact />
        </div>
        <Link to="/session" className="rounded-2xl border border-line bg-card px-5 py-4 text-sm text-sage-deep">
          {t('today.toSession')}
        </Link>
      </div>
    </>
  )
}
