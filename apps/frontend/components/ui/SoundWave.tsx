import { cn } from '@/lib/utils'

const HEIGHTS = [42, 68, 52, 86, 62, 100, 48, 76, 44, 70, 58, 90, 50]

const TONES = {
  cream: 'bg-cream/80',
  ink: 'bg-ink/60',
  coral: 'bg-coral',
  butter: 'bg-butter',
}

export function SoundWave({
  active = false,
  tone = 'cream',
  className,
}: {
  active?: boolean
  tone?: keyof typeof TONES
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex h-10 items-center justify-center gap-[3px]', className)}
    >
      {HEIGHTS.map((height, index) => (
        <span
          key={index}
          className={cn(
            'w-[3px] shrink-0 rounded-full transition-opacity duration-300',
            TONES[tone],
            active ? 'eq-bar opacity-100' : 'opacity-45'
          )}
          style={{
            height: `${height}%`,
            animationDelay: `${index * 70}ms`,
            animationDuration: `${720 + (index % 5) * 90}ms`,
          }}
        />
      ))}
    </div>
  )
}
