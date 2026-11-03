import { cn } from '@/shared/lib'

export function SunsetHorizon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('anima-welcome-horizon pointer-events-none w-full', className)}
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillOpacity="0.12"
        d="M0,52 C80,38 120,68 200,50 S320,32 400,48 L400,100 L0,100 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.06"
        d="M0,62 C100,48 160,72 260,58 S340,44 400,56 L400,100 L0,100 Z"
      />
    </svg>
  )
}

export function SunsetBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-peach/25 anima-sunset-gradient',
        className,
      )}
      aria-hidden="true"
    >
      <SunsetHorizon className="h-14 text-coral sm:h-16" />
    </div>
  )
}
