import { cn } from '@/lib/utils'

export function TimerRing({
  seconds,
  total,
  size = 64,
  lowAt = 10,
  className,
}: {
  seconds: number
  total: number
  size?: number
  lowAt?: number
  className?: string
}) {
  const safeTotal = total > 0 ? total : 1
  const ratio = Math.max(0, Math.min(1, seconds / safeTotal))
  const low = seconds <= lowAt
  const strokeWidth = Math.max(4, Math.round(size / 14))
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const color = low ? 'var(--color-rose)' : 'var(--color-cobalt)'

  return (
    <div
      role="img"
      aria-label={`${Math.max(0, seconds)} secondes restantes`}
      className={cn('relative grid shrink-0 place-items-center', low && 'animate-pulse-soft', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(28,25,19,0.10)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset,stroke] duration-700 ease-linear"
        />
      </svg>
      <span
        aria-hidden="true"
        className={cn(
          'absolute font-display font-extrabold leading-none tabular-nums',
          low ? 'text-rose' : 'text-ink'
        )}
        style={{ fontSize: Math.round(size * 0.32) }}
      >
        {Math.max(0, Math.ceil(seconds))}
      </span>
    </div>
  )
}
