import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ink' | 'butter' | 'ghost' | 'cream' | 'darkGhost'
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'border-ink bg-coral text-cream shadow-[0_5px_0_0_var(--color-ink)] hover:bg-[#ff6a48] active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--color-ink)]',
  ink: 'border-ink bg-ink text-cream shadow-[0_5px_0_0_var(--color-coral)] hover:bg-[#2a251d] active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--color-coral)]',
  butter:
    'border-ink bg-butter text-ink shadow-[0_5px_0_0_var(--color-ink)] hover:bg-[#ffd66d] active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--color-ink)]',
  ghost:
    'border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.04] active:translate-y-[1px]',
  cream:
    'border-cream bg-cream text-ink shadow-[0_4px_0_0_rgba(255,251,242,0.22)] hover:bg-white active:translate-y-[2px] active:shadow-none',
  darkGhost:
    'border-cream/20 bg-cream/5 text-cream hover:bg-cream/10 active:translate-y-[1px]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-[13px]',
  md: 'h-11 gap-2 rounded-xl px-5 text-sm',
  lg: 'h-[52px] gap-2.5 rounded-2xl px-6 text-base',
  xl: 'h-[60px] gap-3 rounded-2xl px-7 text-lg',
  icon: 'h-11 w-11 rounded-xl p-0',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center border-2 font-display font-bold leading-none transition-[transform,box-shadow,background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coral/25 disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  )
}
