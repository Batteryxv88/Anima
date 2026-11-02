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
  ua: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.uaLifeline', phone: '7333', display: '7333' },
    { nameKey: 'help.uaHealth', phone: '0800500335', display: '0 800 500 335' },
  ],
  by: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.byTrust', phone: '8801101611', display: '8 801 101-61-11' },
  ],
  kz: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.kzTrust', phone: '150', display: '150' },
  ],
  de: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.deSeelsorge', phone: '08001110111', display: '0800 111 0 111' },
  ],
  pl: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.plTrust', phone: '116123', display: '116 123' },
  ],
  cz: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.czTrust', phone: '116123', display: '116 123' },
  ],
  us: [
    { nameKey: 'help.usEmergency', phone: '911' },
    { nameKey: 'help.us988', phone: '988' },
  ],
  gb: [
    { nameKey: 'help.gbEmergency', phone: '999' },
    { nameKey: 'help.gbSamaritans', phone: '116123', display: '116 123' },
  ],
  fr: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.fr3114', phone: '3114' },
  ],
  it: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.itTelefono', phone: '1520', display: '1520' },
  ],
  es: [
    { nameKey: 'help.emergency', phone: '112' },
    { nameKey: 'help.es024', phone: '024', display: '024' },
  ],
  other: [
    { nameKey: 'help.emergency', phone: '112' },
    {
      nameKey: 'help.iasp',
      href: 'https://www.iasp.info/suicidalthoughts/',
    },
  ],
}
