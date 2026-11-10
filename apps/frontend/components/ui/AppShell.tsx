import type { ReactNode } from 'react'
import Link from 'next/link'
import { Headphones, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Chip } from './Chip'
import { Decor } from './Decor'
import { Logo } from './Logo'

export function AppShell({
  children,
  roomCode,
  centered = false,
}: {
  children: ReactNode
  roomCode?: string
  centered?: boolean
}) {
  return (
    <div className="paper-bg relative flex min-h-dvh flex-col overflow-hidden">
      <Decor />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between gap-3 py-5 sm:py-7">
          <Logo />
          <div className="flex items-center gap-2">
            {roomCode ? (
              <Chip tone="mint" dot>
                Salon {roomCode}
              </Chip>
            ) : (
              <>
                <Chip tone="cream" className="hidden sm:inline-flex">
                  <Users className="h-3 w-3" />
                  <span className="ml-1">2–8 joueurs</span>
                </Chip>
                <Chip tone="butter">
                  <Headphones className="h-3 w-3" />
                  <span className="ml-1">Audio</span>
                </Chip>
              </>
            )}
          </div>
        </header>

        <main
          className={cn(
            'flex flex-1 flex-col py-6 sm:py-8',
            centered ? 'justify-start lg:justify-center' : 'justify-start'
          )}
        >
          {children}
        </main>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 py-5 text-[11px] font-medium text-ink-soft/70">
          <span>Ortho Versus — la dictée en duel</span>
          {process.env.NODE_ENV !== 'production' && (
            <Link
              href="/preview"
              className="rounded-full px-2 py-1 font-display font-bold uppercase tracking-[0.12em] transition-colors hover:bg-ink/5 hover:text-ink"
            >
              Aperçu du design
            </Link>
          )}
        </footer>
      </div>
    </div>
  )
}
