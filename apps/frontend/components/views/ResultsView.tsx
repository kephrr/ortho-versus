'use client'

import type { GameResultsPayload, RoomState } from '@app/shared'
import { Award, Check, Crown, Quote, RotateCcw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { countWords } from '@/lib/format'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { PaperCard } from '@/components/ui/PaperCard'

function scoreTone(score: number) {
  if (score >= 90) return 'text-mint'
  if (score >= 70) return 'text-cobalt'
  if (score >= 50) return 'text-butter-deep'
  return 'text-rose'
}

function barTone(score: number) {
  if (score >= 90) return 'bg-mint'
  if (score >= 70) return 'bg-cobalt'
  if (score >= 50) return 'bg-butter'
  return 'bg-rose'
}

export function ResultsView({
  results,
  roomState,
  currentPlayerNickname,
  onRestart,
}: {
  results: GameResultsPayload
  roomState: RoomState | null
  currentPlayerNickname: string
  onRestart: () => void
}) {
  if (!results.results.length) return null

  const winner = results.results[0]
  const isWinnerMe = winner.nickname === currentPlayerNickname
  const isHost = Boolean(
    roomState?.players.find((player) => player.nickname === currentPlayerNickname)?.isHost
  )

  return (
    <div className="animate-rise mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-coral-deep">Manche terminée</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
            Le verdict est tombé.
          </h1>
          <p className="mt-2 max-w-md text-sm font-medium text-ink-soft sm:text-base">
            Voici les copies, les fautes et le champion de la manche.
          </p>
        </div>
        <Chip tone="butter">
          <Trophy className="h-3 w-3" />
          <span className="ml-1">Classement final</span>
        </Chip>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
        {/* Champion ------------------------------------------------- */}
        <div className="relative overflow-hidden rounded-[28px] border-2 border-ink bg-ink p-6 text-cream shadow-[0_7px_0_0_var(--color-ink)] sm:p-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-10 select-none font-serif text-[180px] leading-none text-cream/[0.04]"
          >
            à
          </span>

          <div className="relative flex items-center justify-between gap-3">
            <Chip tone="butter" className="border-butter bg-butter text-ink">
              <Trophy className="h-3 w-3" />
              <span className="ml-1">1re place</span>
            </Chip>
            <span className="eyebrow text-cream/35">Champion</span>
          </div>

          <div className="relative mt-6 flex items-center gap-4">
            <Avatar
              avatar={winner.avatar}
              size="xl"
              className="border-cream/10 ring-4 ring-butter/25"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream/40">
                Le plus juste
              </p>
              <p className="mt-1 truncate font-display text-[34px] font-extrabold leading-none tracking-[-0.04em] sm:text-[40px]">
                {winner.nickname}
              </p>
              {isWinnerMe ? (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-butter px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.12em] text-ink">
                  <Crown className="h-3 w-3" />
                  C’est toi !
                </span>
              ) : (
                <p className="mt-2 text-xs font-medium text-cream/50">
                  {winner.wordErrorCount === 0
                    ? 'Copie parfaite, sans une seule faute.'
                    : `${winner.wordErrorCount} faute${winner.wordErrorCount > 1 ? 's' : ''} sur la copie.`}
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-cream/10 bg-cream/[0.06] p-3.5">
              <p className="eyebrow text-cream/35">Précision</p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-butter">
                {winner.accuracyScore}%
              </p>
            </div>
            <div className="rounded-2xl border border-cream/10 bg-cream/[0.06] p-3.5">
              <p className="eyebrow text-cream/35">Erreurs</p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">
                {winner.wordErrorCount}
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-cream/40">
              <span>Score de la manche</span>
              <span className="tabular-nums">{winner.accuracyScore}/100</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream/10">
              <div
                className="h-full rounded-full bg-butter transition-all duration-700 ease-out"
                style={{ width: `${winner.accuracyScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Transcript ----------------------------------------------- */}
        <PaperCard className="flex h-full flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-coral-deep">Le texte officiel</span>
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink/10 bg-butter/30 text-ink/50">
              <Quote className="h-4 w-4" />
            </span>
          </div>

          <div className="my-auto py-6">
            <blockquote className="font-serif text-[24px] leading-[1.3] text-ink sm:text-[27px]">
              « {results.targetTranscript} »
            </blockquote>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Chip tone="cream">{countWords(results.targetTranscript)} mots</Chip>
              <Chip tone="ghost">
                {roomState?.audioDurationSeconds ?? 20} s d’écoute
              </Chip>
            </div>
          </div>

          <div className="flex items-start gap-2 border-t-2 border-dashed border-ink/10 pt-4 text-[11px] font-semibold leading-snug text-ink-soft/70">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint" />
            La copie parfaite. À toi de comparer avec les copies ci-dessous.
          </div>
        </PaperCard>
      </div>

      {/* Leaderboard ------------------------------------------------ */}
      <div className="mt-9 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-[28px]">
            Le classement
          </h2>
          <p className="mt-1 text-sm font-medium text-ink-soft">
            Chaque copie, chaque faute, chaque point.
          </p>
        </div>
        <Chip tone="cream">
          {results.results.length} copie{results.results.length > 1 ? 's' : ''}
        </Chip>
      </div>

      <div className="mt-4 space-y-3">
        {results.results.map((result, index) => {
          const isMe = result.nickname === currentPlayerNickname
          const isFirst = index === 0

          return (
            <PaperCard
              key={result.playerId}
              flat
              className={cn(
                'p-4 sm:p-5',
                isFirst && 'border-ink/30 bg-butter/15',
                isMe && !isFirst && 'border-ink/25 bg-white/80'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-display text-xs font-extrabold tabular-nums',
                    isFirst
                      ? 'border-ink bg-butter text-ink'
                      : index === 1
                        ? 'border-ink/15 bg-cream text-ink-soft'
                        : index === 2
                          ? 'border-coral/30 bg-coral/10 text-coral-deep'
                          : 'border-ink/10 bg-white/50 text-ink-soft/60'
                  )}
                >
                  {index + 1}
                </span>

                <Avatar avatar={result.avatar} size="sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-display text-[15px] font-bold text-ink sm:text-base">
                      {result.nickname}
                    </p>
                    {isMe && (
                      <span className="rounded-full bg-coral px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-cream">
                        toi
                      </span>
                    )}
                    {isFirst && <Award className="h-4 w-4 text-butter-deep" />}
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-ink-soft">
                    {result.wordErrorCount}{' '}
                    {result.wordErrorCount > 1 ? 'fautes' : 'faute'}
                    {!result.submittedText && ' · copie blanche'}
                  </p>
                </div>

                <div className="w-20 shrink-0 text-right sm:w-32">
                  <p
                    className={cn(
                      'font-display text-2xl font-extrabold tabular-nums leading-none',
                      scoreTone(result.accuracyScore)
                    )}
                  >
                    {result.accuracyScore}%
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        barTone(result.accuracyScore)
                      )}
                      style={{ width: `${result.accuracyScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t-2 border-dashed border-ink/10 pt-2.5">
                <p
                  className={cn(
                    'line-clamp-2 text-sm leading-relaxed',
                    result.submittedText
                      ? 'font-medium text-ink-soft'
                      : 'font-medium italic text-ink-soft/45'
                  )}
                  title={result.submittedText || undefined}
                >
                  {result.submittedText
                    ? `« ${result.submittedText} »`
                    : 'Aucune réponse soumise. La copie est blanche.'}
                </p>
              </div>
            </PaperCard>
          )
        })}
      </div>

      {/* Replay ---------------------------------------------------- */}
      <div className="mt-7 flex flex-col gap-4 rounded-[24px] border-2 border-ink bg-ink p-5 text-cream shadow-[0_6px_0_0_var(--color-ink)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="eyebrow text-coral">On remet ça ?</p>
          <p className="mt-1 font-display text-xl font-extrabold tracking-[-0.02em]">
            Une nouvelle manche, un nouveau champion.
          </p>
          <p className="mt-1 text-sm font-medium text-cream/60">
            Le salon reste ouvert, les joueurs sont toujours là.
          </p>
        </div>

        {isHost ? (
          <Button size="lg" onClick={onRestart} className="w-full shrink-0 sm:w-auto">
            <RotateCcw className="h-5 w-5" />
            Rejouer une manche
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
            <span className="ml-2 text-xs font-semibold text-cream/60">
              L’hôte prépare la suite
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
