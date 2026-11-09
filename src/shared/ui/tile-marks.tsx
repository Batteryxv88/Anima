import { cn } from '@/shared/lib'
import brain from './art/tile-brain.png'
import calendar from './art/tile-calendar.png'
import heart from './art/tile-heart.png'
import lotus from './art/tile-lotus.png'

type MarkProps = { className?: string }

function TileImg({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" className={cn('size-8 shrink-0 object-contain', className)} />
}

export function LotusMark({ className }: MarkProps) {
  return <TileImg src={lotus} className={className} />
}

export function BrainMark({ className }: MarkProps) {
  return <TileImg src={brain} className={className} />
}

export function CalendarMark({ className }: MarkProps) {
  return <TileImg src={calendar} className={className} />
}

export function HeartMark({ className }: MarkProps) {
  return <TileImg src={heart} className={className} />
}
