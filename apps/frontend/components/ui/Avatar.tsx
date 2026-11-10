import { cn } from '@/lib/utils'

const TONES: Record<string, string> = {
  '🦊': 'bg-[#ffd9c7]',
  '🦉': 'bg-[#d9e1ff]',
  '🐱': 'bg-[#ffe9a8]',
  '🐼': 'bg-[#ece6dd]',
  '🦁': 'bg-[#ffe0a3]',
  '🐸': 'bg-[#d3f0d6]',
  '🦄': 'bg-[#f0d9ff]',
  '🐨': 'bg-[#dbe5e9]',
}

const FALLBACK_TONES = [
  'bg-[#ffd9c7]',
  'bg-[#d9e1ff]',
  'bg-[#ffe9a8]',
  'bg-[#d3f0d6]',
  'bg-[#f0d9ff]',
  'bg-[#dbe5e9]',
]

const SIZES = {
  xs: 'h-8 w-8 rounded-[10px] text-lg',
  sm: 'h-11 w-11 rounded-[14px] text-2xl',
  md: 'h-14 w-14 rounded-2xl text-3xl',
  lg: 'h-20 w-20 rounded-[22px] text-5xl',
  xl: 'h-24 w-24 rounded-[28px] text-[56px] sm:h-28 sm:w-28 sm:text-[64px]',
} as const

function toneFor(avatar: string): string {
  if (TONES[avatar]) return TONES[avatar]
  const sum = Array.from(avatar).reduce((total, char) => total + char.codePointAt(0)!, 0)
  return FALLBACK_TONES[sum % FALLBACK_TONES.length]
}

export function Avatar({
  avatar,
  size = 'md',
  className,
}: {
  avatar: string
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid shrink-0 select-none place-items-center border-2 border-ink/10 leading-none shadow-[inset_0_-3px_0_0_rgba(28,25,19,0.08)]',
        SIZES[size],
        toneFor(avatar),
        className
      )}
    >
      <span className="translate-y-[1px]">{avatar}</span>
    </span>
  )
}
