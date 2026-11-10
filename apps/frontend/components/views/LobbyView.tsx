'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Crown, Headphones, Play, Plus, Users } from 'lucide-react'
import type { RoomState } from '@app/shared'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { PaperCard } from '@/components/ui/PaperCard'

export function LobbyView({
  roomState,
  currentPlayerNickname,
  onStart,
}: {
  roomState: RoomState
  currentPlayerNickname: string
  onStart: () => void
}) {
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPlayer = roomState.players.find(
    (player) => player.nickname === currentPlayerNickname
  )
  const isHost = Boolean(currentPlayer?.isHost)
  const remaining = Math.max(0, roomState.maxPlayers - roomState.players.length)

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    }
  }, [])

  const handleCopy = async () => {
    const markCopied = () => {
      setCopied(true)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    }

    try {
      await navigator.clipboard.writeText(roomState.code)
      markCopied()
    } catch {
      // Fallback for non-secure contexts (e.g. LAN over plain HTTP).
      const field = document.createElement('textarea')
      field.value = roomState.code
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      try {
        document.execCommand('copy')
        markCopied()
      } finally {
        document.body.removeChild(field)
      }
    }
  }

  return (
    <div className="animate-rise mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-coral-deep">Salon privé</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
            La salle d’attente
          </h1>
          <p className="mt-2 max-w-md text-sm font-medium text-ink-soft sm:text-base">
            Invite tes amis, échauffe tes doigts, puis lance la manche.
          </p>
        </div>
        <Chip tone="coral" dot>
          En attente des joueurs
        </Chip>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:gap-6">
        {/* Players ------------------------------------------------- */}
        <PaperCard className="order-2 p-5 sm:p-7 lg:order-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink/10 bg-butter/30 text-ink">
                <Users className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-extrabold tracking-[-0.03em]">Joueurs</h2>
            </div>
            <span className="rounded-full bg-ink px-2.5 py-1 font-display text-[11px] font-bold tabular-nums text-cream">
              {roomState.players.length}/{roomState.maxPlayers}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-ink-soft">
            Les places libres sont encore chaudes.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {roomState.players.map((player) => {
              const isMe = player.nickname === currentPlayerNickname
              return (
                <div
                  key={player.id}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors',
                    player.isHost
                      ? 'border-ink bg-butter/20'
                      : 'border-ink/10 bg-white/60',
                    isMe && !player.isHost && 'border-ink/35 bg-white/80'
                  )}
                >
                  <Avatar avatar={player.avatar} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-display text-[15px] font-bold leading-tight text-ink">
                        {player.nickname}
                      </p>
                      {isMe && (
                        <span className="rounded-full bg-coral px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-cream">
                          toi
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft/80">
                      {player.isHost ? (
                        <>
                          <Crown className="h-3 w-3 text-butter-deep" />
                          Hôte du salon
                        </>
                      ) : (
                        'Dans la salle'
                      )}
                    </p>
                  </div>
                  {player.isHost && (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink/15 bg-butter text-ink">
                      <Crown className="h-4 w-4" />
                    </span>
                  )}
                </div>
              )
            })}

            {Array.from({ length: Math.min(2, remaining) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-ink/15 p-3"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border-2 border-dashed border-ink/15 text-ink/25">
                  <Plus className="h-5 w-5" />
                </span>
                <p className="font-display text-sm font-bold text-ink/30">Une place libre</p>
              </div>
            ))}
          </div>

          {remaining > 2 && (
            <p className="mt-4 text-xs font-semibold text-ink-soft/70">
              Encore {remaining} place{remaining > 1 ? 's' : ''} libre
              {remaining > 1 ? 's' : ''} dans ce salon.
            </p>
          )}
        </PaperCard>

        {/* Invitation ---------------------------------------------- */}
        <div className="order-1 space-y-4 lg:order-2">
          <PaperCard className="overflow-hidden">
            <div className="flex items-center justify-between bg-ink px-5 py-3.5">
              <span className="eyebrow text-cream/55">Invitation</span>
              <span className="rounded-full bg-coral px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-cream">
                Code
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm font-medium text-ink-soft">Partage ce code avec tes amis.</p>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-ink/20 bg-white/60 px-4 py-3">
                <span className="font-display text-[34px] font-extrabold leading-none tracking-[0.16em] text-ink sm:text-[38px]">
                  {roomState.code}
                </span>
                <Button
                  size="icon"
                  variant={copied ? 'butter' : 'ink'}
                  onClick={handleCopy}
                  title={copied ? 'Code copié' : 'Copier le code'}
                  aria-label={copied ? 'Code copié' : 'Copier le code'}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              <p
                className={cn(
                  'mt-2 text-center text-[11px] font-semibold transition-colors',
                  copied ? 'text-mint' : 'text-ink-soft/70'
                )}
              >
                {copied ? 'Code copié !' : 'Clique sur le bouton pour copier'}
              </p>
            </div>

            <div className="border-t-2 border-dashed border-ink/15 px-5 py-4">
              <div className="flex items-center justify-between text-sm font-semibold text-ink-soft">
                <span>Joueurs connectés</span>
                <span className="tabular-nums">
                  {roomState.players.length} / {roomState.maxPlayers}
                </span>
              </div>
              <div className="mt-3 flex items-center">
                <div className="flex -space-x-2">
                  {roomState.players.map((player) => (
                    <Avatar
                      key={player.id}
                      avatar={player.avatar}
                      size="xs"
                      className="ring-2 ring-cream"
                    />
                  ))}
                </div>
                {remaining > 0 && (
                  <span className="ml-3 text-xs font-semibold text-ink-soft">
                    +{remaining} place{remaining > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </PaperCard>

          <div className="flex items-start gap-3 rounded-2xl border-2 border-ink/10 bg-butter/20 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-ink/10 bg-cream text-ink">
              <Headphones className="h-4 w-4" />
            </span>
            <p className="pt-0.5 text-sm font-medium leading-snug text-ink-soft">
              <strong className="font-display font-bold text-ink">Mets ton casque.</strong> L’audio
              démarre juste après le décompte.
            </p>
          </div>
        </div>
      </div>

      {/* Start / wait bar ---------------------------------------- */}
      <div className="mt-5 flex flex-col gap-4 rounded-[24px] border-2 border-ink bg-ink p-5 text-cream shadow-[0_6px_0_0_var(--color-ink)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral" />
          </span>
          <div>
            <p className="eyebrow text-coral">Manche 01</p>
            <p className="mt-1 font-display text-xl font-extrabold tracking-[-0.02em]">
              {isHost ? 'Tout le monde est là ?' : 'L’hôte prépare le lancement…'}
            </p>
            <p className="mt-1 text-sm font-medium text-cream/60">
              {isHost
                ? 'L’audio démarre après un décompte de 5 secondes.'
                : 'Reste dans le salon, la partie démarre bientôt.'}
            </p>
          </div>
        </div>

        {isHost ? (
          <Button size="lg" onClick={onStart} className="w-full shrink-0 sm:w-auto">
            <Play className="h-5 w-5 fill-current" />
            Lancer la manche
          </Button>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="waiting-dot h-1.5 w-1.5 rounded-full bg-cream/70"
                style={{ animationDelay: `${dot * 160}ms` }}
              />
            ))}
            <span className="ml-2 text-xs font-semibold text-cream/60">En attente</span>
          </div>
        )}
      </div>
    </div>
  )
}
