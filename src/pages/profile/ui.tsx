import { LifeBuoy } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { isStaffRole, pullRole, signOutUser, useUserStore } from '@/entities/user'
import { InvitePanel, SharePanel } from './invite'
import { LanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { CountryPicker } from '@/features/pick-country'
import { rememberNext } from '@/shared/lib'
import { Button, Card, Chip, PageHeader } from '@/shared/ui'

const cardPad = 'h-full min-w-0 p-3 sm:p-3'
const fieldLabel = 'shrink-0 text-xs text-muted'
const staffLink = 'flex min-h-8 items-center text-sm text-plum'
const settingRow = 'grid gap-1.5 sm:flex sm:items-center sm:justify-between sm:gap-2'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const largeText = useUserStore((state) => state.largeText)
  const setLargeText = useUserStore((state) => state.setLargeText)
  const country = useUserStore((state) => state.country)
  const setCountry = useUserStore((state) => state.setCountry)
  const mode = useUserStore((state) => state.mode)
  const setMode = useUserStore((state) => state.setMode)
  const email = useUserStore((state) => state.email)
  const uid = useUserStore((state) => state.uid)
  const role = useUserStore((state) => state.role)
  const staff = isStaffRole(role)

  useEffect(() => {
    if (!uid) return
    void pullRole(uid, email)
  }, [uid, email])

  return (
    <>
      <PageHeader title={t('profile.title')} className="mb-3" />
      <div className="grid gap-2 sm:grid-cols-2">
        <Card className={cardPad}>
          <div className="grid gap-2">
            <h2 className="text-sm font-medium">{t('profile.help')}</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
              <Link
                to="/crisis"
                className="flex min-h-8 shrink-0 items-center gap-1.5 text-sm text-terra"
              >
                <LifeBuoy size={16} strokeWidth={1.75} className="shrink-0" />
                {t('nav.crisis')}
              </Link>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <p className={fieldLabel}>{t('onboarding.countryTitle')}</p>
                <CountryPicker className="min-w-0" country={country} onCountry={setCountry} />
              </div>
            </div>
          </div>
        </Card>
        <Card className={cardPad}>
          <div className="grid gap-2">
            <h2 className="text-sm font-medium">{t('auth.account')}</h2>
            {uid ? (
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm text-muted">{email ?? t('auth.signedIn')}</p>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => void signOutUser()}>
                  {t('auth.signOut')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 text-sm leading-snug text-muted">{t('auth.guest')}</p>
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    rememberNext('/profile')
                    navigate('/auth')
                  }}
                >
                  {t('auth.signIn')}
                </Button>
              </div>
            )}
            {uid && staff ? (
              <div className="grid gap-1">
                <p className="text-xs text-muted">
                  {t('staff.yourRole')}: {t(`staff.role.${role}`)}
                </p>
                <div className="flex flex-wrap gap-x-3">
                  <Link to="/staff/for-you" className={staffLink}>
                    {t('staff.forYouTitle')}
                  </Link>
                  <Link to="/staff/day-cards" className={staffLink}>
                    {t('staff.dayCardsTitle')}
                  </Link>
                  <Link to="/skills/new" className={staffLink}>
                    {t('staff.addSkill')}
                  </Link>
                  {role === 'superadmin' ? (
                    <Link to="/staff/roles" className={staffLink}>
                      {t('staff.rolesTitle')}
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
            <p className="text-xs leading-snug text-muted">{t('profile.disclaimer')}</p>
          </div>
        </Card>
        <Card className={cardPad}>
          <div className="grid gap-2">
            <h2 className="text-sm font-medium">{t('profile.appearance')}</h2>
            <div className={settingRow}>
              <p className={fieldLabel}>{t('onboarding.languageTitle')}</p>
              <div className="min-w-0">
                <LanguageSwitch size="compact" />
              </div>
            </div>
            <div className={settingRow}>
              <p className={fieldLabel}>{t('profile.theme')}</p>
              <div className="min-w-0">
                <ThemeSwitch size="compact" />
              </div>
            </div>
            <div className="sm:flex sm:justify-end">
              <Chip
                active={largeText}
                size="compact"
                className="w-fit"
                onClick={() => setLargeText(!largeText)}
              >
                {t('profile.largeText')}
              </Chip>
            </div>
          </div>
        </Card>
        <Card className={cardPad}>
          <div className="grid gap-2">
            <h2 className="text-sm font-medium">{t('profile.privacy')}</h2>
            <div className="flex flex-wrap gap-1.5">
              <Chip active={mode === 'self'} size="compact" onClick={() => setMode('self')}>
                {t('onboarding.self')}
              </Chip>
              <Chip
                active={mode === 'with-therapist'}
                size="compact"
                onClick={() => setMode('with-therapist')}
              >
                {t('onboarding.withTherapist')}
              </Chip>
            </div>
            {uid ? (
              <>
                <InvitePanel />
                <SharePanel />
              </>
            ) : (
              <p className="text-sm text-muted">{t('invite.needAccount')}</p>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
