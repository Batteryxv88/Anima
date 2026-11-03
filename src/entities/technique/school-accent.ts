import type { School } from './model'

export type SchoolAccent = 'lavender' | 'peach' | 'sage' | 'plum' | 'gold'

export const schoolAccent: Record<School, SchoolAccent> = {
  mindfulness: 'lavender',
  dbt: 'peach',
  cft: 'peach',
  cbt: 'plum',
  act: 'plum',
  behavioral: 'sage',
}

const accentText: Record<SchoolAccent, string> = {
  lavender: 'text-lavender',
  peach: 'text-peach',
  sage: 'text-sage',
  plum: 'text-plum',
  gold: 'text-gold',
}

const accentBgSoft: Record<SchoolAccent, string> = {
  lavender: 'bg-lavender/15',
  peach: 'bg-peach/25',
  sage: 'bg-sage/15',
  plum: 'bg-plum/12',
  gold: 'bg-gold/15',
}

export function schoolAccentText(school: School) {
  return accentText[schoolAccent[school]]
}

export function schoolAccentBgSoft(school: School) {
  return accentBgSoft[schoolAccent[school]]
}

const accentBorderLeft: Record<SchoolAccent, string> = {
  lavender: 'border-l-lavender',
  peach: 'border-l-peach',
  sage: 'border-l-sage',
  plum: 'border-l-plum',
  gold: 'border-l-gold',
}

export function schoolAccentBorderLeft(school: School) {
  return accentBorderLeft[schoolAccent[school]]
}
