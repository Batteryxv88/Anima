import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { isStaffRole, signOutUser, useUserStore } from '@/entities/user'
import { InvitePanel, SharePanel } from './invite'
import { LanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { countries, type Country } from '@/shared/config'
import { Button, Card, ChoiceButton, ChoiceGroup, PageHeader } from '@/shared/ui'

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

  return (
    <>
      <PageHeader title={t('profile.title')} />
      <div className="grid gap-4">
        <Card>
          <h2 className="text-base font-medium">{t('auth.account')}</h2>
          {uid ? (
            <div className="mt-3 grid gap-3">
              <p className="text-sm leading-relaxed text-muted">{email ?? t('auth.signedIn')}</p>
              {isStaffRole(role) ? (
                <Link
                  to="/staff"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sage px-4 text-sm font-medium text-white"
                >
                  {t('staff.open')}
                </Link>
              ) : null}
              <Button variant="outline" onClick={() => void signOutUser()}>
                {t('auth.signOut')}
              </Button>
            </div>
          ) : (
            <div className="mt-3 grid gap-3">
              <p className="text-sm leading-relaxed text-muted">{t('auth.guest')}</p>
              <Link
                to="/auth"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sage px-4 text-sm font-medium text-white"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          )}
        </Card>
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
          <ChoiceGroup>
            {countries.map((item) => (
              <ChoiceButton key={item} active={country === item} onClick={() => setCountry(item as Country)}>
                {t(`country.${item}`)}
              </ChoiceButton>
            ))}
          </ChoiceGroup>
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
