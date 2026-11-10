import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="relative grid h-11 w-11 place-items-center rounded-[15px] border-2 border-ink bg-ink text-cream shadow-[0_3px_0_0_var(--color-coral)]">
        <span className="font-display text-[17px] font-extrabold leading-none tracking-[-0.08em]">
          VS
        </span>
        <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-ink bg-butter" />
      </span>
      <span className="font-display text-[21px] font-extrabold leading-none tracking-[-0.045em]">
        Ortho <span className="text-coral">Versus</span>
      </span>
    </div>
  )
}
