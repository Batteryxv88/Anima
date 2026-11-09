import sunsetDark from './art/for-you-sunset-dark.jpg'
import sunsetLight from './art/for-you-sunset-light.jpg'

export function ForYouSunsetArt() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <img
        src={sunsetLight}
        alt=""
        className="h-full w-full object-cover object-[70%_center] brightness-[0.92] dark:hidden"
      />
      <img
        src={sunsetDark}
        alt=""
        className="hidden h-full w-full object-cover object-[70%_center] brightness-[0.88] dark:block"
      />
      <div className="absolute inset-0 bg-canvas/30 dark:bg-black/28" />
    </div>
  )
}
