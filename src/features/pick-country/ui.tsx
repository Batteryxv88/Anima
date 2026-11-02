import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  isPrimaryCountry,
  moreCountries,
  primaryCountries,
  type Country,
} from '@/shared/config'
import { cn } from '@/shared/lib'
import { ChoiceButton, ChoiceGroup } from '@/shared/ui'

type CountryPickerProps = {
  country: Country
  onCountry: (country: Country) => void
  className?: string
}

export function CountryPicker({ country, onCountry, className }: CountryPickerProps) {
  const { t } = useTranslation()
  const [showMore, setShowMore] = useState(!isPrimaryCountry(country))

  const moreActive = showMore || !isPrimaryCountry(country)

  return (
    <div className={cn('grid gap-3', className)}>
      <ChoiceGroup>
        {primaryCountries.map((item) => (
          <ChoiceButton
            key={item}
            active={country === item}
            onClick={() => {
              setShowMore(false)
              onCountry(item)
            }}
          >
            {t(`country.${item}`)}
          </ChoiceButton>
        ))}
        <ChoiceButton
          active={moreActive}
          onClick={() => {
            setShowMore(true)
            if (isPrimaryCountry(country)) {
              onCountry('other')
            }
          }}
        >
          {t('country.more')}
        </ChoiceButton>
      </ChoiceGroup>
      {moreActive ? (
        <div className="grid gap-2">
          <p className="text-sm text-muted">{t('onboarding.countryMoreHint')}</p>
          <ChoiceGroup>
            {moreCountries.map((item) => (
              <ChoiceButton key={item} active={country === item} onClick={() => onCountry(item)}>
                {t(`country.${item}`)}
              </ChoiceButton>
            ))}
          </ChoiceGroup>
        </div>
      ) : null}
    </div>
  )
}
