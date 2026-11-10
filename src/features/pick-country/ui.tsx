import { useTranslation } from 'react-i18next'
import { countries, type Country } from '@/shared/config'
import { cn } from '@/shared/lib'
import { SearchSelect } from '@/shared/ui'

type CountryPickerProps = {
  country: Country
  onCountry: (country: Country) => void
  className?: string
  label?: string
}

export function CountryPicker({ country, onCountry, className, label }: CountryPickerProps) {
  const { t } = useTranslation()
  const options = countries.map((id) => ({ id, label: t(`country.${id}`) }))

  return (
    <div className={cn(className)}>
      <SearchSelect
        label={label}
        value={country}
        onChange={(id) => {
          if (countries.includes(id as Country)) onCountry(id as Country)
        }}
        options={options}
      />
    </div>
  )
}
