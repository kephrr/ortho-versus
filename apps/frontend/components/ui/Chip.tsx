import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'cream' | 'coral' | 'butter' | 'cobalt' | 'mint' | 'ink' | 'ghost'

const TONES: Record<Tone, string> = {
  cream: 'border-ink/12 bg-cream text-ink-soft',
  coral: 'border-coral/30 bg-coral/12 text-coral-deep',
  butter: 'border-butter-deep/25 bg-butter/35 text-ink',
  cobalt: 'border-cobalt/20 bg-cobalt/10 text-cobalt-deep',
  mint: 'border-mint/25 bg-mint/12 text-[#137a58]',
  ink: 'border-ink bg-ink text-cream',
  ghost: 'border-ink/10 bg-transparent text-ink-soft',
}

export function Chip({
  children,
  tone = 'cream',
  className,
  dot = false,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[10px] font-bold uppercase leading-none tracking-[0.12em]',
        TONES[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  )
}
