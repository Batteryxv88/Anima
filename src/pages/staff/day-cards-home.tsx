import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  dayCardCopy,
  deleteDayCard,
  seedDefaultDayCards,
  useDayCardStore,
} from '@/entities/day-card'
import { isStaffRole, useUserStore } from '@/entities/user'
import { type Locale } from '@/shared/config'
import { firestoreErrorKey } from '@/shared/lib'
import {
  Button,
  Card,
  ConfirmDialog,
  IconButton,
  NoticeLayer,
  PageHeader,
  useNotice,
} from '@/shared/ui'

type PendingConfirm = { title: string; run: () => void }

export function StaffDayCardsHomePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const location = useLocation()
  const navigate = useNavigate()
  const role = useUserStore((state) => state.role)
  const authReady = useUserStore((state) => state.authReady)
  const list = useDayCardStore((state) => state.list)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null)
  const { notice, show, hide } = useNotice()

  useEffect(() => {
    const flash = location.state as { saved?: boolean; deleted?: boolean } | null
    if (flash?.saved) show(t('common.savedNotice'), t('staff.dayCardSaved'))
    else if (flash?.deleted) show(t('staff.dayCardDeleted'))
    else return
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate, show, t])

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ''}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.run()
          setConfirm(null)
        }}
      />
      <Link to="/profile" className="mb-3 inline-flex min-h-9 items-center text-sm text-plum">
        {t('nav.back')}
      </Link>
      <PageHeader
        title={t('staff.dayCardsTitle')}
        text={t('staff.dayCardsText')}
        action={
          <Link
            to="/staff/day-cards/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink hover:border-plum/35"
          >
            {t('staff.addDayCard')}
          </Link>
        }
      />
      <Card className="mb-4">
        <p className="text-sm text-muted">{list.length === 0 ? t('staff.dayCardsEmpty') : t('staff.dayCardsHas')}</p>
        {error ? <p className="mt-2 text-sm text-terra">{error}</p> : null}
        <Button
          className="mt-3"
          size="sm"
          variant={list.length === 0 ? 'primary' : 'outline'}
          disabled={busy}
          onClick={() => {
            const run = () => {
              setBusy(true)
              setError('')
              void seedDefaultDayCards()
                .then(() => show(t('common.savedNotice'), t('staff.dayCardsSeeded')))
                .catch((caught) => setError(t(firestoreErrorKey(caught))))
                .finally(() => setBusy(false))
            }
            if (list.length > 0) {
              setConfirm({ title: t('staff.dayCardsSeedConfirm'), run })
              return
            }
            run()
          }}
        >
          {t('staff.dayCardsSeed')}
        </Button>
      </Card>
      <div className="grid gap-3">
        {list.map((card) => {
          const copy = dayCardCopy(card, locale)
          return (
            <Card key={card.id} className="grid gap-2">
              <div className="flex items-start gap-1">
                <Link to={`/staff/day-cards/${card.id}`} className="min-w-0 flex-1 hover:opacity-90">
                  <p className="font-medium text-plum">{copy.title || t('staff.addDayCard')}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {t(`school.${card.school}`)} · {t(`staff.cadence${card.cadence === 'daily' ? 'Daily' : 'Episode'}`)}
                    {' · '}
                    {card.active ? t('staff.dayCardActive') : t('staff.dayCardInactive')}
                    {' · '}
                    {card.techniqueIds.length}
                  </p>
                </Link>
                <IconButton
                  variant="danger"
                  disabled={busy}
                  aria-label={t('staff.deleteDayCard')}
                  onClick={() =>
                    setConfirm({
                      title: t('staff.confirmDeleteDayCard'),
                      run: () => {
                        setBusy(true)
                        void deleteDayCard(card.id)
                          .then(() => show(t('staff.dayCardDeleted')))
                          .catch((caught) => setError(t(firestoreErrorKey(caught))))
                          .finally(() => setBusy(false))
                      },
                    })
                  }
                >
                  <Trash2 size={18} strokeWidth={1.75} aria-hidden />
                </IconButton>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
