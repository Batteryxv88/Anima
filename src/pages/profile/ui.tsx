import { LifeBuoy } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { isStaffRole, pullRole, signOutUser, useUserStore } from '@/entities/user'
import { InvitePanel, SharePanel } from './invite'
import { LanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { CountryPicker } from '@/features/pick-country'
import { rememberNext } from '@/shared/lib'
import { Button, Card, ChoiceButton, PageHeader } from '@/shared/ui'

export function ProfilePage() {
  const { t } = useTranslation()
  const largeText = useUserStore((state) => state.largeText)
  const setLargeText = useUserStore((state) => state.setLargeText)
  const country = useUserStore((state) => state.country)
  const setCountry = useUserStore((state) => state.setCountry)
  const mode = useUserStore((state) => state.mode)
  const setMode = useUserStore((state) => state.setMode)
  const email = useUserStore((state) => state.email)
  const uid = useUserStore((state) => state.uid)
  const role = useUserStore((state) => state.role)

  useEffect(() => {
    if (!uid) return
    void pullRole(uid, email)
  }, [uid, email])

  const staffLink =
    'flex min-h-11 items-center justify-center rounded-xl border border-plum/35 bg-plum/10 px-4 text-sm font-medium text-plum hover:bg-plum/15'

  return (
    <>
      <PageHeader title={t('profile.title')} />
      <div className="grid gap-4">
        <Link
          to="/crisis"
          className="flex items-start gap-4 rounded-2xl border border-terra/35 bg-terra/10 px-4 py-4 text-left transition-colors hover:bg-terra/15"
        >
          <LifeBuoy size={24} strokeWidth={1.75} className="mt-0.5 shrink-0 text-terra" />
          <div>
            <p className="font-medium text-ink">{t('crisis.title')}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t('crisis.lead')}</p>
            <p className="mt-2 text-sm font-medium text-terra">{t('nav.crisis')}</p>
          </div>
        </Link>
        <Card>
          <h2 className="text-base font-medium">{t('auth.account')}</h2>
          {uid ? (
            <div className="mt-3 grid gap-3">
              <p className="text-sm leading-relaxed text-muted">{email ?? t('auth.signedIn')}</p>
              <p className="text-xs text-muted">
                {t('staff.yourRole')}: {t(`staff.role.${role}`)}
              </p>
              <Button variant="outline" onClick={() => void signOutUser()}>
                {t('auth.signOut')}
              </Button>
            </div>
          ) : (
            <div className="mt-3 grid gap-3">
              <p className="text-sm leading-relaxed text-muted">{t('auth.guest')}</p>
              <Link
                to="/auth"
                onClick={() => rememberNext('/profile')}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-plum px-4 text-sm font-medium text-white dark:text-ink"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          )}
        </Card>
        {uid ? (
          <Card>
            <h2 className="text-base font-medium">{t('staff.open')}</h2>
            {isStaffRole(role) ? (
              <div className="mt-4 grid gap-2">
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
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('staff.notStaffHint')}</p>
            )}
          </Card>
        ) : null}
        <Card>
          <h2 className="text-base font-medium">{t('profile.appearance')}</h2>
          <div className="mt-4 grid gap-4">
            <LanguageSwitch />
            <ThemeSwitch />
            <ChoiceButton active={largeText} onClick={() => setLargeText(!largeText)}>
              {t('profile.largeText')}
            </ChoiceButton>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('profile.care')}</h2>
          <div className="mt-4 grid gap-2">
            <ChoiceButton active={mode === 'self'} onClick={() => setMode('self')}>
              {t('onboarding.self')}
            </ChoiceButton>
            <ChoiceButton active={mode === 'with-therapist'} onClick={() => setMode('with-therapist')}>
              {t('onboarding.withTherapist')}
            </ChoiceButton>
          </div>
          <InvitePanel />
          <p className="mt-4 text-sm font-medium">{t('onboarding.countryTitle')}</p>
          <CountryPicker className="mt-2" country={country} onCountry={setCountry} />
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('invite.shareTitle')}</h2>
          <SharePanel />
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('profile.about')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('profile.disclaimer')}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('profile.data')}</p>
        </Card>
      </div>
    </>
  )
}
