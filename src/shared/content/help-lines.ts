import type { Country } from '@/shared/config'

export type HelpLine = {
  nameKey: string
  phone?: string
  display?: string
  href?: string
}

export const helpLines: Record<Country, HelpLine[]> = {
  si: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.samarijan', phone: '116123', display: '116 123' },
    { nameKey: 'help.siNight', phone: '015209900', display: '01 520 99 00' },
  ],
  ru: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.ruCrisis', phone: '88003334434', display: '8 800 333-44-34' },
    { nameKey: 'help.ruMchs', phone: '84959895050', display: '+7 495 989-50-50' },
  ],
  other: [
    { nameKey: 'help.emergency', phone: '112' },
    {
      nameKey: 'help.iasp',
      href: 'https://www.iasp.info/suicidalthoughts/',
    },
  ],
}
