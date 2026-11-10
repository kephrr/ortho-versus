import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface PaperCardProps extends HTMLAttributes<HTMLDivElement> {
  flat?: boolean
}

export function PaperCard({ flat = false, className, children, ...props }: PaperCardProps) {
  return (
    <div className={cn(flat ? 'paper-card-flat' : 'paper-card', className)} {...props}>
      {children}
    </div>
  )
}
