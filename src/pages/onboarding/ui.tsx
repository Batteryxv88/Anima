import { useEffect, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
import { WelcomeLanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { CountryPicker } from '@/features/pick-country'
import { APP_NAME, careModes, type CareMode } from '@/shared/config'
import { cn, takeNext } from '@/shared/lib'
import { Button, Card, ChoiceButton, ChoiceGroup, SunsetHorizon } from '@/shared/ui'

const welcomeBeads: { className: string; style: CSSProperties }[] = [
  {
    className: 'bg-peach anima-welcome-bead',
    style: { top: '6%', left: '2%', animationDelay: '0s' },
  },
  {
    className: 'bg-plum anima-welcome-bead',
    style: { top: '14%', right: '0%', animationDelay: '2.5s' },
  },
  {
    className: 'bg-lavender anima-welcome-bead',
    style: { bottom: '10%', left: '10%', animationDelay: '5s' },
  },
]

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
      <span className="anima-breath-ring absolute size-28 rounded-full bg-coral/20 sm:size-36" />
      <span className="anima-breath absolute size-[5.5rem] rounded-full bg-peach/35 sm:size-28" />
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
      className="relative z-10 min-h-11 w-auto min-w-[12rem] px-10 text-sm shadow-sm shadow-plum/15"
      disabled={leaving}
      onClick={onClick}
    >
      {t('onboarding.next')}
    </Button>
  )
}

function WelcomeScene({ language, onDone }: { language: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => {
      onDone()
    }, 380)
    return () => window.clearTimeout(timer)
  }, [leaving, onDone])

  const handleNext = () => {
    if (leaving) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      onDone()
      return
    }
    setLeaving(true)
  }

  return (
    <div
      className={cn(
        'anima-welcome-scene relative flex h-dvh flex-col overflow-hidden',
        leaving && 'anima-welcome-scene-leaving',
      )}
    >
      <div className="anima-welcome-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="anima-welcome-grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <SunsetHorizon className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(44vh,16rem)] sm:h-[min(32vh,13rem)]" />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-4 pt-3 sm:px-6 sm:pt-5">
        <div className="relative z-10 shrink-0">
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
      text: t('onboarding.pathText'),
      body: (
        <div className="grid gap-6">
          <ChoiceGroup>
            {careModes.map((item) => (
              <ChoiceButton key={item} active={mode === item} onClick={() => setMode(item as CareMode)}>
                {t(item === 'self' ? 'onboarding.self' : 'onboarding.withTherapist')}
              </ChoiceButton>
            ))}
          </ChoiceGroup>
          <CountryPicker
            country={country}
            onCountry={setCountry}
            label={t('onboarding.countryTitle')}
          />
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
