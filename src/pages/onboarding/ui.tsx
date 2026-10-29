import { useState, type AnimationEvent, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
import { WelcomeLanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { APP_NAME, careModes, countries, type CareMode, type Country } from '@/shared/config'
import { cn, takeNext } from '@/shared/lib'
import { Button, Card, ChoiceButton, ChoiceGroup } from '@/shared/ui'

const welcomeBeads: { className: string; style: CSSProperties }[] = [
  { className: 'bg-sage anima-welcome-bead', style: { top: '6%', left: '2%', animationDelay: '0s' } },
  { className: 'bg-ink anima-welcome-bead', style: { top: '14%', right: '0%', animationDelay: '2.5s' } },
  { className: 'bg-sand anima-welcome-bead', style: { bottom: '10%', left: '10%', animationDelay: '5s' } },
]

function WelcomeHorizon() {
  return (
    <svg
      className="anima-welcome-horizon pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(44vh,16rem)] w-full sm:h-[min(32vh,13rem)]"
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillOpacity="0.1"
        d="M0,52 C80,38 120,68 200,50 S320,32 400,48 L400,100 L0,100 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.05"
        d="M0,62 C100,48 160,72 260,58 S340,44 400,56 L400,100 L0,100 Z"
      />
    </svg>
  )
}

function WelcomeMark() {
  return (
    <div
      className="relative mx-auto flex size-[9.5rem] items-center justify-center sm:size-[11.5rem]"
      aria-hidden="true"
    >
      {welcomeBeads.map((bead) => (
        <span
          key={bead.className}
          className={`absolute size-2 rounded-full sm:size-2.5 ${bead.className}`}
          style={bead.style}
        />
      ))}
      <span className="anima-breath-ring absolute size-28 rounded-full bg-sage/15 sm:size-36" />
      <span className="anima-breath absolute size-[5.5rem] rounded-full bg-sage/22 sm:size-28" />
      <span className="relative text-lg font-medium tracking-tight sm:text-xl">{APP_NAME}</span>
    </div>
  )
}

function WelcomeHero() {
  const { t } = useTranslation()
  return (
    <>
      <WelcomeLanguageSwitch />
      <div className="flex flex-col items-center py-3 sm:py-6">
        <WelcomeMark />
        <p
          className="anima-welcome-line mt-3 max-w-xs text-center text-sm text-muted sm:mt-5"
          style={{ animationDelay: '180ms' }}
        >
          {t('onboarding.welcomeBreathHint')}
        </p>
      </div>
    </>
  )
}

function WelcomeStory({ language }: { language: string }) {
  const { t } = useTranslation()
  return (
    <div key={language} className="w-full">
      <h1
        className="anima-welcome-line text-center text-xl font-medium leading-snug tracking-tight sm:text-[1.85rem]"
        style={{ animationDelay: '340ms' }}
      >
        {t('onboarding.welcomeTitle')}
      </h1>
      <p
        className="anima-welcome-line mt-4 text-center text-[0.9375rem] leading-relaxed text-ink/90 sm:mt-5 sm:text-base"
        style={{ animationDelay: '560ms' }}
      >
        {t('onboarding.welcomeBody')}
      </p>
      <p
        className="anima-welcome-line mt-3 text-center text-sm leading-relaxed text-muted sm:mt-4"
        style={{ animationDelay: '780ms' }}
      >
        {t('onboarding.welcomeNote')}
      </p>
    </div>
  )
}

function WelcomeNextButton({ leaving, onClick }: { leaving: boolean; onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      className="relative z-10 min-h-11 w-auto min-w-[12rem] px-10 text-sm shadow-sm shadow-sage/15"
      disabled={leaving}
      onClick={onClick}
    >
      {t('onboarding.next')}
    </Button>
  )
}

function WelcomeScene({ language, onDone }: { language: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  const finishWelcome = () => {
    onDone()
  }

  const handleNext = () => {
    if (leaving) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      finishWelcome()
      return
    }
    setLeaving(true)
  }

  const handleLeaveAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!leaving || event.target !== event.currentTarget) return
    if (event.animationName !== 'anima-welcome-out' && event.animationName !== 'anima-fade-out') return
    finishWelcome()
  }

  return (
    <div
      className={cn(
        'anima-welcome-scene relative flex h-dvh flex-col overflow-hidden',
        leaving && 'anima-welcome-scene-leaving',
      )}
      onAnimationEnd={handleLeaveAnimationEnd}
    >
      <div className="anima-welcome-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="anima-welcome-grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <WelcomeHorizon />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-4 pt-3 sm:px-6 sm:pt-5">
        <div className="shrink-0">
          <WelcomeHero />
        </div>
        <div className="anima-welcome-scroll mt-4 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-2 sm:mt-6">
          <WelcomeStory language={language} />
        </div>
        <div className="flex shrink-0 justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:pt-3">
          <WelcomeNextButton leaving={leaving} onClick={handleNext} />
        </div>
      </div>
    </div>
  )
}

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [ageOk, setAgeOk] = useState(false)
  const language = useUserStore((state) => state.language)
  const mode = useUserStore((state) => state.mode)
  const country = useUserStore((state) => state.country)
  const setMode = useUserStore((state) => state.setMode)
  const setCountry = useUserStore((state) => state.setCountry)
  const completeOnboarding = useUserStore((state) => state.completeOnboarding)

  const setupSteps = [
    {
      title: t('onboarding.themeTitle'),
      text: t('onboarding.themeText'),
      body: <ThemeSwitch />,
    },
    {
      title: t('onboarding.pathTitle'),
      text: t('onboarding.countryText'),
      body: (
        <div className="grid gap-6">
          <ChoiceGroup>
            {careModes.map((item) => (
              <ChoiceButton key={item} active={mode === item} onClick={() => setMode(item as CareMode)}>
                {t(item === 'self' ? 'onboarding.self' : 'onboarding.withTherapist')}
              </ChoiceButton>
            ))}
          </ChoiceGroup>
          <div>
            <p className="mb-2 text-sm font-medium">{t('onboarding.countryTitle')}</p>
            <ChoiceGroup>
              {countries.map((item) => (
                <ChoiceButton key={item} active={country === item} onClick={() => setCountry(item as Country)}>
                  {t(`country.${item}`)}
                </ChoiceButton>
              ))}
            </ChoiceGroup>
          </div>
        </div>
      ),
    },
    {
      title: t('onboarding.disclaimerTitle'),
      text: t('onboarding.disclaimer'),
      body: (
        <ChoiceButton active={ageOk} onClick={() => setAgeOk((value) => !value)}>
          {t('onboarding.age')}
        </ChoiceButton>
      ),
    },
  ]

  if (step === 0) {
    return <WelcomeScene language={language} onDone={() => setStep(1)} />
  }

  const current = setupSteps[step - 1]
  const last = step === setupSteps.length

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <p className="mb-6 text-lg font-medium tracking-tight">{APP_NAME}</p>
      <Card className="anima-panel-in">
        <h1 className="text-2xl font-medium">{current.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{current.text}</p>
        <div className="mt-6">{current.body}</div>
        <Button
          className="mt-8 w-full"
          disabled={last && !ageOk}
          onClick={() => {
            if (!last) {
              setStep((value) => value + 1)
              return
            }
            completeOnboarding()
            navigate(takeNext('/today'), { replace: true })
          }}
        >
          {last ? t('onboarding.start') : t('onboarding.next')}
        </Button>
      </Card>
    </div>
  )
}
